/**
 * Scoped Chapter 8 promotion (Docs/proposals/chapter-08-content-proposal.md).
 * Existing lesson IDs ch08-l01..l04 are updated in place so learner progress
 * remains attached; only the two new IDs (ch08-l05, ch08-test) are inserted.
 * The chapter title is updated to the approved title. Filename order equals
 * display order for this chapter.
 *
 * Usage:
 *   npm run content:promote-chapter-eight
 *   npm run content:promote-chapter-eight -- --apply
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

const CHAPTER_TITLE = "Feminine Past Verbs and الَّتِي";
const CHAPTER_TITLE_UR = "مؤنث ماضی کے افعال اور الَّتِي";
const CHAPTER_DESCRIPTION = "The silent تْ marks 'she' on a past verb — ذَهَبَتْ، قَالَتْ — and الَّتِي connects a feminine noun to its description.";
const CHAPTER_DESCRIPTION_UR = "ماضی فعل پر ساکن تْ 'وہ (عورت)' کی علامت ہے — ذَهَبَتْ، قَالَتْ — اور الَّتِي مؤنث اسم کو اس کی وضاحت سے جوڑتا ہے۔";

const plan = [
  ["ch08-l01", 1, "She Went — ذَهَبَتْ", "ذَهَبَتْ — تَاءُ التَّأْنِيثِ السَّاكِنَة", "STANDARD", "chapter-08-lesson-01.json"],
  ["ch08-l02", 2, "The Same Marker Across Verbs", "تَاءُ التَّأْنِيثِ فِي أَفْعَالٍ كَثِيرَة", "STANDARD", "chapter-08-lesson-02.json"],
  ["ch08-l03", 3, "الَّتِي — Feminine Relative", "الَّتِي — اسْمٌ مَوْصُولٌ مُؤَنَّث", "STANDARD", "chapter-08-lesson-03.json"],
  ["ch08-l04", 4, "My Mother — Feminine Integration", "أُمِّي — تَطْبِيقُ المُؤَنَّث", "STANDARD", "chapter-08-lesson-04.json"],
  ["ch08-l05", 5, "Chapter 8 Review", "مُرَاجَعَةُ الْفَصْلِ الثَّامِن", "REVIEW", "chapter-08-lesson-05-review.json"],
  ["ch08-test", 6, "Chapter 8 Final Test", "اخْتِبَارُ الْفَصْلِ الثَّامِنِ", "REVIEW", "chapter-08-lesson-06-final-test.json"],
].map(([id, order, title, titleAr, template, filename]) => {
  const content = JSON.parse(fs.readFileSync(path.join(FIXTURES_DIR, filename), "utf8"));
  return { id, order, title, titleAr, template, content, xpReward: content._meta?.xp_reward ?? 10 };
});

async function main() {
  const chapter = await prisma.chapter.findUnique({ where: { order: 8 }, select: { id: true, title: true } });
  if (!chapter) throw new Error("Chapter 8 does not exist.");
  const existing = await prisma.lesson.findMany({ where: { chapterId: chapter.id }, orderBy: { order: "asc" }, select: { id: true } });
  const existingIds = new Set(existing.map(({ id }) => id));
  const unexpected = existing.filter(({ id }) => !plan.some((item) => item.id === id));
  if (unexpected.length) throw new Error(`Unexpected Chapter 8 lesson IDs: ${unexpected.map(({ id }) => id).join(", ")}`);

  console.log(`${APPLY ? "Applying" : "Dry run for"} Chapter 8 promotion:`);
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
  if (verified.length !== plan.length || verified.some((lesson, index) => lesson.id !== plan[index].id || lesson.order !== plan[index].order || lesson.status !== "PUBLISHED")) throw new Error("Post-promotion Chapter 8 verification failed.");
  const test = verified.find(({ id }) => id === "ch08-test");
  if (test?.content?.assessment?.questions?.length !== 12) throw new Error("Chapter 8 final test verification failed.");
  console.log("\nChapter 8 promotion applied and verified. Learner progress rows were not modified.");
}

main().catch((error) => { console.error(error); process.exitCode = 1; }).finally(() => prisma.$disconnect());
