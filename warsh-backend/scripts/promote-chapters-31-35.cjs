/**
 * Scoped promotion of the Chapter 31–35 rebuilds from the proposal harvest
 * (Docs/proposals/proposal-harvest-tracker.md, batch 2), one chapter per run.
 * Existing lesson IDs are updated in place so learner progress stays attached.
 * New rows: ch31-l07 (context lesson), ch31-l08 / ch32-l05 / ch35-l06 (reviews),
 * ch33-l06 (An-Nas reading) and every chNN-test. ch31-l06 is rebuilt in place as
 * the CL10 Conversation Lab; ch33-l05 and ch34-l06 become their chapter's REVIEW
 * in place. ch34-l07 (the old Al-Fatiha capstone) moves to order 8 as DRAFT: its
 * lesson body is unchanged (only _meta order/note follow the fixture) and it is
 * never deleted, so progress stays attached. Learners who had
 * finished a chapter are not locked by the new rows and see "New" / "Updated"
 * notices: Lesson.addedAt and Lesson.contentUpdatedAt are stamped by the
 * database trigger, so no progress backfill is needed.
 *
 * Usage:
 *   node scripts/promote-chapters-31-35.cjs --chapter=31            # dry run
 *   node scripts/promote-chapters-31-35.cjs --chapter=31 --apply
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

// [id, display order, title, titleAr, template, fixture, status?]
const PLANS = {
  31: [
    ["ch31-l01", 1, "Yes or No? هَلْ and أَ", "هَلْ وَالْهَمْزَةُ", "STANDARD", "chapter-31-lesson-01.json"],
    ["ch31-l02", 2, "Who and What?", "مَنْ؟ مَا؟ مَاذَا؟", "STANDARD", "chapter-31-lesson-02.json"],
    ["ch31-l03", 3, "Where and How?", "أَيْنَ؟ كَيْفَ؟", "STANDARD", "chapter-31-lesson-03.json"],
    ["ch31-l04", 4, "When and Why?", "مَتَى؟ لِمَاذَا؟", "STANDARD", "chapter-31-lesson-04.json"],
    ["ch31-l05", 5, "How Many?", "كَمْ؟", "STANDARD", "chapter-31-lesson-05.json"],
    ["ch31-l07", 6, "Questions in Context", "السُّؤَالُ فِي سِيَاقِهِ", "STANDARD", "chapter-31-lesson-06.json"],
    ["ch31-l06", 7, "Asking a Teacher — Conversation Lab", "سُؤَالُ الْأُسْتَاذِ", "SPOKEN_PHRASES", "chapter-31-lesson-07-conversation-lab.json"],
    ["ch31-l08", 8, ...review(31, "الْحَادِي وَالثَّلَاثِينَ"), "REVIEW", "chapter-31-lesson-08-review.json"],
    ["ch31-test", 9, ...finalTest(31, "الْحَادِي وَالثَّلَاثِينَ"), "REVIEW", "chapter-31-lesson-09-final-test.json"],
  ],
  32: [
    ["ch32-l01", 1, "إِذَا Is Not a Question", "مَتَى وَإِذَا", "STANDARD", "chapter-32-lesson-01.json"],
    ["ch32-l02", 2, "The Event and Its Response", "الشَّرْطُ وَجَوَابُهُ", "STANDARD", "chapter-32-lesson-02.json"],
    ["ch32-l03", 3, "The فَ That Marks the Response", "فَ فِي جَوَابِ الشَّرْطِ", "STANDARD", "chapter-32-lesson-03.json"],
    ["ch32-l04", 4, "إِذَا in a New Ayah", "إِذَا السَّمَاءُ انْشَقَّتْ", "STANDARD", "chapter-32-lesson-04.json"],
    ["ch32-l05", 5, ...review(32, "الثَّانِي وَالثَّلَاثِينَ"), "REVIEW", "chapter-32-lesson-05-review.json"],
    ["ch32-test", 6, ...finalTest(32, "الثَّانِي وَالثَّلَاثِينَ"), "REVIEW", "chapter-32-lesson-06-final-test.json"],
  ],
  33: [
    ["ch33-l01", 1, "Read Familiar Arabic Again", "قِرَاءَةُ مَا عَرَفْنَا", "STANDARD", "chapter-33-lesson-01.json"],
    ["ch33-l02", 2, "All of Al-Falaq", "سُورَةُ الْفَلَقِ", "STANDARD", "chapter-33-lesson-02.json"],
    ["ch33-l03", 3, "All of An-Nasr", "سُورَةُ النَّصْرِ", "STANDARD", "chapter-33-lesson-03.json"],
    ["ch33-l06", 4, "All of An-Nas", "سُورَةُ النَّاسِ", "STANDARD", "chapter-33-lesson-04.json"],
    ["ch33-l04", 5, "Track Meaning Across Clauses", "تَتَبُّعُ الْمَعْنَى", "STANDARD", "chapter-33-lesson-05.json"],
    ["ch33-l05", 6, "Book 3 Review", "مُرَاجَعَةُ الْكِتَابِ الثَّالِثِ", "REVIEW", "chapter-33-lesson-06-review.json"],
    ["ch33-test", 7, ...finalTest(33, "الثَّالِثِ وَالثَّلَاثِينَ"), "REVIEW", "chapter-33-lesson-07-final-test.json"],
  ],
  34: [
    ["ch34-l01", 1, "What the Imperfect Tells Us", "الْفِعْلُ الْمُضَارِعُ", "STANDARD", "chapter-34-lesson-01.json"],
    ["ch34-l02", 2, "Five Readings of يَكْتُبُ", "أَكْتُبُ، نَكْتُبُ، يَكْتُبُ، تَكْتُبُ", "VERB_PATTERN", "chapter-34-lesson-02.json"],
    ["ch34-l03", 3, "Same Prefixes, New Verbs", "يَذْهَبُ، يَجْلِسُ", "STANDARD", "chapter-34-lesson-03.json"],
    ["ch34-l04", 4, "Does Not: لَا", "لَا النَّافِيَةُ", "STANDARD", "chapter-34-lesson-04.json"],
    ["ch34-l05", 5, "Add an Object and a Time", "الْمَفْعُولُ وَالْوَقْتُ", "STANDARD", "chapter-34-lesson-05.json"],
    ["ch34-l06", 6, ...review(34, "الرَّابِعِ وَالثَّلَاثِينَ"), "REVIEW", "chapter-34-lesson-06-review.json"],
    ["ch34-test", 7, ...finalTest(34, "الرَّابِعِ وَالثَّلَاثِينَ"), "REVIEW", "chapter-34-lesson-07-final-test.json"],
    // Surplus row (S2/S3): the old Al-Fatiha capstone keeps its ID, content and progress
    // but is unpublished, so an earlier completion can never count as passing ch34-test.
    ["ch34-l07", 8, null, null, null, "chapter-34-lesson-08.json", "DRAFT"],
  ],
  35: [
    ["ch35-l01", 1, "سَـ: Will", "سَيَفْعَلُ", "STANDARD", "chapter-35-lesson-01.json"],
    ["ch35-l02", 2, "سَوْفَ: Will", "سَوْفَ يَفْعَلُ", "STANDARD", "chapter-35-lesson-02.json"],
    ["ch35-l03", 3, "Now or Will? In Context", "الْحَاضِرُ وَالْمُسْتَقْبَلُ", "STANDARD", "chapter-35-lesson-03.json"],
    ["ch35-l04", 4, "Will, Did, and Do It!", "الْمَاضِي وَالْمُضَارِعُ وَالْأَمْرُ", "STANDARD", "chapter-35-lesson-04.json"],
    ["ch35-l05", 5, "لَنْ: Will Not", "لَنْ يَفْعَلَ", "STANDARD", "chapter-35-lesson-05.json"],
    ["ch35-l06", 6, ...review(35, "الْخَامِسِ وَالثَّلَاثِينَ"), "REVIEW", "chapter-35-lesson-06-review.json"],
    ["ch35-test", 7, ...finalTest(35, "الْخَامِسِ وَالثَّلَاثِينَ"), "REVIEW", "chapter-35-lesson-07-final-test.json"],
  ],
};

async function main() {
  if (!PLANS[CHAPTER]) throw new Error("Pass --chapter=31 … --chapter=35.");
  const spec = books24Specs.find((candidate) => candidate.order === CHAPTER);
  const plan = PLANS[CHAPTER].map(([id, order, title, titleAr, template, filename, status = "PUBLISHED"]) => {
    const content = JSON.parse(fs.readFileSync(path.join(FIXTURES_DIR, filename), "utf8"));
    if (content._meta?.lesson_order !== order) throw new Error(`${filename} has lesson_order ${content._meta?.lesson_order}, expected ${order}.`);
    if (status === "DRAFT") return { id, order, status, filename, content };
    if (content.template !== template) throw new Error(`${filename} has template ${content.template}, expected ${template}.`);
    return { id, order, title, titleAr, template, content, status, xpReward: content._meta?.xp_reward ?? 10 };
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
    for (const item of [...plan].sort((a, b) => a.order - b.order)) {
      if (item.status === "DRAFT") console.log(`  ${item.order}. ${item.id} — ${existingIds.has(item.id) ? "move to order 8 + unpublish (DRAFT); lesson body unchanged, only _meta order/note" : "absent, skipped"}`);
      else console.log(`  ${item.order}. ${item.id} — ${existingIds.has(item.id) ? "update" : "create"} — ${item.template} — ${item.title}`);
    }
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
        if (item.status === "DRAFT") {
          if (existingIds.has(item.id)) await tx.lesson.update({ where: { id: item.id }, data: { order: item.order, status: "DRAFT", content: item.content } });
          continue;
        }
        const data = { chapterId: chapter.id, order: item.order, title: item.title, titleUr: item.content._meta?.titleUr ?? localizeMetadata(item.title), titleAr: item.titleAr, template: item.template, xpReward: item.xpReward, content: item.content };
        await tx.lesson.upsert({ where: { id: item.id }, update: data, create: { id: item.id, ...data, status: "PUBLISHED", publishedAt: new Date() } });
      }
    }, { timeout: 30000 });

    const verified = await prisma.lesson.findMany({ where: { chapterId: chapter.id }, orderBy: { order: "asc" }, select: { id: true, order: true, status: true, content: true } });
    const expected = [...plan].filter((item) => item.status !== "DRAFT" || existingIds.has(item.id)).sort((a, b) => a.order - b.order);
    if (verified.length !== expected.length || verified.some((lesson, index) => lesson.id !== expected[index].id || lesson.order !== expected[index].order || lesson.status !== expected[index].status)) {
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
