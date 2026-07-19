import { NextResponse } from "next/server";
import { z } from "zod";
import { timingSafeStringEqual } from "../../../../lib/auth";
import { ADMIN_COOKIE_NAME, adminCookieVerifier } from "../../../../lib/admin";

const bodySchema = z.object({ token: z.string().min(1).max(500) });

// POST /api/admin/session — exchange the admin token for a session cookie.
export async function POST(request: Request) {
  const configuredToken = process.env.ADMIN_DASHBOARD_TOKEN;
  if (!configuredToken) {
    return NextResponse.json(
      { error: "Admin login is disabled until ADMIN_DASHBOARD_TOKEN is configured.", code: "admin_disabled" },
      { status: 403 },
    );
  }

  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Token required.", code: "invalid_input" }, { status: 400 });
  }

  if (!timingSafeStringEqual(parsed.data.token, configuredToken)) {
    return NextResponse.json({ error: "Invalid admin token.", code: "forbidden" }, { status: 403 });
  }

  const verifier = adminCookieVerifier();
  if (!verifier) {
    return NextResponse.json(
      { error: "Server is not configured for admin sessions (missing JWT_SECRET).", code: "server_error" },
      { status: 500 },
    );
  }

  const res = NextResponse.json({ data: { ok: true } });
  res.cookies.set(ADMIN_COOKIE_NAME, verifier, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
  return res;
}

// DELETE /api/admin/session — sign out (clear the cookie).
export async function DELETE() {
  const res = NextResponse.json({ data: { ok: true } });
  res.cookies.set(ADMIN_COOKIE_NAME, "", { httpOnly: true, path: "/", maxAge: 0 });
  return res;
}
