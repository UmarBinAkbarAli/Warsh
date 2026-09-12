/**
 * Defensive numeric parsing for environment variables.
 *
 * Every Vercel production variable is sensitivity-flagged and cannot be read
 * back, so a wrong value is only ever found by exercising the path it controls.
 * `Number(process.env.X)` makes that worse: a non-numeric value is NaN, every
 * comparison against NaN is false, and the control the variable configures
 * silently stops existing (AI_DAILY_MESSAGE_LIMIT did exactly this — see
 * `lib/noorLimit.ts`). Parse here instead: reject anything that is not a
 * finite integer inside the documented range, fall back to the documented
 * default, and say so in the logs.
 */
export interface IntEnvOptions {
  /** Inclusive lower bound; values below it are rejected. */
  min?: number;
  /** Inclusive upper bound; values above it are rejected. */
  max?: number;
  /** Log prefix, e.g. "[chat]". Defaults to "[env]". */
  scope?: string;
}

/**
 * Reads an integer from `process.env[name]`. Unset or blank returns
 * `fallback` silently; anything unparsable or out of range returns `fallback`
 * and logs an error that names the variable but never echoes its value.
 */
export function readIntEnv(name: string, fallback: number, options: IntEnvOptions = {}): number {
  const raw = process.env[name]?.trim();
  if (!raw) return fallback;

  const { min = Number.NEGATIVE_INFINITY, max = Number.POSITIVE_INFINITY, scope = "[env]" } = options;
  const parsed = Number(raw);
  if (!Number.isInteger(parsed) || parsed < min || parsed > max) {
    console.error(
      `${scope} ${name} is not a usable integer (length ${raw.length}, allowed ${describeRange(min, max)}); ` +
        `falling back to ${fallback}.`,
    );
    return fallback;
  }

  return parsed;
}

/**
 * Same contract for an integer that arrived as a request query parameter:
 * missing, non-numeric or out-of-range values become `fallback` rather than a
 * NaN that `Math.min`/`Math.max` pass straight through into a Prisma `take`.
 */
export function parseIntParam(
  raw: string | null | undefined,
  fallback: number,
  options: Omit<IntEnvOptions, "scope"> = {},
): number {
  const value = raw?.trim();
  if (!value) return fallback;
  const parsed = Number(value);
  if (!Number.isInteger(parsed)) return fallback;
  const { min = Number.NEGATIVE_INFINITY, max = Number.POSITIVE_INFINITY } = options;
  return Math.min(max, Math.max(min, parsed));
}

function describeRange(min: number, max: number): string {
  if (Number.isFinite(min) && Number.isFinite(max)) return `${min}..${max}`;
  if (Number.isFinite(min)) return `>= ${min}`;
  if (Number.isFinite(max)) return `<= ${max}`;
  return "any integer";
}
