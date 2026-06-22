"use client";

import { useState, useTransition } from "react";
import { saveMeetingNotes } from "@/app/(app)/meetings/actions";

export default function MeetingNotes({
  meetingId,
  initial,
}: {
  meetingId: string;
  initial: string;
}) {
  const [value, setValue] = useState(initial);
  const [saved, setSaved] = useState(initial);
  const [pending, startTransition] = useTransition();
  const dirty = value !== saved;

  function save() {
    if (!dirty) return;
    const next = value;
    startTransition(async () => {
      await saveMeetingNotes(meetingId, next);
      setSaved(next);
    });
  }

  return (
    <div>
      <div className="mb-2 flex items-center justify-between px-1">
        <h2 className="text-[13px] font-semibold text-ink">Notes</h2>
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-muted">
            {pending ? "Saving…" : dirty ? "Unsaved" : "Saved"}
          </span>
          <button
            type="button"
            onClick={save}
            disabled={!dirty || pending}
            className="rounded-lg bg-accent px-2.5 py-1 text-[12px] font-medium text-white transition hover:bg-accent-dark disabled:opacity-40"
          >
            Save
          </button>
        </div>
      </div>
      <textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={save}
        rows={14}
        placeholder="Capture the meeting as it happens…"
        className="card w-full resize-y p-4 text-[13px] leading-relaxed text-ink outline-none placeholder:text-muted focus:border-accent"
      />
    </div>
  );
}
