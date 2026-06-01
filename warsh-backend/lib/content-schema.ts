/**
 * Warsh Content Schema — TypeScript Types
 *
 * This file re-exports types from @warsh/lesson-schema.
 * The canonical Zod schemas live in packages/lesson-schema/src/schemas/.
 * Types are inferred via z.infer — never hand-maintained here.
 *
 * Version: 2.0 — re-exported from @warsh/lesson-schema
 * Last updated: 2026-06-01
 */

// Core content types
export type {
  ArabicText,
  DiscoverCard,
  DiscoverCardType,
  Exercise,
  ExerciseType,
  LessonContent,
  LessonTemplate,
  GrammaticalRole,
} from "@warsh/lesson-schema";

// Zod schemas for validation
export {
  LessonContentSchema,
  ArabicTextSchema,
  AyahReferenceSchema,
  AyahWordTimingSchema,
  VocabRefSchema,
  HookBeatSchema,
  CloseBeatSchema,
  DiscoverCardSchema,
  ExerciseSchema,
  GrammaticalRoleSchema,
  // Individual exercise schemas (all 15)
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
  isExercise,
} from "@warsh/lesson-schema";

// Helpers
export {
  isStandardLesson,
  isSpokenPhrasesLesson,
  isVerbPatternLesson,
  isReviewLesson,
  parseLenient,
  // Factories (for lesson builder)
  createStarterCard,
  createStarterExercise,
  // Form config (for UI rendering)
  discoverCardFormConfig,
  exerciseFormConfig,
} from "@warsh/lesson-schema";

// Additional types for backward compatibility
export type {
  AyahWordTiming,
  AyahReference,
  VocabRef,
  HookBeat,
  CloseBeat,
  SpokenPhrase,
  SpokenPhrasesBlock,
  ConjugationTable,
  ConjugationRow,
} from "@warsh/lesson-schema";
