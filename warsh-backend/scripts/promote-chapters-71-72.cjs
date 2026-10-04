/**
 * Scoped promotion of the Chapter 71-72 work from the proposal harvest
 * (Docs/proposals/proposal-harvest-tracker.md, batch 10, the last), one chapter per run.
 * Existing lesson IDs are updated in place so learner progress stays attached;
 * a row whose content is unchanged is left alone (so learners get no spurious
 * "Updated" notice) and a row that only moved gets just its order changed.
 * Ch 71 rebuilds ch71-l01 to l06 (a state word, a state clause, a noun that clears
 * up a quantity, a noun that clears up a statement, telling the jobs apart, a short
 * integrated text), gains Al-Fajr in three parts (ch71-l08 to l10), the rebuilt review
 * ch71-l07 and the 16-question ch71-test. Ch 72 rebuilds ch72-l01 to l06 (who is
 * called, a name or a pointed-at word, أَيُّهَا, relatives, calling Allah, 9:119),
 * gains ch72-l09 (the accusative kinds of call), converts ch72-l07 in place to the
 * CL18 Conversation Lab, gains An-Nazi'at in four parts (ch72-l10 to l13) and An-Naba
 * in three (ch72-l14 to l16), the rebuilt review ch72-l08 and the 16-question
 * ch72-test. Lesson.addedAt and Lesson.contentUpdatedAt are stamped by the database
 * trigger, so no progress backfill is needed.
 *
 * Usage:
 *   node scripts/promote-chapters-71-72.cjs --chapter=71            # dry run
 *   node scripts/promote-chapters-71-72.cjs --chapter=71 --apply
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
  71: [
    ["ch71-l01", 1, "chapter-71-lesson-01.json"],
    ["ch71-l02", 2, "chapter-71-lesson-02.json"],
    ["ch71-l03", 3, "chapter-71-lesson-03.json"],
    ["ch71-l04", 4, "chapter-71-lesson-04.json"],
    ["ch71-l05", 5, "chapter-71-lesson-05.json"],
    ["ch71-l06", 6, "chapter-71-lesson-06.json"],
    ["ch71-l08", 7, "chapter-71-lesson-07.json"],
    ["ch71-l09", 8, "chapter-71-lesson-08.json"],
    ["ch71-l10", 9, "chapter-71-lesson-09.json"],
    ["ch71-l07", 10, "chapter-71-lesson-10-review.json"],
    ["ch71-test", 11, "chapter-71-lesson-11-final-test.json"],
  ],
  72: [
    ["ch72-l01", 1, "chapter-72-lesson-01.json"],
    ["ch72-l02", 2, "chapter-72-lesson-02.json"],
    ["ch72-l09", 3, "chapter-72-lesson-03.json"],
    ["ch72-l03", 4, "chapter-72-lesson-04.json"],
    ["ch72-l04", 5, "chapter-72-lesson-05.json"],
    ["ch72-l05", 6, "chapter-72-lesson-06.json"],
    ["ch72-l06", 7, "chapter-72-lesson-07.json"],
    ["ch72-l07", 8, "chapter-72-lesson-08-conversation-lab.json"],
    ["ch72-l10", 9, "chapter-72-lesson-09.json"],
    ["ch72-l11", 10, "chapter-72-lesson-10.json"],
    ["ch72-l12", 11, "chapter-72-lesson-11.json"],
    ["ch72-l13", 12, "chapter-72-lesson-12.json"],
    ["ch72-l14", 13, "chapter-72-lesson-13.json"],
    ["ch72-l15", 14, "chapter-72-lesson-14.json"],
    ["ch72-l16", 15, "chapter-72-lesson-15.json"],
    ["ch72-l08", 16, "chapter-72-lesson-16-review.json"],
    ["ch72-test", 17, "chapter-72-lesson-17-final-test.json"],
  ],
};
// Surplus rows: unpublished (DRAFT) and moved past the last position; content and learner progress are kept (S3).
const SURPLUS = {};
// Final test length per chapter: sixteen questions (12/16 fails, 13/16 passes).
const TEST_LENGTH = { 71: 16, 72: 16 };

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
  if (!PLANS[CHAPTER]) throw new Error("Pass --chapter=71 or --chapter=72.");
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
