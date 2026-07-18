import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { getUserIdFromRequest } from "../../../../lib/auth";
import { getSubscriptionState } from "../../../../lib/subscription";

const DAY_MS = 24 * 60 * 60 * 1000;

// Redeems a promotional code for free trial days. This never touches Google
// Play: access is granted purely by extending User.trialExpiresAt, which
// getSubscriptionState() already treats as full access while the window is open.
export async function POST(request: Request) {
  const userId = await getUserIdFromRequest(request);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized", code: "unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body.", code: "bad_request" }, { status: 400 });
  }

  const rawCode = (body as { code?: unknown })?.code;
  if (typeof rawCode !== "string" || !rawCode.trim()) {
    return NextResponse.json({ error: "Please enter a promo code.", code: "bad_request" }, { status: 400 });
  }

  // Codes are matched case-insensitively; stored canonically in uppercase.
  const code = rawCode.trim().toUpperCase();

  try {
    const result = await prisma.$transaction(async (tx) => {
      const promo = await tx.promoCode.findUnique({ where: { code } });

      if (!promo || !promo.active) {
        throw new PromoError("This promo code is not valid.", 404, "promo_not_found");
      }

      if (promo.expiresAt && promo.expiresAt.getTime() <= Date.now()) {
        throw new PromoError("This promo code has expired.", 410, "promo_expired");
      }

      // Already redeemed by this user? The unique constraint also protects us,
      // but checking first yields a clean, specific message.
      const existing = await tx.promoRedemption.findUnique({
        where: { promoCodeId_userId: { promoCodeId: promo.id, userId } },
      });
      if (existing) {
        throw new PromoError("You've already redeemed this code.", 409, "promo_already_redeemed");
      }

      // Atomically claim a slot: increment only while under the cap. When
      // maxRedemptions is null the code is unlimited and no guard is needed.
      // updateMany returns count 0 when the WHERE no longer matches (cap hit),
      // which is race-safe across concurrent redemptions.
      const claim = await tx.promoCode.updateMany({
        where:
          promo.maxRedemptions == null
            ? { id: promo.id }
            : { id: promo.id, redemptionCount: { lt: promo.maxRedemptions } },
        data: { redemptionCount: { increment: 1 } },
      });
      if (claim.count === 0) {
        throw new PromoError("This promo code has reached its limit.", 409, "promo_limit_reached");
      }

      await tx.promoRedemption.create({
        data: { promoCodeId: promo.id, userId },
      });

      const user = await tx.user.findUnique({
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
      if (!user) {
        throw new PromoError("Account not found.", 404, "not_found");
      }

      // Grant a full `freeDays` window from now, but never shorten an existing
      // longer trial. If the trial had already lapsed to "expired", flip the
      // lifecycle marker back to "trial" so the app shows the trial banner —
      // but never overwrite an active paid subscription's status.
      const now = Date.now();
      const grantedUntil = new Date(now + promo.freeDays * DAY_MS);
      const newExpiry =
        user.trialExpiresAt.getTime() > grantedUntil.getTime()
          ? user.trialExpiresAt
          : grantedUntil;

      const state = getSubscriptionState(user);
      const nextStatus =
        !state.subscriptionActive && user.subscriptionStatus !== "trial"
          ? "trial"
          : user.subscriptionStatus;

      const updated = await tx.user.update({
        where: { id: userId },
        data: { trialExpiresAt: newExpiry, subscriptionStatus: nextStatus },
        select: {
          trialStartAt: true,
          trialExpiresAt: true,
          subscriptionStatus: true,
          subscriptionActiveUntil: true,
          subscriptionProductId: true,
          noorOverageBalance: true,
        },
      });

      return { freeDays: promo.freeDays, state: getSubscriptionState(updated) };
    });

    return NextResponse.json({
      data: {
        freeDays: result.freeDays,
        ...result.state,
      },
    });
  } catch (error) {
    if (error instanceof PromoError) {
      return NextResponse.json({ error: error.message, code: error.code }, { status: error.status });
    }
    // The unique-constraint fallback (two requests racing past the pre-check).
    if (error && typeof error === "object" && "code" in error && (error as { code?: string }).code === "P2002") {
      return NextResponse.json(
        { error: "You've already redeemed this code.", code: "promo_already_redeemed" },
        { status: 409 },
      );
    }
    throw error;
  }
}

class PromoError extends Error {
  status: number;
  code: string;
  constructor(message: string, status: number, code: string) {
    super(message);
    this.name = "PromoError";
    this.status = status;
    this.code = code;
  }
}
