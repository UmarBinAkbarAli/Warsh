const { withSentryConfig } = require("@sentry/nextjs");

// Baseline hardening for every response this origin serves. api.warsh.app also
// serves Warsh Studio and the password-reset page, so framing is denied outright
// and HSTS is preloaded. No CSP here yet: Studio styles components inline, and a
// script-src would also have to cover the Sentry tunnel at /monitoring.
const SECURITY_HEADERS = [
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "Permissions-Policy", value: "camera=(), geolocation=(), microphone=(), interest-cohort=()" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
];

const nextConfig = {
  reactStrictMode: true,
  async headers() {
    return [{ source: "/:path*", headers: SECURITY_HEADERS }];
  },
  env: {
    NEXT_PUBLIC_SENTRY_DSN: process.env.NEXT_PUBLIC_SENTRY_DSN || process.env.SENTRY_DSN || "",
    NEXT_PUBLIC_SENTRY_ENVIRONMENT:
      process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT ||
      process.env.SENTRY_ENVIRONMENT ||
      process.env.VERCEL_ENV ||
      process.env.NODE_ENV ||
      "development",
  },
};

const hasSentrySourceMapConfig =
  Boolean(process.env.SENTRY_AUTH_TOKEN) &&
  Boolean(process.env.SENTRY_ORG) &&
  Boolean(process.env.SENTRY_PROJECT);

module.exports = withSentryConfig(nextConfig, {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  silent: !process.env.CI,
  widenClientFileUpload: true,
  tunnelRoute: "/monitoring",
  sourcemaps: {
    disable: !hasSentrySourceMapConfig,
    // Upload maps to Sentry for readable stack traces, then strip them from the
    // deployed bundle so they are never publicly fetchable.
    deleteSourcemapsAfterUpload: true,
  },
  webpack: {
    // Off deliberately. This upserted one Sentry monitor per entry in
    // vercel.json — two — into an organisation whose plan carries a single
    // monitor seat, so the quota sat permanently exceeded, incoming check-ins
    // were dropped, and every night produced a "Cron failure" issue for a job
    // that had in fact run. 79 alerts, none of them real. The one cron worth
    // watching now checks in explicitly from its own route, with a window that
    // matches when the platform actually fires it.
    automaticVercelMonitors: false,
    treeshake: {
      removeDebugLogging: true,
    },
  },
});
