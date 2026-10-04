import { test } from "node:test";
import assert from "node:assert/strict";
import { buildQuestions, gradeAnswer, pendingQuestion, publicAssessment, retryMissed, type AssessmentState } from "../lib/core500Assessment";
import { coreExampleSetSchema } from "../lib/core500Examples";
import fs from "node:fs";
import path from "node:path";
import { alignCorpusOccurrence } from "../lib/core500Alignment";

const words = Array.from({ length: 5 }, (_, i) => ({ id: `word-${i}`, arabic: `كلمة ${i}`, translationEn: `meaning ${i}`, translationUr: `معنی ${i}` }));
const initial = (): AssessmentState => {
  const questions = buildQuestions(words, words, "en");
  return { language: "en", phase: "QUIZ", questions, activeIds: questions.map(q => q.id), passedIds: [], answers: {}, round: 1 };
};
test("public test snapshot never exposes the answer key or unanswered meanings", () => {
  const state = initial();
  const view = publicAssessment(state);
  assert.equal(view.question?.options.length, 4);
  assert.equal("correctOptionId" in view.question!, false);
  assert.equal("meaning" in view.question!, false);
  assert.deepEqual(view.review, []);
});
test("tampered options, foreign questions and out-of-order answers cannot pass a test", () => {
  const state = initial(); const q = pendingQuestion(state)!;
  assert.throws(() => gradeAnswer(state, q.id, "forged"), /invalid_answer/);
  assert.throws(() => gradeAnswer(state, "another-set", q.correctOptionId), /invalid_answer/);
  const later = state.questions[1];
  assert.throws(() => gradeAnswer(state, later.id, later.correctOptionId), /question_out_of_order/);
  assert.equal(state.passedIds.length, 0);
});
test("a lost response can be replayed once without changing credit; an answer cannot be changed", () => {
  const state = initial(); const q = pendingQuestion(state)!;
  const next = gradeAnswer(state, q.id, q.correctOptionId);
  assert.deepEqual(gradeAnswer(next, q.id, q.correctOptionId), next);
  assert.throws(() => gradeAnswer(next, q.id, q.options.find(o => o.id !== q.correctOptionId)!.id), /answer_already_submitted/);
  assert.equal(next.passedIds.length, 1);
});
test("four correct answers require review; retry contains only the missed word", () => {
  let state = initial();
  for (let i = 0; i < 5; i++) {
    const q = pendingQuestion(state)!;
    state = gradeAnswer(state, q.id, i === 2 ? q.options.find(o => o.id !== q.correctOptionId)!.id : q.correctOptionId);
  }
  assert.equal(state.phase, "REVIEW"); assert.equal(state.passedIds.length, 4);
  assert.equal(publicAssessment(state).review.length, 1);
  state = retryMissed(state);
  assert.equal(state.round, 2); assert.equal(state.activeIds.length, 1);
  const q = pendingQuestion(state)!;
  state = gradeAnswer(state, q.id, q.correctOptionId);
  assert.equal(state.phase, "COMPLETE"); assert.equal(state.passedIds.length, 5);
  assert.throws(() => retryMissed(state), /review_required/);
});
test("same-meaning glosses are not offered twice and a test fails closed without four meanings", () => {
  const duplicates = words.map(w => ({ ...w, translationEn: "same" }));
  assert.throws(() => buildQuestions(duplicates, [], "en"), /distinct meanings/);
  const qs = buildQuestions(duplicates, words, "en");
  qs.forEach(q => assert.equal(new Set(q.options.map(o => o.text)).size, 4));
});
test("Urdu tests snapshot Urdu meanings and do not depend on later gloss edits", () => {
  const qs = buildQuestions(words, words, "ur");
  assert.ok(qs.every(q => q.meaning.startsWith("معنی")));
  const before = qs[0].meaning;
  words[0].translationUr = "changed";
  assert.equal(qs[0].meaning, before);
});
test("all 500 words have three distinct references and an exact canonical highlight", () => {
  const doc = JSON.parse(fs.readFileSync(path.join(__dirname, "../content/core500-ayah-examples.json"), "utf8"));
  assert.equal(doc.words.length, 500);
  assert.equal(new Set(doc.words.map((w: { rank: number }) => w.rank)).size, 500);
  for (const word of doc.words) coreExampleSetSchema.parse(word.examples);
  const examples = doc.words[0].examples;
  assert.equal(coreExampleSetSchema.safeParse([examples[0], examples[0], examples[2]]).success, false);
  assert.equal(coreExampleSetSchema.safeParse(examples.map((e: object) => ({ ...e, surface: "wrong" }))).success, false);
  assert.equal(coreExampleSetSchema.safeParse(examples.map((e: object) => ({ ...e, source: "not a URL" }))).success, false);
});
test("Uthmani-to-Imlaei alignment highlights the actual word when a vocative adds a token", () => {
  assert.equal(alignCorpusOccurrence("يَا لَيْتَهَا كَانَتِ الْقَاضِيَةَ", "كَانَتِ", "كَانَتِ", 2), 3);
  assert.equal(alignCorpusOccurrence("يَا أَيَّتُهَا النَّفْسُ الْمُطْمَئِنَّةُ", "ٱلنَّفْسُ", "نَّفْسُ", 2), 3);
  assert.throws(() => alignCorpusOccurrence("مِن شَرِّ مَا خَلَقَ", "مَلَكٌ", "مَلَكٌ", 1), /Cannot align/);
});
