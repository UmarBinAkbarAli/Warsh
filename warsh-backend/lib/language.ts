// Shared language helpers.
//
// Warsh separates two language preferences:
//   - nativeLanguage: the app/interface language (kept for backward compat)
//   - translationLanguage: the language used for Arabic word meanings, ayah
//     translations, lesson explanations, and Noor's responses
//
// Arabic learning content itself always stays in Arabic. Only these two
// values are supported everywhere.

export const SUPPORTED_LANGUAGES = ["en", "ur"] as const;
export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

export function isSupportedLanguage(value: unknown): value is SupportedLanguage {
  return typeof value === "string" && (SUPPORTED_LANGUAGES as readonly string[]).includes(value);
}

/**
 * Resolve the pair of language preferences to persist at registration time.
 *
 * Older clients may send only `nativeLanguage` (or nothing). In that case
 * `translationLanguage` falls back to the submitted `nativeLanguage`, then to
 * "ur" when neither is a supported value. Unsupported values are ignored and
 * treated as "not provided" so a bad payload can't poison the stored prefs.
 */
export function resolveRegistrationLanguages(input: {
  nativeLanguage?: unknown;
  translationLanguage?: unknown;
}): { nativeLanguage: SupportedLanguage; translationLanguage: SupportedLanguage } {
  const nativeLanguage: SupportedLanguage = isSupportedLanguage(input.nativeLanguage)
    ? input.nativeLanguage
    : "ur";

  const translationLanguage: SupportedLanguage = isSupportedLanguage(input.translationLanguage)
    ? input.translationLanguage
    : isSupportedLanguage(input.nativeLanguage)
      ? input.nativeLanguage
      : "ur";

  return { nativeLanguage, translationLanguage };
}

/**
 * Choose the language Noor (and other translated content) should use for a
 * given user. Prefers the dedicated `translationLanguage`, falling back to
 * `nativeLanguage` for rows written before the column existed.
 */
export function resolveContentLanguage(user: {
  translationLanguage?: string | null;
  nativeLanguage?: string | null;
}): SupportedLanguage | undefined {
  if (isSupportedLanguage(user.translationLanguage)) return user.translationLanguage;
  if (isSupportedLanguage(user.nativeLanguage)) return user.nativeLanguage;
  return undefined;
}
