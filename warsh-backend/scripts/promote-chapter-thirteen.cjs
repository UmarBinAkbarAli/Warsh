/**
 * Scoped Chapter 13 promotion (Docs/proposals/chapter-13-content-proposal.md).
 * Existing lesson IDs ch13-l01..l04 are updated in place so learner progress
 * remains attached and keep their display orders 1–4. ch13-l05 (review) and
 * ch13-test are the only inserted rows. The chapter is renamed from
 * "Plural Forms — An Introduction" to "Reading Plurals in the Quran".
 *
 * Usage:
 *   npm run content:promote-chapter-thirteen
 *   npm run content:promote-chapter-thirteen -- --apply
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

const CHAPTER_TITLE = "Reading Plurals in the Quran";
const CHAPTER_TITLE_UR = "قرآن میں جمع پڑھنا";
const CHAPTER_TITLE_AR = "قِرَاءَةُ الْجُمُوعِ فِي الْقُرْآنِ";
const CHAPTER_DESCRIPTION = "Recognising the three plural families in Quranic forms and short sentences: ـُونَ and ـِينَ, ـَات, and broken plurals learned with their singulars.";
const CHAPTER_DESCRIPTION_UR = "قرآنی صورتوں اور مختصر جملوں میں جمع کے تین خاندانوں کی پہچان: ـُونَ اور ـِينَ، ـَات، اور جمع مکسر اپنے واحد کے ساتھ۔";

const plan = [
  ["ch13-l01", 1, "Sound Masculine Plurals in Quranic Context", "جَمْعُ الْمُذَكَّرِ السَّالِمِ فِي الْقُرْآنِ", "STANDARD", "chapter-13-lesson-01.json"],
  ["ch13-l02", 2, "Sound Feminine Plurals in Quranic Context", "جَمْعُ الْمُؤَنَّثِ السَّالِمِ فِي الْقُرْآنِ", "STANDARD", "chapter-13-lesson-02.json"],
  ["ch13-l03", 3, "Broken Plurals in the Quran", "الْجَمْعُ الْمُكَسَّرُ فِي الْقُرْآنِ", "STANDARD", "chapter-13-lesson-03.json"],
  ["ch13-l04", 4, "Plural Reading Lab", "مُخْتَبَرُ قِرَاءَةِ الْجُمُوعِ", "STANDARD", "chapter-13-lesson-04.json"],
  ["ch13-l05", 5, "Chapter 13 Review", "مُرَاجَعَةُ الْفَصْلِ الثَّالِثَ عَشَرَ", "REVIEW", "chapter-13-lesson-05-review.json"],
  ["ch13-test", 6, "Chapter 13 Final Test", "اخْتِبَارُ الْفَصْلِ الثَّالِثَ عَشَرَ", "REVIEW", "chapter-13-lesson-06-final-test.json"],
].map(([id, order, title, titleAr, template, filename]) => {
  const content = JSON.parse(fs.readFileSync(path.join(FIXTURES_DIR, filename), "utf8"));
  return { id, order, title, titleAr, template, content, xpReward: content._meta?.xp_reward ?? 10 };
});

async function main() {
  const chapter = await prisma.chapter.findUnique({ where: { order: 13 }, select: { id: true, title: true } });
  if (!chapter) throw new Error("Chapter 13 does not exist.");
  const existing = await prisma.lesson.findMany({ where: { chapterId: chapter.id }, orderBy: { order: "asc" }, select: { id: true } });
  const existingIds = new Set(existing.map(({ id }) => id));
  const unexpected = existing.filter(({ id }) => !plan.some((item) => item.id === id));
  if (unexpected.length) throw new Error(`Unexpected Chapter 13 lesson IDs: ${unexpected.map(({ id }) => id).join(", ")}`);

  console.log(`${APPLY ? "Applying" : "Dry run for"} Chapter 13 promotion:`);
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
  if (verified.length !== plan.length || verified.some((lesson, index) => lesson.id !== plan[index].id || lesson.order !== plan[index].order || lesson.status !== "PUBLISHED")) throw new Error("Post-promotion Chapter 13 verification failed.");
  const test = verified.find(({ id }) => id === "ch13-test");
  if (test?.content?.assessment?.questions?.length !== 12) throw new Error("Chapter 13 final test verification failed.");
  console.log("\nChapter 13 promotion applied and verified. Learner progress rows were not modified.");
}

main().catch((error) => { console.error(error); process.exitCode = 1; }).finally(() => prisma.$disconnect());
