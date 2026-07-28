import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { prisma } from "../../../../../lib/prisma";
import {
  passwordTokenFingerprint,
  signToken,
  verifyGoogleLinkToken,
} from "../../../../../lib/auth";
import { hit, clientKey } from "../../../../../lib/rateLimit";
import { toAuthUser } from "../../../../../lib/authUser";

export async function POST(request: Request) {
  const rl = hit(clientKey(request, "google-link"), 5, 60_000);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Too many attempts. Please try again shortly.", code: "too_many_requests" },
      { status: 429, headers: { "Retry-After": String(rl.retryAfterSeconds) } },
    );
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body", code: "bad_request" }, { status: 400 });
  }

  const linkToken = typeof body.linkToken === "string" ? body.linkToken : "";
  const password = typeof body.password === "string" ? body.password : "";
  const payload = verifyGoogleLinkToken(linkToken);
  if (!payload || !password) {
    return NextResponse.json(
      { error: "Google link confirmation is invalid or expired.", code: "unauthorized" },
      { status: 401 },
    );
  }

  const user = await prisma.user.findFirst({
    where: { email: { equals: payload.email, mode: "insensitive" } },
  });
  if (!user || !user.hasPassword || !(await bcrypt.compare(password, user.passwordHash))) {
    return NextResponse.json(
      { error: "Warsh password is incorrect.", code: "unauthorized" },
      { status: 401 },
    );
  }

  const subjectOwner = await prisma.user.findUnique({
    where: { googleSubject: payload.googleSubject },
    select: { id: true },
  });
  if (subjectOwner && subjectOwner.id !== user.id) {
    return NextResponse.json(
      { error: "This Google account is already linked to another Warsh account.", code: "conflict" },
      { status: 409 },
    );
  }

  const linkedUser = await prisma.user.update({
    where: { id: user.id },
    data: {
      googleSubject: payload.googleSubject,
      googleEmail: payload.email,
      googleLinkedAt: new Date(),
    },
  });

  return NextResponse.json({
    data: {
      user: toAuthUser(linkedUser),
      token: signToken(linkedUser.id, {
        pwFingerprint: passwordTokenFingerprint(linkedUser.passwordHash),
      }),
      created: false,
    },
  });
}
