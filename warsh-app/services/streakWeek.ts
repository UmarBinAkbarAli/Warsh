// A streak day runs 04:00 PKT → 03:59:59 PKT (backend lib/date.ts), i.e. a
// calendar day in UTC+1. Every screen that draws "this week" must use this so
// the completion screen and Streak detail can never disagree again.
const DAY_MS = 24 * 60 * 60 * 1000;
const STREAK_DAY_OFFSET_MS = 60 * 60 * 1000;

export function streakDayIndex(date: Date): number {
  return Math.floor((date.getTime() + STREAK_DAY_OFFSET_MS) / DAY_MS);
}

/** Monday = 0 … Sunday = 6, in streak-day terms. */
function weekdayOf(dayIndex: number): number {
  const utcDay = new Date(dayIndex * DAY_MS).getUTCDay();
  return (utcDay + 6) % 7;
}

export interface StreakWeek {
  /** Seven flags, Monday first: was this day part of the current streak? */
  done: boolean[];
  todayIndex: number;
}

/**
 * The streak is the run of consecutive days ending on `lastActiveDate`.
 * Marks the days of that run that fall inside the current Monday–Sunday week.
 */
export function getStreakWeek(streak: number, lastActiveDate: Date | string | null, now: Date = new Date()): StreakWeek {
  const today = streakDayIndex(now);
  const todayIndex = weekdayOf(today);
  const weekStart = today - todayIndex;
  const done = Array.from({ length: 7 }, () => false);
  if (streak <= 0 || !lastActiveDate) return { done, todayIndex };

  const lastDay = streakDayIndex(new Date(lastActiveDate));
  // A streak whose last day is before yesterday has lapsed; the cron resets it.
  if (today - lastDay > 1) return { done, todayIndex };
  const firstDay = lastDay - streak + 1;
  for (let i = 0; i < 7; i += 1) {
    const day = weekStart + i;
    done[i] = day >= firstDay && day <= lastDay;
  }
  return { done, todayIndex };
}
