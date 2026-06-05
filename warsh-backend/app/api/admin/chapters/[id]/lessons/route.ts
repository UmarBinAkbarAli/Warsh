import { NextResponse } from "next/server";
import { z } from "zod";
import { getAdminWriteError } from "../../../../../../lib/admin";
import { prisma } from "../../../../../../lib/prisma";

const lessonCreateSchema = z.object({
  title: z.string().trim().min(1).max(140),
  titleAr: z.string().trim().min(1).max(140),
  template: z.enum(["STANDARD", "SPOKEN_PHRASES", "REVIEW", "VERB_PATTERN"]).default("STANDARD"),
  xpReward: z.number().int().min(0).max(500).default(10),
});

interface Props {
  params: { id: string };
}

export async function POST(request: Request, { params }: Props) {
  const writeError = getAdminWriteError(request);
  if (writeError) return writeError;

  const body = await request.json();
  const parsed = lessonCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid lesson payload.", code: "invalid_input", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const chapter = await prisma.chapter.findUnique({
    where: { id: params.id },
    include: { lessons: { orderBy: { order: "desc" }, take: 1, select: { order: true } } },
  });

  if (!chapter) {
    return NextResponse.json({ error: "Chapter not found.", code: "not_found" }, { status: 404 });
  }

  const nextOrder = (chapter.lessons[0]?.order ?? 0) + 1;

  const lesson = await prisma.lesson.create({
    data: {
      chapterId: params.id,
      order: nextOrder,
      title: parsed.data.title,
      titleAr: parsed.data.titleAr,
      template: parsed.data.template,
      xpReward: parsed.data.xpReward,
      content: {
        schema_version: "1.0",
        template: parsed.data.template,
        hook: null,
        discover_cards: [],
        exercises: [],
        reveal: null,
        close: null,
      },
    },
  });

  return NextResponse.json({ data: { lesson } }, { status: 201 });
}
