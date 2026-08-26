-- AlterTable
ALTER TABLE "User" ADD COLUMN     "streakGoalDays" INTEGER,
ALTER COLUMN "trialExpiresAt" SET DEFAULT now() + interval '7 days';
