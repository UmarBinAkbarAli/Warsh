import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "../../../../lib/prisma";
import { signToken } from "../../../../lib/auth";

export async function POST(request: Request) {
  const body = await request.json();
  const { email, password, name, nativeLanguage, goal } = body;

  if (!email || !password || !name) {
    return NextResponse.json({ error: "Missing required fields", code: "bad_request" }, { status: 400 });
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: "Email already registered", code: "conflict" }, { status: 409 });
  }

  const passwordHash = bcrypt.hashSync(password, 10);
  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      name,
      nativeLanguage: nativeLanguage ?? "ur",
      goal: goal ?? "QURAN"
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
        },
        token,
      },
    },
    { status: 201 }
  );
}
