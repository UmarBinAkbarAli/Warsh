-- "New / updated lesson" notices and non-blocking lessons added to a chapter
-- a learner had already finished.

-- AlterTable
ALTER TABLE "User" ADD COLUMN "lessonNoticesSeenAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Lesson" ADD COLUMN "addedAt" TIMESTAMP(3),
ADD COLUMN "contentUpdatedAt" TIMESTAMP(3);

-- Stamp both columns in the database so every writer (Warsh Studio, promote
-- scripts, content:sync, the seed) sets them without having to remember.
-- `addedAt` is the first time a lesson goes live; `contentUpdatedAt` is the
-- last change to `content` while it is live. Existing lessons keep NULL
-- `addedAt`, which lib/course.ts reads as "part of the chapter all along".
CREATE OR REPLACE FUNCTION warsh_lesson_notice_stamps() RETURNS trigger AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW."status" = 'PUBLISHED' AND NEW."addedAt" IS NULL THEN
      NEW."addedAt" := COALESCE(NEW."publishedAt", timezone('UTC', now()));
    END IF;
  ELSE
    IF NEW."status" = 'PUBLISHED' AND OLD."status" IS DISTINCT FROM 'PUBLISHED'
       AND NEW."addedAt" IS NULL THEN
      NEW."addedAt" := timezone('UTC', now());
    END IF;
    IF NEW."status" = 'PUBLISHED' AND OLD."status" = 'PUBLISHED'
       AND NEW."content" IS DISTINCT FROM OLD."content" THEN
      NEW."contentUpdatedAt" := timezone('UTC', now());
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER "Lesson_notice_stamps"
BEFORE INSERT OR UPDATE ON "Lesson"
FOR EACH ROW EXECUTE FUNCTION warsh_lesson_notice_stamps();

-- Conversation Labs published on 2026-09-23, before this migration: the new
-- lab rows are announced as new, and the two labs rebuilt in place as updated.
UPDATE "Lesson" SET "addedAt" = COALESCE("publishedAt", timezone('UTC', now()))
WHERE "id" IN ('ch05-cl07', 'ch09-cl05', 'ch10-cl06', 'ch11-cl06') AND "status" = 'PUBLISHED';

UPDATE "Lesson" SET "contentUpdatedAt" = "updatedAt"
WHERE "id" IN ('ch03-l05', 'ch07-l05') AND "status" = 'PUBLISHED';
