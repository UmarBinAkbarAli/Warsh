-- AlterTable
ALTER TABLE "User" ALTER COLUMN "trialExpiresAt" SET DEFAULT now() + interval '7 days';

-- AlterTable
ALTER TABLE "VocabularyWord" ADD COLUMN     "imageUrl" TEXT;
