import Link from "next/link";
import type { Item, Client } from "@/lib/types";
import { isOverdue, todayISO } from "@/lib/derive";
import { TypeBadge, PriorityBadge } from "./Badge";

function formatDue(
  due: string | null,
  today: string,
): { label: string; overdue: boolean } | null {
  if (!due) return null;
  const overdue = due < today;
  const isToday = due === today;
  const d = new Date(due + "T00:00:00");
  const label = isToday
    ? "Today"
    : d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  return { label, overdue };
}

export default function ItemRow({
  item,
  client,
}: {
  item: Item;
  client?: Client | null;
}) {
  const today = todayISO();
  const done = item.status === "done";
  const due = formatDue(item.due_date, today);
  const overdue = isOverdue(item, today);

  return (
    <div className="flex items-center gap-3 px-4 py-2.5">
      {/* Visual checkbox — interactive in Phase 3 */}
      <span
        className={`flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-md border ${
          done ? "border-accent bg-accent text-white" : "border-line bg-card"
        }`}
        aria-hidden
      >
        {done && (
          <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12l5 5 9-11" />
          </svg>
        )}
      </span>

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
            <span className={overdue ? "text-[#C81E1E]" : ""}>· {due.label}</span>
          )}
        </div>
      </Link>

      <div className="flex shrink-0 items-center gap-1.5">
        <TypeBadge type={item.type} />
        {!done && <PriorityBadge priority={item.priority} />}
      </div>
    </div>
  );
}
