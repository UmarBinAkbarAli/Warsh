/**
 * Scoped Chapter 14 promotion (Docs/proposals/chapter-14-content-proposal.md).
 * Existing lesson IDs ch14-l01..l04 are updated in place so learner progress
 * remains attached and keep their display orders 1–4. The review ch14-l05
 * keeps its ID but moves from display order 5 to 6. ch14-l06 (Quranic
 * agreement, order 5) and ch14-test (order 7) are the only inserted rows.
 * The chapter keeps its title "Describing Plurals"; its Urdu title and both
 * descriptions are refreshed.
 *
 * Usage:
 *   npm run content:promote-chapter-fourteen
 *   npm run content:promote-chapter-fourteen -- --apply
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

const CHAPTER_TITLE = "Describing Plurals";
const CHAPTER_TITLE_UR = "جمع کی صفت";
const CHAPTER_TITLE_AR = "وَصْفُ الْجُمُوعِ";
const CHAPTER_DESCRIPTION = "Adjective agreement with plural nouns: plural adjectives for human plurals, the feminine-singular default for non-human plurals, phrase versus sentence, and one attested Quranic variation.";
const CHAPTER_DESCRIPTION_UR = "جمع اسم کے ساتھ صفت کی مطابقت: عاقل جمع کے لیے جمع صفت، غیر عاقل جمع کے لیے واحد مؤنث کا بنیادی قاعدہ، ترکیب یا جملہ، اور قرآن میں موجود ایک مختلف صورت۔";

// The review is listed before the new order-5 lesson so it vacates display
// order 5 before ch14-l06 takes it (no unique constraint, but keeps the log honest).
const plan = [
  ["ch14-l01", 1, "Human Plurals and Plural Adjectives", "جَمْعُ الْعَاقِلِ وَصِفَتُهُ الْجَمْعُ", "STANDARD", "chapter-14-lesson-01.json"],
  ["ch14-l02", 2, "Non-Human Plurals: The Feminine-Singular Default", "جَمْعُ غَيْرِ الْعَاقِلِ وَالْمُفْرَدُ الْمُؤَنَّثُ", "STANDARD", "chapter-14-lesson-02.json"],
  ["ch14-l03", 3, "Descriptive Phrase or Complete Sentence?", "تَرْكِيبٌ أَمْ جُمْلَةٌ؟", "STANDARD", "chapter-14-lesson-03.json"],
  ["ch14-l04", 4, "Human or Non-Human? Choosing the Agreement", "عَاقِلٌ أَمْ غَيْرُ عَاقِلٍ؟", "STANDARD", "chapter-14-lesson-04.json"],
  ["ch14-l05", 6, "Chapter 14 Review", "مُرَاجَعَةُ الْفَصْلِ الرَّابِعَ عَشَرَ", "REVIEW", "chapter-14-lesson-06-review.json"],
  ["ch14-l06", 5, "Quranic Agreement: Default Pattern and Variation", "الْمُطَابَقَةُ فِي الْقُرْآنِ", "STANDARD", "chapter-14-lesson-05-quranic-agreement.json"],
  ["ch14-test", 7, "Chapter 14 Final Test", "اخْتِبَارُ الْفَصْلِ الرَّابِعَ عَشَرَ", "REVIEW", "chapter-14-lesson-07-final-test.json"],
].map(([id, order, title, titleAr, template, filename]) => {
  const content = JSON.parse(fs.readFileSync(path.join(FIXTURES_DIR, filename), "utf8"));
  return { id, order, title, titleAr, template, content, xpReward: content._meta?.xp_reward ?? 10 };
});

async function main() {
  const chapter = await prisma.chapter.findUnique({ where: { order: 14 }, select: { id: true, title: true } });
  if (!chapter) throw new Error("Chapter 14 does not exist.");
  const existing = await prisma.lesson.findMany({ where: { chapterId: chapter.id }, orderBy: { order: "asc" }, select: { id: true } });
  const existingIds = new Set(existing.map(({ id }) => id));
  const unexpected = existing.filter(({ id }) => !plan.some((item) => item.id === id));
  if (unexpected.length) throw new Error(`Unexpected Chapter 14 lesson IDs: ${unexpected.map(({ id }) => id).join(", ")}`);

  console.log(`${APPLY ? "Applying" : "Dry run for"} Chapter 14 promotion:`);
  console.log(`  chapter title: "${chapter.title}" -> "${CHAPTER_TITLE}"`);
  for (const item of plan) console.log(`  ${item.order}. ${item.id} — ${existingIds.has(item.id) ? "update" : "create"} — ${item.title}`);
  if (!APPLY) {
    console.log("\nNo data changed. Re-run with --apply after reviewing this plan.");
    return;
  }

  await prisma.$transaction(async (tx) => {
    await tx.chapter.update({ where: { id: chapter.id }, data: { title: CHAPTER_TITLE, titleUr: CHAPTER_TITLE_UR, titleAr: CHAPTER_TITLE_AR, description: CHAPTER_DESCRIPTION, descriptionUr: CHAPTER_DESCRIPTION_UR } });
    for (const item of plan) {
      const data = { chapterId: chapter.id, order: item.order, title: item.title, titleUr: item.content._meta?.titleUr ?? localizeMetadata(item.title), titleAr: item.titleAr, template: item.template, xpReward: item.xpReward, content: item.content };
      await tx.lesson.upsert({ where: { id: item.id }, update: data, create: { id: item.id, ...data, status: "PUBLISHED", publishedAt: new Date() } });
    }
  }, { timeout: 30000 });

  const verified = await prisma.lesson.findMany({ where: { chapterId: chapter.id }, orderBy: { order: "asc" }, select: { id: true, order: true, status: true, content: true } });
  const expected = [...plan].sort((a, b) => a.order - b.order);
  if (verified.length !== expected.length || verified.some((lesson, index) => lesson.id !== expected[index].id || lesson.order !== expected[index].order || lesson.status !== "PUBLISHED")) throw new Error("Post-promotion Chapter 14 verification failed.");
  const test = verified.find(({ id }) => id === "ch14-test");
  if (test?.content?.assessment?.questions?.length !== 12) throw new Error("Chapter 14 final test verification failed.");
  console.log("\nChapter 14 promotion applied and verified. Learner progress rows were not modified.");
}

main().catch((error) => { console.error(error); process.exitCode = 1; }).finally(() => prisma.$disconnect());
