import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { getUserIdFromRequest } from "../../../../lib/auth";
import { getUserCourseState, PROGRESS_STATUS } from "../../../../lib/course";
import { getStartingChapterOrderForPlacement, VALID_PLACEMENT_TYPES } from "../../../../lib/placement";

export async function POST(request: Request) {
  const userId = await getUserIdFromRequest(request);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized", code: "unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const placementType = typeof body?.placementType === "string" ? body.placementType : null;

  if (!placementType || !VALID_PLACEMENT_TYPES.includes(placementType)) {
    return NextResponse.json({ error: "Invalid placement type", code: "bad_request" }, { status: 400 });
  }

  const startingChapterOrder = getStartingChapterOrderForPlacement(placementType);

  if (!startingChapterOrder) {
    return NextResponse.json({ error: "Invalid placement type", code: "bad_request" }, { status: 400 });
  }

  const lessonsToSkip =
    placementType === "BEGINNER"
      ? []
      : await prisma.lesson.findMany({
          where: {
            chapter: {
              order: { lt: startingChapterOrder },
            },
          },
          select: { id: true },
        });

  await prisma.$transaction(async (tx: any) => {
    if (lessonsToSkip.length > 0) {
      for (const lesson of lessonsToSkip) {
        const existingProgress = await tx.progress.findUnique({
          where: { userId_lessonId: { userId, lessonId: lesson.id } },
        });

        if (!existingProgress) {
          await tx.progress.create({
            data: {
              userId,
              lessonId: lesson.id,
              completed: false,
              status: PROGRESS_STATUS.SKIPPED_BY_PLACEMENT,
              attempts: 0,
              xpEarned: 0,
            },
          });
          continue;
        }

        if (existingProgress.status === PROGRESS_STATUS.COMPLETED || existingProgress.completed) {
          continue;
        }

        await tx.progress.update({
          where: { id: existingProgress.id },
          data: {
            completed: false,
            status: PROGRESS_STATUS.SKIPPED_BY_PLACEMENT,
            score: existingProgress.score,
            xpEarned: existingProgress.xpEarned ?? 0,
          },
        });
      }
    }

    await tx.user.update({
      where: { id: userId },
      data: {
        placementType,
        startingChapterOrder,
      },
    });
  });

  const { chapters, chapterStateById, completedLessonIds, skippedLessonIds } = await getUserCourseState(userId);

  const chapterList = chapters.map((chapter) => {
    const chapterState = chapterStateById.get(chapter.id);
    return {
      ...chapter,
      isLocked: chapterState?.isLocked ?? true,
      isCompleted: chapterState?.isCompleted ?? false,
      isSkippedByPlacement: chapterState?.isSkippedByPlacement ?? false,
      completedLessonCount: chapterState?.completedLessonCount ?? 0,
      lessons: chapter.lessons.map((lesson) => ({
        ...lesson,
        isCompleted: completedLessonIds.has(lesson.id),
        isSkippedByPlacement: skippedLessonIds.has(lesson.id),
      })),
    };
  });

  return NextResponse.json({
    data: {
      placementType,
      startingChapterOrder,
      chapters: chapterList,
    },
  });
}
