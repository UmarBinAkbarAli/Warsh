import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { getUserIdFromRequest } from "../../../../lib/auth";
import { getUserCourseState, PROGRESS_STATUS } from "../../../../lib/course";
import { getUserSubscriptionState, requiresSubscription } from "../../../../lib/subscription";

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
    select: { id: true, title: true, titleUr: true, titleAr: true, template: true, xpReward: true, content: true, chapterId: true },
  });

  if (!lesson) {
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

  if (requiresSubscription(subscriptionState)) {
    return NextResponse.json({ error: "Subscription required", code: "subscription_required" }, { status: 402 });
  }

  const progress = await prisma.progress.findUnique({ where: { userId_lessonId: { userId, lessonId: lesson.id } } });
  const progressStatus = progress?.status || (progress?.completed ? PROGRESS_STATUS.COMPLETED : PROGRESS_STATUS.NOT_STARTED);

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
        isCompleted: progressStatus === PROGRESS_STATUS.COMPLETED,
        isSkippedByPlacement: progressStatus === PROGRESS_STATUS.SKIPPED_BY_PLACEMENT,
      },
    },
  });
}
