/**
 * Scenario tests for getSubscriptionState — the trial/subscription access logic.
 * Run: npx tsx scripts/test-subscription-state.ts
 *
 * Focus: a purchase made during the trial overwrites subscriptionStatus off
 * "trial"; if that purchase later lapses while trial days remain, the user must
 * still get access from the remaining trial (the "5-day trial but locked" bug).
 */
import { getSubscriptionState } from "../lib/subscription";

const DAY = 24 * 60 * 60 * 1000;
const now = Date.now();
const inDays = (d: number) => new Date(now + d * DAY);

type UserSub = Parameters<typeof getSubscriptionState>[0];

function baseUser(overrides: Partial<UserSub> = {}): UserSub {
  return {
    trialStartAt: inDays(-2),
    trialExpiresAt: inDays(5),
    subscriptionStatus: "trial",
    subscriptionActiveUntil: null,
    subscriptionProductId: null,
    noorOverageBalance: 0,
    ...overrides,
  };
}

type Expect = Partial<ReturnType<typeof getSubscriptionState>>;

let passed = 0;
let failed = 0;

function check(name: string, user: UserSub, expected: Expect) {
  const state = getSubscriptionState(user);
  const mismatches: string[] = [];
  for (const [key, want] of Object.entries(expected)) {
    const got = (state as Record<string, unknown>)[key];
    if (got !== want) mismatches.push(`${key}: expected ${JSON.stringify(want)}, got ${JSON.stringify(got)}`);
  }
  if (mismatches.length === 0) {
    passed++;
    console.log(`  PASS  ${name}`);
  } else {
    failed++;
    console.log(`  FAIL  ${name}`);
    for (const m of mismatches) console.log(`          ${m}`);
  }
}

console.log("\ngetSubscriptionState scenarios\n");

// 1. Fresh trial, never purchased.
check("fresh trial, no purchase", baseUser(), {
  hasAccess: true,
  trialActive: true,
  subscriptionActive: false,
  subscriptionStatus: "trial",
  trialDaysRemaining: 5,
});

// 2. THE BUG: trial still valid (5 days), but a purchase made during the trial
//    lapsed and the webhook wrote "expired". Must still have access via trial.
check("trial open + lapsed expired purchase (saad's account)", baseUser({
  subscriptionStatus: "expired",
  subscriptionActiveUntil: inDays(-2),
  subscriptionProductId: "warsh_premium",
}), {
  hasAccess: true,          // ← was false before the fix
  trialActive: true,
  subscriptionActive: false,
  subscriptionStatus: "trial",
  trialDaysRemaining: 5,
});

// 3. Trial open + active paid subscription: surface the subscription, not trial.
check("trial open + active paid sub", baseUser({
  subscriptionStatus: "active",
  subscriptionActiveUntil: inDays(360),
  subscriptionProductId: "warsh_premium",
}), {
  hasAccess: true,
  trialActive: false,
  subscriptionActive: true,
  subscriptionStatus: "active",
});

// 4. Trial open + payment on_hold mid-trial: still covered by the trial window.
check("trial open + on_hold store state", baseUser({
  subscriptionStatus: "on_hold",
  subscriptionActiveUntil: inDays(-1),
}), {
  hasAccess: true,
  trialActive: true,
  subscriptionActive: false,
  subscriptionStatus: "trial",
});

// 5. Trial ended, no purchase → expired, locked.
check("trial ended, no purchase", baseUser({
  trialExpiresAt: inDays(-1),
}), {
  hasAccess: false,
  trialActive: false,
  subscriptionActive: false,
  subscriptionStatus: "expired",
  trialDaysRemaining: 0,
});

// 6. Trial ended (status still "trial", cron hasn't flipped it) → expired.
check("trial ended, status not yet flipped by cron", baseUser({
  trialExpiresAt: inDays(-1),
  subscriptionStatus: "trial",
}), {
  hasAccess: false,
  trialActive: false,
  subscriptionStatus: "expired",
});

// 7. Trial ended + active paid sub → access via subscription.
check("trial ended + active paid sub", baseUser({
  trialExpiresAt: inDays(-3),
  subscriptionStatus: "active",
  subscriptionActiveUntil: inDays(300),
  subscriptionProductId: "warsh_premium",
}), {
  hasAccess: true,
  trialActive: false,
  subscriptionActive: true,
  subscriptionStatus: "active",
});

// 8. Trial ended + expired sub with a STALE future activeUntil (umar's account:
//    status expired but subscriptionActiveUntil a year out). Must stay locked —
//    "expired" is not an access-granting state regardless of the stale date.
check("trial ended + expired sub with stale future activeUntil", baseUser({
  trialExpiresAt: inDays(-40),
  subscriptionStatus: "expired",
  subscriptionActiveUntil: inDays(355),
  subscriptionProductId: "warsh_premium",
}), {
  hasAccess: false,
  trialActive: false,
  subscriptionActive: false,
  subscriptionStatus: "expired",
});

// 9. Trial ended + canceled-but-in-period → access retained, willCancel true.
check("trial ended + canceled but within paid period", baseUser({
  trialExpiresAt: inDays(-5),
  subscriptionStatus: "canceled",
  subscriptionActiveUntil: inDays(20),
  subscriptionProductId: "warsh_premium",
}), {
  hasAccess: true,
  subscriptionActive: true,
  willCancel: true,
  subscriptionStatus: "canceled",
});

// 10. Trial ended + grace period within paid window → access, inGracePeriod true.
check("trial ended + in_grace within paid period", baseUser({
  trialExpiresAt: inDays(-5),
  subscriptionStatus: "in_grace",
  subscriptionActiveUntil: inDays(3),
  subscriptionProductId: "warsh_premium",
}), {
  hasAccess: true,
  subscriptionActive: true,
  inGracePeriod: true,
  subscriptionStatus: "in_grace",
});

// 11. Trial ended + on_hold (no access) → locked, surfaces on_hold for the UI.
check("trial ended + on_hold", baseUser({
  trialExpiresAt: inDays(-5),
  subscriptionStatus: "on_hold",
  subscriptionActiveUntil: inDays(-1),
}), {
  hasAccess: false,
  trialActive: false,
  subscriptionActive: false,
  subscriptionStatus: "on_hold",
});

// 12. Guard: canceled state whose paid period already elapsed does NOT report
//     willCancel (would be misleading) and grants no access after the trial.
check("trial ended + canceled with elapsed period", baseUser({
  trialExpiresAt: inDays(-5),
  subscriptionStatus: "canceled",
  subscriptionActiveUntil: inDays(-1),
}), {
  hasAccess: false,
  subscriptionActive: false,
  willCancel: false,
  subscriptionStatus: "canceled",
});

console.log(`\n${passed} passed, ${failed} failed\n`);
process.exit(failed === 0 ? 0 : 1);
