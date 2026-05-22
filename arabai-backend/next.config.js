const { withSentryConfig } = require("@sentry/nextjs");

const nextConfig = {
  reactStrictMode: true,
};

module.exports = withSentryConfig(nextConfig, {
  org: "umar-bin-akbar-ali",
  project: "javascript-nextjs",
  silent: !process.env.CI,
  widenClientFileUpload: true,
  tunnelRoute: "/monitoring",
  webpack: {
    automaticVercelMonitors: true,
    treeshake: {
      removeDebugLogging: true,
    },
  },
});
