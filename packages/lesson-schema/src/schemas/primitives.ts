import { z } from "zod";

// ============================================================================
// SHARED PRIMITIVES
// ============================================================================

export const ArabicTextSchema = z.object({
  ar: z.string().min(1),
  ar_plain: z.string().min(1),
  translit: z.string().min(1),
  en: z.string().min(1),
  ur: z.string().optional(),
});

export type ArabicText = z.infer<typeof ArabicTextSchema>;

export const ConceptSchema = z.object({
  en: z.string().min(1),
  ar: z.string().optional(),
  ur: z.string().optional(),
});

export const ExplanationSchema = z.object({
  en: z.string().min(1),
  ur: z.string().optional(),
});

export const AyahWordTimingSchema = z.object({
  index: z.number().int().min(0),
  start_ms: z.number().int().min(0),
  end_ms: z.number().int().min(0),
});

export const AyahReferenceSchema = z.object({
  surah: z.number().int().min(1).max(114),
  ayah: z.number().int().min(1),
  label: z.string().min(1),
  ar: z.string().min(1),
  en: z.string().min(1),
  ur: z.string().optional(),
  audio_url: z.string().url().optional(),
  word_timings: z.array(AyahWordTimingSchema).optional(),
});

export const VocabRefSchema = z.object({
  word_id: z.string().optional(),
  ar_plain: z.string().min(1),
});

export const NootIntroSchema = z.object({
  en: z.string().min(1),
  ur: z.string().optional(),
});

export const HookBeatSchema = z.object({
  ayah: AyahReferenceSchema,
  noor_intro: NootIntroSchema.optional(),
  autoplay: z.boolean().optional(),
});

export const CloseBeatSchema = z.object({
  noor_message_template: z.string().optional(),
  noor_message: z.object({ en: z.string().min(1), ur: z.string().optional() }).optional(),
});
