/**
 * Scoped promotion of the Chapter 41–45 work from the proposal harvest
 * (Docs/proposals/proposal-harvest-tracker.md, batch 4), one chapter per run.
 * Existing lesson IDs are updated in place so learner progress stays attached;
 * a row whose content is unchanged is left alone (so learners get no spurious
 * "Updated" notice) and a row that only moved gets just its order changed.
 * Ch 41 and 42 are rebuilt (ch41-l06/l07/l08, ch42-l07 and the chNN-test rows
 * are new; ch41-l05 becomes the REVIEW at order 8). Ch 43 gains ch43-l06…l09,
 * the CL13 lab (ch43-l04 converted in place) and ch43-test; ch43-l03 becomes
 * Al-Ma'un part 1. Ch 44 and 45 keep their lessons, gain chNN-test and are
 * reordered; Ch 45 also gains ch45-l08 (purpose) and ch45-l09 (حَتَّى).
 * Lesson.addedAt and Lesson.contentUpdatedAt are stamped by the database
 * trigger, so no progress backfill is needed.
 *
 * Usage:
 *   node scripts/promote-chapters-41-45.cjs --chapter=41            # dry run
 *   node scripts/promote-chapters-41-45.cjs --chapter=41 --apply
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
  41: [
    ["ch41-l01", 1, "chapter-41-lesson-01.json"],
    ["ch41-l02", 2, "chapter-41-lesson-02.json"],
    ["ch41-l03", 3, "chapter-41-lesson-03.json"],
    ["ch41-l04", 4, "chapter-41-lesson-04.json"],
    ["ch41-l06", 5, "chapter-41-lesson-05.json"],
    ["ch41-l07", 6, "chapter-41-lesson-06.json"],
    ["ch41-l08", 7, "chapter-41-lesson-07.json"],
    ["ch41-l05", 8, "chapter-41-lesson-08-review.json"],
    ["ch41-test", 9, "chapter-41-lesson-09-final-test.json"],
  ],
  42: [
    ["ch42-l01", 1, "chapter-42-lesson-01.json"],
    ["ch42-l02", 2, "chapter-42-lesson-02.json"],
    ["ch42-l03", 3, "chapter-42-lesson-03.json"],
    ["ch42-l04", 4, "chapter-42-lesson-04.json"],
    ["ch42-l07", 5, "chapter-42-lesson-05.json"],
    ["ch42-l05", 6, "chapter-42-lesson-06-review.json"],
    ["ch42-test", 7, "chapter-42-lesson-07-final-test.json"],
  ],
  43: [
    ["ch43-l01", 1, "chapter-43-lesson-01.json"],
    ["ch43-l02", 2, "chapter-43-lesson-02.json"],
    ["ch43-l06", 3, "chapter-43-lesson-03.json"],
    ["ch43-l07", 4, "chapter-43-lesson-04.json"],
    ["ch43-l08", 5, "chapter-43-lesson-05.json"],
    ["ch43-l03", 6, "chapter-43-lesson-06.json"],
    ["ch43-l09", 7, "chapter-43-lesson-07.json"],
    ["ch43-l04", 8, "chapter-43-lesson-08-conversation-lab.json"],
    ["ch43-l05", 9, "chapter-43-lesson-09-review.json"],
    ["ch43-test", 10, "chapter-43-lesson-10-final-test.json"],
  ],
  44: [
    ["ch44-l01", 1, "chapter-44-lesson-01.json"],
    ["ch44-l02", 2, "chapter-44-lesson-02.json"],
    ["ch44-l03", 3, "chapter-44-lesson-03.json"],
    ["ch44-l06", 4, "chapter-44-lesson-04.json"],
    ["ch44-l04", 5, "chapter-44-lesson-05.json"],
    ["ch44-l07", 6, "chapter-44-lesson-06.json"],
    ["ch44-l05", 7, "chapter-44-lesson-07-review.json"],
    ["ch44-test", 8, "chapter-44-lesson-08-final-test.json"],
  ],
  45: [
    ["ch45-l01", 1, "chapter-45-lesson-01.json"],
    ["ch45-l02", 2, "chapter-45-lesson-02.json"],
    ["ch45-l08", 3, "chapter-45-lesson-03.json"],
    ["ch45-l09", 4, "chapter-45-lesson-04.json"],
    ["ch45-l03", 5, "chapter-45-lesson-05.json"],
    ["ch45-l04", 6, "chapter-45-lesson-06.json"],
    ["ch45-l05", 7, "chapter-45-lesson-07.json"],
    ["ch45-l06", 8, "chapter-45-lesson-08.json"],
    ["ch45-l07", 9, "chapter-45-lesson-09-review.json"],
    ["ch45-test", 10, "chapter-45-lesson-10-final-test.json"],
  ],
};

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
  if (!PLANS[CHAPTER]) throw new Error("Pass --chapter=41 … --chapter=45.");
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
    if (test?.content?.assessment?.questions?.length !== 12) throw new Error(`Chapter ${CHAPTER} final test verification failed.`);
    console.log(`\nChapter ${CHAPTER} promotion applied and verified. Learner progress rows were not modified.`);
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) main().catch((error) => { console.error(error); process.exitCode = 1; });
module.exports = { PLANS };
