import { prisma } from "../../lib/prisma";
import DashboardClient, { DashboardChapter } from "./DashboardClient";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const chapters = await prisma.chapter.findMany({
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
  });

  const serializedChapters = chapters.map((chapter) => ({
    ...chapter,
    lessons: chapter.lessons.map((lesson) => ({
      ...lesson,
      updatedAt: lesson.updatedAt.toISOString(),
    })),
  }));

  return <DashboardClient initialChapters={serializedChapters as DashboardChapter[]} />;
}
