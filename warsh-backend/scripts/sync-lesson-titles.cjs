/**
 * Copies lesson titles from fixture `_meta` (title, titleAr, titleUr) into the
 * Lesson row. `content:sync` writes only `Lesson.content`, so a rewritten
 * lesson keeps its old title in the lesson list until this runs.
 *
 * titleUr follows the seed: `_meta.titleUr`, else localizeMetadata(title).
 *
 * Usage (from warsh-backend/):
 *   node scripts/sync-lesson-titles.cjs --chapters=46,69          # dry run
 *   node scripts/sync-lesson-titles.cjs --chapters=46,69 --apply
 *   node scripts/sync-lesson-titles.cjs --all --apply
 */
require("dotenv/config");

const fs = require("node:fs");
const path = require("node:path");
const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");
const { localizeMetadata } = require("../prisma/urdu-metadata.cjs");

const APPLY = process.argv.includes("--apply");
const ALL = process.argv.includes("--all");
const chaptersArg = process.argv.find((a) => a.startsWith("--chapters="));
const CHAPTERS = chaptersArg ? new Set(chaptersArg.slice("--chapters=".length).split(",").map(Number)) : null;
if (!ALL && !CHAPTERS) {
  console.error("Pass --chapters=N,M or --all.");
  process.exit(1);
}

const FIXTURES_DIR = path.join(__dirname, "../prisma/fixtures");
const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL ?? "" }) });

async function main() {
  const fixtures = new Map();
  for (const name of fs.readdirSync(FIXTURES_DIR).filter((n) => n.endsWith(".json"))) {
    const content = JSON.parse(fs.readFileSync(path.join(FIXTURES_DIR, name), "utf8"));
    const meta = content._meta;
    if (!meta?.chapter_order || !meta?.lesson_order || !meta.title) continue;
    if (CHAPTERS && !CHAPTERS.has(meta.chapter_order)) continue;
    fixtures.set(`${meta.chapter_order}:${meta.lesson_order}`, meta);
  }

  const lessons = await prisma.lesson.findMany({
    select: { id: true, order: true, title: true, titleAr: true, titleUr: true, chapter: { select: { order: true } } },
  });
  let changed = 0;
  for (const lesson of lessons) {
    const meta = fixtures.get(`${lesson.chapter.order}:${lesson.order}`);
    if (!meta) continue;
    const next = {
      title: meta.title,
      titleAr: meta.titleAr ?? lesson.titleAr,
      titleUr: meta.titleUr ?? localizeMetadata(meta.title),
    };
    if (next.title === lesson.title && next.titleAr === lesson.titleAr && next.titleUr === lesson.titleUr) continue;
    changed += 1;
    console.log(`${APPLY ? "[UPDATED]" : "[WOULD UPDATE]"} ${lesson.id}: "${lesson.title}" → "${next.title}"`);
    if (APPLY) await prisma.lesson.update({ where: { id: lesson.id }, data: next });
  }
  console.log(`${changed} lesson title(s) ${APPLY ? "updated" : "would change"}.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
