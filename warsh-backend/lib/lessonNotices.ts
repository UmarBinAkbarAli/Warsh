import { PROGRESS_STATUS, type ChapterState } from "./course";

/**
 * "New / updated lesson" notices for the Learn tab (owner rule, 2026-09-23):
 * whenever a lesson is added to a chapter a learner already finished, or a
 * lesson they completed is changed, they are told and invited to take a look.
 * Nothing here ever locks anything; see `findLessonsAddedAfterFinish` in
 * `lib/course.ts` for the progression side.
 */

export const UPDATED_BADGE_DAYS = 14;

type NoticeLesson = {
  id: string;
  title: string;
  titleUr: string | null;
  addedAt?: Date | null;
  contentUpdatedAt?: Date | null;
};

type NoticeChapter = {
  id: string;
  order: number;
  title: string;
  titleUr: string | null;
  lessons: NoticeLesson[];
};

export type LessonNoticeItem = {
  kind: "new" | "updated";
  lessonId: string;
  lessonTitle: string;
  lessonTitleUr: string | null;
  chapterId: string;
  chapterOrder: number;
  chapterTitle: string;
  chapterTitleUr: string | null;
};

export type LessonFlags = { isNew: boolean; isUpdated: boolean };

type Input = {
  chapters: NoticeChapter[];
  chapterStateById: Map<string, ChapterState>;
  progressStatusByLessonId: Map<string, string>;
  finishedAtByLessonId: Map<string, Date>;
};

/**
 * A lesson is new to this learner when it went live after they had already
 * completed work in its chapter, the chapter no longer holds them back, and
 * they have not completed the lesson yet. The last clause rules out learners
 * who placed past the whole chapter: they never finished anything there.
 */
function isNewForLearner(lesson: NoticeLesson, chapter: NoticeChapter, input: Input) {
  if (!lesson.addedAt) return false;
  if (!input.chapterStateById.get(chapter.id)?.isSatisfied) return false;
  if (input.progressStatusByLessonId.get(lesson.id) === PROGRESS_STATUS.COMPLETED) return false;
  const addedAt = lesson.addedAt.getTime();
  return chapter.lessons.some((other) => {
    if (other.id === lesson.id) return false;
    if (input.progressStatusByLessonId.get(other.id) !== PROGRESS_STATUS.COMPLETED) return false;
    const at = input.finishedAtByLessonId.get(other.id)?.getTime();
    return at !== undefined && at < addedAt;
  });
}

/** Changed while live, after the learner had completed it. */
function updatedAtForLearner(lesson: NoticeLesson, input: Input) {
  if (!lesson.contentUpdatedAt) return null;
  if (input.progressStatusByLessonId.get(lesson.id) !== PROGRESS_STATUS.COMPLETED) return null;
  const completedAt = input.finishedAtByLessonId.get(lesson.id);
  if (!completedAt || lesson.contentUpdatedAt.getTime() <= completedAt.getTime()) return null;
  return lesson.contentUpdatedAt;
}

/** Per-lesson badges for chapter and lesson lists. */
export function buildLessonFlags(input: Input, now = new Date()) {
  const recent = now.getTime() - UPDATED_BADGE_DAYS * 24 * 60 * 60 * 1000;
  const flags = new Map<string, LessonFlags>();
  for (const chapter of input.chapters) {
    for (const lesson of chapter.lessons) {
      const updatedAt = updatedAtForLearner(lesson, input);
      flags.set(lesson.id, {
        isNew: isNewForLearner(lesson, chapter, input),
        isUpdated: updatedAt !== null && updatedAt.getTime() > recent,
      });
    }
  }
  return flags;
}

/** What the Learn tab notice lists: everything that changed since `seenAt`. */
export function buildLessonNotices(input: Input, seenAt: Date | null) {
  const since = seenAt?.getTime() ?? 0;
  const items: LessonNoticeItem[] = [];
  const ordered = [...input.chapters].sort((a, b) => a.order - b.order);
  for (const chapter of ordered) {
    for (const lesson of chapter.lessons) {
      let kind: LessonNoticeItem["kind"] | null = null;
      if (isNewForLearner(lesson, chapter, input) && lesson.addedAt!.getTime() > since) {
        kind = "new";
      } else {
        const updatedAt = updatedAtForLearner(lesson, input);
        if (updatedAt && updatedAt.getTime() > since) kind = "updated";
      }
      if (!kind) continue;
      items.push({
        kind,
        lessonId: lesson.id,
        lessonTitle: lesson.title,
        lessonTitleUr: lesson.titleUr,
        chapterId: chapter.id,
        chapterOrder: chapter.order,
        chapterTitle: chapter.title,
        chapterTitleUr: chapter.titleUr,
      });
    }
  }
  return items;
}
