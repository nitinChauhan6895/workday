import Link from "next/link";
import { notFound } from "next/navigation";
import { getMeeting, getClient, getItems } from "@/lib/data";
import { TypeBadge, StatusBadge } from "@/components/Badge";

export const dynamic = "force-dynamic";

export default async function MeetingCapturePage({ params }: { params: { id: string } }) {
  const meeting = await getMeeting(params.id);
  if (!meeting) notFound();

  const [client, allItems] = await Promise.all([
    meeting.client_id ? getClient(meeting.client_id) : Promise.resolve(null),
    getItems(),
  ]);
  const actionItems = allItems.filter((i) => i.meeting_id === meeting.id);
  const d = new Date(meeting.datetime);

  return (
    <div>
      <Link href="/meetings" className="mb-4 inline-flex items-center gap-1 text-[12px] text-subtle hover:text-ink">
        ← Meetings
      </Link>

      <div className="mb-5">
        <h1 className="text-xl font-semibold tracking-tight text-ink">{meeting.title}</h1>
        <p className="mt-0.5 text-[12px] text-muted">
          {client ? client.name : "Internal"} ·{" "}
          {d.toLocaleString("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric",
            hour: "numeric",
            minute: "2-digit",
          })}
          {meeting.attendees ? ` · ${meeting.attendees}` : ""}
        </p>
      </div>

      {/* Capture view: notes left, action items right */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-5">
        <section className="lg:col-span-3">
          <h2 className="mb-2 px-1 text-[13px] font-semibold text-ink">Notes</h2>
          <div className="card min-h-[260px] whitespace-pre-wrap p-4 text-[13px] leading-relaxed text-ink">
            {meeting.raw_notes || <span className="text-muted">No notes captured.</span>}
          </div>
        </section>

        <section className="lg:col-span-2">
          <h2 className="mb-2 px-1 text-[13px] font-semibold text-ink">
            Action items ({actionItems.length})
          </h2>
          <div className="card divide-y divide-line/70 overflow-hidden">
            {actionItems.length === 0 ? (
              <div className="px-4 py-6 text-center text-[12px] text-muted">
                None linked to this meeting yet.
              </div>
            ) : (
              actionItems.map((i) => (
                <Link key={i.id} href={`/items/${i.id}`} className="block px-4 py-3 transition hover:bg-canvas">
                  <div className="text-[13px] text-ink">{i.title}</div>
                  <div className="mt-1 flex items-center gap-1.5">
                    <TypeBadge type={i.type} />
                    <StatusBadge status={i.status} />
                  </div>
                </Link>
              ))
            )}
          </div>
          <p className="mt-3 px-1 text-[11px] text-muted">
            Creating action items from notes (and AI extraction) arrives in Phase 6.
          </p>
        </section>
      </div>
    </div>
  );
}
