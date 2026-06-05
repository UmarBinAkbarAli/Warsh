import { NextResponse } from "next/server";
import { getAdminWriteError } from "../../../../../../lib/admin";
import { prisma } from "../../../../../../lib/prisma";

interface Props {
  params: { id: string };
}

export async function DELETE(request: Request, { params }: Props) {
  const writeError = getAdminWriteError(request);
  if (writeError) return writeError;

  const lesson = await prisma.lesson.findUnique({
    where: { id: params.id },
    include: { chapter: { include: { lessons: { select: { id: true } } } } },
  });

  if (!lesson) {
    return NextResponse.json({ error: "Lesson not found.", code: "not_found" }, { status: 404 });
  }

  // Block deletion if this is the last lesson in the chapter
  if (lesson.chapter.lessons.length <= 1) {
    return NextResponse.json(
      { error: "A chapter must have at least one lesson.", code: "last_lesson" },
      { status: 400 },
    );
  }

  // Also check for any learner progress on this lesson
  const progressCount = await prisma.progress.count({ where: { lessonId: params.id } });
  if (progressCount > 0) {
    // Soft-delete consideration: for now, just warn
    // In future could archive instead of hard-delete
  }

  await prisma.lesson.delete({ where: { id: params.id } });

  return NextResponse.json({ data: { deleted: true, lessonId: params.id } });
}