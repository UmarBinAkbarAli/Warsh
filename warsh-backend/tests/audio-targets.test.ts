import assert from "node:assert/strict";
import { test } from "node:test";
import { catalogAudioKey } from "../lib/audioCatalog";
import { lessonAudioTargets } from "../lib/audioTargets";

test("a word card's Arabic becomes a catalogue target keyed by its text", () => {
  const targets = lessonAudioTargets({
    discover_cards: [{ type: "WORD", text: { ar: "الْمَسْجِدُ", en: "the mosque" } }],
  });

  assert.equal(targets.length, 1);
  assert.equal(targets[0].text, "الْمَسْجِدُ");
  assert.equal(targets[0].key, catalogAudioKey("الْمَسْجِدُ"));
  assert.equal(targets[0].source, "discover:0");
});

test("blocks carrying their own audio_url are left alone", () => {
  const targets = lessonAudioTargets({
    discover_cards: [{ type: "WORD", text: { ar: "كِتَابٌ" }, audio_url: "https://cdn.example/x.mp3" }],
    exercises: [{ type: "SHADOW_REPEAT", phrase: { ar: "بِسْمِ اللَّهِ" }, audio_url: "https://cdn.example/y.mp3" }],
  });

  assert.deepEqual(targets, []);
});

test("Quran fragments are never routed to synthesized catalogue audio", () => {
  const targets = lessonAudioTargets({
    exercises: [{ type: "MATCH_AYAH", ayah: { ar: "إِنَّا أَعْطَيْنَاكَ الْكَوْثَرَ" } }],
  });

  assert.deepEqual(targets, []);
});

test("an en_to_ar prompt has nothing to recite", () => {
  const enToAr = lessonAudioTargets({
    exercises: [{ type: "TAP_TRANSLATION", direction: "en_to_ar", prompt: { ar: "بَيْتٌ", en: "house" } }],
  });
  const arToEn = lessonAudioTargets({
    exercises: [{ type: "TAP_TRANSLATION", direction: "ar_to_en", prompt: { ar: "بَيْتٌ", en: "house" } }],
  });

  assert.deepEqual(enToAr, []);
  assert.equal(arToEn.length, 1);
});

test("the same text appearing twice yields one clip", () => {
  const targets = lessonAudioTargets({
    discover_cards: [
      { type: "WORD", text: { ar: "بَيْتٌ" } },
      { type: "SENTENCE", text: { ar: "بَيْتٌ" } },
    ],
  });

  assert.equal(targets.length, 1);
});

test("whitespace-equivalent text collapses to the same clip", () => {
  const targets = lessonAudioTargets({
    discover_cards: [
      { type: "WORD", text: { ar: "هَذَا كِتَابٌ" } },
      { type: "WORD", text: { ar: "  هَذَا   كِتَابٌ  " } },
    ],
  });

  assert.equal(targets.length, 1);
});

test("malformed or empty lessons produce no targets rather than throwing", () => {
  assert.deepEqual(lessonAudioTargets(null), []);
  assert.deepEqual(lessonAudioTargets({}), []);
  assert.deepEqual(lessonAudioTargets({ discover_cards: "not an array", exercises: null }), []);
  assert.deepEqual(lessonAudioTargets({ discover_cards: [{ type: "WORD", text: { ar: "   " } }] }), []);
});
