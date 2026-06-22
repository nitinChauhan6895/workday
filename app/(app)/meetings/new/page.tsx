import Link from "next/link";
import { getClients } from "@/lib/data";
import { createMeeting } from "../actions";
import PageHeader from "@/components/PageHeader";
import MeetingForm from "@/components/MeetingForm";

export const dynamic = "force-dynamic";

export default async function NewMeetingPage() {
  const clients = await getClients();

  return (
    <div className="mx-auto max-w-2xl">
      <Link href="/meetings" className="mb-4 inline-flex items-center gap-1 text-[12px] text-subtle hover:text-ink">
        ← Meetings
      </Link>
      <PageHeader title="New meeting" />
      <MeetingForm action={createMeeting} clients={clients} submitLabel="Create meeting" />
    </div>
  );
}
