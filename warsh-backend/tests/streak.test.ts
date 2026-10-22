import { test } from "node:test";
import assert from "node:assert/strict";
import {
  get4amPKTBoundary,
  getPKTStreakDayIndex,
  getPrevious4amPKTBoundary,
} from "../lib/date";
import { calculateLessonStreakUpdate, resolveMissedStreakDays } from "../lib/streak";

test("the PKT streak day changes at 04:00, not midnight", () => {
  const beforeBoundary = new Date("2026-07-24T22:59:59.999Z");
  const atBoundary = new Date("2026-07-24T23:00:00.000Z");

  assert.equal(
    getPKTStreakDayIndex(beforeBoundary) + 1,
    getPKTStreakDayIndex(atBoundary),
  );
  assert.equal(
    get4amPKTBoundary(beforeBoundary).toISOString(),
    "2026-07-23T23:00:00.000Z",
  );
  assert.equal(
    get4amPKTBoundary(atBoundary).toISOString(),
    "2026-07-24T23:00:00.000Z",
  );
});

test("the reset cron waits until a complete streak day was missed", () => {
  const cronRun = new Date("2026-07-24T23:00:00.000Z");
  const previousBoundary = getPrevious4amPKTBoundary(cronRun);

  assert.equal(previousBoundary.toISOString(), "2026-07-23T23:00:00.000Z");
  assert.equal(
    new Date("2026-07-24T05:00:00.000Z") < previousBoundary,
    false,
  );
  assert.equal(
    new Date("2026-07-23T05:00:00.000Z") < previousBoundary,
    true,
  );
});

test("a completed lesson restarts a cron-reset zero streak at one", () => {
  const now = new Date("2026-07-24T05:54:58.664Z");
  const update = calculateLessonStreakUpdate(
    {
      currentStreak: 0,
      longestStreak: 3,
      lastActiveDate: new Date("2026-07-24T01:00:00.000Z"),
      streakFreezes: 0,
    },
    now,
  );

  assert.deepEqual(update, {
    currentStreak: 1,
    longestStreak: 3,
    lastActiveDate: now,
  });
});

test("consecutive 04:00-based streak days increment only once", () => {
  const firstToday = new Date("2026-07-24T23:05:00.000Z");
  const update = calculateLessonStreakUpdate(
    {
      currentStreak: 6,
      longestStreak: 6,
      lastActiveDate: new Date("2026-07-24T22:30:00.000Z"),
      streakFreezes: 0,
    },
    firstToday,
  );

  assert.deepEqual(update, {
    currentStreak: 7,
    longestStreak: 7,
    lastActiveDate: firstToday,
    streakFreezes: 1,
  });

  const secondToday = new Date("2026-07-25T08:00:00.000Z");
  assert.deepEqual(
    calculateLessonStreakUpdate(
      {
        currentStreak: 7,
        longestStreak: 7,
        lastActiveDate: firstToday,
        streakFreezes: 1,
      },
      secondToday,
    ),
    { lastActiveDate: secondToday },
  );
});

// The cron fires somewhere in 04:00–04:59 PKT on 2026-07-25, opening the
// streak day that runs to 03:59:59 PKT on the 26th.
const cronRun = new Date("2026-07-24T23:20:00.000Z");
const dayJustEnded = "2026-07-23T23:00:00.000Z";

test("the cron leaves a learner who was active in the day that just ended", () => {
  assert.equal(
    resolveMissedStreakDays(
      { lastActiveDate: new Date("2026-07-24T22:59:00.000Z"), streakFreezes: 0 },
      cronRun,
    ),
    null,
  );
});

test("one missed day spends one freeze and dates the activity to that day", () => {
  assert.deepEqual(
    resolveMissedStreakDays(
      { lastActiveDate: new Date("2026-07-23T10:00:00.000Z"), streakFreezes: 2 },
      cronRun,
    ),
    {
      action: "freeze",
      missedDays: 1,
      streakFreezes: 1,
      lastActiveDate: new Date(dayJustEnded),
      lastFreezeUsedAt: new Date("2026-07-24T23:00:00.000Z"),
    },
  );
});

test("after a failed night one freeze no longer covers two missed days", () => {
  // Last active on the streak day of the 22nd–23rd; the 23rd–24th and
  // 24th–25th were both missed, and the night between them never ran.
  const lastActiveDate = new Date("2026-07-22T10:00:00.000Z");
  assert.deepEqual(resolveMissedStreakDays({ lastActiveDate, streakFreezes: 1 }, cronRun), {
    action: "reset",
    missedDays: 2,
  });
  assert.deepEqual(resolveMissedStreakDays({ lastActiveDate, streakFreezes: 2 }, cronRun), {
    action: "freeze",
    missedDays: 2,
    streakFreezes: 0,
    lastActiveDate: new Date(dayJustEnded),
    lastFreezeUsedAt: new Date("2026-07-24T23:00:00.000Z"),
  });
});

test("a frozen streak continues with the first lesson of the new day", () => {
  const resolution = resolveMissedStreakDays(
    { lastActiveDate: new Date("2026-07-23T10:00:00.000Z"), streakFreezes: 1 },
    cronRun,
  );
  assert.equal(resolution?.action, "freeze");
  const lessonAt = new Date("2026-07-25T06:00:00.000Z");
  const update = calculateLessonStreakUpdate(
    {
      currentStreak: 4,
      longestStreak: 4,
      lastActiveDate: resolution?.action === "freeze" ? resolution.lastActiveDate : null,
      streakFreezes: 0,
    },
    lessonAt,
  );
  assert.equal(update.currentStreak, 5);
  assert.equal(update.streakFreezes, undefined);
});

test("a lesson after two missed days and no cron run spends two freezes", () => {
  const now = new Date("2026-07-25T06:00:00.000Z");
  const lastActiveDate = new Date("2026-07-22T10:00:00.000Z");
  assert.deepEqual(
    calculateLessonStreakUpdate(
      { currentStreak: 4, longestStreak: 9, lastActiveDate, streakFreezes: 2 },
      now,
    ),
    {
      currentStreak: 5,
      longestStreak: 9,
      lastActiveDate: now,
      lastFreezeUsedAt: now,
      streakFreezes: 0,
    },
  );
  assert.equal(
    calculateLessonStreakUpdate(
      { currentStreak: 4, longestStreak: 9, lastActiveDate, streakFreezes: 1 },
      now,
    ).currentStreak,
    1,
  );
});
