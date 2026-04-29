import { NextResponse } from "next/server";
import { prisma } from "../../../../../lib/prisma";
import { getUserIdFromRequest } from "../../../../../lib/auth";
import { isTodayPKT, isYesterdayPKT } from "../../../../../lib/date";
import { getUserCourseState, PROGRESS_STATUS } from "../../../../../lib/course";

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

  const { chapterStateById } = await getUserCourseState(userId);
  if (chapterStateById.get(lesson.chapterId)?.isLocked) {
    return NextResponse.json({ error: "Chapter is locked", code: "chapter_locked" }, { status: 403 });
  }

  const existingProgress = await prisma.progress.findUnique({ where: { userId_lessonId: { userId, lessonId: lesson.id } } });
  const existingStatus = existingProgress?.status || (existingProgress?.completed ? PROGRESS_STATUS.COMPLETED : PROGRESS_STATUS.NOT_STARTED);
  const firstCompletion = existingStatus !== PROGRESS_STATUS.COMPLETED;
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
          status: PROGRESS_STATUS.COMPLETED,
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
          status: PROGRESS_STATUS.COMPLETED,
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

  const [user, streak] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId } }),
    prisma.streak.findUnique({ where: { userId } }),
  ]);

  return NextResponse.json({
    data: {
      xpEarned,
      totalXp: user?.xp ?? 0,
      newAchievements: [],
      streakUpdated: true,
      currentStreak: streak?.currentStreak ?? 0,
      longestStreak: streak?.longestStreak ?? 0,
    },
  });
}
