/**
 * Scoped Chapter 9 promotion (Docs/proposals/chapter-09-content-proposal.md).
 * Existing lesson IDs ch09-l01..l05 are updated in place so learner progress
 * remains attached — ch09-l05 keeps its ID but changes from VERB_PATTERN to the
 * REVIEW template — and only ch09-test is inserted.
 * The chapter title is updated to the approved title. Filename order equals
 * display order for this chapter.
 *
 * Usage:
 *   npm run content:promote-chapter-nine
 *   npm run content:promote-chapter-nine -- --apply
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

const CHAPTER_TITLE = "Plural Nouns and هٰؤُلَاءِ";
const CHAPTER_TITLE_UR = "جمع کے اسماء اور هٰؤُلَاءِ";
const CHAPTER_TITLE_AR = "صِيَغُ الْجَمْعِ وَهٰؤُلَاءِ";
const CHAPTER_DESCRIPTION = "Three plural families — مُسْلِمُونَ، مُؤْمِنَاتٌ، كُتُبٌ — and هٰؤُلَاءِ to point to a nearby group of people.";
const CHAPTER_DESCRIPTION_UR = "جمع کے تین خاندان — مُسْلِمُونَ، مُؤْمِنَاتٌ، كُتُبٌ — اور قریب کی انسانی جماعت کی طرف اشارے کے لیے هٰؤُلَاءِ۔";

const plan = [
  ["ch09-l01", 1, "Sound Masculine Plural — ـُونَ", "جَمْعُ الْمُذَكَّرِ السَّالِم", "STANDARD", "chapter-09-lesson-01.json"],
  ["ch09-l02", 2, "Sound Feminine Plural — ـَات", "جَمْعُ الْمُؤَنَّثِ السَّالِم", "STANDARD", "chapter-09-lesson-02.json"],
  ["ch09-l03", 3, "Common Broken Plurals", "الْجَمْعُ الْمُكَسَّر", "STANDARD", "chapter-09-lesson-03.json"],
  ["ch09-l04", 4, "Nearby People — هٰؤُلَاءِ", "هٰؤُلَاءِ — لِلْجَمَاعَةِ الْقَرِيبَة", "STANDARD", "chapter-09-lesson-04.json"],
  ["ch09-cl05", 5, "Who Are These People? — Conversation Lab", "مَنْ هٰؤُلَاءِ؟", "SPOKEN_PHRASES", "chapter-09-lesson-05-conversation-lab.json"],
  ["ch09-l05", 6, "Chapter 9 Review", "مُرَاجَعَةُ الْفَصْلِ التَّاسِع", "REVIEW", "chapter-09-lesson-06-review.json"],
  ["ch09-test", 7, "Chapter 9 Final Test", "اخْتِبَارُ الْفَصْلِ التَّاسِعِ", "REVIEW", "chapter-09-lesson-07-final-test.json"],
].map(([id, order, title, titleAr, template, filename]) => {
  const content = JSON.parse(fs.readFileSync(path.join(FIXTURES_DIR, filename), "utf8"));
  return { id, order, title, titleAr, template, content, xpReward: content._meta?.xp_reward ?? 10 };
});

async function main() {
  const chapter = await prisma.chapter.findUnique({ where: { order: 9 }, select: { id: true, title: true } });
  if (!chapter) throw new Error("Chapter 9 does not exist.");
  const existing = await prisma.lesson.findMany({ where: { chapterId: chapter.id }, orderBy: { order: "asc" }, select: { id: true } });
  const existingIds = new Set(existing.map(({ id }) => id));
  const unexpected = existing.filter(({ id }) => !plan.some((item) => item.id === id));
  if (unexpected.length) throw new Error(`Unexpected Chapter 9 lesson IDs: ${unexpected.map(({ id }) => id).join(", ")}`);

  console.log(`${APPLY ? "Applying" : "Dry run for"} Chapter 9 promotion:`);
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
  if (verified.length !== plan.length || verified.some((lesson, index) => lesson.id !== plan[index].id || lesson.order !== plan[index].order || lesson.status !== "PUBLISHED")) throw new Error("Post-promotion Chapter 9 verification failed.");
  const test = verified.find(({ id }) => id === "ch09-test");
  if (test?.content?.assessment?.questions?.length !== 12) throw new Error("Chapter 9 final test verification failed.");
  console.log("\nChapter 9 promotion applied and verified. Learner progress rows were not modified.");
}

main().catch((error) => { console.error(error); process.exitCode = 1; }).finally(() => prisma.$disconnect());
