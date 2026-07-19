import { NextResponse } from "next/server";
import { getAdminWriteError } from "../../../../../lib/admin";
import { prisma } from "../../../../../lib/prisma";
import { vocabSchema } from "../../../../../lib/admin-content-schemas";

interface Props {
  params: { id: string };
}

export async function PATCH(request: Request, { params }: Props) {
  const writeError = getAdminWriteError(request);
  if (writeError) return writeError;

  const parsed = vocabSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid word payload.", code: "invalid_input", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const existing = await prisma.vocabularyWord.findUnique({ where: { id: params.id }, select: { id: true } });
  if (!existing) {
    return NextResponse.json({ error: "Word not found.", code: "not_found" }, { status: 404 });
  }

  const word = await prisma.vocabularyWord.update({
    where: { id: params.id },
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

  return NextResponse.json({ data: { word } });
}

// DELETE — removes the word and any per-user SRS state for it (no ON DELETE
// cascade from UserVocabularyWord → VocabularyWord).
export async function DELETE(request: Request, { params }: Props) {
  const writeError = getAdminWriteError(request);
  if (writeError) return writeError;

  const existing = await prisma.vocabularyWord.findUnique({ where: { id: params.id }, select: { id: true } });
  if (!existing) {
    return NextResponse.json({ error: "Word not found.", code: "not_found" }, { status: 404 });
  }

  await prisma.$transaction([
    prisma.userVocabularyWord.deleteMany({ where: { wordId: params.id } }),
    prisma.vocabularyWord.delete({ where: { id: params.id } }),
  ]);

  return NextResponse.json({ data: { ok: true } });
}
