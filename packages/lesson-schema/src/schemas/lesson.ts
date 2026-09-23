import { z } from "zod";
import { HookBeatSchema, CloseBeatSchema } from "./primitives";
import { DiscoverCardSchema } from "./discover-cards";
import { ExerciseSchema } from "./exercises";

const LocalizedAssessmentTextSchema = z.object({
  en: z.string().min(1),
  ur: z.string().min(1),
});

const ChapterTestQuestionSchema = z.object({
  id: z.string().min(1),
  topic: LocalizedAssessmentTextSchema,
  prompt: LocalizedAssessmentTextSchema,
  arabic: z.string().min(1).optional(),
  options: z.array(LocalizedAssessmentTextSchema.extend({ arabic: z.string().min(1).optional() })).min(2).max(6),
  correct_index: z.number().int().min(0),
});

// ============================================================================
// CONVERSATION LAB — optional block inside spoken_phrases
// ============================================================================

const LocalizedSchema = z.object({ en: z.string().min(1), ur: z.string().optional() });

const LabArabicSchema = z.object({
  ar: z.string().min(1),
  ar_plain: z.string().min(1),
  translit: z.string().min(1),
  en: z.string().min(1),
  ur: z.string().optional(),
});

// One learner turn in the final mission. The friend's line is a phrase from the
// lesson; the learner answers by picking a reply or ordering tiles. Mission
// turns are practice with retry, never part of the lesson score.
const LabMissionTurnSchema = z
  .object({
    prompt_phrase_id: z.string().min(1),
    goal_index: z.number().int().min(0),
    cue: LocalizedSchema.optional(),
    response_mode: z.enum(["PICK", "BUILD"]),
    options: z.array(LabArabicSchema).min(2).max(4).optional(),
    correct_option_index: z.number().int().min(0).optional(),
    tiles: z.array(LabArabicSchema).min(2).max(6).optional(),
    correct_order: z.array(z.number().int().min(0)).min(1).optional(),
  })
  .superRefine((turn, ctx) => {
    if (turn.response_mode === "PICK") {
      if (!turn.options || turn.correct_option_index === undefined || turn.correct_option_index >= turn.options.length) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: "PICK turns need options and a valid correct_option_index" });
      }
    } else if (!turn.tiles || !turn.correct_order || turn.correct_order.some((index) => index >= turn.tiles!.length)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "BUILD turns need tiles and a correct_order that points into them" });
    }
  });

// "Answer it" — a spoken conversation. The friend asks a lesson phrase; the
// learner answers out loud and the device's speech recogniser turns it into
// text. Checking is word level only: every WORD slot must be heard, an OPEN
// slot (a name) takes any word. Never harakat or pronunciation, never scored.
const AnswerSlotSchema = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("WORD"),
    ar: z.string().min(1),
    // Other spellings the recogniser may return for this word.
    accept: z.array(z.string().min(1)).max(6).optional(),
  }),
  z.object({ kind: z.literal("OPEN"), label: LocalizedSchema }),
]);

const AnswerItTurnSchema = z.object({
  prompt_phrase_id: z.string().min(1),
  // Stands in for the picture until the owner supplies one ("It is your father.").
  cue: LocalizedSchema.optional(),
  slots: z.array(AnswerSlotSchema).min(1).max(6),
  // What "Show answer" reveals. A taught phrase supplies text and audio; a
  // turn with an OPEN slot writes its own model ("اسْمِي …").
  model_phrase_id: z.string().min(1).optional(),
  model: z.object({ ar: z.string().min(1), en: z.string().min(1), ur: z.string().optional() }).optional(),
  tip: LocalizedSchema.optional(),
}).refine((turn) => turn.model_phrase_id || turn.model, { message: "an Answer it turn needs model_phrase_id or model" });

export const ConversationLabSchema = z.object({
  title: LocalizedSchema,
  mission: LocalizedSchema,
  toolkit: z.array(z.string().min(1)).max(8).optional(),
  goals: z.array(LocalizedSchema).min(1).max(4),
  // "Notice the pattern" — shown once, straight after the named phrase card.
  pattern: z
    .object({
      after_phrase_id: z.string().min(1),
      items: z.array(z.object({ ar: z.string().min(1), meaning: LocalizedSchema, source: LocalizedSchema })).min(2).max(3),
      note: LocalizedSchema,
    })
    .optional(),
  shadow_phrase_ids: z.array(z.string().min(1)).min(1).max(5),
  mission_turns: z.array(LabMissionTurnSchema).min(1).max(6),
  answer_it: z.object({ turns: z.array(AnswerItTurnSchema).min(1).max(5) }).optional(),
  can_do: z
    .array(z.object({ kind: z.enum(["SAY", "UNDERSTAND"]), label: LocalizedSchema, ar: z.string().min(1) }))
    .min(1)
    .max(4),
});

function lessonAnswerText(value: { ar: string }) {
  return value.ar.normalize("NFC").trim();
}

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
  assessment: z
    .object({
      type: z.literal("CHAPTER_TEST"),
      chapter_order: z.number().int().min(1),
      pass_score_percent: z.number().int().min(1).max(100),
      questions: z.array(ChapterTestQuestionSchema).min(1).max(50),
    })
    .superRefine((assessment, ctx) => {
      const ids = new Set<string>();
      assessment.questions.forEach((question, index) => {
        if (question.correct_index >= question.options.length) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["questions", index, "correct_index"],
            message: "correct_index must point to an available option",
          });
        }
        if (ids.has(question.id)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["questions", index, "id"],
            message: "chapter-test question IDs must be unique",
          });
        }
        ids.add(question.id);
      });
    })
    .optional(),
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
      // Normalized Arabic tokens expected at highlighted_word_indices.
      // New/corrected lessons should provide this so semantic validation can
      // detect a valid-but-wrong position, not only an out-of-range position.
      highlighted_words: z.array(z.string().min(1)).optional(),
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
            // Recognition only: the learner hears and understands it but is
            // never asked to produce it (a form the host chapter has not taught).
            heard_only: z.boolean().optional(),
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
      lab: ConversationLabSchema.optional(),
    })
    .superRefine((block, ctx) => {
      const lab = block.lab;
      if (!lab) return;
      const phraseById = new Map(block.phrases.map((phrase) => [phrase.id, phrase]));
      const heardOnly = new Set(
        block.phrases.filter((phrase) => phrase.heard_only).map((phrase) => lessonAnswerText(phrase.phrase)),
      );
      const issue = (path: (string | number)[], message: string) =>
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["lab", ...path], message });

      if (!block.dialogue || block.dialogue.length < 2) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["dialogue"], message: "a Conversation Lab needs a dialogue of at least two lines" });
      }
      block.dialogue?.forEach((line, index) => {
        const phrase = phraseById.get(line.phrase_id);
        if (!phrase) {
          ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["dialogue", index, "phrase_id"], message: "dialogue phrase_id must name a phrase" });
        } else if (line.speaker === "B" && phrase.heard_only) {
          // Speaker B is the learner; they must never be modelled saying a heard-only form.
          ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["dialogue", index, "phrase_id"], message: "the learner (speaker B) cannot say a heard_only phrase" });
        }
      });
      if (lab.pattern && !phraseById.has(lab.pattern.after_phrase_id)) {
        issue(["pattern", "after_phrase_id"], "after_phrase_id must name a phrase");
      }
      lab.shadow_phrase_ids.forEach((id, index) => {
        const phrase = phraseById.get(id);
        if (!phrase) issue(["shadow_phrase_ids", index], "shadow phrase must name a phrase");
        else if (phrase.heard_only) issue(["shadow_phrase_ids", index], "a heard_only phrase cannot be a speaking target");
      });
      lab.mission_turns.forEach((turn, index) => {
        if (!phraseById.has(turn.prompt_phrase_id)) issue(["mission_turns", index, "prompt_phrase_id"], "prompt_phrase_id must name a phrase");
        if (turn.goal_index >= lab.goals.length) issue(["mission_turns", index, "goal_index"], "goal_index must point at a goal");
        const answer = turn.response_mode === "PICK"
          ? turn.options?.[turn.correct_option_index ?? -1]?.ar
          : turn.correct_order?.map((tileIndex) => turn.tiles?.[tileIndex]?.ar ?? "").join(" ");
        if (answer && heardOnly.has(answer.normalize("NFC").trim())) {
          issue(["mission_turns", index], "a mission answer cannot be a heard_only phrase");
        }
      });
      lab.answer_it?.turns.forEach((turn, index) => {
        if (!phraseById.has(turn.prompt_phrase_id)) issue(["answer_it", "turns", index, "prompt_phrase_id"], "prompt_phrase_id must name a phrase");
        if (turn.model_phrase_id) {
          const model = phraseById.get(turn.model_phrase_id);
          if (!model) issue(["answer_it", "turns", index, "model_phrase_id"], "model_phrase_id must name a phrase");
          else if (model.heard_only) issue(["answer_it", "turns", index, "model_phrase_id"], "the learner cannot be asked to say a heard_only phrase");
        }
        if (!turn.slots.some((slot) => slot.kind === "WORD")) {
          issue(["answer_it", "turns", index, "slots"], "an Answer it turn needs at least one WORD slot to check");
        }
      });
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
}).superRefine((content, ctx) => {
  // In a Conversation Lab the scored practice may play a heard-only line as the
  // prompt, but it must never make one the answer the learner is marked on.
  const block = content.spoken_phrases;
  if (!block?.lab || !content.exercises) return;
  const heardOnly = new Set(
    block.phrases.filter((phrase) => phrase.heard_only).map((phrase) => lessonAnswerText(phrase.phrase)),
  );
  content.exercises.forEach((exercise, index) => {
    let answer: string | undefined;
    if (exercise.type === "CONVERSATION_BUILDER") {
      answer = exercise.response_mode === "PICK"
        ? exercise.options?.[exercise.correct_option_index ?? -1]?.ar
        : exercise.correct_order?.map((tileIndex) => exercise.tiles?.[tileIndex]?.ar ?? "").join(" ");
    } else if (exercise.type === "BUILD_SENTENCE" || exercise.type === "WORD_ORDER") {
      answer = exercise.correct_order.map((tileIndex) => exercise.tiles[tileIndex]?.ar ?? "").join(" ");
    } else if (exercise.type === "FILL_BLANK") {
      answer = exercise.correct_answer.ar;
    } else if (exercise.type === "SHADOW_REPEAT") {
      answer = exercise.phrase.ar;
    }
    if (answer && heardOnly.has(answer.normalize("NFC").trim())) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["exercises", index],
        message: "a Conversation Lab exercise cannot score a heard_only phrase as the answer",
      });
    }
  });
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
  heard_only?: boolean;
};
export type ConversationLab = z.infer<typeof ConversationLabSchema>;
export type SpokenPhrasesBlock = {
  scene: { en: string; ur?: string };
  phrases: SpokenPhrase[];
  dialogue?: { speaker: "A" | "B"; phrase_id: string }[];
  lab?: ConversationLab;
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
