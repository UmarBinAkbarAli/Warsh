import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";
import { getUserIdFromRequest } from "../../../lib/auth";
import { computeSurahState } from "../../../lib/tadabbur";

export async function GET(request: Request) {
  const userId = getUserIdFromRequest(request);
  if (!userId) return NextResponse.json({ error: "Unauthorized", code: "unauthorized" }, { status: 401 });

  const [surahs, userProgress, userWords] = await Promise.all([
    prisma.tadabburSurah.findMany({ orderBy: { orderInProg: "asc" } }),
    prisma.userSurahProgress.findMany({ where: { userId } }),
    prisma.userVocabularyWord.findMany({ where: { userId }, select: { wordId: true, repetitions: true, easeFactor: true } }),
  ]);

  const progressBySurahId = new Map(userProgress.map((p) => [p.surahId, p]));
  const masteredWordIds = new Set(
    userWords.filter((w) => w.repetitions >= 3).map((w) => w.wordId)
  );

  const surahStates = surahs.map((s) => {
    const progress = progressBySurahId.get(s.id);
    const state = computeSurahState(s.ayatData as any, masteredWordIds);
    return {
      id: s.id,
      orderInProg: s.orderInProg,
      surahNumber: s.surahNumber,
      nameAr: s.nameAr,
      nameEn: s.nameEn,
      meaningEn: s.meaningEn,
      totalAyat: s.totalAyat,
      comprehensionPercent: state.comprehensionPercent,
      vocabLinkedWords: state.vocabLinkedWords,
      masteredWords: state.masteredWords,
      completedAt: progress?.completedAt ?? null,
    };
  });

  // Current focus = lowest-order incomplete Surah
  const focusSurah = surahStates.find((s) => !s.completedAt) ?? surahStates[surahStates.length - 1];

  return NextResponse.json({ data: { focusSurahId: focusSurah?.id ?? null, surahs: surahStates } });
}
