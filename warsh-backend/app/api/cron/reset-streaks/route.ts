import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { get4amPKTBoundary } from "../../../../lib/date";

// Vercel cron: runs daily at 23:00 UTC = 04:00 PKT
export async function GET(request: Request) {
  const secret = request.headers.get("authorization");
  if (secret !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const todayStart = get4amPKTBoundary();

  // Find all streak records where the user was NOT active today
  const staleStreaks = await prisma.streak.findMany({
    where: {
      currentStreak: { gt: 0 },
      OR: [
        { lastActiveDate: null },
        { lastActiveDate: { lt: todayStart } },
      ],
    },
    select: { id: true, userId: true, currentStreak: true, streakFreezes: true, lastActiveDate: true },
  });

  let reset = 0;
  let frozen = 0;

  for (const streak of staleStreaks) {
    if (streak.streakFreezes > 0) {
      // Consume a freeze — streak survives
      await prisma.streak.update({
        where: { id: streak.id },
        data: {
          streakFreezes: streak.streakFreezes - 1,
          lastFreezeUsedAt: new Date(),
          lastActiveDate: new Date(),
        },
      });
      frozen++;
    } else {
      // No freeze — reset streak
      await prisma.streak.update({
        where: { id: streak.id },
        data: { currentStreak: 0 },
      });
      reset++;
    }
  }

  return NextResponse.json({ data: { processed: staleStreaks.length, reset, frozen } });
}
