-- AlterTable
ALTER TABLE "User" ADD COLUMN     "lastPurchaseToken" TEXT,
ALTER COLUMN "trialExpiresAt" SET DEFAULT now() + interval '7 days';
