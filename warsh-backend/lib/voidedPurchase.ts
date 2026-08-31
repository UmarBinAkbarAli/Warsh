import { prisma } from "./prisma";
import { hashPurchaseToken } from "./noorPackPurchase";

/**
 * Google's refund/chargeback notification. `productType` is 1 for a subscription
 * and 2 for a one-time product; `refundType` is 1 for a full void and 2 when only
 * part of a quantity was refunded.
 */
export interface VoidedPurchaseNotification {
  purchaseToken?: string;
  orderId?: string;
  productType?: number;
  refundType?: number;
}

export const VOIDED_PRODUCT_TYPE_SUBSCRIPTION = 1;
export const VOIDED_REFUND_TYPE_FULL = 1;

/**
 * Claws back a refunded or charged-back purchase.
 *
 * Play sends `voidedPurchaseNotification` when it refunds a buyer, and until this
 * existed the money went back while the goods stayed: a Noor pack could be bought,
 * its twenty messages spent, and then refunded, with the credits still on the
 * account. Subscriptions were partly covered by SUBSCRIPTION_REVOKED, but a void
 * can arrive without one.
 *
 * Idempotent by construction. Play redelivers a notification until it is acked,
 * and a second clawback would take credits the buyer still paid for, so the
 * `voidedAt IS NULL` guard — not a prior read — is what decides whether this
 * request is the one that removes them.
 */
export async function applyVoidedPurchase(notif: VoidedPurchaseNotification) {
  const purchaseToken = notif.purchaseToken;
  if (!purchaseToken) return;

  // A voided subscription loses access immediately; the paid period is irrelevant
  // once the money is returned.
  if (notif.productType === VOIDED_PRODUCT_TYPE_SUBSCRIPTION) {
    const revoked = await prisma.user.updateMany({
      where: { lastPurchaseToken: purchaseToken },
      data: { subscriptionStatus: "expired", subscriptionActiveUntil: new Date() },
    });
    console.log("[rtdn] voided subscription; access revoked for", revoked.count, "user(s)");
    return;
  }

  const purchase = await prisma.storePurchase.findUnique({
    where: { tokenHash: hashPurchaseToken(purchaseToken) },
    select: { id: true, userId: true, creditsGranted: true, voidedAt: true },
  });

  // Not a purchase we recorded. A subscription token can arrive here when Google
  // omits productType, so fall back to the subscription path rather than dropping it.
  if (!purchase) {
    const revoked = await prisma.user.updateMany({
      where: { lastPurchaseToken: purchaseToken },
      data: { subscriptionStatus: "expired", subscriptionActiveUntil: new Date() },
    });
    if (revoked.count > 0) {
      console.log("[rtdn] voided purchase matched a subscription token; access revoked");
    } else {
      console.warn("[rtdn] voided purchase does not match any recorded purchase");
    }
    return;
  }

  if (purchase.voidedAt) {
    console.log("[rtdn] voided purchase already clawed back; ignoring redelivery");
    return;
  }

  // A partial refund returns only part of a quantity purchase, and Google does not
  // say how much. Guessing would either rob the buyer or leave the hole open, so
  // these are surfaced for a human instead of handled silently.
  if (notif.refundType != null && notif.refundType !== VOIDED_REFUND_TYPE_FULL) {
    console.error(
      "[rtdn] PARTIAL refund needs manual review - credits left in place:",
      JSON.stringify({ storePurchaseId: purchase.id, userId: purchase.userId, orderId: notif.orderId ?? null }),
    );
    return;
  }

  await prisma.$transaction(async (tx) => {
    // Winning this update is what grants the right to remove the credits; a
    // concurrent redelivery finds voidedAt already set and changes nothing.
    const claimed = await tx.storePurchase.updateMany({
      where: { id: purchase.id, voidedAt: null },
      data: { voidedAt: new Date() },
    });
    if (claimed.count === 0) return;

    const user = await tx.user.findUnique({
      where: { id: purchase.userId },
      select: { noorOverageBalance: true },
    });
    if (!user) return;

    // Floor at zero: the buyer may already have spent the credits, and a negative
    // balance would silently tax whatever they purchase next.
    const next = Math.max(0, user.noorOverageBalance - purchase.creditsGranted);
    await tx.user.update({
      where: { id: purchase.userId },
      data: { noorOverageBalance: next },
    });

    console.log(
      "[rtdn] clawed back voided Noor pack:",
      JSON.stringify({
        userId: purchase.userId,
        creditsGranted: purchase.creditsGranted,
        balanceFrom: user.noorOverageBalance,
        balanceTo: next,
      }),
    );
  });
}
