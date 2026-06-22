"use client";

import { useTransition } from "react";
import { toggleItemDone } from "@/app/(app)/items/actions";

export default function ItemCheckbox({
  id,
  done,
}: {
  id: string;
  done: boolean;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      aria-label={done ? "Mark as not done" : "Mark as done"}
      disabled={pending}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        startTransition(() => toggleItemDone(id, !done));
      }}
      className={`flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-md border transition ${
        done
          ? "border-accent bg-accent text-white"
          : "border-line bg-card hover:border-accent"
      } ${pending ? "opacity-50" : ""}`}
    >
      {done && (
        <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 12l5 5 9-11" />
        </svg>
      )}
    </button>
  );
}
