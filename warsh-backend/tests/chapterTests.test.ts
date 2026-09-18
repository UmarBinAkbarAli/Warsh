import { test } from "node:test";
import assert from "node:assert/strict";
import { gradeChapterTest, isChapterTestContent, stripChapterTestAnswers } from "../lib/chapterTests";

const content = {
  assessment: {
    type: "CHAPTER_TEST",
    chapter_order: 1,
    pass_score_percent: 80,
    questions: Array.from({ length: 12 }, (_, index) => ({
      id: `q${index + 1}`,
      options: [{}, {}, {}, {}],
      correct_index: index % 4,
    })),
  },
};

function answers(correctCount: number) {
  return content.assessment.questions.map((question, index) => ({
    questionId: question.id,
    selectedIndex: index < correctCount ? question.correct_index : (question.correct_index + 1) % 4,
  }));
}

test("recognizes chapter-test content", () => {
  assert.equal(isChapterTestContent(content), true);
  assert.equal(isChapterTestContent({}), false);
});

test("requires 10 correct answers out of 12 at an 80 percent threshold", () => {
  assert.equal(gradeChapterTest(content, answers(9)).passed, false);
  const passing = gradeChapterTest(content, answers(10));
  assert.equal(passing.passed, true);
  assert.equal(passing.requiredCorrect, 10);
});

test("rejects incomplete and duplicate submissions", () => {
  assert.throws(() => gradeChapterTest(content, answers(11).slice(0, 11)), /incomplete_answers/);
  assert.throws(() => gradeChapterTest(content, [...answers(11), answers(11)[0]]), /duplicate_answer/);
});

test("strips the answer key from served content without touching the stored copy", () => {
  const served = stripChapterTestAnswers(content) as typeof content;
  assert.equal(served.assessment.questions.length, 12);
  assert.ok(served.assessment.questions.every((question) => !("correct_index" in question)));
  assert.equal(served.assessment.pass_score_percent, 80);
  assert.ok(content.assessment.questions.every((question) => "correct_index" in question));
  const regular = { exercises: [{ correct_index: 1 }] };
  assert.equal(stripChapterTestAnswers(regular), regular);
});
