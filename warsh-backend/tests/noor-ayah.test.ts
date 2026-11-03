import { test } from "node:test";
import assert from "node:assert/strict";
import { AYAH_INSTRUCTION, expandAyahTags, normalizeArabic, quoteAyat, searchQuran } from "../lib/noorAyah";
import ayat from "../lib/data/quran-ayat.json";

const Q = ayat as string[][];

test("a single ayah tag becomes the exact text with its reference", () => {
  const out = expandAyahTags("Look at this ayah:\n⟦ayah: 112:1⟧\nWhat does أَحَدٌ mean?");
  assert.equal(out, `Look at this ayah:\n﴿${Q[111][0]}﴾ (112:1)\nWhat does أَحَدٌ mean?`);
});

test("a range joins consecutive ayat", () => {
  assert.equal(quoteAyat(112, 1, 2), `﴿${Q[111][0]} ${Q[111][1]}﴾ (112:1-2)`);
  assert.equal(expandAyahTags("⟦ayah: 1:2 - 3⟧"), `﴿${Q[0][1]} ${Q[0][2]}﴾ (1:2-3)`);
});

test("a reference that does not exist is removed, never shown", () => {
  for (const tag of ["⟦ayah: 112:5⟧", "⟦ayah: 115:1⟧", "⟦ayah: 0:1⟧", "⟦ayah: 2:0⟧", "⟦ayah: 2:10-5⟧"]) {
    assert.equal(expandAyahTags(`Before\n\n${tag}\n\nAfter`), "Before\n\nAfter", tag);
  }
});

test("a whole short surah can be quoted, a long run cannot", () => {
  assert.ok(quoteAyat(112, 1, 4));
  assert.ok(quoteAyat(1, 1, 7));
  assert.equal(quoteAyat(2, 1, 20), null);
  assert.ok(quoteAyat(2, 282), "one long ayah is always allowed");
});

test("search finds an ayah from ordinary spelling", () => {
  const jugular = searchQuran("حبل الوريد");
  assert.equal(jugular.results[0]?.ref, "50:16");
  const mercy = searchQuran("وَرَبُّكَ الْغَفُورُ ذُو الرَّحْمَةِ");
  assert.equal(mercy.results[0]?.ref, "18:58");
  assert.equal(searchQuran("hello").total, 0);
});

test("an ayah copied next to its tag is shown once", () => {
  const reply = `It states:\n\n${Q[49][15]}\n\n⟦ayah: 50:16⟧\n\nThis shows closeness.`;
  assert.equal(expandAyahTags(reply), `It states:\n\n﴿${Q[49][15]}﴾ (50:16)\n\nThis shows closeness.`);
  const bold = `**آية:** ${Q[2][7]}\n**⟦ayah: 3:8⟧**`;
  assert.equal(expandAyahTags(bold), `**﴿${Q[2][7]}﴾ (3:8)**`);
});

test("an untagged whole ayah gets the canonical text and its reference", () => {
  const reply = `فرمایا:\n\nقُلْ هُوَ ٱللَّهُ أَحَدٌ (سورہ الایخلاص: 1)\n\nیہاں أَحَدٌ کا معنی ہے ایک۔`;
  assert.equal(expandAyahTags(reply), `فرمایا:\n\n﴿${Q[111][0]}﴾ (112:1)\n\nیہاں أَحَدٌ کا معنی ہے ایک۔`);
});

test("a whole surah written out from memory becomes one referenced quote", () => {
  const reply = "It states:\n\n**قُلْ هُوَ ٱللَّهُ أَحَدٌ ۭ ٱللَّهُ ٱلصَّمَدُ ۭ لَمْ يَلِدْ وَلَمْ يُولَدْ ۭ وَلَمْ يَكُن لَّهُۥ كُفُوًا أَحَدٌ ۭ**\n\nNow أَحَدٌ.";
  assert.equal(expandAyahTags(reply), `It states:\n\n**${quoteAyat(112, 1, 4)}**\n\nNow أَحَدٌ.`);
});

test("Urdu prose and partial phrases are not mistaken for ayat", () => {
  const reply = "یہ آیت ہمیں بتاتی ہے کہ اللہ تعالیٰ کی رحمت بہت وسیع ہے۔ ذُو الرَّحْمَةِ کا مطلب ہے رحمت والا۔";
  assert.equal(expandAyahTags(reply), reply);
});

test("normalisation folds marks and spelling variants", () => {
  assert.equal(normalizeArabic("ٱلرَّحۡمَـٰنِ"), "الرحمن");
  assert.equal(normalizeArabic("رَحْمَة"), "رحمه");
});

test("every surah has the expected number of ayat", () => {
  assert.ok(quoteAyat(2, 286));
  assert.equal(quoteAyat(2, 287), null);
  assert.ok(quoteAyat(114, 6));
  assert.equal(quoteAyat(114, 7), null);
});

test("replies without tags, and the word tag, are untouched", () => {
  const reply = "كِتَاب means book.\n\n⟦word: كِتَاب⟧";
  assert.equal(expandAyahTags(reply), reply);
  assert.equal(expandAyahTags("plain"), "plain");
});

test("the instruction tells the model not to write ayah text itself", () => {
  assert.match(AYAH_INSTRUCTION, /Never write the Arabic text of an ayah yourself/);
});
