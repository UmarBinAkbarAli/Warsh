/**
 * Creates or updates a promotional code (idempotent upsert).
 *
 * Default: WARSH100 — 100 redemptions, 30 free days.
 * Run against the target environment's DATABASE_URL:
 *
 *   npx tsx -r dotenv/config scripts/create-promo-code.ts
 *   npx tsx -r dotenv/config scripts/create-promo-code.ts --code=WARSH500 --max=500 --days=30
 *   npx tsx -r dotenv/config scripts/create-promo-code.ts --code=WARSH100 --deactivate
 *
 * Re-running with the same code updates its settings without resetting
 * redemptionCount, so it is safe to run more than once.
 */
import { prisma } from "../lib/prisma";

function arg(name: string): string | undefined {
  const hit = process.argv.find((a) => a.startsWith(`--${name}=`));
  return hit?.split("=").slice(1).join("=");
}
const hasFlag = (name: string) => process.argv.includes(`--${name}`);

async function main() {
  const code = (arg("code") ?? "WARSH100").trim().toUpperCase();
  const maxRedemptions = arg("max") != null ? Number(arg("max")) : 100;
  const freeDays = arg("days") != null ? Number(arg("days")) : 30;
  const active = !hasFlag("deactivate");

  if (!code) throw new Error("A --code value is required.");
  if (!Number.isFinite(freeDays) || freeDays <= 0) throw new Error("--days must be a positive number.");
  if (arg("max") != null && (!Number.isFinite(maxRedemptions) || maxRedemptions < 0)) {
    throw new Error("--max must be a non-negative number (omit for unlimited).");
  }

  const promo = await prisma.promoCode.upsert({
    where: { code },
    // On update we intentionally do NOT touch redemptionCount.
    update: { freeDays, maxRedemptions, active },
    create: { code, freeDays, maxRedemptions, active },
  });

  console.log(
    `[promo] ${promo.code}: freeDays=${promo.freeDays}, ` +
      `cap=${promo.maxRedemptions ?? "unlimited"}, active=${promo.active}, ` +
      `redeemed=${promo.redemptionCount}`,
  );
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
