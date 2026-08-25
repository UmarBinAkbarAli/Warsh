import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import {
  MAX_SESSION_MS,
  passwordTokenFingerprint,
  signToken,
  timingSafeStringEqual,
  verifyTokenAllowExpired,
} from "../../../../lib/auth";

export async function POST(request: Request) {
  const authHeader = request.headers.get("authorization");
  const token = authHeader?.replace("Bearer ", "").trim() ?? "";

  const payload = verifyTokenAllowExpired(token);
  if (!payload?.userId) {
    return NextResponse.json({ error: "Unauthorized", code: "unauthorized" }, { status: 401 });
  }

  // Tokens signed before this change have no sessionStart — treat their
  // original iat as the session start so old sessions still expire.
  const sessionStart = payload.sessionStart ?? payload.iat;
  if (sessionStart && Date.now() - sessionStart * 1000 > MAX_SESSION_MS) {
    return NextResponse.json({ error: "Session expired — please log in again.", code: "unauthorized" }, { status: 401 });
  }

  // Refresh must read the CURRENT password hash rather than trusting the token.
  // This is also how a deleted account stops being refreshable.
  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    select: { passwordHash: true },
  });
  if (!user) {
    return NextResponse.json({ error: "Unauthorized", code: "unauthorized" }, { status: 401 });
  }

  const currentFingerprint = passwordTokenFingerprint(user.passwordHash);

  // A token that carries a fingerprint must still match the live hash — a
  // password change/reset invalidates it here, not just on protected routes.
  if (payload.pv && !timingSafeStringEqual(currentFingerprint, payload.pv)) {
    return NextResponse.json({ error: "Session expired — please log in again.", code: "unauthorized" }, { status: 401 });
  }

  // Tokens issued before the `pv` feature carry none. Previously the refreshed
  // token inherited that `undefined` and stayed exempt from password-change
  // invalidation for the rest of the 90-day window. Minting with the current
  // fingerprint upgrades the session instead of perpetuating the exemption.
  const newToken = signToken(payload.userId, { sessionStart, pwFingerprint: currentFingerprint });
  return NextResponse.json({ data: { token: newToken } });
}
