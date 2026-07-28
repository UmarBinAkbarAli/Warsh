import { NextResponse } from "next/server";
import { getAdminReadError } from "../../../../lib/admin";
import { prisma } from "../../../../lib/prisma";

export const dynamic = "force-dynamic";

// GET /api/admin/content-review — lightweight curriculum and review-state index.
// Full lesson JSON is intentionally loaded only when a reviewer opens a lesson.
export async function GET(request: Request) {
  const readError = getAdminReadError(request);
  if (readError) return readError;

  const chapters = await prisma.chapter.findMany({
    orderBy: { order: "asc" },
    select: {
      id: true,
      order: true,
      title: true,
      titleUr: true,
      titleAr: true,
      imageUrl: true,
      status: true,
      lessons: {
        orderBy: { order: "asc" },
        select: {
          id: true,
          order: true,
          title: true,
          titleUr: true,
          titleAr: true,
          template: true,
          status: true,
          updatedAt: true,
          contentReview: {
            select: {
              status: true,
              reviewedAt: true,
              _count: {
                select: {
                  issues: { where: { status: "OPEN" } },
                },
              },
            },
          },
        },
      },
    },
  });

  let totalLessons = 0;
  let approvedLessons = 0;
  let needsCorrection = 0;
  let openIssues = 0;

  const serialized = chapters.map((chapter) => ({
    ...chapter,
    lessons: chapter.lessons.map((lesson) => {
      totalLessons += 1;
      const reviewStatus = lesson.contentReview?.status ?? "NOT_REVIEWED";
      const lessonOpenIssues = lesson.contentReview?._count.issues ?? 0;
      if (reviewStatus === "APPROVED") approvedLessons += 1;
      if (reviewStatus === "NEEDS_CORRECTION") needsCorrection += 1;
      openIssues += lessonOpenIssues;

      return {
        ...lesson,
        updatedAt: lesson.updatedAt.toISOString(),
        review: {
          status: reviewStatus,
          reviewedAt: lesson.contentReview?.reviewedAt?.toISOString() ?? null,
          openIssueCount: lessonOpenIssues,
        },
        contentReview: undefined,
      };
    }),
  }));

  return NextResponse.json({
    data: {
      summary: {
        totalChapters: chapters.length,
        totalLessons,
        approvedLessons,
        needsCorrection,
        notReviewed: totalLessons - approvedLessons - needsCorrection,
        openIssues,
      },
      chapters: serialized,
    },
  });
}
