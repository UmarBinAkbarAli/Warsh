export function getPKTDateString(date: Date) {
  const utc = date.getTime() + date.getTimezoneOffset() * 60000;
  const pktTime = new Date(utc + 5 * 60 * 60 * 1000);
  return pktTime.toISOString().slice(0, 10);
}

export function getPKTStartOfDay(date: Date) {
  const utc = date.getTime() + date.getTimezoneOffset() * 60000;
  const pktTime = new Date(utc + 5 * 60 * 60 * 1000);
  pktTime.setHours(0, 0, 0, 0);
  return pktTime;
}

export function isTodayPKT(date: Date) {
  return getPKTDateString(date) === getPKTDateString(new Date());
}

export function isYesterdayPKT(date: Date) {
  const utc = date.getTime() + date.getTimezoneOffset() * 60000;
  const pktToday = new Date(utc + 5 * 60 * 60 * 1000);
  pktToday.setHours(0, 0, 0, 0);
  const yesterday = new Date(pktToday);
  yesterday.setDate(pktToday.getDate() - 1);
  return getPKTDateString(date) === yesterday.toISOString().slice(0, 10);
}
