import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "../../../../lib/prisma";
import { getAdminReadError, getAdminWriteError } from "../../../../lib/admin";
import { canonicalCoreAyah, coreExampleSetSchema } from "../../../../lib/core500Examples";

export const dynamic = "force-dynamic";
export async function GET(request: Request) {
  const denied = getAdminReadError(request); if (denied) return denied;
  const n = Number(new URL(request.url).searchParams.get("set") ?? "1");
  if (!Number.isInteger(n) || n < 1 || n > 100) return NextResponse.json({ error: "Invalid set.", code: "bad_request" }, { status: 400 });
  const words = await prisma.vocabularyWord.findMany({ where: { coreSetNumber: n }, orderBy: { quranicRank: "asc" },
    select: { id: true, arabic: true, quranicRank: true, translationEn: true, translationUr: true, coreAyahExamples: { orderBy: { position: "asc" } } } });
  return NextResponse.json({ data: { words: words.map(w => ({ ...w,
    revision: w.coreAyahExamples.map(e => `${e.id}:${e.updatedAt.toISOString()}`).join("|"),
  })) } });
}
const writeSchema = z.object({ wordId: z.string().min(1), revision: z.string(), status: z.enum(["DRAFT", "PUBLISHED"]), examples: coreExampleSetSchema }).strict();
export async function PUT(request: Request) {
  const denied = getAdminWriteError(request); if (denied) return denied;
  const parsed = writeSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid examples.", code: "bad_request" }, { status: 400 });
  const { wordId, revision, status, examples } = parsed.data;
  const word = await prisma.vocabularyWord.findFirst({ where: { id: wordId, quranicRank: { not: null } }, select: { id: true } });
  if (!word) return NextResponse.json({ error: "Core word not found.", code: "word_not_found" }, { status: 404 });
  // Publishing can never save a mistyped ayah or hand-edited translation.
  try {
    const canonical = await Promise.all(examples.map(e => canonicalCoreAyah(e.surahNumber, e.ayahNumber)));
    if (examples.some((e, i) => e.arabic !== canonical[i].arabic || e.translationEn !== canonical[i].translationEn || e.translationUr !== canonical[i].translationUr)) {
      return NextResponse.json({ error: "Arabic and translations must match Quran Foundation. Re-enrich changed references first.", code: "canonical_mismatch" }, { status: 400 });
    }
  } catch { return NextResponse.json({ error: "Canonical verification is unavailable. Try again.", code: "verification_unavailable" }, { status: 503 }); }
  const saved = await prisma.$transaction(async tx => {
    await tx.$queryRaw`SELECT "id" FROM "VocabularyWord" WHERE "id" = ${wordId} FOR UPDATE`;
    const existing = await tx.core500AyahExample.findMany({ where: { wordId }, orderBy: { position: "asc" } });
    if (existing.map(e => `${e.id}:${e.updatedAt.toISOString()}`).join("|") !== revision) return false;
    await tx.core500AyahExample.deleteMany({ where: { wordId } });
    await tx.core500AyahExample.createMany({ data: examples.map((example, i) => ({ ...example, wordId, position: i + 1, status })) });
    return true;
  });
  if (!saved) return NextResponse.json({ error: "Someone updated these examples. Reload before saving.", code: "content_conflict" }, { status: 409 });
  return NextResponse.json({ data: { saved: true } });
}
