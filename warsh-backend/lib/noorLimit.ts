import { readIntEnv } from "./env";

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
  return readIntEnv("AI_DAILY_MESSAGE_LIMIT", DEFAULT_DAILY_MESSAGE_LIMIT, { min: 0, scope: "[chat]" });
}
