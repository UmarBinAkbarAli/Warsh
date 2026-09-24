export const DISPLAY_NAME_MAX_LENGTH = 60;

/**
 * A learner's display name as typed in Edit profile: trimmed, inner runs of
 * whitespace collapsed, 1–60 characters. Returns null when it is not usable.
 */
export function parseDisplayName(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const name = value.normalize("NFC").replace(/\s+/g, " ").trim();
  if (name.length === 0 || name.length > DISPLAY_NAME_MAX_LENGTH) return null;
  // Control characters never belong in a name shown back to the learner.
  if (/[\u0000-\u001f\u007f]/.test(name)) return null;
  return name;
}
