import { NextResponse } from "next/server";
import { MAX_SESSION_MS, signToken, verifyTokenAllowExpired } from "../../../../lib/auth";

export async function POST(request: Request) {
  const authHeader = request.headers.get("authorization");
  const token = authHeader?.replace("Bearer ", "").trim() ?? "";

  const payload = verifyTokenAllowExpired(token);
  if (!payload) {
    return NextResponse.json({ error: "Unauthorized", code: "unauthorized" }, { status: 401 });
  }

  // Tokens signed before this change have no sessionStart — treat their
  // original iat as the session start so old sessions still expire.
  const sessionStart = payload.sessionStart ?? payload.iat;
  if (sessionStart && Date.now() - sessionStart * 1000 > MAX_SESSION_MS) {
    return NextResponse.json({ error: "Session expired — please log in again.", code: "unauthorized" }, { status: 401 });
  }

  const newToken = signToken(payload.userId, { sessionStart, pwFingerprint: payload.pv });
  return NextResponse.json({ data: { token: newToken } });
}
