/**
 * Scoped promotion of the Chapter 56-60 work from the proposal harvest
 * (Docs/proposals/proposal-harvest-tracker.md, batch 7), one chapter per run.
 * Existing lesson IDs are updated in place so learner progress stays attached;
 * a row whose content is unchanged is left alone (so learners get no spurious
 * "Updated" notice) and a row that only moved gets just its order changed.
 * Ch 56 gains the dual-as-first-term lesson (ch56-l04 rebuilt), the dual relatives
 * (ch56-l05 rebuilt), Abasa in four parts (ch56-l10 ... l13), the review ch56-l08 (rebuilt)
 * and ch56-test (16 questions); the misplaced five-verbs row ch56-l09 is unpublished
 * (DRAFT, progress kept). Ch 57 gains the hollow and final-weak mood lessons
 * (ch57-l11, ch57-l12), a kana-only ch57-l04, a rebuilt review ch57-l09, ch57-test, and
 * softer khutbah copy in ch57-l10. Ch 58 gains the participle-with-object lesson
 * ch58-l09, reported speech (ch58-l04 rebuilt), a rebuilt review ch58-l06 and ch58-test.
 * Ch 59 gains Al-Ala in two parts (ch59-l07, ch59-l08), a rebuilt review ch59-l05,
 * ch59-test (16 questions) and the S12 clean-up of the hal label in l02 / l03. Ch 60
 * converts ch60-l04 into the CL16 Conversation Lab, swaps l02 / l03, and gains the
 * review ch60-l07 and ch60-test.
 * Lesson.addedAt and Lesson.contentUpdatedAt are stamped by the database
 * trigger, so no progress backfill is needed.
 *
 * Usage:
 *   node scripts/promote-chapters-56-60.cjs --chapter=56            # dry run
 *   node scripts/promote-chapters-56-60.cjs --chapter=56 --apply
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
  56: [
    ["ch56-l01", 1, "chapter-56-lesson-01.json"],
    ["ch56-l02", 2, "chapter-56-lesson-02.json"],
    ["ch56-l06", 3, "chapter-56-lesson-03.json"],
    ["ch56-l03", 4, "chapter-56-lesson-04.json"],
    ["ch56-l07", 5, "chapter-56-lesson-05.json"],
    ["ch56-l04", 6, "chapter-56-lesson-06.json"],
    ["ch56-l05", 7, "chapter-56-lesson-07.json"],
    ["ch56-l10", 8, "chapter-56-lesson-08.json"],
    ["ch56-l11", 9, "chapter-56-lesson-09.json"],
    ["ch56-l12", 10, "chapter-56-lesson-10.json"],
    ["ch56-l13", 11, "chapter-56-lesson-11.json"],
    ["ch56-l08", 12, "chapter-56-lesson-12-review.json"],
    ["ch56-test", 13, "chapter-56-lesson-13-final-test.json"],
  ],
  57: [
    ["ch57-l01", 1, "chapter-57-lesson-01.json"],
    ["ch57-l02", 2, "chapter-57-lesson-02.json"],
    ["ch57-l03", 3, "chapter-57-lesson-03.json"],
    ["ch57-l11", 4, "chapter-57-lesson-04.json"],
    ["ch57-l12", 5, "chapter-57-lesson-05.json"],
    ["ch57-l04", 6, "chapter-57-lesson-06.json"],
    ["ch57-l06", 7, "chapter-57-lesson-07.json"],
    ["ch57-l07", 8, "chapter-57-lesson-08.json"],
    ["ch57-l08", 9, "chapter-57-lesson-09.json"],
    ["ch57-l05", 10, "chapter-57-lesson-10.json"],
    ["ch57-l10", 11, "chapter-57-lesson-11-spoken-phrases.json"],
    ["ch57-l09", 12, "chapter-57-lesson-12-review.json"],
    ["ch57-test", 13, "chapter-57-lesson-13-final-test.json"],
  ],
  58: [
    ["ch58-l01", 1, "chapter-58-lesson-01.json"],
    ["ch58-l02", 2, "chapter-58-lesson-02.json"],
    ["ch58-l03", 3, "chapter-58-lesson-03.json"],
    ["ch58-l09", 4, "chapter-58-lesson-04.json"],
    ["ch58-l04", 5, "chapter-58-lesson-05.json"],
    ["ch58-l05", 6, "chapter-58-lesson-06.json"],
    ["ch58-l06", 7, "chapter-58-lesson-07-review.json"],
    ["ch58-test", 8, "chapter-58-lesson-08-final-test.json"],
  ],
  59: [
    ["ch59-l01", 1, "chapter-59-lesson-01.json"],
    ["ch59-l02", 2, "chapter-59-lesson-02.json"],
    ["ch59-l03", 3, "chapter-59-lesson-03.json"],
    ["ch59-l04", 4, "chapter-59-lesson-04.json"],
    ["ch59-l07", 5, "chapter-59-lesson-05.json"],
    ["ch59-l08", 6, "chapter-59-lesson-06.json"],
    ["ch59-l05", 7, "chapter-59-lesson-07-review.json"],
    ["ch59-test", 8, "chapter-59-lesson-08-final-test.json"],
  ],
  60: [
    ["ch60-l01", 1, "chapter-60-lesson-01.json"],
    ["ch60-l03", 2, "chapter-60-lesson-02.json"],
    ["ch60-l02", 3, "chapter-60-lesson-03.json"],
    ["ch60-l04", 4, "chapter-60-lesson-04-conversation-lab.json"],
    ["ch60-l05", 5, "chapter-60-lesson-05.json"],
    ["ch60-l06", 6, "chapter-60-lesson-06.json"],
    ["ch60-l07", 7, "chapter-60-lesson-07-review.json"],
    ["ch60-test", 8, "chapter-60-lesson-08-final-test.json"],
  ],
};
// Surplus rows: unpublished (DRAFT) and moved past the last position; content and learner progress are kept (S3).
const SURPLUS = { 56: [["ch56-l09", 14]] };
// Final test length per chapter: twelve questions (9/12 fails, 10/12 passes); the Ch 56 reading chapter and the Ch 59 Book 6 capstone use sixteen (12/16 fails, 13/16 passes).
const TEST_LENGTH = { 56: 16, 57: 12, 58: 12, 59: 16, 60: 12 };

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
  if (!PLANS[CHAPTER]) throw new Error("Pass --chapter=56 to --chapter=60.");
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
