import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "../../../../../../lib/prisma";
import { getUserIdFromRequest } from "../../../../../../lib/auth";
import { applyStreakForActivity } from "../../../../../../lib/streak";
import {
  CORE_KNOWN_MIN_REPETITIONS,
  CORE_SET_COUNT,
  coveragePercent,
  isSetUnlocked,
} from "../../../../../../lib/core500";

interface Props {
  params: { setNumber: string };
}

const completeSchema = z.object({
  // Words the learner tapped "I know it" on. Anything omitted stays unlearned,
  // so a half-finished set does not complete.
  knownWordIds: z.array(z.string().min(1)).max(50),
});

/**
 * Finish a Core 500 set.
 *
 * Completing a set advances the daily streak, exactly as finishing a lesson
 * does (product decision 2026-09-07) — a learner who only does their five words
 * today has still shown up. `applyStreakForActivity` is shared with the lesson
 * route and is same-day idempotent, so doing both in one day counts once.
 */
export async function POST(request: Request, { params }: Props) {
  const userId = await getUserIdFromRequest(request);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized", code: "unauthorized" }, { status: 401 });
  }

  const setNumber = Number.parseInt(params.setNumber, 10);
  if (!Number.isInteger(setNumber) || setNumber < 1 || setNumber > CORE_SET_COUNT) {
    return NextResponse.json(
      { error: "That set does not exist.", code: "set_not_found" },
      { status: 404 },
    );
  }

  const parsed = completeSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: "knownWordIds is required.", code: "bad_request" },
      { status: 400 },
    );
  }

  const [setWords, completed] = await Promise.all([
    prisma.vocabularyWord.findMany({
      where: { coreSetNumber: setNumber, status: "PUBLISHED" },
      select: { id: true, frequencyInQuran: true },
    }),
    prisma.userCoreSetProgress.findMany({
      where: { userId, completedAt: { not: null } },
      select: { setNumber: true },
    }),
  ]);

  if (setWords.length === 0) {
    return NextResponse.json(
      { error: "That set does not exist.", code: "set_not_found" },
      { status: 404 },
    );
  }

  const completedSets = new Set(completed.map((s) => s.setNumber));
  if (!isSetUnlocked(setNumber, completedSets)) {
    return NextResponse.json(
      { error: "Finish the earlier sets first.", code: "set_locked" },
      { status: 403 },
    );
  }

  // Only ids that actually belong to this set count, so a modified client
  // cannot mark arbitrary words known.
  const setWordIds = new Set(setWords.map((w) => w.id));
  const claimed = parsed.data.knownWordIds.filter((id) => setWordIds.has(id));
  const now = new Date();
  const alreadyComplete = completedSets.has(setNumber);

  await prisma.$transaction(async (tx) => {
    for (const wordId of claimed) {
      // First pass through a word seeds its SRS row; later passes leave the
      // schedule alone, since grading happens in the SRS review route.
      await tx.userVocabularyWord.upsert({
        where: { userId_wordId: { userId, wordId } },
        create: { userId, wordId, repetitions: CORE_KNOWN_MIN_REPETITIONS, nextReviewDate: now },
        update: {},
      });
    }

    const setComplete = claimed.length === setWords.length;

    await tx.userCoreSetProgress.upsert({
      where: { userId_setNumber: { userId, setNumber } },
      create: { userId, setNumber, completedAt: setComplete ? now : null },
      // Never un-complete a set the learner already finished.
      update: setComplete ? { completedAt: now } : {},
    });

    if (setComplete && !alreadyComplete) {
      await applyStreakForActivity(tx, userId, now);
    }
  });

  const [userWords, allCore, streak] = await Promise.all([
    prisma.userVocabularyWord.findMany({
      where: { userId },
      select: { wordId: true, repetitions: true },
    }),
    prisma.vocabularyWord.findMany({
      where: { quranicRank: { not: null }, status: "PUBLISHED" },
      select: { id: true, frequencyInQuran: true },
    }),
    prisma.streak.findUnique({ where: { userId } }),
  ]);

  const knownIds = new Set(
    userWords.filter((w) => w.repetitions >= CORE_KNOWN_MIN_REPETITIONS).map((w) => w.wordId),
  );
  const knownFrequencySum = allCore
    .filter((w) => knownIds.has(w.id))
    .reduce((sum, w) => sum + (w.frequencyInQuran ?? 0), 0);

  return NextResponse.json({
    data: {
      setNumber,
      completed: claimed.length === setWords.length,
      knownCount: allCore.filter((w) => knownIds.has(w.id)).length,
      coveragePercent: coveragePercent(knownFrequencySum),
      currentStreak: streak?.currentStreak ?? 0,
      streakAdvanced: claimed.length === setWords.length && !alreadyComplete,
    },
  });
}
