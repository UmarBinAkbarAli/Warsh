import { NextResponse } from "next/server";
import { prisma } from "../../../../../lib/prisma";
import { getUserIdFromRequest } from "../../../../../lib/auth";

interface Props {
  params: { id: string };
}

export async function GET(request: Request, { params }: Props) {
  const userId = getUserIdFromRequest(request);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized", code: "unauthorized" }, { status: 401 });
  }

  const chapter = await prisma.chapter.findUnique({
    where: { id: params.id },
    include: {
      lessons: {
        orderBy: { order: "asc" },
        select: { id: true, title: true, type: true, xpReward: true }
      }
    }
  });

  if (!chapter) {
    return NextResponse.json({ error: "Chapter not found", code: "not_found" }, { status: 404 });
  }

  const progress = await prisma.progress.findMany({ where: { userId, lesson: { chapterId: params.id }, completed: true } });
  const completedIds = new Set(progress.map((item: any) => item.lessonId));

  return NextResponse.json({
    data: {
      chapter: {
        ...chapter,
        lessons: chapter.lessons.map((lesson: any) => ({
          ...lesson,
          isCompleted: completedIds.has(lesson.id)
        }))
      }
    }
  });
}
