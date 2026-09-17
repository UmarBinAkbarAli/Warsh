/**
 * Scoped Chapter 6 promotion (Docs/proposals/chapter-06-content-proposal.md).
 * Existing lesson IDs ch06-l01..l04 are updated in place so learner progress
 * remains attached; only the two new IDs (ch06-l05, ch06-test) are inserted.
 * The chapter title is updated to the approved title. Filename order equals
 * display order for this chapter.
 *
 * Usage:
 *   npm run content:promote-chapter-six
 *   npm run content:promote-chapter-six -- --apply
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

const CHAPTER_TITLE = "Relative Descriptions — الَّذِي";
const CHAPTER_TITLE_UR = "متعلقہ وضاحتیں — الَّذِي";
const CHAPTER_DESCRIPTION = "Described nouns, then connecting a masculine noun to its description with the relative pronoun الَّذِي.";
const CHAPTER_DESCRIPTION_UR = "موصوف اسم، پھر مذکر اسم کو اسم موصول الَّذِي کے ذریعے اس کی توصیف سے جوڑنا۔";

// Titles that open with an Arabic word carry a leading LTR mark (‎) so the
// chapter list keeps them left-aligned instead of flipping the whole row RTL.
const plan = [
  ["ch06-l01", 1, "A Described Subject", "الْمَوْصُوفُ فَاعِلًا", "STANDARD", "chapter-06-lesson-01.json"],
  ["ch06-l02", 2, "‎الَّذِي — Who, That, Which", "الَّذِي — اسْمٌ مَوْصُول", "STANDARD", "chapter-06-lesson-02.json"],
  ["ch06-l03", 3, "‎الَّذِي with Place and Tool Phrases", "الَّذِي مَعَ عِبَارَاتِ الْمَكَانِ وَالأَدَاة", "STANDARD", "chapter-06-lesson-03.json"],
  ["ch06-l04", 4, "‎الَّذِي in a Quranic Action Chain", "الَّذِي فِي سِلْسِلَةِ أَفْعَالٍ قُرْآنِيَّة", "STANDARD", "chapter-06-lesson-04.json"],
  ["ch06-l05", 5, "Chapter 6 Review", "مُرَاجَعَةُ الْفَصْلِ السَّادِس", "REVIEW", "chapter-06-lesson-05.json"],
  ["ch06-test", 6, "Chapter 6 Final Test", "اخْتِبَارُ الْفَصْلِ السَّادِسِ", "REVIEW", "chapter-06-lesson-06-final-test.json"],
].map(([id, order, title, titleAr, template, filename]) => {
  const content = JSON.parse(fs.readFileSync(path.join(FIXTURES_DIR, filename), "utf8"));
  return { id, order, title, titleAr, template, content, xpReward: content._meta?.xp_reward ?? 10 };
});

async function main() {
  const chapter = await prisma.chapter.findUnique({ where: { order: 6 }, select: { id: true, title: true } });
  if (!chapter) throw new Error("Chapter 6 does not exist.");
  const existing = await prisma.lesson.findMany({ where: { chapterId: chapter.id }, orderBy: { order: "asc" }, select: { id: true } });
  const existingIds = new Set(existing.map(({ id }) => id));
  const unexpected = existing.filter(({ id }) => !plan.some((item) => item.id === id));
  if (unexpected.length) throw new Error(`Unexpected Chapter 6 lesson IDs: ${unexpected.map(({ id }) => id).join(", ")}`);

  console.log(`${APPLY ? "Applying" : "Dry run for"} Chapter 6 promotion:`);
  console.log(`  chapter title: "${chapter.title}" -> "${CHAPTER_TITLE}"`);
  for (const item of plan) console.log(`  ${item.order}. ${item.id} — ${existingIds.has(item.id) ? "update" : "create"} — ${item.title}`);
  if (!APPLY) {
    console.log("\nNo data changed. Re-run with --apply after reviewing this plan.");
    return;
  }

  await prisma.$transaction(async (tx) => {
    await tx.chapter.update({ where: { id: chapter.id }, data: { title: CHAPTER_TITLE, titleUr: CHAPTER_TITLE_UR, description: CHAPTER_DESCRIPTION, descriptionUr: CHAPTER_DESCRIPTION_UR } });
    for (const item of plan) {
      const data = { chapterId: chapter.id, order: item.order, title: item.title, titleUr: item.content._meta?.titleUr ?? localizeMetadata(item.title), titleAr: item.titleAr, template: item.template, xpReward: item.xpReward, content: item.content };
      await tx.lesson.upsert({ where: { id: item.id }, update: data, create: { id: item.id, ...data, status: "PUBLISHED", publishedAt: new Date() } });
    }
  }, { timeout: 30000 });

  const verified = await prisma.lesson.findMany({ where: { chapterId: chapter.id }, orderBy: { order: "asc" }, select: { id: true, order: true, status: true, content: true } });
  if (verified.length !== plan.length || verified.some((lesson, index) => lesson.id !== plan[index].id || lesson.order !== plan[index].order || lesson.status !== "PUBLISHED")) throw new Error("Post-promotion Chapter 6 verification failed.");
  const test = verified.find(({ id }) => id === "ch06-test");
  if (test?.content?.assessment?.questions?.length !== 12) throw new Error("Chapter 6 final test verification failed.");
  console.log("\nChapter 6 promotion applied and verified. Learner progress rows were not modified.");
}

main().catch((error) => { console.error(error); process.exitCode = 1; }).finally(() => prisma.$disconnect());
