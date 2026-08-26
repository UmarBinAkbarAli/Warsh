/**
 * Pushes the lesson fixture JSON into the DB `Lesson.content` column, WITHOUT
 * the destructive resets that `prisma db seed` performs. Only `Lesson.content`
 * is written — no user, progress, vocabulary or achievement rows are touched.
 *
 * ─────────────────────────────────────────────────────────────────────────
 * THIS SCRIPT WRITES OVER WARSH STUDIO EDITS.
 *
 * Studio is the authoring surface for the content team, so the database — not
 * these files — is the source of truth for lesson content. Fixtures are its
 * versioned mirror, produced by `npm run content:export`. Pushing a stale
 * mirror back into the database silently destroys whatever the team authored
 * since the last export, so this script refuses to run while the mirror is
 * stale. Use it to restore from Git, not to author.
 * ─────────────────────────────────────────────────────────────────────────
 *
 * By default it only updates lessons whose media URLs (audio_url / image_url)
 * actually differ from what's stored, so media repoints land with a minimal,
 * auditable set of writes.
 *
 * Usage (from warsh-backend/):
 *   npm run content:sync -- --dry-run   # show which lessons would change
 *   npm run content:sync                # apply
 *   npm run content:sync -- --content   # sync any changed lesson content
 *   npm run content:sync -- --content --git-changed # limit to edited fixtures
 *   npm run content:sync -- --content --git-ref=HEAD^ # limit to fixtures changed since a Git revision
 *   npm run content:sync -- --all --force # rewrite every lesson's content
 *
 * Matches fixtures to lessons by (chapter.order, lesson.order).
 */

import fs from "fs";
import path from "path";
import { execFileSync } from "child_process";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import {
  byState,
  classifyLessons,
  contentHash,
  lessonKey,
  readBaseline,
  readDbLessons,
  readFixtureIndex,
  writeBaseline,
  type DbLesson,
  type LessonSyncRecord,
} from "./lib/lesson-fixtures";

const DRY_RUN = process.argv.includes("--dry-run");
const ALL = process.argv.includes("--all");
const FORCE = process.argv.includes("--force");
const CONTENT = process.argv.includes("--content");
const GIT_CHANGED = process.argv.includes("--git-changed");
const GIT_REF = process.argv.find((argument) => argument.startsWith("--git-ref="))?.slice("--git-ref=".length);
const LIMIT_TO_GIT_CHANGES = GIT_CHANGED || Boolean(GIT_REF);

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

function stableJson(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(stableJson).join(",")}]`;
  if (value && typeof value === "object") {
    const object = value as Record<string, unknown>;
    return `{${Object.keys(object).sort().map((key) => `${JSON.stringify(key)}:${stableJson(object[key])}`).join(",")}}`;
  }
  return JSON.stringify(value);
}

function loadFixtures() {
  const map = new Map<string, unknown>();
  const changedFiles = LIMIT_TO_GIT_CHANGES
    ? new Set(
        execFileSync("git", ["diff", "--name-only", ...(GIT_REF ? [GIT_REF] : []), "--", "prisma/fixtures"], {
          cwd: path.join(__dirname, ".."),
          encoding: "utf8",
        })
          .split(/\r?\n/)
          .filter(Boolean)
          .map((file) => path.basename(file)),
      )
    : null;
  for (const f of fs.readdirSync(FIXTURES_DIR).filter((name) =>
    name.endsWith(".json") && (!changedFiles || changedFiles.has(name)))) {
    const content = JSON.parse(fs.readFileSync(path.join(FIXTURES_DIR, f), "utf8"));
    const co = content?._meta?.chapter_order;
    const lo = content?._meta?.lesson_order;
    if (Number.isFinite(co) && Number.isFinite(lo)) map.set(key(co, lo), content);
    else console.warn(`  ⚠ ${f} has no _meta.chapter_order/lesson_order — skipped`);
  }
  return map;
}

/** An operator mistake this script deliberately blocks, not a crash. */
class GuardError extends Error {}

/**
 * Refuses to push files over the database while the database holds work that
 * is not in Git.
 *
 * Direction matters: a fixture edited in Git is exactly what this script exists
 * to publish, while a lesson edited in Studio would be destroyed by publishing
 * over it. `prisma/lesson-sync-baseline.json` is what tells the two apart --
 * without it, every difference is unattributable and the push is blocked.
 */
async function assertSafeToPush(): Promise<{ carried: Record<string, string>; lessons: DbLesson[] }> {
  const { byLesson } = readFixtureIndex();
  // Pulling every lesson's `content` is the slowest call this script makes, so
  // the result is handed back to the caller rather than fetched a second time.
  const lessons = await readDbLessons(prisma);
  const baseline = readBaseline();
  const states = byState(classifyLessons(lessons, byLesson, baseline));
  const carried = { ...(baseline?.lessons ?? {}) };

  const blocking: LessonSyncRecord[] = [...states.db_ahead, ...states.conflict, ...states.unknown];
  if (blocking.length === 0) {
    if (states.fixture_ahead.length > 0) {
      console.log(`${states.fixture_ahead.length} lesson(s) are ahead in Git and will be published.\n`);
    }
    return { carried, lessons };
  }

  console.error("\n" + "!".repeat(60));
  if (!baseline) {
    console.error("No sync baseline exists, so differences cannot be attributed to a side.");
    console.error("Pushing now could overwrite Warsh Studio edits with older files.\n");
    console.error("If the database is the trusted copy, run `npm run content:baseline` first.");
  } else {
    console.error(`${blocking.length} lesson(s) hold database-side work that is not in Git.`);
    console.error("Pushing now would overwrite Warsh Studio edits.\n");
    for (const record of blocking.slice(0, 20)) {
      console.error(`  [${record.state}] ${record.filename} - ${record.label}`);
    }
    if (blocking.length > 20) console.error(`  ...and ${blocking.length - 20} more.`);
    console.error("\nRun `npm run content:export` and commit, then re-run this sync.");
  }
  console.error("To overwrite the database from Git anyway, re-run with --force.");
  console.error("!".repeat(60) + "\n");

  if (DRY_RUN) {
    console.error("(--dry-run: continuing, nothing will be written.)\n");
    return { carried, lessons };
  }
  if (FORCE) {
    console.error("(--force: continuing, the database-side work above WILL be overwritten.)\n");
    return { carried, lessons };
  }
  throw new GuardError("Refusing to overwrite database-side content with the fixture mirror.");
}

async function main() {
  // `--all` rewrites every lesson from disk; that is a restore, never a sync.
  if (ALL && !FORCE && !DRY_RUN) {
    throw new GuardError("--all rewrites every lesson from disk. Re-run with --force if that is what you intend.");
  }

  const { carried: agreed, lessons } = await assertSafeToPush();

  const fixtures = loadFixtures();

  let changed = 0;
  let unchanged = 0;
  let noFixture = 0;

  for (const lesson of lessons) {
    const chapterOrder = lesson.chapterOrder;
    const fixture = fixtures.get(key(chapterOrder, lesson.lessonOrder));
    if (!fixture) {
      if (!LIMIT_TO_GIT_CHANGES) noFixture++;
      continue;
    }


    const before = CONTENT ? stableJson(lesson.content) : mediaUrls(lesson.content).sort().join("|");
    const after = CONTENT ? stableJson(fixture) : mediaUrls(fixture).sort().join("|");
    if (!ALL && before === after) {
      unchanged++;
      continue;
    }

    changed++;
    const diff = CONTENT
      ? "lesson content changed"
      : `${mediaUrls(fixture).filter((u) => !mediaUrls(lesson.content).includes(u)).length} media URL(s) changed`;
    console.log(`  [${DRY_RUN ? "WOULD UPDATE" : "UPDATE"}] ${lesson.id} (ch${chapterOrder} l${lesson.lessonOrder}) — ${diff}`);
    if (!DRY_RUN) {
      await prisma.lesson.update({ where: { id: lesson.id }, data: { content: fixture as object } });
      // The two sides now agree on this lesson; record it so a later change is
      // still attributable to whichever side moves next.
      agreed[lessonKey(chapterOrder, lesson.lessonOrder)] = contentHash(fixture, chapterOrder, lesson.lessonOrder);
    }
  }

  if (!DRY_RUN) writeBaseline(agreed);

  console.log("\n" + "─".repeat(60));
  console.log(`Lessons updated:   ${changed}`);
  console.log(`Lessons unchanged: ${unchanged}`);
  console.log(`No fixture match:  ${noFixture}`);
  console.log("─".repeat(60));
  await prisma.$disconnect();
}

main().catch(async (err) => {
  // Guard failures are expected operator errors with an actionable message
  // above them; a stack trace would only bury it.
  if (err instanceof GuardError) console.error(err.message);
  else console.error(err);
  await prisma.$disconnect();
  process.exit(1);
});
