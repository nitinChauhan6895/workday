import { getItems, getClients, clientsById } from "@/lib/data";
import PageHeader from "@/components/PageHeader";
import ItemRow from "@/components/ItemRow";
import FilterBar from "@/components/FilterBar";
import RealtimeRefresh from "@/components/RealtimeRefresh";

export const dynamic = "force-dynamic";

export default async function ItemsPage({
  searchParams,
}: {
  searchParams: { type?: string; status?: string; client?: string };
}) {
  const [allItems, clients] = await Promise.all([getItems(), getClients()]);
  const clientMap = clientsById(clients);

  const { type, status, client } = searchParams;
  const filtered = allItems.filter((i) => {
    if (type && i.type !== type) return false;
    if (status && i.status !== status) return false;
    if (client === "internal" && i.client_id !== null) return false;
    if (client && client !== "internal" && i.client_id !== client) return false;
    return true;
  });

  // Open items first, then done; within each, by position.
  const sorted = [...filtered].sort((a, b) => {
    const ad = a.status === "done" ? 1 : 0;
    const bd = b.status === "done" ? 1 : 0;
    if (ad !== bd) return ad - bd;
    return a.position - b.position;
  });

  const filtering = !!(type || status || client);

  return (
    <div>
      <RealtimeRefresh />
      <PageHeader
        title="Items"
        subtitle={
          filtering
            ? `${sorted.length} of ${allItems.length}`
            : `${allItems.length} total`
        }
      />

      <FilterBar clients={clients} />

      <div className="card divide-y divide-line/70 overflow-hidden">
        {sorted.length === 0 ? (
          <div className="px-4 py-10 text-center text-[13px] text-muted">
            {filtering
              ? "No items match these filters."
              : "No items yet. Create one with “New item”."}
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
