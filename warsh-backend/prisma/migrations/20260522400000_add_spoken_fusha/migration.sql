-- Add phrasesSpoken counter to User
ALTER TABLE "User" ADD COLUMN "phrasesSpoken" INTEGER NOT NULL DEFAULT 0;

-- Add SPOKEN_PHRASES to LessonType enum
ALTER TYPE "LessonType" ADD VALUE 'SPOKEN_PHRASES';
