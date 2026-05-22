import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const topic = searchParams.get("topic");
  const search = searchParams.get("search")?.trim();

  const where: any = {};

  if (topic) {
    where.topicCategories = { has: topic };
  }

  if (search && search.length >= 2) {
    where.OR = [
      { arabic: { contains: search } },
      { arabicPlain: { contains: search } },
      { transliteration: { contains: search, mode: "insensitive" } },
      { translationEn: { contains: search, mode: "insensitive" } },
      { translationUr: { contains: search } },
      { rootLetters: { contains: search } },
    ];
  }

  const words = await prisma.vocabularyWord.findMany({
    where,
    orderBy: { sortOrder: "asc" },
    take: 100,
  });

  return NextResponse.json({ data: words });
}
