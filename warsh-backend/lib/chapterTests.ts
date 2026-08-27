import { prisma } from "./prisma";
import { PROGRESS_STATUS } from "./course";

export type ChapterTestAnswer = {
  questionId: string;
  selectedIndex: number;
};

type ChapterTestQuestion = {
  id: string;
  options: unknown[];
  correct_index: number;
};

export type ChapterTestAssessment = {
  type: "CHAPTER_TEST";
  chapter_order: number;
  pass_score_percent: number;
  questions: ChapterTestQuestion[];
};

export function getChapterTestAssessment(content: unknown): ChapterTestAssessment | null {
  if (!content || typeof content !== "object") return null;
  const assessment = (content as { assessment?: unknown }).assessment;
  if (!assessment || typeof assessment !== "object") return null;
  const value = assessment as Partial<ChapterTestAssessment>;
  if (
    value.type !== "CHAPTER_TEST" ||
    !Number.isInteger(value.chapter_order) ||
    !Number.isInteger(value.pass_score_percent) ||
    !Array.isArray(value.questions) ||
    value.questions.length === 0
  ) {
    return null;
  }
  return value as ChapterTestAssessment;
}

export function isChapterTestContent(content: unknown) {
  return getChapterTestAssessment(content) !== null;
}

export function gradeChapterTest(content: unknown, answers: ChapterTestAnswer[]) {
  const assessment = getChapterTestAssessment(content);
  if (!assessment) throw new Error("not_chapter_test");

  const answerByQuestionId = new Map<string, number>();
  for (const answer of answers) {
    if (answerByQuestionId.has(answer.questionId)) throw new Error("duplicate_answer");
    answerByQuestionId.set(answer.questionId, answer.selectedIndex);
  }

  if (
    answerByQuestionId.size !== assessment.questions.length ||
    assessment.questions.some((question) => !answerByQuestionId.has(question.id))
  ) {
    throw new Error("incomplete_answers");
  }

  let correctCount = 0;
  for (const question of assessment.questions) {
    const selectedIndex = answerByQuestionId.get(question.id)!;
    if (!Number.isInteger(selectedIndex) || selectedIndex < 0 || selectedIndex >= question.options.length) {
      throw new Error("invalid_answer");
    }
    if (selectedIndex === question.correct_index) correctCount += 1;
  }

  const totalScored = assessment.questions.length;
  const score = Math.round((correctCount / totalScored) * 100);
  const requiredCorrect = Math.ceil((assessment.pass_score_percent / 100) * totalScored);

  return {
    passed: correctCount >= requiredCorrect,
    score,
    correctCount,
    totalScored,
    requiredCorrect,
    passScorePercent: assessment.pass_score_percent,
  };
}

export async function isChapterTestUnlocked(
  userId: string,
  lesson: { id: string; chapterId: string; order: number; content: unknown },
) {
  if (!isChapterTestContent(lesson.content)) return true;

  const priorLessons = await prisma.lesson.findMany({
    where: {
      chapterId: lesson.chapterId,
      status: "PUBLISHED",
      order: { lt: lesson.order },
    },
    select: { id: true },
  });
  if (priorLessons.length === 0) return true;

  const satisfiedCount = await prisma.progress.count({
    where: {
      userId,
      lessonId: { in: priorLessons.map((item) => item.id) },
      status: { in: [PROGRESS_STATUS.COMPLETED, PROGRESS_STATUS.SKIPPED_BY_PLACEMENT] },
    },
  });
  return satisfiedCount === priorLessons.length;
}
