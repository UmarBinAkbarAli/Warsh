import { test } from "node:test";
import assert from "node:assert/strict";
import { buildChapterStates, PROGRESS_STATUS } from "../lib/course";
import { buildLessonFlags, buildLessonNotices } from "../lib/lessonNotices";

const day = (n: number) => new Date(Date.UTC(2026, 8, n));
const { COMPLETED, SKIPPED_BY_PLACEMENT } = PROGRESS_STATUS;

function lesson(id: string, extra: { addedAt?: Date; contentUpdatedAt?: Date } = {}) {
  return { id, title: id, titleUr: null, titleAr: id, template: "STANDARD", xpReward: 10, ...extra };
}

function chapter(id: string, order: number, lessons: ReturnType<typeof lesson>[]) {
  return {
    id, order, title: id, titleUr: null, titleAr: id, description: "", descriptionUr: null,
    worldMapX: 0, worldMapY: 0, lessons,
  };
}

function state(chapters: ReturnType<typeof chapter>[], rows: [string, string, Date][]) {
  const progressStatusByLessonId = new Map(rows.map(([id, status]) => [id, status]));
  const finishedAtByLessonId = new Map(rows.map(([id, , at]) => [id, at]));
  const chapterStates = buildChapterStates(chapters, progressStatusByLessonId, finishedAtByLessonId);
  return {
    chapters,
    chapterStates,
    chapterStateById: new Map(chapterStates.map((s) => [s.id, s])),
    progressStatusByLessonId,
    finishedAtByLessonId,
  };
}

test("a lesson added after the learner finished a chapter does not lock the next one", () => {
  const course = state(
    [
      chapter("c1", 1, [lesson("a"), lesson("b"), lesson("new", { addedAt: day(20) })]),
      chapter("c2", 2, [lesson("c")]),
    ],
    [["a", COMPLETED, day(10)], ["b", COMPLETED, day(11)]],
  );
  const [c1, c2] = course.chapterStates;
  assert.equal(c1.isCompleted, false, "chapter honestly reads 2/3");
  assert.equal(c1.isSatisfied, true);
  assert.deepEqual(c1.addedAfterFinishLessonIds, ["new"]);
  assert.equal(c2.isLocked, false);
});

test("mid-chapter learners stay locked, even when a new lesson lands", () => {
  const course = state(
    [
      chapter("c1", 1, [lesson("a"), lesson("b"), lesson("new", { addedAt: day(20) })]),
      chapter("c2", 2, [lesson("c")]),
    ],
    [["a", COMPLETED, day(10)]],
  );
  assert.equal(course.chapterStates[0].isSatisfied, false);
  assert.equal(course.chapterStates[1].isLocked, true);
});

test("a lesson live before the learner's last finish still blocks", () => {
  const course = state(
    [chapter("c1", 1, [lesson("a"), lesson("b", { addedAt: day(5) })]), chapter("c2", 2, [lesson("c")])],
    [["a", COMPLETED, day(10)]],
  );
  assert.equal(course.chapterStates[1].isLocked, true);
});

test("lessons without addedAt always count as part of the chapter", () => {
  const course = state(
    [chapter("c1", 1, [lesson("a"), lesson("b")]), chapter("c2", 2, [lesson("c")])],
    [["a", COMPLETED, day(10)]],
  );
  assert.equal(course.chapterStates[1].isLocked, true);
});

test("the new lesson is announced once, then stays badged until completed", () => {
  const course = state(
    [chapter("c1", 1, [lesson("a"), lesson("new", { addedAt: day(20) })])],
    [["a", COMPLETED, day(10)]],
  );
  const notices = buildLessonNotices(course, null);
  assert.equal(notices.length, 1);
  assert.equal(notices[0].kind, "new");
  assert.equal(notices[0].lessonId, "new");
  assert.equal(buildLessonNotices(course, day(21)).length, 0);
  assert.equal(buildLessonFlags(course, day(30)).get("new")?.isNew, true);
});

test("a backfilled (skipped) lesson in a finished chapter is announced as new", () => {
  const course = state(
    [chapter("c1", 1, [lesson("a"), lesson("lab", { addedAt: day(20) })])],
    [["a", COMPLETED, day(10)], ["lab", SKIPPED_BY_PLACEMENT, day(20)]],
  );
  assert.deepEqual(buildLessonNotices(course, null).map((n) => n.kind), ["new"]);
});

test("placement-skipped chapters never announce new lessons", () => {
  const course = state(
    [chapter("c1", 1, [lesson("a"), lesson("lab", { addedAt: day(20) })])],
    [["a", SKIPPED_BY_PLACEMENT, day(10)], ["lab", SKIPPED_BY_PLACEMENT, day(21)]],
  );
  assert.equal(buildLessonNotices(course, null).length, 0);
});

test("an edit to a completed lesson is announced as updated", () => {
  const course = state(
    [chapter("c1", 1, [lesson("a", { contentUpdatedAt: day(20) }), lesson("b", { contentUpdatedAt: day(20) })])],
    [["a", COMPLETED, day(10)], ["b", COMPLETED, day(22)]],
  );
  const notices = buildLessonNotices(course, null);
  assert.deepEqual(notices.map((n) => [n.kind, n.lessonId]), [["updated", "a"]]);
  assert.equal(buildLessonFlags(course, day(25)).get("a")?.isUpdated, true);
  assert.equal(buildLessonFlags(course, day(25 + 14)).get("a")?.isUpdated, false);
});
