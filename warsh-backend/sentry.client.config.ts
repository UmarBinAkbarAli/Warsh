import * as Sentry from "@sentry/nextjs";

if (process.env.NEXT_PUBLIC_DISABLE_SENTRY !== "true") {
const DSN = "https://db56b29332a8641a596174908ad82efa@o4511431583268864.ingest.us.sentry.io/4511431614201856";

Sentry.init({
  dsn: DSN,
  environment: process.env.NODE_ENV ?? "development",
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,
  enableLogs: true,
});
}
