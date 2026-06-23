import Link from "next/link";
import { getMeetings, getClients, clientsById } from "@/lib/data";
import { todayISO, localDate, weekDays, addDays, formatTime, formatDateTime, formatDateOnly } from "@/lib/derive";
import type { Meeting, Client } from "@/lib/types";
import PageHeader from "@/components/PageHeader";
import MeetingsClientFilter from "@/components/MeetingsClientFilter";
import MeetingsViewControls from "@/components/MeetingsViewControls";
import RealtimeRefresh from "@/components/RealtimeRefresh";

export const dynamic = "force-dynamic";

type View = "day" | "week" | "list";

export default async function MeetingsPage({
  searchParams,
}: {
  searchParams: { client?: string; view?: string; date?: string };
}) {
  const [allMeetings, clients] = await Promise.all([getMeetings(), getClients()]);
  const clientMap = clientsById(clients);
  const today = todayISO();

  const view: View =
    searchParams.view === "day" || searchParams.view === "list"
      ? searchParams.view
      : "week";
  const anchor = searchParams.date ?? today;

  const clientFilter = searchParams.client;
  const meetings = allMeetings.filter((m) => {
    if (clientFilter === "internal") return m.client_id === null;
    if (clientFilter) return m.client_id === clientFilter;
    return true;
  });

  const label =
    view === "day"
      ? fmtDay(anchor)
      : view === "week"
        ? fmtWeekRange(anchor)
        : "";

  return (
    <div>
      <RealtimeRefresh />
      <PageHeader
        title="Meetings"
        subtitle={`${allMeetings.length} total`}
        action={
          <Link
            href="/meetings/new"
            className="rounded-lg bg-accent px-3 py-2 text-[13px] font-medium text-white transition hover:bg-accent-dark"
          >
            New meeting
          </Link>
        }
      />

      <MeetingsViewControls view={view} date={anchor} label={label} />
      <div className="mb-4">
        <MeetingsClientFilter clients={clients} />
      </div>

      {view === "day" && (
        <DayView meetings={meetings} date={anchor} today={today} clientMap={clientMap} />
      )}
      {view === "week" && (
        <WeekView meetings={meetings} anchor={anchor} today={today} clientMap={clientMap} />
      )}
      {view === "list" && (
        <ListView meetings={meetings} today={today} clientMap={clientMap} />
      )}
    </div>
  );
}

// ---------- Day ----------
function DayView({
  meetings,
  date,
  today,
  clientMap,
}: {
  meetings: Meeting[];
  date: string;
  today: string;
  clientMap: Map<string, Client>;
}) {
  const day = meetings
    .filter((m) => localDate(m.datetime) === date)
    .sort((a, b) => a.datetime.localeCompare(b.datetime));

  if (day.length === 0) {
    return <Empty>No meetings on this day.</Empty>;
  }
  return (
    <div className="card divide-y divide-line/70 overflow-hidden">
      {day.map((m) => (
        <TimeRow key={m.id} meeting={m} clientMap={clientMap} highlight={date === today} />
      ))}
    </div>
  );
}

// ---------- Week ----------
function WeekView({
  meetings,
  anchor,
  today,
  clientMap,
}: {
  meetings: Meeting[];
  anchor: string;
  today: string;
  clientMap: Map<string, Client>;
}) {
  const days = weekDays(anchor);
  const byDay = new Map<string, Meeting[]>();
  for (const d of days) byDay.set(d, []);
  for (const m of meetings) {
    const d = localDate(m.datetime);
    if (byDay.has(d)) byDay.get(d)!.push(m);
  }

  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-7">
      {days.map((d) => {
        const list = byDay.get(d)!.sort((a, b) => a.datetime.localeCompare(b.datetime));
        const isToday = d === today;
        return (
          <div
            key={d}
            className={`card overflow-hidden ${isToday ? "ring-1 ring-accent" : ""}`}
          >
            <div
              className={`flex items-baseline justify-between px-3 py-2 ${
                isToday ? "bg-accent-soft" : "bg-canvas"
              }`}
            >
              <span className={`text-[12px] font-semibold ${isToday ? "text-accent" : "text-ink"}`}>
                {formatDateOnly(d, { weekday: "short" })}
              </span>
              <span className="text-[11px] tabular-nums text-muted">
                {formatDateOnly(d, { day: "numeric" })}
              </span>
            </div>
            <div className="divide-y divide-line/60">
              {list.length === 0 ? (
                <div className="px-3 py-3 text-[11px] text-muted">—</div>
              ) : (
                list.map((m) => {
                  const client = m.client_id ? clientMap.get(m.client_id) : null;
                  return (
                    <Link
                      key={m.id}
                      href={`/meetings/${m.id}`}
                      className="block px-3 py-2 transition hover:bg-canvas"
                    >
                      <div className="flex items-center gap-1 text-[11px] tabular-nums text-accent">
                        {formatTime(m.datetime)}
                        {m.join_url && (
                          <span
                            className="inline-block h-1.5 w-1.5 rounded-full bg-[#5059C9]"
                            title="Teams meeting"
                          />
                        )}
                      </div>
                      <div className="truncate text-[12px] text-ink" title={m.title}>
                        {m.title}
                      </div>
                      {client && (
                        <div className="truncate text-[10px] text-muted">{client.name}</div>
                      )}
                    </Link>
                  );
                })
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ---------- List (upcoming / recent) ----------
function ListView({
  meetings,
  today,
  clientMap,
}: {
  meetings: Meeting[];
  today: string;
  clientMap: Map<string, Client>;
}) {
  const upcoming = meetings
    .filter((m) => localDate(m.datetime) >= today)
    .sort((a, b) => a.datetime.localeCompare(b.datetime));
  const recent = meetings
    .filter((m) => localDate(m.datetime) < today)
    .sort((a, b) => b.datetime.localeCompare(a.datetime));

  return (
    <>
      <Group title="Upcoming" list={upcoming} clientMap={clientMap} />
      <Group title="Recent" list={recent} clientMap={clientMap} />
    </>
  );
}

function Group({
  title,
  list,
  clientMap,
}: {
  title: string;
  list: Meeting[];
  clientMap: Map<string, Client>;
}) {
  return (
    <section className="mb-6">
      <h2 className="mb-2 px-1 text-[13px] font-semibold text-ink">{title}</h2>
      {list.length === 0 ? (
        <Empty>None.</Empty>
      ) : (
        <div className="card divide-y divide-line/70 overflow-hidden">
          {list.map((m) => (
            <TimeRow key={m.id} meeting={m} clientMap={clientMap} showDate />
          ))}
        </div>
      )}
    </section>
  );
}

// A single meeting row with time (and optional date).
function TimeRow({
  meeting,
  clientMap,
  showDate,
}: {
  meeting: Meeting;
  clientMap: Map<string, Client>;
  showDate?: boolean;
  highlight?: boolean;
}) {
  const client = meeting.client_id ? clientMap.get(meeting.client_id) : null;
  return (
    <div className="flex items-center gap-3 px-4 py-3 transition hover:bg-canvas">
      <div className="w-16 shrink-0 text-[12px] tabular-nums text-accent">
        {formatTime(meeting.datetime)}
      </div>
      <Link href={`/meetings/${meeting.id}`} className="min-w-0 flex-1">
        <div className="truncate text-[13px] font-medium text-ink">{meeting.title}</div>
        <div className="mt-0.5 text-[11px] text-muted">
          {client ? client.name : "Internal"}
          {showDate
            ? ` · ${formatDateTime(meeting.datetime, { weekday: "short", month: "short", day: "numeric" })}`
            : meeting.attendees
              ? ` · ${meeting.attendees}`
              : ""}
        </div>
      </Link>
      {meeting.join_url && (
        <a
          href={meeting.join_url}
          target="_blank"
          rel="noreferrer"
          className="shrink-0 rounded-md bg-[#5059C9] px-2 py-1 text-[11px] font-medium text-white transition hover:opacity-90"
        >
          Join
        </a>
      )}
    </div>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return <div className="card px-4 py-8 text-center text-[12px] text-muted">{children}</div>;
}

// ---------- formatting ----------
function fmtDay(iso: string): string {
  return formatDateOnly(iso, { weekday: "short", month: "short", day: "numeric" });
}
function fmtWeekRange(iso: string): string {
  const days = weekDays(iso);
  const startYmd = days[0];
  const endYmd = addDays(days[0], 6);
  const sameMonth = startYmd.slice(5, 7) === endYmd.slice(5, 7);
  const s = formatDateOnly(startYmd, { month: "short", day: "numeric" });
  const e = formatDateOnly(endYmd, {
    month: sameMonth ? undefined : "short",
    day: "numeric",
  });
  return `${s} – ${e}`;
}
