CREATE TABLE "Core500AyahExample" (
  "id" TEXT NOT NULL, "wordId" TEXT NOT NULL, "position" INTEGER NOT NULL,
  "surahNumber" INTEGER NOT NULL, "ayahNumber" INTEGER NOT NULL, "surahName" TEXT NOT NULL,
  "arabic" TEXT NOT NULL, "translationEn" TEXT NOT NULL, "translationUr" TEXT NOT NULL,
  "wordPosition" INTEGER NOT NULL, "corpusPosition" INTEGER NOT NULL, "surface" TEXT NOT NULL, "matchKind" TEXT NOT NULL,
  "source" TEXT NOT NULL, "status" "ContentStatus" NOT NULL DEFAULT 'DRAFT', "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Core500AyahExample_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "Core500AyahExample_positions_check" CHECK ("position" BETWEEN 1 AND 3 AND "surahNumber" BETWEEN 1 AND 114 AND "ayahNumber" > 0 AND "wordPosition" > 0)
);
CREATE UNIQUE INDEX "Core500AyahExample_wordId_position_key" ON "Core500AyahExample"("wordId", "position");
CREATE UNIQUE INDEX "Core500AyahExample_wordId_surahNumber_ayahNumber_key" ON "Core500AyahExample"("wordId", "surahNumber", "ayahNumber");
ALTER TABLE "Core500AyahExample" ADD CONSTRAINT "Core500AyahExample_wordId_fkey" FOREIGN KEY ("wordId") REFERENCES "VocabularyWord"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "Core500Assessment" (
  "id" TEXT NOT NULL, "userId" TEXT NOT NULL, "setNumber" INTEGER NOT NULL, "language" TEXT NOT NULL,
  "phase" TEXT NOT NULL DEFAULT 'INTRO', "questions" JSONB NOT NULL, "activeIds" TEXT[] NOT NULL,
  "passedIds" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[], "answers" JSONB NOT NULL DEFAULT '{}', "round" INTEGER NOT NULL DEFAULT 1,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Core500Assessment_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "Core500Assessment_set_check" CHECK ("setNumber" BETWEEN 1 AND 100 AND "round" > 0 AND "language" IN ('en', 'ur') AND "phase" IN ('INTRO', 'QUIZ', 'REVIEW', 'COMPLETE'))
);
CREATE UNIQUE INDEX "Core500Assessment_userId_setNumber_key" ON "Core500Assessment"("userId", "setNumber");
ALTER TABLE "Core500Assessment" ADD CONSTRAINT "Core500Assessment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
