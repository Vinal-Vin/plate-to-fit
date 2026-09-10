export const DAY_NAMES = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
] as const;

export const DAY_NAMES_SHORT = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;

export const GOAL_PRESETS = [
  { value: "flatten_stomach", label: "Flatten stomach" },
  { value: "build_strength", label: "Build strength" },
  { value: "general_fitness", label: "General fitness" },
  { value: "weight_loss", label: "Weight loss" },
] as const;

export function goalPresetLabel(preset: string | null): string | null {
  return GOAL_PRESETS.find((p) => p.value === preset)?.label ?? preset;
}

function toDateOnly(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

/** Format a Date as a YYYY-MM-DD string using local time (no UTC shift). */
export function formatDate(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/** Parse a YYYY-MM-DD string as a local Date (avoids UTC-parsing off-by-one). */
export function parseDate(s: string): Date {
  const [year, month, day] = s.split("-").map(Number);
  return new Date(year, month - 1, day);
}

/** Returns the Monday (as YYYY-MM-DD) of the week containing the given date. */
export function mondayOf(d: Date): string {
  const date = toDateOnly(d);
  const dow = date.getDay(); // 0 = Sunday, 1 = Monday, ...
  const diff = dow === 0 ? -6 : 1 - dow;
  date.setDate(date.getDate() + diff);
  return formatDate(date);
}

export function currentWeekStart(): string {
  return mondayOf(new Date());
}

export function addDays(dateStr: string, days: number): string {
  const date = parseDate(dateStr);
  date.setDate(date.getDate() + days);
  return formatDate(date);
}

export function addWeeks(startDate: string, weeks: number): string {
  return addDays(startDate, weeks * 7);
}

export function weekDates(startDate: string): string[] {
  return Array.from({ length: 7 }, (_, i) => addDays(startDate, i));
}

export function dayOfWeekFromDate(startDate: string, dateStr: string): number {
  const idx = weekDates(startDate).indexOf(dateStr);
  if (idx === -1) throw new Error(`${dateStr} is not in week starting ${startDate}`);
  return idx;
}

export function formatWeekRange(startDate: string): string {
  const start = parseDate(startDate);
  const end = parseDate(addDays(startDate, 6));
  const startLabel = start.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  const sameMonth = start.getMonth() === end.getMonth();
  const endLabel = end.toLocaleDateString("en-US", {
    month: sameMonth ? undefined : "short",
    day: "numeric",
    year: "numeric",
  });
  return `${startLabel} – ${endLabel}`;
}

export function formatDayHeading(dateStr: string): string {
  const date = parseDate(dateStr);
  return date.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" });
}
