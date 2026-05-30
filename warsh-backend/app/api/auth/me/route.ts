import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { getUserIdFromRequest } from "../../../../lib/auth";

export async function GET(request: Request) {
  const userId = getUserIdFromRequest(request);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized", code: "unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    select: {
      id: true,
      email: true,
      name: true,
      nativeLanguage: true,
      goal: true,
      xp: true,
      level: true,
      placementType: true,
      startingChapterOrder: true,
    },
    where: { id: userId }
  });

  if (!user) {
    return NextResponse.json({ error: "Unauthorized", code: "unauthorized" }, { status: 401 });
  }

  return NextResponse.json({ data: { user } });
}
