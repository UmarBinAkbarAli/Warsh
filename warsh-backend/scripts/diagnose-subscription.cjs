require("dotenv/config");

const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");

// Read-only diagnostic: prints the raw subscription fields for a user and the
// values getSubscriptionState() would derive from them. Makes no writes.
// Usage: node scripts/diagnose-subscription.cjs --email you@example.com

const ACCESS_GRANTING_STORE_STATES = new Set(["active", "canceled", "in_grace"]);

function fail(message) {
  console.error(`ERROR: ${message}`);
  process.exit(1);
}

// Mirrors lib/subscription.ts getSubscriptionState (kept in sync for diagnosis).
function computeState(user) {
  const now = new Date();
  const trialDaysRemaining = Math.ceil(
    (user.trialExpiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  );
  const trialWindowOpen = user.trialExpiresAt.getTime() > now.getTime();
  const storeState = user.subscriptionStatus === "trial" ? null : user.subscriptionStatus;
  const withinPaidPeriod =
    user.subscriptionActiveUntil != null && user.subscriptionActiveUntil > now;
  const subscriptionActive =
    storeState != null &&
    ACCESS_GRANTING_STORE_STATES.has(storeState) &&
    withinPaidPeriod;
  const trialActive = trialWindowOpen && !subscriptionActive;
  const hasAccess = trialActive || subscriptionActive;
  const effectiveStatus = subscriptionActive
    ? user.subscriptionStatus
    : trialWindowOpen
      ? "trial"
      : storeState != null
        ? user.subscriptionStatus
        : "expired";
  return {
    trialDaysRemaining: Math.max(0, trialDaysRemaining),
    trialWindowOpen,
    trialActive,
    storeState,
    withinPaidPeriod,
    subscriptionActive,
    hasAccess,
    effectiveStatus,
  };
}

async function main() {
  if (!process.env.DATABASE_URL) fail("DATABASE_URL is not set.");

  const argv = process.argv.slice(2);
  let email = null;
  let userId = null;
  for (let i = 0; i < argv.length; i += 1) {
    if (argv[i] === "--email") email = argv[i + 1];
    if (argv[i] === "--user-id") userId = argv[i + 1];
  }
  if (!email && !userId) fail("Pass --email <email> or --user-id <id>.");

  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
  const prisma = new PrismaClient({ adapter });

  try {
    const user = await prisma.user.findFirst({
      where: userId ? { id: userId } : { email },
      select: {
        id: true,
        email: true,
        createdAt: true,
        trialStartAt: true,
        trialExpiresAt: true,
        subscriptionStatus: true,
        subscriptionActiveUntil: true,
        subscriptionProductId: true,
        lastPurchaseToken: true,
        noorOverageBalance: true,
      },
    });

    if (!user) fail(`No user found for ${userId ? `id ${userId}` : `email ${email}`}.`);

    const now = new Date();
    console.log("\n=== RAW DB FIELDS ===");
    console.log("id:                     ", user.id);
    console.log("email:                  ", user.email);
    console.log("createdAt:              ", user.createdAt?.toISOString());
    console.log("trialStartAt:           ", user.trialStartAt?.toISOString());
    console.log("trialExpiresAt:         ", user.trialExpiresAt?.toISOString());
    console.log("subscriptionStatus:     ", JSON.stringify(user.subscriptionStatus));
    console.log("subscriptionActiveUntil:", user.subscriptionActiveUntil?.toISOString() ?? null);
    console.log("subscriptionProductId:  ", JSON.stringify(user.subscriptionProductId));
    console.log("lastPurchaseToken:      ", user.lastPurchaseToken ? `set (…${user.lastPurchaseToken.slice(-6)})` : null);
    console.log("noorOverageBalance:     ", user.noorOverageBalance);
    console.log("now:                    ", now.toISOString());

    const computed = computeState(user);
    console.log("\n=== COMPUTED (what the API returns) ===");
    console.log(JSON.stringify(computed, null, 2));

    console.log("\n=== VERDICT ===");
    if (computed.trialDaysRemaining > 0 && !computed.hasAccess) {
      console.log(
        `CONTRADICTION CONFIRMED: reports ${computed.trialDaysRemaining} trial day(s) remaining but hasAccess=false.`
      );
      console.log(
        `Reason: subscriptionStatus is ${JSON.stringify(user.subscriptionStatus)} (not "trial"), so the trial window is ignored for access.`
      );
    } else if (computed.hasAccess) {
      console.log("hasAccess=true — this account should NOT be locked. Any lock seen is chapter-progression, not subscription.");
    } else {
      console.log("hasAccess=false and 0 trial days left — this is a genuinely expired trial (not the contradiction bug).");
    }
    console.log("");
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
