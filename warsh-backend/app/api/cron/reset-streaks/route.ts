import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import {
  get4amPKTBoundary,
  getPrevious4amPKTBoundary,
} from "../../../../lib/date";
import { timingSafeStringEqual } from "../../../../lib/auth";

// Cron endpoints mutate rows on GET (Vercel Cron only issues GET), so no cache
// layer may ever serve or replay this response.
export const dynamic = "force-dynamic";
export const revalidate = 0;

// Vercel cron: runs daily at 23:00 UTC = 04:00 PKT
export async function GET(request: Request) {
  const secret = request.headers.get("authorization") ?? "";
  if (!process.env.CRON_SECRET || !timingSafeStringEqual(secret, `Bearer ${process.env.CRON_SECRET}`)) {
    return NextResponse.json({ error: "Unauthorized", code: "unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const currentBoundary = get4amPKTBoundary(now);
  const previousBoundary = getPrevious4amPKTBoundary(now);

  // At the start of a new streak day, reset only users who missed the entire
  // 04:00-to-04:00 day that just ended.
  const staleStreaks = await prisma.streak.findMany({
    where: {
      currentStreak: { gt: 0 },
      OR: [
        { lastActiveDate: null },
        { lastActiveDate: { lt: previousBoundary } },
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
          lastFreezeUsedAt: currentBoundary,
          // The virtual activity belongs to the missed day, so a lesson in
          // the newly opened day increments normally without granting an
          // additional free day.
          lastActiveDate: previousBoundary,
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
