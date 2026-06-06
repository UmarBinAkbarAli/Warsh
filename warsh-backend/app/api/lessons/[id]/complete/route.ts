import { NextResponse } from "next/server";
import { prisma } from "../../../../../lib/prisma";
import { getUserIdFromRequest } from "../../../../../lib/auth";
import { isTodayPKT, isYesterdayPKT, get4amPKTBoundary } from "../../../../../lib/date";
import { getUserCourseState, PROGRESS_STATUS } from "../../../../../lib/course";
import { checkAndAwardAchievements } from "../../../../../lib/achievements";

// Award a freeze at the 7-day milestone and every 30 streaks thereafter, max 2
function shouldAwardFreeze(newStreak: number, currentFreezes: number): boolean {
  if (currentFreezes >= 2) return false;
  return newStreak === 7 || (newStreak > 7 && newStreak % 30 === 0);
}

interface Props {
  params: { id: string };
}

export async function POST(request: Request, { params }: Props) {
  const userId = getUserIdFromRequest(request);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized", code: "unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { score, phrasesCompleted = 0 } = body;
  if (typeof score !== "number") {
    return NextResponse.json({ error: "Missing score", code: "bad_request" }, { status: 400 });
  }
  const validPhrasesCompleted = typeof phrasesCompleted === "number" && phrasesCompleted > 0
    ? Math.min(phrasesCompleted, 100)
    : 0;

  const [lesson, userExists] = await Promise.all([
    prisma.lesson.findUnique({ where: { id: params.id } }),
    prisma.user.findUnique({ where: { id: userId }, select: { id: true, subscriptionStatus: true } }),
  ]);

  if (!userExists) {
    return NextResponse.json({ error: "Unauthorized", code: "unauthorized" }, { status: 401 });
  }

  if (!lesson) {
    return NextResponse.json({ error: "Lesson not found", code: "not_found" }, { status: 404 });
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
      const lastActive = currentStreakRecord.lastActiveDate ? new Date(currentStreakRecord.lastActiveDate) : null;
      if (lastActive && isTodayPKT(lastActive)) {
        // Already active today — just refresh timestamp
        await tx.streak.update({ where: { userId }, data: { lastActiveDate: now } });
      } else if (lastActive && isYesterdayPKT(lastActive)) {
        // Consecutive day — increment streak
        const nextStreak = currentStreakRecord.currentStreak + 1;
        const freezeAward = shouldAwardFreeze(nextStreak, currentStreakRecord.streakFreezes);
        await tx.streak.update({
          where: { userId },
          data: {
            currentStreak: nextStreak,
            longestStreak: Math.max(currentStreakRecord.longestStreak, nextStreak),
            lastActiveDate: now,
            ...(freezeAward ? { streakFreezes: Math.min(2, currentStreakRecord.streakFreezes + 1) } : {}),
          }
        });
      } else {
        // Missed one or more days — try to consume a freeze
        if (currentStreakRecord.streakFreezes > 0) {
          await tx.streak.update({
            where: { userId },
            data: {
              streakFreezes: currentStreakRecord.streakFreezes - 1,
              lastActiveDate: now,
              lastFreezeUsedAt: now,
            }
          });
        } else {
          await tx.streak.update({
            where: { userId },
            data: { currentStreak: 1, lastActiveDate: now }
          });
        }
      }
    }
  });

  // Award daily goal XP (5 XP on first lesson of the day)
  let dailyGoalXp = 0;
  if (firstCompletion && lessonsCompletedTodayBefore === 0) {
    dailyGoalXp = 5;
    await prisma.user.update({ where: { id: userId }, data: { xp: { increment: 5 } } });
  }

  // Award chapter completion bonus (50 XP when all lessons in chapter are done/skipped)
  let chapterBonusXp = 0;
  let chapterJustCompleted = false;
  if (firstCompletion) {
    const [totalInChapter, doneInChapter] = await Promise.all([
      prisma.lesson.count({ where: { chapterId: lesson.chapterId } }),
      prisma.progress.count({
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
      await prisma.user.update({ where: { id: userId }, data: { xp: { increment: 50 } } });
    }
  }

  // Add chapter vocabulary words to user's word bank on first lesson completion
  let wordsAdded = 0;
  let chapterOrder: number | null = null;
  if (firstCompletion) {
    const chapter = await prisma.chapter.findUnique({
      where: { id: lesson.chapterId },
      select: { order: true },
    });
    if (chapter) {
      chapterOrder = chapter.order;
      const chapterWords = await prisma.vocabularyWord.findMany({
        where: { chapterIntroduced: chapter.order },
        select: { id: true },
      });
      if (chapterWords.length > 0) {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const result = await prisma.userVocabularyWord.createMany({
          data: chapterWords.map((w) => ({
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
  }

  const showPaywall = chapterJustCompleted && chapterOrder === 1 && userExists?.subscriptionStatus === "trial";

  // Increment phrasesSpoken if any SHADOW_REPEAT exercises were completed
  let newPhrasesSpoken = 0;
  let firstShadowRepeat = false;
  let firstSpokenLesson = false;
  if (validPhrasesCompleted > 0 && firstCompletion) {
    const userBefore = await prisma.user.findUnique({ where: { id: userId }, select: { phrasesSpoken: true } });
    firstShadowRepeat = (userBefore?.phrasesSpoken ?? 0) === 0;
    firstSpokenLesson = lesson.template === "SPOKEN_PHRASES";
    await prisma.user.update({ where: { id: userId }, data: { phrasesSpoken: { increment: validPhrasesCompleted } } });
    const userAfter = await prisma.user.findUnique({ where: { id: userId }, select: { phrasesSpoken: true } });
    newPhrasesSpoken = userAfter?.phrasesSpoken ?? 0;
  }

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
      showPaywall,
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
