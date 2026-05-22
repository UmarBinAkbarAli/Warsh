-- Migration: content-schema-v2
-- Replace split lesson columns with single content Json blob.
-- Replace LessonType enum with LessonTemplate enum.

-- 1. Create new enum
CREATE TYPE "LessonTemplate" AS ENUM ('STANDARD', 'SPOKEN_PHRASES', 'REVIEW', 'VERB_PATTERN');

-- 2. Add template column; default STANDARD so existing rows get a valid value
ALTER TABLE "Lesson" ADD COLUMN "template" "LessonTemplate" NOT NULL DEFAULT 'STANDARD';

-- 3. Map SPOKEN_PHRASES rows from the old type column to the new template column
UPDATE "Lesson" SET "template" = 'SPOKEN_PHRASES' WHERE "type" = 'SPOKEN_PHRASES';

-- 4. Remove the default now that rows are populated
ALTER TABLE "Lesson" ALTER COLUMN "template" DROP DEFAULT;

-- 5. Drop old type column (which depended on LessonType enum)
ALTER TABLE "Lesson" DROP COLUMN "type";

-- 6. Drop old enum
DROP TYPE "LessonType";

-- 7. Drop the split content columns
ALTER TABLE "Lesson" DROP COLUMN IF EXISTS "hook";
ALTER TABLE "Lesson" DROP COLUMN IF EXISTS "discoverCards";
ALTER TABLE "Lesson" DROP COLUMN IF EXISTS "exercises";
ALTER TABLE "Lesson" DROP COLUMN IF EXISTS "revealText";
ALTER TABLE "Lesson" DROP COLUMN IF EXISTS "revealAyah";
ALTER TABLE "Lesson" DROP COLUMN IF EXISTS "fatihaProgressDelta";
