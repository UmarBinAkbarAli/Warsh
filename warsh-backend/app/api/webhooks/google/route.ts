import { NextResponse } from "next/server";
import { OAuth2Client } from "google-auth-library";
import { prisma } from "../../../../lib/prisma";
import { timingSafeStringEqual } from "../../../../lib/auth";
import {
  applySubscriptionNotification,
  SUBSCRIPTION_REVOKED,
  type SubscriptionNotification,
} from "../../../../lib/subscriptionNotification";
import {
  applyVoidedPurchase,
  type VoidedPurchaseNotification,
} from "../../../../lib/voidedPurchase";

// Reused across invocations so Google's certs are cached rather than refetched
// on every notification.
const pubSubOidcClient = new OAuth2Client();

/**
 * Authenticates a Pub/Sub push.
 *
 * Preferred path: the OIDC identity token Pub/Sub attaches to the push request.
 * It is short-lived, signed by Google, and bound to our audience — nothing is
 * shared or replayable. Configure GOOGLE_PLAY_PUBSUB_AUDIENCE and
 * GOOGLE_PLAY_PUBSUB_SERVICE_ACCOUNT to enable it.
 *
 * Fallback: the pre-existing `?token=` shared secret, now compared in constant
 * time. It travels in the URL (proxy logs, Pub/Sub subscription config), so it
 * is kept only for continuity until the OIDC push is configured.
 */
type PushAuthResult = "authorized" | "unauthorized" | "not_configured";

/**
 * The push identities we accept, from GOOGLE_PLAY_PUBSUB_SERVICE_ACCOUNT.
 *
 * Comma-separated so a push subscription can be migrated between Cloud projects
 * without a delivery gap: the old and new identities are both accepted for the
 * length of the cutover, then the retired one is removed. A single value is the
 * normal steady state. Mirrors GOOGLE_OAUTH_CLIENT_IDS in lib/googleAuth.ts.
 */
function getAllowedPushServiceAccounts(): string[] {
  return (process.env.GOOGLE_PLAY_PUBSUB_SERVICE_ACCOUNT ?? "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
}

async function authorizePush(request: Request): Promise<PushAuthResult> {
  const audience = process.env.GOOGLE_PLAY_PUBSUB_AUDIENCE?.trim();
  const serviceAccounts = getAllowedPushServiceAccounts();

  if (audience && serviceAccounts.length > 0) {
    const bearer = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "").trim() ?? "";
    if (!bearer) {
      console.warn("[rtdn] OIDC push configured but request carried no bearer token");
      return "unauthorized";
    }
    try {
      // verifyIdToken already enforces Google's signature, the issuer, and our
      // audience. The remaining authorization decision is whether the token
      // belongs to the service account our push subscription runs as.
      const ticket = await pubSubOidcClient.verifyIdToken({ idToken: bearer, audience });
      const payload = ticket.getPayload();
      const ok = Boolean(
        payload?.email &&
          serviceAccounts.includes(payload.email) &&
          payload.email_verified !== false,
      );
      if (!ok) console.warn("[rtdn] OIDC token did not match the expected push service account");
      return ok ? "authorized" : "unauthorized";
    } catch (error) {
      console.warn("[rtdn] OIDC verification failed:", (error as Error)?.message ?? error);
      return "unauthorized";
    }
  }

  const expectedToken = process.env.GOOGLE_PLAY_NOTIFICATION_WEBHOOK_SECRET;
  if (!expectedToken) {
    // Fail closed unless a developer explicitly opts into an unauthenticated
    // webhook for local testing.
    if (process.env.ALLOW_UNAUTHENTICATED_WEBHOOK === "true") return "authorized";
    console.error("[rtdn] no webhook auth configured (set GOOGLE_PLAY_PUBSUB_* or GOOGLE_PLAY_NOTIFICATION_WEBHOOK_SECRET) - rejecting request.");
    return "not_configured";
  }

  const token = new URL(request.url).searchParams.get("token") ?? "";
  return timingSafeStringEqual(token, expectedToken) ? "authorized" : "unauthorized";
}

const NOOR_PACK_PRODUCT_ID = "warsh_noor_pack";

interface PubSubMessage {
  message?: {
    data?: string;
    messageId?: string;
  };
}

interface OneTimeProductNotification {
  notificationType?: number;
  purchaseToken?: string;
  sku?: string;
}

interface DeveloperNotification {
  packageName?: string;
  subscriptionNotification?: SubscriptionNotification;
  oneTimeProductNotification?: OneTimeProductNotification;
  voidedPurchaseNotification?: VoidedPurchaseNotification;
}

export async function POST(request: Request) {
  const auth = await authorizePush(request);
  if (auth === "not_configured") {
    return NextResponse.json(
      { error: "Webhook is not configured.", code: "store_not_configured" },
      { status: 503 },
    );
  }
  if (auth !== "authorized") {
    return NextResponse.json({ error: "Unauthorized", code: "unauthorized" }, { status: 401 });
  }

  let body: PubSubMessage;
  try {
    body = await request.json() as PubSubMessage;
  } catch {
    console.warn("[rtdn] malformed request body");
    return new NextResponse(null, { status: 200 });
  }

  console.log("[rtdn] received message id:", body.message?.messageId ?? "none");

  const encodedData = body.message?.data;
  if (!encodedData) {
    console.log("[rtdn] no data payload - acknowledging empty message");
    return new NextResponse(null, { status: 200 });
  }

  let notification: DeveloperNotification;
  try {
    const decoded = Buffer.from(encodedData, "base64").toString("utf8");
    notification = JSON.parse(decoded) as DeveloperNotification;
  } catch {
    console.warn("[rtdn] failed to decode notification payload");
    return new NextResponse(null, { status: 200 });
  }

  const { subscriptionNotification, oneTimeProductNotification, voidedPurchaseNotification } =
    notification;
  console.log(
    "[rtdn] notification type:",
    voidedPurchaseNotification
      ? "voided_purchase"
      : subscriptionNotification
        ? "subscription"
        : oneTimeProductNotification
          ? "one_time"
          : "unknown",
  );

  if (voidedPurchaseNotification) {
    await applyVoidedPurchase(voidedPurchaseNotification);
  } else if (subscriptionNotification) {
    await applySubscriptionNotification(subscriptionNotification);
  } else if (oneTimeProductNotification) {
    handleOneTimeProductNotification(oneTimeProductNotification);
  }

  // Always acknowledge to Pub/Sub; retries are handled through store snapshots
  // and the purchase ledger rather than replaying a notification mutation.
  return new NextResponse(null, { status: 200 });
}

function handleOneTimeProductNotification(notif: OneTimeProductNotification) {
  if (notif.sku !== NOOR_PACK_PRODUCT_ID) return;

  // RTDN does not identify the Warsh user for a new one-time token. The
  // authenticated purchase endpoint owns user association, verification,
  // atomic granting and idempotency; this handler must never grant separately.
  console.log("[rtdn] Noor pack notification acknowledged; grant handled by purchase endpoint");
}
