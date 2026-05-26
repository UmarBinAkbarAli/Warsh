import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";

// Basic email format check — no external dependency needed
function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
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

  // Check if user exists (result is intentionally not exposed in the response)
  const user = await prisma.user.findUnique({ where: { email }, select: { id: true } });

  if (user) {
    // TODO: Send password reset email via email provider when configured (e.g. Resend / SendGrid).
    //       Generate a signed time-limited token, store it in a PasswordResetToken table, and
    //       include the link in the email body.
    console.log(`[forgot-password] Reset requested for user ${user.id}`);
  }

  // Always return 200 — security: do not reveal whether the email is registered
  return NextResponse.json({
    data: {
      message: "If that email is registered, a reset link has been sent.",
    },
  });
}
