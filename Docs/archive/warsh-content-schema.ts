/**
 * Warsh Content Schema — TypeScript Types
 *
 * This is the single source of truth for the shape of lesson content
 * stored in the Prisma `Lesson` model's JSON fields:
 *   - hook
 *   - discover_cards
 *   - exercises
 *   - reveal
 *   - close
 *   - spoken_phrases
 *   - conjugation_table
 *
 * Aligns with:
 *   - File 04: Lesson System (15 exercise types, 4 templates)
 *   - File 12: Data Model & API (Prisma Lesson model)
 *
 * Usage:
 *   import type { LessonContent } from './warsh-content-schema';
 *   const lesson: LessonContent = require('./chapter-01-lesson-01.json');
 *
 * Version: 1.0
 * Last updated: 2026-05-21
 */

// ============================================================================
// TOP-LEVEL LESSON CONTENT
// ============================================================================

/**
 * The full content payload for a single lesson.
 * Maps 1:1 to the JSON fields on the Lesson model.
 */
export interface LessonContent {
  /** Schema version — bump on breaking changes */
  schema_version: '1.0';

  /** Template determines which fields are required */
  template: LessonTemplate;

  /** All templates use these */
  hook: HookBeat;
  close: CloseBeat;

  /** STANDARD, VERB_PATTERN, REVIEW use these */
  discover_cards?: DiscoverCard[];
  exercises?: Exercise[];
  reveal?: RevealBeat;

  /** SPOKEN_PHRASES only */
  spoken_phrases?: SpokenPhrasesBlock;

  /** VERB_PATTERN only */
  conjugation_table?: ConjugationTable;
}

export type LessonTemplate =
  | 'STANDARD'
  | 'SPOKEN_PHRASES'
  | 'REVIEW'
  | 'VERB_PATTERN';

// ============================================================================
// SHARED PRIMITIVES
// ============================================================================

/**
 * An Arabic word/phrase with all forms needed for display, audio, and search.
 * Used in discover cards, exercises, and reveals.
 */
export interface ArabicText {
  /** With harakat (vowels) — primary display form. e.g. "هَذَا" */
  ar: string;
  /** Without harakat — for search and root analysis. e.g. "هذا" */
  ar_plain: string;
  /** Latin transliteration. e.g. "hādhā" */
  translit: string;
  /** English translation. e.g. "this (m)" */
  en: string;
  /** Urdu translation. Optional but recommended. e.g. "یہ" */
  ur?: string;
}

/**
 * Reference to an ayah (Quranic verse) for Hook/Reveal beats.
 */
export interface AyahReference {
  /** Surah number, 1-114. e.g. 1 for Al-Fatiha */
  surah: number;
  /** Verse number within Surah. e.g. 1 */
  ayah: number;
  /** Display label. e.g. "Al-Fatiha 1:1" */
  label: string;
  /** Full Arabic text of the ayah with harakat */
  ar: string;
  /** English translation (e.g. Sahih International) */
  en: string;
  /** Urdu translation (optional) */
  ur?: string;
  /** R2 URL for recitation audio (Mishary Al-Afasy or similar) */
  audio_url?: string;
  /** Optional word-by-word timing for highlighting during playback */
  word_timings?: AyahWordTiming[];
}

export interface AyahWordTiming {
  /** Word index in the ayah, 0-based */
  index: number;
  /** Start time in milliseconds */
  start_ms: number;
  /** End time in milliseconds */
  end_ms: number;
}

/**
 * Reference to a vocabulary word in the VocabularyWord table.
 * Used to auto-link lesson content to the user's vocab bank.
 */
export interface VocabRef {
  /** Either the VocabularyWord.id (UUID) once seeded, or the ar_plain for lookup */
  word_id?: string;
  ar_plain: string;
}

// ============================================================================
// BEAT 1: HOOK
// ============================================================================

/**
 * Opening beat. Presents an ayah or Quranic phrase to set emotional context.
 * Per File 04 §2.1: "lasts 20–40 seconds, primarily passive listening".
 */
export interface HookBeat {
  /** The ayah the user hears at the start of the lesson */
  ayah: AyahReference;
  /** Optional Noor voice-over text shown beneath the ayah */
  noor_intro?: {
    en: string;
    ur?: string;
  };
  /** Should the audio auto-play? Default true for new lessons */
  autoplay?: boolean;
}

// ============================================================================
// BEAT 2: DISCOVER
// ============================================================================

/**
 * A single Discover card. Per File 04 §2.2:
 * Discover beat has 4–8 cards, each ~10–20 seconds.
 * Cards introduce vocabulary, concepts, or grammar rules.
 */
export interface DiscoverCard {
  /** Card type drives the visual layout */
  type: DiscoverCardType;
  /** Each card has the Arabic text it teaches (vocab cards) or a concept name (rule cards) */
  text?: ArabicText;
  /** Concept name for rule cards. e.g. "Noun + Adjective Order" */
  concept?: {
    en: string;
    ar?: string;
    ur?: string;
  };
  /** R2 URL for the illustration. Per File 11: parchment-tone, calligraphic */
  image_url?: string;
  /** R2 URL for word audio (TTS-generated per File 09) */
  audio_url?: string;
  /** Explanation text shown on the card */
  explanation?: {
    en: string;
    ur?: string;
  };
  /** Example sentences using this word/concept */
  examples?: ArabicText[];
  /** Link to the VocabularyWord row this card introduces (if any) */
  introduces_vocab?: VocabRef;
}

export type DiscoverCardType =
  /** Single word with image, audio, translation. Most common card type. */
  | 'WORD'
  /** A concept or grammar rule explained */
  | 'CONCEPT'
  /** An example sentence demonstrating a pattern */
  | 'EXAMPLE'
  /** A pair/contrast — e.g. masculine vs feminine of the same word */
  | 'CONTRAST'
  /** A Quranic citation showing the concept in context */
  | 'AYAH_PREVIEW';

// ============================================================================
// BEAT 3: PRACTICE — THE 15 EXERCISE TYPES
// ============================================================================

/**
 * Discriminated union of all 15 exercise types per File 04 §4.
 * The `type` field discriminates; each type has its own prompt/answer shape.
 */
export type Exercise =
  | TrueFalseExercise
  | TapTranslationExercise
  | FillBlankExercise
  | BuildSentenceExercise
  | MatchingExercise
  | GrammarParseExercise
  | ConversationBuilderExercise
  | ShadowRepeatExercise
  | AudioRecognitionExercise
  | WriteArabicExercise
  | HarakahPlacementExercise
  | WordOrderExercise
  | TranslateToArabicExercise
  | IdentifyRootExercise
  | MatchAyahExercise;

/** Fields every exercise has */
interface ExerciseBase {
  /** Stable ID for this exercise — used for retry queue and analytics */
  id: string;
  /** XP awarded for first-try correct. Default 1, 5 for REVIEW power-set */
  xp_value?: number;
  /** Optional Noor explanation shown if the user gets it wrong */
  explanation_on_wrong?: {
    en: string;
    ur?: string;
  };
}

// 4.1 TRUE_FALSE
export interface TrueFalseExercise extends ExerciseBase {
  type: 'TRUE_FALSE';
  statement: {
    en: string;
    ur?: string;
    /** Optional Arabic example referenced in the statement */
    ar_example?: ArabicText;
  };
  correct_answer: boolean;
}

// 4.2 TAP_TRANSLATION
export interface TapTranslationExercise extends ExerciseBase {
  type: 'TAP_TRANSLATION';
  prompt: ArabicText;
  /** Array of 4 options. Exactly one is correct. */
  options: Array<{
    en: string;
    ur?: string;
  }>;
  /** Index of the correct option (0-3) */
  correct_index: number;
  /** Optional audio of the prompt word */
  audio_url?: string;
}

// 4.3 FILL_BLANK
export interface FillBlankExercise extends ExerciseBase {
  type: 'FILL_BLANK';
  /** Tap mode or type mode per File 04 §4.3 */
  mode: 'TAP' | 'TYPE';
  /** Sentence with ___ where the blank is. e.g. "هَذَا ___ جَدِيد" */
  sentence_ar: string;
  /** Translation hint shown above the sentence */
  hint: {
    en: string;
    ur?: string;
  };
  /** For TAP mode: 4 options. For TYPE mode: omit. */
  options?: ArabicText[];
  /** Correct answer */
  correct_answer: ArabicText;
}

// 4.4 BUILD_SENTENCE
export interface BuildSentenceExercise extends ExerciseBase {
  type: 'BUILD_SENTENCE';
  /** What the user is trying to build, in their language */
  target_translation: {
    en: string;
    ur?: string;
  };
  /** Scrambled tiles. Order does not matter here. */
  tiles: ArabicText[];
  /** Tiles in their correct order, as array of tile indices */
  correct_order: number[];
}

// 4.5 MATCHING
export interface MatchingExercise extends ExerciseBase {
  type: 'MATCHING';
  /** Left column items (typically Arabic words) */
  left_column: ArabicText[];
  /** Right column items (typically translations) */
  right_column: Array<{
    en: string;
    ur?: string;
  }>;
  /** Correct pairings as [left_index, right_index] tuples */
  correct_pairs: Array<[number, number]>;
}

// 4.6 GRAMMAR_PARSE
export interface GrammarParseExercise extends ExerciseBase {
  type: 'GRAMMAR_PARSE';
  /** Full Arabic sentence to parse */
  sentence_ar: string;
  /** Word-by-word breakdown */
  words: ArabicText[];
  /** Allowed grammatical roles for this exercise */
  available_roles: GrammaticalRole[];
  /** For each word (by index), the correct role */
  correct_roles: GrammaticalRole[];
}

export type GrammaticalRole =
  | 'SUBJECT'
  | 'PREDICATE'
  | 'VERB'
  | 'OBJECT'
  | 'PARTICLE'
  | 'PREPOSITION'
  | 'POSSESSIVE'
  | 'ADJECTIVE'
  | 'DEMONSTRATIVE'
  | 'RELATIVE_PRONOUN';

// 4.7 CONVERSATION_BUILDER
export interface ConversationBuilderExercise extends ExerciseBase {
  type: 'CONVERSATION_BUILDER';
  /** The other side of the conversation, already shown */
  prompt_line: ArabicText;
  /** User's response: pick from options OR build from tiles */
  response_mode: 'PICK' | 'BUILD';
  /** For PICK mode */
  options?: ArabicText[];
  correct_option_index?: number;
  /** For BUILD mode */
  tiles?: ArabicText[];
  correct_order?: number[];
}

// 4.8 SHADOW_REPEAT
export interface ShadowRepeatExercise extends ExerciseBase {
  type: 'SHADOW_REPEAT';
  /** The Arabic phrase to repeat */
  phrase: ArabicText;
  /** Audio URL — reference recitation */
  audio_url: string;
  /** Per File 06: user records, app does NOT auto-grade. User self-marks done. */
  self_grading: true;
}

// 4.9 AUDIO_RECOGNITION
export interface AudioRecognitionExercise extends ExerciseBase {
  type: 'AUDIO_RECOGNITION';
  /** Audio URL the user listens to */
  audio_url: string;
  /** 4 written options the user picks from */
  options: ArabicText[];
  correct_index: number;
}

// 4.10 WRITE_ARABIC
export interface WriteArabicExercise extends ExerciseBase {
  type: 'WRITE_ARABIC';
  /** Prompt in user's language */
  prompt: {
    en: string;
    ur?: string;
  };
  /** Audio of the target word (optional) */
  audio_url?: string;
  /** Correct answer — normalized matching (ignores harakat) per File 04 §4.10 */
  correct_answer: ArabicText;
  /** Per File 04 §4.10: has a hint button revealing first letter */
  hint_available: boolean;
}

// 4.11 HARAKAH_PLACEMENT
export interface HarakahPlacementExercise extends ExerciseBase {
  type: 'HARAKAH_PLACEMENT';
  /** Arabic word WITHOUT harakat */
  word_unvowelled: string;
  /** Correct fully-vowelled form */
  correct_vowelled: string;
  /** Translation hint */
  hint: {
    en: string;
    ur?: string;
  };
}

// 4.12 WORD_ORDER
export interface WordOrderExercise extends ExerciseBase {
  type: 'WORD_ORDER';
  /** Like BUILD_SENTENCE but emphasizes ordering, not vocabulary recall */
  tiles: ArabicText[];
  correct_order: number[];
  context: {
    en: string;
    ur?: string;
  };
}

// 4.13 TRANSLATE_TO_ARABIC
export interface TranslateToArabicExercise extends ExerciseBase {
  type: 'TRANSLATE_TO_ARABIC';
  /** English/Urdu sentence to translate */
  source: {
    en: string;
    ur?: string;
  };
  /** Multiple acceptable answers (different word orders, synonyms) */
  acceptable_answers: ArabicText[];
}

// 4.14 IDENTIFY_ROOT
export interface IdentifyRootExercise extends ExerciseBase {
  type: 'IDENTIFY_ROOT';
  /** The Arabic word the user is finding the root of */
  word: ArabicText;
  /** 4 options as 3-letter root strings. e.g. "ك ت ب" */
  options: string[];
  correct_index: number;
}

// 4.15 MATCH_AYAH
export interface MatchAyahExercise extends ExerciseBase {
  type: 'MATCH_AYAH';
  /** A short Quranic phrase the user matches to its translation */
  ayah_fragment: {
    ar: string;
    surah_ref: string;
  };
  options: Array<{
    en: string;
    ur?: string;
  }>;
  correct_index: number;
}

// ============================================================================
// BEAT 4: REVEAL
// ============================================================================

/**
 * The "aha" moment. Per File 04 §2.4:
 * Shows the learned concept inside a real ayah, with the relevant words highlighted.
 */
export interface RevealBeat {
  /** Name of the concept this lesson taught */
  concept_name: {
    en: string;
    ar?: string;
    ur?: string;
  };
  /** The Quranic ayah that demonstrates the concept */
  ayah: AyahReference;
  /** Word indices within the ayah to highlight in Gold */
  highlighted_word_indices: number[];
  /** Noor's explanation text — appears below the ayah */
  noor_explanation: {
    en: string;
    ur?: string;
  };
}

// ============================================================================
// BEAT 5: CLOSE
// ============================================================================

/**
 * Lesson conclusion. Per File 04 §2.5:
 * Short Noor message, XP earned, transition.
 */
export interface CloseBeat {
  /**
   * Either a template ID (server picks from a pool — varies the close message)
   * OR a hardcoded message specific to this lesson.
   */
  noor_message_template?: string;
  noor_message?: {
    en: string;
    ur?: string;
  };
}

// ============================================================================
// SPOKEN_PHRASES TEMPLATE — Per File 06
// ============================================================================

export interface SpokenPhrasesBlock {
  /** The scene/scenario. e.g. "Greeting a brother at the masjid" */
  scene: {
    en: string;
    ur?: string;
  };
  /** ~10 phrases the user shadow-repeats */
  phrases: SpokenPhrase[];
  /** Optional dialogue script the phrases assemble into */
  dialogue?: DialogueLine[];
}

export interface SpokenPhrase {
  id: string;
  phrase: ArabicText;
  audio_url: string;
  /** Brief usage note */
  context?: {
    en: string;
    ur?: string;
  };
}

export interface DialogueLine {
  speaker: 'A' | 'B';
  phrase_id: string; // references SpokenPhrase.id
}

// ============================================================================
// VERB_PATTERN TEMPLATE — Per File 04 §3.3
// ============================================================================

export interface ConjugationTable {
  /** The root verb (3 letters) */
  root: string;
  /** The pattern this lesson teaches. e.g. "Past tense, masculine" */
  pattern_name: {
    en: string;
    ar?: string;
    ur?: string;
  };
  /** The full conjugation table */
  rows: ConjugationRow[];
}

export interface ConjugationRow {
  /** Pronoun the row corresponds to. e.g. "هُوَ", "أَنْتَ" */
  pronoun: ArabicText;
  /** Conjugated verb form */
  conjugated: ArabicText;
  /** Optional audio */
  audio_url?: string;
}

// ============================================================================
// TYPE GUARDS — Useful for the app's lesson player
// ============================================================================

export function isStandardLesson(lesson: LessonContent): boolean {
  return lesson.template === 'STANDARD';
}

export function isSpokenPhrasesLesson(lesson: LessonContent): boolean {
  return lesson.template === 'SPOKEN_PHRASES';
}

export function isVerbPatternLesson(lesson: LessonContent): boolean {
  return lesson.template === 'VERB_PATTERN';
}

export function isReviewLesson(lesson: LessonContent): boolean {
  return lesson.template === 'REVIEW';
}
