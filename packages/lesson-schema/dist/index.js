// src/schemas/primitives.ts
import { z } from "zod";
var ArabicTextSchema = z.object({
  ar: z.string().min(1),
  ar_plain: z.string().min(1),
  translit: z.string().min(1),
  en: z.string().min(1),
  ur: z.string().optional()
});
var ConceptSchema = z.object({
  en: z.string().min(1),
  ar: z.string().optional(),
  ur: z.string().optional()
});
var ExplanationSchema = z.object({
  en: z.string().min(1),
  ur: z.string().optional()
});
var AyahWordTimingSchema = z.object({
  index: z.number().int().min(0),
  start_ms: z.number().int().min(0),
  end_ms: z.number().int().min(0)
});
var AyahReferenceSchema = z.object({
  surah: z.number().int().min(1).max(114),
  ayah: z.number().int().min(1),
  label: z.string().min(1),
  ar: z.string().min(1),
  en: z.string().min(1),
  ur: z.string().optional(),
  audio_url: z.string().url().optional(),
  word_timings: z.array(AyahWordTimingSchema).optional()
});
var VocabRefSchema = z.object({
  word_id: z.string().optional(),
  ar_plain: z.string().min(1)
});
var NootIntroSchema = z.object({
  en: z.string().min(1),
  ur: z.string().optional()
});
var HookBeatSchema = z.object({
  ayah: AyahReferenceSchema,
  noor_intro: NootIntroSchema.optional(),
  autoplay: z.boolean().optional()
});
var CloseBeatSchema = z.object({
  noor_message_template: z.string().optional(),
  noor_message: z.object({ en: z.string().min(1), ur: z.string().optional() }).optional()
});

// src/schemas/discover-cards.ts
import { z as z2 } from "zod";
var DiscoverCardSchema = z2.discriminatedUnion("type", [
  // WORD
  z2.object({
    type: z2.literal("WORD"),
    text: ArabicTextSchema,
    image_url: z2.string().optional(),
    audio_url: z2.string().optional(),
    explanation: ExplanationSchema.optional(),
    examples: z2.array(ArabicTextSchema).optional(),
    introduces_vocab: VocabRefSchema.optional()
  }),
  // CONCEPT
  z2.object({
    type: z2.literal("CONCEPT"),
    concept: ConceptSchema,
    explanation: ExplanationSchema,
    image_url: z2.string().optional(),
    audio_url: z2.string().optional(),
    examples: z2.array(ArabicTextSchema).optional(),
    introduces_vocab: VocabRefSchema.optional()
  }),
  // EXAMPLE
  z2.object({
    type: z2.literal("EXAMPLE"),
    text: ArabicTextSchema.optional(),
    explanation: ExplanationSchema.optional(),
    image_url: z2.string().optional(),
    audio_url: z2.string().optional(),
    examples: z2.array(ArabicTextSchema).optional(),
    introduces_vocab: VocabRefSchema.optional()
  }),
  // CONTRAST
  z2.object({
    type: z2.literal("CONTRAST"),
    concept: ConceptSchema.optional(),
    text: ArabicTextSchema.optional(),
    explanation: ExplanationSchema.optional(),
    image_url: z2.string().optional(),
    audio_url: z2.string().optional(),
    examples: z2.array(ArabicTextSchema).min(2),
    introduces_vocab: VocabRefSchema.optional()
  }),
  // AYAH_PREVIEW
  z2.object({
    type: z2.literal("AYAH_PREVIEW"),
    concept: ConceptSchema.optional(),
    text: ArabicTextSchema.optional(),
    explanation: ExplanationSchema.optional(),
    image_url: z2.string().optional(),
    audio_url: z2.string().optional(),
    examples: z2.array(ArabicTextSchema).min(1).optional(),
    introduces_vocab: VocabRefSchema.optional()
  }),
  // Legacy/player-supported card used by existing fixtures.
  z2.object({
    type: z2.literal("GRAMMAR_NOTE"),
    title: ConceptSchema,
    body: ExplanationSchema,
    image_url: z2.string().optional(),
    audio_url: z2.string().optional()
  }),
  // Legacy/player-supported card used by existing fixtures.
  z2.object({
    type: z2.literal("SENTENCE"),
    text: ArabicTextSchema,
    explanation: ExplanationSchema.optional(),
    image_url: z2.string().optional(),
    audio_url: z2.string().optional(),
    introduces_vocab: VocabRefSchema.optional()
  })
]);

// src/schemas/exercises.ts
import { z as z3 } from "zod";
var ExerciseBaseSchema = z3.object({
  id: z3.string().min(1),
  xp_value: z3.number().int().min(0).optional(),
  explanation_on_wrong: z3.object({ en: z3.string().min(1), ur: z3.string().optional() }).optional()
});
var TrueFalseExerciseSchema = ExerciseBaseSchema.extend({
  type: z3.literal("TRUE_FALSE"),
  statement: z3.object({
    en: z3.string().min(1),
    ur: z3.string().optional(),
    ar_example: ArabicTextSchema.optional()
  }),
  correct_answer: z3.boolean()
});
var TapTranslationExerciseSchema = ExerciseBaseSchema.extend({
  type: z3.literal("TAP_TRANSLATION"),
  prompt: ArabicTextSchema,
  options: z3.array(z3.object({ en: z3.string().min(1), ur: z3.string().optional() })).length(4),
  correct_index: z3.number().int().min(0).max(3),
  audio_url: z3.string().optional()
});
var FillBlankExerciseSchema = ExerciseBaseSchema.extend({
  type: z3.literal("FILL_BLANK"),
  mode: z3.enum(["TAP", "TYPE"]),
  sentence_ar: z3.string(),
  hint: z3.object({ en: z3.string().min(1), ur: z3.string().optional() }),
  options: z3.array(ArabicTextSchema).length(4).optional(),
  correct_answer: ArabicTextSchema
});
var BuildSentenceExerciseSchema = ExerciseBaseSchema.extend({
  type: z3.literal("BUILD_SENTENCE"),
  target_translation: z3.object({ en: z3.string().min(1), ur: z3.string().optional() }),
  tiles: z3.array(ArabicTextSchema).min(2),
  correct_order: z3.array(z3.number().int().min(0)).min(1)
});
var MatchingExerciseSchema = ExerciseBaseSchema.extend({
  type: z3.literal("MATCHING"),
  left_column: z3.array(ArabicTextSchema).min(2),
  right_column: z3.array(z3.object({ en: z3.string().min(1), ur: z3.string().optional() })).min(2),
  correct_pairs: z3.array(z3.tuple([z3.number().int(), z3.number().int()])).min(2)
});
var GrammaticalRoleSchema = z3.enum([
  "SUBJECT",
  "PREDICATE",
  "VERB",
  "OBJECT",
  "PARTICLE",
  "PREPOSITION",
  "POSSESSIVE",
  "ADJECTIVE",
  "DEMONSTRATIVE",
  "RELATIVE_PRONOUN",
  // extended roles from validate-curriculum.cjs
  "PRONOUN",
  "LITERARY_DEVICE",
  "CONJUNCTION",
  "INTERJECTION",
  "VERB_PHRASE",
  "NOUN",
  "VOCATIVE",
  "TIME_ZARF",
  "PLACE_ZARF"
]);
var GrammarParseExerciseSchema = ExerciseBaseSchema.extend({
  type: z3.literal("GRAMMAR_PARSE"),
  sentence_ar: z3.string(),
  words: z3.array(ArabicTextSchema).min(1),
  available_roles: z3.array(GrammaticalRoleSchema).min(1),
  correct_roles: z3.array(GrammaticalRoleSchema).min(1)
});
var ConversationBuilderExerciseSchema = ExerciseBaseSchema.extend({
  type: z3.literal("CONVERSATION_BUILDER"),
  prompt_line: ArabicTextSchema,
  response_mode: z3.enum(["PICK", "BUILD"]),
  options: z3.array(ArabicTextSchema).optional(),
  correct_option_index: z3.number().int().min(0).optional(),
  tiles: z3.array(ArabicTextSchema).optional(),
  correct_order: z3.array(z3.number().int().min(0)).optional()
});
var ShadowRepeatExerciseSchema = ExerciseBaseSchema.extend({
  type: z3.literal("SHADOW_REPEAT"),
  phrase: ArabicTextSchema,
  audio_url: z3.string(),
  self_grading: z3.literal(true)
});
var AudioRecognitionExerciseSchema = ExerciseBaseSchema.extend({
  type: z3.literal("AUDIO_RECOGNITION"),
  arabic_text: z3.string().min(1),
  audio_url: z3.string().optional(),
  options: z3.array(z3.object({ en: z3.string().min(1), ur: z3.string().optional() })).length(4),
  correct_index: z3.number().int().min(0).max(3)
});
var WriteArabicExerciseSchema = ExerciseBaseSchema.extend({
  type: z3.literal("WRITE_ARABIC"),
  prompt: z3.object({ en: z3.string().min(1), ur: z3.string().optional() }),
  audio_url: z3.string().optional(),
  correct_answer: ArabicTextSchema,
  hint_available: z3.boolean()
});
var HarakahPlacementExerciseSchema = ExerciseBaseSchema.extend({
  type: z3.literal("HARAKAH_PLACEMENT"),
  word_unvowelled: z3.string(),
  correct_vowelled: z3.string(),
  hint: z3.object({ en: z3.string().min(1), ur: z3.string().optional() })
});
var WordOrderExerciseSchema = ExerciseBaseSchema.extend({
  type: z3.literal("WORD_ORDER"),
  tiles: z3.array(ArabicTextSchema).min(2),
  correct_order: z3.array(z3.number().int().min(0)).min(1),
  context: z3.object({ en: z3.string().min(1), ur: z3.string().optional() })
});
var TranslateToArabicExerciseSchema = ExerciseBaseSchema.extend({
  type: z3.literal("TRANSLATE_TO_ARABIC"),
  source: z3.object({ en: z3.string().min(1), ur: z3.string().optional() }),
  acceptable_answers: z3.array(ArabicTextSchema).min(1)
});
var IdentifyRootExerciseSchema = ExerciseBaseSchema.extend({
  type: z3.literal("IDENTIFY_ROOT"),
  word: ArabicTextSchema,
  options: z3.array(z3.string()).length(4),
  correct_index: z3.number().int().min(0).max(3)
});
var MatchAyahExerciseSchema = ExerciseBaseSchema.extend({
  type: z3.literal("MATCH_AYAH"),
  ayah_fragment: z3.object({ ar: z3.string().min(1), surah_ref: z3.string() }),
  options: z3.array(z3.object({ en: z3.string().min(1), ur: z3.string().optional() })).length(4),
  correct_index: z3.number().int().min(0).max(3)
});
var ExerciseSchema = z3.discriminatedUnion("type", [
  TrueFalseExerciseSchema,
  TapTranslationExerciseSchema,
  FillBlankExerciseSchema,
  BuildSentenceExerciseSchema,
  MatchingExerciseSchema,
  GrammarParseExerciseSchema,
  ConversationBuilderExerciseSchema,
  ShadowRepeatExerciseSchema,
  AudioRecognitionExerciseSchema,
  WriteArabicExerciseSchema,
  HarakahPlacementExerciseSchema,
  WordOrderExerciseSchema,
  TranslateToArabicExerciseSchema,
  IdentifyRootExerciseSchema,
  MatchAyahExerciseSchema
]);
function isExercise(value) {
  return ExerciseSchema.safeParse(value).success;
}

// src/schemas/lesson.ts
import { z as z4 } from "zod";
var LessonContentSchema = z4.object({
  schema_version: z4.literal("1.0"),
  template: z4.enum(["STANDARD", "SPOKEN_PHRASES", "REVIEW", "VERB_PATTERN"]),
  hook: HookBeatSchema,
  close: CloseBeatSchema,
  discover_cards: z4.array(DiscoverCardSchema).optional(),
  exercises: z4.array(ExerciseSchema).optional(),
  reveal: z4.object({
    concept_name: z4.object({ en: z4.string().min(1), ar: z4.string().optional(), ur: z4.string().optional() }),
    ayah: z4.object({
      surah: z4.number().int().min(1).max(114),
      ayah: z4.number().int().min(1),
      label: z4.string().min(1),
      ar: z4.string().min(1),
      en: z4.string().min(1),
      ur: z4.string().optional(),
      audio_url: z4.string().optional()
    }),
    highlighted_word_indices: z4.array(z4.number().int().min(0)),
    noor_explanation: z4.object({ en: z4.string().min(1), ur: z4.string().optional() })
  }).optional(),
  spoken_phrases: z4.object({
    scene: z4.object({ en: z4.string().min(1), ur: z4.string().optional() }),
    phrases: z4.array(
      z4.object({
        id: z4.string().min(1),
        phrase: z4.object({ ar: z4.string().min(1), ar_plain: z4.string().min(1), translit: z4.string().min(1), en: z4.string().min(1), ur: z4.string().optional() }),
        audio_url: z4.string(),
        context: z4.object({ en: z4.string().min(1), ur: z4.string().optional() }).optional()
      })
    ).min(4),
    dialogue: z4.array(
      z4.object({
        speaker: z4.enum(["A", "B"]),
        phrase_id: z4.string()
      })
    ).optional()
  }).optional(),
  conjugation_table: z4.object({
    root: z4.string(),
    pattern_name: z4.object({ en: z4.string().min(1), ar: z4.string().optional(), ur: z4.string().optional() }),
    rows: z4.array(
      z4.object({
        pronoun: z4.object({ ar: z4.string().min(1), ar_plain: z4.string().min(1), translit: z4.string().min(1), en: z4.string().min(1), ur: z4.string().optional() }),
        conjugated: z4.object({ ar: z4.string().min(1), ar_plain: z4.string().min(1), translit: z4.string().min(1), en: z4.string().min(1), ur: z4.string().optional() }),
        audio_url: z4.string().optional()
      })
    ).min(1)
  }).optional()
});
function isStandardLesson(v) {
  return v.template === "STANDARD";
}
function isSpokenPhrasesLesson(v) {
  return v.template === "SPOKEN_PHRASES";
}
function isVerbPatternLesson(v) {
  return v.template === "VERB_PATTERN";
}
function isReviewLesson(v) {
  return v.template === "REVIEW";
}
function parseLenient(json) {
  if (typeof json !== "object" || json === null) return null;
  const result = LessonContentSchema.safeParse(json);
  if (result.success) return result.data;
  return null;
}

// src/factories/index.ts
import { nanoid } from "nanoid";
function createExerciseId() {
  return `ex_${nanoid(12)}`;
}
function createStarterCard(type) {
  const base = {
    image_url: "",
    audio_url: ""
  };
  switch (type) {
    case "WORD":
      return {
        type: "WORD",
        text: { ar: "\u0647\u064E\u0630\u064E\u0627", ar_plain: "\u0647\u0630\u0627", translit: "hadha", en: "this", ur: "\u06CC\u06C1" },
        ...base,
        introduces_vocab: { ar_plain: "\u0647\u0630\u0627" }
      };
    case "CONCEPT":
      return {
        type: "CONCEPT",
        concept: { en: "Arabic concept name", ar: "\u0645\u064E\u0641\u0652\u0647\u064F\u0648\u0645", ur: "\u0639\u0631\u0628\u06CC \u062A\u0635\u0648\u0631" },
        explanation: { en: "Short explanation of the concept.", ur: "\u062A\u0635\u0648\u0631 \u06A9\u06CC \u0645\u062E\u062A\u0635\u0631 \u0648\u0636\u0627\u062D\u062A\u06D4" },
        examples: [
          { ar: "\u0647\u064E\u0630\u064E\u0627 \u0643\u0650\u062A\u064E\u0627\u0628\u064C", ar_plain: "\u0647\u0630\u0627 \u0643\u062A\u0627\u0628", translit: "hadha kitabun", en: "This is a book.", ur: "\u06CC\u06C1 \u0627\u06CC\u06A9 \u06A9\u062A\u0627\u0628 \u06C1\u06D2\u06D4" }
        ],
        ...base
      };
    case "EXAMPLE":
      return {
        type: "EXAMPLE",
        text: { ar: "\u0647\u064E\u0630\u064E\u0627 \u0643\u0650\u062A\u064E\u0627\u0628\u064C", ar_plain: "\u0647\u0630\u0627 \u0643\u062A\u0627\u0628", translit: "hadha kitabun", en: "This is a book.", ur: "\u06CC\u06C1 \u0627\u06CC\u06A9 \u06A9\u062A\u0627\u0628 \u06C1\u06D2\u06D4" },
        explanation: { en: "Short explanation of what this example demonstrates.", ur: "\u06CC\u06C1 \u0645\u062B\u0627\u0644 \u06A9\u06CC\u0627 \u062F\u06A9\u06BE\u0627\u062A\u06CC \u06C1\u06D2 \u0627\u0633 \u06A9\u06CC \u0645\u062E\u062A\u0635\u0631 \u0648\u0636\u0627\u062D\u062A\u06D4" },
        ...base
      };
    case "CONTRAST":
      return {
        type: "CONTRAST",
        concept: { en: "Near vs far", ar: "\u0642\u064E\u0631\u0650\u064A\u0628 \u0648\u064E\u0628\u064E\u0639\u0650\u064A\u062F", ur: "\u0642\u0631\u06CC\u0628 \u0627\u0648\u0631 \u062F\u0648\u0631" },
        explanation: { en: "Short explanation of the contrast.", ur: "\u0641\u0631\u0642 \u06A9\u06CC \u0645\u062E\u062A\u0635\u0631 \u0648\u0636\u0627\u062D\u062A\u06D4" },
        examples: [
          { ar: "\u0647\u064E\u0630\u064E\u0627 \u0643\u0650\u062A\u064E\u0627\u0628\u064C", ar_plain: "\u0647\u0630\u0627 \u0643\u062A\u0627\u0628", translit: "hadha kitabun", en: "This is a book.", ur: "\u06CC\u06C1 \u0627\u06CC\u06A9 \u06A9\u062A\u0627\u0628 \u06C1\u06D2\u06D4" },
          { ar: "\u0630\u0670\u0644\u0650\u0643\u064E \u0643\u0650\u062A\u064E\u0627\u0628\u064C", ar_plain: "\u0630\u0644\u0643 \u0643\u062A\u0627\u0628", translit: "dhalika kitabun", en: "That is a book.", ur: "\u0648\u06C1 \u0627\u06CC\u06A9 \u06A9\u062A\u0627\u0628 \u06C1\u06D2\u06D4" }
        ],
        ...base
      };
    case "AYAH_PREVIEW":
      return {
        type: "AYAH_PREVIEW",
        concept: { en: "Concept in the Quran", ar: "\u0627\u0644\u0645\u0641\u0647\u0648\u0645 \u0641\u064A \u0627\u0644\u0642\u0631\u0622\u0646", ur: "\u0642\u0631\u0622\u0646 \u0645\u06CC\u06BA \u062A\u0635\u0648\u0631" },
        explanation: { en: "Short explanation of how the concept appears in the ayah.", ur: "\u0622\u06CC\u062A \u0645\u06CC\u06BA \u06CC\u06C1 \u062A\u0635\u0648\u0631 \u06A9\u06CC\u0633\u06D2 \u0622\u062A\u0627 \u06C1\u06D2 \u0627\u0633 \u06A9\u06CC \u0645\u062E\u062A\u0635\u0631 \u0648\u0636\u0627\u062D\u062A\u06D4" },
        examples: [
          { ar: "\u0648\u064E\u0627\u0644\u0652\u0645\u064F\u0624\u0652\u0645\u0650\u0646\u064E\u0627\u062A\u064F", ar_plain: "\u0648\u0627\u0644\u0645\u0624\u0645\u0646\u0627\u062A", translit: "wal-mu'minat", en: "and the believing women", ur: "\u0627\u0648\u0631 \u0627\u06CC\u0645\u0627\u0646 \u0648\u0627\u0644\u06CC \u0639\u0648\u0631\u062A\u06CC\u06BA" }
        ],
        ...base
      };
    case "GRAMMAR_NOTE":
      return {
        type: "GRAMMAR_NOTE",
        title: { en: "Grammar note", ar: "\xD9\u2026\xD9\u201E\xD8\xA7\xD8\xAD\xD8\xB8\xD8\xA9 \xD9\u2020\xD8\xAD\xD9\u02C6\xD9\u0160\xD8\xA9", ur: "\xDA\xAF\xD8\xB1\xD8\xA7\xD9\u2026\xD8\xB1 \xD9\u2020\xD9\u02C6\xD9\xB9" },
        body: { en: "Short grammar note.", ur: "\xD9\u2026\xD8\xAE\xD8\xAA\xD8\xB5\xD8\xB1 \xDA\xAF\xD8\xB1\xD8\xA7\xD9\u2026\xD8\xB1 \xD9\u2020\xD9\u02C6\xD9\xB9\xDB\u201D" },
        ...base
      };
    case "SENTENCE":
      return {
        type: "SENTENCE",
        text: { ar: "\xD9\u2021\xD9\u017D\xD8\xB0\xD9\u017D\xD8\xA7 \xD9\u0192\xD9\x90\xD8\xAA\xD9\u017D\xD8\xA7\xD8\xA8\xD9\u0152", ar_plain: "\xD9\u2021\xD8\xB0\xD8\xA7 \xD9\u0192\xD8\xAA\xD8\xA7\xD8\xA8", translit: "hadha kitabun", en: "This is a book.", ur: "\xDB\u0152\xDB\x81 \xD8\xA7\xDB\u0152\xDA\xA9 \xDA\xA9\xD8\xAA\xD8\xA7\xD8\xA8 \xDB\x81\xDB\u2019\xDB\u201D" },
        explanation: { en: "Short sentence note.", ur: "\xD8\xAC\xD9\u2026\xD9\u201E\xDB\u2019 \xDA\xA9\xDB\u0152 \xD9\u2026\xD8\xAE\xD8\xAA\xD8\xB5\xD8\xB1 \xD9\u02C6\xD8\xB6\xD8\xA7\xD8\xAD\xD8\xAA\xDB\u201D" },
        ...base
      };
  }
}
function createStarterExercise(type) {
  const id = createExerciseId();
  const base = { id, xp_value: 1 };
  switch (type) {
    case "TRUE_FALSE":
      return {
        ...base,
        type: "TRUE_FALSE",
        statement: {
          en: "The word \u0645\u064E\u0633\u0652\u062C\u0650\u062F means 'pen'.",
          ur: "\u0644\u0641\u0638 \u0645\u0633\u062C\u062F \u06A9\u0627 \u0645\u0637\u0644\u0628 '\u0642\u0644\u0645' \u06C1\u06D2\u06D4",
          ar_example: { ar: "\u0645\u064E\u0633\u0652\u062C\u0650\u062F", ar_plain: "\u0645\u0633\u062C\u062F", translit: "masjid", en: "mosque" }
        },
        correct_answer: false,
        explanation_on_wrong: {
          en: "\u0645\u064E\u0633\u0652\u062C\u0650\u062F means 'mosque'. The word for 'pen' is \u0642\u064E\u0644\u064E\u0645.",
          ur: "\u0645\u0633\u062C\u062F \u06A9\u0627 \u0645\u0637\u0644\u0628 \u0645\u0633\u062C\u062F \u06C1\u06D2\u06D4 \u0642\u0644\u0645 \u06A9\u06D2 \u0644\u06CC\u06D2 \u0644\u0641\u0638 \u0642\u064E\u0644\u064E\u0645 \u06C1\u06D2\u06D4"
        }
      };
    case "TAP_TRANSLATION":
      return {
        ...base,
        type: "TAP_TRANSLATION",
        prompt: { ar: "\u0647\u064E\u0630\u064E\u0627", ar_plain: "\u0647\u0630\u0627", translit: "hadha", en: "this" },
        options: [
          { en: "that", ur: "\u0648\u06C1" },
          { en: "this", ur: "\u06CC\u06C1" },
          { en: "here", ur: "\u06CC\u06C1\u0627\u06BA" },
          { en: "where", ur: "\u06A9\u06C1\u0627\u06BA" }
        ],
        correct_index: 1,
        explanation_on_wrong: {
          en: "\u0647\u064E\u0630\u064E\u0627 points at something near.",
          ur: "\u0647\u064E\u0630\u064E\u0627 \u06A9\u0633\u06CC \u0642\u0631\u06CC\u0628 \u0686\u06CC\u0632 \u06A9\u06CC \u0637\u0631\u0641 \u0627\u0634\u0627\u0631\u06C1 \u06C1\u06D2\u06D4"
        }
      };
    case "FILL_BLANK":
      return {
        ...base,
        type: "FILL_BLANK",
        mode: "TAP",
        sentence_ar: "___ \u0628\u064E\u064A\u0652\u062A\u064C",
        hint: { en: "This is a house.", ur: "\u06CC\u06C1 \u0627\u06CC\u06A9 \u06AF\u06BE\u0631 \u06C1\u06D2\u06D4" },
        options: [
          { ar: "\u0643\u0650\u062A\u064E\u0627\u0628\u064C", ar_plain: "\u0643\u062A\u0627\u0628", translit: "kitabun", en: "book" },
          { ar: "\u0647\u064E\u0630\u064E\u0627", ar_plain: "\u0647\u0630\u0627", translit: "hadha", en: "this" },
          { ar: "\u0642\u064E\u0644\u064E\u0645\u064C", ar_plain: "\u0642\u0644\u0645", translit: "qalamun", en: "pen" },
          { ar: "\u0645\u064E\u0633\u0652\u062C\u0650\u062F\u064C", ar_plain: "\u0645\u0633\u062C\u062F", translit: "masjidun", en: "mosque" }
        ],
        correct_answer: { ar: "\u0647\u064E\u0630\u064E\u0627", ar_plain: "\u0647\u0630\u0627", translit: "hadha", en: "this" }
      };
    case "BUILD_SENTENCE":
      return {
        ...base,
        type: "BUILD_SENTENCE",
        target_translation: { en: "This is a book.", ur: "\u06CC\u06C1 \u0627\u06CC\u06A9 \u06A9\u062A\u0627\u0628 \u06C1\u06D2\u06D4" },
        tiles: [
          { ar: "\u0643\u0650\u062A\u064E\u0627\u0628\u064C", ar_plain: "\u0643\u062A\u0627\u0628", translit: "kitabun", en: "book" },
          { ar: "\u0647\u064E\u0630\u064E\u0627", ar_plain: "\u0647\u0630\u0627", translit: "hadha", en: "this" }
        ],
        correct_order: [1, 0],
        explanation_on_wrong: {
          en: "In Arabic, \u0647\u064E\u0630\u064E\u0627 comes first, then the noun.",
          ur: "\u0639\u0631\u0628\u06CC \u0645\u06CC\u06BA \u067E\u06C1\u0644\u06D2 \u0647\u064E\u0630\u064E\u0627 \u0622\u062A\u0627 \u06C1\u06D2\u060C \u067E\u06BE\u0631 \u0627\u0633\u0645\u06D4"
        }
      };
    case "MATCHING":
      return {
        ...base,
        type: "MATCHING",
        left_column: [
          { ar: "\u0643\u0650\u062A\u064E\u0627\u0628", ar_plain: "\u0643\u062A\u0627\u0628", translit: "kitab", en: "book" },
          { ar: "\u0642\u064E\u0644\u064E\u0645", ar_plain: "\u0642\u0644\u0645", translit: "qalam", en: "pen" }
        ],
        right_column: [
          { en: "book", ur: "\u06A9\u062A\u0627\u0628" },
          { en: "pen", ur: "\u0642\u0644\u0645" }
        ],
        correct_pairs: [
          [0, 0],
          [1, 1]
        ]
      };
    // Remaining 10 types — schemas support them; factory is here for completeness
    case "GRAMMAR_PARSE":
      return {
        ...base,
        type: "GRAMMAR_PARSE",
        sentence_ar: "\u0627\u0644\u0637\u064E\u0651\u0627\u0644\u0650\u0628\u064E\u0627\u062A\u064F \u0645\u064F\u062C\u0652\u062A\u064E\u0647\u0650\u062F\u064E\u0627\u062A\u064C",
        words: [
          { ar: "\u0627\u0644\u0637\u064E\u0651\u0627\u0644\u0650\u0628\u064E\u0627\u062A\u064F", ar_plain: "\u0627\u0644\u0637\u0627\u0644\u0628\u0627\u062A", translit: "at-talibatu", en: "the female students", ur: "\u0637\u0627\u0644\u0628\u0627\u062A" },
          { ar: "\u0645\u064F\u062C\u0652\u062A\u064E\u0647\u0650\u062F\u064E\u0627\u062A\u064C", ar_plain: "\u0645\u062C\u062A\u0647\u062F\u0627\u062A", translit: "mujtahidatun", en: "hardworking", ur: "\u0645\u062D\u0646\u062A\u06CC" }
        ],
        available_roles: ["SUBJECT", "PREDICATE", "ADJECTIVE", "VERB"],
        correct_roles: ["SUBJECT", "PREDICATE"]
      };
    case "CONVERSATION_BUILDER":
      return {
        ...base,
        type: "CONVERSATION_BUILDER",
        prompt_line: { ar: "\u0643\u064E\u064A\u0652\u0641\u064E \u062D\u064E\u0627\u0644\u064F\u0643\u064E\u061F", ar_plain: "\u0643\u064A\u0641 \u062D\u0627\u0644\u0643", translit: "kayfa haluk", en: "How are you?" },
        response_mode: "PICK",
        options: [
          { ar: "\u0623\u064E\u0646\u064E\u0627 \u0628\u0650\u062E\u064E\u064A\u0652\u0631\u064D", ar_plain: "\u0623\u0646\u0627 \u0628\u062E\u064A\u0631", translit: "ana bikhayrin", en: "I am well." },
          { ar: "\u0623\u064E\u0646\u064E\u0627 \u0644\u064E\u064A\u0652\u0633\u064E \u0628\u0650\u062E\u064E\u064A\u0652\u0631\u064D", ar_plain: "\u0623\u0646\u0627 \u0644\u064A\u0633 \u0628\u062E\u064A\u0631", translit: "ana laysa bikhayrin", en: "I am not well." }
        ],
        correct_option_index: 0
      };
    case "SHADOW_REPEAT":
      return {
        ...base,
        type: "SHADOW_REPEAT",
        phrase: { ar: "\u0628\u0650\u0633\u0652\u0645\u0650 \u0671\u0644\u0644\u064E\u0651\u0647\u0650 \u0671\u0644\u0631\u064E\u0651\u062D\u0652\u0645\u064E\u0670\u0646\u0650 \u0671\u0644\u0631\u064E\u0651\u062D\u0650\u064A\u0645\u0650", ar_plain: "\u0628\u0633\u0645 \u0627\u0644\u0644\u0647 \u0627\u0644\u0631\u062D\u0645\u0646 \u0627\u0644\u0631\u062D\u064A\u0645", translit: "bismillah", en: "In the name of Allah" },
        audio_url: "https://cdn.warsh.app/audio/vocab/bismillah.mp3",
        self_grading: true
      };
    case "AUDIO_RECOGNITION":
      return {
        ...base,
        type: "AUDIO_RECOGNITION",
        arabic_text: "\u0647\u064E\u0630\u064E\u0627",
        options: [
          { en: "this", ur: "\u06CC\u06C1" },
          { en: "that", ur: "\u0648\u06C1" },
          { en: "what", ur: "\u06A9\u06CC\u0627" },
          { en: "who", ur: "\u06A9\u0648\u0646" }
        ],
        correct_index: 0
      };
    case "WRITE_ARABIC":
      return {
        ...base,
        type: "WRITE_ARABIC",
        prompt: { en: "Write the word for 'book' in Arabic.", ur: "'\u06A9\u062A\u0627\u0628' \u0639\u0631\u0628\u06CC \u0645\u06CC\u06BA \u0644\u06A9\u06BE\u06CC\u06BA\u06D4" },
        correct_answer: { ar: "\u0643\u0650\u062A\u064E\u0627\u0628", ar_plain: "\u0643\u062A\u0627\u0628", translit: "kitab", en: "book" },
        hint_available: true
      };
    case "HARAKAH_PLACEMENT":
      return {
        ...base,
        type: "HARAKAH_PLACEMENT",
        word_unvowelled: "\u0643\u062A\u0627\u0628",
        correct_vowelled: "\u0643\u0650\u062A\u064E\u0627\u0628",
        hint: { en: "book", ur: "\u06A9\u062A\u0627\u0628" }
      };
    case "WORD_ORDER":
      return {
        ...base,
        type: "WORD_ORDER",
        tiles: [
          { ar: "\u0647\u064E\u0630\u064E\u0627", ar_plain: "\u0647\u0630\u0627", translit: "hadha", en: "this" },
          { ar: "\u0643\u0650\u062A\u064E\u0627\u0628\u064C", ar_plain: "\u0643\u062A\u0627\u0628", translit: "kitabun", en: "book" }
        ],
        correct_order: [0, 1],
        context: { en: "Arrange into a sentence: 'This is a book.'", ur: "\u062C\u0645\u0644\u06C1 \u0628\u0646\u0627\u0626\u06CC\u06BA: '\u06CC\u06C1 \u0627\u06CC\u06A9 \u06A9\u062A\u0627\u0628 \u06C1\u06D2\u06D4'" }
      };
    case "TRANSLATE_TO_ARABIC":
      return {
        ...base,
        type: "TRANSLATE_TO_ARABIC",
        source: { en: "This is a book.", ur: "\u06CC\u06C1 \u0627\u06CC\u06A9 \u06A9\u062A\u0627\u0628 \u06C1\u06D2\u06D4" },
        acceptable_answers: [
          { ar: "\u0647\u064E\u0630\u064E\u0627 \u0643\u0650\u062A\u064E\u0627\u0628\u064C", ar_plain: "\u0647\u0630\u0627 \u0643\u062A\u0627\u0628", translit: "hadha kitabun", en: "This is a book." }
        ]
      };
    case "IDENTIFY_ROOT":
      return {
        ...base,
        type: "IDENTIFY_ROOT",
        word: { ar: "\u0643\u0650\u062A\u064E\u0627\u0628", ar_plain: "\u0643\u062A\u0627\u0628", translit: "kitab", en: "book" },
        options: ["\u0643 \u062A \u0628", "\u0642 \u0644 \u0645", "\u0628 \u064A \u062A", "\u0633 \u062C \u062F"],
        correct_index: 0
      };
    case "MATCH_AYAH":
      return {
        ...base,
        type: "MATCH_AYAH",
        ayah_fragment: { ar: "\u0648\u064E\u0627\u0644\u0652\u0645\u064F\u0624\u0652\u0645\u0650\u0646\u064E\u0627\u062A\u064F", surah_ref: "At-Tawbah 9:71" },
        options: [
          { en: "and the believing women", ur: "\u0627\u0648\u0631 \u0627\u06CC\u0645\u0627\u0646 \u0648\u0627\u0644\u06CC \u0639\u0648\u0631\u062A\u06CC\u06BA" },
          { en: "and the believing men", ur: "\u0627\u0648\u0631 \u0627\u06CC\u0645\u0627\u0646 \u0648\u0627\u0644\u06D2 \u0645\u0631\u062F" },
          { en: "and the books", ur: "\u0627\u0648\u0631 \u06A9\u062A\u0627\u0628\u06CC\u06BA" },
          { en: "and the two students", ur: "\u0627\u0648\u0631 \u062F\u0648 \u0637\u0627\u0644\u0628 \u0639\u0644\u0645" }
        ],
        correct_index: 0
      };
  }
}

// src/form-config.ts
var discoverCardFormConfig = {
  WORD: {
    type: "WORD",
    label: { en: "Word Card", ur: "\u0644\u0641\u0638 \u06A9\u0627\u0631\u0688" },
    playerSupported: true,
    authoringScope: true,
    fields: {
      "text.ar": { label: { en: "Arabic (with harakat)", ur: "\u0639\u0631\u0628\u06CC (\u062D\u0631\u06A9\u0627\u062A \u06A9\u06D2 \u0633\u0627\u062A\u06BE)" }, inputKind: "arabic", rtl: true, required: true },
      "text.ar_plain": { label: { en: "Arabic (plain)", ur: "\u0639\u0631\u0628\u06CC (\u062E\u0627\u0644\u06CC)" }, inputKind: "arabic", rtl: true, required: true },
      "text.translit": { label: { en: "Transliteration", ur: " transliteretion" }, inputKind: "text", required: true },
      "text.en": { label: { en: "English", ur: "\u0627\u0646\u06AF\u0631\u06CC\u0632\u06CC" }, inputKind: "text", required: true },
      "text.ur": { label: { en: "Urdu", ur: "\u0627\u0631\u062F\u0648" }, inputKind: "text", required: false },
      "image_url": { label: { en: "Image URL", ur: "\u062A\u0635\u0648\u06CC\u0631 URL" }, inputKind: "text", required: false },
      "audio_url": { label: { en: "Audio URL", ur: "\u0622\u0688\u06CC\u0648 URL" }, inputKind: "text", required: false },
      "explanation.en": { label: { en: "Explanation (EN)", ur: "\u0648\u0636\u0627\u062D\u062A (\u0627\u0646\u06AF\u0631\u06CC\u0632\u06CC)" }, inputKind: "text", required: false },
      "explanation.ur": { label: { en: "Explanation (UR)", ur: "\u0648\u0636\u0627\u062D\u062A (\u0627\u0631\u062F\u0648)" }, inputKind: "text", required: false }
    }
  },
  CONCEPT: {
    type: "CONCEPT",
    label: { en: "Concept Card", ur: "\u062A\u0635\u0648\u0631 \u06A9\u0627\u0631\u0688" },
    playerSupported: true,
    authoringScope: true,
    fields: {
      "concept.en": { label: { en: "Concept (EN)", ur: "\u062A\u0635\u0648\u0631 (\u0627\u0646\u06AF\u0631\u06CC\u0632\u06CC)" }, inputKind: "text", required: true },
      "concept.ar": { label: { en: "Concept (AR)", ur: "\u062A\u0635\u0648\u0631 (\u0639\u0631\u0628\u06CC)" }, inputKind: "arabic", rtl: true, required: false },
      "concept.ur": { label: { en: "Concept (UR)", ur: "\u062A\u0635\u0648\u0631 (\u0627\u0631\u062F\u0648)" }, inputKind: "text", required: false },
      "explanation.en": { label: { en: "Explanation (EN)", ur: "\u0648\u0636\u0627\u062D\u062A (\u0627\u0646\u06AF\u0631\u06CC\u0632\u06CC)" }, inputKind: "text", required: true },
      "explanation.ur": { label: { en: "Explanation (UR)", ur: "\u0648\u0636\u0627\u062D\u062A (\u0627\u0631\u062F\u0648)" }, inputKind: "text", required: false }
    }
  },
  EXAMPLE: {
    type: "EXAMPLE",
    label: { en: "Example Card", ur: "\u0645\u062B\u0627\u0644 \u06A9\u0627\u0631\u0688" },
    playerSupported: true,
    authoringScope: true,
    fields: {
      "text.ar": { label: { en: "Arabic sentence", ur: "\u0639\u0631\u0628\u06CC \u062C\u0645\u0644\u06C1" }, inputKind: "arabic", rtl: true, required: false },
      "text.ar_plain": { label: { en: "Arabic (plain)", ur: "\u0639\u0631\u0628\u06CC (\u062E\u0627\u0644\u06CC)" }, inputKind: "arabic", rtl: true, required: false },
      "text.translit": { label: { en: "Transliteration", ur: "transliteration" }, inputKind: "text", required: false },
      "text.en": { label: { en: "English", ur: "\u0627\u0646\u06AF\u0631\u06CC\u0632\u06CC" }, inputKind: "text", required: false },
      "text.ur": { label: { en: "Urdu", ur: "\u0627\u0631\u062F\u0648" }, inputKind: "text", required: false },
      "explanation.en": { label: { en: "Explanation (EN)", ur: "\u0648\u0636\u0627\u062D\u062A (\u0627\u0646\u06AF\u0631\u06CC\u0632\u06CC)" }, inputKind: "text", required: false },
      "explanation.ur": { label: { en: "Explanation (UR)", ur: "\u0648\u0636\u0627\u062D\u062A (\u0627\u0631\u062F\u0648)" }, inputKind: "text", required: false }
    }
  },
  CONTRAST: {
    type: "CONTRAST",
    label: { en: "Contrast Card", ur: "\u0641\u0631\u0642 \u06A9\u0627\u0631\u0688" },
    playerSupported: true,
    authoringScope: true,
    fields: {
      "concept.en": { label: { en: "Contrast title (EN)", ur: "\u0641\u0631\u0642 \u0639\u0646\u0648\u0627\u0646 (\u0627\u0646\u06AF\u0631\u06CC\u0632\u06CC)" }, inputKind: "text", required: true },
      "concept.ar": { label: { en: "Contrast title (AR)", ur: "\u0641\u0631\u0642 \u0639\u0646\u0648\u0627\u0646 (\u0639\u0631\u0628\u06CC)" }, inputKind: "arabic", rtl: true, required: false },
      "concept.ur": { label: { en: "Contrast title (UR)", ur: "\u0641\u0631\u0642 \u0639\u0646\u0648\u0627\u0646 (\u0627\u0631\u062F\u0648)" }, inputKind: "text", required: false },
      "explanation.en": { label: { en: "Explanation (EN)", ur: "\u0648\u0636\u0627\u062D\u062A (\u0627\u0646\u06AF\u0631\u06CC\u0632\u06CC)" }, inputKind: "text", required: false },
      "explanation.ur": { label: { en: "Explanation (UR)", ur: "\u0648\u0636\u0627\u062D\u062A (\u0627\u0631\u062F\u0648)" }, inputKind: "text", required: false }
    }
  },
  AYAH_PREVIEW: {
    type: "AYAH_PREVIEW",
    label: { en: "Quran Ayah Card", ur: "\u0642\u0631\u0622\u0646 \u0622\u06CC\u062A \u06A9\u0627\u0631\u0688" },
    playerSupported: true,
    authoringScope: true,
    fields: {
      "concept.en": { label: { en: "Concept (EN)", ur: "\u062A\u0635\u0648\u0631 (\u0627\u0646\u06AF\u0631\u06CC\u0632\u06CC)" }, inputKind: "text", required: true },
      "concept.ar": { label: { en: "Concept (AR)", ur: "\u062A\u0635\u0648\u0631 (\u0639\u0631\u0628\u06CC)" }, inputKind: "arabic", rtl: true, required: false },
      "concept.ur": { label: { en: "Concept (UR)", ur: "\u062A\u0635\u0648\u0631 (\u0627\u0631\u062F\u0648)" }, inputKind: "text", required: false },
      "explanation.en": { label: { en: "Explanation (EN)", ur: "\u0648\u0636\u0627\u062D\u062A (\u0627\u0646\u06AF\u0631\u06CC\u0632\u06CC)" }, inputKind: "text", required: false },
      "explanation.ur": { label: { en: "Explanation (UR)", ur: "\u0648\u0636\u0627\u062D\u062A (\u0627\u0631\u062F\u0648)" }, inputKind: "text", required: false }
    }
  }
};
var exerciseFormConfig = {
  TRUE_FALSE: {
    type: "TRUE_FALSE",
    label: { en: "True / False", ur: "\u0633\u0686 / \u062C\u06BE\u0648\u0679" },
    playerSupported: true,
    authoringScope: true,
    fields: {
      "statement.en": { label: { en: "Statement (EN)", ur: "\u0628\u06CC\u0627\u0646 (\u0627\u0646\u06AF\u0631\u06CC\u0632\u06CC)" }, inputKind: "text", required: true },
      "statement.ur": { label: { en: "Statement (UR)", ur: "\u0628\u06CC\u0627\u0646 (\u0627\u0631\u062F\u0648)" }, inputKind: "text", required: false },
      "correct_answer": { label: { en: "Correct answer", ur: "\u062F\u0631\u0633\u062A \u062C\u0648\u0627\u0628" }, inputKind: "select", required: true },
      "explanation_on_wrong.en": { label: { en: "Wrong explanation (EN)", ur: "\u063A\u0644\u0637\u06CC \u06A9\u06CC \u0648\u0636\u0627\u062D\u062A (\u0627\u0646\u06AF\u0631\u06CC\u0632\u06CC)" }, inputKind: "text", required: false },
      "explanation_on_wrong.ur": { label: { en: "Wrong explanation (UR)", ur: "\u063A\u0644\u0637\u06CC \u06A9\u06CC \u0648\u0636\u0627\u062D\u062A (\u0627\u0631\u062F\u0648)" }, inputKind: "text", required: false }
    }
  },
  TAP_TRANSLATION: {
    type: "TAP_TRANSLATION",
    label: { en: "Tap Translation", ur: "\u0679\u06CC\u067E \u062A\u0631\u062C\u0645\u06C1" },
    playerSupported: true,
    authoringScope: true,
    fields: {
      "prompt.ar": { label: { en: "Arabic prompt", ur: "\u0639\u0631\u0628\u06CC \u0633\u0648\u0627\u0644" }, inputKind: "arabic", rtl: true, required: true },
      "prompt.ar_plain": { label: { en: "Arabic (plain)", ur: "\u0639\u0631\u0628\u06CC (\u062E\u0627\u0644\u06CC)" }, inputKind: "arabic", rtl: true, required: true },
      "prompt.translit": { label: { en: "Transliteration", ur: "transliteration" }, inputKind: "text", required: false },
      "prompt.en": { label: { en: "English", ur: "\u0627\u0646\u06AF\u0631\u06CC\u0632\u06CC" }, inputKind: "text", required: true },
      "correct_index": { label: { en: "Correct option index (0\u20133)", ur: "\u062F\u0631\u0633\u062A \u0622\u067E\u0634\u0646 \u0627\u0646\u0688\u06CC\u06A9\u0633" }, inputKind: "number", required: true },
      "options": { label: { en: "4 translation options", ur: "4 \u062A\u0631\u062C\u0645\u06C1 \u0622\u067E\u0634\u0646\u0632" }, inputKind: "options", required: true },
      "explanation_on_wrong.en": { label: { en: "Wrong explanation (EN)", ur: "\u063A\u0644\u0637\u06CC \u06A9\u06CC \u0648\u0636\u0627\u062D\u062A" }, inputKind: "text", required: false },
      "explanation_on_wrong.ur": { label: { en: "Wrong explanation (UR)", ur: "\u063A\u0644\u0637\u06CC \u06A9\u06CC \u0648\u0636\u0627\u062D\u062A" }, inputKind: "text", required: false }
    }
  },
  FILL_BLANK: {
    type: "FILL_BLANK",
    label: { en: "Fill in the Blank", ur: "\u062E\u0627\u0644\u06CC \u062C\u06AF\u06C1 \u067E\u064F\u0631 \u06A9\u0631\u06CC\u06BA" },
    playerSupported: true,
    authoringScope: true,
    fields: {
      mode: { label: { en: "Mode", ur: "\u0645\u0648\u0688" }, inputKind: "select", required: true },
      sentence_ar: { label: { en: "Sentence with ___ for blank", ur: "\u062C\u0645\u0644\u06C1 ___ \u06A9\u06D2 \u0633\u0627\u062A\u06BE" }, inputKind: "arabic", rtl: true, required: true },
      "hint.en": { label: { en: "Hint (EN)", ur: "\u0627\u0634\u0627\u0631\u06C1 (\u0627\u0646\u06AF\u0631\u06CC\u0632\u06CC)" }, inputKind: "text", required: true },
      "hint.ur": { label: { en: "Hint (UR)", ur: "\u0627\u0634\u0627\u0631\u06C1 (\u0627\u0631\u062F\u0648)" }, inputKind: "text", required: false },
      options: { label: { en: "4 tap options", ur: "4 \u0679\u06CC\u067E \u0622\u067E\u0634\u0646\u0632" }, inputKind: "options", required: false },
      "correct_answer.ar": { label: { en: "Correct Arabic answer", ur: "\u062F\u0631\u0633\u062A \u0639\u0631\u0628\u06CC \u062C\u0648\u0627\u0628" }, inputKind: "arabic", rtl: true, required: true },
      "correct_answer.ar_plain": { label: { en: "Arabic (plain)", ur: "\u0639\u0631\u0628\u06CC (\u062E\u0627\u0644\u06CC)" }, inputKind: "arabic", rtl: true, required: false },
      "correct_answer.translit": { label: { en: "Transliteration", ur: "transliteration" }, inputKind: "text", required: false },
      "correct_answer.en": { label: { en: "English", ur: "\u0627\u0646\u06AF\u0631\u06CC\u0632\u06CC" }, inputKind: "text", required: false }
    }
  },
  BUILD_SENTENCE: {
    type: "BUILD_SENTENCE",
    label: { en: "Build a Sentence", ur: "\u062C\u0645\u0644\u06C1 \u0628\u0646\u0627\u0626\u06CC\u06BA" },
    playerSupported: true,
    authoringScope: true,
    fields: {
      "target_translation.en": { label: { en: "Target translation (EN)", ur: "\u06C1\u062F\u0641 \u062A\u0631\u062C\u0645\u06C1 (\u0627\u0646\u06AF\u0631\u06CC\u0632\u06CC)" }, inputKind: "text", required: true },
      "target_translation.ur": { label: { en: "Target translation (UR)", ur: "\u06C1\u062F\u0641 \u062A\u0631\u062C\u0645\u06C1 (\u0627\u0631\u062F\u0648)" }, inputKind: "text", required: false },
      tiles: { label: { en: "Word tiles", ur: "\u0644\u0641\u0638 \u0679\u0627\u0626\u0644\u0632" }, inputKind: "tiles", required: true },
      correct_order: { label: { en: "Correct order (indices)", ur: "\u062F\u0631\u0633\u062A \u062A\u0631\u062A\u06CC\u0628" }, inputKind: "number", required: true },
      "explanation_on_wrong.en": { label: { en: "Wrong explanation (EN)", ur: "\u063A\u0644\u0637\u06CC \u06A9\u06CC \u0648\u0636\u0627\u062D\u062A" }, inputKind: "text", required: false },
      "explanation_on_wrong.ur": { label: { en: "Wrong explanation (UR)", ur: "\u063A\u0644\u0637\u06CC \u06A9\u06CC \u0648\u0636\u0627\u062D\u062A" }, inputKind: "text", required: false }
    }
  },
  MATCHING: {
    type: "MATCHING",
    label: { en: "Matching", ur: "\u0645\u06CC\u0686\u0646\u06AF" },
    playerSupported: true,
    authoringScope: true,
    fields: {
      left_column: { label: { en: "Left column (Arabic words)", ur: "\u0628\u0627\u0626\u06CC\u06BA \u06A9\u0627\u0644\u0645 (\u0639\u0631\u0628\u06CC \u0627\u0644\u0641\u0627\u0638)" }, inputKind: "matching_pairs", required: true },
      right_column: { label: { en: "Right column (translations)", ur: "\u062F\u0627\u0626\u06CC\u06BA \u06A9\u0627\u0644\u0645 (\u062A\u0631\u062C\u0645\u06D2)" }, inputKind: "matching_pairs", required: true },
      correct_pairs: { label: { en: "Correct pairs", ur: "\u062F\u0631\u0633\u062A \u062C\u0648\u0691\u06D2" }, inputKind: "matching_pairs", required: true }
    }
  },
  // Remaining 10 — playerSupported but authoringScope: false in v1
  GRAMMAR_PARSE: {
    type: "GRAMMAR_PARSE",
    label: { en: "Grammar Parse", ur: "\u06AF\u0631\u0627\u0645\u0631 \u062A\u062C\u0632\u06CC\u06C1" },
    playerSupported: true,
    authoringScope: false,
    fields: {}
  },
  CONVERSATION_BUILDER: {
    type: "CONVERSATION_BUILDER",
    label: { en: "Conversation Builder", ur: "\u06AF\u0641\u062A\u06AF\u0648 \u0628\u0646\u0627\u0626\u06CC\u06BA" },
    playerSupported: true,
    authoringScope: false,
    fields: {}
  },
  SHADOW_REPEAT: {
    type: "SHADOW_REPEAT",
    label: { en: "Shadow Repeat", ur: "\u0634\u06CC\u0688\u0648 \u0631\u06CC\u067E\u06CC\u0679" },
    playerSupported: true,
    authoringScope: false,
    fields: {}
  },
  AUDIO_RECOGNITION: {
    type: "AUDIO_RECOGNITION",
    label: { en: "Audio Recognition", ur: "\u0622\u0688\u06CC\u0648 \u067E\u06C1\u0686\u0627\u0646" },
    playerSupported: true,
    authoringScope: false,
    fields: {}
  },
  WRITE_ARABIC: {
    type: "WRITE_ARABIC",
    label: { en: "Write Arabic", ur: "\u0639\u0631\u0628\u06CC \u0644\u06A9\u06BE\u06CC\u06BA" },
    playerSupported: true,
    authoringScope: false,
    fields: {}
  },
  HARAKAH_PLACEMENT: {
    type: "HARAKAH_PLACEMENT",
    label: { en: "Harakah Placement", ur: "\u062D\u0631\u06A9\u062A \u0644\u06AF\u0627\u0646\u0627" },
    playerSupported: true,
    authoringScope: false,
    fields: {}
  },
  WORD_ORDER: {
    type: "WORD_ORDER",
    label: { en: "Word Order", ur: "\u0644\u0641\u0638 \u06A9\u06CC \u062A\u0631\u062A\u06CC\u0628" },
    playerSupported: true,
    authoringScope: false,
    fields: {}
  },
  TRANSLATE_TO_ARABIC: {
    type: "TRANSLATE_TO_ARABIC",
    label: { en: "Translate to Arabic", ur: "\u0639\u0631\u0628\u06CC \u0645\u06CC\u06BA \u062A\u0631\u062C\u0645\u06C1" },
    playerSupported: true,
    authoringScope: false,
    fields: {}
  },
  IDENTIFY_ROOT: {
    type: "IDENTIFY_ROOT",
    label: { en: "Identify Root", ur: "\u0631\u064F\u0648\u0679 \u067E\u06C1\u0686\u0627\u0646\u06CC\u06BA" },
    playerSupported: true,
    authoringScope: false,
    fields: {}
  },
  MATCH_AYAH: {
    type: "MATCH_AYAH",
    label: { en: "Match Ayah", ur: "\u0622\u06CC\u062A \u0645\u06CC\u0686 \u06A9\u0631\u06CC\u06BA" },
    playerSupported: true,
    authoringScope: false,
    fields: {}
  }
};
export {
  ArabicTextSchema,
  AudioRecognitionExerciseSchema,
  AyahReferenceSchema,
  AyahWordTimingSchema,
  BuildSentenceExerciseSchema,
  CloseBeatSchema,
  ConversationBuilderExerciseSchema,
  DiscoverCardSchema,
  ExerciseSchema,
  FillBlankExerciseSchema,
  GrammarParseExerciseSchema,
  GrammaticalRoleSchema,
  HarakahPlacementExerciseSchema,
  HookBeatSchema,
  IdentifyRootExerciseSchema,
  LessonContentSchema,
  MatchAyahExerciseSchema,
  MatchingExerciseSchema,
  ShadowRepeatExerciseSchema,
  TapTranslationExerciseSchema,
  TranslateToArabicExerciseSchema,
  TrueFalseExerciseSchema,
  VocabRefSchema,
  WordOrderExerciseSchema,
  WriteArabicExerciseSchema,
  createExerciseId,
  createStarterCard,
  createStarterExercise,
  discoverCardFormConfig,
  exerciseFormConfig,
  isExercise,
  isReviewLesson,
  isSpokenPhrasesLesson,
  isStandardLesson,
  isVerbPatternLesson,
  parseLenient
};
