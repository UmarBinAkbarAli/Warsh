import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { getUserIdFromRequest } from "../../../../lib/auth";
import { getSubscriptionState } from "../../../../lib/subscription";

export async function GET(request: Request) {
  const userId = await getUserIdFromRequest(request);
  if (!userId) return NextResponse.json({ error: "Unauthorized", code: "unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      trialStartAt: true,
      trialExpiresAt: true,
      subscriptionStatus: true,
      subscriptionActiveUntil: true,
      subscriptionProductId: true,
      noorOverageBalance: true,
    },
  });

  if (!user) return NextResponse.json({ error: "Not found", code: "not_found" }, { status: 404 });

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
