import { NextResponse } from "next/server";
import { prisma } from "../../../../../../lib/prisma";
import { getUserIdFromRequest } from "../../../../../../lib/auth";

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const userId = getUserIdFromRequest(request);
  if (!userId) return NextResponse.json({ error: "Unauthorized", code: "unauthorized" }, { status: 401 });

  const word = await prisma.vocabularyWord.findUnique({ where: { id: params.id }, select: { id: true } });
  if (!word) return NextResponse.json({ error: "Word not found", code: "not_found" }, { status: 404 });

  const body = await request.json();
  const { isFavorite, isHidden, markForReview } = body;

  const updateData: Record<string, unknown> = {};
  if (typeof isFavorite === "boolean") updateData.isFavorite = isFavorite;
  if (typeof isHidden === "boolean") {
    updateData.isHidden = isHidden;
    if (isHidden) {
      // Set next review far in future so it never surfaces
      updateData.nextReviewDate = new Date("2099-01-01");
    }
  }
  if (markForReview === true) {
    updateData.nextReviewDate = new Date();
    updateData.isHidden = false;
  }

  const userWord = await prisma.userVocabularyWord.upsert({
    where: { userId_wordId: { userId, wordId: params.id } },
    create: { userId, wordId: params.id, ...updateData },
    update: updateData,
  });

  return NextResponse.json({ data: userWord });
}
