-- AlterTable
ALTER TABLE "Chapter" ADD COLUMN     "descriptionUr" TEXT,
ADD COLUMN     "titleUr" TEXT;

-- AlterTable
ALTER TABLE "Lesson" ADD COLUMN     "titleUr" TEXT;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "trialExpiresAt" SET DEFAULT now() + interval '7 days';
