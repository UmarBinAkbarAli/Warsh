import { test } from "node:test";
import assert from "node:assert/strict";
import { applyFix, checkLesson, plainArabic, summarizeProblems, type CheckContext } from "../lib/lessonChecks";

const ctx = (over: Partial<CheckContext> = {}): CheckContext => ({
  lessonId: "l5",
  chapter: 2,
  lesson: 5,
  template: "STANDARD",
  intros: [],
  ...over,
});

const word = (ar: string, ar_plain: string, en = "x", ur = "ی") => ({ ar, ar_plain, translit: "t", en, ur });
const codes = (content: unknown, c = ctx()) => checkLesson(content, c).map((p) => p.code);

test("plainArabic strips harakat and folds hamza seats", () => {
  assert.equal(plainArabic("إِلَى"), "الي");
  assert.equal(plainArabic("ٱلْكِتَٰبُ"), "الكتب");
});

test("flags a discover card without an image", () => {
  const p = checkLesson({ discover_cards: [{ type: "WORD", text: word("بَيْتٌ", "بيت"), image_url: "x.webp" }, { type: "EXAMPLE" }] }, ctx());
  assert.deepEqual(p.map((x) => [x.code, x.where]), [["no_image", "Card 2"]]);
});

test("flags Urdu copied from English once per item", () => {
  const p = checkLesson({ exercises: [{ id: "e1", type: "TRUE_FALSE", statement: { en: "Yes it is.", ur: "Yes it is." }, options: [{ en: "a", ur: "a" }] }] }, ctx());
  assert.equal(p.length, 1);
  assert.equal(p[0].text, "The Urdu is a copy of the English in 2 places.");
});

test("a noun after a preposition tile must end in kasra, with a one-click fix", () => {
  const content = {
    exercises: [
      { id: "e1", type: "BUILD_SENTENCE", target_translation: { en: "x", ur: "ی" }, tiles: [word("بِ", "ب"), word("الْمَسْجِدُ", "المسجد")], correct_order: [0, 1] },
    ],
  };
  const [p] = checkLesson(content, ctx());
  assert.equal(p.code, "harf_damma");
  assert.ok(p.fix);
  const fixed = applyFix(content, p.fix!);
  assert.equal(fixed.exercises[0].tiles[1].ar, "الْمَسْجِدِ");
  assert.equal(content.exercises[0].tiles[1].ar, "الْمَسْجِدُ", "applyFix does not mutate its input");
});

test("مَنْ (who) is not the preposition مِنْ", () => {
  const card = (ar: string) => ({ discover_cards: [{ type: "EXAMPLE", image_url: "x", text: word(ar, plainArabic(ar)) }] });
  assert.deepEqual(codes(card("مَنْ يَكْتُبُ؟")), []);
  assert.deepEqual(codes(card("فِي الْبَيْتُ")), ["harf_damma"]);
  assert.deepEqual(codes(card("مِنْ الْبَيْتِ")), ["min_before_al"]);
});

test("a joining letter written apart is joined", () => {
  const content = { discover_cards: [{ type: "EXAMPLE", image_url: "x", text: word("بِ الْبَيْتِ", "ب البيت") }] };
  const [p] = checkLesson(content, ctx());
  assert.equal(p.code, "prefix_apart");
  assert.equal(applyFix(content, p.fix!).discover_cards[0].text.ar, "بِالْبَيْتِ");
});

test("ال with tanween is flagged, but words that only start with أَل are not", () => {
  const card = (ar: string) => ({ discover_cards: [{ type: "WORD", image_url: "x", text: word(ar, plainArabic(ar)) }] });
  assert.deepEqual(codes(card("الْكِتَابٌ")), ["al_tanween"]);
  assert.deepEqual(codes(card("أَلِيمٌ")), []);
  assert.deepEqual(codes(card("آلِهَةٌ")), []);
});

test("practice may not use a word taught later in the same chapter", () => {
  const content = { exercises: [{ id: "e1", type: "FILL_BLANK", options: [word("وَ", "و")], correct_answer: word("فِي", "في") }] };
  const intros = [
    { plain: "و", lessonId: "l15", chapter: 2, lesson: 15, review: false },
    { plain: "في", lessonId: "l5", chapter: 2, lesson: 5, review: false },
  ];
  const p = checkLesson(content, ctx({ intros }));
  assert.deepEqual(p.map((x) => x.text), ["وَ is taught in Lesson 15."]);
  // A later chapter's tag is not proof the learner has not met the word.
  assert.deepEqual(codes(content, ctx({ intros: [{ plain: "و", lessonId: "x", chapter: 9, lesson: 1, review: false }] })), []);
});

test("the opening ayah should contain the lesson's word", () => {
  const lesson = (ayah: string) => ({
    hook: { ayah: { ar: ayah, label: "Test 1:1" } },
    discover_cards: [{ type: "WORD", image_url: "x", text: word("أَيْنَ", "أين"), introduces_vocab: { ar_plain: "أين" } }],
  });
  assert.deepEqual(codes(lesson("يَقُولُ ٱلْإِنسَٰنُ يَوْمَئِذٍ أَيْنَ ٱلْمَفَرُّ")), []);
  assert.deepEqual(codes(lesson("لَهُۥ مَا فِى ٱلسَّمَٰوَٰتِ")), ["ayah_missing_word"]);
});

test("repeated practice questions are flagged", () => {
  const q = { type: "TRUE_FALSE", statement: { en: "x", ur: "ی" }, correct_answer: true };
  const p = checkLesson({ exercises: [{ id: "a", ...q }, { id: "b", ...q }] }, ctx());
  assert.deepEqual(p.map((x) => [x.code, x.where, x.text]), [["duplicate_exercise", "Practice 2", "Same question as Practice 1."]]);
});

test("problem keys are stable and summaries count everything", () => {
  const content = { discover_cards: [{ type: "EXAMPLE" }, { type: "EXAMPLE" }, { type: "EXAMPLE" }], exercises: [{ id: "a", type: "TRUE_FALSE", statement: { en: "TODO", ur: "ی" } }] };
  const a = checkLesson(content, ctx());
  assert.deepEqual(a.map((p) => p.key), checkLesson(content, ctx()).map((p) => p.key));
  assert.equal(summarizeProblems(a), "3 cards without an image, placeholder text");
});
