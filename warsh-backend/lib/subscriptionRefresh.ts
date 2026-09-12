import { prisma } from "./prisma";
import { ACCESS_GRANTING_STORE_STATES } from "./subscription";

// Store states Google can return to "active" without a new purchase, so nothing
// on the client ever re-verifies them.
const SUSPENDED_STORE_STATES: ReadonlySet<string> = new Set(["on_hold", "paused", "pending"]);
import { fetchGooglePlaySubscriptionSnapshot } from "./storeVerification";

/**
 * The subset of User this refresh reads and rewrites. Kept structural so callers
 * can pass their own `select` result without widening it.
 */
export interface RefreshableSubscription {
  id: string;
  subscriptionStatus: string;
  subscriptionActiveUntil: Date | null;
  subscriptionProductId: string | null;
  lastPurchaseToken: string | null;
}

/**
 * Re-reads a lapsed store subscription from Google and persists the result.
 *
 * Renewals reach us through Real-Time Developer Notifications, which is a push we
 * may simply never receive: the Pub/Sub topic can be unconfigured, the push can
 * fail, or the notification can be dropped. When that happens the store keeps
 * renewing and charging while our row silently expires, and a paying subscriber
 * is locked out of the app they are being billed for. Observed in production on
 * 2026-08-29: Google reported the subscription active until 08:08 while our row
 * had expired at 07:38.
 *
 * This closes that gap by treating our stored expiry as a cache rather than the
 * truth. The work is deliberately bounded: it runs only for a user who holds a
 * purchase token, whose stored state still claims entitlement, and whose stored
 * period has already elapsed. Whatever Google answers ends that condition — a
 * renewal pushes the expiry forward, a real ending writes "expired" — so a lapsed
 * subscriber costs one Google call, not one per request.
 *
 * The suspended states — on hold, paused, pending — are the mirror image: Google
 * moves them back to active on its own (a fixed payment method, a resumed pause,
 * a completed pending purchase) and tells us only through the same droppable
 * push, and nothing in the app re-verifies that token because no purchase
 * happened. A stored expiry that has elapsed is normal for these states, so the
 * lapsed rule above can never fire for them and they would stay locked out until
 * the user stumbled onto the paywall's auto-restore. `includeSuspended` opts a
 * caller into refreshing them too; it is meant for the explicit status read the
 * app makes when it shows the subscription, not for every gated route, because a
 * suspended row stays suspended for weeks and would otherwise cost a Google call
 * per request.
 *
 * Never throws: a store that cannot be reached leaves the stored state untouched,
 * which fails closed to whatever access the user already had.
 */
export async function refreshLapsedStoreSubscription<T extends RefreshableSubscription>(
  user: T,
  now: Date = new Date(),
  options: { includeSuspended?: boolean } = {},
): Promise<T> {
  if (!user.lastPurchaseToken) return user;

  if (ACCESS_GRANTING_STORE_STATES.has(user.subscriptionStatus)) {
    if (user.subscriptionActiveUntil == null) return user;
    if (user.subscriptionActiveUntil.getTime() > now.getTime()) return user;
  } else if (!(options.includeSuspended && SUSPENDED_STORE_STATES.has(user.subscriptionStatus))) {
    return user;
  }

  const packageName = process.env.GOOGLE_PLAY_PACKAGE_NAME?.trim();
  if (!packageName) return user;

  let snapshot;
  try {
    snapshot = await fetchGooglePlaySubscriptionSnapshot(packageName, user.lastPurchaseToken);
  } catch (error) {
    console.warn("[subscription] lapsed refresh failed:", (error as Error)?.message ?? error);
    return user;
  }

  const subscriptionStatus = snapshot.storeState;
  const subscriptionActiveUntil = snapshot.activeUntil ?? user.subscriptionActiveUntil;
  const subscriptionProductId = snapshot.basePlanId ?? user.subscriptionProductId;

  // Nothing changed (the subscription really did end at the stored instant and
  // Google already agreed, or it is still suspended) — skip the write.
  if (
    subscriptionStatus === user.subscriptionStatus &&
    subscriptionActiveUntil?.getTime() === user.subscriptionActiveUntil?.getTime() &&
    subscriptionProductId === user.subscriptionProductId
  ) {
    return user;
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { subscriptionStatus, subscriptionActiveUntil, subscriptionProductId },
  });

  console.log("[subscription] refreshed lapsed subscription from Google", {
    userId: user.id,
    from: { status: user.subscriptionStatus, activeUntil: user.subscriptionActiveUntil?.toISOString() ?? null },
    to: { status: subscriptionStatus, activeUntil: subscriptionActiveUntil?.toISOString() ?? null },
  });

  return { ...user, subscriptionStatus, subscriptionActiveUntil, subscriptionProductId };
}
