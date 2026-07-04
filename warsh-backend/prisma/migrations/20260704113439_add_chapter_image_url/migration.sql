-- AlterTable
ALTER TABLE "Chapter" ADD COLUMN     "imageUrl" TEXT;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "trialExpiresAt" SET DEFAULT now() + interval '7 days';
