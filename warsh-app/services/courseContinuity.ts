/**
 * Detects a learner whose map collapsed because new lessons were published
 * into a chapter they had already finished.
 *
 * Chapter progression is recomputed live on every request from the user's
 * progress rows (`warsh-backend/lib/course.ts`): a chapter is satisfied only
 * when every *currently published* lesson in it is completed or skipped, and
 * the first unsatisfied chapter locks every chapter after it. So publishing a
 * ninth lesson into a chapter a user finished at eight drops them from 8/8 to
 * 8/9 and re-locks everything beyond it — without deleting a single row.
 *
 * That is exactly the shape we look for here, and it needs no new endpoint or
 * bookkeeping table: a user who has completed lessons *past* the first
 * unsatisfied chapter can only have got there while that chapter was
 * satisfied. Normal forward progress never produces it.
 *
 * The signal is self-clearing. Finishing the added lesson satisfies the
 * chapter again, and the condition simply stops being true.
 */

export type ContinuityLesson = {
  id: string;
  isCompleted: boolean;
  isSkippedByPlacement: boolean;
};

export type ContinuityChapter = {
  id: string;
  order: number;
  title: string;
  titleUr?: string | null;
  completedLessonCount: number;
  lessons: ContinuityLesson[];
};

export type CourseContinuityBreak = {
  chapterId: string;
  chapterOrder: number;
  chapterTitle: string;
  chapterTitleUr?: string | null;
  /** Lessons published into this chapter after the learner passed it. */
  newLessonCount: number;
  /** Total published lessons in the chapter now. */
  lessonCount: number;
  /** Where to send them: the first lesson they have not finished. */
  resumeLessonId: string | null;
  /** How many later chapters they had already worked through. */
  chaptersAheadCount: number;
};

function isSatisfied(chapter: ContinuityChapter) {
  if (chapter.lessons.length === 0) return true;
  return chapter.lessons.every(
    (lesson) => lesson.isCompleted || lesson.isSkippedByPlacement,
  );
}

function hasAnyProgress(chapter: ContinuityChapter) {
  return chapter.lessons.some(
    (lesson) => lesson.isCompleted || lesson.isSkippedByPlacement,
  );
}

/**
 * Returns the chapter blocking a learner who had already moved past it, or
 * null when nothing is wrong. Chapters may arrive in any order.
 */
export function findCourseContinuityBreak(
  chapters: ContinuityChapter[],
): CourseContinuityBreak | null {
  if (chapters.length === 0) return null;

  const ordered = [...chapters].sort((a, b) => a.order - b.order);
  const blockerIndex = ordered.findIndex((chapter) => !isSatisfied(chapter));
  if (blockerIndex === -1) return null;

  const blocker = ordered[blockerIndex];

  // Untouched chapters are simply the learner's next step, not a regression.
  if (!hasAnyProgress(blocker)) return null;

  const later = ordered.slice(blockerIndex + 1);
  const chaptersAhead = later.filter(hasAnyProgress);
  // Without progress beyond the blocker this is ordinary mid-chapter work.
  if (chaptersAhead.length === 0) return null;

  const outstanding = blocker.lessons.filter(
    (lesson) => !lesson.isCompleted && !lesson.isSkippedByPlacement,
  );

  return {
    chapterId: blocker.id,
    chapterOrder: blocker.order,
    chapterTitle: blocker.title,
    chapterTitleUr: blocker.titleUr,
    newLessonCount: outstanding.length,
    lessonCount: blocker.lessons.length,
    resumeLessonId: outstanding[0]?.id ?? null,
    chaptersAheadCount: chaptersAhead.length,
  };
}
