-- CreateTable
CREATE TABLE "UserVocabularyWord" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "wordId" TEXT NOT NULL,
    "easeFactor" DOUBLE PRECISION NOT NULL DEFAULT 2.5,
    "intervalDays" INTEGER NOT NULL DEFAULT 1,
    "repetitions" INTEGER NOT NULL DEFAULT 0,
    "nextReviewDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastReviewQuality" INTEGER NOT NULL DEFAULT 0,
    "isFavorite" BOOLEAN NOT NULL DEFAULT false,
    "isHidden" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserVocabularyWord_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserVocabularyWord_userId_wordId_key" ON "UserVocabularyWord"("userId", "wordId");

-- AddForeignKey
ALTER TABLE "UserVocabularyWord" ADD CONSTRAINT "UserVocabularyWord_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserVocabularyWord" ADD CONSTRAINT "UserVocabularyWord_wordId_fkey" FOREIGN KEY ("wordId") REFERENCES "VocabularyWord"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
