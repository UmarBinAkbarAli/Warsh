import type { Prisma } from "@prisma/client";
import { prisma } from "./prisma";
import { CORE_KNOWN_MIN_REPETITIONS, coveragePercent, isSetUnlocked } from "./core500";
import { applyStreakForActivity } from "./streak";
import { buildQuestions, gradeAnswer, publicAssessment, retryMissed, type AssessmentState, type Question } from "./core500Assessment";

export class Core500Error extends Error {
  constructor(public code: string, public status: number, message: string) { super(message); }
}

export async function assertCoreSetAccess(userId: string, setNumber: number) {
  const completed = await prisma.userCoreSetProgress.findMany({ where: { userId, completedAt: { not: null } }, select: { setNumber: true } });
  if (!isSetUnlocked(setNumber, new Set(completed.map(s => s.setNumber)))) {
    throw new Core500Error("set_locked", 403, "Finish the earlier sets first.");
  }
}

// This lock also covers the legacy Core 500 endpoint, keeping both clients safe.
export async function lockCoreUser(tx: Prisma.TransactionClient, userId: string) {
  await tx.$queryRaw`SELECT "id" FROM "User" WHERE "id" = ${userId} FOR UPDATE`;
}

export async function creditCoreSet(tx: Prisma.TransactionClient, userId: string, setNumber: number, wordIds: string[]) {
  const now = new Date();
  for (const wordId of new Set(wordIds)) {
    await tx.userVocabularyWord.upsert({
      where: { userId_wordId: { userId, wordId } },
      create: { userId, wordId, repetitions: CORE_KNOWN_MIN_REPETITIONS, nextReviewDate: now },
      update: {}, // Preserve existing SRS repetitions, favourites and schedule.
    });
  }
  await tx.userCoreSetProgress.upsert({
    where: { userId_setNumber: { userId, setNumber } }, create: { userId, setNumber }, update: {},
  });
  const changed = await tx.userCoreSetProgress.updateMany({
    where: { userId, setNumber, completedAt: null }, data: { completedAt: now },
  });
  if (changed.count) await applyStreakForActivity(tx, userId, now);
  return changed.count > 0;
}

export async function coreCompletionSummary(userId: string, setNumber: number) {
  const [words, progress, streak] = await Promise.all([
    prisma.vocabularyWord.findMany({
      where: { quranicRank: { not: null }, status: "PUBLISHED" },
      select: { frequencyInQuran: true, userWords: { where: { userId }, select: { repetitions: true } } },
    }),
    prisma.userCoreSetProgress.findUnique({ where: { userId_setNumber: { userId, setNumber } } }),
    prisma.streak.findUnique({ where: { userId }, select: { currentStreak: true } }),
  ]);
  const known = words.filter(w => w.userWords.some(u => u.repetitions >= CORE_KNOWN_MIN_REPETITIONS));
  return { completed: !!progress?.completedAt, knownCount: known.length,
    coveragePercent: coveragePercent(known.reduce((sum, w) => sum + (w.frequencyInQuran ?? 0), 0)),
    currentStreak: streak?.currentStreak ?? 0 };
}

function stateOf(row: { language: string; phase: string; questions: Prisma.JsonValue; activeIds: string[]; passedIds: string[]; answers: Prisma.JsonValue; round: number }): AssessmentState {
  return { ...row, questions: row.questions as unknown as Question[], answers: row.answers as unknown as AssessmentState["answers"] };
}

export type AssessmentAction = { action: "start"; language: "en" | "ur"; restart?: boolean }
  | { action: "answer"; questionId: string; optionId: string; round: number }
  | { action: "retry"; round: number };

export async function readCoreAssessment(userId: string, setNumber: number) {
  await assertCoreSetAccess(userId, setNumber);
  const row = await prisma.core500Assessment.findUnique({ where: { userId_setNumber: { userId, setNumber } } });
  return row ? { ...publicAssessment(stateOf(row)), ...(row.phase === "COMPLETE" ? await coreCompletionSummary(userId, setNumber) : {}) } : null;
}

export async function actOnCoreAssessment(userId: string, setNumber: number, action: AssessmentAction) {
  await assertCoreSetAccess(userId, setNumber);
  const result = await prisma.$transaction(async tx => {
    await lockCoreUser(tx, userId);
    let row = await tx.core500Assessment.findUnique({ where: { userId_setNumber: { userId, setNumber } } });
    if (!row || (action.action === "start" && action.restart && row.phase === "COMPLETE")) {
      if (action.action !== "start") throw new Core500Error("test_not_started", 409, "Start the set test first.");
      const words = await tx.vocabularyWord.findMany({ where: { coreSetNumber: setNumber, status: "PUBLISHED" }, orderBy: { quranicRank: "asc" } });
      if (words.length !== 5) throw new Core500Error("set_not_ready", 409, "This set needs five published words.");
      const pool = await tx.vocabularyWord.findMany({ where: { quranicRank: { not: null }, status: "PUBLISHED" }, select: { id: true, arabic: true, translationEn: true, translationUr: true } });
      let questions: Question[];
      try { questions = buildQuestions(words, pool, action.language); }
      catch { throw new Core500Error("test_not_ready", 409, "This set's meanings need review before its test is available."); }
      const data = {
        userId, setNumber, language: action.language, phase: "QUIZ",
        questions: questions as unknown as Prisma.InputJsonValue, activeIds: questions.map(q => q.id),
        passedIds: [], answers: {}, round: row ? row.round + 1 : 1,
      };
      row = row ? await tx.core500Assessment.update({ where: { id: row.id }, data })
        : await tx.core500Assessment.create({ data });
    }
    let state = stateOf(row);
    let feedback: { correct: boolean; meaning: string; wordId: string } | undefined;
    let streakAdvanced = false;
    if (action.action !== "start") {
      if (action.round !== state.round) throw new Core500Error("stale_test", 409, "The test has moved on. Resume it to continue.");
      try {
        if (action.action === "retry") state = retryMissed(state);
        else {
          state = gradeAnswer(state, action.questionId, action.optionId);
          const question = state.questions.find(q => q.id === action.questionId)!;
          feedback = { correct: state.answers[question.id].correct, meaning: question.meaning, wordId: question.wordId };
        }
      } catch (err) {
        throw new Core500Error(err instanceof Error ? err.message : "invalid_answer", 409, "That answer cannot be accepted. Resume the test and try again.");
      }
      if (state.phase === "COMPLETE") streakAdvanced = await creditCoreSet(tx, userId, setNumber, state.passedIds);
      await tx.core500Assessment.update({ where: { id: row.id }, data: {
        phase: state.phase, activeIds: state.activeIds, passedIds: state.passedIds,
        answers: state.answers as unknown as Prisma.InputJsonValue, round: state.round,
      } });
    }
    return { ...publicAssessment(state), feedback, streakAdvanced };
  });
  return { ...result, ...(result.phase === "COMPLETE" ? await coreCompletionSummary(userId, setNumber) : {}) };
}
