import { NextResponse } from "next/server";
import { prisma } from "../../../../../lib/prisma";
import { getUserIdFromRequest } from "../../../../../lib/auth";

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const userId = await getUserIdFromRequest(request);
  if (!userId) return NextResponse.json({ error: "Unauthorized", code: "unauthorized" }, { status: 401 });

  const word = await prisma.vocabularyWord.findUnique({ where: { id: params.id } });
  if (!word) return NextResponse.json({ error: "Word not found", code: "not_found" }, { status: 404 });

  const userWord = await prisma.userVocabularyWord.findUnique({
    where: { userId_wordId: { userId, wordId: params.id } },
  });

  const relatedWords = word.rootLetters
    ? await prisma.vocabularyWord.findMany({
        where: { rootLetters: word.rootLetters, id: { not: params.id } },
        select: { id: true, arabic: true, arabicPlain: true, transliteration: true, translationEn: true, translationUr: true },
        take: 6,
      })
    : [];

  return NextResponse.json({ data: { word, userWord, relatedWords } });
}
