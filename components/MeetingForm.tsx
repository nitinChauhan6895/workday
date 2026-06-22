"use client";

import { useFormStatus } from "react-dom";
import type { Client, Meeting } from "@/lib/types";

const inputCls =
  "w-full rounded-lg border border-line bg-card px-3 py-2 text-[13px] text-ink outline-none placeholder:text-muted focus:border-accent";
const labelCls = "mb-1 block text-[11px] font-medium uppercase tracking-wide text-muted";

// ISO -> value for <input type="datetime-local"> (local time, no seconds).
function toLocalInput(iso?: string): string {
  const d = iso ? new Date(iso) : new Date();
  const tz = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() - tz).toISOString().slice(0, 16);
}

export default function MeetingForm({
  action,
  clients,
  initial,
  submitLabel = "Save",
}: {
  action: (form: FormData) => void | Promise<void>;
  clients: Client[];
  initial?: Meeting;
  submitLabel?: string;
}) {
  return (
    <form action={action} className="card space-y-4 p-5">
      <div>
        <label className={labelCls} htmlFor="title">Title</label>
        <input
          id="title"
          name="title"
          required
          autoFocus={!initial}
          defaultValue={initial?.title ?? ""}
          placeholder="e.g. Helios Bank — weekly sync"
          className={inputCls}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelCls} htmlFor="client_id">Client</label>
          <select
            id="client_id"
            name="client_id"
            defaultValue={initial?.client_id ?? ""}
            className={inputCls}
          >
            <option value="">Internal (none)</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className={labelCls} htmlFor="datetime">Date & time</label>
          <input
            id="datetime"
            name="datetime"
            type="datetime-local"
            defaultValue={toLocalInput(initial?.datetime)}
            className={inputCls}
          />
        </div>
      </div>

      <div>
        <label className={labelCls} htmlFor="attendees">Attendees</label>
        <input
          id="attendees"
          name="attendees"
          defaultValue={initial?.attendees ?? ""}
          placeholder="Comma-separated names"
          className={inputCls}
        />
      </div>

      <div>
        <label className={labelCls} htmlFor="raw_notes">Notes</label>
        <textarea
          id="raw_notes"
          name="raw_notes"
          rows={4}
          defaultValue={initial?.raw_notes ?? ""}
          placeholder="Optional — you can also capture these live on the meeting page."
          className={`${inputCls} resize-y`}
        />
      </div>

      <div className="flex justify-end gap-2 border-t border-line pt-4">
        <SubmitButton label={submitLabel} />
      </div>
    </form>
  );
}

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-lg bg-accent px-4 py-2 text-[13px] font-semibold text-white transition hover:bg-accent-dark disabled:opacity-60"
    >
      {pending ? "Saving…" : label}
    </button>
  );
}
