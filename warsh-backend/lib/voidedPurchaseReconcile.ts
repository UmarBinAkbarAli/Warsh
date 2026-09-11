import type { GoogleVoidedPurchase } from "./storeVerification";
import type { VoidedPurchaseNotification } from "./voidedPurchase";

/**
 * Daily pull-side reconciliation of refunds against Google.
 *
 * Refunds normally reach Warsh as an RTDN `voidedPurchaseNotification`, and
 * `applyVoidedPurchase` claws back the Noor credits or expires the subscription
 * the moment it lands. But RTDN is a push we may simply never receive — the
 * same gap that forced the lazy subscription refresh — and a dropped void meant
 * a refunded subscriber kept full access until the stored period lapsed, and a
 * refunded Noor pack kept its credits forever.
 *
 * This replays Google's own voided-purchases list through the same handler.
 * Because that handler is idempotent (voidedAt on packs, the NOT-expired guard
 * on subscriptions), re-reading a window that overlaps yesterday's is free, so
 * the lookback is deliberately generous.
 */

export const VOIDED_RECONCILE_LOOKBACK_MS = 7 * 24 * 60 * 60 * 1000;

export interface ReconcileVoidedDeps {
  fetchVoided: (since: Date) => Promise<GoogleVoidedPurchase[]>;
  apply: (notif: VoidedPurchaseNotification) => Promise<void>;
}

export interface ReconcileVoidedReport {
  since: string;
  found: number;
  applied: number;
  failed: { orderId: string | null; error: string }[];
}

export async function reconcileVoidedPurchases(
  deps: ReconcileVoidedDeps,
  now: Date = new Date(),
  lookbackMs: number = VOIDED_RECONCILE_LOOKBACK_MS,
): Promise<ReconcileVoidedReport> {
  const since = new Date(now.getTime() - lookbackMs);
  const voided = await deps.fetchVoided(since);

  const report: ReconcileVoidedReport = { since: since.toISOString(), found: voided.length, applied: 0, failed: [] };

  for (const item of voided) {
    // Google's list does not label subscriptions vs one-time products, so
    // productType stays undefined and the handler resolves the token itself.
    // A voidedQuantity that is not the full purchase is a partial refund, which
    // the handler already refuses to guess at.
    const notif: VoidedPurchaseNotification = {
      purchaseToken: item.purchaseToken,
      orderId: item.orderId,
    };

    try {
      // One bad token must not stop the rest of the list from being applied.
      await deps.apply(notif);
      report.applied += 1;
    } catch (error) {
      report.failed.push({
        orderId: item.orderId ?? null,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  return report;
}
