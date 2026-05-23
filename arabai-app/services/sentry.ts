import * as Sentry from "@sentry/react-native";

const DSN = process.env.EXPO_PUBLIC_SENTRY_DSN;
const ENV = process.env.EXPO_PUBLIC_ENVIRONMENT ?? "development";

export function initSentry() {
  if (!DSN) return false;

  Sentry.init({
    dsn: DSN,
    environment: ENV,
    tracesSampleRate: ENV === "production" ? 0.1 : 1.0,
    debug: false,
    beforeSend(event) {
      // Never send user email or typed content — privacy rule from spec
      if (event.user) {
        const { id } = event.user;
        event.user = { id };
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
  Sentry.captureException(error, context ? { extra: context } : undefined);
}
