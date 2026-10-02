/**
 * Scoped promotion of the Chapter 26–30 rebuilds from the proposal harvest
 * (Docs/proposals/proposal-harvest-tracker.md, batch 1), one chapter per run.
 * Existing lesson IDs are updated in place so learner progress stays attached.
 * New rows: ch26-l06 (review) and every chNN-test; ch30-l07 (review). The old
 * fifth/sixth rows of Ch27–29 become their REVIEW in place. Learners who had
 * finished a chapter are not locked by the new rows and see "New" / "Updated"
 * notices: Lesson.addedAt and Lesson.contentUpdatedAt are stamped by the
 * database trigger, so no progress backfill is needed.
 *
 * Usage:
 *   node scripts/promote-chapters-26-30.cjs --chapter=26            # dry run
 *   node scripts/promote-chapters-26-30.cjs --chapter=26 --apply
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

const review = (n, ar) => [`Chapter ${n} Review`, `مُرَاجَعَةُ الْفَصْلِ ${ar}`];
const finalTest = (n, ar) => [`Chapter ${n} Final Test`, `اخْتِبَارُ الْفَصْلِ ${ar}`];

// [id, display order, title, titleAr, template, fixture]
const PLANS = {
  26: [
    ["ch26-l01", 1, "Unpack a Three-Noun Chain", "بَابُ غُرْفَةِ الْأُسْتَاذِ", "STANDARD", "chapter-26-lesson-01.json"],
    ["ch26-l02", 2, "Point at the Whole Chain", "هَذَا بَابُ غُرْفَةِ الْأُسْتَاذِ", "STANDARD", "chapter-26-lesson-02.json"],
    ["ch26-l03", 3, "Which Noun Does the Adjective Describe?", "الْجَدِيدُ أَمِ الْجَدِيدِ؟", "STANDARD", "chapter-26-lesson-03.json"],
    ["ch26-l04", 4, "A Three-Noun Chain in Al-Fatihah", "مَالِكِ يَوْمِ الدِّينِ", "STANDARD", "chapter-26-lesson-04.json"],
    ["ch26-l06", 5, ...review(26, "السَّادِسِ وَالْعِشْرِينَ"), "REVIEW", "chapter-26-lesson-05-review.json"],
    ["ch26-test", 6, ...finalTest(26, "السَّادِسِ وَالْعِشْرِينَ"), "REVIEW", "chapter-26-lesson-06-final-test.json"],
  ],
  27: [
    ["ch27-l01", 1, "Where, From Where, To Where?", "فِي، عَلَى، مِنْ، إِلَى", "STANDARD", "chapter-27-lesson-01.json"],
    ["ch27-l02", 2, "Joined Prepositions: بِـ and لِـ", "بِالْقَلَمِ، لِلَّهِ", "STANDARD", "chapter-27-lesson-02.json"],
    ["ch27-l03", 3, "عَنْ and كَـ", "عَنِ الدَّرْسِ، كَالْأَسَدِ", "STANDARD", "chapter-27-lesson-03.json"],
    ["ch27-l04", 4, "A Pronoun After a Preposition", "لَهُ، مِنْهُ، إِلَيْهِ", "STANDARD", "chapter-27-lesson-04.json"],
    ["ch27-l05", 5, ...review(27, "السَّابِعِ وَالْعِشْرِينَ"), "REVIEW", "chapter-27-lesson-05-review.json"],
    ["ch27-test", 6, ...finalTest(27, "السَّابِعِ وَالْعِشْرِينَ"), "REVIEW", "chapter-27-lesson-06-final-test.json"],
  ],
  28: [
    ["ch28-l01", 1, "Knew and Understood", "عَلِمَ وَفَهِمَ", "STANDARD", "chapter-28-lesson-01.json"],
    ["ch28-l02", 2, "Memorised, and Pleased With", "حَفِظَ وَرَضِيَ عَنْ", "STANDARD", "chapter-28-lesson-02.json"],
    ["ch28-l03", 3, "Came and Gave", "أَتَى وَأَعْطَى", "STANDARD", "chapter-28-lesson-03.json"],
    ["ch28-l04", 4, "Gathered and Began", "جَمَعَ وَبَدَأَ", "STANDARD", "chapter-28-lesson-04.json"],
    ["ch28-l05", 5, ...review(28, "الثَّامِنِ وَالْعِشْرِينَ"), "REVIEW", "chapter-28-lesson-05-review.json"],
    ["ch28-test", 6, ...finalTest(28, "الثَّامِنِ وَالْعِشْرِينَ"), "REVIEW", "chapter-28-lesson-06-final-test.json"],
  ],
  29: [
    ["ch29-l01", 1, "A Statement About Something", "الْجُمْلَةُ الِاسْمِيَّةُ", "STANDARD", "chapter-29-lesson-01.json"],
    ["ch29-l02", 2, "A Sentence That Opens With an Action", "الْجُمْلَةُ الْفِعْلِيَّةُ", "STANDARD", "chapter-29-lesson-02.json"],
    ["ch29-l03", 3, "Compare the Two Cores", "رُكْنُ الْجُمْلَةِ", "STANDARD", "chapter-29-lesson-03.json"],
    ["ch29-l04", 4, "إِنَّ and لَيْسَ Again", "إِنَّ وَلَيْسَ", "STANDARD", "chapter-29-lesson-04.json"],
    ["ch29-l05", 5, "Classifying Ayat", "تَصْنِيفُ الْجُمَلِ", "STANDARD", "chapter-29-lesson-05.json"],
    ["ch29-l06", 6, ...review(29, "التَّاسِعِ وَالْعِشْرِينَ"), "REVIEW", "chapter-29-lesson-06-review.json"],
    ["ch29-test", 7, ...finalTest(29, "التَّاسِعِ وَالْعِشْرِينَ"), "REVIEW", "chapter-29-lesson-07-final-test.json"],
  ],
  30: [
    ["ch30-l01", 1, "Reading Across Sentences", "الْقِرَاءَةُ الْمُتَّصِلَةُ", "STANDARD", "chapter-30-lesson-01.json"],
    ["ch30-l02", 2, "A Short Story in Order", "قِصَّةٌ قَصِيرَةٌ", "STANDARD", "chapter-30-lesson-02.json"],
    ["ch30-l03", 3, "Following a Dialogue", "تَتَبُّعُ الْحِوَارِ", "STANDARD", "chapter-30-lesson-03.json"],
    ["ch30-l04", 4, "مَا Inside a Sentence", "مَا تَعْبُدُونَ", "STANDARD", "chapter-30-lesson-04.json"],
    ["ch30-l05", 5, "All of Surah Al-Kafirun", "سُورَةُ الْكَافِرُونَ", "STANDARD", "chapter-30-lesson-05.json"],
    ["ch30-l07", 6, ...review(30, "الثَّلَاثِينَ"), "REVIEW", "chapter-30-lesson-06-review.json"],
    ["ch30-test", 7, ...finalTest(30, "الثَّلَاثِينَ"), "REVIEW", "chapter-30-lesson-07-final-test.json"],
  ],
};

async function main() {
  if (!PLANS[CHAPTER]) throw new Error("Pass --chapter=26 … --chapter=30.");
  const spec = books24Specs.find((candidate) => candidate.order === CHAPTER);
  const plan = PLANS[CHAPTER].map(([id, order, title, titleAr, template, filename]) => {
    const content = JSON.parse(fs.readFileSync(path.join(FIXTURES_DIR, filename), "utf8"));
    if (content._meta?.lesson_order !== order) throw new Error(`${filename} has lesson_order ${content._meta?.lesson_order}, expected ${order}.`);
    if (content.template !== template) throw new Error(`${filename} has template ${content.template}, expected ${template}.`);
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
    for (const item of [...plan].sort((a, b) => a.order - b.order)) console.log(`  ${item.order}. ${item.id} — ${existingIds.has(item.id) ? "update" : "create"} — ${item.template} — ${item.title}`);
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

if (require.main === module) main().catch((error) => { console.error(error); process.exitCode = 1; });
module.exports = { PLANS };
