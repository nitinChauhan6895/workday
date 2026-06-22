import Link from "next/link";
import { notFound } from "next/navigation";
import { getMeeting, getClients } from "@/lib/data";
import { updateMeeting } from "../../actions";
import PageHeader from "@/components/PageHeader";
import MeetingForm from "@/components/MeetingForm";

export const dynamic = "force-dynamic";

export default async function EditMeetingPage({ params }: { params: { id: string } }) {
  const [meeting, clients] = await Promise.all([getMeeting(params.id), getClients()]);
  if (!meeting) notFound();

  const update = updateMeeting.bind(null, meeting.id);

  return (
    <div className="mx-auto max-w-2xl">
      <Link href={`/meetings/${meeting.id}`} className="mb-4 inline-flex items-center gap-1 text-[12px] text-subtle hover:text-ink">
        ← {meeting.title}
      </Link>
      <PageHeader title="Edit meeting" />
      <MeetingForm action={update} clients={clients} initial={meeting} submitLabel="Save changes" />
    </div>
  );
}
