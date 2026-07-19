import { NextResponse } from "next/server";
import { getAdminReadError } from "../../../../../lib/admin";
import { prisma } from "../../../../../lib/prisma";
import { getSubscriptionState } from "../../../../../lib/subscription";

interface Props {
  params: { id: string };
}

// GET /api/admin/users/[id] — full profile + engagement + support context.
export async function GET(request: Request, { params }: Props) {
  const readError = getAdminReadError(request);
  if (readError) return readError;

  const user = await prisma.user.findUnique({
    where: { id: params.id },
    include: {
      streak: true,
      promoRedemptions: { include: { promoCode: { select: { code: true, freeDays: true } } }, orderBy: { createdAt: "desc" } },
      achievements: { include: { achievement: { select: { title: true, icon: true } } }, orderBy: { unlockedAt: "desc" } },
    },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found.", code: "not_found" }, { status: 404 });
  }

  const [progressAgg, completedCount, startedCount, recentProgress, noorCount] = await Promise.all([
    prisma.progress.aggregate({ where: { userId: user.id }, _sum: { xpEarned: true } }),
    prisma.progress.count({ where: { userId: user.id, completed: true } }),
    prisma.progress.count({ where: { userId: user.id, status: { not: "NOT_STARTED" } } }),
    prisma.progress.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 8,
      include: { lesson: { select: { title: true, chapter: { select: { order: true } } } } },
    }),
    prisma.chatMessage.count({ where: { userId: user.id } }),
  ]);

  const sub = getSubscriptionState(user);

  return NextResponse.json({
    data: {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        nativeLanguage: user.nativeLanguage,
        translationLanguage: user.translationLanguage,
        goal: user.goal,
        level: user.level,
        xp: user.xp,
        gems: user.gems,
        dailyGoalMinutes: user.dailyGoalMinutes,
        phrasesSpoken: user.phrasesSpoken,
        createdAt: user.createdAt.toISOString(),
        trialStartAt: user.trialStartAt.toISOString(),
        trialExpiresAt: user.trialExpiresAt.toISOString(),
        subscriptionStatus: user.subscriptionStatus,
        subscriptionProductId: user.subscriptionProductId,
        subscriptionActiveUntil: user.subscriptionActiveUntil?.toISOString() ?? null,
        noorOverageBalance: user.noorOverageBalance,
      },
      access: {
        hasAccess: sub.hasAccess,
        effectiveStatus: sub.subscriptionStatus,
        trialDaysRemaining: sub.trialDaysRemaining,
        subscriptionActive: sub.subscriptionActive,
      },
      streak: user.streak
        ? {
            currentStreak: user.streak.currentStreak,
            longestStreak: user.streak.longestStreak,
            lastActiveDate: user.streak.lastActiveDate?.toISOString() ?? null,
            streakFreezes: user.streak.streakFreezes,
          }
        : null,
      learning: {
        started: startedCount,
        completed: completedCount,
        xpFromLessons: progressAgg._sum.xpEarned ?? 0,
        recent: recentProgress.map((p) => ({
          title: p.lesson.title,
          chapterOrder: p.lesson.chapter.order,
          status: p.status,
          completed: p.completed,
          when: p.createdAt.toISOString(),
        })),
      },
      noorMessages: noorCount,
      achievements: user.achievements.map((ua) => ({
        title: ua.achievement.title,
        icon: ua.achievement.icon,
        unlockedAt: ua.unlockedAt.toISOString(),
      })),
      promoRedemptions: user.promoRedemptions.map((r) => ({
        code: r.promoCode.code,
        freeDays: r.promoCode.freeDays,
        when: r.createdAt.toISOString(),
      })),
    },
  });
}
