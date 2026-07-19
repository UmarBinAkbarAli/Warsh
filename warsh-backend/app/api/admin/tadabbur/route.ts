import { NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import { getAdminReadError, getAdminWriteError } from "../../../../lib/admin";
import { prisma } from "../../../../lib/prisma";
import { tadabburCreateSchema } from "../../../../lib/admin-content-schemas";

// GET /api/admin/tadabbur — list surahs (metadata only, no heavy ayatData).
export async function GET(request: Request) {
  const readError = getAdminReadError(request);
  if (readError) return readError;

  const surahs = await prisma.tadabburSurah.findMany({
    orderBy: { orderInProg: "asc" },
    select: {
      id: true,
      orderInProg: true,
      surahNumber: true,
      nameAr: true,
      nameEn: true,
      meaningEn: true,
      totalAyat: true,
      status: true,
      publishedAt: true,
      _count: { select: { userProgress: true } },
    },
  });

  return NextResponse.json({
    data: surahs.map((s) => ({
      id: s.id,
      orderInProg: s.orderInProg,
      surahNumber: s.surahNumber,
      nameAr: s.nameAr,
      nameEn: s.nameEn,
      meaningEn: s.meaningEn,
      totalAyat: s.totalAyat,
      status: s.status,
      publishedAt: s.publishedAt,
      learners: s._count.userProgress,
    })),
  });
}

// POST /api/admin/tadabbur — create a surah.
export async function POST(request: Request) {
  const writeError = getAdminWriteError(request);
  if (writeError) return writeError;

  const parsed = tadabburCreateSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid surah payload.", code: "invalid_input", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const clash = await prisma.tadabburSurah.findFirst({
    where: { OR: [{ orderInProg: parsed.data.orderInProg }, { surahNumber: parsed.data.surahNumber }] },
    select: { id: true },
  });
  if (clash) {
    return NextResponse.json(
      { error: "A surah with this order or surah number already exists.", code: "duplicate" },
      { status: 409 },
    );
  }

  const surah = await prisma.tadabburSurah.create({
    data: { ...parsed.data, ayatData: parsed.data.ayatData as Prisma.InputJsonValue },
  });
  return NextResponse.json({ data: { surah } }, { status: 201 });
}
