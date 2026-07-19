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

  const [chapters, promoCodes] = await Promise.all([
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
  ]);

  const serializedChapters = chapters.map((chapter) => ({
    ...chapter,
    lessons: chapter.lessons.map((lesson) => ({
      ...lesson,
      updatedAt: lesson.updatedAt.toISOString(),
    })),
  }));

  return (
    <DashboardClient
      initialChapters={serializedChapters as DashboardChapter[]}
      promoCodes={promoCodes as PromoCodeStat[]}
    />
  );
}
