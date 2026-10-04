/**
 * Scoped promotion of the Chapter 61-65 work from the proposal harvest
 * (Docs/proposals/proposal-harvest-tracker.md, batch 8), one chapter per run.
 * Existing lesson IDs are updated in place so learner progress stays attached;
 * a row whose content is unchanged is left alone (so learners get no spurious
 * "Updated" notice) and a row that only moved gets just its order changed.
 * Ch 61 rebuilds every lesson (trade words, weights and measures, the CL17
 * market lab in ch61-l03, a bounded instrument-noun lesson, Al-Mutaffifin in four
 * parts ch61-l05 / l08 / l09 / l10), the review ch61-l07 and ch61-test; the old
 * 'More Instrument Nouns' row ch61-l06 is unpublished (DRAFT, progress kept).
 * Ch 62 keeps ch62-l01 / l03, rebuilds ch62-l02 (لَا النَّافِيَة لِلْجِنْس) and ch62-l04,
 * gains Al-Bayyinah in two parts (ch62-l06, l07), the review ch62-l05 (the old Hajj
 * phrase row, rebuilt) and ch62-test. Ch 63 keeps ch63-l01 to l04, gains Ash-Shams in
 * two parts (ch63-l06, l07), the rebuilt review ch63-l05 and ch63-test. Ch 64 keeps
 * ch64-l01 / l02, rebuilds l03 and l04, gains Al-Balad in two parts (ch64-l06, l07) and
 * Al-Ghashiyah in three (ch64-l08 to l10), the rebuilt review ch64-l05 and ch64-test.
 * Ch 65 rebuilds all six lessons, gains ch65-l07 (second three sisters), the rebuilt R14
 * ch65-l06, the focused review ch65-l09 and ch65-test.
 * Lesson.addedAt and Lesson.contentUpdatedAt are stamped by the database
 * trigger, so no progress backfill is needed.
 *
 * Usage:
 *   node scripts/promote-chapters-61-65.cjs --chapter=61            # dry run
 *   node scripts/promote-chapters-61-65.cjs --chapter=61 --apply
 */

require("dotenv/config");

const fs = require("node:fs");
const path = require("node:path");
const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");
const { localizeMetadata } = require("../prisma/urdu-metadata.cjs");
const { chapters: books56Chapters } = require("../prisma/curriculum-books5-6.cjs");
const { chapters: books78Chapters } = require("../prisma/curriculum-books7-8.cjs");

const APPLY = process.argv.includes("--apply");
const chapterArg = process.argv.find((arg) => arg.startsWith("--chapter="));
const CHAPTER = Number(chapterArg?.split("=")[1]);
const FIXTURES_DIR = path.join(__dirname, "../prisma/fixtures");

// [id, display order, fixture]
const PLANS = {
  61: [
    ["ch61-l01", 1, "chapter-61-lesson-01.json"],
    ["ch61-l02", 2, "chapter-61-lesson-02.json"],
    ["ch61-l03", 3, "chapter-61-lesson-03-conversation-lab.json"],
    ["ch61-l04", 4, "chapter-61-lesson-04.json"],
    ["ch61-l05", 5, "chapter-61-lesson-05.json"],
    ["ch61-l08", 6, "chapter-61-lesson-06.json"],
    ["ch61-l09", 7, "chapter-61-lesson-07.json"],
    ["ch61-l10", 8, "chapter-61-lesson-08.json"],
    ["ch61-l07", 9, "chapter-61-lesson-09-review.json"],
    ["ch61-test", 10, "chapter-61-lesson-10-final-test.json"],
  ],
  62: [
    ["ch62-l01", 1, "chapter-62-lesson-01.json"],
    ["ch62-l02", 2, "chapter-62-lesson-02.json"],
    ["ch62-l03", 3, "chapter-62-lesson-03.json"],
    ["ch62-l04", 4, "chapter-62-lesson-04.json"],
    ["ch62-l06", 5, "chapter-62-lesson-05.json"],
    ["ch62-l07", 6, "chapter-62-lesson-06.json"],
    ["ch62-l05", 7, "chapter-62-lesson-07-review.json"],
    ["ch62-test", 8, "chapter-62-lesson-08-final-test.json"],
  ],
  63: [
    ["ch63-l01", 1, "chapter-63-lesson-01.json"],
    ["ch63-l02", 2, "chapter-63-lesson-02.json"],
    ["ch63-l03", 3, "chapter-63-lesson-03.json"],
    ["ch63-l04", 4, "chapter-63-lesson-04.json"],
    ["ch63-l06", 5, "chapter-63-lesson-05.json"],
    ["ch63-l07", 6, "chapter-63-lesson-06.json"],
    ["ch63-l05", 7, "chapter-63-lesson-07-review.json"],
    ["ch63-test", 8, "chapter-63-lesson-08-final-test.json"],
  ],
  64: [
    ["ch64-l01", 1, "chapter-64-lesson-01.json"],
    ["ch64-l02", 2, "chapter-64-lesson-02.json"],
    ["ch64-l03", 3, "chapter-64-lesson-03.json"],
    ["ch64-l04", 4, "chapter-64-lesson-04.json"],
    ["ch64-l06", 5, "chapter-64-lesson-05.json"],
    ["ch64-l07", 6, "chapter-64-lesson-06.json"],
    ["ch64-l08", 7, "chapter-64-lesson-07.json"],
    ["ch64-l09", 8, "chapter-64-lesson-08.json"],
    ["ch64-l10", 9, "chapter-64-lesson-09.json"],
    ["ch64-l05", 10, "chapter-64-lesson-10-review.json"],
    ["ch64-test", 11, "chapter-64-lesson-11-final-test.json"],
  ],
  65: [
    ["ch65-l01", 1, "chapter-65-lesson-01.json"],
    ["ch65-l05", 2, "chapter-65-lesson-02.json"],
    ["ch65-l02", 3, "chapter-65-lesson-03.json"],
    ["ch65-l07", 4, "chapter-65-lesson-04.json"],
    ["ch65-l03", 5, "chapter-65-lesson-05.json"],
    ["ch65-l04", 6, "chapter-65-lesson-06.json"],
    ["ch65-l06", 7, "chapter-65-lesson-07-review.json"],
    ["ch65-l09", 8, "chapter-65-lesson-08-review.json"],
    ["ch65-test", 9, "chapter-65-lesson-09-final-test.json"],
  ],
};
// Surplus rows: unpublished (DRAFT) and moved past the last position; content and learner progress are kept (S3).
const SURPLUS = { 61: [["ch61-l06", 11]] };
// Final test length per chapter: twelve questions (9/12 fails, 10/12 passes).
const TEST_LENGTH = { 61: 12, 62: 12, 63: 12, 64: 12, 65: 12 };

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
  if (!PLANS[CHAPTER]) throw new Error("Pass --chapter=61 to --chapter=65.");
  const spec = [...books56Chapters, ...books78Chapters].find((candidate) => candidate.order === CHAPTER);
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
    const surplus = (SURPLUS[CHAPTER] ?? []).filter(([id]) => byId.has(id));
    const unexpected = existing.filter(({ id }) => !plan.some((item) => item.id === id) && !surplus.some(([sid]) => sid === id));
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
    for (const [id, order] of surplus) console.log(`  ${order}. ${id} — ${byId.get(id).status === "DRAFT" && byId.get(id).order === order ? "unchanged (already DRAFT)" : "move to order " + order + " + unpublish (DRAFT); content and progress kept"}`);
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
      for (const [id, order] of surplus) await tx.lesson.update({ where: { id }, data: { order, status: "DRAFT" } });
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

    const verified = (await prisma.lesson.findMany({ where: { chapterId: chapter.id }, orderBy: { order: "asc" }, select: { id: true, order: true, status: true, content: true } })).filter(({ id }) => !surplus.some(([sid]) => sid === id));
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
