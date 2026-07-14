import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "../../../../lib/prisma";
import { signToken, passwordTokenFingerprint } from "../../../../lib/auth";
import { hit, clientKey } from "../../../../lib/rateLimit";

// A fixed valid bcrypt hash used only to spend comparable CPU time when the
// email is not found, so login timing can't be used to enumerate accounts.
const DUMMY_PASSWORD_HASH = "$2a$10$6uCUqZ.9hdkxNsQ5GHpRk.IYbw5AKJuukJXiAi3EULbdZSzDs0zAC";

export async function POST(request: Request) {
  const rl = hit(clientKey(request, "login"), 10, 60_000);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Too many attempts. Please try again shortly.", code: "too_many_requests" },
      { status: 429, headers: { "Retry-After": String(rl.retryAfterSeconds) } },
    );
  }

  const body = await request.json();
  const { email, password } = body;

  if (!email || !password) {
    return NextResponse.json({ error: "Missing email or password", code: "bad_request" }, { status: 400 });
  }

  // Case-insensitive lookup: new accounts store lowercase emails, but accounts
  // created before normalization may be mixed-case.
  const user = await prisma.user.findFirst({
    where: { email: { equals: String(email).trim(), mode: "insensitive" } },
  });
  // Always run a bcrypt comparison — even when the user does not exist — so the
  // response time does not reveal whether an email is registered.
  const compareHash = user?.passwordHash ?? DUMMY_PASSWORD_HASH;
  const passwordMatches = await bcrypt.compare(password, compareHash);
  if (!user || !passwordMatches) {
    return NextResponse.json({ error: "Invalid credentials", code: "unauthorized" }, { status: 401 });
  }

  const token = signToken(user.id, { pwFingerprint: passwordTokenFingerprint(user.passwordHash) });
  return NextResponse.json({
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
  });
}
