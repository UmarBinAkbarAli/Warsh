import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { prisma } from "../../../../lib/prisma";

export async function POST(request: Request) {
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

  let payload: { sub: string; purpose: string; email: string };
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET!) as typeof payload;
  } catch {
    return NextResponse.json({ error: "Invalid or expired reset link", code: "unauthorized" }, { status: 401 });
  }

  if (payload.purpose !== "password-reset") {
    return NextResponse.json({ error: "Invalid reset token", code: "unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({ where: { id: payload.sub }, select: { id: true } });
  if (!user) {
    return NextResponse.json({ error: "User not found", code: "not_found" }, { status: 404 });
  }

  const newHash = bcrypt.hashSync(newPassword, 12);
  await prisma.user.update({ where: { id: user.id }, data: { passwordHash: newHash } });

  return NextResponse.json({ data: { success: true } });
}
