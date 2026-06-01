import { z } from "zod";
import { HookBeatSchema, CloseBeatSchema } from "./primitives";
import { DiscoverCardSchema } from "./discover-cards";
import { ExerciseSchema } from "./exercises";

// ============================================================================
// LESSON CONTENT — top-level schema
// ============================================================================

export const LessonContentSchema = z.object({
  schema_version: z.literal("1.0"),
  template: z.enum(["STANDARD", "SPOKEN_PHRASES", "REVIEW", "VERB_PATTERN"]),
  hook: HookBeatSchema,
  close: CloseBeatSchema,
  discover_cards: z.array(DiscoverCardSchema).optional(),
  exercises: z.array(ExerciseSchema).optional(),
  reveal: z
    .object({
      concept_name: z.object({ en: z.string().min(1), ar: z.string().optional(), ur: z.string().optional() }),
      ayah: z.object({
        surah: z.number().int().min(1).max(114),
        ayah: z.number().int().min(1),
        label: z.string().min(1),
        ar: z.string().min(1),
        en: z.string().min(1),
        ur: z.string().optional(),
        audio_url: z.string().optional(),
      }),
      highlighted_word_indices: z.array(z.number().int().min(0)),
      noor_explanation: z.object({ en: z.string().min(1), ur: z.string().optional() }),
    })
    .optional(),
  spoken_phrases: z
    .object({
      scene: z.object({ en: z.string().min(1), ur: z.string().optional() }),
      phrases: z
        .array(
          z.object({
            id: z.string().min(1),
            phrase: z.object({ ar: z.string().min(1), ar_plain: z.string().min(1), translit: z.string().min(1), en: z.string().min(1), ur: z.string().optional() }),
            audio_url: z.string(),
            context: z.object({ en: z.string().min(1), ur: z.string().optional() }).optional(),
          }),
        )
        .min(4),
      dialogue: z
        .array(
          z.object({
            speaker: z.enum(["A", "B"]),
            phrase_id: z.string(),
          }),
        )
        .optional(),
    })
    .optional(),
  conjugation_table: z
    .object({
      root: z.string(),
      pattern_name: z.object({ en: z.string().min(1), ar: z.string().optional(), ur: z.string().optional() }),
      rows: z
        .array(
          z.object({
            pronoun: z.object({ ar: z.string().min(1), ar_plain: z.string().min(1), translit: z.string().min(1), en: z.string().min(1), ur: z.string().optional() }),
            conjugated: z.object({ ar: z.string().min(1), ar_plain: z.string().min(1), translit: z.string().min(1), en: z.string().min(1), ur: z.string().optional() }),
            audio_url: z.string().optional(),
          }),
        )
        .min(1),
    })
    .optional(),
});

// Explicit type aliases for CJS re-exports (Backward compatibility)
export type AyahWordTiming = { index: number; start_ms: number; end_ms: number };
export type AyahReference = {
  surah: number;
  ayah: number;
  label: string;
  ar: string;
  en: string;
  ur?: string;
  audio_url?: string;
  word_timings?: AyahWordTiming[];
};
export type VocabRef = { word_id?: string; ar_plain: string };
export type HookBeat = {
  ayah: AyahReference;
  noor_intro?: { en: string; ur?: string };
  autoplay?: boolean;
};
export type CloseBeat = {
  noor_message_template?: string;
  noor_message?: { en: string; ur?: string };
};
export type SpokenPhrase = {
  id: string;
  phrase: { ar: string; ar_plain: string; translit: string; en: string; ur?: string };
  audio_url: string;
  context?: { en: string; ur?: string };
};
export type SpokenPhrasesBlock = {
  scene: { en: string; ur?: string };
  phrases: SpokenPhrase[];
  dialogue?: { speaker: "A" | "B"; phrase_id: string }[];
};
export type ConjugationRow = {
  pronoun: { ar: string; ar_plain: string; translit: string; en: string; ur?: string };
  conjugated: { ar: string; ar_plain: string; translit: string; en: string; ur?: string };
  audio_url?: string;
};
export type ConjugationTable = {
  root: string;
  pattern_name: { en: string; ar?: string; ur?: string };
  rows: ConjugationRow[];
};

export type LessonContent = z.infer<typeof LessonContentSchema>;
export type LessonTemplate = LessonContent["template"];

// Type guards
export function isStandardLesson(v: LessonContent): boolean {
  return v.template === "STANDARD";
}
export function isSpokenPhrasesLesson(v: LessonContent): boolean {
  return v.template === "SPOKEN_PHRASES";
}
export function isVerbPatternLesson(v: LessonContent): boolean {
  return v.template === "VERB_PATTERN";
}
export function isReviewLesson(v: LessonContent): boolean {
  return v.template === "REVIEW";
}

/**
 * Lenient parse — used when opening a lesson for editing.
 * Wraps the schema in a try/catch and also handles completely malformed JSON.
 */
export function parseLenient(json: unknown): LessonContent | null {
  if (typeof json !== "object" || json === null) return null;
  const result = LessonContentSchema.safeParse(json);
  if (result.success) return result.data;
  return null;
}
