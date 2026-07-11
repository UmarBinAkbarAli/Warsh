import { prisma } from "./prisma";

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
  const effectiveStatus: SubscriptionStatus =
    user.subscriptionStatus === "trial" && !trialActive
      ? "expired"
      : user.subscriptionStatus as SubscriptionStatus;

  return {
    // Do not wait for the periodic expiry cron to make the client behave
    // correctly. Once the seven-day timestamp has passed, the effective state
    // is expired immediately even if the persisted row still says "trial".
    subscriptionStatus: effectiveStatus,
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
