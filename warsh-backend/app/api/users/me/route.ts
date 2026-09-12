import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { getUserIdFromRequest } from "../../../../lib/auth";
import { isSupportedLanguage } from "../../../../lib/language";
import { formatDateOfBirth, isAgePermitted, isMinor, parseDateOfBirth } from "../../../../lib/age";

const VALID_DAILY_GOALS = [5, 10, 15, 30];
const VALID_STREAK_GOALS = [3, 7, 14, 30];

export async function PATCH(request: Request) {
  const userId = await getUserIdFromRequest(request);
  if (!userId) return NextResponse.json({ error: "Unauthorized", code: "unauthorized" }, { status: 401 });

  const body = await request.json();
  const updateData: Record<string, unknown> = {};

  // Kept only for app 1.0.8 and earlier, whose Settings still edit minutes.
  // Newer clients never send it: the daily unit is fixed at one lesson and
  // streakGoalDays is the single commitment (Pen section 22, Option A).
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

  if (body.streakGoalDays !== undefined) {
    if (body.streakGoalDays !== null && !VALID_STREAK_GOALS.includes(body.streakGoalDays)) {
      return NextResponse.json({ error: "streakGoalDays must be 3, 7, 14, or 30", code: "bad_request" }, { status: 400 });
    }
    updateData.streakGoalDays = body.streakGoalDays;
  }

  // Legacy accounts answer the age check here. It can be set once and never
  // cleared or changed afterwards; an under-13 answer is refused without
  // storing anything, and the app then offers deletion.
  if (body.dateOfBirth !== undefined) {
    const dateOfBirth = parseDateOfBirth(body.dateOfBirth);
    if (!dateOfBirth) {
      return NextResponse.json({ error: "dateOfBirth must be a valid YYYY-MM-DD date", code: "bad_request" }, { status: 400 });
    }
    const current = await prisma.user.findUnique({ where: { id: userId }, select: { dateOfBirth: true } });
    if (current?.dateOfBirth) {
      return NextResponse.json({ error: "Date of birth is already set", code: "date_of_birth_locked" }, { status: 409 });
    }
    if (!isAgePermitted(dateOfBirth)) {
      return NextResponse.json({ error: "Warsh is for learners aged 13 and older", code: "age_not_permitted" }, { status: 403 });
    }
    updateData.dateOfBirth = dateOfBirth;
  }

  if (Object.keys(updateData).length === 0) {
    return NextResponse.json({ error: "No valid fields to update", code: "bad_request" }, { status: 400 });
  }

  const user = await prisma.user.update({
    where: { id: userId },
    data: updateData,
    select: { id: true, dailyGoalMinutes: true, nativeLanguage: true, translationLanguage: true, streakGoalDays: true, dateOfBirth: true },
  });

  return NextResponse.json({
    data: {
      ...user,
      dateOfBirth: formatDateOfBirth(user.dateOfBirth),
      isMinor: isMinor(user.dateOfBirth),
    },
  });
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
