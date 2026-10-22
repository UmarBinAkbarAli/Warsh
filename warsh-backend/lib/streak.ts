import { get4amPKTBoundary, getPKTStreakDayIndex, getPrevious4amPKTBoundary } from "./date";

export interface StreakSnapshot {
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: Date | null;
  streakFreezes: number;
}

export interface StreakUpdate {
  currentStreak?: number;
  longestStreak?: number;
  lastActiveDate: Date;
  streakFreezes?: number;
  lastFreezeUsedAt?: Date;
}

export function shouldAwardStreakFreeze(
  newStreak: number,
  currentFreezes: number,
): boolean {
  if (currentFreezes >= 2) return false;
  return newStreak === 7 || (newStreak > 7 && newStreak % 30 === 0);
}

export function calculateLessonStreakUpdate(
  streak: StreakSnapshot,
  now: Date,
): StreakUpdate {
  // A reset record must restart at one before same-day timestamp handling.
  if (streak.currentStreak <= 0 || !streak.lastActiveDate) {
    return {
      currentStreak: 1,
      longestStreak: Math.max(streak.longestStreak, 1),
      lastActiveDate: now,
    };
  }

  const dayGap =
    getPKTStreakDayIndex(now) -
    getPKTStreakDayIndex(streak.lastActiveDate);

  if (dayGap <= 0) {
    return { lastActiveDate: now };
  }

  if (dayGap === 1) {
    const nextStreak = streak.currentStreak + 1;
    const freezeAward = shouldAwardStreakFreeze(
      nextStreak,
      streak.streakFreezes,
    );
    return {
      currentStreak: nextStreak,
      longestStreak: Math.max(streak.longestStreak, nextStreak),
      lastActiveDate: now,
      ...(freezeAward
        ? { streakFreezes: Math.min(2, streak.streakFreezes + 1) }
        : {}),
    };
  }

  // The reset cron has not run since the learner's last active day (a delayed
  // or failed night). Spend one freeze per missed day — what the nightly runs
  // would have done — before applying today's completion.
  const missedDays = dayGap - 1;
  if (streak.streakFreezes >= missedDays) {
    const nextStreak = streak.currentStreak + 1;
    const remainingFreezes = streak.streakFreezes - missedDays;
    const freezeAward = shouldAwardStreakFreeze(
      nextStreak,
      remainingFreezes,
    );
    return {
      currentStreak: nextStreak,
      longestStreak: Math.max(streak.longestStreak, nextStreak),
      lastActiveDate: now,
      lastFreezeUsedAt: now,
      streakFreezes: Math.min(
        2,
        remainingFreezes + (freezeAward ? 1 : 0),
      ),
    };
  }

  return {
    currentStreak: 1,
    longestStreak: Math.max(streak.longestStreak, 1),
    lastActiveDate: now,
  };
}

export type MissedDayResolution =
  | { action: "freeze"; missedDays: number; streakFreezes: number; lastActiveDate: Date; lastFreezeUsedAt: Date }
  | { action: "reset"; missedDays: number };

/**
 * What the 04:00 PKT reset cron does to a streak whose owner did nothing in at
 * least one whole streak day before `now`'s.
 *
 * One freeze covers one missed day. Normally the cron runs every night and sees
 * exactly one missed day, but a night it fails (a cold Neon compute outlasting
 * the retry budget) leaves two or more for the next run. Those are counted, so a
 * single freeze no longer silently covers a two-day gap, and the outcome is the
 * same as if every night had run. A reset leaves the freezes in place.
 */
export function resolveMissedStreakDays(
  streak: Pick<StreakSnapshot, "lastActiveDate" | "streakFreezes">,
  now: Date,
): MissedDayResolution | null {
  if (!streak.lastActiveDate) return { action: "reset", missedDays: 0 };

  const today = getPKTStreakDayIndex(now);
  const missedDays = today - 1 - getPKTStreakDayIndex(streak.lastActiveDate);
  if (missedDays <= 0) return null;

  if (streak.streakFreezes >= missedDays) {
    // The virtual activity belongs to the day that just ended, so a lesson in
    // the newly opened day increments normally without granting another free day.
    return {
      action: "freeze",
      missedDays,
      streakFreezes: streak.streakFreezes - missedDays,
      lastActiveDate: getPrevious4amPKTBoundary(now),
      lastFreezeUsedAt: get4amPKTBoundary(now),
    };
  }

  return { action: "reset", missedDays };
}

// Minimal shape of the transactional client the streak write needs. Keeping it
// structural avoids importing Prisma's generated transaction type here.
interface StreakWriteClient {
  streak: {
    findUnique(args: { where: { userId: string } }): Promise<StreakSnapshot | null>;
    create(args: { data: Record<string, unknown> }): Promise<unknown>;
    update(args: { where: { userId: string }; data: StreakUpdate }): Promise<unknown>;
  };
}

/**
 * Advance the user's streak for one day's completed activity.
 *
 * Both lesson completion and Quranic Core 500 set completion call this, so a
 * learner who only does their five Core 500 words today still keeps the streak
 * (product decision 2026-09-07). Same-day repeats only move `lastActiveDate`,
 * so doing a lesson AND a Core 500 set cannot double-count.
 */
export async function applyStreakForActivity(
  tx: StreakWriteClient,
  userId: string,
  now: Date,
): Promise<void> {
  const current = await tx.streak.findUnique({ where: { userId } });

  if (!current) {
    await tx.streak.create({
      data: { userId, currentStreak: 1, longestStreak: 1, lastActiveDate: now },
    });
    return;
  }

  await tx.streak.update({
    where: { userId },
    data: calculateLessonStreakUpdate(current, now),
  });
}
