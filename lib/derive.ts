// Pure, environment-agnostic helpers shared by server components.
import type { Client, Item, Meeting, ItemStatus } from "./types";

// All date/time display is pinned to this timezone so it's correct regardless of
// where the code runs (e.g. Vercel's UTC servers vs. a local IST machine).
export const APP_TZ = "Asia/Kolkata";

export function todayISO(): string {
  // Calendar date (YYYY-MM-DD) in APP_TZ. en-CA formats as YYYY-MM-DD.
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: APP_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

// Hour (0-23) of an instant in APP_TZ — used for the dashboard greeting.
export function hourInAppTz(d: Date = new Date()): number {
  return Number(
    new Intl.DateTimeFormat("en-GB", {
      timeZone: APP_TZ,
      hour: "2-digit",
      hour12: false,
    }).format(d),
  );
}

// Format the time of an ISO instant in APP_TZ, e.g. "1:00 PM".
export function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("en-US", {
    timeZone: APP_TZ,
    hour: "numeric",
    minute: "2-digit",
  });
}

// Format an ISO instant in APP_TZ with custom options.
export function formatDateTime(
  iso: string,
  opts: Intl.DateTimeFormatOptions,
): string {
  return new Date(iso).toLocaleString("en-US", { timeZone: APP_TZ, ...opts });
}

// Format a date-only YYYY-MM-DD label in APP_TZ (noon-UTC anchor avoids day shifts).
export function formatDateOnly(
  ymd: string,
  opts: Intl.DateTimeFormatOptions,
): string {
  return new Date(ymd + "T12:00:00Z").toLocaleDateString("en-US", {
    timeZone: APP_TZ,
    ...opts,
  });
}

export function isToday(iso: string, today = todayISO()): boolean {
  return iso.slice(0, 10) === today;
}

// Calendar date (YYYY-MM-DD) of an absolute timestamp, in APP_TZ.
export function localDate(iso: string): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: APP_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(iso));
}

// Advance n business days (skipping Sat/Sun) from a YYYY-MM-DD date.
export function addBusinessDays(iso: string, n: number): string {
  const d = new Date(iso + "T00:00:00");
  let added = 0;
  while (added < n) {
    d.setDate(d.getDate() + 1);
    const dow = d.getDay();
    if (dow !== 0 && dow !== 6) added++;
  }
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

// Shift a YYYY-MM-DD date by n days, returned as YYYY-MM-DD.
export function addDays(iso: string, n: number): string {
  const d = new Date(iso + "T00:00:00");
  d.setDate(d.getDate() + n);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

// Monday of the week containing the given YYYY-MM-DD date.
export function startOfWeek(iso: string): string {
  const d = new Date(iso + "T00:00:00");
  const dow = (d.getDay() + 6) % 7; // 0 = Monday
  return addDays(iso, -dow);
}

// The 7 YYYY-MM-DD dates (Mon..Sun) for the week containing `iso`.
export function weekDays(iso: string): string[] {
  const mon = startOfWeek(iso);
  return Array.from({ length: 7 }, (_, i) => addDays(mon, i));
}

export function isOverdue(item: Item, today = todayISO()): boolean {
  return !!item.due_date && item.due_date < today && item.status !== "done";
}

export function isOpen(item: Item): boolean {
  return item.status !== "done";
}

const OPEN_STATUSES: ItemStatus[] = [
  "backlog",
  "in_progress",
  "blocked_on_dev",
  "in_qa",
  "waiting_on_client",
];

export function clientProgress(client: Client, items: Item[]): number {
  if (client.progress_mode === "manual") return client.progress_manual;
  const own = items.filter((i) => i.client_id === client.id);
  if (own.length === 0) return 0;
  const done = own.filter((i) => i.status === "done").length;
  return Math.round((done / own.length) * 100);
}

export function byPriorityThenDue(a: Item, b: Item): number {
  const rank = { high: 0, med: 1, low: 2 } as const;
  if (rank[a.priority] !== rank[b.priority]) return rank[a.priority] - rank[b.priority];
  return (a.due_date ?? "9999").localeCompare(b.due_date ?? "9999");
}

export function dashboardStats(
  items: Item[],
  meetings: Meeting[],
  today = todayISO(),
) {
  return {
    open: items.filter((i) => OPEN_STATUSES.includes(i.status)).length,
    overdue: items.filter((i) => isOverdue(i, today)).length,
    blockedOnDev: items.filter((i) => i.status === "blocked_on_dev").length,
    meetingsToday: meetings.filter((m) => isToday(m.datetime, today)).length,
  };
}
