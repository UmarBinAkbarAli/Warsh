import { prisma } from "./prisma";

type ChapterWithLessons = {
  id: string;
  order: number;
  title: string;
  titleAr: string;
  description: string;
  worldMapX: number;
  worldMapY: number;
  lessons: {
    id: string;
    title: string;
    titleAr: string;
    type: string;
    xpReward: number;
  }[];
};

export type ChapterState = {
  id: string;
  order: number;
  isLocked: boolean;
  isCompleted: boolean;
  completedLessonCount: number;
  lessonCount: number;
};

export function buildChapterStates(chapters: ChapterWithLessons[], completedLessonIds: Set<string>) {
  let allPreviousChaptersCompleted = true;

  return chapters.map((chapter) => {
    const completedLessonCount = chapter.lessons.filter((lesson) => completedLessonIds.has(lesson.id)).length;
    const isCompleted = chapter.lessons.length > 0 && completedLessonCount === chapter.lessons.length;
    const state: ChapterState = {
      id: chapter.id,
      order: chapter.order,
      isLocked: !allPreviousChaptersCompleted,
      isCompleted,
      completedLessonCount,
      lessonCount: chapter.lessons.length,
    };

    allPreviousChaptersCompleted = allPreviousChaptersCompleted && isCompleted;
    return state;
  });
}

export async function getUserCourseState(userId: string) {
  const [chapters, completedProgress] = await Promise.all([
    prisma.chapter.findMany({
      orderBy: { order: "asc" },
      include: {
        lessons: {
          orderBy: { order: "asc" },
          select: { id: true, title: true, titleAr: true, type: true, xpReward: true },
        },
      },
    }),
    prisma.progress.findMany({
      where: { userId, completed: true },
      select: { lessonId: true },
    }),
  ]);

  const completedLessonIds = new Set(completedProgress.map((item) => item.lessonId));
  const chapterStates = buildChapterStates(chapters as ChapterWithLessons[], completedLessonIds);

  const chapterStateById = new Map(chapterStates.map((chapterState) => [chapterState.id, chapterState]));

  return {
    chapters: chapters as ChapterWithLessons[],
    chapterStates,
    chapterStateById,
    completedLessonIds,
  };
}
