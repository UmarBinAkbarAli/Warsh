import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  // Prefer words with a quranic example; rotate deterministically by calendar day
  const words = await prisma.vocabularyWord.findMany({
    orderBy: { sortOrder: "asc" },
  });

  if (words.length === 0) {
    return NextResponse.json({ error: "No vocabulary words found", code: "not_found" }, { status: 404 });
  }

  const dayIndex = Math.floor(Date.now() / (24 * 60 * 60 * 1000));
  const quranicWords = words.filter((w: any) => w.quranicExample !== null);
  const pool = quranicWords.length > 0 ? quranicWords : words;
  const word = pool[dayIndex % pool.length];

  return NextResponse.json({ data: word });
}
