import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "../../../../lib/prisma";
import { getUserIdFromRequest, signToken, passwordTokenFingerprint } from "../../../../lib/auth";
import { sendPasswordChangedEmail } from "../../../../lib/email";

export async function POST(request: Request) {
  const userId = await getUserIdFromRequest(request);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized", code: "unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { currentPassword, newPassword } = body;

  if (!currentPassword || !newPassword) {
    return NextResponse.json({ error: "currentPassword and newPassword are required", code: "bad_request" }, { status: 400 });
  }

  if (typeof newPassword !== "string" || newPassword.length < 8) {
    return NextResponse.json({ error: "New password must be at least 8 characters", code: "bad_request" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    return NextResponse.json({ error: "Unauthorized", code: "unauthorized" }, { status: 401 });
  }

  if (!(await bcrypt.compare(currentPassword, user.passwordHash))) {
    return NextResponse.json({ error: "Current password is incorrect", code: "unauthorized" }, { status: 401 });
  }

  const newHash = await bcrypt.hash(newPassword, 12);
  await prisma.user.update({ where: { id: userId }, data: { passwordHash: newHash } });

  // Changing the password invalidates every previously-issued token (their `pv`
  // fingerprint no longer matches). Issue a fresh token so the current device
  // stays signed in while all other sessions are logged out.
  const token = signToken(userId, { pwFingerprint: passwordTokenFingerprint(newHash) });

  // Fire and forget — notify user their password was changed
  sendPasswordChangedEmail(user.email).catch((err) =>
    console.error("[change-password] Confirmation email failed:", err)
  );

  return NextResponse.json({ data: { success: true, token } });
}
