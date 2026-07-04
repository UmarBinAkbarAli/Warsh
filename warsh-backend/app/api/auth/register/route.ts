import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "../../../../lib/prisma";
import { signToken } from "../../../../lib/auth";

export async function POST(request: Request) {
  const body = await request.json();
  const { email, password, name, nativeLanguage, goal, dailyGoalMinutes } = body;

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

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: "Email already registered", code: "conflict" }, { status: 409 });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const validGoalMinutes = [5, 10, 15, 30];
  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      name,
      nativeLanguage: nativeLanguage ?? "ur",
      goal: goal ?? "QURAN",
      dailyGoalMinutes: validGoalMinutes.includes(dailyGoalMinutes) ? dailyGoalMinutes : 10,
    }
  });

  const token = signToken(user.id);

  return NextResponse.json(
    {
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          nativeLanguage: user.nativeLanguage,
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
