const PKT_OFFSET_MS = 5 * 60 * 60 * 1000;
const STREAK_DAY_START_MS = 4 * 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;

export function getPKTDateString(date: Date) {
  return new Date(date.getTime() + PKT_OFFSET_MS).toISOString().slice(0, 10);
}

export function getPKTStartOfDay(date: Date) {
  const pktDate = getPKTDateString(date);
  const pktMidnightUtcMs = Date.parse(`${pktDate}T00:00:00.000Z`) - PKT_OFFSET_MS;
  return new Date(pktMidnightUtcMs);
}

export function isTodayPKT(date: Date) {
  return getPKTDateString(date) === getPKTDateString(new Date());
}

export function isYesterdayPKT(date: Date) {
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
  return getPKTDateString(date) === getPKTDateString(yesterday);
}

// Streak days run from 04:00 PKT through 03:59:59 PKT the following
// calendar day. Shifting an instant by PKT's UTC offset and then back by four
// hours gives a stable integer day bucket without depending on server locale.
export function getPKTStreakDayIndex(date: Date): number {
  return Math.floor(
    (date.getTime() + PKT_OFFSET_MS - STREAK_DAY_START_MS) / DAY_MS,
  );
}

export function get4amPKTBoundary(reference = new Date()): Date {
  const pktMidnight = getPKTStartOfDay(reference);
  const fourAmPkt = new Date(pktMidnight.getTime() + 4 * 60 * 60 * 1000);
  return reference >= fourAmPkt
    ? fourAmPkt
    : new Date(fourAmPkt.getTime() - DAY_MS);
}

export function getPrevious4amPKTBoundary(reference = new Date()): Date {
  return new Date(get4amPKTBoundary(reference).getTime() - DAY_MS);
}
