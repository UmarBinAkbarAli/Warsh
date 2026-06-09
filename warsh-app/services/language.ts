import { useAuthStore } from "@stores/authStore";
import { useOnboardingStore } from "@stores/onboardingStore";

export type AppLanguage = "en" | "ur";

export function useLanguage(): AppLanguage {
  const authLang = useAuthStore((s) => s.user?.nativeLanguage);
  const onboardingLang = useOnboardingStore((s) => s.language);
  const lang = authLang ?? onboardingLang ?? "en";
  return lang === "ur" ? "ur" : "en";
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
