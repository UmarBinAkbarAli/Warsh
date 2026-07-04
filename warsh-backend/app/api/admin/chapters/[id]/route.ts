import { NextResponse } from "next/server";
import { z } from "zod";
import { getAdminWriteError } from "../../../../../lib/admin";
import { prisma } from "../../../../../lib/prisma";

const chapterSchema = z.object({
  title: z.string().trim().min(1).max(120),
  titleAr: z.string().trim().min(1).max(120),
  description: z.string().trim().min(1).max(1000),
  worldMapX: z.number().finite().min(0).max(1),
  worldMapY: z.number().finite().min(0).max(1),
  imageUrl: z.string().trim().url().max(500).nullable().optional(),
  isLocked: z.boolean(),
});

interface Props {
  params: { id: string };
}

export async function PATCH(request: Request, { params }: Props) {
  const writeError = getAdminWriteError(request);
  if (writeError) return writeError;

  const parsed = chapterSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid chapter payload.", code: "invalid_input", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const chapter = await prisma.chapter.update({
    where: { id: params.id },
    data: parsed.data,
    include: {
      lessons: {
        orderBy: { order: "asc" },
      },
    },
  });

  return NextResponse.json({ data: { chapter } });
}
