import { NextResponse } from "next/server";
import { prisma } from "../../../../../lib/prisma";
import { getUserIdFromRequest } from "../../../../../lib/auth";
import { getUserCourseState } from "../../../../../lib/course";
import { getChapterTestAssessment, isChapterTestContent } from "../../../../../lib/chapterTests";

interface Props {
  params: { id: string };
}

export async function GET(request: Request, { params }: Props) {
  const userId = await getUserIdFromRequest(request);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized", code: "unauthorized" }, { status: 401 });
  }

  const chapter = await prisma.chapter.findUnique({
    where: { id: params.id },
    include: {
      lessons: {
        where: { status: "PUBLISHED" },
        orderBy: { order: "asc" },
        select: { id: true, order: true, title: true, titleUr: true, titleAr: true, template: true, xpReward: true, content: true }
      }
    }
  });

  // Unpublished chapters are hidden from the app; treat them as not found.
  if (!chapter || chapter.status !== "PUBLISHED") {
    return NextResponse.json({ error: "Chapter not found", code: "not_found" }, { status: 404 });
  }

  const { chapterStateById, completedLessonIds, skippedLessonIds } = await getUserCourseState(userId);
  const chapterState = chapterStateById.get(params.id);

  if (chapterState?.isLocked) {
    return NextResponse.json({ error: "Chapter is locked", code: "chapter_locked" }, { status: 403 });
  }

  const lessons = chapter.lessons.map((lesson: any) => {
    const assessment = getChapterTestAssessment(lesson.content);
    return ({
    id: lesson.id,
    order: lesson.order,
    title: lesson.title,
    titleUr: lesson.titleUr,
    titleAr: lesson.titleAr,
    template: lesson.template,
    xpReward: lesson.xpReward,
    isChapterTest: isChapterTestContent(lesson.content),
    questionCount: assessment?.questions.length ?? null,
    requiredCorrect: assessment ? Math.ceil((assessment.pass_score_percent / 100) * assessment.questions.length) : null,
    isCompleted: completedLessonIds.has(lesson.id),
    isSkippedByPlacement: skippedLessonIds.has(lesson.id),
    });
  });
  const regularLessons = lessons.filter((lesson: any) => !lesson.isChapterTest);
  const satisfiedRegularLessonIds = new Set([...completedLessonIds, ...skippedLessonIds]);

  return NextResponse.json({
    data: {
      chapter: {
        id: chapter.id,
        order: chapter.order,
        title: chapter.title,
        titleUr: chapter.titleUr,
        titleAr: chapter.titleAr,
        description: chapter.description,
        descriptionUr: chapter.descriptionUr,
        isLocked: false,
        isCompleted: chapterState?.isCompleted ?? false,
        isSkippedByPlacement: chapterState?.isSkippedByPlacement ?? false,
        completedLessonCount: regularLessons.filter((lesson: any) => completedLessonIds.has(lesson.id)).length,
        lessonCount: regularLessons.length,
        lessons: lessons.map((lesson: any) => ({
          ...lesson,
          isLocked: lesson.isChapterTest
            ? !regularLessons.every((regularLesson: any) => satisfiedRegularLessonIds.has(regularLesson.id))
            : false,
        }))
      }
    }
  });
}
