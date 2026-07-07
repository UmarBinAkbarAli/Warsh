import { NextResponse } from "next/server";
import { prisma } from "../../../../../lib/prisma";
import { getUserIdFromRequest } from "../../../../../lib/auth";

export async function GET(request: Request) {
  const userId = await getUserIdFromRequest(request);
  if (!userId) return NextResponse.json({ error: "Unauthorized", code: "unauthorized" }, { status: 401 });

  const now = new Date();

  const dueUserWords = await prisma.userVocabularyWord.findMany({
    where: {
      userId,
      isHidden: false,
      nextReviewDate: { lte: now },
    },
    orderBy: { nextReviewDate: "asc" },
    take: 20,
    include: {
      word: {
        select: {
          id: true,
          arabic: true,
          arabicPlain: true,
          transliteration: true,
          translationEn: true,
          translationUr: true,
          quranicExample: true,
          imageUrl: true,
        },
      },
    },
  });

  return NextResponse.json({ data: dueUserWords });
}
