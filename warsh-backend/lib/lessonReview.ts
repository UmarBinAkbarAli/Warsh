// Server side of Studio's lesson review: runs lib/lessonChecks.ts against the
// database and remembers which automatic problems the owner dismissed.
//
// A dismissed problem is stored as a DISMISSED `ContentReviewIssue` with issue
// type AUTO_CHECK and the problem's key in `blockPath`, so review state stays in
// the content-review tables and never touches `Lesson.content`.

import { prisma } from "./prisma";
import { checkLesson, summarizeProblems, type LessonProblem, type VocabIntro } from "./lessonChecks";

export const AUTO_CHECK_ISSUE = "AUTO_CHECK";

/** Every word a discover card introduces, with the lesson that introduces it. */
export async function loadVocabIntros(): Promise<VocabIntro[]> {
  const rows = await prisma.$queryRaw<{ plain: string; lessonId: string; chapter: number; lesson: number; template: string }[]>`
    SELECT card.value->'introduces_vocab'->>'ar_plain' AS plain,
           l."id" AS "lessonId", ch."order" AS chapter, l."order" AS lesson, l."template"::text AS template
    FROM "Lesson" l
    JOIN "Chapter" ch ON ch."id" = l."chapterId",
         jsonb_array_elements(
           CASE WHEN jsonb_typeof(l."content"->'discover_cards') = 'array' THEN l."content"->'discover_cards' ELSE '[]'::jsonb END
         ) AS card(value)
    WHERE card.value->'introduces_vocab'->>'ar_plain' IS NOT NULL`;
  return rows.map((r) => ({
    plain: r.plain,
    lessonId: r.lessonId,
    chapter: Number(r.chapter),
    lesson: Number(r.lesson),
    review: r.template === "REVIEW",
  }));
}

/** Problem keys the owner dismissed, by lesson id. */
export async function loadDismissedKeys(lessonIds?: string[]): Promise<Map<string, Set<string>>> {
  const rows = await prisma.contentReviewIssue.findMany({
    where: {
      issueType: AUTO_CHECK_ISSUE,
      status: "DISMISSED",
      ...(lessonIds ? { review: { lessonId: { in: lessonIds } } } : {}),
    },
    select: { blockPath: true, review: { select: { lessonId: true } } },
  });
  const byLesson = new Map<string, Set<string>>();
  for (const row of rows) {
    const set = byLesson.get(row.review.lessonId) ?? new Set<string>();
    set.add(row.blockPath);
    byLesson.set(row.review.lessonId, set);
  }
  return byLesson;
}

type LessonForCheck = { id: string; order: number; template: string; content: unknown; chapter: { order: number } };

export function problemsFor(lesson: LessonForCheck, intros: VocabIntro[], dismissed?: Set<string>): LessonProblem[] {
  const problems = checkLesson(lesson.content, {
    lessonId: lesson.id,
    chapter: lesson.chapter.order,
    lesson: lesson.order,
    template: lesson.template,
    intros,
  });
  return dismissed ? problems.filter((p) => !dismissed.has(p.key)) : problems;
}

/** Problems still standing for one lesson (dismissed ones removed). */
export async function remainingProblems(lessonId: string): Promise<LessonProblem[] | null> {
  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    select: { id: true, order: true, template: true, content: true, chapter: { select: { order: true } } },
  });
  if (!lesson) return null;
  const [intros, dismissed] = await Promise.all([loadVocabIntros(), loadDismissedKeys([lessonId])]);
  return problemsFor(lesson, intros, dismissed.get(lessonId));
}

export type LessonReviewSummary = {
  id: string;
  reviewStatus: "NOT_REVIEWED" | "NEEDS_CORRECTION" | "APPROVED";
  problemCount: number;
  summary: string;
};

/** Review status and remaining problems for every lesson (the checklist). */
export async function reviewSummaries(): Promise<LessonReviewSummary[]> {
  const [lessons, intros, dismissed] = await Promise.all([
    prisma.lesson.findMany({
      select: {
        id: true,
        order: true,
        template: true,
        content: true,
        chapter: { select: { order: true } },
        contentReview: { select: { status: true } },
      },
    }),
    loadVocabIntros(),
    loadDismissedKeys(),
  ]);
  return lessons.map((lesson) => {
    const problems = problemsFor(lesson, intros, dismissed.get(lesson.id));
    return {
      id: lesson.id,
      reviewStatus: lesson.contentReview?.status ?? "NOT_REVIEWED",
      problemCount: problems.length,
      summary: summarizeProblems(problems),
    };
  });
}
