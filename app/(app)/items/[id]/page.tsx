import Link from "next/link";
import { notFound } from "next/navigation";
import { getItem, getClients, getMeeting, getItemEvents } from "@/lib/data";
import { updateItem } from "../actions";
import ItemForm from "@/components/ItemForm";
import DeleteItemButton from "@/components/DeleteItemButton";
import { TypeBadge, StatusBadge } from "@/components/Badge";
import type { ItemEvent } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function ItemDetailPage({ params }: { params: { id: string } }) {
  const item = await getItem(params.id);
  if (!item) notFound();

  const [clients, sourceMeeting, events] = await Promise.all([
    getClients(),
    item.meeting_id ? getMeeting(item.meeting_id) : Promise.resolve(null),
    getItemEvents(item.id),
  ]);

  const update = updateItem.bind(null, item.id);

  return (
    <div className="mx-auto max-w-2xl">
      <Link href="/items" className="mb-4 inline-flex items-center gap-1 text-[12px] text-subtle hover:text-ink">
        ← Items
      </Link>

      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="truncate text-xl font-semibold tracking-tight text-ink">
            {item.title}
          </h1>
          <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
            <TypeBadge type={item.type} />
            <StatusBadge status={item.status} />
          </div>
        </div>
        <DeleteItemButton id={item.id} />
      </div>

      {sourceMeeting && (
        <p className="mb-4 text-[12px] text-subtle">
          From meeting{" "}
          <Link href={`/meetings/${sourceMeeting.id}`} className="text-accent hover:underline">
            {sourceMeeting.title}
          </Link>
        </p>
      )}

      <ItemForm
        action={update}
        clients={clients}
        initial={item}
        submitLabel="Save changes"
      />

      <section className="mt-6">
        <h2 className="mb-2 px-1 text-[13px] font-semibold text-ink">Activity</h2>
        <div className="card overflow-hidden">
          {events.length === 0 ? (
            <p className="px-4 py-5 text-center text-[12px] text-muted">
              No activity yet. Changes you make are logged here.
            </p>
          ) : (
            <ul className="divide-y divide-line/70">
              {events.map((e) => (
                <li key={e.id} className="flex items-center justify-between gap-3 px-4 py-2.5">
                  <span className="text-[12px] text-ink">{describe(e)}</span>
                  <span className="shrink-0 text-[11px] tabular-nums text-muted">
                    {relTime(e.created_at)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
}

function describe(e: ItemEvent): string {
  switch (e.kind) {
    case "created":
      return "Created";
    case "completed":
      return e.detail ? `Completed (${e.detail})` : "Marked done";
    case "reopened":
      return "Reopened";
    case "status":
      return `Status: ${e.detail ?? "changed"}`;
    case "edited":
      return "Edited";
    default:
      return e.kind;
  }
}

function relTime(iso: string): string {
  const then = new Date(iso).getTime();
  const diff = Date.now() - then;
  const min = Math.round(diff / 60000);
  if (min < 1) return "just now";
  if (min < 60) return `${min}m ago`;
  const hr = Math.round(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.round(hr / 24);
  if (day < 7) return `${day}d ago`;
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}
