import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { getUserIdFromRequest } from "../../../../lib/auth";
import { parseIntParam } from "../../../../lib/env";

export async function GET(request: Request) {
  const userId = await getUserIdFromRequest(request);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized", code: "unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const topic = searchParams.get("topic");
  const search = searchParams.get("search")?.trim();
  const page = parseIntParam(searchParams.get("page"), 1, { min: 1 });
  const pageSize = 200;

  // Only PUBLISHED words are browsable; drafts stay hidden from the app.
  const where: any = { status: "PUBLISHED" };

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

  const [words, total] = await Promise.all([
    prisma.vocabularyWord.findMany({
      where,
      orderBy: { sortOrder: "asc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.vocabularyWord.count({ where }),
  ]);

  return NextResponse.json({ data: words, meta: { total, page, pageSize, hasMore: page * pageSize < total } });
}
