const WEEKDAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"] as const;
const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
] as const;

export function isIsoDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
}

export function civilWeekday(isoDate: string): number {
  const [year, month, day] = isoDate.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day)).getUTCDay();
}

export function addDays(isoDate: string, days: number): string {
  const [year, month, day] = isoDate.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

/** Monday-start week containing the civil date. */
export function startOfWeekMonday(isoDate: string): string {
  const weekday = civilWeekday(isoDate);
  const delta = weekday === 0 ? -6 : 1 - weekday;
  return addDays(isoDate, delta);
}

export function weekDates(isoDate: string): string[] {
  const start = startOfWeekMonday(isoDate);
  return Array.from({ length: 7 }, (_, index) => addDays(start, index));
}

export function formatCivilDate(isoDate: string, withWeekday = true): string {
  const [year, month, day] = isoDate.split("-").map(Number);
  const weekday = WEEKDAY_NAMES[civilWeekday(isoDate)];
  const body = `${MONTH_NAMES[month - 1]} ${day}, ${year}`;
  return withWeekday ? `${weekday}, ${body}` : body;
}

export function weekdayShort(isoDate: string): string {
  return WEEKDAY_NAMES[civilWeekday(isoDate)].slice(0, 3).toUpperCase();
}

export function dayNumber(isoDate: string): number {
  return Number(isoDate.slice(8, 10));
}

export function civilToday(timeZone: string, now = new Date()): string {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
  const year = parts.find((part) => part.type === "year")?.value;
  const month = parts.find((part) => part.type === "month")?.value;
  const day = parts.find((part) => part.type === "day")?.value;
  return `${year}-${month}-${day}`;
}

export function greetingFor(timeZone: string, now = new Date()): string {
  const hour = Number(
    new Intl.DateTimeFormat("en-US", { timeZone, hour: "numeric", hourCycle: "h23" })
      .formatToParts(now)
      .find((part) => part.type === "hour")?.value ?? "0",
  );
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

function timeZoneOffsetMs(instant: Date, timeZone: string): number {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hour12: false,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).formatToParts(instant);
  const pick = (type: string) => Number(parts.find((part) => part.type === type)?.value);
  const hour = pick("hour") % 24;
  const asUtc = Date.UTC(pick("year"), pick("month") - 1, pick("day"), hour, pick("minute"), pick("second"));
  return asUtc - instant.getTime();
}

/** Convert a civil date and local HH:mm to a UTC instant. Returns null when the clock time does not exist. */
export function zonedLocalToUtc(isoDate: string, hhmm: string, timeZone: string): Date | null {
  if (!isIsoDate(isoDate) || !/^\d{2}:\d{2}$/.test(hhmm)) return null;
  const [year, month, day] = isoDate.split("-").map(Number);
  const [hour, minute] = hhmm.split(":").map(Number);
  const guess = new Date(Date.UTC(year, month - 1, day, hour, minute, 0));
  const offset = timeZoneOffsetMs(guess, timeZone);
  let utc = new Date(guess.getTime() - offset);
  const offset2 = timeZoneOffsetMs(utc, timeZone);
  if (offset !== offset2) utc = new Date(guess.getTime() - offset2);
  const check = civilToday(timeZone, utc);
  const shownHour = Number(
    new Intl.DateTimeFormat("en-US", { timeZone, hour: "numeric", hourCycle: "h23" })
      .formatToParts(utc)
      .find((part) => part.type === "hour")?.value ?? "-1",
  ) % 24;
  if (check !== isoDate || shownHour !== hour) return null;
  return utc;
}

export function formatClock(hhmm: string | null, end: string | null = null): string {
  if (!hhmm) return "Time not specified";
  const start = formatOneClock(hhmm);
  if (!end) return start;
  return `${start}–${formatOneClock(end)}`;
}

function formatOneClock(hhmm: string): string {
  const [hourRaw, minuteRaw] = hhmm.split(":").map(Number);
  const suffix = hourRaw >= 12 ? "PM" : "AM";
  const hour = hourRaw % 12 || 12;
  if (minuteRaw === 0) return `${hour} ${suffix}`;
  return `${hour}:${String(minuteRaw).padStart(2, "0")} ${suffix}`;
}

export function daysBetween(earlier: string, later: string): number {
  const [ay, am, ad] = earlier.split("-").map(Number);
  const [by, bm, bd] = later.split("-").map(Number);
  const a = Date.UTC(ay, am - 1, ad);
  const b = Date.UTC(by, bm - 1, bd);
  return Math.round((b - a) / 86_400_000);
}

export function monthKey(isoDate: string): string {
  return isoDate.slice(0, 7);
}

export function daysInMonth(month: string): string[] {
  const [year, monthNumber] = month.split("-").map(Number);
  const cursor = new Date(Date.UTC(year, monthNumber - 1, 1));
  const dates: string[] = [];
  while (cursor.getUTCMonth() === monthNumber - 1) {
    dates.push(cursor.toISOString().slice(0, 10));
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }
  return dates;
}

export { MONTH_NAMES, WEEKDAY_NAMES };
