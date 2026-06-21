import Link from "next/link";
import { getMeetings, getClients, clientsById } from "@/lib/data";
import { todayISO } from "@/lib/derive";
import type { Meeting, Client } from "@/lib/types";
import PageHeader from "@/components/PageHeader";
import RealtimeRefresh from "@/components/RealtimeRefresh";

export const dynamic = "force-dynamic";

export default async function MeetingsPage() {
  const [meetings, clients] = await Promise.all([getMeetings(), getClients()]);
  const clientMap = clientsById(clients);
  const today = todayISO();

  const upcoming = meetings
    .filter((m) => m.datetime.slice(0, 10) >= today)
    .sort((a, b) => a.datetime.localeCompare(b.datetime));
  const recent = meetings
    .filter((m) => m.datetime.slice(0, 10) < today)
    .sort((a, b) => b.datetime.localeCompare(a.datetime));

  return (
    <div>
      <RealtimeRefresh />
      <PageHeader title="Meetings" subtitle={`${meetings.length} total`} />
      <Group title="Upcoming" list={upcoming} clientMap={clientMap} />
      <Group title="Recent" list={recent} clientMap={clientMap} />
    </div>
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
        <div className="card px-4 py-6 text-center text-[12px] text-muted">None.</div>
      ) : (
        <div className="card divide-y divide-line/70 overflow-hidden">
          {list.map((m) => {
            const client = m.client_id ? clientMap.get(m.client_id) : null;
            const d = new Date(m.datetime);
            return (
              <Link key={m.id} href={`/meetings/${m.id}`} className="flex items-center justify-between gap-3 px-4 py-3 transition hover:bg-canvas">
                <div className="min-w-0">
                  <div className="truncate text-[13px] font-medium text-ink">{m.title}</div>
                  <div className="mt-0.5 text-[11px] text-muted">
                    {client ? client.name : "Internal"} ·{" "}
                    {d.toLocaleString("en-US", {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </section>
  );
}
