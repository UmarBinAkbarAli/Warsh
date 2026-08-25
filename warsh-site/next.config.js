/** @type {import('next').NextConfig} */

// warsh.app renders blog bodies authored in Warsh Studio through
// dangerouslySetInnerHTML. They are sanitized three times (backend write,
// backend read, and again in content/blog.ts) — this CSP is the layer that
// holds if all three ever miss something.
//
// script-src carries 'unsafe-inline' because the App Router emits ~12 inline
// `self.__next_f.push(...)` hydration scripts per page and the site is fully
// static/ISR — a nonce would force every route dynamic and kill the blog's
// revalidation. Verified against the real build output, not assumed.
//
// The policy still does substantial work without it: no third-party script host
// can be loaded, an injected script cannot exfiltrate to an attacker host
// (connect-src/img-src are allowlisted), cannot rewrite relative URLs
// (base-uri 'none'), cannot post credentials elsewhere (form-action 'self'),
// and the page cannot be framed (frame-ancestors 'none').
const CSP = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' https://assets.warsh.app data:",
  "media-src 'self' https://assets.warsh.app",
  "font-src 'self' data:",
  "connect-src 'self' https://api.warsh.app",
  // Matches the iframe allowlist in content/blog.ts and backend blogSanitize.ts.
  "frame-src https://www.youtube.com https://youtube.com https://player.vimeo.com",
  "form-action 'self'",
  "object-src 'none'",
  "base-uri 'none'",
  "frame-ancestors 'none'",
  "upgrade-insecure-requests",
].join("; ");

const SECURITY_HEADERS = [
  { key: "Content-Security-Policy", value: CSP },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "Permissions-Policy", value: "camera=(), geolocation=(), microphone=(), interest-cohort=()" },
];

const nextConfig = {
  reactStrictMode: true,
  async headers() {
    return [{ source: "/:path*", headers: SECURITY_HEADERS }];
  },
};

module.exports = nextConfig;
