import { NextResponse } from "next/server";
import { z } from "zod";
import jwt from "jsonwebtoken";
import { getAdminWriteError } from "../../../../../../lib/admin";
import { prisma } from "../../../../../../lib/prisma";
import { passwordTokenFingerprint } from "../../../../../../lib/auth";
import { sendPasswordResetEmail } from "../../../../../../lib/email";

const schema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("grant_days"), days: z.number().int().min(1).max(3650) }),
  z.object({ action: z.literal("revoke") }),
  z.object({ action: z.literal("send_reset") }),
]);

interface Props {
  params: { id: string };
}

// POST /api/admin/users/[id]/actions — admin support actions on one user.
export async function POST(request: Request, { params }: Props) {
  const writeError = getAdminWriteError(request);
  if (writeError) return writeError;

  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid action payload.", code: "invalid_input", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const user = await prisma.user.findUnique({
    where: { id: params.id },
    select: { id: true, email: true, passwordHash: true, trialExpiresAt: true },
  });
  if (!user) {
    return NextResponse.json({ error: "User not found.", code: "not_found" }, { status: 404 });
  }

  const now = new Date();

  if (parsed.data.action === "grant_days") {
    // Extend the trial window from whichever is later — now or the current
    // expiry — so granting days never shortens existing access. Access is
    // driven by trialExpiresAt, matching how promo codes grant free time.
    const base = user.trialExpiresAt > now ? user.trialExpiresAt : now;
    const newExpiry = new Date(base.getTime() + parsed.data.days * 24 * 60 * 60 * 1000);
    await prisma.user.update({
      where: { id: user.id },
      data: {
        trialExpiresAt: newExpiry,
        // If they were fully expired, put them back on the trial lifecycle marker
        // so the app shows the trial banner rather than the locked state.
        subscriptionStatus: "trial",
      },
    });
    return NextResponse.json({ data: { ok: true, trialExpiresAt: newExpiry.toISOString() } });
  }

  if (parsed.data.action === "revoke") {
    // Fully lock out: expire the trial window and clear any manual paid period.
    await prisma.user.update({
      where: { id: user.id },
      data: { trialExpiresAt: now, subscriptionActiveUntil: null, subscriptionStatus: "expired" },
    });
    return NextResponse.json({ data: { ok: true } });
  }

  // send_reset — reuse the same stateless reset token + email as forgot-password.
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "JWT_SECRET not configured.", code: "server_error" }, { status: 500 });
  }
  const token = jwt.sign(
    { sub: user.id, purpose: "password-reset", email: user.email, pv: passwordTokenFingerprint(user.passwordHash) },
    secret,
    { expiresIn: "1h" },
  );
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://api.warsh.app";
  const resetUrl = `${appUrl}/reset-password?token=${token}`;

  try {
    await sendPasswordResetEmail(user.email, resetUrl);
    return NextResponse.json({ data: { ok: true, sentTo: user.email } });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to send reset email.", code: "email_failed" },
      { status: 502 },
    );
  }
}
