import { NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import { getAdminReadError, getAdminWriteError } from "../../../../../lib/admin";
import { prisma } from "../../../../../lib/prisma";
import { tadabburUpdateSchema as updateSchema } from "../../../../../lib/admin-content-schemas";

interface Props {
  params: { id: string };
}

// GET /api/admin/tadabbur/[id] — full record including ayatData (for the editor).
export async function GET(request: Request, { params }: Props) {
  const readError = getAdminReadError(request);
  if (readError) return readError;

  const surah = await prisma.tadabburSurah.findUnique({ where: { id: params.id } });
  if (!surah) {
    return NextResponse.json({ error: "Surah not found.", code: "not_found" }, { status: 404 });
  }
  return NextResponse.json({ data: { surah } });
}

export async function PATCH(request: Request, { params }: Props) {
  const writeError = getAdminWriteError(request);
  if (writeError) return writeError;

  const parsed = updateSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid surah payload.", code: "invalid_input", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const clash = await prisma.tadabburSurah.findFirst({
    where: {
      id: { not: params.id },
      OR: [{ orderInProg: parsed.data.orderInProg }, { surahNumber: parsed.data.surahNumber }],
    },
    select: { id: true },
  });
  if (clash) {
    return NextResponse.json(
      { error: "Another surah already uses this order or surah number.", code: "duplicate" },
      { status: 409 },
    );
  }

  const surah = await prisma.tadabburSurah.update({
    where: { id: params.id },
    data: { ...parsed.data, ayatData: parsed.data.ayatData as Prisma.InputJsonValue },
  });
  return NextResponse.json({ data: { surah } });
}

// DELETE — removes the surah and any learner progress on it.
export async function DELETE(request: Request, { params }: Props) {
  const writeError = getAdminWriteError(request);
  if (writeError) return writeError;

  const existing = await prisma.tadabburSurah.findUnique({ where: { id: params.id }, select: { id: true } });
  if (!existing) {
    return NextResponse.json({ error: "Surah not found.", code: "not_found" }, { status: 404 });
  }

  await prisma.$transaction([
    prisma.userSurahProgress.deleteMany({ where: { surahId: params.id } }),
    prisma.tadabburSurah.delete({ where: { id: params.id } }),
  ]);

  return NextResponse.json({ data: { ok: true } });
}
