/**
 * Scoped Chapter 4 promotion. Existing lesson IDs are updated in place so
 * learner progress remains attached; only the three new IDs are inserted.
 *
 * Usage:
 *   npm run content:promote-chapter-four
 *   npm run content:promote-chapter-four -- --apply
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
  ["ch04-l01", 1, "Adjective Follows Noun", "الصِّفَة بَعْدَ الْمَوْصُوف", "STANDARD", "chapter-04-lesson-01.json"],
  ["ch04-l02", 2, "Definite Agreement — الْبَيْتُ الْكَبِيرُ", "الصِّفَة الْمَعْرِفَة", "STANDARD", "chapter-04-lesson-02.json"],
  ["ch04-l05", 3, "Adjective Phrase or Complete Sentence?", "التَّرْكِيبُ الْوَصْفِيُّ وَالْجُمْلَةُ", "STANDARD", "chapter-04-lesson-05-phrase-vs-sentence.json"],
  ["ch04-l03", 4, "Feminine Agreement — كَلِمَةٌ طَيِّبَةٌ", "الصِّفَة الْمُؤَنَّثَة", "STANDARD", "chapter-04-lesson-03.json"],
  ["ch04-l06", 5, "Adjectives in Quranic Phrases", "الصِّفَةُ فِي التَّرَاكِيبِ الْقُرْآنِيَّةِ", "STANDARD", "chapter-04-lesson-06-quranic-adjectives.json"],
  ["ch04-l04", 6, "Chapter 4 Review", "مُرَاجَعَة الْفَصْل الرَّابِع", "REVIEW", "chapter-04-lesson-04.json"],
  ["ch04-test", 7, "Chapter 4 Final Test", "اخْتِبَارُ الْفَصْلِ الرَّابِعِ", "REVIEW", "chapter-04-lesson-07-final-test.json"],
].map(([id, order, title, titleAr, template, filename]) => {
  const content = JSON.parse(fs.readFileSync(path.join(FIXTURES_DIR, filename), "utf8"));
  return { id, order, title, titleAr, template, content, xpReward: content._meta?.xp_reward ?? 10 };
});

async function main() {
  const chapter = await prisma.chapter.findUnique({ where: { order: 4 }, select: { id: true } });
  if (!chapter) throw new Error("Chapter 4 does not exist.");
  const existing = await prisma.lesson.findMany({ where: { chapterId: chapter.id }, orderBy: { order: "asc" }, select: { id: true } });
  const existingIds = new Set(existing.map(({ id }) => id));
  const unexpected = existing.filter(({ id }) => !plan.some((item) => item.id === id));
  if (unexpected.length) throw new Error(`Unexpected Chapter 4 lesson IDs: ${unexpected.map(({ id }) => id).join(", ")}`);

  console.log(`${APPLY ? "Applying" : "Dry run for"} Chapter 4 promotion:`);
  for (const item of plan) console.log(`  ${item.order}. ${item.id} — ${existingIds.has(item.id) ? "update" : "create"} — ${item.title}`);
  if (!APPLY) {
    console.log("\nNo production data changed. Re-run with --apply after reviewing this plan.");
    return;
  }

  await prisma.$transaction(async (tx) => {
    for (const item of plan) {
      const data = { chapterId: chapter.id, order: item.order, title: item.title, titleUr: item.content._meta?.titleUr ?? localizeMetadata(item.title), titleAr: item.titleAr, template: item.template, xpReward: item.xpReward, content: item.content };
      await tx.lesson.upsert({ where: { id: item.id }, update: data, create: { id: item.id, ...data, status: "PUBLISHED", publishedAt: new Date() } });
    }
  });

  const verified = await prisma.lesson.findMany({ where: { chapterId: chapter.id }, orderBy: { order: "asc" }, select: { id: true, order: true, status: true, content: true } });
  if (verified.length !== plan.length || verified.some((lesson, index) => lesson.id !== plan[index].id || lesson.order !== plan[index].order || lesson.status !== "PUBLISHED")) throw new Error("Post-promotion Chapter 4 verification failed.");
  const test = verified.find(({ id }) => id === "ch04-test");
  if (test?.content?.assessment?.questions?.length !== 12) throw new Error("Chapter 4 final test verification failed.");
  console.log("\nChapter 4 promotion applied and verified. Learner progress rows were not modified.");
}

main().catch((error) => { console.error(error); process.exitCode = 1; }).finally(() => prisma.$disconnect());
