import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";
import { getUserIdFromRequest } from "../../../lib/auth";

export async function GET(request: Request) {
  const userId = getUserIdFromRequest(request);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized", code: "unauthorized" }, { status: 401 });
  }

  const completedProgress = await prisma.progress.findMany({
    where: { userId, completed: true },
    include: { lesson: { select: { chapterId: true } } }
  });

  const completedLessonIds = new Set(completedProgress.map((item: any) => item.lessonId));
  const completedChapterIds = new Set(completedProgress.map((item: any) => item.lesson.chapterId));

  const chapters = await prisma.chapter.findMany({
    orderBy: { order: "asc" },
    include: {
      lessons: {
        orderBy: { order: "asc" },
        select: { id: true, title: true, type: true, xpReward: true }
      }
    }
  });

  const chapterList = chapters.map((chapter: any) => {
    const previousChapterOrder = chapter.order - 1;
    const previousChapterCompleted = chapter.order === 1 || chapters.some((candidate: any) => candidate.order === previousChapterOrder && completedChapterIds.has(candidate.id));
    return {
      ...chapter,
      isLocked: !previousChapterCompleted,
      lessons: chapter.lessons.map((lesson: any) => ({
        ...lesson,
        isCompleted: completedLessonIds.has(lesson.id)
      }))
    };
  });

  return NextResponse.json({ data: { chapters: chapterList } });
}
