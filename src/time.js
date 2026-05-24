// All timestamps are stored as Bangkok-local ISO strings with explicit +07:00
// offset (e.g. "2026-05-24T15:30:00.000+07:00"). Because every row uses the
// same offset, lexicographic comparison in SQLite gives correct chronological
// order, and `substr(clicked_at, 1, 10)` yields the Bangkok calendar day.

const BANGKOK_OFFSET_MS = 7 * 60 * 60 * 1000;
const BANGKOK_OFFSET_SUFFIX = '+07:00';

export function bangkokNowIso() {
  const shifted = new Date(Date.now() + BANGKOK_OFFSET_MS);
  return shifted.toISOString().replace('Z', BANGKOK_OFFSET_SUFFIX);
}

export function bangkokIsoDaysAgo(days) {
  const shifted = new Date(Date.now() + BANGKOK_OFFSET_MS - days * 24 * 60 * 60 * 1000);
  return shifted.toISOString().replace('Z', BANGKOK_OFFSET_SUFFIX);
}

export function bangkokDateString(daysAgo = 0) {
  return bangkokIsoDaysAgo(daysAgo).slice(0, 10);
}
