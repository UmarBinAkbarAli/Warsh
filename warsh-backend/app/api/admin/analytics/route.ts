import { NextResponse } from "next/server";
import { getAdminReadError } from "../../../../lib/admin";
import { prisma } from "../../../../lib/prisma";

export const dynamic = "force-dynamic";

// GET /api/admin/analytics — aggregate overview metrics for the dashboard home.
export async function GET(request: Request) {
  const readError = getAdminReadError(request);
  if (readError) return readError;

  const now = new Date();
  const daysAgo = (n: number) => new Date(now.getTime() - n * 24 * 60 * 60 * 1000);
  const last7 = daysAgo(7);
  const last30 = daysAgo(30);
  const last90 = daysAgo(90);

  const [
    totalUsers,
    newLast7,
    newLast30,
    newLast90,
    subGroups,
    recentSignups,
    streakAgg,
    activeStreaks,
    activeLearners7,
    completedProgress,
    inProgress,
    completionsByLesson,
    startedByLesson,
    lessons,
    chapters,
    vocabCount,
    tadabburCount,
    achievementCount,
    noorTotal,
    noorLast7,
    noorUsers,
    xpAgg,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { createdAt: { gte: last7 } } }),
    prisma.user.count({ where: { createdAt: { gte: last30 } } }),
    prisma.user.count({ where: { createdAt: { gte: last90 } } }),
    prisma.user.groupBy({ by: ["subscriptionStatus"], _count: { _all: true } }),
    prisma.user.findMany({ where: { createdAt: { gte: last30 } }, select: { createdAt: true } }),
    prisma.streak.aggregate({ _avg: { currentStreak: true }, _max: { longestStreak: true } }),
    prisma.streak.count({ where: { currentStreak: { gt: 0 } } }),
    prisma.progress.findMany({
      where: { OR: [{ completedAt: { gte: last7 } }, { createdAt: { gte: last7 } }] },
      select: { userId: true },
      distinct: ["userId"],
    }),
    prisma.progress.count({ where: { completed: true } }),
    prisma.progress.count({ where: { completed: false, status: { not: "NOT_STARTED" } } }),
    prisma.progress.groupBy({ by: ["lessonId"], where: { completed: true }, _count: { _all: true } }),
    prisma.progress.groupBy({ by: ["lessonId"], where: { status: { not: "NOT_STARTED" } }, _count: { _all: true } }),
    prisma.lesson.findMany({ select: { id: true, title: true, order: true, chapter: { select: { order: true, title: true } } } }),
    prisma.chapter.count(),
    prisma.vocabularyWord.count(),
    prisma.tadabburSurah.count(),
    prisma.achievement.count(),
    prisma.chatMessage.count(),
    prisma.chatMessage.count({ where: { createdAt: { gte: last7 } } }),
    prisma.chatMessage.findMany({ select: { userId: true }, distinct: ["userId"] }),
    prisma.user.aggregate({ _sum: { xp: true }, _avg: { xp: true } }),
  ]);

  // Signups per day for the last 30 days.
  const signupBuckets: Record<string, number> = {};
  for (let i = 29; i >= 0; i--) {
    signupBuckets[daysAgo(i).toISOString().slice(0, 10)] = 0;
  }
  for (const u of recentSignups) {
    const key = u.createdAt.toISOString().slice(0, 10);
    if (key in signupBuckets) signupBuckets[key] += 1;
  }
  const signupsPerDay = Object.entries(signupBuckets).map(([date, count]) => ({ date, count }));

  // Lesson drop-off: started vs completed, worst offenders first.
  const completedMap = new Map(completionsByLesson.map((r) => [r.lessonId, r._count._all]));
  const startedMap = new Map(startedByLesson.map((r) => [r.lessonId, r._count._all]));
  const lessonMap = new Map(lessons.map((l) => [l.id, l]));

  const dropoff = Array.from(startedMap.entries())
    .map(([lessonId, started]) => {
      const completed = completedMap.get(lessonId) ?? 0;
      const l = lessonMap.get(lessonId);
      const dropped = Math.max(0, started - completed);
      return {
        lessonId,
        title: l?.title ?? "(unknown)",
        chapterOrder: l?.chapter?.order ?? 0,
        chapterTitle: l?.chapter?.title ?? "",
        lessonOrder: l?.order ?? 0,
        started,
        completed,
        dropped,
        dropRate: started > 0 ? Math.round((dropped / started) * 100) : 0,
      };
    })
    .filter((d) => d.started >= 1)
    .sort((a, b) => b.dropped - a.dropped || b.dropRate - a.dropRate)
    .slice(0, 12);

  const subscriptionBreakdown = subGroups
    .map((g) => ({ status: g.subscriptionStatus, count: g._count._all }))
    .sort((a, b) => b.count - a.count);

  const activeSubs =
    (subscriptionBreakdown.find((s) => s.status === "active")?.count ?? 0) +
    (subscriptionBreakdown.find((s) => s.status === "grace")?.count ?? 0);

  return NextResponse.json({
    data: {
      generatedAt: now.toISOString(),
      users: {
        total: totalUsers,
        newLast7,
        newLast30,
        newLast90,
        activeSubs,
        subscriptionBreakdown,
      },
      signupsPerDay,
      engagement: {
        activeLearners7: activeLearners7.length,
        usersWithStreak: activeStreaks,
        avgCurrentStreak: Math.round((streakAgg._avg.currentStreak ?? 0) * 10) / 10,
        longestStreak: streakAgg._max.longestStreak ?? 0,
        totalXp: xpAgg._sum.xp ?? 0,
        avgXp: Math.round(xpAgg._avg.xp ?? 0),
      },
      learning: {
        completedLessons: completedProgress,
        inProgressLessons: inProgress,
        dropoff,
      },
      content: {
        chapters,
        lessons: lessons.length,
        vocabulary: vocabCount,
        tadabburSurahs: tadabburCount,
        achievements: achievementCount,
      },
      noor: {
        totalMessages: noorTotal,
        messagesLast7: noorLast7,
        usersEngaged: noorUsers.length,
      },
    },
  });
}
