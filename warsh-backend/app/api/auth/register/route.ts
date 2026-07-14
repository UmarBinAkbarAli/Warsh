import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "../../../../lib/prisma";
import { signToken, passwordTokenFingerprint } from "../../../../lib/auth";
import { hit, clientKey } from "../../../../lib/rateLimit";
import { resolveRegistrationLanguages } from "../../../../lib/language";

export async function POST(request: Request) {
  const rl = hit(clientKey(request, "register"), 5, 60_000);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Too many attempts. Please try again shortly.", code: "too_many_requests" },
      { status: 429, headers: { "Retry-After": String(rl.retryAfterSeconds) } },
    );
  }

  const body = await request.json();
  const { email, password, name, nativeLanguage, translationLanguage, goal, dailyGoalMinutes } = body;

  if (!email || !password || !name) {
    return NextResponse.json({ error: "Missing required fields", code: "bad_request" }, { status: 400 });
  }

  if (typeof password !== "string" || password.length < 8) {
    return NextResponse.json({ error: "Password must be at least 8 characters", code: "bad_request" }, { status: 400 });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return NextResponse.json({ error: "Invalid email address", code: "bad_request" }, { status: 400 });
  }

  // Normalize so Umar@x.com and umar@x.com can't become two accounts. The
  // insensitive check also catches pre-normalization rows stored mixed-case.
  const normalizedEmail = String(email).trim().toLowerCase();
  const existing = await prisma.user.findFirst({
    where: { email: { equals: normalizedEmail, mode: "insensitive" } },
    select: { id: true },
  });
  if (existing) {
    return NextResponse.json({ error: "Email already registered", code: "conflict" }, { status: 409 });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const validGoalMinutes = [5, 10, 15, 30];
  // Older clients may omit translationLanguage: fall back to the submitted
  // nativeLanguage, then "ur". See resolveRegistrationLanguages.
  const languages = resolveRegistrationLanguages({ nativeLanguage, translationLanguage });
  const user = await prisma.user.create({
    data: {
      email: normalizedEmail,
      passwordHash,
      name,
      nativeLanguage: languages.nativeLanguage,
      translationLanguage: languages.translationLanguage,
      goal: goal ?? "QURAN",
      dailyGoalMinutes: validGoalMinutes.includes(dailyGoalMinutes) ? dailyGoalMinutes : 10,
    }
  });

  const token = signToken(user.id, { pwFingerprint: passwordTokenFingerprint(passwordHash) });

  return NextResponse.json(
    {
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          nativeLanguage: user.nativeLanguage,
          translationLanguage: user.translationLanguage,
          goal: user.goal,
          level: user.level,
          xp: user.xp,
          placementType: user.placementType,
          startingChapterOrder: user.startingChapterOrder,
        },
        token,
      },
    },
    { status: 201 }
  );
}
