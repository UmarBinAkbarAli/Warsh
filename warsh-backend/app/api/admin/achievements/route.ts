import { NextResponse } from "next/server";
import { z } from "zod";
import { getAdminReadError, getAdminWriteError } from "../../../../lib/admin";
import { prisma } from "../../../../lib/prisma";

const achievementSchema = z.object({
  key: z.string().trim().min(1).max(80).regex(/^[a-z0-9_]+$/i, "Key may contain only letters, numbers, and underscores."),
  title: z.string().trim().min(1).max(120),
  description: z.string().trim().min(1).max(400),
  icon: z.string().trim().min(1).max(80),
  xpReward: z.number().int().min(0).max(10000),
});

// GET /api/admin/achievements — list all with unlock counts.
export async function GET(request: Request) {
  const readError = getAdminReadError(request);
  if (readError) return readError;

  const achievements = await prisma.achievement.findMany({
    orderBy: { xpReward: "asc" },
    include: { _count: { select: { users: true } } },
  });

  return NextResponse.json({
    data: achievements.map((a) => ({
      id: a.id,
      key: a.key,
      title: a.title,
      description: a.description,
      icon: a.icon,
      xpReward: a.xpReward,
      status: a.status,
      publishedAt: a.publishedAt,
      unlockedBy: a._count.users,
    })),
  });
}

// POST /api/admin/achievements — create.
export async function POST(request: Request) {
  const writeError = getAdminWriteError(request);
  if (writeError) return writeError;

  const parsed = achievementSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid achievement payload.", code: "invalid_input", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const existing = await prisma.achievement.findUnique({ where: { key: parsed.data.key } });
  if (existing) {
    return NextResponse.json({ error: `Key "${parsed.data.key}" is already used.`, code: "duplicate_key" }, { status: 409 });
  }

  const achievement = await prisma.achievement.create({ data: parsed.data });
  return NextResponse.json({ data: { achievement } }, { status: 201 });
}
