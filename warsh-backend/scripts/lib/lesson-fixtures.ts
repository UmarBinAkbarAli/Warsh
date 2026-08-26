/**
 * Shared mapping between `Lesson.content` rows and `prisma/fixtures/*.json`.
 *
 * Warsh Studio is the authoring surface, so the database is the source of
 * truth for lesson content and the fixture files are its versioned mirror.
 * Both directions of the sync — export (DB → files) and the legacy push
 * (files → DB) — need the same notion of "which fixture belongs to which
 * lesson" and "have these two drifted apart", so it lives here once.
 */
import fs from "fs";
import path from "path";
import { createHash } from "crypto";
import type { PrismaClient } from "@prisma/client";

export const FIXTURES_DIR = path.join(__dirname, "../../prisma/fixtures");

/** Lessons are matched to fixtures by position, never by database id. */
export function lessonKey(chapterOrder: number, lessonOrder: number): string {
  return `${chapterOrder}:${lessonOrder}`;
}

/**
 * Key-order-independent serialization, so a fixture written by a different
 * JSON serializer never registers as a content change.
 */
export function stableJson(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(stableJson).join(",")}]`;
  if (value && typeof value === "object") {
    const object = value as Record<string, unknown>;
    return `{${Object.keys(object).sort().map((key) => `${JSON.stringify(key)}:${stableJson(object[key])}`).join(",")}}`;
  }
  return JSON.stringify(value);
}

export type FixtureEntry = {
  filename: string;
  content: Record<string, unknown>;
};

/**
 * Every fixture on disk, indexed by the (chapter, lesson) position declared in
 * its own `_meta`. Files without that metadata cannot be matched to a lesson.
 */
export function readFixtureIndex(): {
  byLesson: Map<string, FixtureEntry>;
  unmatched: string[];
} {
  const byLesson = new Map<string, FixtureEntry>();
  const unmatched: string[] = [];

  for (const filename of fs.readdirSync(FIXTURES_DIR).filter((name) => name.endsWith(".json"))) {
    const content = JSON.parse(fs.readFileSync(path.join(FIXTURES_DIR, filename), "utf8")) as Record<string, unknown>;
    const meta = content?._meta as Record<string, unknown> | undefined;
    const chapterOrder = Number(meta?.chapter_order);
    const lessonOrder = Number(meta?.lesson_order);
    if (Number.isFinite(chapterOrder) && Number.isFinite(lessonOrder)) {
      byLesson.set(lessonKey(chapterOrder, lessonOrder), { filename, content });
    } else {
      unmatched.push(filename);
    }
  }

  return { byLesson, unmatched };
}

const TEMPLATE_SUFFIX: Record<string, string> = {
  STANDARD: "",
  SPOKEN_PHRASES: "-spoken-phrases",
  REVIEW: "-review",
  VERB_PATTERN: "-verb-pattern",
};

/**
 * Filename for a lesson that has no fixture yet (authored in Studio).
 *
 * Existing fixtures keep whatever name they already have — the suffix
 * convention was applied inconsistently across the original 391 files, and
 * renaming them would churn the entire content history for no benefit.
 */
export function deriveFixtureFilename(chapterOrder: number, lessonOrder: number, template: string): string {
  const pad = (value: number) => String(value).padStart(2, "0");
  return `chapter-${pad(chapterOrder)}-lesson-${pad(lessonOrder)}${TEMPLATE_SUFFIX[template] ?? ""}.json`;
}

/**
 * The exact bytes a fixture file should contain for a given lesson.
 *
 * `_meta.chapter_order` / `_meta.lesson_order` are what make a fixture
 * round-trippable, so they are stamped on the way out — a lesson created in
 * Studio has no reason to carry them, and without them the file could never be
 * matched back to its lesson.
 */
/**
 * The lesson object in its canonical fixture shape, with the position metadata
 * stamped on. Both the file writer and the hasher build on this, so a hash
 * always means "this content" rather than "this file's byte layout".
 */
export function normalizeForFixture(
  content: unknown,
  chapterOrder: number,
  lessonOrder: number,
): Record<string, unknown> {
  const lesson = { ...(content as Record<string, unknown> ?? {}) };
  const meta = { ...(lesson._meta as Record<string, unknown> ?? {}) };
  meta.chapter_order = chapterOrder;
  meta.lesson_order = lessonOrder;
  lesson._meta = meta;
  return lesson;
}

export function serializeFixture(
  content: unknown,
  chapterOrder: number,
  lessonOrder: number,
): string {
  return `${JSON.stringify(normalizeForFixture(content, chapterOrder, lessonOrder), null, 2)}\n`;
}

export type DbLesson = {
  id: string;
  chapterOrder: number;
  lessonOrder: number;
  template: string;
  title: string;
  content: unknown;
};

/** Every lesson in the database, resolved to its (chapter, lesson) position. */
export async function readDbLessons(prisma: PrismaClient): Promise<DbLesson[]> {
  const chapters = await prisma.chapter.findMany({ select: { id: true, order: true } });
  const chapterOrderById = new Map(chapters.map((chapter) => [chapter.id, chapter.order]));

  const lessons = await prisma.lesson.findMany({
    select: { id: true, chapterId: true, order: true, template: true, title: true, content: true },
  });

  return lessons
    // A lesson whose chapter is missing has no position, so it has no fixture.
    .flatMap((lesson): DbLesson[] => {
      const chapterOrder = chapterOrderById.get(lesson.chapterId);
      if (chapterOrder === undefined) return [];
      return [{
        id: lesson.id,
        chapterOrder,
        lessonOrder: lesson.order,
        template: String(lesson.template),
        title: lesson.title,
        content: lesson.content,
      }];
    })
    .sort((a, b) => a.chapterOrder - b.chapterOrder || a.lessonOrder - b.lessonOrder);
}

/**
 * Hash of a lesson in its canonical fixture form.
 *
 * Both sides are normalized through `serializeFixture` first, so a hash means
 * "this content", not "this file's byte layout".
 */
export function contentHash(content: unknown, chapterOrder: number, lessonOrder: number): string {
  const canonical = stableJson(normalizeForFixture(content, chapterOrder, lessonOrder));
  return createHash("sha256").update(canonical, "utf8").digest("hex");
}

export const BASELINE_PATH = path.join(__dirname, "../../prisma/lesson-sync-baseline.json");

export type Baseline = {
  version: 1;
  /** When the baseline was last written, for operator context only. */
  updatedAt: string;
  /** lessonKey -> contentHash at the last point the two sides agreed. */
  lessons: Record<string, string>;
};

export function readBaseline(): Baseline | null {
  if (!fs.existsSync(BASELINE_PATH)) return null;
  try {
    const parsed = JSON.parse(fs.readFileSync(BASELINE_PATH, "utf8")) as Baseline;
    return parsed?.version === 1 && parsed.lessons ? parsed : null;
  } catch {
    return null;
  }
}

/**
 * Persist the agreed hashes, but only when they actually changed.
 *
 * A no-op export or sync should not produce a Git diff whose only content is a
 * new timestamp -- that trains reviewers to ignore this file.
 */
export function writeBaseline(lessons: Record<string, string>): boolean {
  const existing = readBaseline();
  if (existing && stableJson(existing.lessons) === stableJson(lessons)) return false;

  const baseline: Baseline = { version: 1, updatedAt: new Date().toISOString(), lessons };
  fs.writeFileSync(BASELINE_PATH, `${JSON.stringify(baseline, null, 2)}\n`, "utf8");
  return true;
}

export type SyncState =
  /** Database and fixture agree. */
  | "in_sync"
  /** Fixture was edited in Git since the last agreement - safe to push. */
  | "fixture_ahead"
  /** Studio wrote to the database since the last agreement - must export. */
  | "db_ahead"
  /** Both sides moved independently - needs a human. */
  | "conflict"
  /** Lesson exists in the database with no fixture file. */
  | "missing_fixture"
  /** Fixture file whose lesson is gone from the database. */
  | "orphan_fixture"
  /** They differ, but no baseline says which side moved. */
  | "unknown";

export type LessonSyncRecord = {
  state: SyncState;
  key: string;
  filename: string;
  label: string;
  /** Canonical hash of the database side, absent for an orphan fixture. */
  dbHash?: string;
};

/**
 * Classify every lesson as in-sync, safe to push, needing export, or conflicted.
 *
 * Content alone cannot say which side is newer - that is what the baseline is
 * for. It records the hash at the last point the database and the fixture
 * mirror agreed, so a later difference can be attributed to whichever side
 * actually moved. Without it, a guard either blocks every legitimate push or
 * silently lets one side overwrite the other.
 */
export function classifyLessons(
  lessons: DbLesson[],
  fixtures: Map<string, FixtureEntry>,
  baseline: Baseline | null,
): LessonSyncRecord[] {
  const records: LessonSyncRecord[] = [];
  const matched = new Set<string>();

  for (const lesson of lessons) {
    const key = lessonKey(lesson.chapterOrder, lesson.lessonOrder);
    const label = `ch${lesson.chapterOrder} l${lesson.lessonOrder} - ${lesson.title}`;
    const dbHash = contentHash(lesson.content, lesson.chapterOrder, lesson.lessonOrder);
    const fixture = fixtures.get(key);

    if (!fixture) {
      records.push({
        state: "missing_fixture",
        key,
        filename: deriveFixtureFilename(lesson.chapterOrder, lesson.lessonOrder, lesson.template),
        label,
        dbHash,
      });
      continue;
    }

    matched.add(fixture.filename);
    const fixtureHash = contentHash(fixture.content, lesson.chapterOrder, lesson.lessonOrder);
    const base = baseline?.lessons[key];

    let state: SyncState;
    if (dbHash === fixtureHash) state = "in_sync";
    else if (base === undefined) state = "unknown";
    else if (base === dbHash) state = "fixture_ahead";
    else if (base === fixtureHash) state = "db_ahead";
    else state = "conflict";

    records.push({ state, key, filename: fixture.filename, label, dbHash });
  }

  for (const [key, fixture] of fixtures) {
    if (!matched.has(fixture.filename)) {
      records.push({ state: "orphan_fixture", key, filename: fixture.filename, label: fixture.filename });
    }
  }

  return records;
}

/** Group records by state, for reporting. */
export function byState(records: LessonSyncRecord[]): Record<SyncState, LessonSyncRecord[]> {
  const grouped = {
    in_sync: [], fixture_ahead: [], db_ahead: [], conflict: [],
    missing_fixture: [], orphan_fixture: [], unknown: [],
  } as Record<SyncState, LessonSyncRecord[]>;
  for (const record of records) grouped[record.state].push(record);
  return grouped;
}
