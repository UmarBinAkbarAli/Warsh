/**
 * Scoped Chapter 12 promotion (Docs/proposals/chapter-12-content-proposal.md).
 * Existing lesson IDs ch12-l01..l05 are updated in place so learner progress
 * remains attached and keep their display orders 1–5. ch12-l06 (review) and
 * ch12-test are the only inserted rows. The chapter title is unchanged; the
 * description gains its Urdu text and the new lesson scope.
 *
 * Usage:
 *   npm run content:promote-chapter-twelve
 *   npm run content:promote-chapter-twelve -- --apply
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

const CHAPTER_TITLE = "Introductions and Personal Questions";
const CHAPTER_TITLE_UR = "تعارف اور ذاتی سوالات";
const CHAPTER_TITLE_AR = "التَّعَارُف وَالأَسْئِلَة الشَّخْصِيَّة";
const CHAPTER_DESCRIPTION = "Asking and answering about name, origin and profession; ذَهَبَ, رَجَعَ and خَلَقَ as recognition words; classroom phrases.";
const CHAPTER_DESCRIPTION_UR = "نام، اصل اور پیشے کے بارے میں پوچھنا اور بتانا؛ ذَهَبَ، رَجَعَ اور خَلَقَ بطور پہچان کے الفاظ؛ درس گاہ کے جملے۔";

const plan = [
  ["ch12-l01", 1, "What Is Your Name? — مَا اسْمُكَ؟", "مَا اسْمُكَ؟", "STANDARD", "chapter-12-lesson-01.json"],
  ["ch12-l02", 2, "Where Are You From? — مِنْ أَيْنَ؟", "مِنْ أَيْنَ أَنْتَ؟", "STANDARD", "chapter-12-lesson-02.json"],
  ["ch12-l03", 3, "Professions — مَا مِهْنَتُكَ؟", "الْمِهَنُ — مَا مِهْنَتُكَ؟", "STANDARD", "chapter-12-lesson-03.json"],
  ["ch12-l04", 4, "Past-Tense Recognition", "تَعَرُّفُ الْفِعْلِ الْمَاضِي", "STANDARD", "chapter-12-lesson-04.json"],
  ["ch12-l05", 5, "Classroom and Halaqa Phrases", "عِبَارَاتُ الدَّرْسِ وَالْحَلْقَةِ", "SPOKEN_PHRASES", "chapter-12-lesson-05-spoken-phrases.json"],
  ["ch12-l06", 6, "Chapter 12 Review", "مُرَاجَعَةُ الْفَصْلِ الثَّانِيَ عَشَرَ", "REVIEW", "chapter-12-lesson-06-review.json"],
  ["ch12-test", 7, "Chapter 12 Final Test", "اخْتِبَارُ الْفَصْلِ الثَّانِيَ عَشَرَ", "REVIEW", "chapter-12-lesson-07-final-test.json"],
].map(([id, order, title, titleAr, template, filename]) => {
  const content = JSON.parse(fs.readFileSync(path.join(FIXTURES_DIR, filename), "utf8"));
  return { id, order, title, titleAr, template, content, xpReward: content._meta?.xp_reward ?? 10 };
});

async function main() {
  const chapter = await prisma.chapter.findUnique({ where: { order: 12 }, select: { id: true, title: true } });
  if (!chapter) throw new Error("Chapter 12 does not exist.");
  const existing = await prisma.lesson.findMany({ where: { chapterId: chapter.id }, orderBy: { order: "asc" }, select: { id: true } });
  const existingIds = new Set(existing.map(({ id }) => id));
  const unexpected = existing.filter(({ id }) => !plan.some((item) => item.id === id));
  if (unexpected.length) throw new Error(`Unexpected Chapter 12 lesson IDs: ${unexpected.map(({ id }) => id).join(", ")}`);

  console.log(`${APPLY ? "Applying" : "Dry run for"} Chapter 12 promotion:`);
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
  if (verified.length !== plan.length || verified.some((lesson, index) => lesson.id !== plan[index].id || lesson.order !== plan[index].order || lesson.status !== "PUBLISHED")) throw new Error("Post-promotion Chapter 12 verification failed.");
  const test = verified.find(({ id }) => id === "ch12-test");
  if (test?.content?.assessment?.questions?.length !== 12) throw new Error("Chapter 12 final test verification failed.");
  console.log("\nChapter 12 promotion applied and verified. Learner progress rows were not modified.");
}

main().catch((error) => { console.error(error); process.exitCode = 1; }).finally(() => prisma.$disconnect());
