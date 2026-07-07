import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { getUserIdFromRequest } from "../../../../lib/auth";
import { getPKTDateString, isYesterdayPKT, isTodayPKT } from "../../../../lib/date";

export async function POST(request: Request) {
  const userId = await getUserIdFromRequest(request);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized", code: "unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const providedLastActive = typeof body.lastActiveDate === "string" ? new Date(body.lastActiveDate) : null;
  const now = new Date();
  const nowString = getPKTDateString(now);

  const current = await prisma.streak.findUnique({ where: { userId } });
  if (!current) {
    const newStreak = await prisma.streak.create({ data: { userId, currentStreak: 0, longestStreak: 0, lastActiveDate: null } });
    return NextResponse.json({ data: { currentStreak: newStreak.currentStreak, longestStreak: newStreak.longestStreak, streakBroken: false } });
  }

  const providedDate = providedLastActive ? new Date(providedLastActive) : null;
  const clientDateIsToday = providedDate ? isTodayPKT(providedDate) : false;
  const clientDateIsYesterday = providedDate ? isYesterdayPKT(providedDate) : false;
  let streakBroken = false;

  if (current.lastActiveDate) {
    const lastActive = new Date(current.lastActiveDate);
    if (!isTodayPKT(lastActive) && !isYesterdayPKT(lastActive)) {
      await prisma.streak.update({ where: { userId }, data: { currentStreak: 0, streakFreezes: current.streakFreezes, lastActiveDate: now } });
      streakBroken = true;
    } else if (isYesterdayPKT(lastActive) && !clientDateIsToday) {
      await prisma.streak.update({ where: { userId }, data: { currentStreak: current.currentStreak, lastActiveDate: now } });
    }
  }

  const updated = await prisma.streak.findUnique({ where: { userId } });
  return NextResponse.json({ data: { currentStreak: updated?.currentStreak ?? 0, longestStreak: updated?.longestStreak ?? 0, streakBroken } });
}
