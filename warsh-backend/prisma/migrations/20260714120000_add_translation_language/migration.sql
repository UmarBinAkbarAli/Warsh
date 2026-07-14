-- Add translationLanguage as a separate preference from nativeLanguage.
-- Existing users must keep their current effective language, so we backfill
-- from nativeLanguage BEFORE making the column required. A naive
-- `ADD COLUMN ... NOT NULL DEFAULT 'ur'` would silently switch every existing
-- English user to Urdu, which is why this is done in explicit steps.

-- 1. Add the column as nullable so no default is forced onto existing rows.
ALTER TABLE "User" ADD COLUMN "translationLanguage" TEXT;

-- 2. Backfill every existing user from their current nativeLanguage.
UPDATE "User" SET "translationLanguage" = "nativeLanguage" WHERE "translationLanguage" IS NULL;

-- 3. Now that all rows have a value, enforce NOT NULL and set the default that
--    matches the Prisma schema (used only when a client omits the field).
ALTER TABLE "User" ALTER COLUMN "translationLanguage" SET NOT NULL;
ALTER TABLE "User" ALTER COLUMN "translationLanguage" SET DEFAULT 'ur';
