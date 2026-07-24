import { test } from "node:test";
import assert from "node:assert/strict";
import {
  get4amPKTBoundary,
  getPKTStreakDayIndex,
  getPrevious4amPKTBoundary,
} from "../lib/date";
import { calculateLessonStreakUpdate } from "../lib/streak";

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
