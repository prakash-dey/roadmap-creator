const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Snap any instant to the nearest UTC midnight. Calendar dates in this app are
 * stored as `DateTime` columns; older imports wrote them at the server's *local*
 * midnight, newer ones at true UTC midnight. Rounding to the nearest day makes
 * both resolve to the calendar day the user actually meant, for any timezone
 * within ±12h of UTC, and makes every derived label timezone-independent.
 */
function snapToUtcDay(d: Date): Date {
  return new Date(Math.round(d.getTime() / DAY_MS) * DAY_MS);
}

/** Truncate to a date-only value (UTC midnight) so day comparisons are exact. */
export function dateOnly(d: Date): Date {
  return snapToUtcDay(d);
}

export function addDays(d: Date, days: number): Date {
  return new Date(snapToUtcDay(d).getTime() + days * DAY_MS);
}

export function diffDays(a: Date, b: Date): number {
  return Math.round((snapToUtcDay(a).getTime() - snapToUtcDay(b).getTime()) / DAY_MS);
}

export function isSameDay(a: Date, b: Date): boolean {
  return diffDays(a, b) === 0;
}

const WEEKDAY_SHORT = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];
const WEEKDAY_LONG = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const MONTH_SHORT = [
  "JAN", "FEB", "MAR", "APR", "MAY", "JUN",
  "JUL", "AUG", "SEP", "OCT", "NOV", "DEC",
];

/** 1 = Monday ... 7 = Sunday */
export function isoWeekday(d: Date): number {
  const day = snapToUtcDay(d).getUTCDay();
  return day === 0 ? 7 : day;
}

export function weekdayShort(d: Date): string {
  return WEEKDAY_SHORT[isoWeekday(d) - 1];
}

export function monthShort(d: Date): string {
  return MONTH_SHORT[snapToUtcDay(d).getUTCMonth()];
}

/** Calendar day-of-month (1..31). */
export function dayOfMonth(d: Date): number {
  return snapToUtcDay(d).getUTCDate();
}

export function formatMonthDay(d: Date): string {
  return `${monthShort(d)} ${String(dayOfMonth(d)).padStart(2, "0")}`;
}

export function formatLongDate(d: Date): string {
  const weekday = WEEKDAY_LONG[snapToUtcDay(d).getUTCDay()];
  const month = monthShort(d);
  return `${weekday}, ${month[0]}${month.slice(1).toLowerCase()} ${dayOfMonth(d)}`;
}

/** YYYY-MM-DD (UTC), used as the URL-safe day identifier. */
export function toDateKey(d: Date): string {
  const s = snapToUtcDay(d);
  const y = s.getUTCFullYear();
  const m = String(s.getUTCMonth() + 1).padStart(2, "0");
  const day = String(s.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function fromDateKey(key: string): Date {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}
