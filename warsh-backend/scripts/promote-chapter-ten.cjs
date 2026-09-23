/**
 * Scoped Chapter 10 promotion (Docs/proposals/chapter-10-content-proposal.md).
 * Existing lesson IDs ch10-l01..l04 are updated in place so learner progress
 * remains attached; ch10-l03 (before) and ch10-l04 (after) move to display
 * orders 4 and 5 so the new ch10-l05 (you all) can sit at order 3. ch10-l06
 * (review) and ch10-test are the only inserted rows.
 * The chapter title is updated to the approved title. Fixture file number
 * equals display order (the mirror convention), not the stable ID number.
 *
 * Usage:
 *   npm run content:promote-chapter-ten
 *   npm run content:promote-chapter-ten -- --apply
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

const CHAPTER_TITLE = "Plural Pronouns and قَبْلَ / بَعْدَ";
const CHAPTER_TITLE_UR = "جمع ضمیریں اور قَبْلَ / بَعْدَ";
const CHAPTER_TITLE_AR = "ضَمَائِرُ الْجَمْعِ وَقَبْلَ وَبَعْدَ";
const CHAPTER_DESCRIPTION = "They, we and you all — هُمْ، هُنَّ، نَحْنُ، أَنْتُمْ، أَنْتُنَّ — then the time pair قَبْلَ and بَعْدَ.";
const CHAPTER_DESCRIPTION_UR = "وہ سب، ہم اور تم سب — هُمْ، هُنَّ، نَحْنُ، أَنْتُمْ، أَنْتُنَّ — پھر وقت کا جوڑا قَبْلَ اور بَعْدَ۔";

const plan = [
  ["ch10-l01", 1, "They — هُمْ and هُنَّ", "هُمْ وَهُنَّ — ضَمِيرُ الْغَائِبِينَ", "STANDARD", "chapter-10-lesson-01.json"],
  ["ch10-l02", 2, "We — نَحْنُ", "نَحْنُ — ضَمِيرُ الْمُتَكَلِّمِينَ", "STANDARD", "chapter-10-lesson-02.json"],
  ["ch10-l05", 3, "You All — أَنْتُمْ and أَنْتُنَّ", "أَنْتُمْ وَأَنْتُنَّ — ضَمِيرُ الْمُخَاطَبِينَ", "STANDARD", "chapter-10-lesson-03.json"],
  ["ch10-l03", 4, "Before — قَبْلَ", "قَبْلَ — ظَرْفُ زَمَان", "STANDARD", "chapter-10-lesson-04.json"],
  ["ch10-l04", 5, "After — بَعْدَ", "بَعْدَ — ظَرْفُ زَمَان", "STANDARD", "chapter-10-lesson-05.json"],
  ["ch10-cl06", 6, "Meet Your Study Group — Conversation Lab", "نَحْنُ طُلَّابٌ", "SPOKEN_PHRASES", "chapter-10-lesson-06-conversation-lab.json"],
  ["ch10-l06", 7, "Chapter 10 Review", "مُرَاجَعَةُ الْفَصْلِ الْعَاشِر", "REVIEW", "chapter-10-lesson-07-review.json"],
  ["ch10-test", 8, "Chapter 10 Final Test", "اخْتِبَارُ الْفَصْلِ الْعَاشِرِ", "REVIEW", "chapter-10-lesson-08-final-test.json"],
].map(([id, order, title, titleAr, template, filename]) => {
  const content = JSON.parse(fs.readFileSync(path.join(FIXTURES_DIR, filename), "utf8"));
  return { id, order, title, titleAr, template, content, xpReward: content._meta?.xp_reward ?? 10 };
});

async function main() {
  const chapter = await prisma.chapter.findUnique({ where: { order: 10 }, select: { id: true, title: true } });
  if (!chapter) throw new Error("Chapter 10 does not exist.");
  const existing = await prisma.lesson.findMany({ where: { chapterId: chapter.id }, orderBy: { order: "asc" }, select: { id: true } });
  const existingIds = new Set(existing.map(({ id }) => id));
  const unexpected = existing.filter(({ id }) => !plan.some((item) => item.id === id));
  if (unexpected.length) throw new Error(`Unexpected Chapter 10 lesson IDs: ${unexpected.map(({ id }) => id).join(", ")}`);

  console.log(`${APPLY ? "Applying" : "Dry run for"} Chapter 10 promotion:`);
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
  if (verified.length !== plan.length || verified.some((lesson, index) => lesson.id !== plan[index].id || lesson.order !== plan[index].order || lesson.status !== "PUBLISHED")) throw new Error("Post-promotion Chapter 10 verification failed.");
  const test = verified.find(({ id }) => id === "ch10-test");
  if (test?.content?.assessment?.questions?.length !== 12) throw new Error("Chapter 10 final test verification failed.");
  console.log("\nChapter 10 promotion applied and verified. Learner progress rows were not modified.");
}

main().catch((error) => { console.error(error); process.exitCode = 1; }).finally(() => prisma.$disconnect());
