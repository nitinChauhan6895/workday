"use client";

import { useState } from "react";
import type { LinkItem } from "@/lib/types";

const cell =
  "rounded-lg border border-line bg-card px-3 py-2 text-[13px] text-ink outline-none placeholder:text-muted focus:border-accent";

// Repeatable {title, url} rows. Serializes to a hidden input the form action reads.
export default function LinksEditor({
  name = "links",
  initial = [],
}: {
  name?: string;
  initial?: LinkItem[];
}) {
  const [rows, setRows] = useState<LinkItem[]>(
    initial.length ? initial : [{ title: "", url: "" }],
  );

  const set = (i: number, patch: Partial<LinkItem>) =>
    setRows((r) => r.map((row, idx) => (idx === i ? { ...row, ...patch } : row)));
  const add = () => setRows((r) => [...r, { title: "", url: "" }]);
  const remove = (i: number) => setRows((r) => r.filter((_, idx) => idx !== i));

  const clean = rows.filter((r) => r.url.trim() !== "");

  return (
    <div className="space-y-2">
      {rows.map((row, i) => (
        <div key={i} className="flex gap-2">
          <input
            value={row.title}
            onChange={(e) => set(i, { title: e.target.value })}
            placeholder="Label (e.g. Teams channel)"
            className={`${cell} w-2/5`}
          />
          <input
            value={row.url}
            onChange={(e) => set(i, { url: e.target.value })}
            placeholder="https://… or mailto:…"
            className={`${cell} flex-1`}
          />
          <button
            type="button"
            onClick={() => remove(i)}
            aria-label="Remove link"
            className="shrink-0 rounded-lg border border-line bg-card px-2.5 text-[13px] text-muted hover:text-[#C81E1E]"
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
        + Add link
      </button>
      <input type="hidden" name={name} value={JSON.stringify(clean)} />
    </div>
  );
}
