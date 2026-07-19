import { NextResponse } from "next/server";
import { getAdminReadError, getAdminWriteError } from "../../../../lib/admin";
import { prisma } from "../../../../lib/prisma";
import { vocabSchema, WORD_TYPES } from "../../../../lib/admin-content-schemas";

// GET /api/admin/vocabulary?q=&type=&page=&pageSize=
export async function GET(request: Request) {
  const readError = getAdminReadError(request);
  if (readError) return readError;

  const url = new URL(request.url);
  const q = url.searchParams.get("q")?.trim() ?? "";
  const type = url.searchParams.get("type")?.trim() ?? "";
  const page = Math.max(1, parseInt(url.searchParams.get("page") ?? "1", 10) || 1);
  const pageSize = Math.min(100, Math.max(1, parseInt(url.searchParams.get("pageSize") ?? "50", 10) || 50));

  const and: Record<string, unknown>[] = [];
  if (type) and.push({ wordType: type });
  if (q) {
    and.push({
      OR: [
        { arabic: { contains: q } },
        { arabicPlain: { contains: q } },
        { transliteration: { contains: q, mode: "insensitive" } },
        { translationEn: { contains: q, mode: "insensitive" } },
        { translationUr: { contains: q } },
        { rootLetters: { contains: q } },
      ],
    });
  }
  const where = and.length ? { AND: and } : {};

  const [total, words, types] = await Promise.all([
    prisma.vocabularyWord.count({ where }),
    prisma.vocabularyWord.findMany({
      where,
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.vocabularyWord.findMany({ distinct: ["wordType"], select: { wordType: true } }),
  ]);

  return NextResponse.json({
    data: {
      words,
      total,
      page,
      pageSize,
      wordTypes: Array.from(new Set([...WORD_TYPES, ...types.map((t) => t.wordType)])),
    },
  });
}

// POST /api/admin/vocabulary — create a word.
export async function POST(request: Request) {
  const writeError = getAdminWriteError(request);
  if (writeError) return writeError;

  const parsed = vocabSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid word payload.", code: "invalid_input", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const word = await prisma.vocabularyWord.create({
    data: {
      ...parsed.data,
      gender: parsed.data.gender ?? null,
      pluralForm: parsed.data.pluralForm ?? null,
      rootLetters: parsed.data.rootLetters ?? null,
      frequencyInQuran: parsed.data.frequencyInQuran ?? null,
      audioUrl: parsed.data.audioUrl ?? null,
      imageUrl: parsed.data.imageUrl ?? null,
    },
  });

  return NextResponse.json({ data: { word } }, { status: 201 });
}
