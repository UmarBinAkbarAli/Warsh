-- CreateEnum
CREATE TYPE "LessonReviewStatus" AS ENUM ('NOT_REVIEWED', 'NEEDS_CORRECTION', 'APPROVED');

-- CreateEnum
CREATE TYPE "ContentIssueStatus" AS ENUM ('OPEN', 'RESOLVED', 'DISMISSED');

-- CreateTable
CREATE TABLE "LessonContentReview" (
    "id" TEXT NOT NULL,
    "lessonId" TEXT NOT NULL,
    "status" "LessonReviewStatus" NOT NULL DEFAULT 'NOT_REVIEWED',
    "reviewerNote" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LessonContentReview_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContentReviewIssue" (
    "id" TEXT NOT NULL,
    "reviewId" TEXT NOT NULL,
    "blockPath" TEXT NOT NULL,
    "blockLabel" TEXT NOT NULL,
    "issueType" TEXT NOT NULL,
    "note" TEXT NOT NULL,
    "mediaUrl" TEXT,
    "status" "ContentIssueStatus" NOT NULL DEFAULT 'OPEN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "resolvedAt" TIMESTAMP(3),

    CONSTRAINT "ContentReviewIssue_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "LessonContentReview_lessonId_key" ON "LessonContentReview"("lessonId");

-- CreateIndex
CREATE INDEX "LessonContentReview_status_idx" ON "LessonContentReview"("status");

-- CreateIndex
CREATE INDEX "ContentReviewIssue_reviewId_status_idx" ON "ContentReviewIssue"("reviewId", "status");

-- AddForeignKey
ALTER TABLE "LessonContentReview" ADD CONSTRAINT "LessonContentReview_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "Lesson"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContentReviewIssue" ADD CONSTRAINT "ContentReviewIssue_reviewId_fkey" FOREIGN KEY ("reviewId") REFERENCES "LessonContentReview"("id") ON DELETE CASCADE ON UPDATE CASCADE;
