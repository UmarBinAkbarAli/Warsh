import * as Sentry from "@sentry/nextjs";

/**
 * Neon suspends the compute when the database goes idle. Both cron jobs run in
 * the dead of the Pakistani night — 04:00 and 05:00 PKT — which is exactly when
 * no app traffic has kept the endpoint warm, so their first connection lands on
 * a suspended or still-waking compute. Prisma surfaces that as a connection
 * error (P1000 "Authentication failed", P1001 "Can't reach database server")
 * rather than waiting for the wake, and the whole cron run dies on its first
 * query. Sentry recorded this on 12 of the 21 reset-streaks runs in August:
 * more than half the month's streaks were never reset.
 *
 * Only failures to *establish* a connection are retried. A query that reached
 * the database and failed on its own merits (constraint violation, bad input)
 * must surface immediately — retrying it would just repeat the same mistake.
 */
const RETRYABLE_CODES = new Set([
  "P1000", // authentication failed against the database server
  "P1001", // can't reach database server
  "P1002", // database server reached but timed out
  "P1008", // operation timed out
  "P1017", // server has closed the connection
  "P2024", // timed out fetching a new connection from the pool
  "P2037", // too many database connections opened
]);

// Prisma's driver-adapter path does not always carry a code, so the message is
// the fallback signal. These are the exact phrases Sentry captured.
const RETRYABLE_MESSAGES = [
  "authentication failed against the database server",
  "can't reach database server",
  "too many database connections opened",
  "failed to acquire permit to connect",
  "connection closed",
  "connection terminated",
  "timed out fetching a new connection",
  "econnreset",
  "etimedout",
];

const BACKOFF_MS = [1_000, 3_000, 6_000];

export function isTransientDbError(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;

  const code = (error as { code?: unknown }).code;
  if (typeof code === "string" && RETRYABLE_CODES.has(code)) return true;

  // PrismaClientInitializationError carries `errorCode` instead of `code`.
  const errorCode = (error as { errorCode?: unknown }).errorCode;
  if (typeof errorCode === "string" && RETRYABLE_CODES.has(errorCode)) return true;

  const message = (error as { message?: unknown }).message;
  if (typeof message !== "string") return false;
  const normalized = message.toLowerCase();
  return RETRYABLE_MESSAGES.some((phrase) => normalized.includes(phrase));
}

/**
 * Runs `operation`, retrying it while the database is merely unreachable.
 *
 * The caller must supply an operation that is safe to run twice. Both cron
 * handlers qualify: their selection predicates exclude the rows they have
 * already updated, so a retry after partial progress picks up exactly the
 * remainder.
 */
export async function withDbRetry<T>(
  label: string,
  operation: () => Promise<T>,
  attempts = BACKOFF_MS.length + 1,
): Promise<T> {
  let lastError: unknown;

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      if (attempt >= attempts || !isTransientDbError(error)) throw error;

      Sentry.addBreadcrumb({
        category: "db.retry",
        level: "warning",
        message: `${label}: transient database error, retrying`,
        data: { attempt, of: attempts },
      });
      console.warn(
        `[db] ${label}: transient database error on attempt ${attempt}/${attempts}, retrying:`,
        (error as Error)?.message ?? error,
      );

      await sleep(BACKOFF_MS[Math.min(attempt - 1, BACKOFF_MS.length - 1)]);
    }
  }

  throw lastError;
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
