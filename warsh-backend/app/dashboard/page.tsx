import { prisma } from "../../lib/prisma";
import DashboardClient, { DashboardChapter, PromoCodeStat } from "./DashboardClient";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const [chapters, promoCodes] = await Promise.all([
    prisma.chapter.findMany({
      orderBy: { order: "asc" },
      include: {
        lessons: {
          orderBy: { order: "asc" },
          select: {
            id: true,
            order: true,
            title: true,
            titleAr: true,
            template: true,
            xpReward: true,
            updatedAt: true,
            content: true,
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
