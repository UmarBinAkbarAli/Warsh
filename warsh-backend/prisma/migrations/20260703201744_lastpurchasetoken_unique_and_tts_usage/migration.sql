-- AlterTable
ALTER TABLE "User" ADD COLUMN     "ttsUsageCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "ttsUsageResetAt" TIMESTAMP(3),
ALTER COLUMN "trialExpiresAt" SET DEFAULT now() + interval '7 days';

-- CreateIndex
CREATE UNIQUE INDEX "User_lastPurchaseToken_key" ON "User"("lastPurchaseToken");

