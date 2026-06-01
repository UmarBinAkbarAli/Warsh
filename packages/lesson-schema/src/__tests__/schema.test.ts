import type {DiscoverCard, Exercise} from "../schemas";
import {DiscoverCardSchema} from "../schemas/discover-cards";
import {ExerciseSchema} from "../schemas/exercises";
import {LessonContentSchema} from "../schemas/lesson";
import {describe, it, expect} from "vitest";

// ============================================================================
// Unit tests: canonical starter objects validate against schema
// From PRD Section 7 canonical starter objects
// ============================================================================

describe("DiscoverCard schemas", () => {
  const wordCard = {
    type: "WORD" as const,
    text: {ar: "هَذَا", ar_plain: "هذا", translit: "hadha", en: "this", ur: "یہ"},
    image_url: "",
    audio_url: "",
    explanation: {en: "Short explanation of the word.", ur: "لفظ کی مختصر وضاحت۔"},
    introduces_vocab: {ar_plain: "هذا"},
  };

  const conceptCard = {
    type: "CONCEPT" as const,
    concept: {en: "Arabic concept name", ar: "مَفْهُوم", ur: "عربی تصور"},
    explanation: {en: "Short explanation of the concept.", ur: "تصور کی مختصر وضاحت۔"},
    examples: [{ar: "هَذَا كِتَابٌ", ar_plain: "هذا كتاب", translit: "hadha kitabun", en: "This is a book.", ur: "یہ ایک کتاب ہے۔"}],
  };

  const exampleCard = {
    type: "EXAMPLE" as const,
    text: {ar: "هَذَا كِتَابٌ", ar_plain: "هذا كتاب", translit: "hadha kitabun", en: "This is a book.", ur: "یہ ایک کتاب ہے۔"},
    explanation: {en: "Short explanation of what this example demonstrates.", ur: "یہ مثال کیا دکھاتی ہے اس کی مختصر وضاحت۔"},
  };

  const contrastCard = {
    type: "CONTRAST" as const,
    concept: {en: "Near vs far", ar: "قَرِيب وَبَعِيد", ur: "قریب اور دور"},
    explanation: {en: "Short explanation of the contrast.", ur: "فرق کی مختصر وضاحت۔"},
    examples: [
      {ar: "هَذَا كِتَابٌ", ar_plain: "هذا كتاب", translit: "hadha kitabun", en: "This is a book.", ur: "یہ ایک کتاب ہے۔"},
      {ar: "ذٰلِكَ كِتَابٌ", ar_plain: "ذلك كتاب", translit: "dhalika kitabun", en: "That is a book.", ur: "وہ ایک کتاب ہے۔"},
    ],
  };

  const ayahCard = {
    type: "AYAH_PREVIEW" as const,
    concept: {en: "Concept in the Quran", ar: "المفهوم في القرآن", ur: "قرآن میں تصور"},
    explanation: {en: "Short explanation of how the concept appears in the ayah.", ur: "آیت میں یہ تصور کیسے آتا ہے اس کی مختصر وضاحت۔"},
    examples: [{ar: "وَالْمُؤْمِنَاتُ", ar_plain: "والمؤمنات", translit: "wal-mu'minat", en: "and the believing women", ur: "اور ایمان والی عورتیں"}],
  };

  it("WORD card validates", () => {
    expect(DiscoverCardSchema.safeParse(wordCard).success).toBe(true);
  });

  it("CONCEPT card validates", () => {
    expect(DiscoverCardSchema.safeParse(conceptCard).success).toBe(true);
  });

  it("EXAMPLE card validates", () => {
    expect(DiscoverCardSchema.safeParse(exampleCard).success).toBe(true);
  });

  it("CONTRAST card validates", () => {
    expect(DiscoverCardSchema.safeParse(contrastCard).success).toBe(true);
  });

  it("AYAH_PREVIEW card validates", () => {
    expect(DiscoverCardSchema.safeParse(ayahCard).success).toBe(true);
  });
});

describe("Exercise schemas", () => {
  const trueFalseEx = {
    id: "ex_test1",
    type: "TRUE_FALSE" as const,
    xp_value: 1,
    statement: {
      en: "The word مَسْجِد means 'pen'.",
      ur: "لفظ مسجد کا مطلب 'قلم' ہے۔",
      ar_example: {ar: "مَسْجِد", ar_plain: "مسجد", translit: "masjid", en: "mosque"},
    },
    correct_answer: false,
    explanation_on_wrong: {
      en: "مَسْجِد means 'mosque'. The word for 'pen' is قَلَم.",
      ur: "مسجد کا مطلب مسجد ہے۔ قلم کے لیے لفظ قَلَم ہے۔",
    },
  };

  const tapTranslationEx = {
    id: "ex_test2",
    type: "TAP_TRANSLATION" as const,
    xp_value: 1,
    prompt: {ar: "هَذَا", ar_plain: "هذا", translit: "hadha", en: "this"},
    options: [{en: "that", ur: "وہ"}, {en: "this", ur: "یہ"}, {en: "here", ur: "یہاں"}, {en: "where", ur: "کہاں"}],
    correct_index: 1,
    explanation_on_wrong: {
      en: "هَذَا points at something near.",
      ur: "هَذَا کسی قریب چیز کی طرف اشارہ ہے۔",
    },
  };

  const fillBlankEx = {
    id: "ex_test3",
    type: "FILL_BLANK" as const,
    xp_value: 1,
    mode: "TAP" as const,
    sentence_ar: "___ بَيْتٌ",
    hint: {en: "This is a house.", ur: "یہ ایک گھر ہے۔"},
    options: [
      {ar: "كِتَابٌ", ar_plain: "كتاب", translit: "kitabun", en: "book"},
      {ar: "هَذَا", ar_plain: "هذا", translit: "hadha", en: "this"},
      {ar: "قَلَمٌ", ar_plain: "قلم", translit: "qalamun", en: "pen"},
      {ar: "مَسْجِدٌ", ar_plain: "مسجد", translit: "masjidun", en: "mosque"},
    ],
    correct_answer: {ar: "هَذَا", ar_plain: "هذا", translit: "hadha", en: "this"},
  };

  const matchingEx = {
    id: "ex_test4",
    type: "MATCHING" as const,
    xp_value: 1,
    left_column: [
      {ar: "كِتَاب", ar_plain: "كتاب)", translit: "kitab", en: "book"},
      {ar: "قَلَم", ar_plain: "قلم", translit: "qalam", en: "pen"},
    ],
    right_column: [{en: "book", ur: "کتاب"}, {en: "pen", ur: "قلم"}],
    correct_pairs: [[0, 0], [1, 1]],
  };

  const buildSentenceEx = {
    id: "ex_test5",
    type: "BUILD_SENTENCE" as const,
    xp_value: 1,
    target_translation: {en: "This is a book.", ur: "یہ ایک کتاب ہے۔"},
    tiles: [
      {ar: "كِتَابٌ", ar_plain: "كتاب", translit: "kitabun", en: "book"},
      {ar: "هَذَا", ar_plain: "هذا", translit: "hadha", en: "this"},
    ],
    correct_order: [1, 0],
    explanation_on_wrong: {en: "In Arabic, هَذَا comes first, then the noun.", ur: "عربی میں پہلے هَذَا آتا ہے، پھر اسم۔"},
  };

  it("TRUE_FALSE validates", () => {
    expect(ExerciseSchema.safeParse(trueFalseEx).success).toBe(true);
  });

  it("TAP_TRANSLATION validates", () => {
    expect(ExerciseSchema.safeParse(tapTranslationEx).success).toBe(true);
  });

  it("FILL_BLANK validates", () => {
    expect(ExerciseSchema.safeParse(fillBlankEx).success).toBe(true);
  });

  it("MATCHING validates", () => {
    expect(ExerciseSchema.safeParse(matchingEx).success).toBe(true);
  });

  it("BUILD_SENTENCE validates", () => {
    expect(ExerciseSchema.safeParse(buildSentenceEx).success).toBe(true);
  });
});

describe("LessonContent schema", () => {
  it("parses a valid STANDARD lesson from chapter-01-lesson-01 fixture", () => {
    // Minimal valid content for a STANDARD lesson — exercises/tests will add full content
    const content = {
      schema_version: "1.0",
      template: "STANDARD",
      hook: {
        ayah: {
          surah: 1,
          ayah: 1,
          label: "Al-Fatiha 1:1",
          ar: "بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ",
          en: "In the name of Allah, the Most Gracious, the Most Merciful.",
          ur: "اللہ کے نام سے جو بہت مہربان اور رحم کرنے والا ہے۔",
        },
        noor_intro: {
          en: "Let's begin",
        },
        autoplay: true,
      },
      close: {
        noor_message: {
          en: "Well done.",
        },
      },
    };
    expect(LessonContentSchema.safeParse(content).success).toBe(true);
  });
});
