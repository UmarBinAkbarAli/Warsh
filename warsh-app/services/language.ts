import { useAuthStore } from "@stores/authStore";
import { useOnboardingStore } from "@stores/onboardingStore";

export type AppLanguage = "en" | "ur";
export type TranslationLanguage = AppLanguage;

export function useLanguage(): AppLanguage {
  const authLang = useAuthStore((s) => s.user?.nativeLanguage);
  const onboardingLang = useOnboardingStore((s) => s.language);
  const lang = authLang ?? onboardingLang ?? "en";
  return lang === "ur" ? "ur" : "en";
}

export function useTranslationLanguage(): TranslationLanguage {
  const user = useAuthStore((s) => s.user);
  const onboardingTranslationLanguage = useOnboardingStore((s) => s.translationLanguage);
  const fallbackLanguage = useOnboardingStore((s) => s.language);
  const language = user?.translationLanguage ?? user?.nativeLanguage ?? onboardingTranslationLanguage ?? fallbackLanguage ?? "en";
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
