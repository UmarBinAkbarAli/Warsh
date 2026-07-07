import jwt from "jsonwebtoken";
import crypto from "crypto";
import { prisma } from "./prisma";

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
  // Short fingerprint of the user's password hash at issue time. When the
  // password changes (reset/change) the fingerprint no longer matches, so every
  // previously-issued token is rejected — this is how we invalidate sessions.
  pv?: string;
  iat?: number;
  exp?: number;
}

// Derives a stable, non-reversible fingerprint of the password hash. Embedded in
// the token as `pv` and re-checked on every authenticated request.
export function passwordTokenFingerprint(passwordHash: string): string {
  return crypto.createHash("sha256").update(passwordHash).digest("hex").slice(0, 16);
}

// Maximum total session lifetime from original login, regardless of how many
// times the token is refreshed. Forces re-authentication after this window
// even if the caller keeps calling /api/auth/refresh with a stolen token.
export const MAX_SESSION_MS = 90 * 24 * 60 * 60 * 1000; // 90 days

// `sessionStart` (unix seconds) is preserved across refreshes so MAX_SESSION_MS
// is measured from the original login, not reset on every refresh.
// `pwFingerprint` binds the token to the current password hash (see AuthPayload.pv).
export function signToken(
  userId: string,
  opts?: { sessionStart?: number; pwFingerprint?: string },
) {
  return jwt.sign(
    {
      userId,
      sessionStart: opts?.sessionStart ?? Math.floor(Date.now() / 1000),
      ...(opts?.pwFingerprint ? { pv: opts.pwFingerprint } : {}),
    },
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

export async function getUserIdFromRequest(request: Request): Promise<string | null> {
  const authHeader = request.headers.get("authorization");
  const token = authHeader?.replace("Bearer ", "") ?? "";
  const payload = verifyToken(token);
  if (!payload?.userId) return null;

  // Tokens carrying a password fingerprint must still match the current hash.
  // Tokens issued before this feature (no `pv`) are accepted for backward
  // compatibility and get upgraded on the next login/refresh.
  if (payload.pv) {
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { passwordHash: true },
    });
    if (!user) return null;
    if (!timingSafeStringEqual(passwordTokenFingerprint(user.passwordHash), payload.pv)) {
      return null;
    }
  }

  return payload.userId;
}
