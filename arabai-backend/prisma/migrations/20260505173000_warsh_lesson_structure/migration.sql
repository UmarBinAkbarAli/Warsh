-- Add Warsh 5-beat lesson structure support to Lesson
ALTER TABLE "Lesson"
ADD COLUMN "hook" JSONB,
ADD COLUMN "discoverCards" JSONB,
ADD COLUMN "exercises" JSONB,
ADD COLUMN "revealText" TEXT,
ADD COLUMN "revealAyah" JSONB,
ADD COLUMN "fatihaProgressDelta" INTEGER NOT NULL DEFAULT 0;

ALTER TABLE "Lesson"
ADD CONSTRAINT "Lesson_fatihaProgressDelta_check"
CHECK ("fatihaProgressDelta" >= 0 AND "fatihaProgressDelta" <= 10);
