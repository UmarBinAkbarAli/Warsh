import { useAuthStore } from "@stores/authStore";
import { useOnboardingStore } from "@stores/onboardingStore";

export function useLanguage(): "en" | "ur" {
  const authLang = useAuthStore((s) => s.user?.nativeLanguage);
  const onboardingLang = useOnboardingStore((s) => s.language);
  const lang = authLang ?? onboardingLang ?? "en";
  return lang === "ur" ? "ur" : "en";
}

export function pickTranslation(
  word: { translationEn: string; translationUr: string },
  language: "en" | "ur"
): string {
  return language === "ur" ? word.translationUr : word.translationEn;
}
