import { ACHIEVEMENT_KEYS, ACHIEVEMENTS_CATALOG } from "./achievements";
import { getPKTStreakDayIndex } from "./date";

const PKT_OFFSET_MS = 5 * 60 * 60 * 1000;
const STREAK_DAY_START_MS = 4 * 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;

// Day index 0 (1970-01-01) was a Thursday, so +3 puts Monday at 0.
function weekdayOf(dayIndex: number) {
  return (((dayIndex + 3) % 7) + 7) % 7;
}

function dayIndexStart(dayIndex: number) {
  return new Date(dayIndex * DAY_MS + STREAK_DAY_START_MS - PKT_OFFSET_MS);
}

/** The instant the current Monday–Sunday streak week began (Monday 04:00 PKT). */
export function getStreakWeekStart(now = new Date()): Date {
  const today = getPKTStreakDayIndex(now);
  return dayIndexStart(today - weekdayOf(today));
}

export type WeekDay = { weekday: number; done: boolean; today: boolean };

/**
 * Monday–Sunday strip for the You tab. A day counts as done when it falls
 * inside the current run of `currentStreak` days ending on the last active
 * day — the same days the streak number counts, freezes included. A streak
 * whose last active day is before yesterday has already lapsed.
 */
export function getWeekStrip(currentStreak: number, lastActiveDate: Date | null, now = new Date()): WeekDay[] {
  const today = getPKTStreakDayIndex(now);
  const monday = today - weekdayOf(today);
  const lastActive = lastActiveDate ? getPKTStreakDayIndex(lastActiveDate) : null;
  const live = lastActive != null && lastActive >= today - 1 && currentStreak > 0;
  const firstDone = live ? lastActive - currentStreak + 1 : Infinity;

  return Array.from({ length: 7 }, (_, weekday) => {
    const day = monday + weekday;
    return {
      weekday,
      done: live && day >= firstDone && day <= lastActive,
      today: day === today,
    };
  });
}

const LEVELS = [
  { level: "BEGINNER", min: 0 },
  { level: "ELEMENTARY", min: 501 },
  { level: "INTERMEDIATE", min: 2001 },
] as const;

export function getLevelProgress(xp: number) {
  const index = LEVELS.reduce((found, entry, i) => (xp >= entry.min ? i : found), 0);
  const current = LEVELS[index];
  const next = LEVELS[index + 1] ?? null;
  if (!next) {
    return { level: current.level, nextLevel: null, pointsToNext: 0, percent: 100 };
  }
  const span = next.min - current.min;
  return {
    level: current.level,
    nextLevel: next.level,
    pointsToNext: Math.max(0, next.min - xp),
    percent: Math.min(100, Math.max(0, Math.round(((xp - current.min) / span) * 100))),
  };
}

type MilestoneCounts = {
  streak: number;
  xp: number;
  lessons: number;
  phrases: number;
};

const COUNTED_MILESTONES: { key: string; unit: keyof MilestoneCounts; target: number }[] = [
  { key: ACHIEVEMENT_KEYS.FIRST_LESSON, unit: "lessons", target: 1 },
  { key: ACHIEVEMENT_KEYS.LESSONS_10, unit: "lessons", target: 10 },
  { key: ACHIEVEMENT_KEYS.STREAK_3, unit: "streak", target: 3 },
  { key: ACHIEVEMENT_KEYS.STREAK_7, unit: "streak", target: 7 },
  { key: ACHIEVEMENT_KEYS.STREAK_30, unit: "streak", target: 30 },
  { key: ACHIEVEMENT_KEYS.XP_100, unit: "xp", target: 100 },
  { key: ACHIEVEMENT_KEYS.XP_500, unit: "xp", target: 500 },
  { key: ACHIEVEMENT_KEYS.XP_1000, unit: "xp", target: 1000 },
  { key: ACHIEVEMENT_KEYS.PHRASES_10, unit: "phrases", target: 10 },
  { key: ACHIEVEMENT_KEYS.PHRASES_50, unit: "phrases", target: 50 },
  { key: ACHIEVEMENT_KEYS.PHRASES_100, unit: "phrases", target: 100 },
  { key: ACHIEVEMENT_KEYS.PHRASES_250, unit: "phrases", target: 250 },
  { key: ACHIEVEMENT_KEYS.PHRASES_500, unit: "phrases", target: 500 },
];

/** The unearned, countable milestone the learner is proportionally closest to. */
export function getNextMilestone(earned: Set<string>, counts: MilestoneCounts) {
  let best: { key: string; unit: keyof MilestoneCounts; target: number; current: number; ratio: number } | null = null;
  for (const m of COUNTED_MILESTONES) {
    if (earned.has(m.key)) continue;
    const current = Math.min(counts[m.unit], m.target);
    const ratio = current / m.target;
    if (!best || ratio > best.ratio || (ratio === best.ratio && m.target < best.target)) {
      best = { ...m, current, ratio };
    }
  }
  if (!best) return null;
  const entry = ACHIEVEMENTS_CATALOG.find((a) => a.key === best.key);
  if (!entry) return null;
  return {
    key: entry.key,
    title: entry.title,
    description: entry.description,
    icon: entry.icon,
    unit: best.unit,
    current: best.current,
    target: best.target,
  };
}
