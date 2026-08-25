import { NextResponse } from "next/server";
import { z } from "zod";
import { timingSafeStringEqual } from "../../../../lib/auth";
import { ADMIN_COOKIE_NAME, adminCookieVerifier } from "../../../../lib/admin";
import { hit, clientKey } from "../../../../lib/rateLimit";

const bodySchema = z.object({ token: z.string().min(1).max(500) });

// POST /api/admin/session — exchange the admin token for a session cookie.
export async function POST(request: Request) {
  // Deliberately tighter than user login: ADMIN_DASHBOARD_TOKEN is a single
  // shared secret with no second factor guarding every admin route, so
  // legitimate use is a handful of attempts a day, not a handful a minute.
  const rl = await hit(clientKey(request, "admin-session"), 5, 15 * 60_000);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Too many attempts. Please try again later.", code: "too_many_requests" },
      { status: 429, headers: { "Retry-After": String(rl.retryAfterSeconds) } },
    );
  }

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
    console.warn("[admin-session] failed admin login from", clientKey(request, "admin-session"));
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
