// Pure, environment-agnostic helpers shared by server components.
import type { Client, Item, Meeting, ItemStatus } from "./types";

export function todayISO(): string {
  // Local calendar date as YYYY-MM-DD.
  const d = new Date();
  const tz = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() - tz).toISOString().slice(0, 10);
}

export function isToday(iso: string, today = todayISO()): boolean {
  return iso.slice(0, 10) === today;
}

// Local calendar date (YYYY-MM-DD) of an absolute timestamp.
export function localDate(iso: string): string {
  const d = new Date(iso);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
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
