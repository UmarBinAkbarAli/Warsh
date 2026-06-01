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
    beforeSend: scrubSentryEvent,
  });
}
