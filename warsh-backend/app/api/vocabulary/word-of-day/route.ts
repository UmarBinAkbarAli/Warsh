import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { getUserIdFromRequest } from "../../../../lib/auth";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const userId = await getUserIdFromRequest(request);
  if (!userId) return NextResponse.json({ error: "Unauthorized", code: "unauthorized" }, { status: 401 });

  const words = await prisma.vocabularyWord.findMany({
    orderBy: { sortOrder: "asc" },
    select: {
      id: true, arabic: true, arabicPlain: true, transliteration: true,
      translationEn: true, translationUr: true, wordType: true,
      rootLetters: true, chapterIntroduced: true, quranicExample: true, imageUrl: true,
    },
  });

  if (words.length === 0) return NextResponse.json({ data: null });

  const dayIndex = Math.floor(Date.now() / (24 * 60 * 60 * 1000));
  const quranicWords = words.filter((w) => w.quranicExample !== null);
  const pool = quranicWords.length > 0 ? quranicWords : words;
  const word = pool[dayIndex % pool.length];

  const userWord = await prisma.userVocabularyWord.findUnique({
    where: { userId_wordId: { userId, wordId: word.id } },
    select: { repetitions: true, isFavorite: true },
  });

  return NextResponse.json({
    data: {
      ...word,
      inWordBank: userWord !== null,
      repetitions: userWord?.repetitions ?? 0,
      isFavorite: userWord?.isFavorite ?? false,
    },
  });
}
