"use client";

import { useTransition } from "react";
import { deleteItem } from "@/app/(app)/items/actions";

export default function DeleteItemButton({ id }: { id: string }) {
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        if (confirm("Delete this item? This can't be undone.")) {
          startTransition(() => deleteItem(id));
        }
      }}
      className="rounded-lg border border-line bg-card px-3 py-2 text-[13px] font-medium text-[#C81E1E] transition hover:bg-[#FDE8E8] disabled:opacity-60"
    >
      {pending ? "Deleting…" : "Delete"}
    </button>
  );
}
