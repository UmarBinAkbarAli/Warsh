import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";
import { getUserIdFromRequest } from "../../../lib/auth";

export async function GET(request: Request) {
  const userId = await getUserIdFromRequest(request);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized", code: "unauthorized" }, { status: 401 });
  }

  const streak = await prisma.streak.findUnique({ where: { userId } });
  return NextResponse.json({ data: { currentStreak: streak?.currentStreak ?? 0, longestStreak: streak?.longestStreak ?? 0, lastActiveDate: streak?.lastActiveDate ?? null } });
}
