const fs = require("node:fs");
const path = require("node:path");
const dotenv = require("dotenv");
const Sentry = require("@sentry/nextjs");

for (const fileName of [".env.local", ".env", ".env.production", ".env.preview"]) {
  const filePath = path.join(process.cwd(), fileName);
  if (fs.existsSync(filePath)) {
    dotenv.config({ path: filePath, override: false });
  }
}

const dsn = process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN;

if (!dsn) {
  console.error("Sentry smoke test skipped: set SENTRY_DSN or NEXT_PUBLIC_SENTRY_DSN first.");
  process.exit(1);
}

async function main() {
  Sentry.init({
    dsn,
    environment: process.env.SENTRY_ENVIRONMENT || process.env.NODE_ENV || "smoke-test",
    tracesSampleRate: 0,
    enableLogs: false,
  });

  const eventId = Sentry.captureMessage("Warsh backend Sentry smoke test", {
    level: "info",
    tags: {
      smoke_test: "true",
      service: "warsh-backend",
    },
    extra: {
      source: "scripts/sentry-smoke-test.cjs",
      timestamp: new Date().toISOString(),
    },
  });

  const flushed = await Sentry.flush(5000);

  if (!flushed) {
    console.error(`Sentry smoke test event was not flushed before timeout. Event ID: ${eventId}`);
    process.exit(1);
  }

  console.log(`Sentry smoke test event sent. Event ID: ${eventId}`);
}

main().catch((error) => {
  console.error("Sentry smoke test failed:", error);
  process.exit(1);
});
