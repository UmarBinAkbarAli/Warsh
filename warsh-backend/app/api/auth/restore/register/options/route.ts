import { NextResponse } from "next/server";
import { prisma } from "../../../../../../lib/prisma";
import { getUserIdFromRequest } from "../../../../../../lib/auth";
import { createRegistrationOptions, pruneExpiredChallenges } from "../../../../../../lib/restoreCredential";

// Step 1 of creating an Android restore key: the signed-in device asks for
// WebAuthn creation options bound to this account and a one-time challenge.
export async function POST(request: Request) {
  const userId = await getUserIdFromRequest(request);
  if (!userId) return NextResponse.json({ error: "Unauthorized", code: "unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, name: true },
  });
  if (!user) return NextResponse.json({ error: "Unauthorized", code: "unauthorized" }, { status: 401 });

  const { challengeId, options } = await createRegistrationOptions(user);
  void pruneExpiredChallenges().catch(() => {});
  return NextResponse.json({ data: { challengeId, options } });
}
