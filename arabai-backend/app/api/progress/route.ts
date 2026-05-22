import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";
import { getUserIdFromRequest } from "../../../lib/auth";
import { PROGRESS_STATUS } from "../../../lib/course";
import { get4amPKTBoundary, isYesterdayPKT } from "../../../lib/date";
import { getSubscriptionState } from "../../../lib/subscription";

function getLevel(xp: number) {
  if (xp >= 2001) return "INTERMEDIATE";
  if (xp >= 501) return "ELEMENTARY";
  return "BEGINNER";
}

export async function GET(request: Request) {
  const userId = getUserIdFromRequest(request);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized", code: "unauthorized" }, { status: 401 });
  }

  const todayStart = get4amPKTBoundary();

  const [user, progress, streak, earnedAchievements, todayProgress] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId }, select: { xp: true, level: true, dailyGoalMinutes: true, name: true, trialStartAt: true, trialExpiresAt: true, subscriptionStatus: true, subscriptionActiveUntil: true, subscriptionProductId: true, noorOverageBalance: true, phrasesSpoken: true } }),
    prisma.progress.findMany({ where: { userId, status: PROGRESS_STATUS.COMPLETED }, select: { lessonId: true } }),
    prisma.streak.findUnique({ where: { userId }, select: { currentStreak: true, longestStreak: true, lastActiveDate: true, streakFreezes: true, lastFreezeUsedAt: true } }),
    prisma.userAchievement.findMany({
      where: { userId },
      include: { achievement: true },
      orderBy: { unlockedAt: "asc" },
    }),
    prisma.progress.count({ where: { userId, status: PROGRESS_STATUS.COMPLETED, completedAt: { gte: todayStart } } }),
  ]);

  const fatihaPercent = 0; // Tadabbur progress now tracked via UserSurahProgress, not lesson delta

  const dailyGoalMinutes = user?.dailyGoalMinutes ?? 10;
  const dailyGoalMet = todayProgress >= 1;

  const subState = user ? getSubscriptionState(user) : null;

  return NextResponse.json({
    data: {
      userName: user?.name ?? null,
      xp: user?.xp ?? 0,
      level: getLevel(user?.xp ?? 0),
      streak: streak ? streak.currentStreak : 0,
      longestStreak: streak?.longestStreak ?? 0,
      lastActiveDate: streak?.lastActiveDate ?? null,
      streakFreezes: streak?.streakFreezes ?? 0,
      freezeUsedYesterday: streak?.lastFreezeUsedAt ? isYesterdayPKT(new Date(streak.lastFreezeUsedAt)) : false,
      completedLessons: progress.map((item: any) => item.lessonId),
      fatihaPercent,
      dailyGoalMinutes,
      lessonsCompletedToday: todayProgress,
      dailyGoalMet,
      phrasesSpoken: user?.phrasesSpoken ?? 0,
      subscription: subState,
      achievements: earnedAchievements.map((ua: any) => ({
        key: ua.achievement.key,
        title: ua.achievement.title,
        description: ua.achievement.description,
        icon: ua.achievement.icon,
        xpReward: ua.achievement.xpReward,
        unlockedAt: ua.unlockedAt,
      })),
    },
  });
}
