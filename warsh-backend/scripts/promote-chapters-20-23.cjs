/**
 * Scoped promotion of the Chapter 20–23 rebuilds
 * (Docs/proposals/chapter-20..23-content-proposal.md), one chapter per run.
 * Existing lesson IDs are updated in place so learner progress stays attached.
 * New rows: ch20-l06, ch20-l07 and ch20-test; the Conversation Labs ch21-cl08
 * and ch22-cl09 at order 5, with the reviews ch21-l05 / ch22-l05 keeping their
 * IDs and moving to order 6; ch23-l05 and every chNN-test. Learners who had
 * finished a chapter are not locked by the new rows and see "New" / "Updated"
 * notices: Lesson.addedAt and Lesson.contentUpdatedAt are stamped by the
 * database trigger, so no progress backfill is needed.
 *
 * Usage:
 *   npm run content:promote-chapter-twenty                # dry run
 *   npm run content:promote-chapter-twenty -- --apply
 *   (…-twenty-one, -twenty-two, -twenty-three likewise)
 */

require("dotenv/config");

const fs = require("node:fs");
const path = require("node:path");
const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");
const { localizeMetadata } = require("../prisma/urdu-metadata.cjs");
const { specs: books24Specs } = require("../prisma/curriculum-books2-4.cjs");

const APPLY = process.argv.includes("--apply");
const chapterArg = process.argv.find((arg) => arg.startsWith("--chapter="));
const CHAPTER = Number(chapterArg?.split("=")[1]);
const FIXTURES_DIR = path.join(__dirname, "../prisma/fixtures");

// [id, display order, title, titleAr, template, fixture]. A review that moves
// down is listed before the lab that takes its old order (no unique constraint,
// but it keeps the log honest).
const PLANS = {
  20: [
    ["ch20-l01", 1, "Our: ـنَا on a Noun", "رَبَّنَا وَذُنُوبَنَا", "STANDARD", "chapter-20-lesson-01.json"],
    ["ch20-l02", 2, "Your, to a Group: ـكُمْ", "رَبَّكُمُ", "STANDARD", "chapter-20-lesson-02.json"],
    ["ch20-l03", 3, "Their: ـهُمْ", "أَجْرُهُمْ عِنْدَ رَبِّهِمْ", "STANDARD", "chapter-20-lesson-03.json"],
    ["ch20-l04", 4, "Your, to a Group of Women: ـكُنَّ", "بُيُوتُكُنَّ", "STANDARD", "chapter-20-lesson-04.json"],
    ["ch20-l05", 5, "Their, a Group of Women: ـهُنَّ", "رِزْقُهُنَّ وَكِسْوَتُهُنَّ", "STANDARD", "chapter-20-lesson-05.json"],
    ["ch20-l06", 6, "Who Belongs to Whom?", "الِاسْمُ وَصَاحِبُهُ", "STANDARD", "chapter-20-lesson-06.json"],
    ["ch20-l07", 7, "Chapter 20 Review", "مُرَاجَعَةُ الْفَصْلِ الْعِشْرِينَ", "REVIEW", "chapter-20-lesson-07-review.json"],
    ["ch20-test", 8, "Chapter 20 Final Test", "اخْتِبَارُ الْفَصْلِ الْعِشْرِينَ", "REVIEW", "chapter-20-lesson-08-final-test.json"],
  ],
  21: [
    ["ch21-l01", 1, "The Journey: From Where, To Where?", "مِنْ أَيْنَ وَإِلَى أَيْنَ؟", "STANDARD", "chapter-21-lesson-01.json"],
    ["ch21-l02", 2, "Which Movement Happened?", "ذَهَبَ، خَرَجَ، دَخَلَ، رَجَعَ", "STANDARD", "chapter-21-lesson-02.json"],
    ["ch21-l03", 3, "Find It by a Landmark", "بَيْنَ … وَ …", "STANDARD", "chapter-21-lesson-03.json"],
    ["ch21-l04", 4, "Quran Reading: Entering and Leaving", "دَخَلَ وَخَرَجَ فِي الْقُرْآنِ", "STANDARD", "chapter-21-lesson-04.json"],
    ["ch21-l05", 6, "Chapter 21 Review", "مُرَاجَعَةُ الْفَصْلِ الْحَادِي وَالْعِشْرِينَ", "REVIEW", "chapter-21-lesson-06-review.json"],
    ["ch21-cl08", 5, "Finding Someone — Conversation Lab", "أَيْنَ أَحْمَدُ؟", "SPOKEN_PHRASES", "chapter-21-lesson-05-conversation-lab.json"],
    ["ch21-test", 7, "Chapter 21 Final Test", "اخْتِبَارُ الْفَصْلِ الْحَادِي وَالْعِشْرِينَ", "REVIEW", "chapter-21-lesson-07-final-test.json"],
  ],
  22: [
    ["ch22-l01", 1, "Who Said What?", "مَنْ قَالَ؟", "STANDARD", "chapter-22-lesson-01.json"],
    ["ch22-l02", 2, "Who Asked, and What?", "مَنْ سَأَلَ؟", "STANDARD", "chapter-22-lesson-02.json"],
    ["ch22-l03", 3, "An Answer That Fits", "الْجَوَابُ الْمُنَاسِبُ", "STANDARD", "chapter-22-lesson-03.json"],
    ["ch22-l04", 4, "Follow the Full Exchange", "الْحِوَارُ كُلُّهُ", "STANDARD", "chapter-22-lesson-04.json"],
    ["ch22-l05", 6, "Chapter 22 Review", "مُرَاجَعَةُ الْفَصْلِ الثَّانِي وَالْعِشْرِينَ", "REVIEW", "chapter-22-lesson-06-review.json"],
    ["ch22-cl09", 5, "Ask, Answer, Confirm — Conversation Lab", "هَلْ فَهِمْتَ الدَّرْسَ؟", "SPOKEN_PHRASES", "chapter-22-lesson-05-conversation-lab.json"],
    ["ch22-test", 7, "Chapter 22 Final Test", "اخْتِبَارُ الْفَصْلِ الثَّانِي وَالْعِشْرِينَ", "REVIEW", "chapter-22-lesson-07-final-test.json"],
  ],
  23: [
    ["ch23-l01", 1, "Pointing, Owning and Asking", "مَا تِلْكَ بِيَمِينِكَ؟", "STANDARD", "chapter-23-lesson-01.json"],
    ["ch23-l02", 2, "Who Is Described, and Whose Is It?", "الْمَوْصُولُ وَالضَّمِيرُ", "STANDARD", "chapter-23-lesson-02.json"],
    ["ch23-l03", 3, "Read the Small Scene", "قِرَاءَةُ الْمَشْهَدِ", "STANDARD", "chapter-23-lesson-03.json"],
    ["ch23-l04", 4, "Quran Reading Across Real Ayat", "قِرَاءَةُ الْآيَاتِ", "STANDARD", "chapter-23-lesson-04.json"],
    ["ch23-l05", 5, "Book 2 Mixed Review", "مُرَاجَعَةُ الْكِتَابِ الثَّانِي", "REVIEW", "chapter-23-lesson-05-review.json"],
    ["ch23-test", 6, "Chapter 23 Final Test", "اخْتِبَارُ الْفَصْلِ الثَّالِثِ وَالْعِشْرِينَ", "REVIEW", "chapter-23-lesson-06-final-test.json"],
  ],
};
// Chapter 23 is the cumulative Book 2 test.
const TEST_QUESTIONS = { 20: 12, 21: 12, 22: 12, 23: 16 };

async function main() {
  if (!PLANS[CHAPTER]) throw new Error("Pass --chapter=20 … --chapter=23.");
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
