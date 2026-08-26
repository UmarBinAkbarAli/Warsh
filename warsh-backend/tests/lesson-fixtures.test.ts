import assert from "node:assert/strict";
import { test } from "node:test";
import {
  byState,
  classifyLessons,
  contentHash,
  deriveFixtureFilename,
  lessonKey,
  serializeFixture,
  stableJson,
  type Baseline,
  type DbLesson,
  type FixtureEntry,
} from "../scripts/lib/lesson-fixtures";

function lesson(overrides: Partial<DbLesson> = {}): DbLesson {
  return {
    id: "lesson_1",
    chapterOrder: 3,
    lessonOrder: 2,
    template: "STANDARD",
    title: "Demonstratives",
    content: { schema_version: "1.0", discover_cards: [], exercises: [] },
    ...overrides,
  };
}

function fixtureFor(target: DbLesson, filename = "chapter-03-lesson-02.json"): FixtureEntry {
  return {
    filename,
    content: JSON.parse(serializeFixture(target.content, target.chapterOrder, target.lessonOrder)),
  };
}

test("stableJson ignores key order", () => {
  assert.equal(stableJson({ a: 1, b: [2, { c: 3, d: 4 }] }), stableJson({ b: [2, { d: 4, c: 3 }], a: 1 }));
  assert.notEqual(stableJson({ a: 1 }), stableJson({ a: 2 }));
});

test("serializeFixture stamps the position metadata a fixture needs to round-trip", () => {
  const written = JSON.parse(serializeFixture({ schema_version: "1.0" }, 7, 4));
  assert.equal(written._meta.chapter_order, 7);
  assert.equal(written._meta.lesson_order, 4);
});

test("serializeFixture preserves existing _meta fields and corrects the position", () => {
  const written = JSON.parse(
    serializeFixture({ _meta: { _note: "authored by hand", chapter_order: 99, lesson_order: 99, xp_reward: 10 } }, 7, 4),
  );
  assert.equal(written._meta._note, "authored by hand");
  assert.equal(written._meta.xp_reward, 10);
  assert.equal(written._meta.chapter_order, 7);
  assert.equal(written._meta.lesson_order, 4);
});

test("serializeFixture output ends with a newline and is stable across runs", () => {
  const once = serializeFixture({ schema_version: "1.0" }, 1, 1);
  const twice = serializeFixture(JSON.parse(once), 1, 1);
  assert.match(once, /\n$/);
  assert.equal(once, twice);
});

test("deriveFixtureFilename pads the position and suffixes non-standard templates", () => {
  assert.equal(deriveFixtureFilename(1, 1, "STANDARD"), "chapter-01-lesson-01.json");
  assert.equal(deriveFixtureFilename(70, 12, "STANDARD"), "chapter-70-lesson-12.json");
  assert.equal(deriveFixtureFilename(3, 5, "SPOKEN_PHRASES"), "chapter-03-lesson-05-spoken-phrases.json");
  assert.equal(deriveFixtureFilename(9, 5, "VERB_PATTERN"), "chapter-09-lesson-05-verb-pattern.json");
  assert.equal(deriveFixtureFilename(4, 6, "REVIEW"), "chapter-04-lesson-06-review.json");
});


/** A baseline recording that the two sides agreed on this exact content. */
function baselineOf(target: DbLesson): Baseline {
  return {
    version: 1,
    updatedAt: new Date(0).toISOString(),
    lessons: {
      [lessonKey(target.chapterOrder, target.lessonOrder)]:
        contentHash(target.content, target.chapterOrder, target.lessonOrder),
    },
  };
}

const EDITED = { schema_version: "1.0", discover_cards: [{ type: "WORD" }], exercises: [] };
const EDITED_DIFFERENTLY = { schema_version: "1.0", discover_cards: [{ type: "CONCEPT" }], exercises: [] };

test("matching content is in sync regardless of baseline", () => {
  const target = lesson();
  const fixtures = new Map([[lessonKey(3, 2), fixtureFor(target)]]);
  assert.equal(classifyLessons([target], fixtures, baselineOf(target))[0].state, "in_sync");
  assert.equal(classifyLessons([target], fixtures, null)[0].state, "in_sync");
});

test("a fixture edited in Git is fixture_ahead, so a sync may publish it", () => {
  const agreed = lesson();
  const fixtures = new Map([[lessonKey(3, 2), fixtureFor(lesson({ content: EDITED }))]]);

  const records = classifyLessons([agreed], fixtures, baselineOf(agreed));
  assert.equal(records[0].state, "fixture_ahead");
});

test("a lesson edited in Studio is db_ahead, so an export is required", () => {
  const agreed = lesson();
  const edited = lesson({ content: EDITED });
  const fixtures = new Map([[lessonKey(3, 2), fixtureFor(agreed)]]);

  const records = classifyLessons([edited], fixtures, baselineOf(agreed));
  assert.equal(records[0].state, "db_ahead");
});

test("both sides moving independently is a conflict, not a silent overwrite", () => {
  const agreed = lesson();
  const editedInStudio = lesson({ content: EDITED });
  const fixtures = new Map([[lessonKey(3, 2), fixtureFor(lesson({ content: EDITED_DIFFERENTLY }))]]);

  const records = classifyLessons([editedInStudio], fixtures, baselineOf(agreed));
  assert.equal(records[0].state, "conflict");
});

test("without a baseline a difference is unattributable, never assumed safe", () => {
  const edited = lesson({ content: EDITED });
  const fixtures = new Map([[lessonKey(3, 2), fixtureFor(lesson())]]);

  const records = classifyLessons([edited], fixtures, null);
  assert.equal(records[0].state, "unknown");
});

test("a lesson created in Studio is reported as missing from the mirror", () => {
  const created = lesson({ chapterOrder: 12, lessonOrder: 1, template: "SPOKEN_PHRASES" });
  const records = classifyLessons([created], new Map(), null);
  assert.equal(records[0].state, "missing_fixture");
  assert.equal(records[0].filename, "chapter-12-lesson-01-spoken-phrases.json");
});

test("a fixture whose lesson was deleted is reported as an orphan", () => {
  const target = lesson();
  const fixtures = new Map([[lessonKey(3, 2), fixtureFor(target)]]);
  const records = classifyLessons([], fixtures, baselineOf(target));
  assert.equal(records[0].state, "orphan_fixture");
  assert.equal(records[0].filename, "chapter-03-lesson-02.json");
});

test("key order alone never counts as a difference", () => {
  const target = lesson({ content: { a: 1, b: 2 } });
  const reordered: FixtureEntry = {
    filename: "chapter-03-lesson-02.json",
    content: { b: 2, a: 1, _meta: { lesson_order: 2, chapter_order: 3 } },
  };
  const records = classifyLessons([target], new Map([[lessonKey(3, 2), reordered]]), null);
  assert.equal(records[0].state, "in_sync");
});

test("byState groups every record under its own state", () => {
  const agreed = lesson();
  const edited = lesson({ content: EDITED });
  const fixtures = new Map([[lessonKey(3, 2), fixtureFor(agreed)]]);
  const states = byState(classifyLessons([edited], fixtures, baselineOf(agreed)));

  assert.equal(states.db_ahead.length, 1);
  assert.equal(states.in_sync.length, 0);
  assert.equal(states.fixture_ahead.length, 0);
});
