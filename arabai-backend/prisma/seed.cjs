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

async function main() {
  // Wait for Neon to wake up (free tier suspends after inactivity)
  await waitForNeon();

  // Delete in FK-safe order: children before parents
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

  for (const achievement of ACHIEVEMENTS) {
    await prisma.achievement.create({ data: achievement });
  }

  // Seed chapter metadata only — lessons are now authored individually in
  // prisma/fixtures/ using warsh-content-schema.ts (see Docs/).
  const allChapters = [...chapters, ...chapters2, ...chapters3, ...chapters4];
  const chapterIdByOrder = new Map();

  for (const chapterData of allChapters) {
    const { lessons: _unused, ...chapterFields } = chapterData;
    const created = await prisma.chapter.create({ data: chapterFields });
    chapterIdByOrder.set(created.order, created.id);
  }

  // Chapter 1 — fully authored lessons (warsh-content-schema v1.0)
  const ch1Id = chapterIdByOrder.get(1);

  await prisma.lesson.create({
    data: {
      chapterId: ch1Id,
      order: 1,
      title: "First Encounter with هَذَا",
      titleAr: "اللقاء الأول مع هَذَا",
      template: "STANDARD",
      xpReward: ch01L01Content._meta?.xp_reward ?? 10,
      content: ch01L01Content,
    },
  });

  await prisma.lesson.create({
    data: {
      chapterId: ch1Id,
      order: 2,
      title: "That, What, and Who — ذٰلِكَ، مَا، مَنْ",
      titleAr: "ذٰلِكَ وَمَا وَمَنْ",
      template: "STANDARD",
      xpReward: ch01L02Content._meta?.xp_reward ?? 10,
      content: ch01L02Content,
    },
  });

  await prisma.lesson.create({
    data: {
      chapterId: ch1Id,
      order: 3,
      title: "Feminine Forms — هَذِهِ and تِلْكَ",
      titleAr: "هَذِهِ وَتِلْكَ",
      template: "STANDARD",
      xpReward: ch01L03Content._meta?.xp_reward ?? 10,
      content: ch01L03Content,
    },
  });

  await prisma.lesson.create({
    data: {
      chapterId: ch1Id,
      order: 4,
      title: "Chapter 1 Review",
      titleAr: "مُرَاجَعَة الفَصْل الأَوَّل",
      template: "REVIEW",
      xpReward: ch01L04Content._meta?.xp_reward ?? 20,
      content: ch01L04Content,
    },
  });

  // Chapter 2 — fully authored lessons (warsh-content-schema v1.0)
  const ch2Id = chapterIdByOrder.get(2);

  await prisma.lesson.create({
    data: {
      chapterId: ch2Id,
      order: 1,
      title: "Tanween — The Sound of 'A'",
      titleAr: "التَّنْوِين — صَوْتُ النَّكِرَة",
      template: "STANDARD",
      xpReward: ch02L01Content._meta?.xp_reward ?? 10,
      content: ch02L01Content,
    },
  });

  await prisma.lesson.create({
    data: {
      chapterId: ch2Id,
      order: 2,
      title: "ال — The Definite Article",
      titleAr: "التَّعْرِيف بِالْ",
      template: "STANDARD",
      xpReward: ch02L02Content._meta?.xp_reward ?? 10,
      content: ch02L02Content,
    },
  });

  await prisma.lesson.create({
    data: {
      chapterId: ch2Id,
      order: 3,
      title: "أَيْنَ — Where?",
      titleAr: "أَيْنَ وَحُرُوف الْجَرّ",
      template: "STANDARD",
      xpReward: ch02L03Content._meta?.xp_reward ?? 10,
      content: ch02L03Content,
    },
  });

  await prisma.lesson.create({
    data: {
      chapterId: ch2Id,
      order: 4,
      title: "Chapter 2 Review",
      titleAr: "مُرَاجَعَة الفَصْل الثَّانِي",
      template: "REVIEW",
      xpReward: ch02L04Content._meta?.xp_reward ?? 20,
      content: ch02L04Content,
    },
  });

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
