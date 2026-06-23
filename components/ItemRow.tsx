"use client";

import { useState } from "react";
import Link from "next/link";
import type { Item, Client } from "@/lib/types";
import { isOverdue, todayISO } from "@/lib/derive";
import { TypeBadge, PriorityBadge } from "./Badge";
import ItemCheckbox from "./ItemCheckbox";
import CloneItemButton from "./CloneItemButton";

function formatDue(due: string, today: string): { label: string; tone: string } {
  const d = new Date(due + "T00:00:00");
  const isToday = due === today;
  const overdue = due < today;
  const label = isToday
    ? "Today"
    : d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  const tone = overdue
    ? "text-[#C81E1E]" // red
    : isToday
      ? "text-[#EA580C]" // orange
      : "text-accent"; // upcoming
  return { label, tone };
}

export default function ItemRow({
  item,
  client,
  trailing,
}: {
  item: Item;
  client?: Client | null;
  trailing?: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const today = todayISO();
  const done = item.status === "done";
  const due = item.due_date ? formatDue(item.due_date, today) : null;
  const overdue = isOverdue(item, today);
  const hasDetails =
    !!item.description || item.links.length > 0 || item.checklist.length > 0;

  return (
    <div>
      <div className="flex items-center gap-3 px-4 py-2.5">
        <ItemCheckbox id={item.id} done={done} />

        <Link href={`/items/${item.id}`} className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className={`truncate text-[13px] ${done ? "item-done" : "text-ink"}`}>
              {item.title}
            </span>
          </div>
          <div className="mt-0.5 flex items-center gap-2 text-[11px] text-muted">
            <span>{client ? client.name : "Internal"}</span>
            {item.assigned_dev && <span>· {item.assigned_dev}</span>}
            {due && (
              <span className={`font-medium ${overdue ? "text-[#C81E1E]" : due.tone}`}>
                · {due.label}
              </span>
            )}
          </div>
        </Link>

        <div className="flex shrink-0 items-center gap-1.5">
          {item.language && (
            <span className="rounded-full bg-accent-soft px-2 py-0.5 text-[10px] font-medium text-accent">
              {item.language}
            </span>
          )}
          <TypeBadge type={item.type} />
          {!done && <PriorityBadge priority={item.priority} />}
          {trailing}
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-label={open ? "Collapse" : "Expand"}
            aria-expanded={open}
            className="flex h-6 w-6 items-center justify-center rounded-md text-muted transition hover:bg-canvas hover:text-ink"
          >
            <svg
              viewBox="0 0 24 24"
              className={`h-4 w-4 transition-transform ${open ? "rotate-90" : ""}`}
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M9 6l6 6-6 6" />
            </svg>
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-line/70 bg-canvas/40 px-4 py-3 pl-11">
          {item.description && (
            <p className="mb-3 whitespace-pre-wrap text-[12px] leading-relaxed text-subtle">
              {item.description}
            </p>
          )}

          {item.checklist.length > 0 && (
            <ul className="mb-3 space-y-1">
              {item.checklist.map((c, i) => (
                <li key={i} className="flex items-center gap-2 text-[12px]">
                  <span
                    className={`flex h-3.5 w-3.5 items-center justify-center rounded border ${
                      c.done ? "border-accent bg-accent text-white" : "border-line"
                    }`}
                  >
                    {c.done && (
                      <svg viewBox="0 0 24 24" className="h-2 w-2" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M5 12l5 5 9-11" />
                      </svg>
                    )}
                  </span>
                  <span className={c.done ? "text-muted line-through" : "text-ink"}>{c.text}</span>
                </li>
              ))}
            </ul>
          )}

          {item.links.length > 0 && (
            <div className="mb-3 flex flex-wrap gap-2">
              {item.links.map((l, i) => (
                <a
                  key={i}
                  href={l.url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 rounded-lg border border-line bg-card px-2.5 py-1 text-[12px] text-accent hover:bg-canvas"
                >
                  {l.title || l.url}
                </a>
              ))}
            </div>
          )}

          {!hasDetails && (
            <p className="mb-3 text-[12px] text-muted">No extra details on this item.</p>
          )}

          <div className="flex items-center gap-2">
            <Link
              href={`/items/${item.id}`}
              className="rounded-lg bg-accent px-3 py-1.5 text-[12px] font-medium text-white transition hover:bg-accent-dark"
            >
              Edit
            </Link>
            <CloneItemButton id={item.id} />
          </div>
        </div>
      )}
    </div>
  );
}
