const KEY_RE = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Validate a client-supplied IANA timezone name (from the `tz` cookie set by
 * <TimeZoneSync>), falling back to UTC when it is missing or unrecognised.
 */
export function resolveTimeZone(raw: string | undefined | null): string {
  if (!raw) return "UTC";
  let value = raw;
  try {
    value = decodeURIComponent(raw);
  } catch {
    /* keep raw */
  }
  try {
    new Intl.DateTimeFormat("en-CA", { timeZone: value });
    return value;
  } catch {
    return "UTC";
  }
}

/** Current calendar date ("YYYY-MM-DD") in the given timezone. */
export function todayKeyInTimeZone(tz: string): string {
  try {
    const key = new Intl.DateTimeFormat("en-CA", {
      timeZone: tz,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(new Date());
    if (KEY_RE.test(key)) return key;
  } catch {
    /* fall through */
  }
  return new Date().toISOString().slice(0, 10);
}

/** 1-based index of `todayKey` within a program that starts on `startKey`. */
export function dayIndexFromKeys(startKey: string, todayKey: string): number {
  const start = Date.parse(`${startKey}T00:00:00Z`);
  const today = Date.parse(`${todayKey}T00:00:00Z`);
  if (Number.isNaN(start) || Number.isNaN(today)) return 1;
  return Math.round((today - start) / 86_400_000) + 1;
}
