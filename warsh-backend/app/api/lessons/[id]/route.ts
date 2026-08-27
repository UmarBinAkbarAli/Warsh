import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { getUserIdFromRequest } from "../../../../lib/auth";
import { getUserCourseState, PROGRESS_STATUS } from "../../../../lib/course";
import { getUserSubscriptionState, requiresSubscription } from "../../../../lib/subscription";
import { getChapterTestAssessment, isChapterTestContent, isChapterTestUnlocked } from "../../../../lib/chapterTests";

interface Props {
  params: { id: string };
}

export async function GET(request: Request, { params }: Props) {
  const userId = await getUserIdFromRequest(request);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized", code: "unauthorized" }, { status: 401 });
  }

  const lesson = await prisma.lesson.findUnique({
    where: { id: params.id },
    select: {
      id: true, order: true, title: true, titleUr: true, titleAr: true, template: true, xpReward: true, content: true, chapterId: true,
      status: true,
      chapter: { select: { status: true } },
    },
  });

  // Draft lessons — or lessons inside a still-draft chapter — are not served,
  // even by direct id. Return 404 so unpublished content is indistinguishable
  // from nonexistent.
  if (!lesson || lesson.status !== "PUBLISHED" || lesson.chapter.status !== "PUBLISHED") {
    return NextResponse.json({ error: "Lesson not found", code: "not_found" }, { status: 404 });
  }

  const [{ chapterStateById }, subscriptionState] = await Promise.all([
    getUserCourseState(userId),
    getUserSubscriptionState(userId),
  ]);

  if (!subscriptionState) {
    return NextResponse.json({ error: "Unauthorized", code: "unauthorized" }, { status: 401 });
  }

  if (chapterStateById.get(lesson.chapterId)?.isLocked) {
    return NextResponse.json({ error: "Chapter is locked", code: "chapter_locked" }, { status: 403 });
  }

  if (!(await isChapterTestUnlocked(userId, lesson))) {
    return NextResponse.json({ error: "Complete the chapter lessons before taking the final test.", code: "chapter_test_locked" }, { status: 403 });
  }

  if (requiresSubscription(subscriptionState)) {
    return NextResponse.json({ error: "Subscription required", code: "subscription_required" }, { status: 402 });
  }

  const assessment = getChapterTestAssessment(lesson.content);
  const [progress, nextChapter] = await Promise.all([
    prisma.progress.findUnique({ where: { userId_lessonId: { userId, lessonId: lesson.id } } }),
    assessment
      ? prisma.chapter.findFirst({
          where: { order: { gt: assessment.chapter_order }, status: "PUBLISHED" },
          orderBy: { order: "asc" },
          select: { id: true },
        })
      : Promise.resolve(null),
  ]);
  const progressStatus = progress?.status || (progress?.completed ? PROGRESS_STATUS.COMPLETED : PROGRESS_STATUS.NOT_STARTED);
  const isCompleted = progressStatus === PROGRESS_STATUS.COMPLETED;
  const totalScored = assessment?.questions.length ?? 0;
  const storedScore = progress?.score ?? 0;

  return NextResponse.json({
    data: {
      lesson: {
        id: lesson.id,
        title: lesson.title,
        titleUr: lesson.titleUr,
        titleAr: lesson.titleAr,
        xpReward: lesson.xpReward,
        template: lesson.template,
        content: lesson.content,
        isChapterTest: isChapterTestContent(lesson.content),
        isCompleted,
        isSkippedByPlacement: progressStatus === PROGRESS_STATUS.SKIPPED_BY_PLACEMENT,
        chapterTestResult: assessment && isCompleted
          ? {
              passed: true,
              score: storedScore,
              correctCount: Math.round((storedScore / 100) * totalScored),
              totalScored,
              requiredCorrect: Math.ceil((assessment.pass_score_percent / 100) * totalScored),
              chapterBonusXp: 0,
              chapterJustCompleted: false,
              nextChapterId: nextChapter?.id ?? null,
              recovered: true,
            }
          : null,
      },
    },
  });
}
