import { NextResponse } from "next/server";
import { prisma } from "../../../../../lib/prisma";
import { getUserIdFromRequest } from "../../../../../lib/auth";
import {
  CORE_KNOWN_MIN_REPETITIONS,
  CORE_SET_COUNT,
  coveragePercent,
  isSetUnlocked,
} from "../../../../../lib/core500";

interface Props {
  params: { setNumber: string };
}

/** The words in one set, for the session screen. */
export async function GET(request: Request, { params }: Props) {
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

  const [words, completed, userWords] = await Promise.all([
    prisma.vocabularyWord.findMany({
      where: { coreSetNumber: setNumber, status: "PUBLISHED" },
      select: {
        id: true,
        arabic: true,
        transliteration: true,
        translationEn: true,
        translationUr: true,
        frequencyInQuran: true,
        quranicRank: true,
        isCorePrefix: true,
        audioUrl: true,
      },
      orderBy: { quranicRank: "asc" },
    }),
    prisma.userCoreSetProgress.findMany({
      where: { userId, completedAt: { not: null } },
      select: { setNumber: true },
    }),
    prisma.userVocabularyWord.findMany({
      where: { userId },
      select: { wordId: true, repetitions: true },
    }),
  ]);

  if (words.length === 0) {
    return NextResponse.json(
      { error: "That set does not exist.", code: "set_not_found" },
      { status: 404 },
    );
  }

  // Locking is enforced here, not just hidden in the client.
  const completedSets = new Set(completed.map((s) => s.setNumber));
  if (!isSetUnlocked(setNumber, completedSets)) {
    return NextResponse.json(
      { error: "Finish the earlier sets first.", code: "set_locked" },
      { status: 403 },
    );
  }

  const known = new Map(userWords.map((w) => [w.wordId, w.repetitions]));

  return NextResponse.json({
    data: {
      setNumber,
      completed: completedSets.has(setNumber),
      words: words.map((word) => ({
        ...word,
        known: (known.get(word.id) ?? 0) >= CORE_KNOWN_MIN_REPETITIONS,
        coverageGain: coveragePercent(word.frequencyInQuran ?? 0),
      })),
    },
  });
}
