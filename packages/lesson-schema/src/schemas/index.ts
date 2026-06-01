// Re-export all Zod schemas and inferred types
// Schemas are the source of truth; types are inferred via z.infer

// Primitives — schemas only
export {
  ArabicTextSchema,
  type ArabicText,
  AyahWordTimingSchema,
  AyahReferenceSchema,
  VocabRefSchema,
  HookBeatSchema,
  CloseBeatSchema,
} from "./primitives";

// Discover cards
export {
  DiscoverCardSchema,
  type DiscoverCard,
  type DiscoverCardType,
} from "./discover-cards";

// Exercises — all 15 schemas + GrammaticalRole
export {
  ExerciseSchema,
  type Exercise,
  type ExerciseType,
  GrammaticalRoleSchema,
  type GrammaticalRole,
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
} from "./exercises";

// Lesson content — top-level schema + inferred types + backward-compat types
export {
  LessonContentSchema,
  type LessonContent,
  type LessonTemplate,
  type SpokenPhrase,
  type ConjugationRow,
  type SpokenPhrasesBlock,
  type ConjugationTable,
  type AyahWordTiming,
  type AyahReference,
  type VocabRef,
  type HookBeat,
  type CloseBeat,
  isStandardLesson,
  isSpokenPhrasesLesson,
  isVerbPatternLesson,
  isReviewLesson,
  parseLenient,
} from "./lesson";
