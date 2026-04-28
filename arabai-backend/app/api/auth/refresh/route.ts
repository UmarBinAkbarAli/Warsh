import { NextResponse } from "next/server";
import { getUserIdFromRequest, signToken } from "../../../../lib/auth";

export async function POST(request: Request) {
  const userId = getUserIdFromRequest(request);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized", code: "unauthorized" }, { status: 401 });
  }

  const token = signToken(userId);
  return NextResponse.json({ data: { token } });
}
