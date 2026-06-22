"use client";

import { useRef } from "react";
import { useFormStatus } from "react-dom";
import { createActionItem } from "@/app/(app)/meetings/actions";
import type { Priority } from "@/lib/types";

const PRIORITIES: Priority[] = ["high", "med", "low"];

export default function QuickAddActionItem({ meetingId }: { meetingId: string }) {
  const formRef = useRef<HTMLFormElement>(null);
  const create = createActionItem.bind(null, meetingId);

  return (
    <form
      ref={formRef}
      action={async (form) => {
        await create(form);
        formRef.current?.reset();
      }}
      className="card flex items-center gap-2 p-2"
    >
      <input
        name="title"
        required
        placeholder="Add an action item…"
        className="min-w-0 flex-1 rounded-md bg-transparent px-2 py-1.5 text-[13px] text-ink outline-none placeholder:text-muted"
      />
      <select
        name="priority"
        defaultValue="med"
        className="rounded-md border border-line bg-card px-1.5 py-1 text-[12px] text-subtle outline-none"
        aria-label="Priority"
      >
        {PRIORITIES.map((p) => (
          <option key={p} value={p}>{p}</option>
        ))}
      </select>
      <AddButton />
    </form>
  );
}

function AddButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-md bg-accent px-3 py-1.5 text-[13px] font-medium text-white transition hover:bg-accent-dark disabled:opacity-60"
    >
      {pending ? "Adding…" : "Add"}
    </button>
  );
}
