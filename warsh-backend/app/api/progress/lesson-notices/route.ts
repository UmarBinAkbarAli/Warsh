import { NextResponse } from "next/server";
import { getUserIdFromRequest } from "../../../../lib/auth";
import { prisma } from "../../../../lib/prisma";

/**
 * Marks the Learn tab's "new / updated lessons" notice as seen, whether the
 * learner opened it or chose Later. Anything added or changed after this
 * moment shows the notice again.
 */
export async function POST(request: Request) {
  const userId = await getUserIdFromRequest(request);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized", code: "unauthorized" }, { status: 401 });
  }

  const seenAt = new Date();
  await prisma.user.update({ where: { id: userId }, data: { lessonNoticesSeenAt: seenAt } });
  return NextResponse.json({ data: { seenAt: seenAt.toISOString() } });
}
