import { NextResponse } from "next/server";
import { getUserIdFromRequest } from "../../../lib/auth";
import { DEV_UNLOCK_ALL, getUserCourseState } from "../../../lib/course";
import { buildLessonFlags, buildLessonNotices } from "../../../lib/lessonNotices";
import { prisma } from "../../../lib/prisma";

export async function GET(request: Request) {
  const userId = await getUserIdFromRequest(request);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized", code: "unauthorized" }, { status: 401 });
  }

  const [courseState, user] = await Promise.all([
    getUserCourseState(userId),
    prisma.user.findUnique({ where: { id: userId }, select: { lessonNoticesSeenAt: true } }),
  ]);
  const { chapters, chapterStateById, completedLessonIds, skippedLessonIds } = courseState;
  const lessonFlags = buildLessonFlags(courseState);
  const lessonNotices = buildLessonNotices(courseState, user?.lessonNoticesSeenAt ?? null);

  const chapterList = chapters.map((chapter) => {
    const chapterState = chapterStateById.get(chapter.id);
    return {
      ...chapter,
      isLocked: DEV_UNLOCK_ALL ? false : chapterState?.isLocked ?? true,
      isCompleted: chapterState?.isCompleted ?? false,
      isSkippedByPlacement: chapterState?.isSkippedByPlacement ?? false,
      isSatisfied: chapterState?.isSatisfied ?? false,
      completedLessonCount: chapterState?.completedLessonCount ?? 0,
      lessons: chapter.lessons.map(({ addedAt: _addedAt, contentUpdatedAt: _contentUpdatedAt, ...lesson }) => ({
        ...lesson,
        isLocked: false,
        isCompleted: completedLessonIds.has(lesson.id),
        isSkippedByPlacement: skippedLessonIds.has(lesson.id),
        isNew: lessonFlags.get(lesson.id)?.isNew ?? false,
        isUpdated: lessonFlags.get(lesson.id)?.isUpdated ?? false,
      })),
    };
  });

  return NextResponse.json({ data: { chapters: chapterList, lessonNotices } });
}
