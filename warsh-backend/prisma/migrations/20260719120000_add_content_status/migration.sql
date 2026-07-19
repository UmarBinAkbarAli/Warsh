-- CreateEnum
CREATE TYPE "ContentStatus" AS ENUM ('DRAFT', 'PUBLISHED');

-- AlterTable
ALTER TABLE "Chapter" ADD COLUMN     "status" "ContentStatus" NOT NULL DEFAULT 'DRAFT',
ADD COLUMN     "publishedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Lesson" ADD COLUMN     "status" "ContentStatus" NOT NULL DEFAULT 'DRAFT',
ADD COLUMN     "publishedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "VocabularyWord" ADD COLUMN     "status" "ContentStatus" NOT NULL DEFAULT 'DRAFT',
ADD COLUMN     "publishedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "TadabburSurah" ADD COLUMN     "status" "ContentStatus" NOT NULL DEFAULT 'DRAFT',
ADD COLUMN     "publishedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Achievement" ADD COLUMN     "status" "ContentStatus" NOT NULL DEFAULT 'DRAFT',
ADD COLUMN     "publishedAt" TIMESTAMP(3);

-- Backfill: all pre-existing content is already live to learners, so mark it
-- PUBLISHED. Only content authored after this migration starts as DRAFT.
UPDATE "Chapter" SET "status" = 'PUBLISHED', "publishedAt" = CURRENT_TIMESTAMP;
UPDATE "Lesson" SET "status" = 'PUBLISHED', "publishedAt" = CURRENT_TIMESTAMP;
UPDATE "VocabularyWord" SET "status" = 'PUBLISHED', "publishedAt" = CURRENT_TIMESTAMP;
UPDATE "TadabburSurah" SET "status" = 'PUBLISHED', "publishedAt" = CURRENT_TIMESTAMP;
UPDATE "Achievement" SET "status" = 'PUBLISHED', "publishedAt" = CURRENT_TIMESTAMP;
