"use client";

import { useState } from "react";

// Free-form language chips. Serializes to a hidden input for the form action.
export default function LanguagesEditor({
  name = "languages",
  initial = [],
}: {
  name?: string;
  initial?: string[];
}) {
  const [langs, setLangs] = useState<string[]>(initial);
  const [draft, setDraft] = useState("");

  function commit() {
    const v = draft.trim();
    if (v && !langs.some((l) => l.toLowerCase() === v.toLowerCase())) {
      setLangs((l) => [...l, v]);
    }
    setDraft("");
  }

  return (
    <div className="rounded-lg border border-line bg-card px-2 py-1.5">
      <div className="flex flex-wrap items-center gap-1.5">
        {langs.map((l) => (
          <span
            key={l}
            className="inline-flex items-center gap-1 rounded-full bg-accent-soft px-2 py-0.5 text-[12px] font-medium text-accent"
          >
            {l}
            <button
              type="button"
              onClick={() => setLangs((arr) => arr.filter((x) => x !== l))}
              aria-label={`Remove ${l}`}
              className="text-accent/70 hover:text-accent"
            >
              ✕
            </button>
          </span>
        ))}
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === ",") {
              e.preventDefault();
              commit();
            } else if (e.key === "Backspace" && draft === "" && langs.length) {
              setLangs((l) => l.slice(0, -1));
            }
          }}
          onBlur={commit}
          placeholder={langs.length ? "Add language…" : "e.g. English, Hindi, Arabic…"}
          className="min-w-[8rem] flex-1 bg-transparent px-1 py-1 text-[13px] text-ink outline-none placeholder:text-muted"
        />
      </div>
      <input type="hidden" name={name} value={JSON.stringify(langs)} />
    </div>
  );
}
