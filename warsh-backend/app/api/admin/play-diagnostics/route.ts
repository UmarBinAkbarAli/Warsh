import { NextResponse } from "next/server";
import crypto from "crypto";
import { getAdminReadError } from "../../../../lib/admin";
import { prisma } from "../../../../lib/prisma";
import {
  fetchGooglePlaySubscriptionSnapshot,
  runGooglePlayDiagnostics,
  StoreVerificationError,
} from "../../../../lib/storeVerification";

// GET /api/admin/play-diagnostics
// Admin-gated live self-test of the Google Play verification path. Answers the
// question a failed purchase cannot: is the app itself resolvable for our
// service account, or is only the token being rejected? Reports the service
// account identity and a non-secret fingerprint of the configured package name —
// never key material.
//
// GET /api/admin/play-diagnostics?email=<user>
// Additionally reports what Google currently says about that user's stored
// purchase token — base plan, expiry, subscription state, acknowledgement state —
// next to what our database believes. This is the evidence device QA needs for
// the yearly plan, restore, and acknowledgement checks without reading it off a
// phone screen. The purchase token itself is never returned, only a digest.
export async function GET(request: Request) {
  const readError = getAdminReadError(request);
  if (readError) return readError;

  const diagnostics = await runGooglePlayDiagnostics();

  const healthy =
    diagnostics.packageName.configured &&
    diagnostics.serviceAccount.configured &&
    diagnostics.oauth.ok &&
    diagnostics.applicationResolves.ok;

  const email = new URL(request.url).searchParams.get("email")?.trim();
  const subscriber = email ? await inspectSubscriber(email, diagnostics.packageName) : undefined;

  return NextResponse.json({ data: { healthy, ...diagnostics, ...(subscriber ? { subscriber } : {}) } });
}

async function inspectSubscriber(
  email: string,
  packageName: Awaited<ReturnType<typeof runGooglePlayDiagnostics>>["packageName"],
) {
  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
    select: {
      id: true,
      email: true,
      subscriptionStatus: true,
      subscriptionProductId: true,
      subscriptionActiveUntil: true,
      lastPurchaseToken: true,
    },
  });

  if (!user) return { found: false as const, email };

  const { lastPurchaseToken, ...stored } = user;
  const base = {
    found: true as const,
    stored,
    // Enough to tell two tokens apart across a restore or plan change without
    // putting a live purchase token in a response or a log.
    purchaseToken: lastPurchaseToken
      ? { present: true as const, digest: crypto.createHash("sha256").update(lastPurchaseToken).digest("hex").slice(0, 12) }
      : { present: false as const },
  };

  if (!lastPurchaseToken || !packageName.configured) return base;

  try {
    const snapshot = await fetchGooglePlaySubscriptionSnapshot(packageName.value, lastPurchaseToken);
    return {
      ...base,
      google: {
        ok: true as const,
        storeState: snapshot.storeState,
        storeStatus: snapshot.storeStatus,
        basePlanId: snapshot.basePlanId ?? null,
        activeUntil: snapshot.activeUntil,
        autoRenew: snapshot.autoRenew,
        acknowledgementState: snapshot.acknowledgementState,
        acknowledged: snapshot.acknowledged,
        // Set when this subscription replaced an earlier token (plan change or
        // re-subscribe); the superseded token stops receiving notifications.
        supersededToken: snapshot.linkedPurchaseToken
          ? crypto.createHash("sha256").update(snapshot.linkedPurchaseToken).digest("hex").slice(0, 12)
          : null,
      },
    };
  } catch (error) {
    const storeError = error instanceof StoreVerificationError ? error : null;
    return {
      ...base,
      google: {
        ok: false as const,
        code: storeError?.code ?? "unknown",
        message: (error as Error)?.message ?? "unknown",
      },
    };
  }
}
