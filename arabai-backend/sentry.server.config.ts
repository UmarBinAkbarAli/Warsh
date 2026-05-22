import * as Sentry from "@sentry/nextjs";

if (process.env.DISABLE_SENTRY !== "true") {
const DSN = "https://db56b29332a8641a596174908ad82efa@o4511431583268864.ingest.us.sentry.io/4511431614201856";

Sentry.init({
  dsn: DSN,
  environment: process.env.NODE_ENV ?? "development",
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,
  enableLogs: true,
  // Never send passwords or emails — privacy rule
  beforeSend(event) {
    if (event.request?.data && typeof event.request.data === "object") {
      const data = event.request.data as Record<string, unknown>;
      if ("password" in data) data["password"] = "[Filtered]";
      if ("email" in data) data["email"] = "[Filtered]";
    }
    return event;
  },
});
}
