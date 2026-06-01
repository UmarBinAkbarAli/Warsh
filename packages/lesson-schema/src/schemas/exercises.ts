import { z } from "zod";
import { ArabicTextSchema } from "./primitives";

// ============================================================================
// EXERCISES — 15 types (discriminated union)
// ============================================================================

const ExerciseBaseSchema = z.object({
  id: z.string().min(1),
  xp_value: z.number().int().min(0).optional(),
  explanation_on_wrong: z.object({ en: z.string().min(1), ur: z.string().optional() }).optional(),
});

// 1. TRUE_FALSE
export const TrueFalseExerciseSchema = ExerciseBaseSchema.extend({
  type: z.literal("TRUE_FALSE"),
  statement: z.object({
    en: z.string().min(1),
    ur: z.string().optional(),
    ar_example: ArabicTextSchema.optional(),
  }),
  correct_answer: z.boolean(),
});

// 2. TAP_TRANSLATION
export const TapTranslationExerciseSchema = ExerciseBaseSchema.extend({
  type: z.literal("TAP_TRANSLATION"),
  prompt: ArabicTextSchema,
  options: z.array(z.object({ en: z.string().min(1), ur: z.string().optional() })).length(4),
  correct_index: z.number().int().min(0).max(3),
  audio_url: z.string().optional(),
});

// 3. FILL_BLANK
export const FillBlankExerciseSchema = ExerciseBaseSchema.extend({
  type: z.literal("FILL_BLANK"),
  mode: z.enum(["TAP", "TYPE"]),
  sentence_ar: z.string(),
  hint: z.object({ en: z.string().min(1), ur: z.string().optional() }),
  options: z.array(ArabicTextSchema).length(4).optional(),
  correct_answer: ArabicTextSchema,
});

// 4. BUILD_SENTENCE
export const BuildSentenceExerciseSchema = ExerciseBaseSchema.extend({
  type: z.literal("BUILD_SENTENCE"),
  target_translation: z.object({ en: z.string().min(1), ur: z.string().optional() }),
  tiles: z.array(ArabicTextSchema).min(2),
  correct_order: z.array(z.number().int().min(0)).min(1),
});

// 5. MATCHING
export const MatchingExerciseSchema = ExerciseBaseSchema.extend({
  type: z.literal("MATCHING"),
  left_column: z.array(ArabicTextSchema).min(2),
  right_column: z.array(z.object({ en: z.string().min(1), ur: z.string().optional() })).min(2),
  correct_pairs: z.array(z.tuple([z.number().int(), z.number().int()])).min(2),
});

// 6. GRAMMAR_PARSE
export const GrammaticalRoleSchema = z.enum([
  "SUBJECT", "PREDICATE", "VERB", "OBJECT", "PARTICLE",
  "PREPOSITION", "POSSESSIVE", "ADJECTIVE", "DEMONSTRATIVE",
  "RELATIVE_PRONOUN",
  // extended roles from validate-curriculum.cjs
  "PRONOUN", "LITERARY_DEVICE", "CONJUNCTION", "INTERJECTION",
  "VERB_PHRASE", "NOUN", "VOCATIVE", "TIME_ZARF", "PLACE_ZARF",
]);
export type GrammaticalRole = z.infer<typeof GrammaticalRoleSchema>;

export const GrammarParseExerciseSchema = ExerciseBaseSchema.extend({
  type: z.literal("GRAMMAR_PARSE"),
  sentence_ar: z.string(),
  words: z.array(ArabicTextSchema).min(1),
  available_roles: z.array(GrammaticalRoleSchema).min(1),
  correct_roles: z.array(GrammaticalRoleSchema).min(1),
});

// 7. CONVERSATION_BUILDER
export const ConversationBuilderExerciseSchema = ExerciseBaseSchema.extend({
  type: z.literal("CONVERSATION_BUILDER"),
  prompt_line: ArabicTextSchema,
  response_mode: z.enum(["PICK", "BUILD"]),
  options: z.array(ArabicTextSchema).optional(),
  correct_option_index: z.number().int().min(0).optional(),
  tiles: z.array(ArabicTextSchema).optional(),
  correct_order: z.array(z.number().int().min(0)).optional(),
});

// 8. SHADOW_REPEAT
export const ShadowRepeatExerciseSchema = ExerciseBaseSchema.extend({
  type: z.literal("SHADOW_REPEAT"),
  phrase: ArabicTextSchema,
  audio_url: z.string(),
  self_grading: z.literal(true),
});

// 9. AUDIO_RECOGNITION
export const AudioRecognitionExerciseSchema = ExerciseBaseSchema.extend({
  type: z.literal("AUDIO_RECOGNITION"),
  audio_url: z.string(),
  options: z.array(ArabicTextSchema).length(4),
  correct_index: z.number().int().min(0).max(3),
});

// 10. WRITE_ARABIC
export const WriteArabicExerciseSchema = ExerciseBaseSchema.extend({
  type: z.literal("WRITE_ARABIC"),
  prompt: z.object({ en: z.string().min(1), ur: z.string().optional() }),
  audio_url: z.string().optional(),
  correct_answer: ArabicTextSchema,
  hint_available: z.boolean(),
});

// 11. HARAKAH_PLACEMENT
export const HarakahPlacementExerciseSchema = ExerciseBaseSchema.extend({
  type: z.literal("HARAKAH_PLACEMENT"),
  word_unvowelled: z.string(),
  correct_vowelled: z.string(),
  hint: z.object({ en: z.string().min(1), ur: z.string().optional() }),
});

// 12. WORD_ORDER
export const WordOrderExerciseSchema = ExerciseBaseSchema.extend({
  type: z.literal("WORD_ORDER"),
  tiles: z.array(ArabicTextSchema).min(2),
  correct_order: z.array(z.number().int().min(0)).min(1),
  context: z.object({ en: z.string().min(1), ur: z.string().optional() }),
});

// 13. TRANSLATE_TO_ARABIC
export const TranslateToArabicExerciseSchema = ExerciseBaseSchema.extend({
  type: z.literal("TRANSLATE_TO_ARABIC"),
  source: z.object({ en: z.string().min(1), ur: z.string().optional() }),
  acceptable_answers: z.array(ArabicTextSchema).min(1),
});

// 14. IDENTIFY_ROOT
export const IdentifyRootExerciseSchema = ExerciseBaseSchema.extend({
  type: z.literal("IDENTIFY_ROOT"),
  word: ArabicTextSchema,
  options: z.array(z.string()).length(4),
  correct_index: z.number().int().min(0).max(3),
});

// 15. MATCH_AYAH
export const MatchAyahExerciseSchema = ExerciseBaseSchema.extend({
  type: z.literal("MATCH_AYAH"),
  ayah_fragment: z.object({ ar: z.string().min(1), surah_ref: z.string() }),
  options: z.array(z.object({ en: z.string().min(1), ur: z.string().optional() })).length(4),
  correct_index: z.number().int().min(0).max(3),
});

// Full Exercise discriminated union
export const ExerciseSchema = z.discriminatedUnion("type", [
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
  MatchAyahExerciseSchema,
]);

export type Exercise = z.infer<typeof ExerciseSchema>;
export type ExerciseType = Exercise["type"];

export function isExercise(value: unknown): value is Exercise {
  return ExerciseSchema.safeParse(value).success;
}
