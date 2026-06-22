"use client";

import { useState } from "react";
import type { ChecklistItem } from "@/lib/types";

// Repeatable {text, done} checklist. Serializes to a hidden input for the form action.
export default function ChecklistEditor({
  name = "checklist",
  initial = [],
}: {
  name?: string;
  initial?: ChecklistItem[];
}) {
  const [rows, setRows] = useState<ChecklistItem[]>(initial);

  const toggle = (i: number) =>
    setRows((r) => r.map((row, idx) => (idx === i ? { ...row, done: !row.done } : row)));
  const setText = (i: number, text: string) =>
    setRows((r) => r.map((row, idx) => (idx === i ? { ...row, text } : row)));
  const add = () => setRows((r) => [...r, { text: "", done: false }]);
  const remove = (i: number) => setRows((r) => r.filter((_, idx) => idx !== i));

  const clean = rows.filter((r) => r.text.trim() !== "");

  return (
    <div className="space-y-1.5">
      {rows.map((row, i) => (
        <div key={i} className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={row.done}
            onChange={() => toggle(i)}
            className="h-4 w-4 shrink-0 rounded border-line text-accent focus:ring-accent"
          />
          <input
            value={row.text}
            onChange={(e) => setText(i, e.target.value)}
            placeholder="Checklist item"
            className={`flex-1 rounded-md border border-line bg-card px-2.5 py-1.5 text-[13px] outline-none focus:border-accent ${
              row.done ? "text-muted line-through" : "text-ink"
            }`}
          />
          <button
            type="button"
            onClick={() => remove(i)}
            aria-label="Remove item"
            className="shrink-0 px-1.5 text-[13px] text-muted hover:text-[#C81E1E]"
          >
            ✕
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={add}
        className="text-[12px] font-medium text-accent hover:underline"
      >
        + Add checkbox
      </button>
      <input type="hidden" name={name} value={JSON.stringify(clean)} />
    </div>
  );
}
