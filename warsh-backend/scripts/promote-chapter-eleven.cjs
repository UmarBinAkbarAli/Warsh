/**
 * Scoped Chapter 11 promotion (Docs/proposals/chapter-11-content-proposal.md).
 * Existing lesson IDs ch11-l01..l05 are updated in place so learner progress
 * remains attached and keep their display orders 1–5. ch11-l06 (review) and
 * ch11-test are the only inserted rows. The chapter description is updated to
 * the approved text; the chapter title is unchanged.
 *
 * Since 2026-09-23 the plan also carries the CL6 Conversation Lab (ch11-cl06,
 * order 6), which moved the review and test to orders 7 and 8. The narrower
 * content:promote-conversation-lab-ch11 is what first shipped that change.
 *
 * Usage:
 *   npm run content:promote-chapter-eleven
 *   npm run content:promote-chapter-eleven -- --apply
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

const CHAPTER_TITLE = "The Home and Family";
const CHAPTER_TITLE_UR = "گھر اور خاندان";
const CHAPTER_TITLE_AR = "الْبَيْت وَالأُسْرَة";
const CHAPTER_DESCRIPTION = "Family vocabulary, the ي of 'my', فِيهِ / فِيهَا for inside, and بُيُوتِكُمْ.";
const CHAPTER_DESCRIPTION_UR = "خاندانی الفاظ، 'میرا' کی ي، اندر کے لیے فِيهِ / فِيهَا، اور بُيُوتِكُمْ۔";

const plan = [
  ["ch11-l01", 1, "My Father and My Mother — أَبِي and أُمِّي", "أَبِي وَأُمِّي", "STANDARD", "chapter-11-lesson-01.json"],
  ["ch11-l02", 2, "Family Vocabulary", "مُفْرَدَاتُ الْأُسْرَةِ", "STANDARD", "chapter-11-lesson-02.json"],
  ["ch11-l03", 3, "In It, Masculine — فِيهِ", "فِيهِ — ضَمِيرُ الْمُفْرَدِ الْغَائِبِ", "STANDARD", "chapter-11-lesson-03.json"],
  ["ch11-l04", 4, "In It, Feminine — فِيهَا", "فِيهَا — ضَمِيرُ الْمُفْرَدَةِ الْغَائِبَةِ", "STANDARD", "chapter-11-lesson-04.json"],
  ["ch11-l05", 5, "Home in the Quran — بُيُوتِكُمْ", "بُيُوتِكُمْ فِي الْقُرْآنِ", "STANDARD", "chapter-11-lesson-05.json"],
  ["ch11-cl06", 6, "Home and Family — Conversation Lab", "مَنْ هَذَا؟", "SPOKEN_PHRASES", "chapter-11-lesson-06-conversation-lab.json"],
  ["ch11-l06", 7, "Chapter 11 Review", "مُرَاجَعَةُ الْفَصْلِ الْحَادِيَ عَشَرَ", "REVIEW", "chapter-11-lesson-07-review.json"],
  ["ch11-test", 8, "Chapter 11 Final Test", "اخْتِبَارُ الْفَصْلِ الْحَادِيَ عَشَرَ", "REVIEW", "chapter-11-lesson-08-final-test.json"],
].map(([id, order, title, titleAr, template, filename]) => {
  const content = JSON.parse(fs.readFileSync(path.join(FIXTURES_DIR, filename), "utf8"));
  return { id, order, title, titleAr, template, content, xpReward: content._meta?.xp_reward ?? 10 };
});

async function main() {
  const chapter = await prisma.chapter.findUnique({ where: { order: 11 }, select: { id: true, title: true } });
  if (!chapter) throw new Error("Chapter 11 does not exist.");
  const existing = await prisma.lesson.findMany({ where: { chapterId: chapter.id }, orderBy: { order: "asc" }, select: { id: true } });
  const existingIds = new Set(existing.map(({ id }) => id));
  const unexpected = existing.filter(({ id }) => !plan.some((item) => item.id === id));
  if (unexpected.length) throw new Error(`Unexpected Chapter 11 lesson IDs: ${unexpected.map(({ id }) => id).join(", ")}`);

  console.log(`${APPLY ? "Applying" : "Dry run for"} Chapter 11 promotion:`);
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
  if (verified.length !== plan.length || verified.some((lesson, index) => lesson.id !== plan[index].id || lesson.order !== plan[index].order || lesson.status !== "PUBLISHED")) throw new Error("Post-promotion Chapter 11 verification failed.");
  const test = verified.find(({ id }) => id === "ch11-test");
  if (test?.content?.assessment?.questions?.length !== 12) throw new Error("Chapter 11 final test verification failed.");
  console.log("\nChapter 11 promotion applied and verified. Learner progress rows were not modified.");
}

main().catch((error) => { console.error(error); process.exitCode = 1; }).finally(() => prisma.$disconnect());
