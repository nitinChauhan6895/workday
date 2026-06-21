import Link from "next/link";
import { meetings, clientById, TODAY } from "@/lib/mock";
import PageHeader from "@/components/PageHeader";

export default function MeetingsPage() {
  const upcoming = meetings
    .filter((m) => m.datetime.slice(0, 10) >= TODAY)
    .sort((a, b) => a.datetime.localeCompare(b.datetime));
  const recent = meetings
    .filter((m) => m.datetime.slice(0, 10) < TODAY)
    .sort((a, b) => b.datetime.localeCompare(a.datetime));

  return (
    <div>
      <PageHeader title="Meetings" subtitle={`${meetings.length} total`} />
      <Group title="Upcoming" list={upcoming} />
      <Group title="Recent" list={recent} />
    </div>
  );
}

function Group({ title, list }: { title: string; list: typeof meetings }) {
  return (
    <section className="mb-6">
      <h2 className="mb-2 px-1 text-[13px] font-semibold text-ink">{title}</h2>
      {list.length === 0 ? (
        <div className="card px-4 py-6 text-center text-[12px] text-muted">None.</div>
      ) : (
        <div className="card divide-y divide-line/70 overflow-hidden">
          {list.map((m) => {
            const client = clientById(m.client_id);
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
