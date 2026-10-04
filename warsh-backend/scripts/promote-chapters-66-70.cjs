/**
 * Scoped promotion of the Chapter 66-70 work from the proposal harvest
 * (Docs/proposals/proposal-harvest-tracker.md, batch 9), one chapter per run.
 * Existing lesson IDs are updated in place so learner progress stays attached;
 * a row whose content is unchanged is left alone (so learners get no spurious
 * "Updated" notice) and a row that only moved gets just its order changed.
 * Ch 66 rebuilds ch66-l01 to l05 (the ظرف role, time words, place words and their
 * dependents, a changing ending and a fixed one, a predicate phrase), gains Al-Infitar
 * in two parts (ch66-l08, l09), the rebuilt review ch66-l06 and ch66-test. Ch 67
 * rebuilds ch67-l01 to l04 (لَوْ), gains the short exchange ch67-l06, Al-Alaq in two
 * parts (ch67-l07, l08), the rebuilt review ch67-l05 and ch67-test. Ch 68 rebuilds
 * ch68-l01 to l05 (jussive signs, لَمْ / لَمَّا, لَا, command lām, the two-verb
 * condition of owner decision D6), gains Al-Layl in two parts (ch68-l08, l09), the
 * rebuilt review ch68-l06 and ch68-test. Ch 69 rebuilds ch69-l01 to l04 (the jussive
 * response to a request), gains At-Tariq in two parts (ch69-l07, l08) and Al-Inshiqaq
 * in three (ch69-l09 to l11), the rebuilt review ch69-l05 and ch69-test. Ch 70 rebuilds
 * ch70-l01 to l05 (exception with إِلَّا, غَيْر and سِوَى), gains Al-Buruj in two parts
 * (ch70-l08, l09), the rebuilt review ch70-l06 and ch70-test; the old SP11 phrase row
 * ch70-l07 is unpublished (DRAFT, progress kept) as the proposal recommends.
 * Lesson.addedAt and Lesson.contentUpdatedAt are stamped by the database
 * trigger, so no progress backfill is needed.
 *
 * Usage:
 *   node scripts/promote-chapters-66-70.cjs --chapter=66            # dry run
 *   node scripts/promote-chapters-66-70.cjs --chapter=66 --apply
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
  66: [
    ["ch66-l01", 1, "chapter-66-lesson-01.json"],
    ["ch66-l02", 2, "chapter-66-lesson-02.json"],
    ["ch66-l03", 3, "chapter-66-lesson-03.json"],
    ["ch66-l04", 4, "chapter-66-lesson-04.json"],
    ["ch66-l05", 5, "chapter-66-lesson-05.json"],
    ["ch66-l08", 6, "chapter-66-lesson-06.json"],
    ["ch66-l09", 7, "chapter-66-lesson-07.json"],
    ["ch66-l06", 8, "chapter-66-lesson-08-review.json"],
    ["ch66-test", 9, "chapter-66-lesson-09-final-test.json"],
  ],
  67: [
    ["ch67-l01", 1, "chapter-67-lesson-01.json"],
    ["ch67-l02", 2, "chapter-67-lesson-02.json"],
    ["ch67-l03", 3, "chapter-67-lesson-03.json"],
    ["ch67-l04", 4, "chapter-67-lesson-04.json"],
    ["ch67-l06", 5, "chapter-67-lesson-05.json"],
    ["ch67-l07", 6, "chapter-67-lesson-06.json"],
    ["ch67-l08", 7, "chapter-67-lesson-07.json"],
    ["ch67-l05", 8, "chapter-67-lesson-08-review.json"],
    ["ch67-test", 9, "chapter-67-lesson-09-final-test.json"],
  ],
  68: [
    ["ch68-l01", 1, "chapter-68-lesson-01.json"],
    ["ch68-l04", 2, "chapter-68-lesson-02.json"],
    ["ch68-l03", 3, "chapter-68-lesson-03.json"],
    ["ch68-l02", 4, "chapter-68-lesson-04.json"],
    ["ch68-l05", 5, "chapter-68-lesson-05.json"],
    ["ch68-l08", 6, "chapter-68-lesson-06.json"],
    ["ch68-l09", 7, "chapter-68-lesson-07.json"],
    ["ch68-l06", 8, "chapter-68-lesson-08-review.json"],
    ["ch68-test", 9, "chapter-68-lesson-09-final-test.json"],
  ],
  69: [
    ["ch69-l01", 1, "chapter-69-lesson-01.json"],
    ["ch69-l04", 2, "chapter-69-lesson-02.json"],
    ["ch69-l03", 3, "chapter-69-lesson-03.json"],
    ["ch69-l02", 4, "chapter-69-lesson-04.json"],
    ["ch69-l07", 5, "chapter-69-lesson-05.json"],
    ["ch69-l08", 6, "chapter-69-lesson-06.json"],
    ["ch69-l09", 7, "chapter-69-lesson-07.json"],
    ["ch69-l10", 8, "chapter-69-lesson-08.json"],
    ["ch69-l11", 9, "chapter-69-lesson-09.json"],
    ["ch69-l05", 10, "chapter-69-lesson-10-review.json"],
    ["ch69-test", 11, "chapter-69-lesson-11-final-test.json"],
  ],
  70: [
    ["ch70-l01", 1, "chapter-70-lesson-01.json"],
    ["ch70-l02", 2, "chapter-70-lesson-02.json"],
    ["ch70-l03", 3, "chapter-70-lesson-03.json"],
    ["ch70-l04", 4, "chapter-70-lesson-04.json"],
    ["ch70-l05", 5, "chapter-70-lesson-05.json"],
    ["ch70-l08", 6, "chapter-70-lesson-06.json"],
    ["ch70-l09", 7, "chapter-70-lesson-07.json"],
    ["ch70-l06", 8, "chapter-70-lesson-08-review.json"],
    ["ch70-test", 9, "chapter-70-lesson-09-final-test.json"],
  ],
};
// Surplus rows: unpublished (DRAFT) and moved past the last position; content and learner progress are kept (S3).
const SURPLUS = { 70: [["ch70-l07", 10]] };
// Final test length per chapter: twelve questions (9/12 fails, 10/12 passes).
const TEST_LENGTH = { 66: 12, 67: 12, 68: 12, 69: 12, 70: 12 };

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
  if (!PLANS[CHAPTER]) throw new Error("Pass --chapter=66 to --chapter=70.");
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
