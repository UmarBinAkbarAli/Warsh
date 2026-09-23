// Run: npx tsx --test services/answerMatch.test.ts
import assert from "node:assert/strict";
import { test } from "node:test";
import { biasingStrings, checkAlternatives, checkTranscript, normalizeArabic, type AnswerSlot } from "./answerMatch";

const father: AnswerSlot[] = [{ kind: "WORD", ar: "هَذَا" }, { kind: "WORD", ar: "أَبِي" }];
const name: AnswerSlot[] = [{ kind: "WORD", ar: "اسْمِي" }, { kind: "OPEN" }];
const sister: AnswerSlot[] = [{ kind: "WORD", ar: "أُخْتِي" }, { kind: "WORD", ar: "فِي" }, { kind: "WORD", ar: "الْبَيْتِ" }];

test("normalizeArabic folds harakat, hamza seats, taa marbuta and punctuation", () => {
  assert.equal(normalizeArabic("أُخْتِي فِي الْبَيْتِ."), "اختي في البيت");
  assert.equal(normalizeArabic("هٰذَا"), "هذا");
  assert.equal(normalizeArabic("الْغُرْفَةِ"), "الغرفه");
  assert.equal(normalizeArabic("إِلَى؟"), "الي");
});

test("the recogniser's bare spelling passes a vowelled answer", () => {
  const result = checkTranscript("هذا ابي", father);
  assert.equal(result.passed, true);
  assert.deepEqual(result.words.map((w) => w.status), ["ok", "ok"]);
  assert.deepEqual(result.missing, []);
});

test("a wrong word stands in for the slot it replaced", () => {
  const result = checkTranscript("هذا أخي", father);
  assert.equal(result.passed, false);
  assert.deepEqual(result.words, [{ text: "هذا", status: "ok" }, { text: "أخي", status: "wrong" }]);
  assert.deepEqual(result.missing, []);
});

test("an open slot accepts any name, in any script", () => {
  assert.equal(checkTranscript("اسمي عمر", name).passed, true);
  assert.equal(checkTranscript("اسمي Umar", name).passed, true);
  assert.deepEqual(checkTranscript("اسمي عمر", name).words.map((w) => w.status), ["ok", "open"]);
});

test("a missing lead-in word is listed while the name still counts", () => {
  const result = checkTranscript("عمر", name);
  assert.equal(result.passed, false);
  assert.deepEqual(result.words, [{ text: "عمر", status: "open" }]);
  assert.deepEqual(result.missing, ["اسْمِي"]);
});

test("an open slot with nothing left for it fails", () => {
  const result = checkTranscript("اسمي", name);
  assert.equal(result.passed, false);
  assert.deepEqual(result.missing, []);
});

test("a wrong lead-in is reported as wrong, not taken as the name", () => {
  const result = checkTranscript("اسمك عمر", name);
  assert.deepEqual(result.words, [{ text: "اسمك", status: "wrong" }, { text: "عمر", status: "open" }]);
});

test("extra words are harmless once every slot is filled", () => {
  const result = checkTranscript("نعم هذا ابي", father);
  assert.equal(result.passed, true);
  assert.equal(result.words[0].status, "extra");
});

test("word order is not checked", () => {
  assert.equal(checkTranscript("في البيت اختي", sister).passed, true);
});

test("the first passing alternative wins; otherwise the top one is shown", () => {
  assert.equal(checkAlternatives(["هذا اخي", "هذا ابي"], father)?.transcript, "هذا ابي");
  assert.equal(checkAlternatives(["هذا اخي", "هذا امي"], father)?.transcript, "هذا اخي");
  assert.equal(checkAlternatives(["", "  "], father), null);
});

test("biasing strings are the slot words without harakat", () => {
  assert.deepEqual(biasingStrings(father), ["هذا", "أبي"]);
});
