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
  const onTrial = user.subscriptionStatus === "trial";
  const trialActive = onTrial && trialDaysRemaining > 0;

  // Normalized store state for a store-backed subscription (null while on trial /
  // never subscribed). This is the source of truth persisted from verified
  // Google/Apple data — never a client-supplied or locally-computed value.
  const storeState: StoreSubscriptionState | null = onTrial
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

  const hasAccess = trialActive || subscriptionActive;

  // A finished trial reports as "expired" even before the cron flips the row.
  const effectiveStatus: SubscriptionStatus =
    onTrial && !trialActive ? "expired" : (user.subscriptionStatus as SubscriptionStatus);

  return {
    subscriptionStatus: effectiveStatus,
    // Normalized store state (null on trial / never subscribed).
    storeState,
    // True when auto-renew is off but the user still has access until expiry.
    willCancel: storeState === "canceled",
    // Payment is being retried; access retained for now.
    inGracePeriod: storeState === "in_grace",
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
