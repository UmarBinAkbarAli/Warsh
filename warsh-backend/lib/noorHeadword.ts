import { prisma } from "./prisma";
import { plainCandidates, singleArabicWord, splitHeadword } from "./noorHeadwordTag";

export { HEADWORD_INSTRUCTION, splitHeadword } from "./noorHeadwordTag";

export type NoorHeadword = {
  arabic: string;
  wordId: string | null;
  transliteration: string | null;
  meaning: string | null;
  audioUrl: string | null;
};

/** Resolve each tagged headword to a published vocabulary row, when one exists. */
export async function resolveHeadwords(headwords: string[], language: string | undefined) {
  const unique = Array.from(new Set(headwords));
  const result = new Map<string, NoorHeadword>();
  if (unique.length === 0) return result;

  const candidates = unique.flatMap(plainCandidates);
  const rows = await prisma.vocabularyWord.findMany({
    where: { arabicPlain: { in: candidates }, status: "PUBLISHED" },
    select: { id: true, arabicPlain: true, transliteration: true, translationEn: true, translationUr: true, audioUrl: true },
  });
  const byPlain = new Map(rows.map((row) => [row.arabicPlain, row]));

  for (const headword of unique) {
    const row = plainCandidates(headword).map((c) => byPlain.get(c)).find(Boolean) ?? null;
    result.set(headword, {
      arabic: headword,
      wordId: row?.id ?? null,
      transliteration: row?.transliteration ?? null,
      meaning: row ? (language === "ur" ? row.translationUr : row.translationEn) : null,
      audioUrl: row?.audioUrl ?? null,
    });
  }
  return result;
}

/**
 * Shape stored ASSISTANT rows for the app: tag stripped, headword resolved.
 *
 * The model does not always emit the tag (gpt-4o-mini drops it often), so a
 * reply without one falls back to the question that prompted it: a learner
 * message holding exactly one Arabic word that is in the vocabulary. That
 * fallback only counts when it resolves to a real word, so it never puts a
 * stray Urdu word on the card. `previousUser` seeds the fallback when the
 * question is not part of `messages` (the reply returned by POST /api/chat).
 */
export async function presentNoorMessages<T extends { role: string; content: string }>(
  messages: T[],
  language: string | undefined,
  previousUser: string | null = null,
): Promise<(T & { headword: NoorHeadword | null })[]> {
  let lastUser = previousUser;
  const split = messages.map((m) => {
    if (m.role !== "ASSISTANT") {
      if (m.role === "USER") lastUser = m.content;
      return { content: m.content, headword: null, fallback: null };
    }
    const own = splitHeadword(m.content);
    return { ...own, fallback: own.headword ? null : singleArabicWord(lastUser) };
  });
  const resolved = await resolveHeadwords(
    split.flatMap((s) => [s.headword, s.fallback]).filter((h): h is string => h !== null),
    language,
  );
  return messages.map((m, i) => {
    const { content, headword, fallback } = split[i];
    const tagged = headword ? resolved.get(headword) ?? null : null;
    const asked = fallback ? resolved.get(fallback) ?? null : null;
    return { ...m, content, headword: tagged ?? (asked?.wordId ? asked : null) };
  });
}
