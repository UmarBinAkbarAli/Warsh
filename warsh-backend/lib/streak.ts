import { getPKTStreakDayIndex } from "./date";

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

  // If the cron was delayed, bridge exactly one missed streak day with one
  // freeze before applying today's completion.
  if (dayGap === 2 && streak.streakFreezes > 0) {
    const nextStreak = streak.currentStreak + 1;
    const remainingFreezes = streak.streakFreezes - 1;
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
