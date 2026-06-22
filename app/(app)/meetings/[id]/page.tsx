import Link from "next/link";
import { notFound } from "next/navigation";
import { getMeeting, getClient, getItems, getClients, clientsById } from "@/lib/data";
import ItemRow from "@/components/ItemRow";
import MeetingNotes from "@/components/MeetingNotes";
import QuickAddActionItem from "@/components/QuickAddActionItem";
import DeleteMeetingButton from "@/components/DeleteMeetingButton";
import RealtimeRefresh from "@/components/RealtimeRefresh";

export const dynamic = "force-dynamic";

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
