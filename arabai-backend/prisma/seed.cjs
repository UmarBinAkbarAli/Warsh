require("dotenv/config");

const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");
const { chapters } = require("./curriculum-phase15.cjs");

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL || ""
});

const prisma = new PrismaClient({ adapter });

async function main() {
  await prisma.progress.deleteMany();
  await prisma.chatMessage.deleteMany();
  await prisma.userAchievement.deleteMany();
  await prisma.achievement.deleteMany();
  await prisma.streak.deleteMany();
  await prisma.lesson.deleteMany();
  await prisma.chapter.deleteMany();
  await prisma.user.deleteMany();

  for (const chapterData of chapters) {
    const { lessons, ...chapterFields } = chapterData;
    const chapter = await prisma.chapter.create({ data: chapterFields });

    for (const [index, lesson] of lessons.entries()) {
      await prisma.lesson.create({
        data: {
          chapterId: chapter.id,
          order: index + 1,
          title: lesson.title,
          titleAr: lesson.titleAr,
          type: lesson.type,
          xpReward: lesson.xpReward ?? 10,
          content: lesson.content ?? {},
          hook: lesson.hook,
          discoverCards: lesson.discoverCards,
          exercises: lesson.exercises,
          revealText: lesson.revealText,
          revealAyah: lesson.revealAyah,
          fatihaProgressDelta: lesson.fatihaProgressDelta ?? 0,
        }
      });
    }
  }

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
