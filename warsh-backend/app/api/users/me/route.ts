import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { getUserIdFromRequest } from "../../../../lib/auth";
import { isSupportedLanguage } from "../../../../lib/language";

const VALID_DAILY_GOALS = [5, 10, 15, 30];

export async function PATCH(request: Request) {
  const userId = await getUserIdFromRequest(request);
  if (!userId) return NextResponse.json({ error: "Unauthorized", code: "unauthorized" }, { status: 401 });

  const body = await request.json();
  const updateData: Record<string, unknown> = {};

  if (body.dailyGoalMinutes !== undefined) {
    if (!VALID_DAILY_GOALS.includes(body.dailyGoalMinutes)) {
      return NextResponse.json({ error: "dailyGoalMinutes must be 5, 10, 15, or 30", code: "bad_request" }, { status: 400 });
    }
    updateData.dailyGoalMinutes = body.dailyGoalMinutes;
  }

  if (body.nativeLanguage !== undefined) {
    if (!isSupportedLanguage(body.nativeLanguage)) {
      return NextResponse.json({ error: "nativeLanguage must be 'en' or 'ur'", code: "bad_request" }, { status: 400 });
    }
    updateData.nativeLanguage = body.nativeLanguage;
  }

  if (body.translationLanguage !== undefined) {
    if (!isSupportedLanguage(body.translationLanguage)) {
      return NextResponse.json({ error: "translationLanguage must be 'en' or 'ur'", code: "bad_request" }, { status: 400 });
    }
    updateData.translationLanguage = body.translationLanguage;
  }

  if (Object.keys(updateData).length === 0) {
    return NextResponse.json({ error: "No valid fields to update", code: "bad_request" }, { status: 400 });
  }

  const user = await prisma.user.update({
    where: { id: userId },
    data: updateData,
    select: { id: true, dailyGoalMinutes: true, nativeLanguage: true, translationLanguage: true },
  });

  return NextResponse.json({ data: user });
}

export async function DELETE(request: Request) {
  const userId = await getUserIdFromRequest(request);
  if (!userId) return NextResponse.json({ error: "Unauthorized", code: "unauthorized" }, { status: 401 });

  // Delete all user data in dependency order
  await prisma.$transaction([
    prisma.userVocabularyWord.deleteMany({ where: { userId } }),
    prisma.userAchievement.deleteMany({ where: { userId } }),
    prisma.userSurahProgress.deleteMany({ where: { userId } }),
    prisma.chatMessage.deleteMany({ where: { userId } }),
    prisma.progress.deleteMany({ where: { userId } }),
    prisma.streak.deleteMany({ where: { userId } }),
    prisma.user.delete({ where: { id: userId } }),
  ]);

  return NextResponse.json({ data: { deleted: true } });
}
