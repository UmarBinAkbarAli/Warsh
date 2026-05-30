-- AlterTable: add subscription fields to User
ALTER TABLE "User"
  ADD COLUMN "trialStartAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN "trialExpiresAt" TIMESTAMP(3) NOT NULL DEFAULT (CURRENT_TIMESTAMP + INTERVAL '7 days'),
  ADD COLUMN "subscriptionStatus" TEXT NOT NULL DEFAULT 'trial',
  ADD COLUMN "subscriptionProductId" TEXT,
  ADD COLUMN "subscriptionActiveUntil" TIMESTAMP(3),
  ADD COLUMN "noorOverageBalance" INTEGER NOT NULL DEFAULT 0;
