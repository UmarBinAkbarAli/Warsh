export type WordState = "sage" | "ink" | "gold";

interface SeedWord {
  pos: number;
  arabic: string;
  arabicPlain: string;
  vocabId: string | null;
}

interface SeedAyah {
  ayahNumber: number;
  arabic: string;
  translationEn: string;
  words: SeedWord[];
}

export interface WordWithState extends SeedWord {
  state: WordState;
}

export interface AyahWithStates {
  ayahNumber: number;
  arabic: string;
  translationEn: string;
  words: WordWithState[];
}

export function computeWordStates(
  ayatData: SeedAyah[],
  masteredWordIds: Set<string>
): AyahWithStates[] {
  return ayatData.map((ayah) => ({
    ayahNumber: ayah.ayahNumber,
    arabic: ayah.arabic,
    translationEn: ayah.translationEn,
    words: ayah.words.map((w) => {
      let state: WordState = "sage";
      if (w.vocabId) {
        state = masteredWordIds.has(w.vocabId) ? "gold" : "ink";
      }
      return { ...w, state };
    }),
  }));
}

export function computeSurahState(
  ayatData: SeedAyah[],
  masteredWordIds: Set<string>
): { comprehensionPercent: number; vocabLinkedWords: number; masteredWords: number } {
  // Collect unique vocabIds across all words in all ayat
  const uniqueVocabIds = new Set<string>();
  for (const ayah of ayatData) {
    for (const w of ayah.words) {
      if (w.vocabId) uniqueVocabIds.add(w.vocabId);
    }
  }

  const vocabLinkedWords = uniqueVocabIds.size;
  const masteredWords = [...uniqueVocabIds].filter((id) => masteredWordIds.has(id)).length;

  // Use total words in Surah as denominator (per spec), but only count vocab-linked ones for honesty
  const comprehensionPercent =
    vocabLinkedWords > 0 ? Math.round((masteredWords / vocabLinkedWords) * 100) : 0;

  return { comprehensionPercent, vocabLinkedWords, masteredWords };
}
