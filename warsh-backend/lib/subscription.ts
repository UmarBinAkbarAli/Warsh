import { prisma } from "./prisma";

// Trial + lifecycle status persisted in User.subscriptionStatus.
// For store-backed subscriptions this holds the *normalized store state* below;
// "trial" is the pre-purchase state.
export type StoreSubscriptionState =
  | "active" // paid + auto-renews
  | "canceled" // auto-renew off, still paid through the period
  | "in_grace" // payment failed, retrying, access retained
  | "on_hold" // payment failed past grace, access suspended
  | "paused" // user paused, access suspended
  | "expired" // ended, no access
  | "pending"; // purchase not yet completed

export type SubscriptionStatus = "trial" | StoreSubscriptionState;

// States in which Google/Apple still consider the subscription entitled to access,
// provided the paid period has not elapsed. "canceled" = auto-renew turned off but
// the user keeps Premium until the period ends. "in_grace" = payment retrying.
export const ACCESS_GRANTING_STORE_STATES: ReadonlySet<string> = new Set([
  "active",
  "canceled",
  "in_grace",
]);

/**
 * Maps a Google Play `subscriptionsv2` subscriptionState string to our normalized
 * store state. Unknown/absent states are treated as expired (fail closed — no access).
 */
export function mapGoogleSubscriptionState(
  googleState: string | undefined | null,
): StoreSubscriptionState {
  switch (googleState) {
    case "SUBSCRIPTION_STATE_ACTIVE":
      return "active";
    case "SUBSCRIPTION_STATE_CANCELED":
      return "canceled";
    case "SUBSCRIPTION_STATE_IN_GRACE_PERIOD":
      return "in_grace";
    case "SUBSCRIPTION_STATE_ON_HOLD":
      return "on_hold";
    case "SUBSCRIPTION_STATE_PAUSED":
      return "paused";
    case "SUBSCRIPTION_STATE_PENDING":
      return "pending";
    case "SUBSCRIPTION_STATE_EXPIRED":
    default:
      return "expired";
  }
}

interface UserSub {
  trialStartAt: Date;
  trialExpiresAt: Date;
  subscriptionStatus: string;
  subscriptionActiveUntil: Date | null;
  subscriptionProductId: string | null;
  noorOverageBalance: number;
}

export function getSubscriptionState(user: UserSub) {
  const now = new Date();
  const trialDaysRemaining = Math.ceil(
    (user.trialExpiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  );
  // The trial window is defined solely by trialExpiresAt — NOT by the status
  // string. A subscription purchase during the trial overwrites subscriptionStatus
  // off "trial"; that must not shorten the guaranteed trial window.
  const trialWindowOpen = user.trialExpiresAt.getTime() > now.getTime();

  // Normalized store state for a store-backed subscription (null while purely on
  // the "trial" lifecycle marker). This is persisted from verified Google/Apple
  // data — never a client-supplied or locally-computed value.
  const storeState: StoreSubscriptionState | null =
    user.subscriptionStatus === "trial"
      ? null
      : (user.subscriptionStatus as StoreSubscriptionState);

  const withinPaidPeriod =
    user.subscriptionActiveUntil != null && user.subscriptionActiveUntil > now;

  // Access is granted while the paid period has not elapsed AND the store state
  // still entitles the user (active / canceled-but-in-period / grace period).
  const subscriptionActive =
    storeState != null &&
    ACCESS_GRANTING_STORE_STATES.has(storeState) &&
    withinPaidPeriod;

  // The trial grants full access for the ENTIRE trial window, independent of
  // subscriptionStatus. If a purchase made during the trial later lapses (test
  // subscriptions, cancellation, failed payment) while trial days remain, the
  // user falls back to the remaining trial instead of being locked out. Spec:
  // the trial is seven full days of access that nothing cuts short early.
  // (When a purchase is active we surface the subscription rather than the trial.)
  const trialActive = trialWindowOpen && !subscriptionActive;

  const hasAccess = trialActive || subscriptionActive;

  // Reported status keeps every UI surface coherent:
  //  - an active paid subscription reports its real store state;
  //  - otherwise an open trial window reports "trial" (so the app shows the trial
  //    banner, never the expired/locked banner, even after a lapsed purchase);
  //  - a closed window with no active subscription reports its store state
  //    (on_hold / paused / pending) or "expired".
  const effectiveStatus: SubscriptionStatus = subscriptionActive
    ? (user.subscriptionStatus as SubscriptionStatus)
    : trialWindowOpen
      ? "trial"
      : storeState != null
        ? (user.subscriptionStatus as SubscriptionStatus)
        : "expired";

  return {
    subscriptionStatus: effectiveStatus,
    // Normalized store state (null when never subscribed / purely on trial).
    storeState,
    // True when auto-renew is off but the user still has access until expiry.
    willCancel: storeState === "canceled" && subscriptionActive,
    // Payment is being retried; access retained for now.
    inGracePeriod: storeState === "in_grace" && subscriptionActive,
    trialDaysRemaining: Math.max(0, trialDaysRemaining),
    trialActive,
    subscriptionActive,
    hasAccess,
    subscriptionActiveUntil: user.subscriptionActiveUntil,
    subscriptionProductId: user.subscriptionProductId,
    noorOverageBalance: user.noorOverageBalance,
  };
}

export function requiresSubscription(state: ReturnType<typeof getSubscriptionState>): boolean {
  return !state.hasAccess;
}

export async function getUserSubscriptionState(userId: string) {
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

  return user ? getSubscriptionState(user) : null;
}
