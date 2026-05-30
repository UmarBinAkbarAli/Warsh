import { NextResponse } from "next/server";
import { signToken, verifyTokenAllowExpired } from "../../../../lib/auth";

export async function POST(request: Request) {
  const authHeader = request.headers.get("authorization");
  const token = authHeader?.replace("Bearer ", "").trim() ?? "";

  const payload = verifyTokenAllowExpired(token);
  if (!payload) {
    return NextResponse.json({ error: "Unauthorized", code: "unauthorized" }, { status: 401 });
  }

  const newToken = signToken(payload.userId);
  return NextResponse.json({ data: { token: newToken } });
}
