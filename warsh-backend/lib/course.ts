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
    addedAt?: Date | null;
    contentUpdatedAt?: Date | null;
  }[];
};

export type ChapterState = {
  id: string;
  order: number;
  isLocked: boolean;
  isCompleted: boolean;
  isSkippedByPlacement: boolean;
  /**
   * Nothing in this chapter holds the learner back: every lesson is completed
   * or skipped, or the only ones left were added after they finished it.
   */
  isSatisfied: boolean;
  completedLessonCount: number;
  skippedLessonCount: number;
  lessonCount: number;
  /** Lessons published into the chapter after the learner had finished it. */
  addedAfterFinishLessonIds: string[];
};

type ProgressStatusByLessonId = Map<string, string>;
/** When each satisfied lesson was finished (completedAt, else row creation). */
type FinishedAtByLessonId = Map<string, Date>;

type ProgressRow = {
  lessonId: string;
  status: string | null;
  completed: boolean;
  completedAt?: Date | null;
  createdAt?: Date | null;
};

const isDone = (status: string | undefined) =>
  status === PROGRESS_STATUS.COMPLETED || status === PROGRESS_STATUS.SKIPPED_BY_PLACEMENT;

/**
 * Lessons published into a chapter after the learner finished it must never
 * re-lock the chapters after it (owner rule, 2026-09-23). The chapter stays
 * honestly incomplete (8/9) and the new lesson stays open to them, but it does
 * not block progression.
 *
 * "Finished" is read from the learner's own rows: the chapter's latest finish
 * time is when their last lesson there was done. If every lesson still
 * outstanding went live (`addedAt`) after that moment, then every lesson that
 * existed at that moment was done, so the chapter was complete then. Lessons
 * with no `addedAt` predate the rule and always count as part of the chapter,
 * which keeps mid-chapter learners exactly where they are.
 */
export function findLessonsAddedAfterFinish(
  lessons: ChapterWithLessons["lessons"],
  progressStatusByLessonId: ProgressStatusByLessonId,
  finishedAtByLessonId: FinishedAtByLessonId,
) {
  let finishedAt: number | null = null;
  const outstanding: ChapterWithLessons["lessons"] = [];
  for (const lesson of lessons) {
    if (isDone(progressStatusByLessonId.get(lesson.id))) {
      const at = finishedAtByLessonId.get(lesson.id)?.getTime();
      if (at !== undefined && (finishedAt === null || at > finishedAt)) finishedAt = at;
    } else {
      outstanding.push(lesson);
    }
  }
  if (outstanding.length === 0 || finishedAt === null) return [];
  const finish = finishedAt;
  const allLate = outstanding.every((lesson) => lesson.addedAt != null && lesson.addedAt.getTime() > finish);
  return allLate ? outstanding.map((lesson) => lesson.id) : [];
}

export function buildChapterStates(
  chapters: ChapterWithLessons[],
  progressStatusByLessonId: ProgressStatusByLessonId,
  finishedAtByLessonId: FinishedAtByLessonId = new Map(),
) {
  let allPreviousChaptersSatisfied = true;

  return chapters.map((chapter) => {
    const completedLessonCount = chapter.lessons.filter((lesson) => progressStatusByLessonId.get(lesson.id) === PROGRESS_STATUS.COMPLETED).length;
    const skippedLessonCount = chapter.lessons.filter((lesson) => progressStatusByLessonId.get(lesson.id) === PROGRESS_STATUS.SKIPPED_BY_PLACEMENT).length;
    const isCompleted = chapter.lessons.length > 0 && completedLessonCount === chapter.lessons.length;
    const isSkippedByPlacement = chapter.lessons.length > 0 && skippedLessonCount === chapter.lessons.length;
    const addedAfterFinishLessonIds = findLessonsAddedAfterFinish(chapter.lessons, progressStatusByLessonId, finishedAtByLessonId);
    const isSatisfiedForProgression =
      chapter.lessons.length > 0 &&
      (completedLessonCount + skippedLessonCount === chapter.lessons.length || addedAfterFinishLessonIds.length > 0);
    const state: ChapterState = {
      id: chapter.id,
      order: chapter.order,
      isLocked: DEV_UNLOCK_ALL ? false : !allPreviousChaptersSatisfied,
      isCompleted,
      isSkippedByPlacement,
      isSatisfied: isSatisfiedForProgression,
      completedLessonCount,
      skippedLessonCount,
      lessonCount: chapter.lessons.length,
      addedAfterFinishLessonIds,
    };

    allPreviousChaptersSatisfied = allPreviousChaptersSatisfied && isSatisfiedForProgression;
    return state;
  });
}

export async function getUserCourseState(userId: string) {
  const [chapters, progressRows] = (await Promise.all([
    prisma.chapter.findMany({
      // Only PUBLISHED chapters/lessons reach the learner app; drafts stay
      // hidden until an admin publishes them.
      where: { status: "PUBLISHED" },
      orderBy: { order: "asc" },
      include: {
        lessons: {
          where: { status: "PUBLISHED" },
          orderBy: { order: "asc" },
          select: {
            id: true,
            title: true,
            titleUr: true,
            titleAr: true,
            template: true,
            xpReward: true,
            addedAt: true,
            contentUpdatedAt: true,
          },
        },
      },
    }),
    prisma.progress.findMany({
      where: { userId },
      select: { lessonId: true, status: true, completed: true, completedAt: true, createdAt: true },
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
  const finishedAtByLessonId: FinishedAtByLessonId = new Map();
  for (const row of progressRows) {
    const at = row.completedAt ?? row.createdAt;
    if (at) finishedAtByLessonId.set(row.lessonId, at);
  }
  const chapterStates = buildChapterStates(chapters, progressStatusByLessonId, finishedAtByLessonId);

  const chapterStateById = new Map(chapterStates.map((chapterState) => [chapterState.id, chapterState]));

  return {
    chapters,
    chapterStates,
    chapterStateById,
    completedLessonIds,
    skippedLessonIds,
    progressStatusByLessonId,
    finishedAtByLessonId,
  };
}
