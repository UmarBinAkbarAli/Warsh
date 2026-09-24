/**
 * Scoped promotion of the Chapter 24 rebuild
 * (Docs/proposals/chapter-24-content-proposal.md). Existing lesson IDs are
 * updated in place so learner progress stays attached; ch24-l06 becomes the
 * REVIEW and ch24-test is new at order 7. Learners who had finished the
 * chapter are not locked by the new row and see "New" / "Updated" notices:
 * Lesson.addedAt and Lesson.contentUpdatedAt are stamped by the database
 * trigger, so no progress backfill is needed.
 *
 * Usage:
 *   npm run content:promote-chapter-twenty-four             # dry run
 *   npm run content:promote-chapter-twenty-four -- --apply
 */
require("dotenv/config");

const fs = require("node:fs");
const path = require("node:path");
const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");
const { localizeMetadata } = require("../prisma/urdu-metadata.cjs");
const { specs: books24Specs } = require("../prisma/curriculum-books2-4.cjs");

const APPLY = process.argv.includes("--apply");
const CHAPTER = 24;
const FIXTURES_DIR = path.join(__dirname, "../prisma/fixtures");

// [id, display order, title, titleAr, template, fixture]
const PLANS = {
  24: [
    ["ch24-l01", 1, "What Does إِنَّ Add?", "إِنَّ لِلتَّوْكِيدِ", "STANDARD", "chapter-24-lesson-01.json"],
    ["ch24-l02", 2, "The Noun and the News After إِنَّ", "اسْمُ إِنَّ وَخَبَرُهَا", "STANDARD", "chapter-24-lesson-02.json"],
    ["ch24-l03", 3, "إِنَّا — Indeed We", "إِنَّا = إِنَّ + نَا", "STANDARD", "chapter-24-lesson-03.json"],
    ["ch24-l04", 4, "Apply إِنَّ in New Sentences", "إِنَّ فِي جُمَلٍ جَدِيدَةٍ", "STANDARD", "chapter-24-lesson-04.json"],
    ["ch24-l05", 5, "Guided Reading: Al-Kawthar 108:1", "إِنَّا أَعْطَيْنَاكَ الْكَوْثَرَ", "STANDARD", "chapter-24-lesson-05.json"],
    ["ch24-l06", 6, "Chapter 24 Mixed Review", "مُرَاجَعَةُ الْفَصْلِ الرَّابِعِ وَالْعِشْرِينَ", "REVIEW", "chapter-24-lesson-06-review.json"],
    ["ch24-test", 7, "Chapter 24 Final Test", "اخْتِبَارُ الْفَصْلِ الرَّابِعِ وَالْعِشْرِينَ", "REVIEW", "chapter-24-lesson-07-final-test.json"],
  ],
};
const TEST_QUESTIONS = { 24: 12 };

async function main() {
  const spec = books24Specs.find((candidate) => candidate.order === CHAPTER);
  const plan = PLANS[CHAPTER].map(([id, order, title, titleAr, template, filename]) => {
    const content = JSON.parse(fs.readFileSync(path.join(FIXTURES_DIR, filename), "utf8"));
    if (content._meta?.lesson_order !== order) throw new Error(`${filename} has lesson_order ${content._meta?.lesson_order}, expected ${order}.`);
    return { id, order, title, titleAr, template, content, xpReward: content._meta?.xp_reward ?? 10 };
  });

  const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL ?? "" }) });
  try {
    const chapter = await prisma.chapter.findUnique({ where: { order: CHAPTER }, select: { id: true, title: true } });
    if (!chapter) throw new Error(`Chapter ${CHAPTER} does not exist.`);
    const existing = await prisma.lesson.findMany({ where: { chapterId: chapter.id }, select: { id: true } });
    const existingIds = new Set(existing.map(({ id }) => id));
    const unexpected = existing.filter(({ id }) => !plan.some((item) => item.id === id));
    if (unexpected.length) throw new Error(`Unexpected Chapter ${CHAPTER} lesson IDs: ${unexpected.map(({ id }) => id).join(", ")}`);

    console.log(`${APPLY ? "Applying" : "Dry run for"} Chapter ${CHAPTER} promotion:`);
    console.log(`  chapter title: "${chapter.title}" -> "${spec.title}"`);
    for (const item of [...plan].sort((a, b) => a.order - b.order)) console.log(`  ${item.order}. ${item.id} — ${existingIds.has(item.id) ? "update" : "create"} — ${item.title}`);
    if (!APPLY) {
      console.log("\nNo data changed. Re-run with --apply after reviewing this plan.");
      return;
    }

    await prisma.$transaction(async (tx) => {
      await tx.chapter.update({
        where: { id: chapter.id },
        data: {
          title: spec.title,
          titleUr: spec.titleUr ?? localizeMetadata(spec.title),
          titleAr: spec.titleAr,
          description: spec.description,
          descriptionUr: spec.descriptionUr ?? localizeMetadata(spec.description),
        },
      });
      for (const item of plan) {
        const data = { chapterId: chapter.id, order: item.order, title: item.title, titleUr: item.content._meta?.titleUr ?? localizeMetadata(item.title), titleAr: item.titleAr, template: item.template, xpReward: item.xpReward, content: item.content };
        await tx.lesson.upsert({ where: { id: item.id }, update: data, create: { id: item.id, ...data, status: "PUBLISHED", publishedAt: new Date() } });
      }
    }, { timeout: 30000 });

    const verified = await prisma.lesson.findMany({ where: { chapterId: chapter.id }, orderBy: { order: "asc" }, select: { id: true, order: true, status: true, content: true } });
    const expected = [...plan].sort((a, b) => a.order - b.order);
    if (verified.length !== expected.length || verified.some((lesson, index) => lesson.id !== expected[index].id || lesson.order !== expected[index].order || lesson.status !== "PUBLISHED")) {
      throw new Error(`Post-promotion Chapter ${CHAPTER} verification failed.`);
    }
    const test = verified.find(({ id }) => id === `ch${CHAPTER}-test`);
    if (test?.content?.assessment?.questions?.length !== TEST_QUESTIONS[CHAPTER]) throw new Error(`Chapter ${CHAPTER} final test verification failed.`);
    console.log(`\nChapter ${CHAPTER} promotion applied and verified. Learner progress rows were not modified.`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
