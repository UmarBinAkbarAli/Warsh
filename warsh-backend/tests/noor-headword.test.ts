import { test } from "node:test";
import assert from "node:assert/strict";
import { HEADWORD_INSTRUCTION, plainCandidates, singleArabicWord, splitHeadword, toArabicPlain } from "../lib/noorHeadwordTag";

test("a trailing word tag is split off the reply", () => {
  const { content, headword } = splitHeadword("ابی کا مطلب ہے میرا باپ۔\n\n⟦word: أَبِي⟧");
  assert.equal(content, "ابی کا مطلب ہے میرا باپ۔");
  assert.equal(headword, "أَبِي");
});

test("a reply without a tag is left alone", () => {
  const reply = "This rule covers several words.";
  assert.deepEqual(splitHeadword(reply), { content: reply, headword: null });
});

test("a tag that is not at the end is not treated as the headword", () => {
  const reply = "⟦word: أَبِي⟧ is the word, and more text follows.";
  assert.deepEqual(splitHeadword(reply), { content: reply, headword: null });
});

test("a tag with no Arabic in it is stripped but ignored", () => {
  assert.deepEqual(splitHeadword("Some reply.\n⟦word: abi⟧"), { content: "Some reply.", headword: null });
});

test("harakat are stripped the way arabicPlain is built", () => {
  assert.equal(toArabicPlain("الْكِتَابُ"), "الكتاب");
});

test("candidates cover the word with and without the definite article", () => {
  assert.deepEqual(plainCandidates("الْكِتَابُ"), ["الكتاب", "كتاب"]);
  assert.deepEqual(plainCandidates("كِتَابٌ"), ["كتاب", "الكتاب"]);
});

test("the question fallback takes one Arabic word and nothing else", () => {
  assert.equal(singleArabicWord("What does كِتَاب mean?"), "كِتَاب");
  assert.equal(singleArabicWord("What does abi mean?"), null);
  assert.equal(singleArabicWord("ابی کا مطلب کیا ہے؟"), null);
  assert.equal(singleArabicWord(null), null);
});

test("the prompt instruction names the exact tag the parser reads", () => {
  assert.match(HEADWORD_INSTRUCTION, /⟦word: /);
});
