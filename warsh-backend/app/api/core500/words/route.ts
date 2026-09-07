import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { getUserIdFromRequest } from "../../../../lib/auth";
import { CORE_KNOWN_MIN_REPETITIONS, coveragePercent } from "../../../../lib/core500";

/**
 * "Words you know" — the Core 500 words the learner has cleared, newest first
 * by default. `?filter=all` returns the whole 500 with a known flag, which the
 * screen uses for its All / Recent tabs.
 */
export async function GET(request: Request) {
  const userId = await getUserIdFromRequest(request);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized", code: "unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const filter = url.searchParams.get("filter") === "all" ? "all" : "known";

  const [words, userWords] = await Promise.all([
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
      select: { wordId: true, repetitions: true, updatedAt: true },
    }),
  ]);

  const known = new Map(
    userWords
      .filter((w) => w.repetitions >= CORE_KNOWN_MIN_REPETITIONS)
      .map((w) => [w.wordId, w.updatedAt]),
  );

  const rows = words
    .filter((word) => filter === "all" || known.has(word.id))
    .map((word) => ({
      ...word,
      known: known.has(word.id),
      learnedAt: known.get(word.id) ?? null,
    }));

  const knownFrequencySum = words
    .filter((word) => known.has(word.id))
    .reduce((sum, word) => sum + (word.frequencyInQuran ?? 0), 0);

  return NextResponse.json({
    data: {
      words: rows,
      knownCount: known.size,
      totalCount: words.length,
      coveragePercent: coveragePercent(knownFrequencySum),
    },
  });
}
