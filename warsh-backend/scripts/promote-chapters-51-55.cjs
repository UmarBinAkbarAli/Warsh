/**
 * Scoped promotion of the Chapter 51–55 work from the proposal harvest
 * (Docs/proposals/proposal-harvest-tracker.md, batch 6), one chapter per run.
 * Existing lesson IDs are updated in place so learner progress stays attached;
 * a row whose content is unchanged is left alone (so learners get no spurious
 * "Updated" notice) and a row that only moved gets just its order changed.
 * Ch 51 gains Form II / Form IV / passive lessons (ch51-l09, l10, l07, l08), past duals
 * in l01, imperative formation in l04, the review ch51-l06 and ch51-test. Ch 52 gains
 * the conditional مَنْ lesson ch52-l09, Al-Qadr ch52-l07, At-Tin ch52-l08, the review
 * ch52-l06 and ch52-test. Ch 53 gains ch53-l05 (3:190–191), ch53-l08 (Ash-Sharh whole),
 * Ad-Duha ch53-l06 / l07 and ch53-test. Ch 54 gains Luqman ch54-l08, forms ch54-l07,
 * Al-Fatiha ch54-l05 / l06, rewrites ch54-l03 as retrieval and gains ch54-test (16
 * questions). Ch 55 gains ch55-l12 (sound feminine plural), At-Takwir ch55-l09 / l10 /
 * l11, the review ch55-l13 and ch55-test (16 questions).
 * Lesson.addedAt and Lesson.contentUpdatedAt are stamped by the database
 * trigger, so no progress backfill is needed.
 *
 * Usage:
 *   node scripts/promote-chapters-51-55.cjs --chapter=51            # dry run
 *   node scripts/promote-chapters-51-55.cjs --chapter=51 --apply
 */

require("dotenv/config");

const fs = require("node:fs");
const path = require("node:path");
const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");
const { localizeMetadata } = require("../prisma/urdu-metadata.cjs");
const { chapters: books56Chapters } = require("../prisma/curriculum-books5-6.cjs");

const APPLY = process.argv.includes("--apply");
const chapterArg = process.argv.find((arg) => arg.startsWith("--chapter="));
const CHAPTER = Number(chapterArg?.split("=")[1]);
const FIXTURES_DIR = path.join(__dirname, "../prisma/fixtures");

// [id, display order, fixture]
const PLANS = {
  51: [
    ["ch51-l01", 1, "chapter-51-lesson-01.json"],
    ["ch51-l02", 2, "chapter-51-lesson-02.json"],
    ["ch51-l03", 3, "chapter-51-lesson-03.json"],
    ["ch51-l04", 4, "chapter-51-lesson-04.json"],
    ["ch51-l09", 5, "chapter-51-lesson-05.json"],
    ["ch51-l10", 6, "chapter-51-lesson-06.json"],
    ["ch51-l07", 7, "chapter-51-lesson-07.json"],
    ["ch51-l08", 8, "chapter-51-lesson-08.json"],
    ["ch51-l05", 9, "chapter-51-lesson-09.json"],
    ["ch51-l06", 10, "chapter-51-lesson-10-review.json"],
    ["ch51-test", 11, "chapter-51-lesson-11-final-test.json"],
  ],
  52: [
    ["ch52-l01", 1, "chapter-52-lesson-01.json"],
    ["ch52-l02", 2, "chapter-52-lesson-02.json"],
    ["ch52-l03", 3, "chapter-52-lesson-03.json"],
    ["ch52-l04", 4, "chapter-52-lesson-04.json"],
    ["ch52-l09", 5, "chapter-52-lesson-05.json"],
    ["ch52-l05", 6, "chapter-52-lesson-06.json"],
    ["ch52-l07", 7, "chapter-52-lesson-07.json"],
    ["ch52-l08", 8, "chapter-52-lesson-08.json"],
    ["ch52-l06", 9, "chapter-52-lesson-09-review.json"],
    ["ch52-test", 10, "chapter-52-lesson-10-final-test.json"],
  ],
  53: [
    ["ch53-l01", 1, "chapter-53-lesson-01.json"],
    ["ch53-l05", 2, "chapter-53-lesson-02.json"],
    ["ch53-l02", 3, "chapter-53-lesson-03.json"],
    ["ch53-l03", 4, "chapter-53-lesson-04.json"],
    ["ch53-l08", 5, "chapter-53-lesson-05.json"],
    ["ch53-l06", 6, "chapter-53-lesson-06.json"],
    ["ch53-l07", 7, "chapter-53-lesson-07.json"],
    ["ch53-l04", 8, "chapter-53-lesson-08-review.json"],
    ["ch53-test", 9, "chapter-53-lesson-09-final-test.json"],
  ],
  54: [
    ["ch54-l01", 1, "chapter-54-lesson-01.json"],
    ["ch54-l08", 2, "chapter-54-lesson-02.json"],
    ["ch54-l07", 3, "chapter-54-lesson-03.json"],
    ["ch54-l03", 4, "chapter-54-lesson-04.json"],
    ["ch54-l05", 5, "chapter-54-lesson-05.json"],
    ["ch54-l06", 6, "chapter-54-lesson-06.json"],
    ["ch54-l02", 7, "chapter-54-lesson-07.json"],
    ["ch54-l04", 8, "chapter-54-lesson-08-review.json"],
    ["ch54-test", 9, "chapter-54-lesson-09-final-test.json"],
  ],
  55: [
    ["ch55-l01", 1, "chapter-55-lesson-01.json"],
    ["ch55-l02", 2, "chapter-55-lesson-02.json"],
    ["ch55-l03", 3, "chapter-55-lesson-03.json"],
    ["ch55-l04", 4, "chapter-55-lesson-04.json"],
    ["ch55-l05", 5, "chapter-55-lesson-05.json"],
    ["ch55-l06", 6, "chapter-55-lesson-06.json"],
    ["ch55-l07", 7, "chapter-55-lesson-07.json"],
    ["ch55-l12", 8, "chapter-55-lesson-08.json"],
    ["ch55-l08", 9, "chapter-55-lesson-09.json"],
    ["ch55-l09", 10, "chapter-55-lesson-10.json"],
    ["ch55-l10", 11, "chapter-55-lesson-11.json"],
    ["ch55-l11", 12, "chapter-55-lesson-12.json"],
    ["ch55-l13", 13, "chapter-55-lesson-13-review.json"],
    ["ch55-test", 14, "chapter-55-lesson-14-final-test.json"],
  ],
};
// Final test length per chapter: twelve questions (9/12 fails, 10/12 passes); the Book 5 and Book 6 capstones use sixteen (12/16 fails, 13/16 passes).
const TEST_LENGTH = { 51: 12, 52: 12, 53: 12, 54: 16, 55: 16 };

// Key-order-independent serialization, with the position stamped like the fixture sync does.
function stable(value) {
  if (Array.isArray(value)) return `[${value.map(stable).join(",")}]`;
  if (value && typeof value === "object") return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${stable(value[key])}`).join(",")}}`;
  return JSON.stringify(value);
}
function stamped(content, order) {
  return { ...content, _meta: { ...(content._meta ?? {}), chapter_order: CHAPTER, lesson_order: order } };
}

async function main() {
  if (!PLANS[CHAPTER]) throw new Error("Pass --chapter=51 … --chapter=55.");
  const spec = books56Chapters.find((candidate) => candidate.order === CHAPTER);
  const plan = PLANS[CHAPTER].map(([id, order, filename]) => {
    const content = JSON.parse(fs.readFileSync(path.join(FIXTURES_DIR, filename), "utf8"));
    const meta = content._meta ?? {};
    if (meta.lesson_order !== order) throw new Error(`${filename} has lesson_order ${meta.lesson_order}, expected ${order}.`);
    if (!meta.title || !meta.titleAr) throw new Error(`${filename} has no _meta.title / titleAr.`);
    return { id, order, filename, content, title: meta.title, titleAr: meta.titleAr, titleUr: meta.titleUr ?? localizeMetadata(meta.title), template: content.template, xpReward: meta.xp_reward ?? 10 };
  });

  const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL ?? "" }) });
  try {
    const chapter = await prisma.chapter.findUnique({ where: { order: CHAPTER }, select: { id: true, title: true } });
    if (!chapter) throw new Error(`Chapter ${CHAPTER} does not exist.`);
    const existing = await prisma.lesson.findMany({ where: { chapterId: chapter.id }, select: { id: true, order: true, title: true, template: true, content: true, status: true } });
    const byId = new Map(existing.map((row) => [row.id, row]));
    const unexpected = existing.filter(({ id }) => !plan.some((item) => item.id === id));
    if (unexpected.length) throw new Error(`Unexpected Chapter ${CHAPTER} lesson IDs: ${unexpected.map(({ id }) => id).join(", ")}`);

    for (const item of plan) {
      const row = byId.get(item.id);
      item.action = !row
        ? "create"
        : stable(stamped(row.content, item.order)) === stable(stamped(item.content, item.order)) && row.title === item.title && row.template === item.template && row.status === "PUBLISHED"
          ? (row.order === item.order ? "unchanged" : `reorder ${row.order} -> ${item.order}`)
          : "update";
    }

    console.log(`${APPLY ? "Applying" : "Dry run for"} Chapter ${CHAPTER} promotion:`);
    console.log(`  chapter title: "${chapter.title}" -> "${spec.title}"`);
    for (const item of plan) console.log(`  ${item.order}. ${item.id} — ${item.action} — ${item.template} — ${item.title}`);
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
        if (item.action === "unchanged") continue;
        if (item.action.startsWith("reorder")) {
          await tx.lesson.update({ where: { id: item.id }, data: { order: item.order } });
          continue;
        }
        const data = { chapterId: chapter.id, order: item.order, title: item.title, titleUr: item.titleUr, titleAr: item.titleAr, template: item.template, xpReward: item.xpReward, content: item.content };
        await tx.lesson.upsert({ where: { id: item.id }, update: { ...data, status: "PUBLISHED" }, create: { id: item.id, ...data, status: "PUBLISHED", publishedAt: new Date() } });
      }
    }, { timeout: 120000, maxWait: 30000 });

    const verified = await prisma.lesson.findMany({ where: { chapterId: chapter.id }, orderBy: { order: "asc" }, select: { id: true, order: true, status: true, content: true } });
    const expected = [...plan].sort((a, b) => a.order - b.order);
    if (verified.length !== expected.length || verified.some((lesson, index) => lesson.id !== expected[index].id || lesson.order !== expected[index].order || lesson.status !== "PUBLISHED")) {
      throw new Error(`Post-promotion Chapter ${CHAPTER} verification failed.`);
    }
    const test = verified.find(({ id }) => id === `ch${CHAPTER}-test`);
    if (test?.content?.assessment?.questions?.length !== TEST_LENGTH[CHAPTER]) throw new Error(`Chapter ${CHAPTER} final test verification failed.`);
    console.log(`\nChapter ${CHAPTER} promotion applied and verified. Learner progress rows were not modified.`);
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) main().catch((error) => { console.error(error); process.exitCode = 1; });
module.exports = { PLANS, TEST_LENGTH };
