import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";
import { getUserIdFromRequest } from "../../../lib/auth";

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

  const [user, progress, streak] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId }, select: { xp: true, level: true } }),
    prisma.progress.findMany({ where: { userId, completed: true }, select: { lessonId: true } }),
    prisma.streak.findUnique({ where: { userId }, select: { currentStreak: true, longestStreak: true, lastActiveDate: true } })
  ]);

  return NextResponse.json({
    data: {
      xp: user?.xp ?? 0,
      level: getLevel(user?.xp ?? 0),
      streak: streak ? streak.currentStreak : 0,
      longestStreak: streak?.longestStreak ?? 0,
      lastActiveDate: streak?.lastActiveDate ?? null,
      completedLessons: progress.map((item: any) => item.lessonId),
      achievements: []
    }
  });
}
