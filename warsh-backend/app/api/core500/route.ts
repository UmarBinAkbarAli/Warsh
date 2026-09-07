import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";
import { getUserIdFromRequest } from "../../../lib/auth";
import {
  CORE_KNOWN_MIN_REPETITIONS,
  CORE_SET_COUNT,
  CORE_SET_SIZE,
  CORE_WORD_COUNT,
  coveragePercent,
  isSetUnlocked,
  nextSetNumber,
} from "../../../lib/core500";

/**
 * Overview for the Quranic Core 500 screen: coverage, the set list, and where
 * "Continue" should go. Free for every signed-in user — no subscription gate.
 */
export async function GET(request: Request) {
  const userId = await getUserIdFromRequest(request);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized", code: "unauthorized" }, { status: 401 });
  }

  const [words, userWords, setProgress] = await Promise.all([
    prisma.vocabularyWord.findMany({
      where: { quranicRank: { not: null }, status: "PUBLISHED" },
      select: {
        id: true,
        arabic: true,
        transliteration: true,
        translationEn: true,
        translationUr: true,
        frequencyInQuran: true,
        quranicRank: true,
        coreSetNumber: true,
        isCorePrefix: true,
      },
      orderBy: { quranicRank: "asc" },
    }),
    prisma.userVocabularyWord.findMany({
      where: { userId },
      select: { wordId: true, repetitions: true },
    }),
    prisma.userCoreSetProgress.findMany({
      where: { userId },
      select: { setNumber: true, completedAt: true },
    }),
  ]);

  const knownWordIds = new Set(
    userWords
      .filter((w) => w.repetitions >= CORE_KNOWN_MIN_REPETITIONS)
      .map((w) => w.wordId),
  );
  const completedSets = new Set(
    setProgress.filter((s) => s.completedAt !== null).map((s) => s.setNumber),
  );

  let knownFrequencySum = 0;
  let knownCount = 0;
  const bySet = new Map<number, typeof words>();

  for (const word of words) {
    if (knownWordIds.has(word.id)) {
      knownFrequencySum += word.frequencyInQuran ?? 0;
      knownCount += 1;
    }
    const setNumber = word.coreSetNumber ?? 0;
    const bucket = bySet.get(setNumber);
    if (bucket) bucket.push(word);
    else bySet.set(setNumber, [word]);
  }

  const sets = Array.from(bySet.entries())
    .sort((a, b) => a[0] - b[0])
    .map(([setNumber, setWords]) => {
      const known = setWords.filter((w) => knownWordIds.has(w.id)).length;
      return {
        setNumber,
        wordCount: setWords.length,
        knownCount: known,
        completed: completedSets.has(setNumber),
        unlocked: isSetUnlocked(setNumber, completedSets),
        // Enough for the set row's Arabic preview without shipping every field.
        preview: setWords.slice(0, 3).map((w) => w.arabic),
        // What finishing this set would still add. Zero once every word is known.
        coverageGain: coveragePercent(
          setWords
            .filter((w) => !knownWordIds.has(w.id))
            .reduce((sum, w) => sum + (w.frequencyInQuran ?? 0), 0),
        ),
        // What the set is worth in total. A finished set shows this instead, so
        // it reads "+9.2% coverage" rather than a meaningless "+0%".
        coverageValue: coveragePercent(
          setWords.reduce((sum, w) => sum + (w.frequencyInQuran ?? 0), 0),
        ),
      };
    });

  // The 500 load as DRAFT and are published only once a reviewer has approved
  // them in Studio. Until every one is live the sets are sparse and "Continue"
  // would point at a set that does not exist, so the feature reports itself as
  // not ready and the client hides its entry point entirely.
  const ready = words.length === CORE_WORD_COUNT;

  return NextResponse.json({
    data: {
      ready,
      coveragePercent: coveragePercent(knownFrequencySum),
      knownCount,
      totalCount: words.length,
      setSize: CORE_SET_SIZE,
      setCount: Math.min(CORE_SET_COUNT, sets.length),
      completedSetCount: completedSets.size,
      nextSetNumber: nextSetNumber(completedSets),
      sets,
    },
  });
}
