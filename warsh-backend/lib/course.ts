import { prisma } from "./prisma";

export const PROGRESS_STATUS = {
  NOT_STARTED: "NOT_STARTED",
  COMPLETED: "COMPLETED",
  SKIPPED_BY_PLACEMENT: "SKIPPED_BY_PLACEMENT",
} as const;
export const DEV_UNLOCK_ALL =
  process.env.NODE_ENV !== "production" && process.env.DEV_UNLOCK_ALL === "true";

type ChapterWithLessons = {
  id: string;
  order: number;
  title: string;
  titleUr: string | null;
  titleAr: string;
  description: string;
  descriptionUr: string | null;
  worldMapX: number;
  worldMapY: number;
  lessons: {
    id: string;
    title: string;
    titleUr: string | null;
    titleAr: string;
    template: string;
    xpReward: number;
  }[];
};

export type ChapterState = {
  id: string;
  order: number;
  isLocked: boolean;
  isCompleted: boolean;
  isSkippedByPlacement: boolean;
  completedLessonCount: number;
  skippedLessonCount: number;
  lessonCount: number;
};

type ProgressStatusByLessonId = Map<string, string>;

type ProgressRow = {
  lessonId: string;
  status: string | null;
  completed: boolean;
};

export function buildChapterStates(chapters: ChapterWithLessons[], progressStatusByLessonId: ProgressStatusByLessonId) {
  let allPreviousChaptersSatisfied = true;

  return chapters.map((chapter) => {
    const completedLessonCount = chapter.lessons.filter((lesson) => progressStatusByLessonId.get(lesson.id) === PROGRESS_STATUS.COMPLETED).length;
    const skippedLessonCount = chapter.lessons.filter((lesson) => progressStatusByLessonId.get(lesson.id) === PROGRESS_STATUS.SKIPPED_BY_PLACEMENT).length;
    const isCompleted = chapter.lessons.length > 0 && completedLessonCount === chapter.lessons.length;
    const isSkippedByPlacement = chapter.lessons.length > 0 && skippedLessonCount === chapter.lessons.length;
    const isSatisfiedForProgression = chapter.lessons.length > 0 && completedLessonCount + skippedLessonCount === chapter.lessons.length;
    const state: ChapterState = {
      id: chapter.id,
      order: chapter.order,
      isLocked: DEV_UNLOCK_ALL ? false : !allPreviousChaptersSatisfied,
      isCompleted,
      isSkippedByPlacement,
      completedLessonCount,
      skippedLessonCount,
      lessonCount: chapter.lessons.length,
    };

    allPreviousChaptersSatisfied = allPreviousChaptersSatisfied && isSatisfiedForProgression;
    return state;
  });
}

export async function getUserCourseState(userId: string) {
  const [chapters, progressRows] = (await Promise.all([
    prisma.chapter.findMany({
      orderBy: { order: "asc" },
      include: {
        lessons: {
          orderBy: { order: "asc" },
          select: { id: true, title: true, titleUr: true, titleAr: true, template: true, xpReward: true },
        },
      },
    }),
    prisma.progress.findMany({
      where: { userId },
      select: { lessonId: true, status: true, completed: true },
    }),
  ])) as unknown as [ChapterWithLessons[], ProgressRow[]];

  const progressStatusByLessonId = new Map(
    progressRows.map((item) => [
      item.lessonId,
      item.status || (item.completed ? PROGRESS_STATUS.COMPLETED : PROGRESS_STATUS.NOT_STARTED),
    ])
  );
  const completedLessonIds = new Set(
    progressRows
      .filter((item) => (item.status || (item.completed ? PROGRESS_STATUS.COMPLETED : PROGRESS_STATUS.NOT_STARTED)) === PROGRESS_STATUS.COMPLETED)
      .map((item) => item.lessonId)
  );
  const skippedLessonIds = new Set(
    progressRows
      .filter((item) => item.status === PROGRESS_STATUS.SKIPPED_BY_PLACEMENT)
      .map((item) => item.lessonId)
  );
  const chapterStates = buildChapterStates(chapters, progressStatusByLessonId);

  const chapterStateById = new Map(chapterStates.map((chapterState) => [chapterState.id, chapterState]));

  return {
    chapters,
    chapterStates,
    chapterStateById,
    completedLessonIds,
    skippedLessonIds,
    progressStatusByLessonId,
  };
}
