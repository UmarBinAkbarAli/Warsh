import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { prisma } from "../../../../lib/prisma";
import { sendPasswordResetEmail } from "../../../../lib/email";
import { hit, clientKey } from "../../../../lib/rateLimit";
import { passwordTokenFingerprint } from "../../../../lib/auth";

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(request: Request) {
  const rl = hit(clientKey(request, "forgot-password"), 5, 60_000);
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

  const { email } = body as Record<string, unknown>;

  if (!email || typeof email !== "string" || !isValidEmail(email)) {
    return NextResponse.json({ error: "A valid email address is required", code: "bad_request" }, { status: 400 });
  }

  const user = await prisma.user.findFirst({
    where: { email: { equals: email.trim(), mode: "insensitive" } },
    select: { id: true, passwordHash: true },
  });

  if (user) {
    const secret = process.env.JWT_SECRET!;
    // `pv` binds the link to the CURRENT password hash, making it single-use:
    // once the password changes, the fingerprint no longer matches and the
    // link can't be replayed within its 1h validity window.
    const token = jwt.sign(
      { sub: user.id, purpose: "password-reset", email, pv: passwordTokenFingerprint(user.passwordHash) },
      secret,
      { expiresIn: "1h" }
    );

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://api.warsh.app";
    const resetUrl = `${appUrl}/reset-password?token=${token}`;

    // Fire and forget — do not block response on email delivery
    sendPasswordResetEmail(email, resetUrl).catch((err) =>
      console.error("[forgot-password] Email send failed:", err)
    );
  }

  // Always return 200 — do not reveal whether email is registered
  return NextResponse.json({
    data: { message: "If that email is registered, a reset link has been sent." },
  });
}
