const DAY_MS = 24 * 60 * 60 * 1000;

/** Truncate to a date-only value (local midnight) so day comparisons are exact. */
export function dateOnly(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

export function addDays(d: Date, days: number): Date {
  const copy = new Date(d);
  copy.setDate(copy.getDate() + days);
  return copy;
}

export function diffDays(a: Date, b: Date): number {
  return Math.round((dateOnly(a).getTime() - dateOnly(b).getTime()) / DAY_MS);
}

export function isSameDay(a: Date, b: Date): boolean {
  return diffDays(a, b) === 0;
}

const WEEKDAY_SHORT = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];
const MONTH_SHORT = [
  "JAN", "FEB", "MAR", "APR", "MAY", "JUN",
  "JUL", "AUG", "SEP", "OCT", "NOV", "DEC",
];

/** 1 = Monday ... 7 = Sunday */
export function isoWeekday(d: Date): number {
  const day = d.getDay();
  return day === 0 ? 7 : day;
}

export function weekdayShort(d: Date): string {
  return WEEKDAY_SHORT[isoWeekday(d) - 1];
}

export function monthShort(d: Date): string {
  return MONTH_SHORT[d.getMonth()];
}

export function formatMonthDay(d: Date): string {
  return `${monthShort(d)} ${String(d.getDate()).padStart(2, "0")}`;
}

export function formatLongDate(d: Date): string {
  const weekday = [
    "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday",
  ][d.getDay()];
  return `${weekday}, ${monthShort(d)[0]}${monthShort(d).slice(1).toLowerCase()} ${d.getDate()}`;
}

/** YYYY-MM-DD in local time, used as the URL-safe day identifier. */
export function toDateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function fromDateKey(key: string): Date {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d);
}
