"use client";

import { useTransition } from "react";
import { deleteClient } from "@/app/(app)/clients/actions";

export default function DeleteClientButton({ id }: { id: string }) {
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        if (
          confirm(
            "Delete this client? Its items and meetings will be kept but unlinked (marked internal).",
          )
        ) {
          startTransition(() => deleteClient(id));
        }
      }}
      className="rounded-lg border border-line bg-card px-3 py-2 text-[13px] font-medium text-[#C81E1E] transition hover:bg-[#FDE8E8] disabled:opacity-60"
    >
      {pending ? "Deleting…" : "Delete client"}
    </button>
  );
}
