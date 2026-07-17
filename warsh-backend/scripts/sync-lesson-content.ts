/**
 * Safely pushes the lesson fixture JSON into the DB `Lesson.content` column,
 * WITHOUT the destructive resets that `prisma db seed` performs. Only
 * `Lesson.content` is written — no user, progress, vocabulary or achievement
 * rows are touched.
 *
 * By default it only updates lessons whose media URLs (audio_url / image_url)
 * actually differ from what's stored, so the ayah-repoint + janna-image fixes
 * land with a minimal, auditable set of writes.
 *
 * Usage (from warsh-backend/):
 *   npm run content:sync -- --dry-run   # show which lessons would change
 *   npm run content:sync                # apply
 *   npm run content:sync -- --all       # rewrite every lesson's content
 *
 * Matches fixtures to lessons by (chapter.order, lesson.order).
 */

import fs from "fs";
import path from "path";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const DRY_RUN = process.argv.includes("--dry-run");
const ALL = process.argv.includes("--all");

const FIXTURES_DIR = path.join(__dirname, "../prisma/fixtures");
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL ?? "" });
const prisma = new PrismaClient({ adapter } as ConstructorParameters<typeof PrismaClient>[0]);

const key = (chapterOrder: number, lessonOrder: number) => `${chapterOrder}:${lessonOrder}`;

/** All audio_url + image_url values inside a lesson content blob, sorted. */
function mediaUrls(node: unknown, out: string[] = []): string[] {
  if (Array.isArray(node)) node.forEach((n) => mediaUrls(n, out));
  else if (node && typeof node === "object") {
    const o = node as Record<string, unknown>;
    if (typeof o.audio_url === "string") out.push(o.audio_url);
    if (typeof o.image_url === "string") out.push(o.image_url);
    for (const k of Object.keys(o)) mediaUrls(o[k], out);
  }
  return out;
}

function loadFixtures() {
  const map = new Map<string, unknown>();
  for (const f of fs.readdirSync(FIXTURES_DIR).filter((n) => n.endsWith(".json"))) {
    const content = JSON.parse(fs.readFileSync(path.join(FIXTURES_DIR, f), "utf8"));
    const co = content?._meta?.chapter_order;
    const lo = content?._meta?.lesson_order;
    if (Number.isFinite(co) && Number.isFinite(lo)) map.set(key(co, lo), content);
    else console.warn(`  ⚠ ${f} has no _meta.chapter_order/lesson_order — skipped`);
  }
  return map;
}

async function main() {
  const fixtures = loadFixtures();
  const chapters = await prisma.chapter.findMany({ select: { id: true, order: true } });
  const chapterOrderById = new Map(chapters.map((c) => [c.id, c.order]));
  const lessons = await prisma.lesson.findMany({ select: { id: true, chapterId: true, order: true, content: true } });

  let changed = 0;
  let unchanged = 0;
  let noFixture = 0;

  for (const lesson of lessons) {
    const chapterOrder = chapterOrderById.get(lesson.chapterId);
    if (chapterOrder === undefined) continue;
    const fixture = fixtures.get(key(chapterOrder, lesson.order));
    if (!fixture) {
      noFixture++;
      continue;
    }

    const before = mediaUrls(lesson.content).sort().join("|");
    const after = mediaUrls(fixture).sort().join("|");
    if (!ALL && before === after) {
      unchanged++;
      continue;
    }

    changed++;
    const diff = mediaUrls(fixture).filter((u) => !mediaUrls(lesson.content).includes(u)).length;
    console.log(`  [${DRY_RUN ? "WOULD UPDATE" : "UPDATE"}] ${lesson.id} (ch${chapterOrder} l${lesson.order}) — ${diff} media URL(s) changed`);
    if (!DRY_RUN) {
      await prisma.lesson.update({ where: { id: lesson.id }, data: { content: fixture as object } });
    }
  }

  console.log("\n" + "─".repeat(60));
  console.log(`Lessons updated:   ${changed}`);
  console.log(`Lessons unchanged: ${unchanged}`);
  console.log(`No fixture match:  ${noFixture}`);
  console.log("─".repeat(60));
  await prisma.$disconnect();
}

main().catch(async (err) => {
  console.error(err);
  await prisma.$disconnect();
  process.exit(1);
});
