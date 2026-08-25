import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "../../../../../lib/prisma";
import { getUserIdFromRequest } from "../../../../../lib/auth";
import { get4amPKTBoundary } from "../../../../../lib/date";
import { calculateLessonStreakUpdate } from "../../../../../lib/streak";
import { getUserCourseState, PROGRESS_STATUS } from "../../../../../lib/course";
import { checkAndAwardAchievements } from "../../../../../lib/achievements";
import { getUserSubscriptionState, requiresSubscription } from "../../../../../lib/subscription";

interface Props {
  params: { id: string };
}

const completeSchema = z.object({
  score: z.number().int().min(0).max(100),
  phrasesCompleted: z.number().int().min(0).max(100).optional().default(0),
});

export async function POST(request: Request, { params }: Props) {
  const userId = await getUserIdFromRequest(request);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized", code: "unauthorized" }, { status: 401 });
  }

  // `typeof score === "number"` alone admitted NaN, Infinity and out-of-range
  // values, all of which were persisted to Progress.score.
  const parsed = completeSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: "score must be an integer between 0 and 100.", code: "bad_request" },
      { status: 400 },
    );
  }
  const { score, phrasesCompleted: validPhrasesCompleted } = parsed.data;

  const [lesson, subscriptionState] = await Promise.all([
    prisma.lesson.findUnique({ where: { id: params.id } }),
    getUserSubscriptionState(userId),
  ]);

  if (!subscriptionState) {
    return NextResponse.json({ error: "Unauthorized", code: "unauthorized" }, { status: 401 });
  }

  if (!lesson) {
    return NextResponse.json({ error: "Lesson not found", code: "not_found" }, { status: 404 });
  }

  if (requiresSubscription(subscriptionState)) {
    return NextResponse.json({ error: "Subscription required", code: "subscription_required" }, { status: 402 });
  }

  const { chapterStateById } = await getUserCourseState(userId);
  if (chapterStateById.get(lesson.chapterId)?.isLocked) {
    return NextResponse.json({ error: "Chapter is locked", code: "chapter_locked" }, { status: 403 });
  }

  const todayStart = get4amPKTBoundary();

  const [existingProgress, lessonsCompletedTodayBefore] = await Promise.all([
    prisma.progress.findUnique({ where: { userId_lessonId: { userId, lessonId: lesson.id } } }),
    prisma.progress.count({ where: { userId, status: PROGRESS_STATUS.COMPLETED, completedAt: { gte: todayStart } } }),
  ]);

  const existingStatus = existingProgress?.status || (existingProgress?.completed ? PROGRESS_STATUS.COMPLETED : PROGRESS_STATUS.NOT_STARTED);
  const firstCompletion = existingStatus === PROGRESS_STATUS.NOT_STARTED;
  const baseXp = lesson.xpReward;
  const perfectBonus = score === 100 && firstCompletion ? 5 : 0;
  const xpEarned = firstCompletion ? baseXp + perfectBonus : 0;

  // All progress/XP/streak/word-bank mutations for this completion run in a
  // single transaction so a mid-way failure can't leave partial state (e.g.
  // progress marked complete but the chapter bonus or seeded words missing).
  let dailyGoalXp = 0;
  let chapterBonusXp = 0;
  let chapterJustCompleted = false;
  let wordsAdded = 0;
  let newPhrasesSpoken = 0;
  let firstShadowRepeat = false;
  let firstSpokenLesson = false;

  await prisma.$transaction(async (tx: any) => {
    if (!existingProgress) {
      await tx.progress.create({
        data: {
          userId,
          lessonId: lesson.id,
          completed: true,
          status: PROGRESS_STATUS.COMPLETED,
          score,
          attempts: 1,
          xpEarned,
          completedAt: new Date()
        }
      });
    } else {
      await tx.progress.update({
        where: { id: existingProgress.id },
        data: {
          completed: true,
          status: PROGRESS_STATUS.COMPLETED,
          score,
          attempts: existingProgress.attempts + 1,
          xpEarned: existingProgress.xpEarned || xpEarned,
          completedAt: existingProgress.completed ? existingProgress.completedAt : new Date()
        }
      });
    }

    if (xpEarned > 0) {
      await tx.user.update({ where: { id: userId }, data: { xp: { increment: xpEarned } } });
    }

    const currentStreakRecord = await tx.streak.findUnique({ where: { userId } });
    const now = new Date();

    if (!currentStreakRecord) {
      await tx.streak.create({
        data: { userId, currentStreak: 1, longestStreak: 1, lastActiveDate: now }
      });
    } else {
      await tx.streak.update({
        where: { userId },
        data: calculateLessonStreakUpdate(currentStreakRecord, now),
      });
    }

    if (!firstCompletion) return;

    // Daily goal XP (5 XP on first lesson of the day)
    if (lessonsCompletedTodayBefore === 0) {
      dailyGoalXp = 5;
      await tx.user.update({ where: { id: userId }, data: { xp: { increment: 5 } } });
    }

    // Chapter completion bonus (50 XP when all lessons in chapter are done/skipped).
    // The count reads this transaction's own progress write, so it includes this lesson.
    const [totalInChapter, doneInChapter] = await Promise.all([
      tx.lesson.count({ where: { chapterId: lesson.chapterId } }),
      tx.progress.count({
        where: {
          userId,
          lesson: { chapterId: lesson.chapterId },
          status: { in: [PROGRESS_STATUS.COMPLETED, PROGRESS_STATUS.SKIPPED_BY_PLACEMENT] },
        },
      }),
    ]);

    if (totalInChapter > 0 && doneInChapter === totalInChapter) {
      chapterBonusXp = 50;
      chapterJustCompleted = true;
      await tx.user.update({ where: { id: userId }, data: { xp: { increment: 50 } } });
    }

    // Seed chapter vocabulary into the user's word bank
    const chapter = await tx.chapter.findUnique({
      where: { id: lesson.chapterId },
      select: { order: true },
    });
    if (chapter) {
      const chapterWords = await tx.vocabularyWord.findMany({
        where: { chapterIntroduced: chapter.order },
        select: { id: true },
      });
      if (chapterWords.length > 0) {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const result = await tx.userVocabularyWord.createMany({
          data: chapterWords.map((w: { id: string }) => ({
            userId,
            wordId: w.id,
            nextReviewDate: tomorrow,
            easeFactor: 2.5,
            intervalDays: 1,
            repetitions: 0,
            isFavorite: false,
          })),
          skipDuplicates: true,
        });
        wordsAdded = result.count;
      }
    }

    // Increment phrasesSpoken if any SHADOW_REPEAT exercises were completed
    if (validPhrasesCompleted > 0) {
      const userBefore = await tx.user.findUnique({ where: { id: userId }, select: { phrasesSpoken: true } });
      const before = userBefore?.phrasesSpoken ?? 0;
      firstShadowRepeat = before === 0;
      firstSpokenLesson = lesson.template === "SPOKEN_PHRASES";
      await tx.user.update({ where: { id: userId }, data: { phrasesSpoken: { increment: validPhrasesCompleted } } });
      newPhrasesSpoken = before + validPhrasesCompleted;
    }
  });

  const [user, streak, completedCount] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId } }),
    prisma.streak.findUnique({ where: { userId }, select: { currentStreak: true, longestStreak: true, streakFreezes: true, lastFreezeUsedAt: true } }),
    prisma.progress.count({ where: { userId, status: PROGRESS_STATUS.COMPLETED } }),
  ]);

  const newAchievements = await prisma.$transaction((tx) =>
    checkAndAwardAchievements(tx, {
      userId,
      completedLessonCount: completedCount,
      totalXp: user?.xp ?? 0,
      currentStreak: streak?.currentStreak ?? 0,
      chapterJustCompleted,
      phrasesSpoken: newPhrasesSpoken > 0 ? newPhrasesSpoken : undefined,
      firstShadowRepeat,
      firstSpokenLesson,
    })
  );

  const finalXp = newAchievements.length > 0
    ? (await prisma.user.findUnique({ where: { id: userId }, select: { xp: true } }))?.xp ?? user?.xp ?? 0
    : user?.xp ?? 0;

  return NextResponse.json({
    data: {
      xpEarned,
      chapterBonusXp,
      chapterJustCompleted,
      dailyGoalXp,
      streakCelebration: firstCompletion && lessonsCompletedTodayBefore === 0,
      totalXp: finalXp,
      newAchievements,
      streakUpdated: true,
      currentStreak: streak?.currentStreak ?? 0,
      longestStreak: streak?.longestStreak ?? 0,
      streakFreezes: streak?.streakFreezes ?? 0,
      phrasesSpoken: newPhrasesSpoken,
      wordsAdded,
    },
  });
}
