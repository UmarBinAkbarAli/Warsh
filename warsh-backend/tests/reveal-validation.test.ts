import assert from "node:assert/strict";
import { test } from "node:test";
import { createRequire } from "node:module";

// validate-curriculum.cjs only runs its CLI when executed directly.
const require = createRequire(import.meta.url);
const { validateReveal } = require("../prisma/validate-curriculum.cjs");

function reporter() {
  const errors: string[] = [];
  return { errors, add(pathLabel: string, message: string) { errors.push(`${pathLabel}: ${message}`); } };
}

const fourTokenAyah = {
  surah: 109,
  ayah: 1,
  label: "Al-Kafirun 109:1",
  ar: "قُلْ يَا أَيُّهَا الْكَافِرُونَ",
  en: "Say, O disbelievers.",
};

function reveal(overrides: Record<string, unknown>) {
  return {
    concept_name: { en: "Recognizing plural forms" },
    ayah: fourTokenAyah,
    noor_explanation: { en: "الْكَافِرُونَ is a plural with a clear ending." },
    ...overrides,
  };
}

test("index 4 is out of range for a four-token ayah even without highlighted_words", () => {
  // Chapter 13 Lesson 3 shipped exactly this and highlighted nothing.
  const r = reporter();
  validateReveal(reveal({ highlighted_word_indices: [4] }), "reveal", r);
  assert.deepEqual(r.errors, ["reveal.highlighted_word_indices[0]: must be <= 3"]);
});

test("the last token index is accepted", () => {
  const r = reporter();
  validateReveal(reveal({ highlighted_word_indices: [3] }), "reveal", r);
  assert.deepEqual(r.errors, []);
});

test("an empty index list means nothing is highlighted and is not an error", () => {
  const r = reporter();
  validateReveal(reveal({ highlighted_word_indices: [] }), "reveal", r);
  assert.deepEqual(r.errors, []);
});

test("highlighted_words catches a valid but wrong position", () => {
  const r = reporter();
  validateReveal(reveal({ highlighted_word_indices: [2], highlighted_words: ["الْكَافِرُونَ"] }), "reveal", r);
  assert.equal(r.errors.length, 1);
  assert.match(r.errors[0], /expected "الْكَافِرُونَ" at ayah word 2/);
});

test("highlighted_words at the right position passes, ignoring harakat differences", () => {
  const r = reporter();
  validateReveal(reveal({ highlighted_word_indices: [3], highlighted_words: ["الكافرون"] }), "reveal", r);
  assert.deepEqual(r.errors, []);
});
