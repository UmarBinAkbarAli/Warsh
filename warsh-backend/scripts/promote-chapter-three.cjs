/**
 * Scoped Chapter 3 promotion. Existing lesson IDs are updated in place so
 * learner progress remains attached; only the three new IDs are inserted.
 *
 * Usage:
 *   npm run content:promote-chapter-three
 *   npm run content:promote-chapter-three -- --apply
 */

require("dotenv/config");

const fs = require("node:fs");
const path = require("node:path");
const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");
const { localizeMetadata } = require("../prisma/urdu-metadata.cjs");

const APPLY = process.argv.includes("--apply");
const FIXTURES_DIR = path.join(__dirname, "../prisma/fixtures");
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL ?? "" });
const prisma = new PrismaClient({ adapter });

const plan = [
  ["ch03-l01", 1, "Idafa Foundations — Possession", "أُسُسُ الإِضَافَة", "STANDARD", "chapter-03-lesson-01.json"],
  ["ch03-l06", 2, "Idafa in Useful and Quranic Phrases", "الإِضَافَةُ فِي التَّرَاكِيب", "STANDARD", "chapter-03-lesson-06-idafa-usage.json"],
  ["ch03-l02", 3, "Whose? — لِمَنْ", "لِمَنْ؟", "STANDARD", "chapter-03-lesson-02.json"],
  ["ch03-l07", 4, "Calling Someone — يَا", "يَا النِّدَاء", "STANDARD", "chapter-03-lesson-07-ya.json"],
  ["ch03-l03", 5, "Basmalah Unlocked — بِسْمِ اللَّهِ", "بِسْمِ اللَّهِ الرَّحْمٰنِ الرَّحِيمِ", "STANDARD", "chapter-03-lesson-03.json"],
  ["ch03-l05", 6, "SP1 — Greetings and Introductions", "السَّلَامُ وَالتَّعَارُف", "SPOKEN_PHRASES", "chapter-03-lesson-05-spoken-phrases.json"],
  ["ch03-l04", 7, "Chapter 3 Review", "مُرَاجَعَة الفَصْل الثَّالِث", "REVIEW", "chapter-03-lesson-04.json"],
  ["ch03-test", 8, "Chapter 3 Final Test", "اخْتِبَارُ الْفَصْلِ الثَّالِث", "REVIEW", "chapter-03-lesson-08-final-test.json"],
].map(([id, order, title, titleAr, template, filename]) => {
  const content = JSON.parse(fs.readFileSync(path.join(FIXTURES_DIR, filename), "utf8"));
  return { id, order, title, titleAr, template, content, xpReward: content._meta?.xp_reward ?? 10 };
});

async function main() {
  const chapter = await prisma.chapter.findUnique({ where: { order: 3 }, select: { id: true } });
  if (!chapter) throw new Error("Chapter 3 does not exist.");

  const existing = await prisma.lesson.findMany({
    where: { chapterId: chapter.id },
    orderBy: { order: "asc" },
    select: { id: true, order: true, title: true, status: true },
  });
  const existingIds = new Set(existing.map((lesson) => lesson.id));
  const unexpected = existing.filter((lesson) => !plan.some((item) => item.id === lesson.id));
  if (unexpected.length) {
    throw new Error(`Unexpected Chapter 3 lesson IDs: ${unexpected.map((lesson) => lesson.id).join(", ")}`);
  }

  console.log(`${APPLY ? "Applying" : "Dry run for"} Chapter 3 promotion:`);
  for (const item of plan) {
    console.log(`  ${item.order}. ${item.id} — ${existingIds.has(item.id) ? "update" : "create"} — ${item.title}`);
  }
  if (!APPLY) {
    console.log("\nNo production data changed. Re-run with --apply after reviewing this plan.");
    return;
  }

  await prisma.$transaction(async (tx) => {
    for (const item of plan) {
      const data = {
        chapterId: chapter.id,
        order: item.order,
        title: item.title,
        titleUr: item.content._meta?.titleUr ?? localizeMetadata(item.title),
        titleAr: item.titleAr,
        template: item.template,
        xpReward: item.xpReward,
        content: item.content,
      };
      await tx.lesson.upsert({
        where: { id: item.id },
        update: data,
        create: { id: item.id, ...data, status: "PUBLISHED", publishedAt: new Date() },
      });
    }
  });

  const verified = await prisma.lesson.findMany({
    where: { chapterId: chapter.id },
    orderBy: { order: "asc" },
    select: { id: true, order: true, title: true, status: true },
  });
  if (verified.length !== plan.length || verified.some((lesson, index) => lesson.id !== plan[index].id || lesson.order !== plan[index].order)) {
    throw new Error("Post-promotion Chapter 3 verification failed.");
  }
  console.log("\nChapter 3 promotion applied and verified. Learner progress rows were not modified.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
