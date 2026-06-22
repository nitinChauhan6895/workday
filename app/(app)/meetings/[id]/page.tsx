import Link from "next/link";
import { notFound } from "next/navigation";
import { getMeeting, getClient, getItems, getClients, clientsById } from "@/lib/data";
import ItemRow from "@/components/ItemRow";
import MeetingNotes from "@/components/MeetingNotes";
import QuickAddActionItem from "@/components/QuickAddActionItem";
import DeleteMeetingButton from "@/components/DeleteMeetingButton";
import RealtimeRefresh from "@/components/RealtimeRefresh";

export const dynamic = "force-dynamic";

function TeamsGlyph() {
  return (
    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="currentColor" aria-hidden>
      <path d="M13 8.5h6.2c.44 0 .8.36.8.8v5.1a3.4 3.4 0 0 1-3.4 3.4 3.4 3.4 0 0 1-3.3-2.6H13zM18.5 7a2 2 0 1 0 0-4 2 2 0 0 0 0 4M2 6.8h9.4c.33 0 .6.27.6.6v9.2c0 .33-.27.6-.6.6H2a.6.6 0 0 1-.6-.6V7.4c0-.33.27-.6.6-.6m2 2.3v1.4h2v5h1.6v-5h2V9.1z" />
    </svg>
  );
}

export default async function MeetingCapturePage({ params }: { params: { id: string } }) {
  const meeting = await getMeeting(params.id);
  if (!meeting) notFound();

  const [client, allItems, clients] = await Promise.all([
    meeting.client_id ? getClient(meeting.client_id) : Promise.resolve(null),
    getItems(),
    getClients(),
  ]);
  const clientMap = clientsById(clients);
  const actionItems = allItems.filter((i) => i.meeting_id === meeting.id);
  const d = new Date(meeting.datetime);

  return (
    <div>
      <RealtimeRefresh />
      <Link href="/meetings" className="mb-4 inline-flex items-center gap-1 text-[12px] text-subtle hover:text-ink">
        ← Meetings
      </Link>

      <div className="mb-5 flex items-start justify-between gap-3">
        <div className="min-w-0">
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
        <div className="flex shrink-0 items-center gap-2">
          {meeting.join_url && (
            <a
              href={meeting.join_url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#5059C9] px-3 py-1.5 text-[12px] font-medium text-white transition hover:opacity-90"
            >
              <TeamsGlyph />
              Join
            </a>
          )}
          <Link
            href={`/meetings/${meeting.id}/edit`}
            className="rounded-lg border border-line bg-card px-3 py-1.5 text-[12px] font-medium text-ink transition hover:bg-canvas"
          >
            Edit
          </Link>
          <DeleteMeetingButton id={meeting.id} />
        </div>
      </div>

      {/* Capture view: notes left, action items right */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-5">
        <section className="lg:col-span-3">
          <MeetingNotes meetingId={meeting.id} initial={meeting.raw_notes ?? ""} />
        </section>

        <section className="lg:col-span-2">
          <h2 className="mb-2 px-1 text-[13px] font-semibold text-ink">
            Action items ({actionItems.length})
          </h2>
          <QuickAddActionItem meetingId={meeting.id} />

          <div className="mt-3 card divide-y divide-line/70 overflow-hidden">
            {actionItems.length === 0 ? (
              <div className="px-4 py-6 text-center text-[12px] text-muted">
                None yet. Add items above as they come up — each is linked to this
                meeting{client ? ` and to ${client.name}` : ""}.
              </div>
            ) : (
              actionItems.map((i) => (
                <ItemRow key={i.id} item={i} client={clientMap.get(i.client_id ?? "")} />
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
