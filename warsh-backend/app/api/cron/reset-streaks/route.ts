import { NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";
import { prisma } from "../../../../lib/prisma";
import { getPrevious4amPKTBoundary } from "../../../../lib/date";
import { resolveMissedStreakDays } from "../../../../lib/streak";
import { timingSafeStringEqual } from "../../../../lib/auth";
import { withDbRetry } from "../../../../lib/dbRetry";

// Cron endpoints mutate rows on GET (Vercel Cron only issues GET), so no cache
// layer may ever serve or replay this response.
export const dynamic = "force-dynamic";
export const revalidate = 0;

// This walks every stale streak one row at a time and each step carries a retry
// budget for a cold Neon compute, so the default allowance is far too tight.
export const maxDuration = 60;

const MONITOR_SLUG = "apicronreset-streaks";

// Vercel cron: runs daily at 23:00 UTC = 04:00 PKT
export async function GET(request: Request) {
  const secret = request.headers.get("authorization") ?? "";
  if (!process.env.CRON_SECRET || !timingSafeStringEqual(secret, `Bearer ${process.env.CRON_SECRET}`)) {
    // Outside the monitor on purpose: an unauthorised probe must not register a
    // check-in and paint a failed night green.
    return NextResponse.json({ error: "Unauthorized", code: "unauthorized" }, { status: 401 });
  }

  // Of the daily crons this is the one that touches every learner every day, so
  // it gets the organisation's single monitor seat. A 55-minute margin because
  // the platform treats a daily schedule as "some time inside that hour" —
  // observed check-ins have landed anywhere from :02 to :50 — and a one-minute
  // window reported every one of them as missed.
  return Sentry.withMonitor(MONITOR_SLUG, () => runResetStreaks(), {
    schedule: { type: "crontab", value: "0 23 * * *" },
    checkinMargin: 55,
    maxRuntime: 5,
    timezone: "Etc/UTC",
  });
}

async function runResetStreaks() {
  const now = new Date();
  const previousBoundary = getPrevious4amPKTBoundary(now);

  // At the start of a new streak day, act only on users who missed at least
  // one entire 04:00-to-04:00 day.
  //
  // Every database call here is wrapped: this job runs at 04:00 PKT, when no
  // traffic has kept Neon's compute awake, and the connection error that comes
  // back from a suspended endpoint used to kill the run outright. Both writes
  // below move the row out of this selection, so a retry — or tomorrow's run
  // after a hard failure — picks up only what is genuinely left, and
  // resolveMissedStreakDays counts every day a failed night left behind.
  const staleStreaks = await withDbRetry("cron/reset-streaks:select", () =>
    prisma.streak.findMany({
      where: {
        currentStreak: { gt: 0 },
        OR: [
          { lastActiveDate: null },
          { lastActiveDate: { lt: previousBoundary } },
        ],
      },
      select: { id: true, streakFreezes: true, lastActiveDate: true },
    }),
  );

  let reset = 0;
  let frozen = 0;
  let skipped = 0;

  for (const streak of staleStreaks) {
    const resolution = resolveMissedStreakDays(streak, now);
    if (!resolution) continue;

    // The run lands anywhere in 04:00–04:59 PKT, so a learner can finish a
    // lesson between the read above and this write. Matching the row on the
    // snapshot makes the write a no-op once it has moved: the lesson already
    // settled the gap, and an unconditional update would erase today's
    // activity (or zero the streak it just restarted).
    const snapshot = {
      id: streak.id,
      currentStreak: { gt: 0 },
      streakFreezes: streak.streakFreezes,
      lastActiveDate: streak.lastActiveDate,
    };
    const { count } = await withDbRetry(`cron/reset-streaks:${resolution.action}`, () =>
      prisma.streak.updateMany({
        where: snapshot,
        data:
          resolution.action === "freeze"
            ? {
                streakFreezes: resolution.streakFreezes,
                lastFreezeUsedAt: resolution.lastFreezeUsedAt,
                lastActiveDate: resolution.lastActiveDate,
              }
            : { currentStreak: 0 },
      }),
    );

    if (count === 0) skipped++;
    else if (resolution.action === "freeze") frozen++;
    else reset++;
  }

  return NextResponse.json({ data: { processed: staleStreaks.length, reset, frozen, skipped } });
}
