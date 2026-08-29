import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { getUserIdFromRequest } from "../../../../lib/auth";
import { getSubscriptionState } from "../../../../lib/subscription";
import { refreshLapsedStoreSubscription } from "../../../../lib/subscriptionRefresh";

export async function GET(request: Request) {
  const userId = await getUserIdFromRequest(request);
  if (!userId) return NextResponse.json({ error: "Unauthorized", code: "unauthorized" }, { status: 401 });

  const stored = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      trialStartAt: true,
      trialExpiresAt: true,
      subscriptionStatus: true,
      subscriptionActiveUntil: true,
      subscriptionProductId: true,
      noorOverageBalance: true,
      lastPurchaseToken: true,
    },
  });

  if (!stored) return NextResponse.json({ error: "Not found", code: "not_found" }, { status: 404 });

  // The store, not our row, decides whether a lapsed period actually ended. See
  // refreshLapsedStoreSubscription: a missed renewal notification must not read
  // as an expired subscription to the app.
  const user = await refreshLapsedStoreSubscription(stored);

  const googlePlayVerificationReady = Boolean(
    process.env.GOOGLE_PLAY_PACKAGE_NAME?.trim() &&
    process.env.GOOGLE_PLAY_SERVICE_ACCOUNT_KEY?.trim()
  );

  return NextResponse.json({
    data: {
      ...getSubscriptionState(user),
      googlePlayVerificationReady,
    },
  });
}
