"use client";

import { useTransition } from "react";
import { setStandupFlag } from "@/app/(app)/items/actions";

// Shown in the Standup view: clears the standup flag so the item drops off the
// call list (without marking it done).
export default function StandupFlagToggle({ id }: { id: string }) {
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      title="Remove from standup"
      onClick={() => startTransition(() => setStandupFlag(id, false))}
      className="rounded-md border border-line bg-card px-2 py-0.5 text-[11px] font-medium text-subtle transition hover:bg-canvas hover:text-ink disabled:opacity-50"
    >
      {pending ? "…" : "Unflag"}
    </button>
  );
}
