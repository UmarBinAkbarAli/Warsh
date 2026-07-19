import { NextResponse } from "next/server";
import { z } from "zod";
import { getAdminWriteError } from "../../../../../lib/admin";
import { prisma } from "../../../../../lib/prisma";

const updateSchema = z.object({
  key: z.string().trim().min(1).max(80).regex(/^[a-z0-9_]+$/i),
  title: z.string().trim().min(1).max(120),
  description: z.string().trim().min(1).max(400),
  icon: z.string().trim().min(1).max(80),
  xpReward: z.number().int().min(0).max(10000),
});

interface Props {
  params: { id: string };
}

export async function PATCH(request: Request, { params }: Props) {
  const writeError = getAdminWriteError(request);
  if (writeError) return writeError;

  const parsed = updateSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid achievement payload.", code: "invalid_input", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  // Guard against colliding with another achievement's key.
  const clash = await prisma.achievement.findFirst({
    where: { key: parsed.data.key, id: { not: params.id } },
    select: { id: true },
  });
  if (clash) {
    return NextResponse.json({ error: `Key "${parsed.data.key}" is already used.`, code: "duplicate_key" }, { status: 409 });
  }

  const achievement = await prisma.achievement.update({ where: { id: params.id }, data: parsed.data });
  return NextResponse.json({ data: { achievement } });
}

// DELETE — removes the achievement and any user unlocks of it (cascade in a txn,
// since UserAchievement has no ON DELETE cascade to Achievement).
export async function DELETE(request: Request, { params }: Props) {
  const writeError = getAdminWriteError(request);
  if (writeError) return writeError;

  const found = await prisma.achievement.findUnique({ where: { id: params.id }, select: { id: true } });
  if (!found) {
    return NextResponse.json({ error: "Achievement not found.", code: "not_found" }, { status: 404 });
  }

  await prisma.$transaction([
    prisma.userAchievement.deleteMany({ where: { achievementId: params.id } }),
    prisma.achievement.delete({ where: { id: params.id } }),
  ]);

  return NextResponse.json({ data: { ok: true } });
}
