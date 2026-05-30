export type SubscriptionStatus = "trial" | "active" | "expired" | "canceled";

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
  const trialActive = trialDaysRemaining > 0 && user.subscriptionStatus === "trial";
  const subscriptionActive =
    user.subscriptionStatus === "active" &&
    user.subscriptionActiveUntil != null &&
    user.subscriptionActiveUntil > now;

  const hasAccess = trialActive || subscriptionActive;

  return {
    subscriptionStatus: user.subscriptionStatus as SubscriptionStatus,
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
