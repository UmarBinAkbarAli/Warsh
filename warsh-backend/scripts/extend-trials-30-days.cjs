require("dotenv/config");

const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");

// One-off (owner decision 2026-11-04): accounts created on the old 7-day trial
// get the new 30-day trial, counted from when they signed up
// (trialStartAt + 30 days). Only lengthens a trial — a trial already longer
// (promo code, admin extension) is never shortened. Accounts whose 30 days
// have already passed are untouched. A row the expiry cron marked "expired"
// is put back to "trial" only when it never had a store purchase.
// Usage: node scripts/extend-trials-30-days.cjs          (dry run)
//        node scripts/extend-trials-30-days.cjs --apply
const APPLY = process.argv.includes("--apply");
const DAY_MS = 24 * 60 * 60 * 1000;

async function main() {
  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
  });
  try {
    const now = new Date();
    const since = new Date(now.getTime() - 30 * DAY_MS);
    const candidates = await prisma.user.findMany({
      where: { trialStartAt: { gt: since } },
      select: {
        id: true, email: true, trialStartAt: true, trialExpiresAt: true,
        subscriptionStatus: true, lastPurchaseToken: true, subscriptionActiveUntil: true,
      },
    });
    const targets = candidates
      .map((u) => ({ ...u, newExpiry: new Date(u.trialStartAt.getTime() + 30 * DAY_MS) }))
      .filter((u) => u.newExpiry > u.trialExpiresAt);

    console.log(`${APPLY ? "APPLY" : "DRY RUN"}: ${targets.length} of ${candidates.length} recent accounts to extend`);
    let reopened = 0;
    for (const u of targets) {
      const reopen =
        u.subscriptionStatus === "expired" && !u.lastPurchaseToken && !u.subscriptionActiveUntil;
      if (reopen) reopened++;
      console.log(
        `  ${u.id}  ${u.trialExpiresAt.toISOString()} -> ${u.newExpiry.toISOString()}  [${u.subscriptionStatus}${reopen ? " -> trial" : ""}]`,
      );
      if (APPLY) {
        await prisma.user.update({
          where: { id: u.id },
          data: { trialExpiresAt: u.newExpiry, ...(reopen ? { subscriptionStatus: "trial" } : {}) },
        });
      }
    }
    console.log(`${reopened} expired trial(s) reopened`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
