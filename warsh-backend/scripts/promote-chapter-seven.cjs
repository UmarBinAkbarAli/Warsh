/**
 * Scoped Chapter 7 promotion (Docs/proposals/chapter-07-content-proposal.md).
 * Existing lesson IDs ch07-l01..l05 are updated in place so learner progress
 * remains attached; only the two new IDs (ch07-l06, ch07-test) are inserted.
 * The chapter title is updated to the approved title. Filename order equals
 * display order for this chapter.
 *
 * Usage:
 *   npm run content:promote-chapter-seven
 *   npm run content:promote-chapter-seven -- --apply
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

const CHAPTER_TITLE = "Attached Pronouns and Simple Possession";
const CHAPTER_TITLE_UR = "جڑی ہوئی ضمیریں اور سادہ ملکیت";
const CHAPTER_DESCRIPTION = "Ownership expressed with attached endings — my, your (to a man or a woman), his, her — and 'I have' with عِنْدَ.";
const CHAPTER_DESCRIPTION_UR = "جڑی ہوئی علامتوں سے ملکیت — میرا، تمہارا (مرد یا عورت سے)، اس کا، اس کی — اور عِنْدَ سے 'میرے پاس ہے'۔";

const plan = [
  ["ch07-l01", 1, "My — attached ي", "كِتَابِي — يَاءُ المُتَكَلِّم", "STANDARD", "chapter-07-lesson-01.json"],
  ["ch07-l02", 2, "Your — attached كَ and كِ", "كِتَابُكَ — كَافُ الخِطَاب", "STANDARD", "chapter-07-lesson-02.json"],
  ["ch07-l03", 3, "His and Her — attached هُ and هَا", "كِتَابُهُ وَمَدْرَسَتُهَا", "STANDARD", "chapter-07-lesson-03.json"],
  ["ch07-l04", 4, "Possession with عِنْدَ", "عِنْدَ مَعَ الضَّمِير", "STANDARD", "chapter-07-lesson-04.json"],
  ["ch07-l05", 5, "Simple Questions", "الأَسْئِلَةُ السَّهْلَة", "SPOKEN_PHRASES", "chapter-07-lesson-05-spoken-phrases.json"],
  ["ch07-l06", 6, "Chapter 7 Review", "مُرَاجَعَةُ الْفَصْلِ السَّابِع", "REVIEW", "chapter-07-lesson-06-review.json"],
  ["ch07-test", 7, "Chapter 7 Final Test", "اخْتِبَارُ الْفَصْلِ السَّابِعِ", "REVIEW", "chapter-07-lesson-07-final-test.json"],
].map(([id, order, title, titleAr, template, filename]) => {
  const content = JSON.parse(fs.readFileSync(path.join(FIXTURES_DIR, filename), "utf8"));
  return { id, order, title, titleAr, template, content, xpReward: content._meta?.xp_reward ?? 10 };
});

async function main() {
  const chapter = await prisma.chapter.findUnique({ where: { order: 7 }, select: { id: true, title: true } });
  if (!chapter) throw new Error("Chapter 7 does not exist.");
  const existing = await prisma.lesson.findMany({ where: { chapterId: chapter.id }, orderBy: { order: "asc" }, select: { id: true } });
  const existingIds = new Set(existing.map(({ id }) => id));
  const unexpected = existing.filter(({ id }) => !plan.some((item) => item.id === id));
  if (unexpected.length) throw new Error(`Unexpected Chapter 7 lesson IDs: ${unexpected.map(({ id }) => id).join(", ")}`);

  console.log(`${APPLY ? "Applying" : "Dry run for"} Chapter 7 promotion:`);
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
  if (verified.length !== plan.length || verified.some((lesson, index) => lesson.id !== plan[index].id || lesson.order !== plan[index].order || lesson.status !== "PUBLISHED")) throw new Error("Post-promotion Chapter 7 verification failed.");
  const test = verified.find(({ id }) => id === "ch07-test");
  if (test?.content?.assessment?.questions?.length !== 12) throw new Error("Chapter 7 final test verification failed.");
  console.log("\nChapter 7 promotion applied and verified. Learner progress rows were not modified.");
}

main().catch((error) => { console.error(error); process.exitCode = 1; }).finally(() => prisma.$disconnect());
