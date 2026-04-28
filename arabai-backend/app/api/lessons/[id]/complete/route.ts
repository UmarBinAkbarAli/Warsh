import { NextResponse } from "next/server";
import { prisma } from "../../../../../lib/prisma";
import { getUserIdFromRequest } from "../../../../../lib/auth";
import { isTodayPKT, isYesterdayPKT } from "../../../../../lib/date";

interface Props {
  params: { id: string };
}

export async function POST(request: Request, { params }: Props) {
  const userId = getUserIdFromRequest(request);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized", code: "unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { score } = body;
  if (typeof score !== "number") {
    return NextResponse.json({ error: "Missing score", code: "bad_request" }, { status: 400 });
  }

  const lesson = await prisma.lesson.findUnique({ where: { id: params.id } });
  if (!lesson) {
    return NextResponse.json({ error: "Lesson not found", code: "not_found" }, { status: 404 });
  }

  const existingProgress = await prisma.progress.findUnique({ where: { userId_lessonId: { userId, lessonId: lesson.id } } });
  const firstCompletion = !existingProgress?.completed;
  const baseXp = lesson.xpReward;
  const bonusXp = score === 100 && firstCompletion ? 5 : 0;
  const xpEarned = firstCompletion ? baseXp + bonusXp : 0;

  await prisma.$transaction(async (tx: any) => {
    if (!existingProgress) {
      await tx.progress.create({
        data: {
          userId,
          lessonId: lesson.id,
          completed: true,
          score,
          attempts: 1,
          xpEarned,
          completedAt: new Date()
        }
      });
    } else {
      await tx.progress.update({
        where: { id: existingProgress.id },
        data: {
          completed: true,
          score,
          attempts: existingProgress.attempts + 1,
          xpEarned: existingProgress.xpEarned || xpEarned,
          completedAt: existingProgress.completed ? existingProgress.completedAt : new Date()
        }
      });
    }

    if (xpEarned > 0) {
      await tx.user.update({ where: { id: userId }, data: { xp: { increment: xpEarned } } });
    }

    const currentStreakRecord = await tx.streak.findUnique({ where: { userId } });
    const now = new Date();

    if (!currentStreakRecord) {
      await tx.streak.create({
        data: { userId, currentStreak: 1, longestStreak: 1, lastActiveDate: now }
      });
    } else {
      const lastActive = currentStreakRecord.lastActiveDate ? new Date(currentStreakRecord.lastActiveDate) : null;
      if (lastActive && isTodayPKT(lastActive)) {
        await tx.streak.update({ where: { userId }, data: { lastActiveDate: now } });
      } else if (lastActive && isYesterdayPKT(lastActive)) {
        const nextStreak = currentStreakRecord.currentStreak + 1;
        await tx.streak.update({
          where: { userId },
          data: {
            currentStreak: nextStreak,
            longestStreak: Math.max(currentStreakRecord.longestStreak, nextStreak),
            lastActiveDate: now
          }
        });
      } else {
        await tx.streak.update({
          where: { userId },
          data: {
            currentStreak: 1,
            lastActiveDate: now
          }
        });
      }
    }
  });

  const user = await prisma.user.findUnique({ where: { id: userId } });
  return NextResponse.json({ data: { xpEarned, totalXp: user?.xp ?? 0, newAchievements: [], streakUpdated: true } });
}
