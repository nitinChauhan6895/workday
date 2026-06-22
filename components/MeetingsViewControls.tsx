"use client";

import { useRouter, useSearchParams } from "next/navigation";

type View = "day" | "week" | "list";

export default function MeetingsViewControls({
  view,
  date,
  label,
}: {
  view: View;
  date: string;
  label: string;
}) {
  const router = useRouter();
  const params = useSearchParams();

  function push(next: Partial<{ view: View; date: string }>) {
    const p = new URLSearchParams(params.toString());
    if (next.view) p.set("view", next.view);
    if (next.date) p.set("date", next.date);
    router.push(`/meetings?${p.toString()}`);
  }

  function shift(dir: number) {
    const d = new Date(date + "T00:00:00");
    d.setDate(d.getDate() + dir * (view === "week" ? 7 : 1));
    const iso = d.toISOString().slice(0, 10);
    push({ date: iso });
  }

  function today() {
    const now = new Date();
    const tz = now.getTimezoneOffset() * 60000;
    push({ date: new Date(now.getTime() - tz).toISOString().slice(0, 10) });
  }

  return (
    <div className="mb-4 flex flex-wrap items-center gap-2">
      {/* View toggle */}
      <div className="inline-flex rounded-lg border border-line bg-card p-0.5">
        {(["day", "week", "list"] as View[]).map((v) => (
          <button
            key={v}
            onClick={() => push({ view: v })}
            className={`rounded-md px-2.5 py-1 text-[12px] font-medium capitalize transition ${
              view === v ? "bg-accent text-white" : "text-subtle hover:text-ink"
            }`}
          >
            {v}
          </button>
        ))}
      </div>

      {/* Date navigation (hidden in list view) */}
      {view !== "list" && (
        <div className="flex items-center gap-1">
          <button
            onClick={() => shift(-1)}
            aria-label="Previous"
            className="flex h-7 w-7 items-center justify-center rounded-lg border border-line bg-card text-subtle transition hover:bg-canvas hover:text-ink"
          >
            ‹
          </button>
          <button
            onClick={today}
            className="rounded-lg border border-line bg-card px-2.5 py-1 text-[12px] font-medium text-ink transition hover:bg-canvas"
          >
            Today
          </button>
          <button
            onClick={() => shift(1)}
            aria-label="Next"
            className="flex h-7 w-7 items-center justify-center rounded-lg border border-line bg-card text-subtle transition hover:bg-canvas hover:text-ink"
          >
            ›
          </button>
          <span className="ml-2 text-[13px] font-medium text-ink">{label}</span>
        </div>
      )}
    </div>
  );
}
