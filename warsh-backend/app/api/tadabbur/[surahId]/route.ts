import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { getUserIdFromRequest } from "../../../../lib/auth";
import { computeSurahState, computeWordStates } from "../../../../lib/tadabbur";
import { getUserSubscriptionState, requiresSubscription } from "../../../../lib/subscription";

export async function GET(request: Request, { params }: { params: { surahId: string } }) {
  const userId = await getUserIdFromRequest(request);
  if (!userId) return NextResponse.json({ error: "Unauthorized", code: "unauthorized" }, { status: 401 });

  const subscriptionState = await getUserSubscriptionState(userId);
  if (!subscriptionState) return NextResponse.json({ error: "Unauthorized", code: "unauthorized" }, { status: 401 });
  if (requiresSubscription(subscriptionState)) {
    return NextResponse.json({ error: "Subscription required", code: "subscription_required" }, { status: 402 });
  }

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
  const state = computeSurahState(surah.ayatData as any, masteredWordIds);

  // Meaning and root for every linked word, so the word sheet can teach the
  // word rather than only name its state (finding H8).
  const linkedIds = [...new Set(ayatWithStates.flatMap((ayah) => ayah.words.map((w) => w.vocabId).filter((id): id is string => Boolean(id))))];
  const linkedWords = linkedIds.length
    ? await prisma.vocabularyWord.findMany({
        where: { id: { in: linkedIds } },
        select: { id: true, translationEn: true, translationUr: true, rootLetters: true },
      })
    : [];
  const wordInfo = new Map(linkedWords.map((w) => [w.id, w]));
  const ayat = ayatWithStates.map((ayah) => ({
    ...ayah,
    words: ayah.words.map((w) => {
      const info = w.vocabId ? wordInfo.get(w.vocabId) : undefined;
      return info
        ? { ...w, meaningEn: info.translationEn, meaningUr: info.translationUr, root: info.rootLetters }
        : w;
    }),
  }));

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
        comprehensionPercent: state.comprehensionPercent,
        vocabLinkedWords: state.vocabLinkedWords,
        masteredWords: state.masteredWords,
        completedAt: progress?.completedAt ?? null,
      },
      ayat,
      completedAt: progress?.completedAt ?? null,
    },
  });
}
