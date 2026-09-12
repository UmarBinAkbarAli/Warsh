export const SUBSCRIPTION_PRODUCT_ID = "warsh_premium";

// Deep link to THIS subscription's management page in the Play Store. Shared by
// Manage subscription and the Learn-tab health banner so both open the same
// page; there is no in-app payment editing anywhere.
export const PLAY_SUBSCRIPTION_URL =
  `https://play.google.com/store/account/subscriptions?sku=${SUBSCRIPTION_PRODUCT_ID}&package=com.warsh.app`;

// Store states the Learn tab surfaces as a banner. "expired" keeps its own
// banner; "active" and "canceled" show nothing (a cancelled subscriber keeps
// Premium to period end and is handled by Manage subscription).
export type SubscriptionHealthState = "in_grace" | "on_hold" | "paused" | "pending";

const HEALTH_STATES: ReadonlySet<string> = new Set(["in_grace", "on_hold", "paused", "pending"]);

export function toSubscriptionHealthState(status: string | null | undefined): SubscriptionHealthState | null {
  return status && HEALTH_STATES.has(status) ? (status as SubscriptionHealthState) : null;
}

// States where Google has suspended a PAYING subscriber. Lesson taps go to
// Manage subscription rather than the paywall — this learner already pays.
export function isPremiumSuspended(status: string | null | undefined): boolean {
  return status === "on_hold" || status === "paused";
}
