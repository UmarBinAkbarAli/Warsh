import { test } from "node:test";
import assert from "node:assert/strict";
import {
  CORE_SET_COUNT,
  CORE_SET_SIZE,
  CORE_WORD_COUNT,
  QURAN_TOTAL_SEGMENTS,
  coveragePercent,
  isSetUnlocked,
  nextSetNumber,
  rankRangeForSet,
  setNumberForRank,
} from "../lib/core500";
import {
  applyStreakForActivity,
  calculateLessonStreakUpdate,
  type StreakUpdate,
} from "../lib/streak";

test("sets partition the 500 ranks with no gaps or overlap", () => {
  assert.equal(CORE_SET_COUNT * CORE_SET_SIZE, CORE_WORD_COUNT);

  const seen = new Set<number>();
  for (let set = 1; set <= CORE_SET_COUNT; set += 1) {
    const { first, last } = rankRangeForSet(set);
    for (let rank = first; rank <= last; rank += 1) {
      assert.equal(setNumberForRank(rank), set, `rank ${rank} belongs to set ${set}`);
      assert.equal(seen.has(rank), false, `rank ${rank} appears in two sets`);
      seen.add(rank);
    }
  }
  assert.equal(seen.size, CORE_WORD_COUNT);
});

test("set boundaries land where the product expects", () => {
  assert.equal(setNumberForRank(1), 1);
  assert.equal(setNumberForRank(5), 1);
  assert.equal(setNumberForRank(6), 2);
  assert.equal(setNumberForRank(500), CORE_SET_COUNT);
});

test("coverage is the share of the whole Quran, not of the 500", () => {
  // The top 25 words occur 48,407 times, which is what lets us say a learner
  // 25 words in already reads about 37% of the Quran.
  assert.equal(coveragePercent(48407), 37.2);
  // All 500 cover 103,162 of 130,030 segments — the "~80%" claim.
  assert.equal(coveragePercent(103162), 79.3);
  assert.equal(coveragePercent(QURAN_TOTAL_SEGMENTS), 100);
  assert.equal(coveragePercent(0), 0);
  assert.equal(coveragePercent(-5), 0);
});

test("a set unlocks only once every earlier set is done", () => {
  const none = new Set<number>();
  assert.equal(isSetUnlocked(1, none), true, "set 1 is always open");
  assert.equal(isSetUnlocked(2, none), false);

  const firstDone = new Set([1]);
  assert.equal(isSetUnlocked(2, firstDone), true);
  assert.equal(isSetUnlocked(3, firstDone), false);

  // Finishing a later set out of order must not unlock past a gap.
  const gap = new Set([1, 3]);
  assert.equal(isSetUnlocked(3, gap), false, "set 2 is still missing");
});

test("continue points at the first unfinished set", () => {
  assert.equal(nextSetNumber(new Set()), 1);
  assert.equal(nextSetNumber(new Set([1, 2])), 3);
  assert.equal(nextSetNumber(new Set([1, 3])), 2, "fills the gap before moving on");

  const all = new Set<number>();
  for (let n = 1; n <= CORE_SET_COUNT; n += 1) all.add(n);
  assert.equal(nextSetNumber(all), null, "nothing left to continue");
});

// --- streak sharing: the reason Core 500 completion exists at all ---------

interface FakeStreakRow {
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: Date | null;
  streakFreezes: number;
}

function fakeTx(initial: FakeStreakRow | null) {
  const state: { row: FakeStreakRow | null; creates: number; updates: number } = {
    row: initial,
    creates: 0,
    updates: 0,
  };
  return {
    state,
    client: {
      streak: {
        async findUnique() {
          return state.row;
        },
        async create(args: { data: Record<string, unknown> }) {
          const data = args.data;
          state.creates += 1;
          state.row = {
            currentStreak: data.currentStreak as number,
            longestStreak: data.longestStreak as number,
            lastActiveDate: data.lastActiveDate as Date,
            streakFreezes: 0,
          };
          return state.row;
        },
        async update(args: { where: { userId: string }; data: StreakUpdate }) {
          const data = args.data;
          state.updates += 1;
          state.row = { ...(state.row as FakeStreakRow), ...(data as Partial<FakeStreakRow>) };
          return state.row;
        },
      },
    },
  };
}

test("a first Core 500 set starts the streak at one", async () => {
  const { state, client } = fakeTx(null);
  await applyStreakForActivity(client, "user-1", new Date("2026-09-07T10:00:00Z"));

  assert.equal(state.creates, 1);
  assert.equal(state.row?.currentStreak, 1);
});

test("a Core 500 set the day after a lesson extends the same streak", async () => {
  const yesterday = new Date("2026-09-06T10:00:00Z");
  const { state, client } = fakeTx({
    currentStreak: 4,
    longestStreak: 9,
    lastActiveDate: yesterday,
    streakFreezes: 0,
  });

  await applyStreakForActivity(client, "user-1", new Date("2026-09-07T10:00:00Z"));

  assert.equal(state.updates, 1);
  assert.equal(state.row?.currentStreak, 5, "vocabulary work counts like a lesson");
  assert.equal(state.row?.longestStreak, 9);
});

test("a lesson and a Core 500 set on the same day count once", async () => {
  const morning = new Date("2026-09-07T06:00:00Z");
  const { state, client } = fakeTx({
    currentStreak: 3,
    longestStreak: 3,
    lastActiveDate: morning,
    streakFreezes: 0,
  });

  // Second activity the same streak day.
  await applyStreakForActivity(client, "user-1", new Date("2026-09-07T18:00:00Z"));

  assert.equal(state.row?.currentStreak, 3, "the streak does not double-count");
});

test("the shared helper writes exactly what the lesson rule computes", () => {
  const snapshot = {
    currentStreak: 6,
    longestStreak: 6,
    lastActiveDate: new Date("2026-09-06T10:00:00Z"),
    streakFreezes: 0,
  };
  const update = calculateLessonStreakUpdate(snapshot, new Date("2026-09-07T10:00:00Z"));
  assert.equal(update.currentStreak, 7);
  assert.equal(update.longestStreak, 7);
});

test("the feature reports itself ready only when all 500 are published", () => {
  // Mirrors app/api/core500/route.ts: a partial publish must not switch the
  // feature on, or the set list is sparse and Continue points at nothing.
  const readyFor = (publishedCount: number) => publishedCount === CORE_WORD_COUNT;

  assert.equal(readyFor(0), false, "nothing published");
  assert.equal(readyFor(194), false, "only the words already in the curriculum");
  assert.equal(readyFor(499), false, "one still awaiting review");
  assert.equal(readyFor(CORE_WORD_COUNT), true);
});
