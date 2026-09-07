/**
 * Quranic Core 500 — shared domain rules.
 *
 * The 500 most frequent words in the Quran, taught five at a time. Progress is
 * expressed as *Quran coverage* rather than a word count (product decision
 * 2026-09-07): coverage is front-loaded, so the first 25 words already account
 * for roughly 37% of the words in the Quran, which is far more motivating than
 * "25 of 500" and is literally true.
 *
 * Source data and the frequency verification live in `Docs/quranic-core-500.md`.
 */

/** Words per set. Matches the five-word groups the product spec settled on. */
export const CORE_SET_SIZE = 5;

/** Ranks run 1..500 with no gaps; verified against the corpus. */
export const CORE_WORD_COUNT = 500;

export const CORE_SET_COUNT = CORE_WORD_COUNT / CORE_SET_SIZE; // 100

/**
 * Total morphological segments in the Quran (Quranic Arabic Corpus v0.4).
 * The 500 words cover 103,162 of these — the ~80% claim, which checks out.
 * This is the denominator for every coverage figure we show.
 */
export const QURAN_TOTAL_SEGMENTS = 130030;

/**
 * A Core 500 word counts as "known" once the learner has cleared it at least
 * once in a set. Note this is deliberately looser than the `repetitions >= 3`
 * that Tadabbur uses for "mastered" — coverage answers "have you met this
 * word", not "have you retained it".
 */
export const CORE_KNOWN_MIN_REPETITIONS = 1;

/** Set 1 holds ranks 1-5, set 2 holds 6-10, and so on. */
export function setNumberForRank(rank: number): number {
  return Math.floor((rank - 1) / CORE_SET_SIZE) + 1;
}

/** Inclusive rank range covered by a set. */
export function rankRangeForSet(setNumber: number): { first: number; last: number } {
  const first = (setNumber - 1) * CORE_SET_SIZE + 1;
  return { first, last: first + CORE_SET_SIZE - 1 };
}

/**
 * Share of the Quran's words the learner can now read, to one decimal place.
 * `knownFrequencySum` is the total occurrence count of the words they know.
 */
export function coveragePercent(knownFrequencySum: number): number {
  if (knownFrequencySum <= 0) return 0;
  const pct = (knownFrequencySum / QURAN_TOTAL_SEGMENTS) * 100;
  return Math.round(pct * 10) / 10;
}

/**
 * A set is unlocked when every earlier set is complete. Set 1 is always open,
 * so a brand-new learner has somewhere to start.
 */
export function isSetUnlocked(setNumber: number, completedSets: ReadonlySet<number>): boolean {
  if (setNumber <= 1) return true;
  for (let n = 1; n < setNumber; n += 1) {
    if (!completedSets.has(n)) return false;
  }
  return true;
}

/** The first set the learner has not finished — where "Continue" sends them. */
export function nextSetNumber(completedSets: ReadonlySet<number>): number | null {
  for (let n = 1; n <= CORE_SET_COUNT; n += 1) {
    if (!completedSets.has(n)) return n;
  }
  return null;
}
