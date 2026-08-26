/**
 * Pulls `Lesson.content` out of the database and back into
 * `prisma/fixtures/*.json`, so work done in Warsh Studio lands in Git as a
 * reviewable, restorable diff.
 *
 * Studio writes straight to the database and the learner apps read straight
 * from it, which is what makes the non-technical workflow possible — but it
 * also means an accidental delete or a bad bulk edit has no undo. This script
 * is that undo.
 *
 * Direction is decided by `prisma/lesson-sync-baseline.json`, which records the
 * hash of each lesson at the last point the database and the fixture mirror
 * agreed. A later difference is therefore attributable: the database moved
 * (Studio edit → export), the fixture moved (Git edit → sync), or both
 * (conflict → a human decides).
 *
 * Usage (from warsh-backend/):
 *   npm run content:check                  # report, write nothing, exit 1 if stale
 *   npm run content:export -- --dry-run    # list what would be written
 *   npm run content:export                 # write the fixture mirror
 *   npm run content:export -- --chapter=12 # limit to one chapter
 *   npm run content:export -- --prune      # also delete orphaned fixtures
 *   npm run content:baseline               # adopt the current DB state as agreed
 *
 * `--force` overrides the refusal to overwrite a fixture that is ahead of the
 * database, and resolves conflicts in the database's favour.
 */

import fs from "fs";
import path from "path";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import {
  FIXTURES_DIR,
  byState,
  classifyLessons,
  contentHash,
  lessonKey,
  readBaseline,
  readDbLessons,
  readFixtureIndex,
  serializeFixture,
  writeBaseline,
  type DbLesson,
  type LessonSyncRecord,
} from "./lib/lesson-fixtures";

const DRY_RUN = process.argv.includes("--dry-run");
const CHECK = process.argv.includes("--check");
const PRUNE = process.argv.includes("--prune");
const FORCE = process.argv.includes("--force");
const SET_BASELINE = process.argv.includes("--baseline");
const CHAPTER = Number(
  process.argv.find((argument) => argument.startsWith("--chapter="))?.slice("--chapter=".length),
);
const ONLY_CHAPTER = Number.isFinite(CHAPTER) ? CHAPTER : null;

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL ?? "" });
const prisma = new PrismaClient({ adapter } as ConstructorParameters<typeof PrismaClient>[0]);

function list(label: string, records: LessonSyncRecord[], limit = 25) {
  if (records.length === 0) return;
  console.log(`\n${label} (${records.length}):`);
  for (const record of records.slice(0, limit)) console.log(`  ${record.filename} — ${record.label}`);
  if (records.length > limit) console.log(`  …and ${records.length - limit} more.`);
}

/** Full DB-side hash map, used when adopting a baseline. */
function allDbHashes(lessons: DbLesson[]): Record<string, string> {
  const hashes: Record<string, string> = {};
  for (const lesson of lessons) {
    hashes[lessonKey(lesson.chapterOrder, lesson.lessonOrder)] =
      contentHash(lesson.content, lesson.chapterOrder, lesson.lessonOrder);
  }
  return hashes;
}

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not set. Run through the npm script, which loads .env.");
  }

  const { byLesson: fixtures, unmatched } = readFixtureIndex();
  for (const filename of unmatched) {
    console.warn(`  ⚠ ${filename} has no _meta.chapter_order/lesson_order — cannot be matched to a lesson`);
  }

  const allLessons = await readDbLessons(prisma);
  const baseline = readBaseline();

  if (SET_BASELINE) {
    const hashes = allDbHashes(allLessons);
    if (!DRY_RUN) writeBaseline(hashes);
    console.log(`${DRY_RUN ? "Would record" : "Recorded"} the current database state as the agreed baseline for ${Object.keys(hashes).length} lessons.`);
    console.log("Differences from here on are attributable to whichever side moved.");
    return;
  }

  // Classification always covers the whole library, so a --chapter run can
  // still report that the rest of the mirror needs attention.
  const records = classifyLessons(allLessons, fixtures, baseline);
  const states = byState(records);

  if (!baseline) {
    console.warn("\n⚠ No baseline recorded yet, so differences cannot be attributed to a side.");
    console.warn("  If the database is the trusted copy, run `npm run content:baseline` first.\n");
  }

  if (CHECK) {
    list("Studio edits not in Git (export needed)", states.db_ahead);
    list("Lessons with no fixture at all (export needed)", states.missing_fixture);
    list("Changed on both sides (conflict)", states.conflict);
    list("Differ, with no baseline to attribute them", states.unknown);
    list("Git ahead of production (sync needed, not an export problem)", states.fixture_ahead);
    list("Fixtures whose lesson is gone from the database", states.orphan_fixture);

    const stale = states.db_ahead.length + states.missing_fixture.length + states.conflict.length + states.unknown.length;
    console.log("\n" + "─".repeat(60));
    console.log(`In sync:            ${states.in_sync.length}`);
    console.log(`Git ahead of DB:    ${states.fixture_ahead.length}  (run content:sync to publish)`);
    console.log(`DB ahead of Git:    ${states.db_ahead.length}`);
    console.log(`Missing fixtures:   ${states.missing_fixture.length}`);
    console.log(`Conflicts:          ${states.conflict.length}`);
    console.log(`Unattributable:     ${states.unknown.length}`);
    console.log(`Orphan fixtures:    ${states.orphan_fixture.length}`);
    console.log("─".repeat(60));

    if (stale > 0) {
      console.error(`Fixture mirror is STALE — ${stale} lesson(s) are not backed up in Git.`);
      console.error("Run `npm run content:export` and commit the result.");
      process.exitCode = 1;
    } else {
      console.log("Fixture mirror is current.");
    }
    return;
  }

  const writable = new Set(["db_ahead", "missing_fixture"]);
  const forceOnly = new Set(["conflict", "unknown", "fixture_ahead"]);

  let written = 0;
  let created = 0;
  let skipped = 0;
  const agreed: Record<string, string> = { ...(baseline?.lessons ?? {}) };

  const lessonByKey = new Map(allLessons.map((lesson) => [lessonKey(lesson.chapterOrder, lesson.lessonOrder), lesson]));

  for (const record of records) {
    if (record.state === "orphan_fixture") continue;

    const lesson = lessonByKey.get(record.key);
    if (!lesson) continue;
    if (ONLY_CHAPTER !== null && lesson.chapterOrder !== ONLY_CHAPTER) continue;

    if (record.state === "in_sync") {
      // Already agreeing; record that agreement so the baseline stays useful.
      if (record.dbHash) agreed[record.key] = record.dbHash;
      continue;
    }

    if (forceOnly.has(record.state) && !FORCE) {
      const reason = record.state === "fixture_ahead"
        ? "the fixture is ahead of the database"
        : record.state === "conflict"
          ? "both sides changed"
          : "no baseline attributes the change";
      console.warn(`  [SKIP] ${record.filename} — ${reason}; re-run with --force to overwrite from the database`);
      skipped++;
      continue;
    }

    if (!writable.has(record.state) && !FORCE) continue;

    const target = path.join(FIXTURES_DIR, record.filename);
    const serialized = serializeFixture(lesson.content, lesson.chapterOrder, lesson.lessonOrder);
    const exists = fs.existsSync(target);
    const verb = exists ? "UPDATE" : "CREATE";

    console.log(`  [${DRY_RUN ? `WOULD ${verb}` : verb}] ${record.filename} — ${record.label}`);
    if (!DRY_RUN) {
      fs.writeFileSync(target, serialized, "utf8");
      if (record.dbHash) agreed[record.key] = record.dbHash;
    }
    if (exists) written++;
    else created++;
  }

  const orphans = states.orphan_fixture;
  let pruned = 0;
  for (const orphan of orphans) {
    delete agreed[orphan.key];
    if (!PRUNE) {
      console.warn(`  ⚠ ${orphan.filename} has no lesson in the database (use --prune to delete)`);
      continue;
    }
    console.log(`  [${DRY_RUN ? "WOULD DELETE" : "DELETE"}] ${orphan.filename}`);
    if (!DRY_RUN) fs.unlinkSync(path.join(FIXTURES_DIR, orphan.filename));
    pruned++;
  }

  if (!DRY_RUN) writeBaseline(agreed);

  console.log("\n" + "─".repeat(60));
  console.log(`Fixtures updated:  ${written}`);
  console.log(`Fixtures created:  ${created}`);
  console.log(`Fixtures deleted:  ${pruned}${PRUNE ? "" : ` (${orphans.length} orphan(s) left in place)`}`);
  console.log(`Skipped:           ${skipped}`);
  console.log(`Already in sync:   ${states.in_sync.length}`);
  console.log("─".repeat(60));
  if (!DRY_RUN && (written || created || pruned)) {
    console.log("Review with `git diff prisma/fixtures` and commit the result.");
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
