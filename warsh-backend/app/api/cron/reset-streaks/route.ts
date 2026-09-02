import { NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";
import { prisma } from "../../../../lib/prisma";
import {
  get4amPKTBoundary,
  getPrevious4amPKTBoundary,
} from "../../../../lib/date";
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

  // Of the two crons this is the one that touches every learner every day, so
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
  const currentBoundary = get4amPKTBoundary(now);
  const previousBoundary = getPrevious4amPKTBoundary(now);

  // At the start of a new streak day, reset only users who missed the entire
  // 04:00-to-04:00 day that just ended.
  //
  // Every database call here is wrapped: this job runs at 04:00 PKT, when no
  // traffic has kept Neon's compute awake, and the connection error that comes
  // back from a suspended endpoint used to kill the run outright. Both writes
  // below move the row out of this selection, so a retry — or tomorrow's run
  // after a hard failure — picks up only what is genuinely left.
  const staleStreaks = await withDbRetry("cron/reset-streaks:select", () =>
    prisma.streak.findMany({
      where: {
        currentStreak: { gt: 0 },
        OR: [
          { lastActiveDate: null },
          { lastActiveDate: { lt: previousBoundary } },
        ],
      },
      select: { id: true, userId: true, currentStreak: true, streakFreezes: true, lastActiveDate: true },
    }),
  );

  let reset = 0;
  let frozen = 0;

  for (const streak of staleStreaks) {
    if (streak.streakFreezes > 0) {
      // Consume a freeze — streak survives
      await withDbRetry("cron/reset-streaks:freeze", () =>
        prisma.streak.update({
          where: { id: streak.id },
          data: {
            streakFreezes: streak.streakFreezes - 1,
            lastFreezeUsedAt: currentBoundary,
            // The virtual activity belongs to the missed day, so a lesson in
            // the newly opened day increments normally without granting an
            // additional free day.
            lastActiveDate: previousBoundary,
          },
        }),
      );
      frozen++;
    } else {
      // No freeze — reset streak
      await withDbRetry("cron/reset-streaks:reset", () =>
        prisma.streak.update({
          where: { id: streak.id },
          data: { currentStreak: 0 },
        }),
      );
      reset++;
    }
  }

  return NextResponse.json({ data: { processed: staleStreaks.length, reset, frozen } });
}
