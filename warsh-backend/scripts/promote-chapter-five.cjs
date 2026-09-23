/**
 * Scoped Chapter 5 promotion (Docs/proposals/chapter-05-content-proposal.md).
 * Existing lesson IDs are updated in place so learner progress remains
 * attached; only the three new IDs (ch05-l06, ch05-l07, ch05-test) are
 * inserted. The chapter title is updated to the approved title.
 *
 * Fixture file number == display order (the convention content:export keys
 * the mirror on), so each stable ID loads the file at its display position.
 *
 * Usage:
 *   npm run content:promote-chapter-five
 *   npm run content:promote-chapter-five -- --apply
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

const CHAPTER_TITLE = "Putting Arabic Together — Possession and First Actions";
const CHAPTER_TITLE_UR = "عربی کو جوڑنا — ملکیت اور پہلا عمل";

// Titles that open with an Arabic word carry a leading LTR mark (‎) so the
// chapter list keeps them left-aligned instead of flipping the whole row RTL.
const plan = [
  ["ch05-l01", 1, "‎هَٰذِهِ with Description and Idafa", "هَٰذِهِ مَعَ الصِّفَةِ وَالإِضَافَة", "STANDARD", "chapter-05-lesson-01.json"],
  ["ch05-l02", 2, "‎تِلْكَ in Useful Quranic Phrases", "تِلْكَ فِي تَرَاكِيبَ قُرْآنِيَّة", "STANDARD", "chapter-05-lesson-02.json"],
  ["ch05-l03", 3, "لِي، لَكَ، لَكِ", "لِي، لَكَ، لَكِ", "STANDARD", "chapter-05-lesson-03.json"],
  ["ch05-l06", 4, "لَهُ، لَهَا، لَكُمْ", "لَهُ، لَهَا، لَكُمْ", "STANDARD", "chapter-05-lesson-04.json"],
  ["ch05-l04", 5, "‎ذَهَبَ — First Past-Tense Verb", "ذَهَبَ — أَوَّلُ فِعْلٍ مَاضٍ", "STANDARD", "chapter-05-lesson-05.json"],
  ["ch05-l07", 6, "Action, Doer, and Destination", "الْفِعْلُ وَالْفَاعِلُ وَإِلَى", "STANDARD", "chapter-05-lesson-06.json"],
  ["ch05-cl07", 7, "Where Is It? — Conversation Lab", "أَيْنَ الْكِتَابُ؟", "SPOKEN_PHRASES", "chapter-05-lesson-07-conversation-lab.json"],
  ["ch05-l05", 8, "R1 Cumulative Review", "المُرَاجَعَةُ الأُولَى", "REVIEW", "chapter-05-lesson-08-review.json"],
  ["ch05-test", 9, "Chapter 5 Final Test", "اخْتِبَارُ الْفَصْلِ الْخَامِسِ", "REVIEW", "chapter-05-lesson-09-final-test.json"],
].map(([id, order, title, titleAr, template, filename]) => {
  const content = JSON.parse(fs.readFileSync(path.join(FIXTURES_DIR, filename), "utf8"));
  return { id, order, title, titleAr, template, content, xpReward: content._meta?.xp_reward ?? 10 };
});

async function main() {
  const chapter = await prisma.chapter.findUnique({ where: { order: 5 }, select: { id: true, title: true } });
  if (!chapter) throw new Error("Chapter 5 does not exist.");
  const existing = await prisma.lesson.findMany({ where: { chapterId: chapter.id }, orderBy: { order: "asc" }, select: { id: true } });
  const existingIds = new Set(existing.map(({ id }) => id));
  const unexpected = existing.filter(({ id }) => !plan.some((item) => item.id === id));
  if (unexpected.length) throw new Error(`Unexpected Chapter 5 lesson IDs: ${unexpected.map(({ id }) => id).join(", ")}`);

  console.log(`${APPLY ? "Applying" : "Dry run for"} Chapter 5 promotion:`);
  console.log(`  chapter title: "${chapter.title}" -> "${CHAPTER_TITLE}"`);
  for (const item of plan) console.log(`  ${item.order}. ${item.id} — ${existingIds.has(item.id) ? "update" : "create"} — ${item.title}`);
  if (!APPLY) {
    console.log("\nNo data changed. Re-run with --apply after reviewing this plan.");
    return;
  }

  await prisma.$transaction(async (tx) => {
    await tx.chapter.update({ where: { id: chapter.id }, data: { title: CHAPTER_TITLE, titleUr: CHAPTER_TITLE_UR } });
    for (const item of plan) {
      const data = { chapterId: chapter.id, order: item.order, title: item.title, titleUr: item.content._meta?.titleUr ?? localizeMetadata(item.title), titleAr: item.titleAr, template: item.template, xpReward: item.xpReward, content: item.content };
      await tx.lesson.upsert({ where: { id: item.id }, update: data, create: { id: item.id, ...data, status: "PUBLISHED", publishedAt: new Date() } });
    }
  }, { timeout: 30000 });

  const verified = await prisma.lesson.findMany({ where: { chapterId: chapter.id }, orderBy: { order: "asc" }, select: { id: true, order: true, status: true, content: true } });
  if (verified.length !== plan.length || verified.some((lesson, index) => lesson.id !== plan[index].id || lesson.order !== plan[index].order || lesson.status !== "PUBLISHED")) throw new Error("Post-promotion Chapter 5 verification failed.");
  const test = verified.find(({ id }) => id === "ch05-test");
  if (test?.content?.assessment?.questions?.length !== 12) throw new Error("Chapter 5 final test verification failed.");
  console.log("\nChapter 5 promotion applied and verified. Learner progress rows were not modified.");
}

main().catch((error) => { console.error(error); process.exitCode = 1; }).finally(() => prisma.$disconnect());
