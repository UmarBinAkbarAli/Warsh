import { z } from "zod";
import { ArabicTextSchema, ConceptSchema, ExplanationSchema, VocabRefSchema } from "./primitives";

// ============================================================================
// DISCOVER CARDS — discriminated union per type
// ============================================================================

export const DiscoverCardSchema = z.discriminatedUnion("type", [
  // WORD
  z.object({
    type: z.literal("WORD"),
    text: ArabicTextSchema,
    image_url: z.string().optional(),
    audio_url: z.string().optional(),
    explanation: ExplanationSchema.optional(),
    examples: z.array(ArabicTextSchema).optional(),
    introduces_vocab: VocabRefSchema.optional(),
  }),
  // CONCEPT
  z.object({
    type: z.literal("CONCEPT"),
    concept: ConceptSchema,
    explanation: ExplanationSchema,
    image_url: z.string().optional(),
    audio_url: z.string().optional(),
    examples: z.array(ArabicTextSchema).optional(),
    introduces_vocab: VocabRefSchema.optional(),
  }),
  // EXAMPLE
  z.object({
    type: z.literal("EXAMPLE"),
    text: ArabicTextSchema.optional(),
    explanation: ExplanationSchema.optional(),
    image_url: z.string().optional(),
    audio_url: z.string().optional(),
    examples: z.array(ArabicTextSchema).optional(),
    introduces_vocab: VocabRefSchema.optional(),
  }),
  // CONTRAST
  z.object({
    type: z.literal("CONTRAST"),
    concept: ConceptSchema.optional(),
    text: ArabicTextSchema.optional(),
    explanation: ExplanationSchema.optional(),
    image_url: z.string().optional(),
    audio_url: z.string().optional(),
    examples: z.array(ArabicTextSchema).min(2),
    introduces_vocab: VocabRefSchema.optional(),
  }),
  // AYAH_PREVIEW
  z.object({
    type: z.literal("AYAH_PREVIEW"),
    concept: ConceptSchema.optional(),
    text: ArabicTextSchema.optional(),
    explanation: ExplanationSchema.optional(),
    image_url: z.string().optional(),
    audio_url: z.string().optional(),
    examples: z.array(ArabicTextSchema).min(1).optional(),
    introduces_vocab: VocabRefSchema.optional(),
  }),
  // Legacy/player-supported card used by existing fixtures.
  z.object({
    type: z.literal("GRAMMAR_NOTE"),
    title: ConceptSchema,
    body: ExplanationSchema,
    image_url: z.string().optional(),
    audio_url: z.string().optional(),
  }),
  // Legacy/player-supported card used by existing fixtures.
  z.object({
    type: z.literal("SENTENCE"),
    text: ArabicTextSchema,
    explanation: ExplanationSchema.optional(),
    image_url: z.string().optional(),
    audio_url: z.string().optional(),
    introduces_vocab: VocabRefSchema.optional(),
  }),
]);

export type DiscoverCard = z.infer<typeof DiscoverCardSchema>;
export type DiscoverCardType = DiscoverCard["type"];

// Type guard
export function isDiscoverCard(value: unknown): value is DiscoverCard {
  return DiscoverCardSchema.safeParse(value).success;
}
