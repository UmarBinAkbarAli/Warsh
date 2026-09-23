/**
 * Scoped promotion of the Chapter 15–19 rebuilds
 * (Docs/proposals/chapter-15..19-content-proposal.md), one chapter per run.
 * Existing lesson IDs are updated in place so learner progress stays attached,
 * and every existing lesson keeps its display order; each chapter gains only
 * its final test (chNN-test). Learners who had finished a chapter are not
 * locked by the new test and see "New" / "Updated" notices: Lesson.addedAt and
 * Lesson.contentUpdatedAt are stamped by the database trigger, so no progress
 * backfill is needed.
 *
 * Usage:
 *   npm run content:promote-chapter-fifteen                # dry run
 *   npm run content:promote-chapter-fifteen -- --apply
 *   (…-sixteen, -seventeen, -eighteen, -nineteen likewise)
 */

require("dotenv/config");

const fs = require("node:fs");
const path = require("node:path");
const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");
const { localizeMetadata } = require("../prisma/urdu-metadata.cjs");
const { specs: book1Specs } = require("../prisma/curriculum-book1.cjs");
const { specs: books24Specs } = require("../prisma/curriculum-books2-4.cjs");

const APPLY = process.argv.includes("--apply");
const chapterArg = process.argv.find((arg) => arg.startsWith("--chapter="));
const CHAPTER = Number(chapterArg?.split("=")[1]);
const FIXTURES_DIR = path.join(__dirname, "../prisma/fixtures");

// [id, display order, title, titleAr, template, fixture]
const PLANS = {
  15: [
    ["ch15-l01", 1, "These and Those People", "هٰؤُلَاءِ وَأُولٰئِكَ", "STANDARD", "chapter-15-lesson-01.json"],
    ["ch15-l02", 2, "People or Things? Choosing the Pointer", "لِلنَّاسِ أَمْ لِلْأَشْيَاءِ؟", "STANDARD", "chapter-15-lesson-02.json"],
    ["ch15-l03", 3, "Pointing Phrase or Complete Statement?", "تَرْكِيبٌ إِشَارِيٌّ أَمْ جُمْلَةٌ؟", "STANDARD", "chapter-15-lesson-03.json"],
    ["ch15-l04", 4, "Quran Reading Lab: Who Are “Those”?", "مَنْ أُولَٰئِكَ؟", "STANDARD", "chapter-15-lesson-04.json"],
    ["ch15-l05", 5, "Chapter 15 Review", "مُرَاجَعَةُ الْفَصْلِ الْخَامِسَ عَشَرَ", "REVIEW", "chapter-15-lesson-05-review.json"],
    ["ch15-test", 6, "Chapter 15 Final Test", "اخْتِبَارُ الْفَصْلِ الْخَامِسَ عَشَرَ", "REVIEW", "chapter-15-lesson-06-final-test.json"],
  ],
  16: [
    ["ch16-l01", 1, "In the Learning Space", "فِي الْفَصْلِ", "STANDARD", "chapter-16-lesson-01.json"],
    ["ch16-l02", 2, "Teacher, Student, and Lesson", "الْأُسْتَاذُ وَالطَّالِبُ وَالدَّرْسُ", "STANDARD", "chapter-16-lesson-02.json"],
    ["ch16-l03", 3, "Yesterday, Today, Tomorrow", "أَمْسِ وَالْيَوْمَ وَغَدًا", "STANDARD", "chapter-16-lesson-03.json"],
    ["ch16-l04", 4, "Listen and Respond in Class", "تَعْلِيمَاتُ الْفَصْلِ", "STANDARD", "chapter-16-lesson-04.json"],
    ["ch16-l05", 5, "Chapter 16 Review", "مُرَاجَعَةُ الْفَصْلِ السَّادِسَ عَشَرَ", "REVIEW", "chapter-16-lesson-05-review.json"],
    ["ch16-test", 6, "Chapter 16 Final Test", "اخْتِبَارُ الْفَصْلِ السَّادِسَ عَشَرَ", "REVIEW", "chapter-16-lesson-06-final-test.json"],
  ],
  17: [
    ["ch17-l01", 1, "Eating and Drinking", "أَكَلَ وَشَرِبَ", "STANDARD", "chapter-17-lesson-01.json"],
    ["ch17-l02", 2, "Reading and Writing", "قَرَأَ وَكَتَبَ", "STANDARD", "chapter-17-lesson-02.json"],
    ["ch17-l03", 3, "Standing, and an Action Sentence", "قَامَ", "STANDARD", "chapter-17-lesson-03.json"],
    ["ch17-l04", 4, "Prayer and Movement", "صَلَّى وَذَهَبَ", "STANDARD", "chapter-17-lesson-04.json"],
    ["ch17-l05", 5, "Hearing, and Who Did What", "سَمِعَ", "STANDARD", "chapter-17-lesson-05.json"],
    ["ch17-l06", 6, "Chapter 17 Review", "مُرَاجَعَةُ الْفَصْلِ السَّابِعَ عَشَرَ", "REVIEW", "chapter-17-lesson-06-review.json"],
    ["ch17-test", 7, "Chapter 17 Final Test", "اخْتِبَارُ الْفَصْلِ السَّابِعَ عَشَرَ", "REVIEW", "chapter-17-lesson-07-final-test.json"],
  ],
  18: [
    ["ch18-l01", 1, "Who Does الَّذِي Describe?", "الَّذِي فِي سُورَةِ النَّاسِ", "STANDARD", "chapter-18-lesson-01.json"],
    ["ch18-l02", 2, "The Noun or a Noun?", "الْمَعْرِفَةُ وَالنَّكِرَةُ قَبْلَ الْوَصْفِ", "STANDARD", "chapter-18-lesson-02.json"],
    ["ch18-l03", 3, "Adjective or Clause?", "صِفَةٌ أَمْ صِلَةٌ؟", "STANDARD", "chapter-18-lesson-03.json"],
    ["ch18-l04", 4, "The Feminine Relative in Context", "الَّتِي فِي السِّيَاقِ", "STANDARD", "chapter-18-lesson-04.json"],
    ["ch18-l05", 5, "Read the Whole Sentence", "الْجُمْلَةُ كُلُّهَا", "STANDARD", "chapter-18-lesson-05.json"],
    ["ch18-l06", 6, "An-Nas and Chapter 18 Review", "سُورَةُ النَّاسِ وَمُرَاجَعَةُ الْفَصْلِ الثَّامِنَ عَشَرَ", "REVIEW", "chapter-18-lesson-06-review.json"],
    ["ch18-test", 7, "Chapter 18 Final Test", "اخْتِبَارُ الْفَصْلِ الثَّامِنَ عَشَرَ", "REVIEW", "chapter-18-lesson-07-final-test.json"],
  ],
  19: [
    ["ch19-l01", 1, "Kasra or “My”?", "كَسْرَةٌ أَمْ يَاءُ الْمُتَكَلِّمِ؟", "STANDARD", "chapter-19-lesson-01.json"],
    ["ch19-l02", 2, "Same Shape, Different Attachment", "شَكْلٌ وَاحِدٌ وَمَوْضِعَانِ", "STANDARD", "chapter-19-lesson-02.json"],
    ["ch19-l03", 3, "A Familiar Change in a New Word", "التَّاءُ قَبْلَ الضَّمِيرِ", "STANDARD", "chapter-19-lesson-03.json"],
    ["ch19-l04", 4, "Who Owns What in a Sentence?", "لِمَنْ هٰذَا؟", "STANDARD", "chapter-19-lesson-04.json"],
    ["ch19-l05", 5, "Possession in Quranic Context", "الْمِلْكِيَّةُ فِي السِّيَاقِ الْقُرْآنِيِّ", "STANDARD", "chapter-19-lesson-05.json"],
    ["ch19-l06", 6, "Chapter 19 Review", "مُرَاجَعَةُ الْفَصْلِ التَّاسِعَ عَشَرَ", "REVIEW", "chapter-19-lesson-06-review.json"],
    ["ch19-test", 7, "Chapter 19 Final Test", "اخْتِبَارُ الْفَصْلِ التَّاسِعَ عَشَرَ", "REVIEW", "chapter-19-lesson-07-final-test.json"],
  ],
};

async function main() {
  if (!PLANS[CHAPTER]) throw new Error("Pass --chapter=15 … --chapter=19.");
  const spec = [...book1Specs, ...books24Specs].find((candidate) => candidate.order === CHAPTER);
  const plan = PLANS[CHAPTER].map(([id, order, title, titleAr, template, filename]) => {
    const content = JSON.parse(fs.readFileSync(path.join(FIXTURES_DIR, filename), "utf8"));
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
    for (const item of plan) console.log(`  ${item.order}. ${item.id} — ${existingIds.has(item.id) ? "update" : "create"} — ${item.title}`);
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
    if (test?.content?.assessment?.questions?.length !== 12) throw new Error(`Chapter ${CHAPTER} final test verification failed.`);
    console.log(`\nChapter ${CHAPTER} promotion applied and verified. Learner progress rows were not modified.`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
