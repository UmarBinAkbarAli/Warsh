import * as Sentry from "@sentry/nextjs";
import {
  getSentryDsn,
  getSentryEnvironment,
  productionSampleRate,
  scrubSentryEvent,
  shouldInitSentry,
} from "./sentry.shared";

if (shouldInitSentry()) {
  Sentry.init({
    dsn: getSentryDsn(),
    environment: getSentryEnvironment(),
    tracesSampleRate: productionSampleRate(),
    enableLogs: process.env.NODE_ENV !== "production",
    replaysSessionSampleRate: process.env.NODE_ENV === "production" ? 0.0 : 0.1,
    replaysOnErrorSampleRate: 1.0,
    integrations: [Sentry.replayIntegration()],
    beforeSend: scrubSentryEvent,
  });
}

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
