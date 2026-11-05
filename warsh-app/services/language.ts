import { create } from "zustand";

import { useAuthStore } from "@stores/authStore";
import { useOnboardingStore } from "@stores/onboardingStore";

export type AppLanguage = "en" | "ur";
export type TranslationLanguage = AppLanguage;

// Studio's phone preview shows a chosen language whoever is signed in on this
// browser. Held in memory only, so the account's own language is never touched.
export const usePreviewLanguage = create<{ language: AppLanguage | null }>(() => ({ language: null }));

export function useLanguage(): AppLanguage {
  const previewLang = usePreviewLanguage((s) => s.language);
  const authLang = useAuthStore((s) => s.user?.nativeLanguage);
  const onboardingLang = useOnboardingStore((s) => s.language);
  const lang = previewLang ?? authLang ?? onboardingLang ?? "en";
  return lang === "ur" ? "ur" : "en";
}

export function useTranslationLanguage(): TranslationLanguage {
  const previewLang = usePreviewLanguage((s) => s.language);
  const user = useAuthStore((s) => s.user);
  const onboardingTranslationLanguage = useOnboardingStore((s) => s.translationLanguage);
  const fallbackLanguage = useOnboardingStore((s) => s.language);
  const language = previewLang ?? user?.translationLanguage ?? user?.nativeLanguage ?? onboardingTranslationLanguage ?? fallbackLanguage ?? "en";
  return language === "ur" ? "ur" : "en";
}

export function pickLocalized(
  enValue: string | null | undefined,
  urValue: string | null | undefined,
  language: AppLanguage
) {
  if (language === "ur") return urValue ?? enValue ?? "";
  return enValue ?? urValue ?? "";
}

export function pickTranslation(
  word: { translationEn: string; translationUr: string },
  language: AppLanguage
): string {
  return pickLocalized(word.translationEn, word.translationUr, language);
}
