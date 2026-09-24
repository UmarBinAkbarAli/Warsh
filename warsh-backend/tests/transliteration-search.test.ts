import test from "node:test";
import assert from "node:assert/strict";
import { foldTransliteration } from "../lib/transliterationSearch";

test("Roman spellings fold to the stored scholarly transliteration", () => {
  const stored = foldTransliteration("raḥma");
  for (const typed of ["rahma", "rahmah", "Rahma", "raHMa"]) {
    assert.ok(stored.includes(foldTransliteration(typed)), typed);
  }
  assert.equal(foldTransliteration("ṣalāh"), foldTransliteration("salaah"));
  assert.equal(foldTransliteration("al-kitāb"), foldTransliteration("al kitaab"));
  assert.equal(foldTransliteration("yadʿūka"), foldTransliteration("yadooka"));
});
