-- Quranic Core 500: rank/set tagging on vocabulary, plus per-user set progress.
-- Existing vocabulary rows keep quranicRank NULL; only the 500 get a rank.

-- AlterTable
ALTER TABLE "VocabularyWord" ADD COLUMN     "coreSetNumber" INTEGER,
ADD COLUMN     "isCorePrefix" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "quranicRank" INTEGER;

-- CreateTable
CREATE TABLE "UserCoreSetProgress" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "setNumber" INTEGER NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserCoreSetProgress_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "UserCoreSetProgress_userId_idx" ON "UserCoreSetProgress"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "UserCoreSetProgress_userId_setNumber_key" ON "UserCoreSetProgress"("userId", "setNumber");

-- CreateIndex
CREATE UNIQUE INDEX "VocabularyWord_quranicRank_key" ON "VocabularyWord"("quranicRank");

-- CreateIndex
CREATE INDEX "VocabularyWord_coreSetNumber_idx" ON "VocabularyWord"("coreSetNumber");

-- AddForeignKey
ALTER TABLE "UserCoreSetProgress" ADD CONSTRAINT "UserCoreSetProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
