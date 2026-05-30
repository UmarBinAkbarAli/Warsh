CREATE TABLE "VocabularyWord" (
    "id" TEXT NOT NULL,
    "arabic" TEXT NOT NULL,
    "arabicPlain" TEXT NOT NULL,
    "transliteration" TEXT NOT NULL,
    "translationEn" TEXT NOT NULL,
    "translationUr" TEXT NOT NULL,
    "wordType" TEXT NOT NULL,
    "gender" TEXT,
    "pluralForm" TEXT,
    "rootLetters" TEXT,
    "topicCategories" TEXT[],
    "chapterIntroduced" INTEGER NOT NULL DEFAULT 1,
    "frequencyInQuran" INTEGER,
    "quranicExample" JSONB,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VocabularyWord_pkey" PRIMARY KEY ("id")
);
