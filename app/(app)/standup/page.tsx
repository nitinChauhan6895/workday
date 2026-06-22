import { getItems, getClients, clientsById } from "@/lib/data";
import type { Item } from "@/lib/types";
import PageHeader from "@/components/PageHeader";
import ItemRow from "@/components/ItemRow";
import StandupFlagToggle from "@/components/StandupFlagToggle";
import RealtimeRefresh from "@/components/RealtimeRefresh";

export const dynamic = "force-dynamic";

export default async function StandupPage() {
  const [items, clients] = await Promise.all([getItems(), getClients()]);
  const clientMap = clientsById(clients);

  // Open items that are blocked on dev OR flagged for standup. Ticking an item
  // done removes it from the call list.
  const relevant = items.filter(
    (i) =>
      i.status !== "done" &&
      (i.status === "blocked_on_dev" || i.flag_for_standup),
  );

  // Group by assigned dev (unassigned last).
  const groups = new Map<string, Item[]>();
  for (const i of relevant) {
    const key = i.assigned_dev ?? "Unassigned";
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(i);
  }
  const ordered = [...groups.entries()].sort((a, b) => {
    if (a[0] === "Unassigned") return 1;
    if (b[0] === "Unassigned") return -1;
    return a[0].localeCompare(b[0]);
  });

  return (
    <div>
      <RealtimeRefresh />
      <PageHeader
        title="Standup"
        subtitle={`${relevant.length} items · blocked on dev or flagged`}
      />

      {ordered.length === 0 ? (
        <div className="card px-4 py-8 text-center text-[13px] text-muted">
          Nothing to raise in standup. 🎉
        </div>
      ) : (
        <div className="flex flex-col gap-5">
          {ordered.map(([dev, list]) => (
            <section key={dev}>
              <div className="mb-2 flex items-center gap-2 px-1">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-accent-soft text-[11px] font-semibold text-accent">
                  {dev === "Unassigned" ? "?" : dev[0]}
                </div>
                <h2 className="text-[13px] font-semibold text-ink">{dev}</h2>
                <span className="text-[11px] text-muted">{list.length}</span>
              </div>
              <div className="card divide-y divide-line/70 overflow-hidden">
                {list.map((i) => (
                  <ItemRow
                    key={i.id}
                    item={i}
                    client={clientMap.get(i.client_id ?? "")}
                    trailing={i.flag_for_standup ? <StandupFlagToggle id={i.id} /> : null}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
