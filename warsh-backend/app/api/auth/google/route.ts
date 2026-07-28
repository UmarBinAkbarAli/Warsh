import crypto from "crypto";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import {
  passwordTokenFingerprint,
  signGoogleLinkToken,
  signToken,
} from "../../../../lib/auth";
import { verifyGoogleIdToken } from "../../../../lib/googleAuth";
import { hit, clientKey } from "../../../../lib/rateLimit";
import { resolveRegistrationLanguages } from "../../../../lib/language";
import { toAuthUser } from "../../../../lib/authUser";

export async function POST(request: Request) {
  const rl = hit(clientKey(request, "google-auth"), 10, 60_000);
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

  const idToken = typeof body.idToken === "string" ? body.idToken : "";
  if (!idToken) {
    return NextResponse.json({ error: "Google ID token is required", code: "bad_request" }, { status: 400 });
  }

  let identity;
  try {
    identity = await verifyGoogleIdToken(idToken);
  } catch (error) {
    console.error("[google-auth] ID token verification failed:", error);
    return NextResponse.json(
      { error: "Google sign-in could not be verified. Please try again.", code: "unauthorized" },
      { status: 401 },
    );
  }

  const linkedUser = await prisma.user.findUnique({
    where: { googleSubject: identity.subject },
  });
  if (linkedUser) {
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

  const emailUser = await prisma.user.findFirst({
    where: { email: { equals: identity.email, mode: "insensitive" } },
  });
  if (emailUser) {
    if (emailUser.googleSubject && emailUser.googleSubject !== identity.subject) {
      return NextResponse.json(
        {
          error: "This Warsh account is already linked to another Google account.",
          code: "google_account_conflict",
        },
        { status: 409 },
      );
    }

    return NextResponse.json(
      {
        error: "Confirm your Warsh password once to link Google securely.",
        code: "google_link_required",
        email: emailUser.email,
        linkToken: signGoogleLinkToken({
          googleSubject: identity.subject,
          email: identity.email,
          name: identity.name,
        }),
      },
      { status: 409 },
    );
  }

  const validGoalMinutes = [5, 10, 15, 30];
  const languages = resolveRegistrationLanguages({
    nativeLanguage: body.nativeLanguage,
    translationLanguage: body.translationLanguage,
  });
  const passwordHash = await bcrypt.hash(crypto.randomBytes(32).toString("hex"), 12);
  const user = await prisma.user.create({
    data: {
      email: identity.email,
      passwordHash,
      hasPassword: false,
      googleSubject: identity.subject,
      googleEmail: identity.email,
      googleLinkedAt: new Date(),
      name: identity.name,
      nativeLanguage: languages.nativeLanguage,
      translationLanguage: languages.translationLanguage,
      goal: body.goal === "TRAVEL" || body.goal === "STUDY" ? body.goal : "QURAN",
      dailyGoalMinutes: validGoalMinutes.includes(Number(body.dailyGoalMinutes))
        ? Number(body.dailyGoalMinutes)
        : 10,
    },
  });

  return NextResponse.json(
    {
      data: {
        user: toAuthUser(user),
        token: signToken(user.id, {
          pwFingerprint: passwordTokenFingerprint(user.passwordHash),
        }),
        created: true,
      },
    },
    { status: 201 },
  );
}
