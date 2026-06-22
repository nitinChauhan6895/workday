"use client";

import { useState, useTransition } from "react";
import { useFormStatus } from "react-dom";
import { saveIcsUrl, syncCalendar, type SyncResult } from "@/app/(app)/settings/actions";

export default function CalendarSync({
  icsUrl,
  lastSynced,
}: {
  icsUrl: string | null;
  lastSynced: string | null;
}) {
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<SyncResult | null>(null);

  function runSync() {
    setResult(null);
    startTransition(async () => {
      const r = await syncCalendar();
      setResult(r);
    });
  }

  return (
    <div className="space-y-4">
      <form action={saveIcsUrl} className="space-y-2">
        <label className="block text-[11px] font-medium uppercase tracking-wide text-muted" htmlFor="ics_url">
          Published calendar URL (.ics)
        </label>
        <div className="flex gap-2">
          <input
            id="ics_url"
            name="ics_url"
            type="password"
            autoComplete="off"
            defaultValue={icsUrl ?? ""}
            placeholder="https://outlook.office365.com/owa/calendar/…/calendar.ics"
            className="min-w-0 flex-1 rounded-lg border border-line bg-card px-3 py-2 text-[13px] text-ink outline-none placeholder:text-muted focus:border-accent"
          />
          <SaveButton />
        </div>
        <p className="text-[11px] text-muted">
          Secret — anyone with this URL can read your calendar. Stored server-side only.
        </p>
      </form>

      <div className="flex items-center gap-3 border-t border-line pt-4">
        <button
          type="button"
          onClick={runSync}
          disabled={pending || !icsUrl}
          className="rounded-lg bg-accent px-3 py-2 text-[13px] font-medium text-white transition hover:bg-accent-dark disabled:opacity-50"
        >
          {pending ? "Syncing…" : "Sync now"}
        </button>
        <span className="text-[12px] text-muted">
          {lastSynced
            ? `Last synced ${new Date(lastSynced).toLocaleString("en-US", {
                month: "short",
                day: "numeric",
                hour: "numeric",
                minute: "2-digit",
              })}`
            : icsUrl
              ? "Not synced yet"
              : "Add a URL to enable sync"}
        </span>
      </div>

      {result && (
        <p className={`text-[12px] ${result.ok ? "text-[#1A7F37]" : "text-[#C81E1E]"}`}>
          {result.message}
        </p>
      )}
    </div>
  );
}

function SaveButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="shrink-0 rounded-lg border border-line bg-card px-3 py-2 text-[13px] font-medium text-ink transition hover:bg-canvas disabled:opacity-60"
    >
      {pending ? "Saving…" : "Save"}
    </button>
  );
}
