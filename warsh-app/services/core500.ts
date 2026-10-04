import api from "./api";
export interface CoreAyahExample {
  id: string; surahNumber: number; ayahNumber: number; surahName: string;
  arabic: string; translationEn: string; translationUr: string;
  wordPosition: number; surface: string; matchKind: string; source: string;
}
export interface CoreSetWord {
  id: string; arabic: string; transliteration: string; translationEn: string; translationUr: string;
  frequencyInQuran: number | null; quranicRank: number | null; isCorePrefix: boolean;
  audioUrl: string | null; known: boolean; coverageGain: number; ayahExamples: CoreAyahExample[];
}
export interface CoreAssessment {
  language: "en" | "ur"; phase: "QUIZ" | "REVIEW" | "COMPLETE"; round: number;
  passedCount: number; total: number; answeredCount: number;
  question: { id: string; wordId: string; arabic: string; options: { id: string; text: string }[] } | null;
  review: { wordId: string; arabic: string; meaning: string }[];
  feedback?: { correct: boolean; meaning: string; wordId: string };
  completed?: boolean; coveragePercent?: number; currentStreak?: number; streakAdvanced?: boolean;
}
export async function loadCoreSet(setNumber: number) {
  const response = await api.get<{ data: { words: CoreSetWord[]; completed: boolean; assessmentSupported?: boolean; examplesReady?: boolean } }>(`/api/core500/sets/${setNumber}`);
  return response.data.data;
}
export async function loadCoreAssessment(setNumber: number) {
  const response = await api.get<{ data: CoreAssessment | null }>(`/api/core500/sets/${setNumber}/assessment`);
  return response.data.data;
}
export async function updateCoreAssessment(setNumber: number, action:
  { action: "start"; language: "en" | "ur"; restart?: boolean } | { action: "retry"; round: number }
  | { action: "answer"; questionId: string; optionId: string; round: number }) {
  const response = await api.post<{ data: CoreAssessment }>(`/api/core500/sets/${setNumber}/assessment`, action);
  return response.data.data;
}
export function coreDirectionMark(text: string, language: "en" | "ur") {
  const mark = language === "ur" ? "\u200f" : "\u200e";
  return mark + text.replace(/\n/g, `\n${mark}`);
}
