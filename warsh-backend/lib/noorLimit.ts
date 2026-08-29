export const DEFAULT_DAILY_MESSAGE_LIMIT = 5;

/**
 * Resolves the daily Noor message cap from AI_DAILY_MESSAGE_LIMIT.
 *
 * This exists because `Number(process.env.AI_DAILY_MESSAGE_LIMIT ?? 5)` failed
 * open. A non-numeric value produces NaN, and every comparison against NaN is
 * false, so `messagesUsedToday >= limit` never fired: the daily cap silently
 * stopped existing for every user, the API reported `messagesLimit: null` (NaN
 * serializes to null), the app rendered "6 of null messages used today", and the
 * Noor pack became unsellable because the limit it exists to lift was never
 * reached. Every AI message was billed to us with no ceiling.
 *
 * Fail closed on the default instead of trusting the environment to hold a
 * number, and say so loudly in the logs.
 */
export function resolveDailyMessageLimit(): number {
  const raw = process.env.AI_DAILY_MESSAGE_LIMIT?.trim();
  if (!raw) return DEFAULT_DAILY_MESSAGE_LIMIT;

  const parsed = Number(raw);
  if (!Number.isFinite(parsed) || parsed < 0) {
    console.error(
      `[chat] AI_DAILY_MESSAGE_LIMIT is not a usable number (length ${raw.length}); ` +
        `falling back to ${DEFAULT_DAILY_MESSAGE_LIMIT}.`,
    );
    return DEFAULT_DAILY_MESSAGE_LIMIT;
  }

  return Math.floor(parsed);
}
