import type { Event } from "@sentry/nextjs";

const FILTERED = "[Filtered]";
const MAX_DEPTH = 5;

const SENSITIVE_KEY_PATTERNS = [
  /password/i,
  /passcode/i,
  /secret/i,
  /token/i,
  /authorization/i,
  /cookie/i,
  /^email$/i,
  /prompt/i,
  /message/i,
  /transcript/i,
  /answer/i,
  /typed/i,
  /^body$/i,
  /^content$/i,
  /^input$/i,
  /^text$/i,
];

const EMAIL_PATTERN = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i;

export function getSentryDsn() {
  return process.env.NEXT_PUBLIC_SENTRY_DSN || process.env.SENTRY_DSN;
}

export function getSentryEnvironment() {
  return (
    process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT ||
    process.env.SENTRY_ENVIRONMENT ||
    process.env.VERCEL_ENV ||
    process.env.NODE_ENV ||
    "development"
  );
}

export function shouldInitSentry() {
  return (
    Boolean(getSentryDsn()) &&
    process.env.DISABLE_SENTRY !== "true" &&
    process.env.NEXT_PUBLIC_DISABLE_SENTRY !== "true"
  );
}

export function productionSampleRate() {
  return process.env.NODE_ENV === "production" ? 0.1 : 1.0;
}

export function scrubSentryEvent<TEvent extends Event>(event: TEvent): TEvent {
  if (event.user) {
    const { id } = event.user;
    event.user = id ? { id } : undefined;
  }

  if (event.request?.data) {
    event.request.data = scrubValue(event.request.data);
  }

  if (event.extra) {
    event.extra = scrubValue(event.extra) as Event["extra"];
  }

  return event;
}

function scrubValue(value: unknown, depth = 0): unknown {
  if (value === null || value === undefined) return value;
  if (depth >= MAX_DEPTH) return "[Truncated]";

  if (typeof value === "string") {
    return EMAIL_PATTERN.test(value) ? FILTERED : value;
  }

  if (Array.isArray(value)) {
    return value.map((item) => scrubValue(item, depth + 1));
  }

  if (typeof value !== "object") {
    return value;
  }

  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>).map(([key, nestedValue]) => [
      key,
      isSensitiveKey(key) ? FILTERED : scrubValue(nestedValue, depth + 1),
    ]),
  );
}

function isSensitiveKey(key: string) {
  return SENSITIVE_KEY_PATTERNS.some((pattern) => pattern.test(key));
}
