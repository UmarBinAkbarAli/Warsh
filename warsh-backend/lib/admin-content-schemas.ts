import { z } from "zod";

// Shared Zod schemas for admin content routes. Kept in lib (not in a route.ts)
// because Next.js App Router only permits handler exports from route files.

const jsonValue: z.ZodType<unknown> = z.lazy(() =>
  z.union([z.string(), z.number(), z.boolean(), z.null(), z.array(jsonValue), z.record(jsonValue)]),
);

export const WORD_TYPES = [
  "NOUN", "ADJECTIVE", "VERB_PAST", "VERB_PRESENT", "NUMBER",
  "ADVERB", "CONJUNCTION", "PROPER_NOUN", "PARTICLE", "PRONOUN", "PREPOSITION",
] as const;

export const vocabSchema = z.object({
  arabic: z.string().trim().min(1).max(120),
  arabicPlain: z.string().trim().min(1).max(120),
  transliteration: z.string().trim().min(1).max(160),
  translationEn: z.string().trim().min(1).max(300),
  translationUr: z.string().trim().min(1).max(300),
  wordType: z.string().trim().min(1).max(40),
  gender: z.string().trim().max(40).nullable().optional(),
  pluralForm: z.string().trim().max(120).nullable().optional(),
  rootLetters: z.string().trim().max(40).nullable().optional(),
  topicCategories: z.array(z.string().trim()).default([]),
  chapterIntroduced: z.number().int().min(1).max(200).default(1),
  frequencyInQuran: z.number().int().min(0).nullable().optional(),
  audioUrl: z.string().trim().url().max(500).nullable().optional().or(z.literal("").transform(() => null)),
  imageUrl: z.string().trim().url().max(500).nullable().optional().or(z.literal("").transform(() => null)),
  sortOrder: z.number().int().default(0),
});

export const tadabburMeta = {
  orderInProg: z.number().int().min(1).max(200),
  surahNumber: z.number().int().min(1).max(114),
  nameAr: z.string().trim().min(1).max(120),
  nameEn: z.string().trim().min(1).max(120),
  meaningEn: z.string().trim().min(1).max(300),
  totalAyat: z.number().int().min(1).max(300),
};

export const tadabburCreateSchema = z.object({
  ...tadabburMeta,
  ayatData: z.array(jsonValue).default([]),
});

export const tadabburUpdateSchema = z.object({
  ...tadabburMeta,
  ayatData: z.array(jsonValue),
});
