import { getItems, getClients, clientsById } from "@/lib/data";
import { ITEM_TYPE_META, type ItemType } from "@/lib/types";
import PageHeader from "@/components/PageHeader";
import ItemRow from "@/components/ItemRow";
import RealtimeRefresh from "@/components/RealtimeRefresh";

export const dynamic = "force-dynamic";

const TYPES: ItemType[] = ["deploy", "bug", "action", "support", "qa"];

export default async function ItemsPage() {
  const [items, clients] = await Promise.all([getItems(), getClients()]);
  const clientMap = clientsById(clients);

  // Open items first, then done; within each, by position.
  const sorted = [...items].sort((a, b) => {
    const ad = a.status === "done" ? 1 : 0;
    const bd = b.status === "done" ? 1 : 0;
    if (ad !== bd) return ad - bd;
    return a.position - b.position;
  });

  return (
    <div>
      <RealtimeRefresh />
      <PageHeader title="Items" subtitle={`${items.length} total`} />

      {/* Filter bar — wired up in Phase 3 */}
      <div className="mb-4 flex flex-wrap items-center gap-1.5">
        <FilterChip active>All</FilterChip>
        {TYPES.map((t) => (
          <FilterChip key={t}>{ITEM_TYPE_META[t].label}</FilterChip>
        ))}
      </div>

      <div className="card divide-y divide-line/70 overflow-hidden">
        {sorted.length === 0 ? (
          <div className="px-4 py-10 text-center text-[13px] text-muted">
            No items yet. Create one with “New item”.
          </div>
        ) : (
          sorted.map((i) => (
            <ItemRow key={i.id} item={i} client={clientMap.get(i.client_id ?? "")} />
          ))
        )}
      </div>
    </div>
  );
}

function FilterChip({
  children,
  active,
}: {
  children: React.ReactNode;
  active?: boolean;
}) {
  return (
    <span
      className={`cursor-default rounded-full px-2.5 py-1 text-[12px] font-medium ${
        active ? "bg-ink text-white" : "bg-card text-subtle hairline"
      }`}
    >
      {children}
    </span>
  );
}
