/**
 * Scoped promotion of the Chapter 46–50 work from the proposal harvest
 * (Docs/proposals/proposal-harvest-tracker.md, batch 5), one chapter per run.
 * Existing lesson IDs are updated in place so learner progress stays attached;
 * a row whose content is unchanged is left alone (so learners get no spurious
 * "Updated" notice) and a row that only moved gets just its order changed.
 * Ch 46 keeps its six lessons (ch46-l05 gets a small correction), gains the
 * review ch46-l07 and ch46-test. Ch 47 keeps its lessons and gains ch47-test.
 * Ch 48 gains ch48-l06 / l07 (numbers 11–20, tens and 100), the CL14 lab
 * (ch48-l05 rebuilt in place), the review ch48-l08 and ch48-test, and is
 * reordered. Ch 49 rebuilds ch49-l01…l04, gains ch49-l07 (لَكِنَّ, لَعَلَّ,
 * لَيْتَ), the review ch49-l06 and ch49-test. Ch 50 rebuilds ch50-l02 / l03,
 * converts ch50-l04 to the CL15 lab, fixes ch50-l05's hook and gains
 * ch50-l07…l09 (Al-Adiyat, Az-Zalzalah), the review ch50-l06 and ch50-test.
 * Lesson.addedAt and Lesson.contentUpdatedAt are stamped by the database
 * trigger, so no progress backfill is needed.
 *
 * Usage:
 *   node scripts/promote-chapters-46-50.cjs --chapter=46            # dry run
 *   node scripts/promote-chapters-46-50.cjs --chapter=46 --apply
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
  46: [
    ["ch46-l01", 1, "chapter-46-lesson-01.json"],
    ["ch46-l02", 2, "chapter-46-lesson-02.json"],
    ["ch46-l03", 3, "chapter-46-lesson-03.json"],
    ["ch46-l04", 4, "chapter-46-lesson-04.json"],
    ["ch46-l05", 5, "chapter-46-lesson-05.json"],
    ["ch46-l06", 6, "chapter-46-lesson-06.json"],
    ["ch46-l07", 7, "chapter-46-lesson-07-review.json"],
    ["ch46-test", 8, "chapter-46-lesson-08-final-test.json"],
  ],
  47: [
    ["ch47-l01", 1, "chapter-47-lesson-01.json"],
    ["ch47-l02", 2, "chapter-47-lesson-02.json"],
    ["ch47-l03", 3, "chapter-47-lesson-03.json"],
    ["ch47-l04", 4, "chapter-47-lesson-04.json"],
    ["ch47-l05", 5, "chapter-47-lesson-05.json"],
    ["ch47-l06", 6, "chapter-47-lesson-06-review.json"],
    ["ch47-test", 7, "chapter-47-lesson-07-final-test.json"],
  ],
  48: [
    ["ch48-l01", 1, "chapter-48-lesson-01.json"],
    ["ch48-l04", 2, "chapter-48-lesson-02.json"],
    ["ch48-l02", 3, "chapter-48-lesson-03.json"],
    ["ch48-l06", 4, "chapter-48-lesson-04.json"],
    ["ch48-l07", 5, "chapter-48-lesson-05.json"],
    ["ch48-l03", 6, "chapter-48-lesson-06.json"],
    ["ch48-l05", 7, "chapter-48-lesson-07-conversation-lab.json"],
    ["ch48-l08", 8, "chapter-48-lesson-08-review.json"],
    ["ch48-test", 9, "chapter-48-lesson-09-final-test.json"],
  ],
  49: [
    ["ch49-l01", 1, "chapter-49-lesson-01.json"],
    ["ch49-l02", 2, "chapter-49-lesson-02.json"],
    ["ch49-l07", 3, "chapter-49-lesson-03.json"],
    ["ch49-l03", 4, "chapter-49-lesson-04.json"],
    ["ch49-l04", 5, "chapter-49-lesson-05.json"],
    ["ch49-l05", 6, "chapter-49-lesson-06.json"],
    ["ch49-l06", 7, "chapter-49-lesson-07-review.json"],
    ["ch49-test", 8, "chapter-49-lesson-08-final-test.json"],
  ],
  50: [
    ["ch50-l01", 1, "chapter-50-lesson-01.json"],
    ["ch50-l02", 2, "chapter-50-lesson-02.json"],
    ["ch50-l03", 3, "chapter-50-lesson-03.json"],
    ["ch50-l04", 4, "chapter-50-lesson-04-conversation-lab.json"],
    ["ch50-l05", 5, "chapter-50-lesson-05.json"],
    ["ch50-l07", 6, "chapter-50-lesson-06.json"],
    ["ch50-l08", 7, "chapter-50-lesson-07.json"],
    ["ch50-l09", 8, "chapter-50-lesson-08.json"],
    ["ch50-l06", 9, "chapter-50-lesson-09-review.json"],
    ["ch50-test", 10, "chapter-50-lesson-10-final-test.json"],
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
  if (!PLANS[CHAPTER]) throw new Error("Pass --chapter=46 … --chapter=50.");
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
