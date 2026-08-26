import { test } from "node:test";
import assert from "node:assert/strict";
import { calculateLessonScore } from "../lib/lessonScoring";

test("a lesson with no answerable exercises always passes", () => {
  const result = calculateLessonScore([]);
  assert.equal(result.passed, true);
  assert.equal(result.score, 100);
  assert.equal(result.totalScored, 0);
});

test("missing fewer than the threshold passes", () => {
  const result = calculateLessonScore([true, true, false, true, false, true, true]);
  assert.equal(result.passed, true);
  assert.equal(result.correctCount, 5);
  assert.equal(result.score, 71);
});

test("missing exactly the threshold fails", () => {
  const result = calculateLessonScore([true, false, false, false, true]);
  assert.equal(result.passed, false);
  assert.equal(result.correctCount, 2);
  assert.equal(result.score, 40);
});

test("missing more than the threshold fails", () => {
  const result = calculateLessonScore([false, false, false, false, false]);
  assert.equal(result.passed, false);
  assert.equal(result.correctCount, 0);
});

test("a perfect run passes with a full score", () => {
  const result = calculateLessonScore([true, true, true, true]);
  assert.equal(result.passed, true);
  assert.equal(result.score, 100);
});
