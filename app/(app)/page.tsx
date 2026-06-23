import Link from "next/link";
import { getItems, getClients, getMeetingsRange, getSessionUser } from "@/lib/data";
import {
  dashboardStats,
  clientProgress,
  isOpen,
  todayISO,
  addDays,
  addBusinessDays,
  formatTime,
  hourInAppTz,
  APP_TZ,
} from "@/lib/derive";
import DashboardItems from "@/components/DashboardItems";
import RealtimeRefresh from "@/components/RealtimeRefresh";
import { STAGE_META } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const today = todayISO();
  const dayStart = `${today}T00:00:00+05:30`;
  const dayEnd = `${addDays(today, 1)}T00:00:00+05:30`;

  const [items, clients, todaysMeetings, user] = await Promise.all([
    getItems(),
    getClients(),
    getMeetingsRange(dayStart, dayEnd),
    getSessionUser(),
  ]);
  const now = new Date();
  const greeting = greetingFor(hourInAppTz(now));
  const meta = (user?.user_metadata ?? {}) as Record<string, string>;
  const fullName = [meta.first_name, meta.last_name].filter(Boolean).join(" ");

  // Open items due within the next 3 working days (Sat/Sun excluded), plus
  // anything overdue — newest-modified first.
  const windowEnd = addBusinessDays(today, 3);
  const dueItems = items
    .filter((i) => isOpen(i) && !!i.due_date && i.due_date <= windowEnd)
    .sort((a, b) => b.updated_at.localeCompare(a.updated_at));

  const topClients = clients.slice(0, 5);
  const clientMap = new Map(clients.map((c) => [c.id, c]));

  const stats = dashboardStats(items, todaysMeetings, today);
  const firstRun =
    items.length === 0 && clients.length === 0 && todaysMeetings.length === 0;

  return (
    <div>
      <RealtimeRefresh />
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-ink">
            {greeting}{fullName ? `, ${meta.first_name}` : ""}
          </h1>
          <p className="mt-0.5 text-[13px] text-subtle">
            {now.toLocaleDateString("en-US", {
              timeZone: APP_TZ,
              weekday: "long",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {fullName && (
            <span className="mr-1 hidden items-center gap-2 sm:flex">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-accent-soft text-[12px] font-semibold text-accent">
                {(meta.first_name?.[0] ?? "") + (meta.last_name?.[0] ?? "")}
              </span>
              <span className="text-[13px] font-medium text-ink">{fullName}</span>
            </span>
          )}
          <Link
            href="/items/new"
            className="shrink-0 rounded-lg bg-accent px-3 py-2 text-[13px] font-medium text-white transition hover:bg-accent-dark"
          >
            New item
          </Link>
          <Link
            href="/clients/new"
            className="shrink-0 rounded-lg border border-line bg-card px-3 py-2 text-[13px] font-medium text-ink transition hover:bg-canvas"
          >
            New client
          </Link>
        </div>
      </div>

      {firstRun && (
        <div className="mb-6 card p-6">
          <h2 className="text-[15px] font-semibold text-ink">Welcome to MyDay 👋</h2>
          <p className="mt-1 text-[13px] text-subtle">
            Nothing here yet. Start by adding a client, then capture the items
            and meetings that hang off it.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link
              href="/clients/new"
              className="rounded-lg bg-accent px-3 py-2 text-[13px] font-medium text-white transition hover:bg-accent-dark"
            >
              Add a client
            </Link>
            <Link
              href="/items/new"
              className="rounded-lg border border-line bg-card px-3 py-2 text-[13px] font-medium text-ink transition hover:bg-canvas"
            >
              Create an item
            </Link>
          </div>
        </div>
      )}

      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Open items" value={stats.open} href="/items" />
        <StatCard label="Overdue" value={stats.overdue} tone="danger" href="/items" />
        <StatCard label="Blocked on dev" value={stats.blockedOnDev} tone="warn" href="/standup" />
        <StatCard label="Meetings today" value={stats.meetingsToday} href="/meetings" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <DashboardItems items={dueItems} clients={clients} />
        </div>

        <section>
          <SectionHeading title="Clients" href="/clients" />
          <div className="card divide-y divide-line/70 overflow-hidden">
            {topClients.length === 0 ? (
              <Empty>No clients yet.</Empty>
            ) : (
              topClients.map((c) => {
                const pct = clientProgress(c, items);
                return (
                  <Link
                    key={c.id}
                    href={`/clients/${c.id}`}
                    className="block px-4 py-3 transition hover:bg-canvas"
                  >
                    <div className="flex items-center justify-between">
                      <span className="truncate text-[13px] font-medium text-ink">{c.name}</span>
                      <span className="text-[11px] text-muted">{STAGE_META[c.stage].label}</span>
                    </div>
                    <div className="mt-2 flex items-center gap-2">
                      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-line">
                        <div className="h-full rounded-full bg-accent" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="w-8 text-right text-[11px] tabular-nums text-subtle">{pct}%</span>
                    </div>
                  </Link>
                );
              })
            )}
          </div>
        </section>
      </div>

      {/* Today's meetings — full width, with Join buttons */}
      <section className="mt-6">
        <SectionHeading title="Today's meetings" href="/meetings" />
        <div className="card divide-y divide-line/70 overflow-hidden">
          {todaysMeetings.length === 0 ? (
            <Empty>No meetings today.</Empty>
          ) : (
            todaysMeetings.map((m) => (
              <div key={m.id} className="flex items-center gap-3 px-4 py-3 transition hover:bg-canvas">
                <div className="w-16 shrink-0 text-[12px] tabular-nums text-accent">
                  {formatTime(m.datetime)}
                </div>
                <Link href={`/meetings/${m.id}`} className="min-w-0 flex-1">
                  <div className="truncate text-[13px] font-medium text-ink">{m.title}</div>
                  <div className="mt-0.5 truncate text-[11px] text-muted">
                    {m.client_id ? clientMap.get(m.client_id)?.name ?? "Internal" : "Internal"}
                    {m.attendees ? ` · ${m.attendees}` : ""}
                  </div>
                </Link>
                {m.join_url && (
                  <a
                    href={m.join_url}
                    target="_blank"
                    rel="noreferrer"
                    className="shrink-0 rounded-md bg-[#5059C9] px-3 py-1.5 text-[12px] font-medium text-white transition hover:opacity-90"
                  >
                    Join
                  </a>
                )}
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}

function greetingFor(h: number): string {
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

function StatCard({
  label,
  value,
  tone,
  href,
}: {
  label: string;
  value: number;
  tone?: "danger" | "warn";
  href: string;
}) {
  const valueColor =
    tone === "danger" && value > 0
      ? "text-[#C81E1E]"
      : tone === "warn" && value > 0
        ? "text-[#B45309]"
        : "text-ink";
  return (
    <Link href={href} className="card px-4 py-3 transition hover:shadow-pop">
      <div className={`text-2xl font-semibold tabular-nums ${valueColor}`}>{value}</div>
      <div className="mt-0.5 text-[12px] text-subtle">{label}</div>
    </Link>
  );
}

function SectionHeading({ title, href }: { title: string; href: string }) {
  return (
    <div className="mb-2 flex items-center justify-between px-1">
      <h2 className="text-[13px] font-semibold text-ink">{title}</h2>
      <Link href={href} className="text-[12px] text-accent hover:underline">
        View all
      </Link>
    </div>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return <div className="px-4 py-6 text-center text-[12px] text-muted">{children}</div>;
}
