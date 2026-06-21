import Link from "next/link";
import {
  items,
  clients,
  meetings,
  dashboardStats,
  clientProgress,
  isToday,
  isOpen,
  TODAY,
} from "@/lib/mock";
import type { Item } from "@/lib/types";
import ItemRow from "@/components/ItemRow";
import { STAGE_META } from "@/lib/types";

export default function DashboardPage() {
  const stats = dashboardStats();
  const today = new Date(TODAY + "T00:00:00");
  const greeting = greetingFor(today);

  // "Today's items": open items due today or overdue, plus high-priority open.
  const todays = items
    .filter(
      (i) =>
        isOpen(i) &&
        ((i.due_date && i.due_date <= TODAY) || i.priority === "high"),
    )
    .sort(byPriorityThenDue)
    .slice(0, 8);

  const todaysMeetings = meetings
    .filter((m) => isToday(m.datetime))
    .sort((a, b) => a.datetime.localeCompare(b.datetime));

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-semibold tracking-tight text-ink">{greeting}</h1>
        <p className="mt-0.5 text-[13px] text-subtle">
          {today.toLocaleDateString("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric",
          })}
        </p>
      </div>

      {/* Stat cards */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Open items" value={stats.open} href="/items" />
        <StatCard label="Overdue" value={stats.overdue} tone="danger" href="/items" />
        <StatCard label="Blocked on dev" value={stats.blockedOnDev} tone="warn" href="/standup" />
        <StatCard label="Meetings today" value={stats.meetingsToday} href="/meetings" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Today's items */}
        <section className="lg:col-span-2">
          <SectionHeading title="Today's items" href="/items" />
          <div className="card divide-y divide-line/70 overflow-hidden">
            {todays.length === 0 ? (
              <Empty>Nothing urgent today. </Empty>
            ) : (
              todays.map((i) => <ItemRow key={i.id} item={i} />)
            )}
          </div>
        </section>

        {/* Right column: clients + meetings */}
        <div className="flex flex-col gap-6">
          <section>
            <SectionHeading title="Clients" href="/clients" />
            <div className="card divide-y divide-line/70 overflow-hidden">
              {clients.map((c) => {
                const pct = clientProgress(c);
                return (
                  <Link
                    key={c.id}
                    href={`/clients/${c.id}`}
                    className="block px-4 py-3 transition hover:bg-canvas"
                  >
                    <div className="flex items-center justify-between">
                      <span className="truncate text-[13px] font-medium text-ink">
                        {c.name}
                      </span>
                      <span className="text-[11px] text-muted">
                        {STAGE_META[c.stage].label}
                      </span>
                    </div>
                    <div className="mt-2 flex items-center gap-2">
                      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-line">
                        <div
                          className="h-full rounded-full bg-accent"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="w-8 text-right text-[11px] tabular-nums text-subtle">
                        {pct}%
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>

          <section>
            <SectionHeading title="Today's meetings" href="/meetings" />
            <div className="card divide-y divide-line/70 overflow-hidden">
              {todaysMeetings.length === 0 ? (
                <Empty>No meetings today.</Empty>
              ) : (
                todaysMeetings.map((m) => (
                  <Link
                    key={m.id}
                    href={`/meetings/${m.id}`}
                    className="block px-4 py-3 transition hover:bg-canvas"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="truncate text-[13px] text-ink">{m.title}</span>
                      <span className="shrink-0 text-[11px] tabular-nums text-muted">
                        {new Date(m.datetime).toLocaleTimeString("en-US", {
                          hour: "numeric",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function greetingFor(d: Date): string {
  const h = d.getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

function byPriorityThenDue(a: Item, b: Item): number {
  const rank = { high: 0, med: 1, low: 2 };
  if (rank[a.priority] !== rank[b.priority]) return rank[a.priority] - rank[b.priority];
  return (a.due_date ?? "9999").localeCompare(b.due_date ?? "9999");
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
