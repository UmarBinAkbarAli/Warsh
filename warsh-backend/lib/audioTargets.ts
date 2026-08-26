/**
 * Which Arabic strings inside a lesson need catalogue audio.
 *
 * Runtime audio routes are lookup-only: a clip either exists in R2 under its
 * sha256 key or it 404s, with no generation fallback. That makes "what should
 * exist" a real contract, so it lives here once and is imported by both sides:
 *
 *   - scripts/prebuild-audio-catalog.ts — generates the clips
 *   - app/api/admin/content-health      — reports the ones still missing
 *
 * If these two ever disagreed, the dashboard would either hide missing audio or
 * cry wolf about clips the generator never intended to make.
 */
import { catalogAudioKey, normalizeCatalogAudioText } from "./audioCatalog";

/* eslint-disable @typescript-eslint/no-explicit-any */
type AnyRecord = Record<string, any>;

/** The single Arabic string a discover card plays, if any. */
export function discoverCardAudioText(card: AnyRecord): string | undefined {
  if (card.type === "GRAMMAR_NOTE") return card.title?.ar;
  if (card.type === "SENTENCE") return card.text?.ar;
  return card.text?.ar ?? card.concept?.ar ?? card.examples?.[0]?.ar;
}

/** The single Arabic string an exercise plays, if any. */
export function exerciseAudioText(exercise: AnyRecord): string | undefined {
  switch (exercise.type) {
    case "TAP_TRANSLATION":
      // en_to_ar prompts are shown in English, so there is nothing to recite.
      return exercise.direction === "en_to_ar" ? undefined : exercise.prompt?.ar;
    case "TRUE_FALSE": return exercise.statement?.ar_example?.ar;
    case "FILL_BLANK": return exercise.sentence_ar;
    case "SHADOW_REPEAT": return exercise.phrase?.ar;
    case "HARAKAH_PLACEMENT": return exercise.word_unvowelled;
    case "IDENTIFY_ROOT": return exercise.word?.ar;
    // Quran fragments require exact human recitation, never synthesized audio.
    case "MATCH_AYAH": return undefined;
    default: return undefined;
  }
}

export type LessonAudioTarget = {
  /** Normalized text the clip recites. */
  text: string;
  /** R2 object key derived from that text. */
  key: string;
  /** Where in the lesson it came from, e.g. "discover:3". */
  source: string;
};

/**
 * Every catalogue clip a lesson's content depends on.
 *
 * Blocks carrying an explicit `audio_url` are skipped — they point at human
 * recitation or a pre-existing recording rather than the generated catalogue.
 */
export function lessonAudioTargets(content: unknown): LessonAudioTarget[] {
  const lesson = (content ?? {}) as AnyRecord;
  const targets: LessonAudioTarget[] = [];
  const seen = new Set<string>();

  const add = (text: unknown, source: string) => {
    if (typeof text !== "string") return;
    const normalized = normalizeCatalogAudioText(text);
    if (!normalized) return;
    const key = catalogAudioKey(normalized);
    if (seen.has(key)) return;
    seen.add(key);
    targets.push({ text: normalized, key, source });
  };

  const cards = Array.isArray(lesson.discover_cards) ? lesson.discover_cards : [];
  for (const [index, card] of cards.entries()) {
    if (card && !card.audio_url) add(discoverCardAudioText(card), `discover:${index}`);
  }

  const exercises = Array.isArray(lesson.exercises) ? lesson.exercises : [];
  for (const [index, exercise] of exercises.entries()) {
    if (exercise && !exercise.audio_url) add(exerciseAudioText(exercise), `exercise:${index}`);
  }

  return targets;
}
