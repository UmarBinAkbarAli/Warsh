import { NextResponse } from "next/server";
import { z } from "zod";
import { getAdminWriteError } from "../../../../lib/admin";
import { prisma } from "../../../../lib/prisma";

const chapterCreateSchema = z.object({
  title: z.string().trim().min(1).max(120),
  titleUr: z.string().trim().max(120).nullable().optional(),
  titleAr: z.string().trim().min(1).max(120),
  description: z.string().trim().min(1).max(1000),
  descriptionUr: z.string().trim().max(1000).nullable().optional(),
  worldMapX: z.number().finite().min(0).max(1).optional(),
  worldMapY: z.number().finite().min(0).max(1).optional(),
  imageUrl: z.string().trim().url().max(500).nullable().optional(),
  isLocked: z.boolean().optional(),
});

// POST /api/admin/chapters — create a new chapter at the next available order.
export async function POST(request: Request) {
  const writeError = getAdminWriteError(request);
  if (writeError) return writeError;

  const parsed = chapterCreateSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid chapter payload.", code: "invalid_input", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const last = await prisma.chapter.findFirst({
    orderBy: { order: "desc" },
    select: { order: true },
  });
  const nextOrder = (last?.order ?? 0) + 1;

  const chapter = await prisma.chapter.create({
    data: {
      order: nextOrder,
      title: parsed.data.title,
      titleUr: parsed.data.titleUr ?? null,
      titleAr: parsed.data.titleAr,
      description: parsed.data.description,
      descriptionUr: parsed.data.descriptionUr ?? null,
      worldMapX: parsed.data.worldMapX ?? 0.5,
      worldMapY: parsed.data.worldMapY ?? 0.5,
      imageUrl: parsed.data.imageUrl ?? null,
      isLocked: parsed.data.isLocked ?? true,
    },
    include: { lessons: true },
  });

  return NextResponse.json({ data: { chapter } }, { status: 201 });
}
