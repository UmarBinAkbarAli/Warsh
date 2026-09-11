import { test } from "node:test";
import assert from "node:assert/strict";
import { calculateLessonScore } from "../lib/lessonScoring";

test("a lesson with no answerable exercises always passes", () => {
  const result = calculateLessonScore([]);
  assert.equal(result.passed, true);
  assert.equal(result.score, 100);
  assert.equal(result.totalScored, 0);
  assert.equal(result.requiredCorrect, 0);
});

test("scoring exactly the pass percentage passes", () => {
  // 7 of 10 = 70%
  const result = calculateLessonScore([true, true, true, true, true, true, true, false, false, false]);
  assert.equal(result.passed, true);
  assert.equal(result.correctCount, 7);
  assert.equal(result.requiredCorrect, 7);
  assert.equal(result.score, 70);
});

test("scoring just under the pass percentage fails", () => {
  // 6 of 10 = 60%
  const result = calculateLessonScore([true, true, true, true, true, true, false, false, false, false]);
  assert.equal(result.passed, false);
  assert.equal(result.correctCount, 6);
  assert.equal(result.requiredCorrect, 7);
  assert.equal(result.score, 60);
});

test("short lessons round the requirement up", () => {
  // 5 exercises: 70% of 5 = 3.5, so 4 are required; 3 correct fails
  assert.equal(calculateLessonScore([true, true, true, false, false]).passed, false);
  assert.equal(calculateLessonScore([true, true, true, false, false]).requiredCorrect, 4);
  assert.equal(calculateLessonScore([true, true, true, true, false]).passed, true);
});

test("long lessons are held to the same share", () => {
  // 15 exercises: 70% of 15 = 10.5, so 11 required; 4 wrong passes, 5 wrong fails
  const fourWrong = [...Array(11).fill(true), ...Array(4).fill(false)];
  const fiveWrong = [...Array(10).fill(true), ...Array(5).fill(false)];
  assert.equal(calculateLessonScore(fourWrong).passed, true);
  assert.equal(calculateLessonScore(fiveWrong).passed, false);
});

test("a perfect run passes with a full score", () => {
  const result = calculateLessonScore([true, true, true, true]);
  assert.equal(result.passed, true);
  assert.equal(result.score, 100);
});
