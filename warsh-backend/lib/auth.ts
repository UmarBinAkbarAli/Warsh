import jwt from "jsonwebtoken";
import crypto from "crypto";

function getJwtSecret() {
  const secret = process.env.JWT_SECRET?.trim();
  if (!secret) {
    throw new Error("JWT_SECRET environment variable is required.");
  }
  return secret;
}

export interface AuthPayload {
  userId: string;
  sessionStart?: number;
  iat?: number;
  exp?: number;
}

// Maximum total session lifetime from original login, regardless of how many
// times the token is refreshed. Forces re-authentication after this window
// even if the caller keeps calling /api/auth/refresh with a stolen token.
export const MAX_SESSION_MS = 90 * 24 * 60 * 60 * 1000; // 90 days

// `sessionStart` (unix seconds) is preserved across refreshes so MAX_SESSION_MS
// is measured from the original login, not reset on every refresh.
export function signToken(userId: string, sessionStart?: number) {
  return jwt.sign(
    { userId, sessionStart: sessionStart ?? Math.floor(Date.now() / 1000) },
    getJwtSecret(),
    { expiresIn: "30d" },
  );
}

export function verifyToken(token: string): AuthPayload | null {
  try {
    return jwt.verify(token, getJwtSecret()) as AuthPayload;
  } catch {
    return null;
  }
}

// Allows extracting the userId from an expired token — used only by the refresh endpoint.
export function verifyTokenAllowExpired(token: string): AuthPayload | null {
  try {
    return jwt.verify(token, getJwtSecret(), { ignoreExpiration: true }) as AuthPayload;
  } catch {
    return null;
  }
}

// Constant-time string compare to avoid leaking secret length/content via timing.
export function timingSafeStringEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) {
    // Still run a comparison of equal length to keep timing consistent.
    crypto.timingSafeEqual(bufA, bufA);
    return false;
  }
  return crypto.timingSafeEqual(bufA, bufB);
}

export function getUserIdFromRequest(request: Request): string | null {
  const authHeader = request.headers.get("authorization");
  const token = authHeader?.replace("Bearer ", "") ?? "";
  const payload = verifyToken(token);
  return payload?.userId ?? null;
}
