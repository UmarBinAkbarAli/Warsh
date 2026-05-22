const PKT_OFFSET_MS = 5 * 60 * 60 * 1000;

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

const DAY_MS = 24 * 60 * 60 * 1000;

export function get4amPKTBoundary(): Date {
  const pktMidnight = getPKTStartOfDay(new Date());
  const fourAmPkt = new Date(pktMidnight.getTime() + 4 * 60 * 60 * 1000);
  return new Date() >= fourAmPkt ? fourAmPkt : new Date(fourAmPkt.getTime() - DAY_MS);
}
