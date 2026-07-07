import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { getUserIdFromRequest } from "../../../../lib/auth";
import { computeWordStates } from "../../../../lib/tadabbur";

export async function GET(request: Request, { params }: { params: { surahId: string } }) {
  const userId = await getUserIdFromRequest(request);
  if (!userId) return NextResponse.json({ error: "Unauthorized", code: "unauthorized" }, { status: 401 });

  const [surah, progress, userWords] = await Promise.all([
    prisma.tadabburSurah.findUnique({ where: { id: params.surahId } }),
    prisma.userSurahProgress.findUnique({ where: { userId_surahId: { userId, surahId: params.surahId } } }),
    prisma.userVocabularyWord.findMany({ where: { userId }, select: { wordId: true, repetitions: true } }),
  ]);

  if (!surah) return NextResponse.json({ error: "Surah not found", code: "not_found" }, { status: 404 });

  const masteredWordIds = new Set(
    userWords.filter((w) => w.repetitions >= 3).map((w) => w.wordId)
  );

  const ayatWithStates = computeWordStates(surah.ayatData as any, masteredWordIds);

  return NextResponse.json({
    data: {
      surah: {
        id: surah.id,
        orderInProg: surah.orderInProg,
        surahNumber: surah.surahNumber,
        nameAr: surah.nameAr,
        nameEn: surah.nameEn,
        meaningEn: surah.meaningEn,
        totalAyat: surah.totalAyat,
      },
      ayat: ayatWithStates,
      completedAt: progress?.completedAt ?? null,
    },
  });
}
