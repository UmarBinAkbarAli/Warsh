-- AlterTable
ALTER TABLE "User"
ADD COLUMN "startingChapterOrder" INTEGER,
ADD COLUMN "placementType" TEXT;

-- AlterTable
ALTER TABLE "Progress"
ADD COLUMN "status" TEXT NOT NULL DEFAULT 'NOT_STARTED';

-- Backfill completed progress so existing completions remain explicit.
UPDATE "Progress"
SET "status" = 'COMPLETED'
WHERE "completed" = true;
