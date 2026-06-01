import * as Sentry from "@sentry/react-native";

const DSN = process.env.EXPO_PUBLIC_SENTRY_DSN;
const ENV = process.env.EXPO_PUBLIC_ENVIRONMENT ?? "development";
const SMOKE_TEST_ENABLED = process.env.EXPO_PUBLIC_ENABLE_SENTRY_SMOKE === "true";
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

export function initSentry() {
  if (!DSN) return false;

  Sentry.init({
    dsn: DSN,
    environment: ENV,
    tracesSampleRate: ENV === "production" ? 0.1 : 1.0,
    debug: false,
    beforeSend(event) {
      if (event.user) {
        const { id } = event.user;
        event.user = id ? { id } : undefined;
      }

      if (event.extra) {
        event.extra = scrubValue(event.extra) as typeof event.extra;
      }

      return event;
    },
  });

  return true;
}

export function setSentryUser(userId: string) {
  Sentry.setUser({ id: userId });
}

export function clearSentryUser() {
  Sentry.setUser(null);
}

export function captureError(error: unknown, context?: Record<string, unknown>) {
  Sentry.captureException(
    error,
    context ? { extra: scrubValue(context) as Record<string, unknown> } : undefined,
  );
}

export function isSentrySmokeTestEnabled() {
  return Boolean(DSN) && SMOKE_TEST_ENABLED;
}

export async function sendSentrySmokeTest(context?: Record<string, unknown>) {
  if (!isSentrySmokeTestEnabled()) {
    return null;
  }

  const eventId = Sentry.captureMessage("Warsh mobile Sentry smoke test", {
    level: "info",
    extra: scrubValue({
      environment: ENV,
      smokeTest: true,
      source: "settings",
      ...context,
    }) as Record<string, unknown>,
  });

  await Sentry.flush();
  return eventId;
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
