import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";
import { getUserIdFromRequest } from "../../../lib/auth";

export async function GET(request: Request) {
  const userId = await getUserIdFromRequest(request);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized", code: "unauthorized" }, { status: 401 });
  }

  const [all, earned] = await Promise.all([
    prisma.achievement.findMany({ where: { status: "PUBLISHED" }, orderBy: { key: "asc" } }),
    prisma.userAchievement.findMany({
      where: { userId },
      include: { achievement: { select: { key: true } } },
    }),
  ]);

  const earnedKeys = new Set(earned.map((ua) => ua.achievement.key));
  const earnedDates = new Map(earned.map((ua) => [ua.achievement.key, ua.unlockedAt]));

  return NextResponse.json({
    data: {
      achievements: all.map((a) => ({
        key: a.key,
        title: a.title,
        description: a.description,
        icon: a.icon,
        xpReward: a.xpReward,
        earned: earnedKeys.has(a.key),
        unlockedAt: earnedDates.get(a.key) ?? null,
      })),
    },
  });
}
