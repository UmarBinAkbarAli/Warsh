import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { prisma } from "../../../../lib/prisma";

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

async function sendResetEmail(toEmail: string, resetUrl: string): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.SMTP_FROM_EMAIL ?? "noreply@warsh.app";

  if (!apiKey) {
    console.warn("[forgot-password] RESEND_API_KEY not set — skipping email send");
    return;
  }

  const html = `
    <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 32px;">
      <h2 style="color: #1a1a2e; font-size: 24px; margin-bottom: 8px;">Reset your password</h2>
      <p style="color: #6b5e52; font-size: 16px; line-height: 1.6; margin-bottom: 24px;">
        As-salamu alaykum,<br><br>
        We received a request to reset your Warsh password. Click the button below to set a new password.
        This link will expire in <strong>1 hour</strong>.
      </p>
      <a href="${resetUrl}" style="display: inline-block; background: #C8972B; color: #fff; text-decoration: none;
         padding: 14px 28px; border-radius: 8px; font-weight: 700; font-size: 16px;">
        Reset password
      </a>
      <p style="color: #8a7060; font-size: 13px; margin-top: 24px; line-height: 1.5;">
        If you did not request this, you can safely ignore this email — your password will not be changed.
      </p>
    </div>
  `;

  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: `Warsh <${fromEmail}>`,
      to: [toEmail],
      subject: "Reset your Warsh password",
      html,
    }),
  });
}

export async function POST(request: Request) {
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

  const user = await prisma.user.findUnique({ where: { email }, select: { id: true } });

  if (user) {
    const secret = process.env.JWT_SECRET!;
    const token = jwt.sign(
      { sub: user.id, purpose: "password-reset", email },
      secret,
      { expiresIn: "1h" }
    );

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://warsh-backend.vercel.app";
    const resetUrl = `${appUrl}/reset-password?token=${token}`;

    // Fire and forget — do not block response on email delivery
    sendResetEmail(email, resetUrl).catch((err) =>
      console.error("[forgot-password] Email send failed:", err)
    );
  }

  // Always return 200 — do not reveal whether email is registered
  return NextResponse.json({
    data: { message: "If that email is registered, a reset link has been sent." },
  });
}
