import { NextResponse } from "next/server";
import { prisma } from "../../../../../lib/prisma";
import { getUserIdFromRequest } from "../../../../../lib/auth";
import { getUserCourseState } from "../../../../../lib/course";

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
        select: { id: true, title: true, titleAr: true, type: true, xpReward: true }
      }
    }
  });

  if (!chapter) {
    return NextResponse.json({ error: "Chapter not found", code: "not_found" }, { status: 404 });
  }

  const { chapterStateById, completedLessonIds } = await getUserCourseState(userId);
  const chapterState = chapterStateById.get(params.id);

  if (chapterState?.isLocked) {
    return NextResponse.json({ error: "Chapter is locked", code: "chapter_locked" }, { status: 403 });
  }

  return NextResponse.json({
    data: {
      chapter: {
        ...chapter,
        isLocked: false,
        isCompleted: chapterState?.isCompleted ?? false,
        completedLessonCount: chapterState?.completedLessonCount ?? 0,
        lessons: chapter.lessons.map((lesson: any) => ({
          ...lesson,
          isCompleted: completedLessonIds.has(lesson.id)
        }))
      }
    }
  });
}
