import { NextResponse } from "next/server";
import { z } from "zod";
import { getAdminWriteError } from "../../../../../lib/admin";
import { prisma } from "../../../../../lib/prisma";

const chapterSchema = z.object({
  title: z.string().trim().min(1).max(120),
  titleUr: z.string().trim().max(120).nullable().optional(),
  titleAr: z.string().trim().min(1).max(120),
  description: z.string().trim().min(1).max(1000),
  descriptionUr: z.string().trim().max(1000).nullable().optional(),
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

// DELETE /api/admin/chapters/[id] — cascade-delete a chapter together with all
// of its lessons and any learner progress on those lessons. Because this is
// destructive, the caller must confirm by echoing the chapter's exact title in
// the body (`{ "confirm": "<title>" }`).
export async function DELETE(request: Request, { params }: Props) {
  const writeError = getAdminWriteError(request);
  if (writeError) return writeError;

  const chapter = await prisma.chapter.findUnique({
    where: { id: params.id },
    select: { id: true, title: true, lessons: { select: { id: true } } },
  });

  if (!chapter) {
    return NextResponse.json({ error: "Chapter not found.", code: "not_found" }, { status: 404 });
  }

  const body = (await request.json().catch(() => null)) as { confirm?: string } | null;
  if (!body || typeof body.confirm !== "string" || body.confirm.trim() !== chapter.title.trim()) {
    return NextResponse.json(
      {
        error: "To delete this chapter, confirm by sending its exact title.",
        code: "confirm_required",
      },
      { status: 400 },
    );
  }

  const lessonIds = chapter.lessons.map((l) => l.id);

  // Progress → Lesson has no ON DELETE cascade, so remove progress first, then
  // lessons, then the chapter — atomically.
  await prisma.$transaction([
    prisma.progress.deleteMany({ where: { lessonId: { in: lessonIds } } }),
    prisma.lesson.deleteMany({ where: { chapterId: params.id } }),
    prisma.chapter.delete({ where: { id: params.id } }),
  ]);

  return NextResponse.json({ data: { ok: true, deletedLessons: lessonIds.length } });
}
