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

describe("Conversation Lab", () => {
  const text = (ar: string, en: string) => ({ ar, ar_plain: ar, translit: "x", en });
  const phrase = (id: string, ar: string, heard_only?: boolean) => ({
    id,
    phrase: text(ar, id),
    audio_url: "",
    ...(heard_only ? { heard_only } : {}),
  });

  function labLesson() {
    return {
      schema_version: "1.0",
      template: "SPOKEN_PHRASES",
      hook: { ayah: { surah: 28, ayah: 25, label: "Al-Qasas 28:25", ar: "إِنَّ أَبِي يَدْعُوكَ", en: "Indeed, my father invites you." } },
      close: { noor_message: { en: "Well done." } },
      spoken_phrases: {
        scene: { en: "A family photo." },
        phrases: [
          phrase("p1", "مَنْ هَذَا؟"),
          phrase("p2", "هَذَا أَبِي"),
          phrase("p3", "أَيْنَ أُخْتُكَ؟", true),
          phrase("p4", "أُخْتِي فِي الْبَيْتِ"),
        ],
        dialogue: [
          { speaker: "A", phrase_id: "p1" },
          { speaker: "B", phrase_id: "p2" },
          { speaker: "A", phrase_id: "p3" },
          { speaker: "B", phrase_id: "p4" },
        ],
        lab: {
          title: { en: "Home and Family" },
          mission: { en: "Say where your sister is." },
          goals: [{ en: "Say where your sister is" }],
          shadow_phrase_ids: ["p2", "p4"],
          mission_turns: [
            {
              prompt_phrase_id: "p3",
              goal_index: 0,
              response_mode: "BUILD",
              tiles: [text("أُخْتِي", "my sister"), text("فِي", "in"), text("الْبَيْتِ", "the house")],
              correct_order: [0, 1, 2],
            },
          ],
          can_do: [{ kind: "SAY", label: { en: "Where someone is" }, ar: "أُخْتِي فِي الْبَيْتِ" }],
        },
      },
      exercises: [] as unknown[],
    };
  }

  it("accepts a lab lesson", () => {
    expect(LessonContentSchema.safeParse(labLesson()).success).toBe(true);
  });

  it("rejects the learner saying a heard_only phrase in the dialogue", () => {
    const lesson = labLesson();
    lesson.spoken_phrases.dialogue[3].phrase_id = "p3";
    expect(LessonContentSchema.safeParse(lesson).success).toBe(false);
  });

  it("rejects a heard_only phrase as a speaking target", () => {
    const lesson = labLesson();
    lesson.spoken_phrases.lab.shadow_phrase_ids = ["p3"];
    expect(LessonContentSchema.safeParse(lesson).success).toBe(false);
  });

  it("rejects a mission turn whose goal does not exist", () => {
    const lesson = labLesson();
    lesson.spoken_phrases.lab.mission_turns[0].goal_index = 3;
    expect(LessonContentSchema.safeParse(lesson).success).toBe(false);
  });

  it("rejects a scored exercise whose answer is a heard_only phrase", () => {
    const lesson = labLesson();
    lesson.exercises = [
      {
        id: "e1",
        type: "CONVERSATION_BUILDER",
        prompt_line: text("مَنْ هَذَا؟", "Who is this?"),
        response_mode: "PICK",
        options: [text("أَيْنَ أُخْتُكَ؟", "Where is your sister?"), text("هَذَا أَبِي", "This is my father.")],
        correct_option_index: 0,
      },
    ];
    expect(LessonContentSchema.safeParse(lesson).success).toBe(false);
    (lesson.exercises[0] as { correct_option_index: number }).correct_option_index = 1;
    expect(LessonContentSchema.safeParse(lesson).success).toBe(true);
  });

  describe("Answer it", () => {
    function withAnswerIt(turn: Record<string, unknown>) {
      const lesson = labLesson();
      (lesson.spoken_phrases.lab as Record<string, unknown>).answer_it = { turns: [turn] };
      return lesson;
    }
    const sisterSlots = [{ kind: "WORD", ar: "أُخْتِي" }, { kind: "WORD", ar: "فِي" }, { kind: "WORD", ar: "الْبَيْتِ" }];

    it("accepts a heard_only question answered with a taught phrase", () => {
      expect(LessonContentSchema.safeParse(withAnswerIt({ prompt_phrase_id: "p3", slots: sisterSlots, model_phrase_id: "p4" })).success).toBe(true);
    });

    it("accepts an open name slot with a written model", () => {
      const turn = {
        prompt_phrase_id: "p1",
        slots: [{ kind: "WORD", ar: "اسْمِي" }, { kind: "OPEN", label: { en: "your name" } }],
        model: { ar: "اسْمِي …", en: "My name is …" },
      };
      expect(LessonContentSchema.safeParse(withAnswerIt(turn)).success).toBe(true);
    });

    it("rejects a heard_only phrase as the model answer", () => {
      expect(LessonContentSchema.safeParse(withAnswerIt({ prompt_phrase_id: "p1", slots: sisterSlots, model_phrase_id: "p3" })).success).toBe(false);
    });

    it("rejects an unknown question phrase", () => {
      expect(LessonContentSchema.safeParse(withAnswerIt({ prompt_phrase_id: "nope", slots: sisterSlots, model_phrase_id: "p4" })).success).toBe(false);
    });

    it("rejects a turn with no model answer or no WORD slot to check", () => {
      expect(LessonContentSchema.safeParse(withAnswerIt({ prompt_phrase_id: "p3", slots: sisterSlots })).success).toBe(false);
      const openOnly = { prompt_phrase_id: "p1", slots: [{ kind: "OPEN", label: { en: "your name" } }], model: { ar: "…", en: "…" } };
      expect(LessonContentSchema.safeParse(withAnswerIt(openOnly)).success).toBe(false);
    });
  });
});
