import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";

// Google Play subscription notification types
const SUBSCRIPTION_RENEWED = 2;
const SUBSCRIPTION_CANCELED = 3; // user canceled; still active until period end
const SUBSCRIPTION_ON_HOLD = 5;  // payment failed, grace period
const SUBSCRIPTION_GRACE_PERIOD = 6;
const SUBSCRIPTION_REVOKED = 12; // refund — revoke immediately
const SUBSCRIPTION_EXPIRED = 13;

const ACTIVE_NOTIFICATION_TYPES = new Set([1, 2, 4, 7]); // recovered, renewed, purchased, restarted
const EXPIRED_NOTIFICATION_TYPES = new Set([SUBSCRIPTION_REVOKED, SUBSCRIPTION_EXPIRED]);

// One-time product notification types
const ONE_TIME_PURCHASED = 1;
const NOOR_PACK_PRODUCT_ID = "warsh_noor_pack";
const NOOR_PACK_MESSAGE_COUNT = 20;

interface PubSubMessage {
  message?: {
    data?: string;
    messageId?: string;
  };
}

interface SubscriptionNotification {
  notificationType?: number;
  purchaseToken?: string;
  subscriptionId?: string;
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
}

export async function POST(request: Request) {
  const expectedToken = process.env.GOOGLE_PLAY_NOTIFICATION_WEBHOOK_SECRET;
  if (expectedToken) {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");
    if (token !== expectedToken) {
      console.warn("[rtdn] unauthorized request — token mismatch");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  let body: PubSubMessage;
  try {
    body = await request.json() as PubSubMessage;
  } catch {
    console.warn("[rtdn] malformed request body");
    return new NextResponse(null, { status: 200 });
  }

  console.log("[rtdn] received message id:", body?.message?.messageId ?? "none");

  const encodedData = body?.message?.data;
  if (!encodedData) {
    console.log("[rtdn] no data payload — acking empty message");
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

  const { subscriptionNotification, oneTimeProductNotification } = notification;
  console.log("[rtdn] notification type:", subscriptionNotification ? "subscription" : oneTimeProductNotification ? "one_time" : "unknown");

  if (subscriptionNotification) {
    await handleSubscriptionNotification(subscriptionNotification);
  } else if (oneTimeProductNotification) {
    await handleOneTimeProductNotification(oneTimeProductNotification);
  }

  // Always ACK to Pub/Sub — do not retry
  return new NextResponse(null, { status: 200 });
}

async function handleSubscriptionNotification(notif: SubscriptionNotification) {
  const { notificationType, purchaseToken } = notif;
  if (!purchaseToken || notificationType == null) return;

  const user = await prisma.user.findFirst({
    where: { lastPurchaseToken: purchaseToken },
    select: { id: true, subscriptionStatus: true },
  });

  if (!user) return;

  if (ACTIVE_NOTIFICATION_TYPES.has(notificationType)) {
    // Renewal/recovery — re-verify with Google to get the new expiry
    const accessToken = await getGoogleAccessToken();
    if (!accessToken) return;

    const packageName = process.env.GOOGLE_PLAY_PACKAGE_NAME?.trim();
    if (!packageName) return;

    const url =
      `https://androidpublisher.googleapis.com/androidpublisher/v3/applications/${encodeURIComponent(packageName)}` +
      `/purchases/subscriptionsv2/tokens/${encodeURIComponent(purchaseToken)}`;

    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${accessToken}`, Accept: "application/json" },
    });

    if (!res.ok) return;

    const purchase = await res.json() as {
      subscriptionState?: string;
      lineItems?: Array<{ productId?: string; expiryTime?: string }>;
    };

    const latestItem = purchase.lineItems
      ?.filter((item) => item.expiryTime)
      .map((item) => ({ ...item, expiryDate: new Date(item.expiryTime as string) }))
      .filter((item) => Number.isFinite(item.expiryDate.getTime()))
      .sort((a, b) => b.expiryDate.getTime() - a.expiryDate.getTime())[0];

    if (!latestItem) return;

    await prisma.user.update({
      where: { id: user.id },
      data: {
        subscriptionStatus: "active",
        subscriptionActiveUntil: latestItem.expiryDate,
        subscriptionProductId: latestItem.productId ?? undefined,
      },
    });

  } else if (notificationType === SUBSCRIPTION_CANCELED) {
    // User canceled — retain access until period end, just flag auto-renew off
    // No action needed server-side; expiry will trigger naturally via RTDN EXPIRED
  } else if (notificationType === SUBSCRIPTION_ON_HOLD || notificationType === SUBSCRIPTION_GRACE_PERIOD) {
    // Payment failed — keep status as active during grace period; let EXPIRED handle the rest
  } else if (EXPIRED_NOTIFICATION_TYPES.has(notificationType)) {
    await prisma.user.update({
      where: { id: user.id },
      data: {
        subscriptionStatus: notificationType === SUBSCRIPTION_REVOKED ? "canceled" : "expired",
        subscriptionActiveUntil: notificationType === SUBSCRIPTION_REVOKED ? new Date() : undefined,
      },
    });
  }
}

async function handleOneTimeProductNotification(notif: OneTimeProductNotification) {
  const { notificationType, purchaseToken, sku } = notif;
  if (!purchaseToken || notificationType !== ONE_TIME_PURCHASED || sku !== NOOR_PACK_PRODUCT_ID) return;

  const user = await prisma.user.findFirst({
    where: { lastPurchaseToken: purchaseToken },
    select: { id: true },
  });

  if (!user) return;

  await prisma.user.update({
    where: { id: user.id },
    data: { noorOverageBalance: { increment: NOOR_PACK_MESSAGE_COUNT } },
  });
}

async function getGoogleAccessToken(): Promise<string | null> {
  const rawKey = process.env.GOOGLE_PLAY_SERVICE_ACCOUNT_KEY?.trim();
  if (!rawKey) return null;

  let key: { client_email?: string; private_key?: string; token_uri?: string };
  try {
    key = JSON.parse(rawKey) as typeof key;
  } catch {
    return null;
  }

  if (!key.client_email || !key.private_key) return null;

  const { createSign } = await import("crypto");
  const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
  const SCOPE = "https://www.googleapis.com/auth/androidpublisher";
  const now = Math.floor(Date.now() / 1000);

  const header = Buffer.from(JSON.stringify({ alg: "RS256", typ: "JWT" })).toString("base64url");
  const payload = Buffer.from(JSON.stringify({
    iss: key.client_email,
    scope: SCOPE,
    aud: key.token_uri ?? GOOGLE_TOKEN_URL,
    iat: now,
    exp: now + 3600,
  })).toString("base64url");

  const signingInput = `${header}.${payload}`;
  const signature = createSign("RSA-SHA256").update(signingInput).sign(key.private_key).toString("base64url");
  const assertion = `${signingInput}.${signature}`;

  const res = await fetch(key.token_uri ?? GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion,
    }),
  });

  if (!res.ok) return null;
  const data = await res.json() as { access_token?: string };
  return data.access_token ?? null;
}
