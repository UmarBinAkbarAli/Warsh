import { test } from "node:test";
import assert from "node:assert/strict";
import { getLevelProgress, getNextMilestone, getStreakWeekStart, getWeekStrip } from "../lib/profileStats";

// Thursday 2026-10-22, 10:00 PKT.
const thursday = new Date("2026-10-22T05:00:00.000Z");

test("the streak week starts Monday 04:00 PKT", () => {
  assert.equal(getStreakWeekStart(thursday).toISOString(), "2026-10-18T23:00:00.000Z");
});

test("before 04:00 PKT the strip still treats the previous day as today", () => {
  // 02:00 PKT Thursday is still Wednesday's streak day.
  const strip = getWeekStrip(0, null, new Date("2026-10-21T21:00:00.000Z"));
  assert.equal(strip.findIndex((d) => d.today), 2);
});

test("a live streak marks its days in this week and today", () => {
  const strip = getWeekStrip(3, new Date("2026-10-21T07:00:00.000Z"), thursday);
  assert.deepEqual(strip.map((d) => d.done), [true, true, true, false, false, false, false]);
  assert.equal(strip.findIndex((d) => d.today), 3);
});

test("a streak running in from last week only fills this week's days", () => {
  const strip = getWeekStrip(10, new Date("2026-10-22T04:00:00.000Z"), thursday);
  assert.deepEqual(strip.map((d) => d.done), [true, true, true, true, false, false, false]);
});

test("a lapsed streak marks nothing", () => {
  const strip = getWeekStrip(5, new Date("2026-10-19T07:00:00.000Z"), thursday);
  assert.ok(strip.every((d) => !d.done));
});

test("level progress uses the backend level thresholds", () => {
  assert.deepEqual(getLevelProgress(145), { level: "BEGINNER", nextLevel: "ELEMENTARY", pointsToNext: 356, percent: 29 });
  assert.deepEqual(getLevelProgress(501), { level: "ELEMENTARY", nextLevel: "INTERMEDIATE", pointsToNext: 1500, percent: 0 });
  assert.deepEqual(getLevelProgress(5000), { level: "INTERMEDIATE", nextLevel: null, pointsToNext: 0, percent: 100 });
});

test("the next milestone is the unearned one closest to done", () => {
  const next = getNextMilestone(new Set(["first_lesson", "xp_100"]), { streak: 3, xp: 145, lessons: 4, phrases: 6 });
  assert.equal(next?.key, "streak_3");
  const afterStreak3 = getNextMilestone(new Set(["first_lesson", "xp_100", "streak_3"]), { streak: 3, xp: 145, lessons: 4, phrases: 6 });
  assert.equal(afterStreak3?.key, "phrases_10");
  assert.equal(afterStreak3?.current, 6);
  assert.equal(afterStreak3?.target, 10);
});
