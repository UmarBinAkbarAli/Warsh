import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { getUserIdFromRequest } from "../../../../lib/auth";

export async function GET(request: Request) {
  const userId = await getUserIdFromRequest(request);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized", code: "unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const filter = searchParams.get("filter") ?? "all"; // "all" | "new" | "mastered" | "needs_review"
  const sort = searchParams.get("sort") ?? "date";    // "date" | "alpha" | "topic"
  const limit = Math.min(200, Math.max(1, parseInt(searchParams.get("limit") ?? "50", 10)));
  const offset = Math.max(0, parseInt(searchParams.get("offset") ?? "0", 10));

  const orderBy =
    sort === "alpha"
      ? { word: { arabicPlain: "asc" as const } }
      : sort === "topic"
      ? { word: { sortOrder: "asc" as const } }
      : { id: "desc" as const };

  const userWords = await prisma.userVocabularyWord.findMany({
    where: { userId },
    include: {
      word: {
        select: {
          id: true,
          arabic: true,
          arabicPlain: true,
          transliteration: true,
          translationEn: true,
          translationUr: true,
          wordType: true,
          topicCategories: true,
          chapterIntroduced: true,
          sortOrder: true,
          imageUrl: true,
        },
      },
    },
    orderBy,
    take: limit,
    skip: offset,
  });

  const now = new Date();

  const filtered = userWords.filter((uw) => {
    if (filter === "new") return uw.repetitions === 0;
    if (filter === "mastered") return uw.repetitions >= 5 && uw.easeFactor >= 2.5;
    if (filter === "needs_review") return uw.nextReviewDate !== null && uw.nextReviewDate <= now;
    return true; // "all"
  });

  const words = filtered.map((uw) => ({
    ...uw.word,
    srs: {
      repetitions: uw.repetitions,
      easeFactor: uw.easeFactor,
      isFavorite: uw.isFavorite,
      nextReviewDate: uw.nextReviewDate,
    },
  }));

  return NextResponse.json({ data: { words, total: words.length } });
}
