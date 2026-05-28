require("dotenv/config");

const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");
const { chapters } = require("./curriculum-book1.cjs");
const { chapters: chapters2 } = require("./curriculum-books2-4.cjs");
const { chapters: chapters3 } = require("./curriculum-books5-6.cjs");
const { chapters: chapters4 } = require("./curriculum-books7-8.cjs");
const { seedVocabulary } = require("./vocabulary-seed.cjs");
const { seedTadabbur } = require("./tadabbur-seed.cjs");
const ch01L01Content = require("./fixtures/chapter-01-lesson-01.json");
const ch01L02Content = require("./fixtures/chapter-01-lesson-02.json");
const ch01L03Content = require("./fixtures/chapter-01-lesson-03.json");
const ch01L04Content = require("./fixtures/chapter-01-lesson-04.json");
const ch02L01Content = require("./fixtures/chapter-02-lesson-01.json");
const ch02L02Content = require("./fixtures/chapter-02-lesson-02.json");
const ch02L03Content = require("./fixtures/chapter-02-lesson-03.json");
const ch02L04Content = require("./fixtures/chapter-02-lesson-04.json");
const ch03L01Content = require("./fixtures/chapter-03-lesson-01.json");
const ch03L02Content = require("./fixtures/chapter-03-lesson-02.json");
const ch03L03Content = require("./fixtures/chapter-03-lesson-03.json");
const ch03L04Content = require("./fixtures/chapter-03-lesson-04.json");
const ch03L05SpokenContent = require("./fixtures/chapter-03-lesson-05-spoken-phrases.json");
const ch04L01Content = require("./fixtures/chapter-04-lesson-01.json");
const ch04L02Content = require("./fixtures/chapter-04-lesson-02.json");
const ch04L03Content = require("./fixtures/chapter-04-lesson-03.json");
const ch04L04Content = require("./fixtures/chapter-04-lesson-04.json");
const ch05L01Content = require("./fixtures/chapter-05-lesson-01.json");
const ch05L02Content = require("./fixtures/chapter-05-lesson-02.json");
const ch05L03Content = require("./fixtures/chapter-05-lesson-03.json");
const ch05L04Content = require("./fixtures/chapter-05-lesson-04.json");
const ch05L05Content = require("./fixtures/chapter-05-lesson-05.json");
const ch06L01Content = require("./fixtures/chapter-06-lesson-01.json");
const ch06L02Content = require("./fixtures/chapter-06-lesson-02.json");
const ch06L03Content = require("./fixtures/chapter-06-lesson-03.json");
const ch06L04Content = require("./fixtures/chapter-06-lesson-04.json");
const ch07L01Content = require("./fixtures/chapter-07-lesson-01.json");
const ch07L02Content = require("./fixtures/chapter-07-lesson-02.json");
const ch07L03Content = require("./fixtures/chapter-07-lesson-03.json");
const ch07L04Content = require("./fixtures/chapter-07-lesson-04.json");
const ch07L05SpokenContent = require("./fixtures/chapter-07-lesson-05-spoken-phrases.json");
const ch08L01Content = require("./fixtures/chapter-08-lesson-01.json");
const ch08L02Content = require("./fixtures/chapter-08-lesson-02.json");
const ch08L03Content = require("./fixtures/chapter-08-lesson-03.json");
const ch08L04Content = require("./fixtures/chapter-08-lesson-04.json");
const ch09L01Content     = require("./fixtures/chapter-09-lesson-01.json");
const ch09L02Content     = require("./fixtures/chapter-09-lesson-02.json");
const ch09L03Content     = require("./fixtures/chapter-09-lesson-03.json");
const ch09L04Content     = require("./fixtures/chapter-09-lesson-04.json");
const ch09L05VerbContent = require("./fixtures/chapter-09-lesson-05-verb-pattern.json");
const ch10L01Content     = require("./fixtures/chapter-10-lesson-01.json");
const ch10L02Content     = require("./fixtures/chapter-10-lesson-02.json");
const ch10L03Content     = require("./fixtures/chapter-10-lesson-03.json");
const ch10L04Content     = require("./fixtures/chapter-10-lesson-04.json");
const ch11L01Content     = require("./fixtures/chapter-11-lesson-01.json");
const ch11L02Content     = require("./fixtures/chapter-11-lesson-02.json");
const ch11L03Content     = require("./fixtures/chapter-11-lesson-03.json");
const ch11L04Content     = require("./fixtures/chapter-11-lesson-04.json");
const ch11L05Content     = require("./fixtures/chapter-11-lesson-05.json");
const ch12L01Content     = require("./fixtures/chapter-12-lesson-01.json");
const ch12L02Content     = require("./fixtures/chapter-12-lesson-02.json");
const ch12L03Content     = require("./fixtures/chapter-12-lesson-03.json");
const ch12L04Content     = require("./fixtures/chapter-12-lesson-04.json");
const ch12L05SpokenContent = require("./fixtures/chapter-12-lesson-05-spoken-phrases.json");
const ch13L01Content     = require("./fixtures/chapter-13-lesson-01.json");
const ch13L02Content     = require("./fixtures/chapter-13-lesson-02.json");
const ch13L03Content     = require("./fixtures/chapter-13-lesson-03.json");
const ch13L04Content     = require("./fixtures/chapter-13-lesson-04.json");
const ch14L01Content     = require("./fixtures/chapter-14-lesson-01.json");
const ch14L02Content     = require("./fixtures/chapter-14-lesson-02.json");
const ch14L03Content     = require("./fixtures/chapter-14-lesson-03.json");
const ch14L04Content     = require("./fixtures/chapter-14-lesson-04.json");
const ch14L05Content     = require("./fixtures/chapter-14-lesson-05.json");
const ch15L01Content     = require("./fixtures/chapter-15-lesson-01.json");
const ch15L02Content     = require("./fixtures/chapter-15-lesson-02.json");
const ch15L03Content     = require("./fixtures/chapter-15-lesson-03.json");
const ch15L04Content     = require("./fixtures/chapter-15-lesson-04.json");
const ch15L05Content     = require("./fixtures/chapter-15-lesson-05.json");
const ch16L01Content     = require("./fixtures/chapter-16-lesson-01.json");
const ch16L02Content     = require("./fixtures/chapter-16-lesson-02.json");
const ch16L03Content     = require("./fixtures/chapter-16-lesson-03.json");
const ch16L04Content     = require("./fixtures/chapter-16-lesson-04.json");
const ch16L05Content     = require("./fixtures/chapter-16-lesson-05.json");
const ch17L01Content     = require("./fixtures/chapter-17-lesson-01.json");
const ch17L02Content     = require("./fixtures/chapter-17-lesson-02.json");
const ch17L03Content     = require("./fixtures/chapter-17-lesson-03.json");
const ch17L04Content     = require("./fixtures/chapter-17-lesson-04.json");
const ch17L05Content     = require("./fixtures/chapter-17-lesson-05.json");
const ch17L06Content     = require("./fixtures/chapter-17-lesson-06.json");
const ch18L01Content     = require("./fixtures/chapter-18-lesson-01.json");
const ch18L02Content     = require("./fixtures/chapter-18-lesson-02.json");
const ch18L03Content     = require("./fixtures/chapter-18-lesson-03.json");
const ch18L04Content     = require("./fixtures/chapter-18-lesson-04.json");
const ch18L05Content     = require("./fixtures/chapter-18-lesson-05.json");
const ch18L06Content     = require("./fixtures/chapter-18-lesson-06.json");
const ch19L01Content     = require("./fixtures/chapter-19-lesson-01.json");
const ch19L02Content     = require("./fixtures/chapter-19-lesson-02.json");
const ch19L03Content     = require("./fixtures/chapter-19-lesson-03.json");
const ch19L04Content     = require("./fixtures/chapter-19-lesson-04.json");
const ch19L05Content     = require("./fixtures/chapter-19-lesson-05.json");
const ch19L06Content     = require("./fixtures/chapter-19-lesson-06.json");
const ch20L01Content     = require("./fixtures/chapter-20-lesson-01.json");
const ch20L02Content     = require("./fixtures/chapter-20-lesson-02.json");
const ch20L03Content     = require("./fixtures/chapter-20-lesson-03.json");
const ch20L04Content     = require("./fixtures/chapter-20-lesson-04.json");
const ch20L05Content     = require("./fixtures/chapter-20-lesson-05.json");
const ch21L01Content     = require("./fixtures/chapter-21-lesson-01.json");
const ch21L02Content     = require("./fixtures/chapter-21-lesson-02.json");
const ch21L03Content     = require("./fixtures/chapter-21-lesson-03.json");
const ch21L04Content     = require("./fixtures/chapter-21-lesson-04.json");
const ch21L05Content     = require("./fixtures/chapter-21-lesson-05.json");
const ch22L01Content     = require("./fixtures/chapter-22-lesson-01.json");
const ch22L02Content     = require("./fixtures/chapter-22-lesson-02.json");
const ch22L03Content     = require("./fixtures/chapter-22-lesson-03.json");
const ch22L04Content     = require("./fixtures/chapter-22-lesson-04.json");
const ch22L05Content     = require("./fixtures/chapter-22-lesson-05.json");
const ch23L01Content     = require("./fixtures/chapter-23-lesson-01.json");
const ch23L02Content     = require("./fixtures/chapter-23-lesson-02.json");
const ch23L03Content     = require("./fixtures/chapter-23-lesson-03.json");
const ch23L04Content     = require("./fixtures/chapter-23-lesson-04.json");
const ch24L01Content     = require("./fixtures/chapter-24-lesson-01.json");
const ch24L02Content     = require("./fixtures/chapter-24-lesson-02.json");
const ch24L03Content     = require("./fixtures/chapter-24-lesson-03.json");
const ch24L04Content     = require("./fixtures/chapter-24-lesson-04.json");
const ch24L05Content     = require("./fixtures/chapter-24-lesson-05.json");
const ch24L06Content     = require("./fixtures/chapter-24-lesson-06.json");
const ch25L01Content     = require("./fixtures/chapter-25-lesson-01.json");
const ch25L02Content     = require("./fixtures/chapter-25-lesson-02.json");
const ch25L03Content     = require("./fixtures/chapter-25-lesson-03.json");
const ch25L04Content     = require("./fixtures/chapter-25-lesson-04.json");
const ch25L05Content     = require("./fixtures/chapter-25-lesson-05.json");
const ch25L06Content     = require("./fixtures/chapter-25-lesson-06.json");
const ch26L01Content     = require("./fixtures/chapter-26-lesson-01.json");
const ch26L02Content     = require("./fixtures/chapter-26-lesson-02.json");
const ch26L03Content     = require("./fixtures/chapter-26-lesson-03.json");
const ch26L04Content     = require("./fixtures/chapter-26-lesson-04.json");
const ch27L01Content     = require("./fixtures/chapter-27-lesson-01.json");
const ch27L02Content     = require("./fixtures/chapter-27-lesson-02.json");
const ch27L03Content     = require("./fixtures/chapter-27-lesson-03.json");
const ch27L04Content     = require("./fixtures/chapter-27-lesson-04.json");
const ch27L05Content     = require("./fixtures/chapter-27-lesson-05.json");
const ch28L01Content     = require("./fixtures/chapter-28-lesson-01.json");
const ch28L02Content     = require("./fixtures/chapter-28-lesson-02.json");
const ch28L03Content     = require("./fixtures/chapter-28-lesson-03.json");
const ch28L04Content     = require("./fixtures/chapter-28-lesson-04.json");
const ch28L05Content     = require("./fixtures/chapter-28-lesson-05.json");
const ch29L01Content     = require("./fixtures/chapter-29-lesson-01.json");
const ch29L02Content     = require("./fixtures/chapter-29-lesson-02.json");
const ch29L03Content     = require("./fixtures/chapter-29-lesson-03.json");
const ch29L04Content     = require("./fixtures/chapter-29-lesson-04.json");
const ch29L05Content     = require("./fixtures/chapter-29-lesson-05.json");
const ch29L06Content     = require("./fixtures/chapter-29-lesson-06.json");

const ch30L01Content = require("./fixtures/chapter-30-lesson-01.json");
const ch30L02Content = require("./fixtures/chapter-30-lesson-02.json");
const ch30L03Content = require("./fixtures/chapter-30-lesson-03.json");
const ch30L04Content = require("./fixtures/chapter-30-lesson-04.json");
const ch30L05Content = require("./fixtures/chapter-30-lesson-05.json");
const ch31L01Content = require("./fixtures/chapter-31-lesson-01.json");
const ch31L02Content = require("./fixtures/chapter-31-lesson-02.json");
const ch31L03Content = require("./fixtures/chapter-31-lesson-03.json");
const ch31L04Content = require("./fixtures/chapter-31-lesson-04.json");
const ch31L05Content = require("./fixtures/chapter-31-lesson-05.json");
const ch32L01Content = require("./fixtures/chapter-32-lesson-01.json");
const ch32L02Content = require("./fixtures/chapter-32-lesson-02.json");
const ch32L03Content = require("./fixtures/chapter-32-lesson-03.json");
const ch32L04Content = require("./fixtures/chapter-32-lesson-04.json");
const ch33L01Content = require("./fixtures/chapter-33-lesson-01.json");
const ch33L02Content = require("./fixtures/chapter-33-lesson-02.json");
const ch33L03Content = require("./fixtures/chapter-33-lesson-03.json");
const ch33L04Content = require("./fixtures/chapter-33-lesson-04.json");
const ch33L05Content = require("./fixtures/chapter-33-lesson-05.json");
const ch34L01Content = require("./fixtures/chapter-34-lesson-01.json");
const ch34L02Content = require("./fixtures/chapter-34-lesson-02.json");
const ch34L03Content = require("./fixtures/chapter-34-lesson-03.json");
const ch34L04Content = require("./fixtures/chapter-34-lesson-04.json");
const ch34L05Content = require("./fixtures/chapter-34-lesson-05.json");
const ch34L06Content = require("./fixtures/chapter-34-lesson-06.json");
const ch35L01Content = require("./fixtures/chapter-35-lesson-01.json");
const ch35L02Content = require("./fixtures/chapter-35-lesson-02.json");
const ch35L03Content = require("./fixtures/chapter-35-lesson-03.json");
const ch35L04Content = require("./fixtures/chapter-35-lesson-04.json");
const ch35L05Content = require("./fixtures/chapter-35-lesson-05.json");
const ch36L01Content = require("./fixtures/chapter-36-lesson-01.json");
const ch36L02Content = require("./fixtures/chapter-36-lesson-02.json");
const ch36L03Content = require("./fixtures/chapter-36-lesson-03.json");
const ch36L04Content = require("./fixtures/chapter-36-lesson-04.json");
const ch36L05Content = require("./fixtures/chapter-36-lesson-05.json");
const ch37L01Content = require("./fixtures/chapter-37-lesson-01.json");
const ch37L02Content = require("./fixtures/chapter-37-lesson-02.json");
const ch37L03Content = require("./fixtures/chapter-37-lesson-03.json");
const ch37L04Content = require("./fixtures/chapter-37-lesson-04.json");
const ch37L05Content = require("./fixtures/chapter-37-lesson-05.json");
const ch38L01Content = require("./fixtures/chapter-38-lesson-01.json");
const ch38L02Content = require("./fixtures/chapter-38-lesson-02.json");
const ch38L03Content = require("./fixtures/chapter-38-lesson-03.json");
const ch38L04Content = require("./fixtures/chapter-38-lesson-04.json");
const ch38L05Content = require("./fixtures/chapter-38-lesson-05.json");
const ch39L01Content = require("./fixtures/chapter-39-lesson-01.json");
const ch39L02Content = require("./fixtures/chapter-39-lesson-02.json");
const ch39L03Content = require("./fixtures/chapter-39-lesson-03.json");
const ch39L04Content = require("./fixtures/chapter-39-lesson-04.json");
const ch39L05Content = require("./fixtures/chapter-39-lesson-05.json");
const ch40L01Content = require("./fixtures/chapter-40-lesson-01.json");
const ch40L02Content = require("./fixtures/chapter-40-lesson-02.json");
const ch40L03Content = require("./fixtures/chapter-40-lesson-03.json");
const ch40L04Content = require("./fixtures/chapter-40-lesson-04.json");
const ch40L05Content = require("./fixtures/chapter-40-lesson-05.json");
const ch41L01Content = require("./fixtures/chapter-41-lesson-01.json");
const ch41L02Content = require("./fixtures/chapter-41-lesson-02.json");
const ch41L03Content = require("./fixtures/chapter-41-lesson-03.json");
const ch41L04Content = require("./fixtures/chapter-41-lesson-04.json");
const ch41L05Content = require("./fixtures/chapter-41-lesson-05.json");
const ch42L01Content = require("./fixtures/chapter-42-lesson-01.json");
const ch42L02Content = require("./fixtures/chapter-42-lesson-02.json");
const ch42L03Content = require("./fixtures/chapter-42-lesson-03.json");
const ch42L04Content = require("./fixtures/chapter-42-lesson-04.json");
const ch42L05Content = require("./fixtures/chapter-42-lesson-05.json");
const ch43L01Content = require("./fixtures/chapter-43-lesson-01.json");
const ch43L02Content = require("./fixtures/chapter-43-lesson-02.json");
const ch43L03Content = require("./fixtures/chapter-43-lesson-03.json");
const ch43L04Content = require("./fixtures/chapter-43-lesson-04.json");
const ch43L05Content = require("./fixtures/chapter-43-lesson-05.json");
const ch44L01Content = require("./fixtures/chapter-44-lesson-01.json");
const ch44L02Content = require("./fixtures/chapter-44-lesson-02.json");
const ch44L03Content = require("./fixtures/chapter-44-lesson-03.json");
const ch44L04Content = require("./fixtures/chapter-44-lesson-04.json");
const ch44L05Content = require("./fixtures/chapter-44-lesson-05.json");
const ch45L01Content = require("./fixtures/chapter-45-lesson-01.json");
const ch45L02Content = require("./fixtures/chapter-45-lesson-02.json");
const ch45L03Content = require("./fixtures/chapter-45-lesson-03.json");
const ch45L04Content = require("./fixtures/chapter-45-lesson-04.json");
const ch45L05Content = require("./fixtures/chapter-45-lesson-05.json");
const ch45L06Content = require("./fixtures/chapter-45-lesson-06.json");

const ACHIEVEMENTS = [
  { key: "first_lesson",           title: "الخُطْوَة الأُولَى",            description: "Complete your very first lesson",                    icon: "footsteps-outline",   xpReward: 25  },
  { key: "first_chapter",          title: "إِكْمَال الفَصْل الأَوَّل",     description: "Complete your first full chapter",                    icon: "book-outline",        xpReward: 50  },
  { key: "streak_3",               title: "ثَلَاثَة أَيَّام",               description: "Study 3 days in a row",                               icon: "flame-outline",       xpReward: 15  },
  { key: "streak_7",               title: "أُسْبُوع",                       description: "Keep a 7-day streak",                                  icon: "star-outline",        xpReward: 25  },
  { key: "streak_30",              title: "شَهْر كَامِل",                   description: "Keep a 30-day streak",                                 icon: "trophy-outline",      xpReward: 100 },
  { key: "xp_100",                 title: "عَالِم نَاشِئ",                  description: "Earn 100 points",                                      icon: "medal-outline",       xpReward: 10  },
  { key: "xp_500",                 title: "عَالِم فِضِّيّ",                 description: "Earn 500 points",                                      icon: "medal-outline",       xpReward: 25  },
  { key: "xp_1000",                title: "عَالِم ذَهَبِيّ",                description: "Earn 1,000 points",                                    icon: "medal-outline",       xpReward: 50  },
  { key: "lessons_10",             title: "عَشْرَة دُرُوس",                 description: "Complete 10 lessons",                                  icon: "library-outline",     xpReward: 20  },
  { key: "first_noor",             title: "أَوَّل سُؤَال",                  description: "Send your first message to Ustaad Noor",               icon: "chatbubble-outline",  xpReward: 10  },
  { key: "first_shadow_repeat",    title: "أَوَّل مُحَاكَاة",               description: "Complete your first speaking exercise",                icon: "mic-outline",         xpReward: 10  },
  { key: "first_spoken_lesson",    title: "أَوَّل دَرْس كَلَام",            description: "Complete your first spoken phrases lesson",            icon: "chatbubbles-outline", xpReward: 25  },
  { key: "phrases_10",             title: "عَشْرَة جُمَل",                  description: "Learn to say 10 phrases",                              icon: "mic-outline",         xpReward: 15  },
  { key: "phrases_50",             title: "خَمْسُونَ جُمْلَة",              description: "Learn to say 50 phrases",                              icon: "mic-outline",         xpReward: 25  },
  { key: "phrases_100",            title: "مِئَة جُمْلَة",                  description: "Learn to say 100 phrases",                             icon: "mic-outline",         xpReward: 50  },
];

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL || ""
});

const prisma = new PrismaClient({ adapter });

const PROGRESS_PRIORITY = {
  NOT_STARTED: 0,
  SKIPPED_BY_PLACEMENT: 1,
  COMPLETED: 2,
};

async function waitForNeon(retries = 8, delayMs = 3000) {
  for (let i = 0; i < retries; i++) {
    try {
      await prisma.$connect();
      await prisma.$queryRaw`SELECT 1`;
      return;
    } catch (e) {
      if (i === retries - 1) throw e;
      console.log(`Neon cold-start — waiting ${delayMs / 1000}s (attempt ${i + 1}/${retries})...`);
      await new Promise(r => setTimeout(r, delayMs));
      await prisma.$disconnect();
    }
  }
}

function chooseProgressData(existing, incoming) {
  if (!existing) return incoming;

  const existingStatus = existing.status || (existing.completed ? "COMPLETED" : "NOT_STARTED");
  const incomingStatus = incoming.status || (incoming.completed ? "COMPLETED" : "NOT_STARTED");
  const existingPriority = PROGRESS_PRIORITY[existingStatus] ?? 0;
  const incomingPriority = PROGRESS_PRIORITY[incomingStatus] ?? 0;

  if (incomingPriority > existingPriority) return incoming;
  if (incomingPriority < existingPriority) return null;

  return {
    ...incoming,
    attempts: Math.max(existing.attempts ?? 0, incoming.attempts ?? 0),
    xpEarned: Math.max(existing.xpEarned ?? 0, incoming.xpEarned ?? 0),
    completedAt: existing.completedAt ?? incoming.completedAt,
  };
}

async function cleanupObsoleteAuthoredLessons(stableLessons) {
  const stableLessonIds = stableLessons.map((lesson) => lesson.id);
  const chapterIds = Array.from(new Set(stableLessons.map((lesson) => lesson.chapterId)));
  const stableByChapterOrder = new Map(
    stableLessons.map((lesson) => [`${lesson.chapterId}:${lesson.order}`, lesson])
  );

  const obsoleteLessons = await prisma.lesson.findMany({
    where: {
      chapterId: { in: chapterIds },
      id: { notIn: stableLessonIds },
    },
    select: {
      id: true,
      chapterId: true,
      order: true,
      progress: {
        select: {
          userId: true,
          completed: true,
          status: true,
          score: true,
          attempts: true,
          xpEarned: true,
          completedAt: true,
        },
      },
    },
  });

  if (obsoleteLessons.length === 0) return;

  for (const obsoleteLesson of obsoleteLessons) {
    const stableLesson = stableByChapterOrder.get(`${obsoleteLesson.chapterId}:${obsoleteLesson.order}`);
    if (!stableLesson) continue;

    for (const progress of obsoleteLesson.progress) {
      const existing = await prisma.progress.findUnique({
        where: { userId_lessonId: { userId: progress.userId, lessonId: stableLesson.id } },
      });
      const incoming = {
        completed: progress.completed,
        status: progress.status,
        score: progress.score,
        attempts: progress.attempts,
        xpEarned: progress.xpEarned,
        completedAt: progress.completedAt,
      };
      const merged = chooseProgressData(existing, incoming);

      if (merged) {
        await prisma.progress.upsert({
          where: { userId_lessonId: { userId: progress.userId, lessonId: stableLesson.id } },
          create: {
            userId: progress.userId,
            lessonId: stableLesson.id,
            ...merged,
          },
          update: merged,
        });
      }
    }
  }

  const obsoleteLessonIds = obsoleteLessons.map((lesson) => lesson.id);
  await prisma.$transaction([
    prisma.progress.deleteMany({ where: { lessonId: { in: obsoleteLessonIds } } }),
    prisma.lesson.deleteMany({ where: { id: { in: obsoleteLessonIds } } }),
  ]);

  console.log(`Removed ${obsoleteLessonIds.length} obsolete duplicate lesson row(s) from fixture-authored chapters.`);
}

async function main() {
  await waitForNeon();

  const userCount = await prisma.user.count();

  if (userCount === 0) {
    // No users — safe to do a full clean reset before seeding
    console.log("No users found — performing full reset...");
    await prisma.userSurahProgress.deleteMany();
    await prisma.userVocabularyWord.deleteMany();
    await prisma.progress.deleteMany();
    await prisma.chatMessage.deleteMany();
    await prisma.userAchievement.deleteMany();
    await prisma.streak.deleteMany();
    await prisma.achievement.deleteMany();
    await prisma.lesson.deleteMany();
    await prisma.chapter.deleteMany();
    await prisma.user.deleteMany();
    await prisma.vocabularyWord.deleteMany();
    await prisma.tadabburSurah.deleteMany();
  } else {
    // Users exist — only refresh vocabulary/tadabbur; preserve all user progress
    console.log(`${userCount} user(s) found — preserving accounts and progress, refreshing vocabulary/tadabbur...`);
    await prisma.userSurahProgress.deleteMany();
    await prisma.userVocabularyWord.deleteMany();
    await prisma.vocabularyWord.deleteMany();
    await prisma.tadabburSurah.deleteMany();
  }

  // Upsert achievements by key (safe for both modes)
  for (const achievement of ACHIEVEMENTS) {
    await prisma.achievement.upsert({
      where: { key: achievement.key },
      update: achievement,
      create: achievement,
    });
  }

  // Upsert chapters by order — stable across seed runs
  const allChapters = [...chapters, ...chapters2, ...chapters3, ...chapters4];
  const chapterIdByOrder = new Map();

  for (const chapterData of allChapters) {
    const { lessons: _unused, ...chapterFields } = chapterData;
    const created = await prisma.chapter.upsert({
      where: { order: chapterFields.order },
      update: chapterFields,
      create: chapterFields,
    });
    chapterIdByOrder.set(created.order, created.id);
  }

  // Upsert lessons with stable IDs (ch01-l01 … ch08-l04).
  // Stable IDs mean progress records survive future seed runs.
  const ch1Id = chapterIdByOrder.get(1);
  const ch2Id = chapterIdByOrder.get(2);
  const ch3Id = chapterIdByOrder.get(3);
  const ch4Id = chapterIdByOrder.get(4);
  const ch5Id = chapterIdByOrder.get(5);
  const ch6Id = chapterIdByOrder.get(6);
  const ch7Id = chapterIdByOrder.get(7);
  const ch8Id = chapterIdByOrder.get(8);
  const ch9Id  = chapterIdByOrder.get(9);
  const ch10Id = chapterIdByOrder.get(10);
  const ch11Id = chapterIdByOrder.get(11);
  const ch12Id = chapterIdByOrder.get(12);
  const ch13Id = chapterIdByOrder.get(13);
  const ch14Id = chapterIdByOrder.get(14);
  const ch15Id = chapterIdByOrder.get(15);
  const ch16Id = chapterIdByOrder.get(16);
  const ch17Id = chapterIdByOrder.get(17);
  const ch18Id = chapterIdByOrder.get(18);
  const ch19Id = chapterIdByOrder.get(19);
  const ch20Id = chapterIdByOrder.get(20);
  const ch21Id = chapterIdByOrder.get(21);
  const ch22Id = chapterIdByOrder.get(22);
  const ch23Id = chapterIdByOrder.get(23);
  const ch24Id = chapterIdByOrder.get(24);
  const ch25Id = chapterIdByOrder.get(25);
  const ch26Id = chapterIdByOrder.get(26);
  const ch27Id = chapterIdByOrder.get(27);
  const ch28Id = chapterIdByOrder.get(28);
  const ch29Id = chapterIdByOrder.get(29);
  const ch30Id = chapterIdByOrder.get(30);
  const ch31Id = chapterIdByOrder.get(31);
  const ch32Id = chapterIdByOrder.get(32);
  const ch33Id = chapterIdByOrder.get(33);
  const ch34Id = chapterIdByOrder.get(34);
  const ch35Id = chapterIdByOrder.get(35);
  const ch36Id = chapterIdByOrder.get(36);
  const ch37Id = chapterIdByOrder.get(37);
  const ch38Id = chapterIdByOrder.get(38);
  const ch39Id = chapterIdByOrder.get(39);
  const ch40Id = chapterIdByOrder.get(40);
  const ch41Id = chapterIdByOrder.get(41);
  const ch42Id = chapterIdByOrder.get(42);
  const ch43Id = chapterIdByOrder.get(43);
  const ch44Id = chapterIdByOrder.get(44);
  const ch45Id = chapterIdByOrder.get(45);


  const lessons = [
    // Chapter 1
    { id: "ch01-l01", chapterId: ch1Id, order: 1, title: "First Encounter with هَذَا",           titleAr: "اللقاء الأول مع هَذَا",                    template: "STANDARD", xpReward: ch01L01Content._meta?.xp_reward ?? 10, content: ch01L01Content },
    { id: "ch01-l02", chapterId: ch1Id, order: 2, title: "That, What, and Who — ذٰلِكَ، مَا، مَنْ", titleAr: "ذٰلِكَ وَمَا وَمَنْ",                        template: "STANDARD", xpReward: ch01L02Content._meta?.xp_reward ?? 10, content: ch01L02Content },
    { id: "ch01-l03", chapterId: ch1Id, order: 3, title: "Feminine Forms — هَذِهِ and تِلْكَ",      titleAr: "هَذِهِ وَتِلْكَ",                            template: "STANDARD", xpReward: ch01L03Content._meta?.xp_reward ?? 10, content: ch01L03Content },
    { id: "ch01-l04", chapterId: ch1Id, order: 4, title: "Chapter 1 Review",                      titleAr: "مُرَاجَعَة الفَصْل الأَوَّل",                template: "REVIEW",   xpReward: ch01L04Content._meta?.xp_reward ?? 20, content: ch01L04Content },
    // Chapter 2
    { id: "ch02-l01", chapterId: ch2Id, order: 1, title: "Tanween — The Sound of 'A'",            titleAr: "التَّنْوِين — صَوْتُ النَّكِرَة",            template: "STANDARD", xpReward: ch02L01Content._meta?.xp_reward ?? 10, content: ch02L01Content },
    { id: "ch02-l02", chapterId: ch2Id, order: 2, title: "ال — The Definite Article",              titleAr: "التَّعْرِيف بِالْ",                          template: "STANDARD", xpReward: ch02L02Content._meta?.xp_reward ?? 10, content: ch02L02Content },
    { id: "ch02-l03", chapterId: ch2Id, order: 3, title: "أَيْنَ — Where?",                        titleAr: "أَيْنَ وَحُرُوف الْجَرّ",                    template: "STANDARD", xpReward: ch02L03Content._meta?.xp_reward ?? 10, content: ch02L03Content },
    { id: "ch02-l04", chapterId: ch2Id, order: 4, title: "Chapter 2 Review",                      titleAr: "مُرَاجَعَة الفَصْل الثَّانِي",               template: "REVIEW",   xpReward: ch02L04Content._meta?.xp_reward ?? 20, content: ch02L04Content },
    // Chapter 3
    { id: "ch03-l01", chapterId: ch3Id, order: 1, title: "The Idafa Construction — Possession",   titleAr: "الإِضَافَة — الْمِلْكِيَّة",                 template: "STANDARD", xpReward: ch03L01Content._meta?.xp_reward ?? 10, content: ch03L01Content },
    { id: "ch03-l02", chapterId: ch3Id, order: 2, title: "Whose? and O! — لِمَنْ and يَا",         titleAr: "لِمَنْ وَيَا",                               template: "STANDARD", xpReward: ch03L02Content._meta?.xp_reward ?? 10, content: ch03L02Content },
    { id: "ch03-l03", chapterId: ch3Id, order: 3, title: "Basmalah Unlocked — بِسْمِ اللَّهِ",     titleAr: "بِسْمِ اللَّهِ الرَّحْمٰنِ الرَّحِيمِ",     template: "STANDARD", xpReward: ch03L03Content._meta?.xp_reward ?? 10, content: ch03L03Content },
    { id: "ch03-l04", chapterId: ch3Id, order: 4, title: "Chapter 3 Review",                      titleAr: "مُرَاجَعَة الفَصْل الثَّالِث",               template: "REVIEW",   xpReward: ch03L04Content._meta?.xp_reward ?? 20, content: ch03L04Content },
    { id: "ch03-l05", chapterId: ch3Id, order: 5, title: "SP1 — Greetings and Introductions",      titleAr: "السَّلَامُ وَالتَّعَارُف",                    template: "SPOKEN_PHRASES", xpReward: ch03L05SpokenContent._meta?.xp_reward ?? 15, content: ch03L05SpokenContent },
    // Chapter 4
    { id: "ch04-l01", chapterId: ch4Id, order: 1, title: "Adjective Follows Noun",                titleAr: "الصِّفَة بَعْدَ الْمَوْصُوف",                template: "STANDARD", xpReward: ch04L01Content._meta?.xp_reward ?? 10, content: ch04L01Content },
    { id: "ch04-l02", chapterId: ch4Id, order: 2, title: "Definite Agreement — الْبَيْتُ الْكَبِيرُ", titleAr: "الصِّفَة الْمَعْرِفَة",                  template: "STANDARD", xpReward: ch04L02Content._meta?.xp_reward ?? 10, content: ch04L02Content },
    { id: "ch04-l03", chapterId: ch4Id, order: 3, title: "Feminine Agreement — كَلِمَةٌ طَيِّبَةٌ",  titleAr: "الصِّفَة الْمُؤَنَّثَة",                   template: "STANDARD", xpReward: ch04L03Content._meta?.xp_reward ?? 10, content: ch04L03Content },
    { id: "ch04-l04", chapterId: ch4Id, order: 4, title: "Chapter 4 Review",                      titleAr: "مُرَاجَعَة الْفَصْل الرَّابِع",              template: "REVIEW",   xpReward: ch04L04Content._meta?.xp_reward ?? 20, content: ch04L04Content },
    // Chapter 5
    { id: "ch05-l01", chapterId: ch5Id, order: 1, title: "This Feminine — هَٰذِهِ",                 titleAr: "هَٰذِهِ لِلْمُؤَنَّثِ الْقَرِيب",                       template: "STANDARD", xpReward: ch05L01Content._meta?.xp_reward ?? 10, content: ch05L01Content },
    { id: "ch05-l02", chapterId: ch5Id, order: 2, title: "That Feminine — تِلْكَ",                 titleAr: "تِلْكَ لِلْمُؤَنَّثِ الْبَعِيد",                        template: "STANDARD", xpReward: ch05L02Content._meta?.xp_reward ?? 10, content: ch05L02Content },
    { id: "ch05-l03", chapterId: ch5Id, order: 3, title: "Possession — لِي، لَكَ، لَهُ",           titleAr: "لَامُ الْمِلْكِيَّة",                                  template: "STANDARD", xpReward: ch05L03Content._meta?.xp_reward ?? 10, content: ch05L03Content },
    { id: "ch05-l04", chapterId: ch5Id, order: 4, title: "First Verb — ذَهَبَ",                    titleAr: "أَوَّلُ فِعْلٍ — ذَهَبَ",                              template: "STANDARD", xpReward: ch05L04Content._meta?.xp_reward ?? 10, content: ch05L04Content },
    { id: "ch05-l05", chapterId: ch5Id, order: 5, title: "R1 Review — Mid-Book 1",                 titleAr: "المُرَاجَعَةُ الأُولَى — مُنْتَصَفُ الكِتَابِ الأَوَّل",  template: "REVIEW",   xpReward: ch05L05Content._meta?.xp_reward ?? 20, content: ch05L05Content },
    // Chapter 6
    { id: "ch06-l01", chapterId: ch6Id, order: 1, title: "Described Subject — الرَّجُلُ الْكَرِيمُ", titleAr: "المُبْتَدَأ المَوْصُوف",                   template: "STANDARD", xpReward: ch06L01Content._meta?.xp_reward ?? 10, content: ch06L01Content },
    { id: "ch06-l02", chapterId: ch6Id, order: 2, title: "الَّذِي — Who, That, Which",              titleAr: "الَّذِي — اسْمٌ مَوْصُول",                 template: "STANDARD", xpReward: ch06L02Content._meta?.xp_reward ?? 10, content: ch06L02Content },
    { id: "ch06-l03", chapterId: ch6Id, order: 3, title: "الَّذِي with Place Phrases",             titleAr: "الَّذِي مَعَ عِبَارَاتِ المَكَان",          template: "STANDARD", xpReward: ch06L03Content._meta?.xp_reward ?? 10, content: ch06L03Content },
    { id: "ch06-l04", chapterId: ch6Id, order: 4, title: "الَّذِي in Al-A'la",                     titleAr: "الَّذِي فِي سُورَةِ الأَعْلَى",             template: "STANDARD", xpReward: ch06L04Content._meta?.xp_reward ?? 10, content: ch06L04Content },
    // Chapter 7
    { id: "ch07-l01", chapterId: ch7Id, order: 1, title: "My — attached ي",                         titleAr: "كِتَابِي — يَاءُ المُتَكَلِّم",              template: "STANDARD", xpReward: ch07L01Content._meta?.xp_reward ?? 10, content: ch07L01Content },
    { id: "ch07-l02", chapterId: ch7Id, order: 2, title: "Your — attached كَ and كِ",               titleAr: "كِتَابُكَ — كَافُ الخِطَاب",                template: "STANDARD", xpReward: ch07L02Content._meta?.xp_reward ?? 10, content: ch07L02Content },
    { id: "ch07-l03", chapterId: ch7Id, order: 3, title: "His and Her — attached هُ and هَا",        titleAr: "كِتَابُهُ وَمَدْرَسَتُهَا",                 template: "STANDARD", xpReward: ch07L03Content._meta?.xp_reward ?? 10, content: ch07L03Content },
    { id: "ch07-l04", chapterId: ch7Id, order: 4, title: "I Have — عِنْدِي",                         titleAr: "عِنْدِي — المِلْكِيَّة بِعِنْد",             template: "STANDARD", xpReward: ch07L04Content._meta?.xp_reward ?? 10, content: ch07L04Content },
    { id: "ch07-l05", chapterId: ch7Id, order: 5, title: "SP2 - Simple Questions",                    titleAr: "الأَسْئِلَةُ السَّهْلَة",                               template: "SPOKEN_PHRASES", xpReward: ch07L05SpokenContent._meta?.xp_reward ?? 15, content: ch07L05SpokenContent },
    // Chapter 8
    { id: "ch08-l01", chapterId: ch8Id, order: 1, title: "She Went - ذَهَبَتْ",                        titleAr: "ذَهَبَتْ - تَاءُ التَّأْنِيث",                         template: "STANDARD", xpReward: ch08L01Content._meta?.xp_reward ?? 10, content: ch08L01Content },
    { id: "ch08-l02", chapterId: ch8Id, order: 2, title: "Feminine Marker Across Verbs",              titleAr: "تَاءُ التَّأْنِيث فِي الأَفْعَال",                       template: "STANDARD", xpReward: ch08L02Content._meta?.xp_reward ?? 10, content: ch08L02Content },
    { id: "ch08-l03", chapterId: ch8Id, order: 3, title: "الَّتِي - Feminine Relative",                titleAr: "الَّتِي - اسْمٌ مَوْصُولٌ مُؤَنَّث",                    template: "STANDARD", xpReward: ch08L03Content._meta?.xp_reward ?? 10, content: ch08L03Content },
    { id: "ch08-l04", chapterId: ch8Id, order: 4, title: "My Mother - أُمِّي",                         titleAr: "أُمِّي - تَطْبِيقُ المُؤَنَّث",                          template: "STANDARD", xpReward: ch08L04Content._meta?.xp_reward ?? 10, content: ch08L04Content },
    // Chapter 9
    { id: "ch09-l01", chapterId: ch9Id, order: 1, title: "Sound Masculine Plural — مُسْلِمُونَ",    titleAr: "جَمْعُ الْمُذَكَّرِ السَّالِم",          template: "STANDARD",     xpReward: ch09L01Content._meta?.xp_reward     ?? 10, content: ch09L01Content },
    { id: "ch09-l02", chapterId: ch9Id, order: 2, title: "Sound Feminine Plural — مُؤْمِنَاتٌ",    titleAr: "جَمْعُ الْمُؤَنَّثِ السَّالِم",          template: "STANDARD",     xpReward: ch09L02Content._meta?.xp_reward     ?? 10, content: ch09L02Content },
    { id: "ch09-l03", chapterId: ch9Id, order: 3, title: "Broken Plural — كُتُبٌ and بُيُوتٌ",     titleAr: "الْجَمْعُ الْمُكَسَّر",                  template: "STANDARD",     xpReward: ch09L03Content._meta?.xp_reward     ?? 10, content: ch09L03Content },
    { id: "ch09-l04", chapterId: ch9Id, order: 4, title: "Plural Demonstrative — هٰؤُلَاءِ",        titleAr: "هٰؤُلَاءِ لِلْجَمَاعَة",                 template: "STANDARD",     xpReward: ch09L04Content._meta?.xp_reward     ?? 10, content: ch09L04Content },
    { id: "ch09-l05", chapterId: ch9Id, order: 5, title: "Verb Pattern — Past Tense ذَهَبَ",        titleAr: "فِعْل مَاضٍ — نَمُوذَج الصَّرْف",        template: "VERB_PATTERN", xpReward: ch09L05VerbContent._meta?.xp_reward ?? 10, content: ch09L05VerbContent },
    // Chapter 10
    { id: "ch10-l01", chapterId: ch10Id, order: 1, title: "Plural Pronouns — هُمْ and هُنَّ",       titleAr: "هُمْ وَهُنَّ — ضَمِيرُ الْجَمَاعَة",    template: "STANDARD",     xpReward: ch10L01Content._meta?.xp_reward     ?? 10, content: ch10L01Content },
    { id: "ch10-l02", chapterId: ch10Id, order: 2, title: "We — نَحْنُ",                            titleAr: "نَحْنُ — ضَمِيرُ الْمُتَكَلِّمِ الجَمْع", template: "STANDARD",    xpReward: ch10L02Content._meta?.xp_reward     ?? 10, content: ch10L02Content },
    { id: "ch10-l03", chapterId: ch10Id, order: 3, title: "Before — قَبْلَ",                        titleAr: "قَبْلَ — الظَّرْفُ الزَّمَانِيّ",         template: "STANDARD",    xpReward: ch10L03Content._meta?.xp_reward     ?? 10, content: ch10L03Content },
    { id: "ch10-l04", chapterId: ch10Id, order: 4, title: "After — بَعْدَ",                         titleAr: "بَعْدَ — الظَّرْفُ الزَّمَانِيّ",         template: "STANDARD",    xpReward: ch10L04Content._meta?.xp_reward     ?? 10, content: ch10L04Content },
    // Chapter 11
    { id: "ch11-l01", chapterId: ch11Id, order: 1, title: "My Father and My Mother — أَبِي and أُمِّي", titleAr: "أَبِي وَأُمِّي",                    template: "STANDARD",    xpReward: ch11L01Content._meta?.xp_reward     ?? 10, content: ch11L01Content },
    { id: "ch11-l02", chapterId: ch11Id, order: 2, title: "Family Vocabulary",                      titleAr: "كَلِمَاتُ الْعَائِلَة",                   template: "STANDARD",    xpReward: ch11L02Content._meta?.xp_reward     ?? 10, content: ch11L02Content },
    { id: "ch11-l03", chapterId: ch11Id, order: 3, title: "In It — فِيهِ",                          titleAr: "فِيهِ — ضَمِيرُ الْمُفْرَدِ الْغَائِب",  template: "STANDARD",    xpReward: ch11L03Content._meta?.xp_reward     ?? 10, content: ch11L03Content },
    { id: "ch11-l04", chapterId: ch11Id, order: 4, title: "In It — فِيهَا",                         titleAr: "فِيهَا — ضَمِيرُ الْمُؤَنَّث",            template: "STANDARD",    xpReward: ch11L04Content._meta?.xp_reward     ?? 10, content: ch11L04Content },
    { id: "ch11-l05", chapterId: ch11Id, order: 5, title: "Home in the Quran — بُيُوتِكُمْ",        titleAr: "بُيُوتِكُمْ فِي الْقُرْآن",               template: "STANDARD",    xpReward: ch11L05Content._meta?.xp_reward     ?? 10, content: ch11L05Content },
    // Chapter 12
    { id: "ch12-l01", chapterId: ch12Id, order: 1, title: "What Is Your Name?",                     titleAr: "مَا اسْمُكَ؟",                            template: "STANDARD",        xpReward: ch12L01Content._meta?.xp_reward       ?? 10, content: ch12L01Content },
    { id: "ch12-l02", chapterId: ch12Id, order: 2, title: "Where Are You From?",                    titleAr: "مِنْ أَيْنَ أَنْتَ؟",                     template: "STANDARD",        xpReward: ch12L02Content._meta?.xp_reward       ?? 10, content: ch12L02Content },
    { id: "ch12-l03", chapterId: ch12Id, order: 3, title: "Professions",                            titleAr: "الْمِهَن",                                template: "STANDARD",        xpReward: ch12L03Content._meta?.xp_reward       ?? 10, content: ch12L03Content },
    { id: "ch12-l04", chapterId: ch12Id, order: 4, title: "Past Tense as Vocabulary",               titleAr: "الْفِعْل الْمَاضِي لِلتَّعَرُّف",          template: "STANDARD",        xpReward: ch12L04Content._meta?.xp_reward       ?? 10, content: ch12L04Content },
    { id: "ch12-l05", chapterId: ch12Id, order: 5, title: "SP3 - Classroom and Halaqa Phrases",      titleAr: "عِبَارَاتُ الدَّرْسِ وَالحَلْقَة",        template: "SPOKEN_PHRASES",  xpReward: ch12L05SpokenContent._meta?.xp_reward ?? 15, content: ch12L05SpokenContent },
    // Chapter 13
    { id: "ch13-l01", chapterId: ch13Id, order: 1, title: "Sound Masculine Plural — ونَ",            titleAr: "الْمُذَكَّر السَّالِم",                   template: "STANDARD",        xpReward: ch13L01Content._meta?.xp_reward       ?? 10, content: ch13L01Content },
    { id: "ch13-l02", chapterId: ch13Id, order: 2, title: "Sound Feminine Plural — ات",              titleAr: "الْمُؤَنَّث السَّالِم",                   template: "STANDARD",        xpReward: ch13L02Content._meta?.xp_reward       ?? 10, content: ch13L02Content },
    { id: "ch13-l03", chapterId: ch13Id, order: 3, title: "Broken Plurals — Recognition",            titleAr: "الْجَمْع الْمُكَسَّر",                    template: "STANDARD",        xpReward: ch13L03Content._meta?.xp_reward       ?? 10, content: ch13L03Content },
    { id: "ch13-l04", chapterId: ch13Id, order: 4, title: "Non-Human Plurals — Feminine Treatment",  titleAr: "جَمْع غَيْر الْعَاقِل",                   template: "STANDARD",        xpReward: ch13L04Content._meta?.xp_reward       ?? 10, content: ch13L04Content },
    // Chapter 14
    { id: "ch14-l01", chapterId: ch14Id, order: 1, title: "Adjectives with Human Plurals",           titleAr: "الصِّفَة مَعَ الْجَمْعِ الْعَاقِل",        template: "STANDARD",        xpReward: ch14L01Content._meta?.xp_reward       ?? 10, content: ch14L01Content },
    { id: "ch14-l02", chapterId: ch14Id, order: 2, title: "The Non-Human Plural Rule",               titleAr: "جَمْعُ غَيْرِ الْعَاقِل + الصِّفَة الْمُفْرَدَة الْمُؤَنَّثَة", template: "STANDARD", xpReward: ch14L02Content._meta?.xp_reward ?? 10, content: ch14L02Content },
    { id: "ch14-l03", chapterId: ch14Id, order: 3, title: "Non-Human Plurals in the Quran",          titleAr: "جَمْعُ غَيْرِ الْعَاقِل فِي الْقُرْآن",   template: "STANDARD",        xpReward: ch14L03Content._meta?.xp_reward       ?? 10, content: ch14L03Content },
    { id: "ch14-l04", chapterId: ch14Id, order: 4, title: "Human vs Non-Human: Spotting the Diff",   titleAr: "الْعَاقِل وَغَيْرُ الْعَاقِل — الْفَرْق", template: "STANDARD",        xpReward: ch14L04Content._meta?.xp_reward       ?? 10, content: ch14L04Content },
    { id: "ch14-l05", chapterId: ch14Id, order: 5, title: "Chapter 14 Review — Plural Agreement",    titleAr: "مُرَاجَعَة — الصِّفَة مَعَ الْجَمْع",     template: "REVIEW",          xpReward: ch14L05Content._meta?.xp_reward       ?? 10, content: ch14L05Content },
    // Chapter 15
    { id: "ch15-l01", chapterId: ch15Id, order: 1, title: "هَؤُلَاءِ — These (Near)",              titleAr: "هَؤُلَاءِ — هَذِهِ لِلْجَمَاعَة",          template: "STANDARD",        xpReward: ch15L01Content._meta?.xp_reward       ?? 10, content: ch15L01Content },
    { id: "ch15-l02", chapterId: ch15Id, order: 2, title: "أُولَٰئِكَ — Those (Far)",               titleAr: "أُولَٰئِكَ — تِلْكَ لِلْجَمَاعَة",          template: "STANDARD",        xpReward: ch15L02Content._meta?.xp_reward       ?? 10, content: ch15L02Content },
    { id: "ch15-l03", chapterId: ch15Id, order: 3, title: "Contrast: هَؤُلَاءِ vs أُولَٰئِكَ",    titleAr: "الْفَرْقُ بَيْنَ هَؤُلَاءِ وَأُولَٰئِكَ",  template: "STANDARD",        xpReward: ch15L03Content._meta?.xp_reward       ?? 10, content: ch15L03Content },
    { id: "ch15-l04", chapterId: ch15Id, order: 4, title: "Position Words — أَمَام، خَلْف، فَوْق، تَحْت", titleAr: "أَسْمَاءُ الْمَوَاضِع", template: "STANDARD", xpReward: ch15L04Content._meta?.xp_reward ?? 10, content: ch15L04Content },
    { id: "ch15-l05", chapterId: ch15Id, order: 5, title: "Chapter 15 Review",                      titleAr: "مُرَاجَعَة الْفَصْل الْخَامِس عَشَر",      template: "REVIEW",          xpReward: ch15L05Content._meta?.xp_reward       ?? 5,  content: ch15L05Content },
    // Chapter 16
    { id: "ch16-l01", chapterId: ch16Id, order: 1, title: "School Places and Things",              titleAr: "أَمَاكِنُ الْمَدْرَسَةِ وَأَشْيَاؤُهَا",   template: "STANDARD",        xpReward: ch16L01Content._meta?.xp_reward       ?? 10, content: ch16L01Content },
    { id: "ch16-l02", chapterId: ch16Id, order: 2, title: "Teacher and Student",                   titleAr: "الْأُسْتَاذُ وَالطَّالِبُ",               template: "STANDARD",        xpReward: ch16L02Content._meta?.xp_reward       ?? 10, content: ch16L02Content },
    { id: "ch16-l03", chapterId: ch16Id, order: 3, title: "Time Markers — الْيَوْم، أَمْس، غَدًا", titleAr: "الْإِشَارَةُ إِلَى الْوَقْتِ",           template: "STANDARD",        xpReward: ch16L03Content._meta?.xp_reward       ?? 10, content: ch16L03Content },
    { id: "ch16-l04", chapterId: ch16Id, order: 4, title: "Classroom Imperatives",                titleAr: "أَوَامِرُ الْفَصْلِ",                    template: "STANDARD",        xpReward: ch16L04Content._meta?.xp_reward       ?? 10, content: ch16L04Content },
    { id: "ch16-l05", chapterId: ch16Id, order: 5, title: "Chapter 16 Review",                    titleAr: "مُرَاجَعَة الْفَصْل السَّادِس عَشَر",    template: "REVIEW",          xpReward: ch16L05Content._meta?.xp_reward       ?? 5,  content: ch16L05Content },
    // Chapter 17
    { id: "ch17-l01", chapterId: ch17Id, order: 1, title: "أَكَلَ and شَرِبَ — Eating and Drinking",titleAr: "أَكَلَ وَشَرِبَ",                         template: "STANDARD",        xpReward: ch17L01Content._meta?.xp_reward       ?? 10, content: ch17L01Content },
    { id: "ch17-l02", chapterId: ch17Id, order: 2, title: "قَرَأَ and كَتَبَ — Reading and Writing", titleAr: "قَرَأَ وَكَتَبَ",                         template: "STANDARD",        xpReward: ch17L02Content._meta?.xp_reward       ?? 10, content: ch17L02Content },
    { id: "ch17-l03", chapterId: ch17Id, order: 3, title: "نَامَ and قَامَ — Sleeping and Standing", titleAr: "نَامَ وَقَامَ",                          template: "STANDARD",        xpReward: ch17L03Content._meta?.xp_reward       ?? 10, content: ch17L03Content },
    { id: "ch17-l04", chapterId: ch17Id, order: 4, title: "صَلَّى and ذَهَبَ — Prayer and Going",   titleAr: "صَلَّى وَذَهَبَ",                        template: "STANDARD",        xpReward: ch17L04Content._meta?.xp_reward       ?? 10, content: ch17L04Content },
    { id: "ch17-l05", chapterId: ch17Id, order: 5, title: "جَلَسَ and سَمِعَ — Sitting and Hearing", titleAr: "جَلَسَ وَسَمِعَ",                        template: "STANDARD",        xpReward: ch17L05Content._meta?.xp_reward       ?? 10, content: ch17L05Content },
    { id: "ch17-l06", chapterId: ch17Id, order: 6, title: "ت Marker — Masculine vs Feminine",      titleAr: "تَاءُ التَّأْنِيثِ — الْفَاعِل الْمُؤَنَّثُ", template: "STANDARD",        xpReward: ch17L06Content._meta?.xp_reward       ?? 10, content: ch17L06Content },
    // Chapter 18
    { id: "ch18-l01", chapterId: ch18Id, order: 1, title: "الَّذِي — The One Who (Masculine)",      titleAr: "الَّذِي — اسْمٌ مَوْصُولٌ مُذَكَّر",      template: "STANDARD",        xpReward: ch18L01Content._meta?.xp_reward       ?? 10, content: ch18L01Content },
    { id: "ch18-l02", chapterId: ch18Id, order: 2, title: "الَّتِي — The One Who (Feminine)",       titleAr: "الَّتِي — اسْمٌ مَوْصُولٌ مُؤَنَّث",      template: "STANDARD",        xpReward: ch18L02Content._meta?.xp_reward       ?? 10, content: ch18L02Content },
    { id: "ch18-l03", chapterId: ch18Id, order: 3, title: "Contrast: الَّذِي vs الَّتِي",           titleAr: "الْفَرْقُ بَيْنَ الَّذِي وَالَّتِي",      template: "STANDARD",        xpReward: ch18L03Content._meta?.xp_reward       ?? 10, content: ch18L03Content },
    { id: "ch18-l04", chapterId: ch18Id, order: 4, title: "الَّذِي Deep Practice",                  titleAr: "تَمْرِينُ الَّذِي — مُزَلْزِلٌ",          template: "STANDARD",        xpReward: ch18L04Content._meta?.xp_reward       ?? 10, content: ch18L04Content },
    { id: "ch18-l05", chapterId: ch18Id, order: 5, title: "الَّتِي Deep Practice",                  titleAr: "تَمْرِينُ الَّتِي — مُزَلْزِلٌ",          template: "STANDARD",        xpReward: ch18L05Content._meta?.xp_reward       ?? 10, content: ch18L05Content },
    { id: "ch18-l06", chapterId: ch18Id, order: 6, title: "An-Nas Integration — Tadabbur Unlock #2", titleAr: "النَّاس — تَحَابُّ الَّذِي",           template: "STANDARD",        xpReward: ch18L06Content._meta?.xp_reward       ?? 10, content: ch18L06Content },
    // Chapter 19
    { id: "ch19-l01", chapterId: ch19Id, order: 1, title: "My — ي (my)",                            titleAr: "كِتَابِي — يَاءُ الْمِلْكِيَّة",           template: "STANDARD",        xpReward: ch19L01Content._meta?.xp_reward       ?? 10, content: ch19L01Content },
    { id: "ch19-l02", chapterId: ch19Id, order: 2, title: "Your — كَ and كِ (your-m/f)",            titleAr: "كِتَابُكَ — كَافُ الْخِطَابِ",            template: "STANDARD",        xpReward: ch19L02Content._meta?.xp_reward       ?? 10, content: ch19L02Content },
    { id: "ch19-l03", chapterId: ch19Id, order: 3, title: "His and Her — هُ and هَا",               titleAr: "كِتَابُهُ وَكِتَابُهَا",                  template: "STANDARD",        xpReward: ch19L03Content._meta?.xp_reward       ?? 10, content: ch19L03Content },
    { id: "ch19-l04", chapterId: ch19Id, order: 4, title: "Full Singular Paradigm",                 titleAr: "جَدْوَلُ الضَّمَائِر الْمُفْرَدَة",       template: "STANDARD",        xpReward: ch19L04Content._meta?.xp_reward       ?? 10, content: ch19L04Content },
    { id: "ch19-l05", chapterId: ch19Id, order: 5, title: "Plural Possessives — أَنْفُسُهُمْ",     titleAr: "أَنْفُسُهُمْ وَأَنْفُسُكُمْ",            template: "STANDARD",        xpReward: ch19L05Content._meta?.xp_reward       ?? 10, content: ch19L05Content },
    { id: "ch19-l06", chapterId: ch19Id, order: 6, title: "Al-Falaq Integration — Tadabbur #3",     titleAr: "الْفَلَقُ — رَبِّي رَبُّكُمْ رَبُّنَا",   template: "STANDARD",        xpReward: ch19L06Content._meta?.xp_reward       ?? 10, content: ch19L06Content },
    // Chapter 20
    { id: "ch20-l01", chapterId: ch20Id, order: 1, title: "Our — نَا (our)",                       titleAr: "رَبَّنَا — نَا الْجَمْعِيَّة",              template: "STANDARD",        xpReward: ch20L01Content._meta?.xp_reward       ?? 10, content: ch20L01Content },
    { id: "ch20-l02", chapterId: ch20Id, order: 2, title: "Your-pl — كُمْ (your-pl)",              titleAr: "رَبَّكُمْ — كُمْ لِلْجَمَاعَة",           template: "STANDARD",        xpReward: ch20L02Content._meta?.xp_reward       ?? 10, content: ch20L02Content },
    { id: "ch20-l03", chapterId: ch20Id, order: 3, title: "Their — هُمْ and هُنَّ",               titleAr: "رَبَّهُمْ وَرَبَّهُنَّ",                  template: "STANDARD",        xpReward: ch20L03Content._meta?.xp_reward       ?? 10, content: ch20L03Content },
    { id: "ch20-l04", chapterId: ch20Id, order: 4, title: "Singular vs Plural Contrast",             titleAr: "الْمُفْرَدُ وَالْجَمْعُ — الْفَرْقُ",     template: "STANDARD",        xpReward: ch20L04Content._meta?.xp_reward       ?? 10, content: ch20L04Content },
    { id: "ch20-l05", chapterId: ch20Id, order: 5, title: "رَبَّنَا in Al-Fatiha + Al-Ikhlas",     titleAr: "رَبَّنَا فِي الْفَاتِحَةِ وَالْإِخْلَاص", template: "STANDARD",        xpReward: ch20L05Content._meta?.xp_reward       ?? 10, content: ch20L05Content },
    // Chapter 21
    { id: "ch21-l01", chapterId: ch21Id, order: 1, title: "Places — مَدِينَة، قَرْيَة، سُوق",      titleAr: "الْمَكَانُ — مَدِينَةٌ وَقَرْيَةٌ",     template: "STANDARD",        xpReward: ch21L01Content._meta?.xp_reward       ?? 10, content: ch21L01Content },
    { id: "ch21-l02", chapterId: ch21Id, order: 2, title: "Directional Prepositions — إِلَى، مِنْ، فِي", titleAr: "حُرُوفُ الْجِهَةِ",                   template: "STANDARD",        xpReward: ch21L02Content._meta?.xp_reward       ?? 10, content: ch21L02Content },
    { id: "ch21-l03", chapterId: ch21Id, order: 3, title: "Movement Verbs — ذَهَبَ، خَرَجَ، دَخَلَ", titleAr: "أَفْعَالُ الْحَرَكَةِ",                 template: "STANDARD",        xpReward: ch21L03Content._meta?.xp_reward       ?? 10, content: ch21L03Content },
    { id: "ch21-l04", chapterId: ch21Id, order: 4, title: "Position Words — أَمَام، خَلْف، فَوْق، تَحْت", titleAr: "أَسْمَاءُ الْمَوَاضِعِ",             template: "STANDARD",        xpReward: ch21L04Content._meta?.xp_reward       ?? 10, content: ch21L04Content },
    { id: "ch21-l05", chapterId: ch21Id, order: 5, title: "Chapter 21 Review",                     titleAr: "مُرَاجَعَة الْفَصْل الْحَادِي وَالْعِشْرِينَ", template: "REVIEW",      xpReward: ch21L05Content._meta?.xp_reward       ?? 5,  content: ch21L05Content },
    // Chapter 22
    { id: "ch22-l01", chapterId: ch22Id, order: 1, title: "قَالَ — Speaker and Speech",            titleAr: "قَالَ — الْمُتَكَلِّمُ وَكَلَامُهُ",       template: "STANDARD",        xpReward: ch22L01Content._meta?.xp_reward       ?? 10, content: ch22L01Content },
    { id: "ch22-l02", chapterId: ch22Id, order: 2, title: "سَأَلَ — Asking Questions",             titleAr: "سَأَلَ — إِطْرَاحُ الْأَسْئِلَة",          template: "STANDARD",        xpReward: ch22L02Content._meta?.xp_reward       ?? 10, content: ch22L02Content },
    { id: "ch22-l03", chapterId: ch22Id, order: 3, title: "أَجَابَ — Answering",                   titleAr: "أَجَابَ — الرَّدُّ وَالْإِجَابَة",         template: "STANDARD",        xpReward: ch22L03Content._meta?.xp_reward       ?? 10, content: ch22L03Content },
    { id: "ch22-l04", chapterId: ch22Id, order: 4, title: "Full Conversation",                     titleAr: "الْحِوَارُ الْكَامِلُ",                  template: "STANDARD",        xpReward: ch22L04Content._meta?.xp_reward       ?? 10, content: ch22L04Content },
    { id: "ch22-l05", chapterId: ch22Id, order: 5, title: "Chapter 22 Review",                     titleAr: "مُرَاجَعَة الْفَصْل الثَّانِي وَالْعِشْرِينَ", template: "REVIEW",    xpReward: ch22L05Content._meta?.xp_reward       ?? 5,  content: ch22L05Content },
    // Chapter 23
    { id: "ch23-l01", chapterId: ch23Id, order: 1, title: "Idafa + Demonstratives Integration",    titleAr: "الْإِضَافَةُ وَإِشَارَةُ الْمَفْهُومِ", template: "STANDARD",        xpReward: ch23L01Content._meta?.xp_reward       ?? 10, content: ch23L01Content },
    { id: "ch23-l02", chapterId: ch23Id, order: 2, title: "Relative + Attached Pronouns Integration", titleAr: "الْمَوْصُولُ وَالضَّمِيرُ",             template: "STANDARD",        xpReward: ch23L02Content._meta?.xp_reward       ?? 10, content: ch23L02Content },
    { id: "ch23-l03", chapterId: ch23Id, order: 3, title: "Verbs + Prepositions + Plurals",       titleAr: "الْفِعْلُ وَالْحَرْفُ وَالْجَمْعُ",      template: "STANDARD",        xpReward: ch23L03Content._meta?.xp_reward       ?? 10, content: ch23L03Content },
    { id: "ch23-l04", chapterId: ch23Id, order: 4, title: "Full Review: Al-Falaq toward Al-Ikhlas", titleAr: "الْفَلَقُ وَالْإِخْلَاصُ",              template: "STANDARD",        xpReward: ch23L04Content._meta?.xp_reward       ?? 10, content: ch23L04Content },
    // Chapter 24
    { id: "ch24-l01", chapterId: ch24Id, order: 1, title: "The Particle إِنَّ — Indeed, Truly",       titleAr: "إِنَّ — حَرْفُ التَّوْكِيدِ",              template: "STANDARD",        xpReward: ch24L01Content._meta?.xp_reward       ?? 10, content: ch24L01Content },
    { id: "ch24-l02", chapterId: ch24Id, order: 2, title: "إِنَّ Takes Accusative — نصب",          titleAr: "إِنَّ تَنْصِبُ الْخَبَرَ",               template: "STANDARD",        xpReward: ch24L02Content._meta?.xp_reward       ?? 10, content: ch24L02Content },
    { id: "ch24-l03", chapterId: ch24Id, order: 3, title: "إِنَّا — We Truly",                     titleAr: "إِنَّا — نَحْنُ حَقًّا",                  template: "STANDARD",        xpReward: ch24L03Content._meta?.xp_reward       ?? 10, content: ch24L03Content },
    { id: "ch24-l04", chapterId: ch24Id, order: 4, title: "Numbers 1-10 in Arabic",                titleAr: "الْأَعْدَادُ مِنْ ١ إِلَى ١٠",           template: "STANDARD",        xpReward: ch24L04Content._meta?.xp_reward       ?? 10, content: ch24L04Content },
    { id: "ch24-l05", chapterId: ch24Id, order: 5, title: "Al-Kawthar: إِنَّا أَعْطَيْنَاكَ الْكَوْثَرَ", titleAr: "الْكَوْثَرُ — إِنَّا أَعْطَيْنَاكَ",  template: "STANDARD",        xpReward: ch24L05Content._meta?.xp_reward       ?? 10, content: ch24L05Content },
    { id: "ch24-l06", chapterId: ch24Id, order: 6, title: "إِنَّ with Descriptive Vocabulary",     titleAr: "إِنَّ مَعَ صِفَاتٍ",                      template: "STANDARD",        xpReward: ch24L06Content._meta?.xp_reward       ?? 10, content: ch24L06Content },
    // Chapter 25
    { id: "ch25-l01", chapterId: ch25Id, order: 1, title: "لَيْسَ — He Is Not",                    titleAr: "لَيْسَ — لَيْسَ هُوَ",                   template: "STANDARD",        xpReward: ch25L01Content._meta?.xp_reward       ?? 10, content: ch25L01Content },
    { id: "ch25-l02", chapterId: ch25Id, order: 2, title: "لَيْسَتْ — She Is Not",                 titleAr: "لَيْسَتْ — لَيْسَتْ هِيَ",               template: "STANDARD",        xpReward: ch25L02Content._meta?.xp_reward       ?? 10, content: ch25L02Content },
    { id: "ch25-l03", chapterId: ch25Id, order: 3, title: "لَيْسُوا — They Are Not",               titleAr: "لَيْسُوا — لَيْسُوا هُمْ",               template: "STANDARD",        xpReward: ch25L03Content._meta?.xp_reward       ?? 10, content: ch25L03Content },
    { id: "ch25-l04", chapterId: ch25Id, order: 4, title: "لَيْسَ with Adjectives",               titleAr: "لَيْسَ مَعَ الصِّفَاتِ",                  template: "STANDARD",        xpReward: ch25L04Content._meta?.xp_reward       ?? 10, content: ch25L04Content },
    { id: "ch25-l05", chapterId: ch25Id, order: 5, title: "إِنَّ vs لَيْسَ — Assertion vs Negation", titleAr: "إِنَّ وَلَيْسَ — الْإِيجَابُ وَالنَّفْيُ", template: "STANDARD", xpReward: ch25L05Content._meta?.xp_reward ?? 10, content: ch25L05Content },
    { id: "ch25-l06", chapterId: ch25Id, order: 6, title: "Al-Ikhlas Context: كُفُو أَحَد",        titleAr: "الْإِخْلَاصُ — لَمْ يَلِدْ وَلَمْ يُولَدْ", template: "STANDARD",        xpReward: ch25L06Content._meta?.xp_reward       ?? 10, content: ch25L06Content },
    // Chapter 26
    { id: "ch26-l01", chapterId: ch26Id, order: 1, title: "هَذَا/ذَلِكَ with Idafa",              titleAr: "الْمُشِيرُ وَالْإِضَافَةُ",                template: "STANDARD",        xpReward: ch26L01Content._meta?.xp_reward       ?? 10, content: ch26L01Content },
    { id: "ch26-l02", chapterId: ch26Id, order: 2, title: "هَؤُلَاء/أُولَئِكَ with Idafa",        titleAr: "الْمُشِيرُ الْجَمْعِيُّ وَالْإِضَافَةُ",  template: "STANDARD",        xpReward: ch26L02Content._meta?.xp_reward       ?? 10, content: ch26L02Content },
    { id: "ch26-l03", chapterId: ch26Id, order: 3, title: "Complex Idafa Chains",                titleAr: "سَلَاسِلُ الْإِضَافَةِ الْمُرَكَّبَة",     template: "STANDARD",        xpReward: ch26L03Content._meta?.xp_reward       ?? 10, content: ch26L03Content },
    { id: "ch26-l04", chapterId: ch26Id, order: 4, title: "Mixed: إِنَّ and لَيْسَ + Demonstratives", titleAr: "الْمُرَاجَعَةُ — إِنَّ وَلَيْسَ وَالْمُشِيرُ", template: "STANDARD", xpReward: ch26L04Content._meta?.xp_reward ?? 10, content: ch26L04Content },
    // Chapter 27
    { id: "ch27-l01", chapterId: ch27Id, order: 1, title: "فِي and إِلَى — In and To",            titleAr: "فِي وَإِلَى — حَرْفَا الْمَكَانِ",       template: "STANDARD",        xpReward: ch27L01Content._meta?.xp_reward       ?? 10, content: ch27L01Content },
    { id: "ch27-l02", chapterId: ch27Id, order: 2, title: "مِنْ and عَلَى — From and On",         titleAr: "مِنْ وَعَلَى — حَرْفَا الْجِهَةِ",        template: "STANDARD",        xpReward: ch27L02Content._meta?.xp_reward       ?? 10, content: ch27L02Content },
    { id: "ch27-l03", chapterId: ch27Id, order: 3, title: "بِ and لِ — With and For",             titleAr: "بِ وَلِ — حَرْفَا الْعِلَاقَةِ",          template: "STANDARD",        xpReward: ch27L03Content._meta?.xp_reward       ?? 10, content: ch27L03Content },
    { id: "ch27-l04", chapterId: ch27Id, order: 4, title: "عَنْ and كَ — About and Like",         titleAr: "عَنْ وَكَ — حَرْفَا الْمَعْنَى",          template: "STANDARD",        xpReward: ch27L04Content._meta?.xp_reward       ?? 10, content: ch27L04Content },
    { id: "ch27-l05", chapterId: ch27Id, order: 5, title: "All 8 Prepositions Review",            titleAr: "مُرَاجَعَةُ حُرُوفِ الْجَرِّ",           template: "REVIEW",          xpReward: ch27L05Content._meta?.xp_reward       ?? 5,  content: ch27L05Content },
    // Chapter 28
    { id: "ch28-l01", chapterId: ch28Id, order: 1, title: "عَلِمَ and فَهِمَ — Knowing",        titleAr: "عَلِمَ وَفَهِمَ — الْمَعْرِفَةُ",        template: "STANDARD",        xpReward: ch28L01Content._meta?.xp_reward       ?? 10, content: ch28L01Content },
    { id: "ch28-l02", chapterId: ch28Id, order: 2, title: "حَفِظَ and رَضِيَ — Memorizing",       titleAr: "حَفِظَ وَرَضِيَ — الْحِفْظُ وَالرِّضَا", template: "STANDARD",        xpReward: ch28L02Content._meta?.xp_reward       ?? 10, content: ch28L02Content },
    { id: "ch28-l03", chapterId: ch28Id, order: 3, title: "أَتَى and أَعْطَى — Coming and Giving", titleAr: "أَتَى وَأَعْطَى — الْحُضُورُ وَالْعَطَاءُ", template: "STANDARD",        xpReward: ch28L03Content._meta?.xp_reward       ?? 10, content: ch28L03Content },
    { id: "ch28-l04", chapterId: ch28Id, order: 4, title: "جَمَعَ and بَدَأَ — Gathering and Beginning", titleAr: "جَمَعَ وَبَدَأَ",                    template: "STANDARD",        xpReward: ch28L04Content._meta?.xp_reward       ?? 10, content: ch28L04Content },
    { id: "ch28-l05", chapterId: ch28Id, order: 5, title: "Mixed Verbs toward Al-Kafirun",       titleAr: "الْمُرَاجَعَةُ — نَحْوَ الْكَافِرُونَ",  template: "REVIEW",          xpReward: ch28L05Content._meta?.xp_reward       ?? 5,  content: ch28L05Content },
    // Chapter 29
    { id: "ch29-l01", chapterId: ch29Id, order: 1, title: "What is a Nominal Sentence?",        titleAr: "مَا هُوَ الْجُمْلَة الِاسْمِيَّة؟",        template: "STANDARD",        xpReward: ch29L01Content._meta?.xp_reward       ?? 10, content: ch29L01Content },
    { id: "ch29-l02", chapterId: ch29Id, order: 2, title: "What is a Verbal Sentence?",           titleAr: "مَا هُوَ الْجُمْلَة الْفِعْلِيَّة؟",        template: "STANDARD",        xpReward: ch29L02Content._meta?.xp_reward       ?? 10, content: ch29L02Content },
    { id: "ch29-l03", chapterId: ch29Id, order: 3, title: "Contrast: Nominal vs Verbal",        titleAr: "الِاسْمِيَّة وَالْفِعْلِيَّة — الْفَرْقُ", template: "STANDARD",        xpReward: ch29L03Content._meta?.xp_reward       ?? 10, content: ch29L03Content },
    { id: "ch29-l04", chapterId: ch29Id, order: 4, title: "إِنَّ Opens a Nominal Sentence",      titleAr: "إِنَّ تَفْتَحُ الْجُمْلَة الِاسْمِيَّة",   template: "STANDARD",        xpReward: ch29L04Content._meta?.xp_reward       ?? 10, content: ch29L04Content },
    { id: "ch29-l05", chapterId: ch29Id, order: 5, title: "GRAMMAR_PARSE on Al-Kafirun",          titleAr: "تَحْلِيلُ سُورَةِ الْكَافِرُونَ",          template: "STANDARD",        xpReward: ch29L05Content._meta?.xp_reward       ?? 10, content: ch29L05Content },
    { id: "ch29-l06", chapterId: ch29Id, order: 6, title: "Al-Kafirun Full Parse + Tadabbur #5",   titleAr: "الْكَافِرُونَ — قُلْ يَا أَيُّهَا الْكَافِرُونَ", template: "STANDARD", xpReward: ch29L06Content._meta?.xp_reward ?? 10, content: ch29L06Content },,
    { id: "ch30-l01", chapterId: ch30Id, order: 01, template: STANDARD, xpReward: ch30L01Content._meta?.xp_reward ?? 10, content: ch30L01Content },
    { id: "ch30-l02", chapterId: ch30Id, order: 02, template: STANDARD, xpReward: ch30L02Content._meta?.xp_reward ?? 10, content: ch30L02Content },
    { id: "ch30-l03", chapterId: ch30Id, order: 03, template: STANDARD, xpReward: ch30L03Content._meta?.xp_reward ?? 10, content: ch30L03Content },
    { id: "ch30-l04", chapterId: ch30Id, order: 04, template: STANDARD, xpReward: ch30L04Content._meta?.xp_reward ?? 10, content: ch30L04Content },
    { id: "ch30-l05", chapterId: ch30Id, order: 05, template: STANDARD, xpReward: ch30L05Content._meta?.xp_reward ?? 10, content: ch30L05Content },
    { id: "ch31-l01", chapterId: ch31Id, order: 01, template: STANDARD, xpReward: ch31L01Content._meta?.xp_reward ?? 10, content: ch31L01Content },
    { id: "ch31-l02", chapterId: ch31Id, order: 02, template: STANDARD, xpReward: ch31L02Content._meta?.xp_reward ?? 10, content: ch31L02Content },
    { id: "ch31-l03", chapterId: ch31Id, order: 03, template: STANDARD, xpReward: ch31L03Content._meta?.xp_reward ?? 10, content: ch31L03Content },
    { id: "ch31-l04", chapterId: ch31Id, order: 04, template: STANDARD, xpReward: ch31L04Content._meta?.xp_reward ?? 10, content: ch31L04Content },
    { id: "ch31-l05", chapterId: ch31Id, order: 05, template: STANDARD, xpReward: ch31L05Content._meta?.xp_reward ?? 10, content: ch31L05Content },
    { id: "ch32-l01", chapterId: ch32Id, order: 01, template: STANDARD, xpReward: ch32L01Content._meta?.xp_reward ?? 10, content: ch32L01Content },
    { id: "ch32-l02", chapterId: ch32Id, order: 02, template: STANDARD, xpReward: ch32L02Content._meta?.xp_reward ?? 10, content: ch32L02Content },
    { id: "ch32-l03", chapterId: ch32Id, order: 03, template: STANDARD, xpReward: ch32L03Content._meta?.xp_reward ?? 10, content: ch32L03Content },
    { id: "ch32-l04", chapterId: ch32Id, order: 04, template: STANDARD, xpReward: ch32L04Content._meta?.xp_reward ?? 10, content: ch32L04Content },
    { id: "ch33-l01", chapterId: ch33Id, order: 01, template: STANDARD, xpReward: ch33L01Content._meta?.xp_reward ?? 10, content: ch33L01Content },
    { id: "ch33-l02", chapterId: ch33Id, order: 02, template: STANDARD, xpReward: ch33L02Content._meta?.xp_reward ?? 10, content: ch33L02Content },
    { id: "ch33-l03", chapterId: ch33Id, order: 03, template: STANDARD, xpReward: ch33L03Content._meta?.xp_reward ?? 10, content: ch33L03Content },
    { id: "ch33-l04", chapterId: ch33Id, order: 04, template: STANDARD, xpReward: ch33L04Content._meta?.xp_reward ?? 10, content: ch33L04Content },
    { id: "ch33-l05", chapterId: ch33Id, order: 05, template: STANDARD, xpReward: ch33L05Content._meta?.xp_reward ?? 10, content: ch33L05Content },
    { id: "ch34-l01", chapterId: ch34Id, order: 01, template: STANDARD, xpReward: ch34L01Content._meta?.xp_reward ?? 10, content: ch34L01Content },
    { id: "ch34-l02", chapterId: ch34Id, order: 02, template: STANDARD, xpReward: ch34L02Content._meta?.xp_reward ?? 10, content: ch34L02Content },
    { id: "ch34-l03", chapterId: ch34Id, order: 03, template: STANDARD, xpReward: ch34L03Content._meta?.xp_reward ?? 10, content: ch34L03Content },
    { id: "ch34-l04", chapterId: ch34Id, order: 04, template: STANDARD, xpReward: ch34L04Content._meta?.xp_reward ?? 10, content: ch34L04Content },
    { id: "ch34-l05", chapterId: ch34Id, order: 05, template: STANDARD, xpReward: ch34L05Content._meta?.xp_reward ?? 10, content: ch34L05Content },
    { id: "ch34-l06", chapterId: ch34Id, order: 06, template: STANDARD, xpReward: ch34L06Content._meta?.xp_reward ?? 10, content: ch34L06Content },
    { id: "ch35-l01", chapterId: ch35Id, order: 01, template: STANDARD, xpReward: ch35L01Content._meta?.xp_reward ?? 10, content: ch35L01Content },
    { id: "ch35-l02", chapterId: ch35Id, order: 02, template: STANDARD, xpReward: ch35L02Content._meta?.xp_reward ?? 10, content: ch35L02Content },
    { id: "ch35-l03", chapterId: ch35Id, order: 03, template: STANDARD, xpReward: ch35L03Content._meta?.xp_reward ?? 10, content: ch35L03Content },
    { id: "ch35-l04", chapterId: ch35Id, order: 04, template: STANDARD, xpReward: ch35L04Content._meta?.xp_reward ?? 10, content: ch35L04Content },
    { id: "ch35-l05", chapterId: ch35Id, order: 05, template: STANDARD, xpReward: ch35L05Content._meta?.xp_reward ?? 10, content: ch35L05Content },
    { id: "ch36-l01", chapterId: ch36Id, order: 01, template: STANDARD, xpReward: ch36L01Content._meta?.xp_reward ?? 10, content: ch36L01Content },
    { id: "ch36-l02", chapterId: ch36Id, order: 02, template: STANDARD, xpReward: ch36L02Content._meta?.xp_reward ?? 10, content: ch36L02Content },
    { id: "ch36-l03", chapterId: ch36Id, order: 03, template: STANDARD, xpReward: ch36L03Content._meta?.xp_reward ?? 10, content: ch36L03Content },
    { id: "ch36-l04", chapterId: ch36Id, order: 04, template: STANDARD, xpReward: ch36L04Content._meta?.xp_reward ?? 10, content: ch36L04Content },
    { id: "ch36-l05", chapterId: ch36Id, order: 05, template: STANDARD, xpReward: ch36L05Content._meta?.xp_reward ?? 10, content: ch36L05Content },
    { id: "ch37-l01", chapterId: ch37Id, order: 01, template: STANDARD, xpReward: ch37L01Content._meta?.xp_reward ?? 10, content: ch37L01Content },
    { id: "ch37-l02", chapterId: ch37Id, order: 02, template: STANDARD, xpReward: ch37L02Content._meta?.xp_reward ?? 10, content: ch37L02Content },
    { id: "ch37-l03", chapterId: ch37Id, order: 03, template: STANDARD, xpReward: ch37L03Content._meta?.xp_reward ?? 10, content: ch37L03Content },
    { id: "ch37-l04", chapterId: ch37Id, order: 04, template: STANDARD, xpReward: ch37L04Content._meta?.xp_reward ?? 10, content: ch37L04Content },
    { id: "ch37-l05", chapterId: ch37Id, order: 05, template: STANDARD, xpReward: ch37L05Content._meta?.xp_reward ?? 10, content: ch37L05Content },
    { id: "ch38-l01", chapterId: ch38Id, order: 01, template: STANDARD, xpReward: ch38L01Content._meta?.xp_reward ?? 10, content: ch38L01Content },
    { id: "ch38-l02", chapterId: ch38Id, order: 02, template: STANDARD, xpReward: ch38L02Content._meta?.xp_reward ?? 10, content: ch38L02Content },
    { id: "ch38-l03", chapterId: ch38Id, order: 03, template: STANDARD, xpReward: ch38L03Content._meta?.xp_reward ?? 10, content: ch38L03Content },
    { id: "ch38-l04", chapterId: ch38Id, order: 04, template: STANDARD, xpReward: ch38L04Content._meta?.xp_reward ?? 10, content: ch38L04Content },
    { id: "ch38-l05", chapterId: ch38Id, order: 05, template: STANDARD, xpReward: ch38L05Content._meta?.xp_reward ?? 10, content: ch38L05Content },
    { id: "ch39-l01", chapterId: ch39Id, order: 01, template: STANDARD, xpReward: ch39L01Content._meta?.xp_reward ?? 10, content: ch39L01Content },
    { id: "ch39-l02", chapterId: ch39Id, order: 02, template: STANDARD, xpReward: ch39L02Content._meta?.xp_reward ?? 10, content: ch39L02Content },
    { id: "ch39-l03", chapterId: ch39Id, order: 03, template: STANDARD, xpReward: ch39L03Content._meta?.xp_reward ?? 10, content: ch39L03Content },
    { id: "ch39-l04", chapterId: ch39Id, order: 04, template: STANDARD, xpReward: ch39L04Content._meta?.xp_reward ?? 10, content: ch39L04Content },
    { id: "ch39-l05", chapterId: ch39Id, order: 05, template: STANDARD, xpReward: ch39L05Content._meta?.xp_reward ?? 10, content: ch39L05Content },
    { id: "ch40-l01", chapterId: ch40Id, order: 01, template: STANDARD, xpReward: ch40L01Content._meta?.xp_reward ?? 10, content: ch40L01Content },
    { id: "ch40-l02", chapterId: ch40Id, order: 02, template: STANDARD, xpReward: ch40L02Content._meta?.xp_reward ?? 10, content: ch40L02Content },
    { id: "ch40-l03", chapterId: ch40Id, order: 03, template: STANDARD, xpReward: ch40L03Content._meta?.xp_reward ?? 10, content: ch40L03Content },
    { id: "ch40-l04", chapterId: ch40Id, order: 04, template: STANDARD, xpReward: ch40L04Content._meta?.xp_reward ?? 10, content: ch40L04Content },
    { id: "ch40-l05", chapterId: ch40Id, order: 05, template: STANDARD, xpReward: ch40L05Content._meta?.xp_reward ?? 10, content: ch40L05Content },
    { id: "ch41-l01", chapterId: ch41Id, order: 01, template: STANDARD, xpReward: ch41L01Content._meta?.xp_reward ?? 10, content: ch41L01Content },
    { id: "ch41-l02", chapterId: ch41Id, order: 02, template: STANDARD, xpReward: ch41L02Content._meta?.xp_reward ?? 10, content: ch41L02Content },
    { id: "ch41-l03", chapterId: ch41Id, order: 03, template: STANDARD, xpReward: ch41L03Content._meta?.xp_reward ?? 10, content: ch41L03Content },
    { id: "ch41-l04", chapterId: ch41Id, order: 04, template: STANDARD, xpReward: ch41L04Content._meta?.xp_reward ?? 10, content: ch41L04Content },
    { id: "ch41-l05", chapterId: ch41Id, order: 05, template: STANDARD, xpReward: ch41L05Content._meta?.xp_reward ?? 10, content: ch41L05Content },
    { id: "ch42-l01", chapterId: ch42Id, order: 01, template: STANDARD, xpReward: ch42L01Content._meta?.xp_reward ?? 10, content: ch42L01Content },
    { id: "ch42-l02", chapterId: ch42Id, order: 02, template: STANDARD, xpReward: ch42L02Content._meta?.xp_reward ?? 10, content: ch42L02Content },
    { id: "ch42-l03", chapterId: ch42Id, order: 03, template: STANDARD, xpReward: ch42L03Content._meta?.xp_reward ?? 10, content: ch42L03Content },
    { id: "ch42-l04", chapterId: ch42Id, order: 04, template: STANDARD, xpReward: ch42L04Content._meta?.xp_reward ?? 10, content: ch42L04Content },
    { id: "ch42-l05", chapterId: ch42Id, order: 05, template: STANDARD, xpReward: ch42L05Content._meta?.xp_reward ?? 10, content: ch42L05Content },
    { id: "ch43-l01", chapterId: ch43Id, order: 01, template: STANDARD, xpReward: ch43L01Content._meta?.xp_reward ?? 10, content: ch43L01Content },
    { id: "ch43-l02", chapterId: ch43Id, order: 02, template: STANDARD, xpReward: ch43L02Content._meta?.xp_reward ?? 10, content: ch43L02Content },
    { id: "ch43-l03", chapterId: ch43Id, order: 03, template: STANDARD, xpReward: ch43L03Content._meta?.xp_reward ?? 10, content: ch43L03Content },
    { id: "ch43-l04", chapterId: ch43Id, order: 04, template: STANDARD, xpReward: ch43L04Content._meta?.xp_reward ?? 10, content: ch43L04Content },
    { id: "ch43-l05", chapterId: ch43Id, order: 05, template: STANDARD, xpReward: ch43L05Content._meta?.xp_reward ?? 10, content: ch43L05Content },
    { id: "ch44-l01", chapterId: ch44Id, order: 01, template: STANDARD, xpReward: ch44L01Content._meta?.xp_reward ?? 10, content: ch44L01Content },
    { id: "ch44-l02", chapterId: ch44Id, order: 02, template: STANDARD, xpReward: ch44L02Content._meta?.xp_reward ?? 10, content: ch44L02Content },
    { id: "ch44-l03", chapterId: ch44Id, order: 03, template: STANDARD, xpReward: ch44L03Content._meta?.xp_reward ?? 10, content: ch44L03Content },
    { id: "ch44-l04", chapterId: ch44Id, order: 04, template: STANDARD, xpReward: ch44L04Content._meta?.xp_reward ?? 10, content: ch44L04Content },
    { id: "ch44-l05", chapterId: ch44Id, order: 05, template: STANDARD, xpReward: ch44L05Content._meta?.xp_reward ?? 10, content: ch44L05Content },
    { id: "ch45-l01", chapterId: ch45Id, order: 01, template: STANDARD, xpReward: ch45L01Content._meta?.xp_reward ?? 10, content: ch45L01Content },
    { id: "ch45-l02", chapterId: ch45Id, order: 02, template: STANDARD, xpReward: ch45L02Content._meta?.xp_reward ?? 10, content: ch45L02Content },
    { id: "ch45-l03", chapterId: ch45Id, order: 03, template: STANDARD, xpReward: ch45L03Content._meta?.xp_reward ?? 10, content: ch45L03Content },
    { id: "ch45-l04", chapterId: ch45Id, order: 04, template: STANDARD, xpReward: ch45L04Content._meta?.xp_reward ?? 10, content: ch45L04Content },
    { id: "ch45-l05", chapterId: ch45Id, order: 05, template: STANDARD, xpReward: ch45L05Content._meta?.xp_reward ?? 10, content: ch45L05Content },
    { id: "ch45-l06", chapterId: ch45Id, order: 06, template: STANDARD, xpReward: ch45L06Content._meta?.xp_reward ?? 10, content: ch45L06Content }
  ];
  for (const { id, ...data } of lessons) {
    await prisma.lesson.upsert({
      where: { id },
      update: data,
      create: { id, ...data },
    });
  }

  await cleanupObsoleteAuthoredLessons(lessons);

  await seedVocabulary(prisma);
  await seedTadabbur(prisma);
  console.log("Seed data created successfully.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
