import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "../../../lib/prisma";
import { ADMIN_COOKIE_NAME, verifyAdminCookieValue } from "../../../lib/admin";
import DashboardClient, { DashboardChapter, PromoCodeStat } from "../DashboardClient";

export const dynamic = "force-dynamic";

export default async function CurriculumPage() {
  if (!verifyAdminCookieValue(cookies().get(ADMIN_COOKIE_NAME)?.value)) {
    redirect("/dashboard/login");
  }

  const [chapters, promoCodes, sizes, openIssues] = await Promise.all([
    prisma.chapter.findMany({
      orderBy: { order: "asc" },
      include: {
        lessons: {
          orderBy: { order: "asc" },
          // Lesson `content` is intentionally omitted here — it is loaded lazily
          // per-lesson via GET /api/admin/lessons/[id] when a lesson is opened.
          // Fetching all lessons' content up front made this page multi-second.
          select: {
            id: true,
            order: true,
            title: true,
            titleAr: true,
            template: true,
            xpReward: true,
            updatedAt: true,
            status: true,
          },
        },
      },
    }),
    prisma.promoCode.findMany({
      orderBy: { createdAt: "asc" },
      select: {
        code: true,
        freeDays: true,
        maxRedemptions: true,
        redemptionCount: true,
        active: true,
      },
    }),
    prisma.$queryRaw<{ id: string; cards: number; exercises: number }[]>`
      SELECT "id",
        CASE WHEN jsonb_typeof("content"->'discover_cards') = 'array'
          THEN jsonb_array_length("content"->'discover_cards') ELSE 0 END AS "cards",
        CASE WHEN jsonb_typeof("content"->'exercises') = 'array'
          THEN jsonb_array_length("content"->'exercises') ELSE 0 END AS "exercises"
      FROM "Lesson"`,
    prisma.contentReviewIssue.groupBy({
      by: ["reviewId"],
      where: { status: "OPEN" },
      _count: { _all: true },
    }),
  ]);

  const reviewOwners = await prisma.lessonContentReview.findMany({
    where: { id: { in: openIssues.map((i) => i.reviewId) } },
    select: { id: true, lessonId: true },
  });
  const issuesByReview = new Map(openIssues.map((i) => [i.reviewId, i._count._all]));
  const issuesByLesson = new Map(
    reviewOwners.map((r) => [r.lessonId, issuesByReview.get(r.id) ?? 0]),
  );
  const sizeByLesson = new Map(sizes.map((r) => [r.id, r]));

  const serializedChapters = chapters.map((chapter) => ({
    ...chapter,
    lessons: chapter.lessons.map((lesson) => ({
      ...lesson,
      updatedAt: lesson.updatedAt.toISOString(),
      cardCount: Number(sizeByLesson.get(lesson.id)?.cards ?? 0),
      exerciseCount: Number(sizeByLesson.get(lesson.id)?.exercises ?? 0),
      openIssues: issuesByLesson.get(lesson.id) ?? 0,
    })),
  }));

  return (
    <DashboardClient
      initialChapters={serializedChapters as DashboardChapter[]}
      promoCodes={promoCodes as PromoCodeStat[]}
    />
  );
}
