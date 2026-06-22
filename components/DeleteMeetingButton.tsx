"use client";

import { useTransition } from "react";
import { deleteMeeting } from "@/app/(app)/meetings/actions";

export default function DeleteMeetingButton({ id }: { id: string }) {
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        if (confirm("Delete this meeting? Linked items are kept but unlinked.")) {
          startTransition(() => deleteMeeting(id));
        }
      }}
      className="rounded-lg border border-line bg-card px-3 py-1.5 text-[12px] font-medium text-[#C81E1E] transition hover:bg-[#FDE8E8] disabled:opacity-60"
    >
      {pending ? "Deleting…" : "Delete"}
    </button>
  );
}
