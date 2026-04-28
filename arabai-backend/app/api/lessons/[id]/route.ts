import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { getUserIdFromRequest } from "../../../../lib/auth";

interface Props {
  params: { id: string };
}

export async function GET(request: Request, { params }: Props) {
  const userId = getUserIdFromRequest(request);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized", code: "unauthorized" }, { status: 401 });
  }

  const lesson = await prisma.lesson.findUnique({
    where: { id: params.id },
    select: { id: true, title: true, type: true, xpReward: true, content: true }
  });

  if (!lesson) {
    return NextResponse.json({ error: "Lesson not found", code: "not_found" }, { status: 404 });
  }

  const progress = await prisma.progress.findUnique({ where: { userId_lessonId: { userId, lessonId: lesson.id } } });

  return NextResponse.json({ data: { lesson: { ...lesson, isCompleted: progress?.completed ?? false } } });
}
