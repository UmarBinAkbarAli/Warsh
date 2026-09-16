// The API origin, resolved once and guarded so a non-development build can
// never ship pointing at a local host. Lives apart from api.ts so modules the
// auth store depends on (restoreCredentials) can read it without pulling in
// the axios instance and its auth-store import (a require cycle).
type AppEnvironment = "development" | "staging" | "production";

const APP_ENVIRONMENT: AppEnvironment = process.env.EXPO_PUBLIC_ENVIRONMENT ?? "production";

function getApiBaseUrl() {
  const rawApiUrl = process.env.EXPO_PUBLIC_API_URL?.trim();

  if (!rawApiUrl) {
    throw new Error(`EXPO_PUBLIC_API_URL must be set for ${APP_ENVIRONMENT} builds.`);
  }

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(rawApiUrl);
  } catch {
    throw new Error("EXPO_PUBLIC_API_URL must be a valid absolute URL.");
  }

  const hostname = parsedUrl.hostname.toLowerCase();
  const isLocalHost =
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname === "10.0.2.2" ||
    hostname.endsWith(".local");

  if (APP_ENVIRONMENT !== "development" && parsedUrl.protocol !== "https:") {
    throw new Error("EXPO_PUBLIC_API_URL must use HTTPS outside development.");
  }

  if (APP_ENVIRONMENT !== "development" && isLocalHost) {
    throw new Error("EXPO_PUBLIC_API_URL cannot point to a local host outside development.");
  }

  return parsedUrl.toString().replace(/\/$/, "");
}

export const API_BASE_URL = getApiBaseUrl();
