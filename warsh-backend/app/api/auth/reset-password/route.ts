import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { prisma } from "../../../../lib/prisma";
import { passwordTokenFingerprint, timingSafeStringEqual } from "../../../../lib/auth";
import { hit, clientKey } from "../../../../lib/rateLimit";

export async function POST(request: Request) {
  const rl = hit(clientKey(request, "reset-password"), 10, 60_000);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Too many attempts. Please try again shortly.", code: "too_many_requests" },
      { status: 429, headers: { "Retry-After": String(rl.retryAfterSeconds) } },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body", code: "bad_request" }, { status: 400 });
  }

  const { token, newPassword } = body as Record<string, unknown>;

  if (!token || typeof token !== "string") {
    return NextResponse.json({ error: "Reset token is required", code: "bad_request" }, { status: 400 });
  }
  if (!newPassword || typeof newPassword !== "string" || newPassword.length < 8) {
    return NextResponse.json({ error: "New password must be at least 8 characters", code: "bad_request" }, { status: 400 });
  }

  let payload: { sub: string; purpose: string; email: string; pv?: string };
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET!) as typeof payload;
  } catch {
    return NextResponse.json({ error: "Invalid or expired reset link", code: "unauthorized" }, { status: 401 });
  }

  if (payload.purpose !== "password-reset") {
    return NextResponse.json({ error: "Invalid reset token", code: "unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: payload.sub },
    select: { id: true, passwordHash: true },
  });
  if (!user) {
    return NextResponse.json({ error: "User not found", code: "not_found" }, { status: 404 });
  }

  // Single-use enforcement: the link carries a fingerprint of the password hash
  // it was issued against. If the password changed since (the link was already
  // used), reject the replay. Tokens issued before this feature (no `pv`) age
  // out within their 1h expiry.
  if (payload.pv && !timingSafeStringEqual(passwordTokenFingerprint(user.passwordHash), payload.pv)) {
    return NextResponse.json({ error: "This reset link has already been used", code: "unauthorized" }, { status: 401 });
  }

  const newHash = await bcrypt.hash(newPassword, 12);
  await prisma.user.update({ where: { id: user.id }, data: { passwordHash: newHash } });

  return NextResponse.json({ data: { success: true } });
}
