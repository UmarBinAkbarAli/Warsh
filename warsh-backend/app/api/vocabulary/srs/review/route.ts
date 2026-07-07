import { NextResponse } from "next/server";
import { prisma } from "../../../../../lib/prisma";
import { getUserIdFromRequest } from "../../../../../lib/auth";
import { computeSurahState } from "../../../../../lib/tadabbur";

// SM-2 algorithm
function computeNextSRS(
  easeFactor: number,
  intervalDays: number,
  repetitions: number,
  quality: number // 2=Hard, 4=Good, 5=Easy
) {
  let newEase = easeFactor + 0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02);
  newEase = Math.max(1.3, newEase);

  let newInterval: number;
  let newReps: number;

  if (quality < 3) {
    // Hard — reset
    newReps = 0;
    newInterval = 1;
  } else {
    newReps = repetitions + 1;
    if (repetitions === 0) {
      newInterval = 1;
    } else if (repetitions === 1) {
      newInterval = 6;
    } else {
      newInterval = Math.round(intervalDays * easeFactor);
    }
  }

  const nextReview = new Date();
  nextReview.setDate(nextReview.getDate() + newInterval);

  return { easeFactor: newEase, intervalDays: newInterval, repetitions: newReps, nextReviewDate: nextReview };
}

export async function POST(request: Request) {
  const userId = await getUserIdFromRequest(request);
  if (!userId) return NextResponse.json({ error: "Unauthorized", code: "unauthorized" }, { status: 401 });

  const body = await request.json();
  const { wordId, quality } = body;

  if (!wordId || ![2, 4, 5].includes(quality)) {
    return NextResponse.json({ error: "wordId and quality (2|4|5) are required", code: "bad_request" }, { status: 400 });
  }

  const existing = await prisma.userVocabularyWord.findUnique({
    where: { userId_wordId: { userId, wordId } },
  });

  if (!existing) {
    return NextResponse.json({ error: "Word not in review queue", code: "not_found" }, { status: 404 });
  }

  const next = computeNextSRS(existing.easeFactor, existing.intervalDays, existing.repetitions, quality);

  const updated = await prisma.userVocabularyWord.update({
    where: { userId_wordId: { userId, wordId } },
    data: { ...next, lastReviewQuality: quality },
  });

  // Recalculate surah comprehension for surahs containing this word
  const [allSurahs, allUserWords] = await Promise.all([
    prisma.tadabburSurah.findMany(),
    prisma.userVocabularyWord.findMany({ where: { userId }, select: { wordId: true, repetitions: true } }),
  ]);

  const masteredWordIds = new Set(
    allUserWords.filter((w) => w.repetitions >= 3).map((w) => w.wordId)
  );

  for (const surah of allSurahs) {
    const ayatData = surah.ayatData as Array<{ ayahNumber: number; arabic: string; translationEn: string; words: Array<{ pos: number; arabic: string; arabicPlain: string; vocabId: string | null }> }>;
    const allVocabIds = new Set(ayatData.flatMap((a) => a.words.map((w) => w.vocabId).filter(Boolean)));
    if (!allVocabIds.has(wordId)) continue;

    const { comprehensionPercent } = computeSurahState(ayatData, masteredWordIds);
    await prisma.userSurahProgress.upsert({
      where: { userId_surahId: { userId, surahId: surah.id } },
      create: {
        userId,
        surahId: surah.id,
        completedAt: comprehensionPercent >= 100 ? new Date() : null,
      },
      update: {
        completedAt: comprehensionPercent >= 100 ? new Date() : null,
      },
    });
  }

  return NextResponse.json({ data: updated });
}
