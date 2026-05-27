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
const ch09L01VerbContent = require("./fixtures/chapter-09-lesson-01-verb-pattern.json");

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
  const ch9Id = chapterIdByOrder.get(9);

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
    { id: "ch09-l01", chapterId: ch9Id, order: 1, title: "Past Tense - Verb Pattern", titleAr: "fi-il maadi", template: "VERB_PATTERN", xpReward: ch09L01VerbContent._meta?.xp_reward ?? 10, content: ch09L01VerbContent },
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
