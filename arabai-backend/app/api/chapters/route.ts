import { NextResponse } from "next/server";
import { getUserIdFromRequest } from "../../../lib/auth";
import { getUserCourseState } from "../../../lib/course";

export async function GET(request: Request) {
  const userId = getUserIdFromRequest(request);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized", code: "unauthorized" }, { status: 401 });
  }

  const { chapters, chapterStateById, completedLessonIds } = await getUserCourseState(userId);

  const chapterList = chapters.map((chapter) => {
    const chapterState = chapterStateById.get(chapter.id);
    return {
      ...chapter,
      isLocked: chapterState?.isLocked ?? true,
      isCompleted: chapterState?.isCompleted ?? false,
      completedLessonCount: chapterState?.completedLessonCount ?? 0,
      lessons: chapter.lessons.map((lesson) => ({
        ...lesson,
        isCompleted: completedLessonIds.has(lesson.id),
      })),
    };
  });

  return NextResponse.json({ data: { chapters: chapterList } });
}
