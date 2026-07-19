import { NextResponse } from "next/server";
import crypto from "crypto";
import { timingSafeStringEqual } from "./auth";

// Name of the httpOnly cookie that carries a dashboard admin session.
export const ADMIN_COOKIE_NAME = "warsh_admin";

// Derives the opaque cookie verifier that proves knowledge of
// ADMIN_DASHBOARD_TOKEN without ever storing the raw token in the browser. It is
// bound to JWT_SECRET as well, so rotating either secret invalidates every
// existing admin session. Returns null when the server is not configured for
// admin sessions (no token or no JWT secret).
export function adminCookieVerifier(): string | null {
  const token = process.env.ADMIN_DASHBOARD_TOKEN;
  const secret = process.env.JWT_SECRET;
  if (!token || !secret) return null;
  return crypto.createHmac("sha256", secret).update(`admin-session:${token}`).digest("hex");
}

function readCookie(request: Request, name: string): string | null {
  const header = request.headers.get("cookie");
  if (!header) return null;
  for (const part of header.split(";")) {
    const eq = part.indexOf("=");
    if (eq === -1) continue;
    if (part.slice(0, eq).trim() === name) {
      return decodeURIComponent(part.slice(eq + 1).trim());
    }
  }
  return null;
}

// True when the caller is an authenticated admin: either a valid session cookie
// (dashboard) or the raw X-Admin-Token header (scripts, Prisma Studio). Falls
// back to the dev-only unauthenticated opt-in when no token is configured.
export function isAdminAuthenticated(request: Request): boolean {
  const configuredToken = process.env.ADMIN_DASHBOARD_TOKEN;
  if (!configuredToken) {
    // Only bypass admin auth when explicitly opted into for local development —
    // never infer this from NODE_ENV alone, since a misconfigured non-production
    // deploy (e.g. staging) would otherwise leave every admin route open.
    return process.env.ALLOW_UNAUTHENTICATED_ADMIN === "true" && process.env.NODE_ENV !== "production";
  }

  const header = request.headers.get("x-admin-token") ?? "";
  if (header && timingSafeStringEqual(header, configuredToken)) return true;

  const verifier = adminCookieVerifier();
  const cookie = readCookie(request, ADMIN_COOKIE_NAME);
  if (verifier && cookie && timingSafeStringEqual(cookie, verifier)) return true;

  return false;
}

// Verifies a cookie value already extracted server-side (e.g. via next/headers
// `cookies()` in a Server Component). Mirrors the cookie branch of
// isAdminAuthenticated.
export function verifyAdminCookieValue(value: string | null | undefined): boolean {
  const configuredToken = process.env.ADMIN_DASHBOARD_TOKEN;
  if (!configuredToken) {
    return process.env.ALLOW_UNAUTHENTICATED_ADMIN === "true" && process.env.NODE_ENV !== "production";
  }
  const verifier = adminCookieVerifier();
  return Boolean(verifier && value && timingSafeStringEqual(value, verifier));
}

// Gate for admin write routes. Returns null when allowed, or the error response
// to return otherwise. Accepts either the session cookie or the token header.
export function getAdminWriteError(request: Request) {
  if (isAdminAuthenticated(request)) return null;

  if (!process.env.ADMIN_DASHBOARD_TOKEN) {
    return NextResponse.json(
      { error: "Admin writes are disabled until ADMIN_DASHBOARD_TOKEN is configured.", code: "admin_disabled" },
      { status: 403 },
    );
  }
  return NextResponse.json({ error: "Invalid admin token.", code: "forbidden" }, { status: 403 });
}

// Gate for admin read/list routes (e.g. the user list). Same policy as writes.
export function getAdminReadError(request: Request) {
  return getAdminWriteError(request);
}
