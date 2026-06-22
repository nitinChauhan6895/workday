"use client";

import { useState } from "react";
import Link from "next/link";
import type { Item, Client } from "@/lib/types";
import ItemRow from "./ItemRow";

// Dashboard "Items" widget: items for the next 3 business days, with a client filter.
export default function DashboardItems({
  items,
  clients,
}: {
  items: Item[];
  clients: Client[];
}) {
  const [clientId, setClientId] = useState("");
  const clientMap = new Map(clients.map((c) => [c.id, c]));

  const shown = items.filter((i) => {
    if (clientId === "internal") return i.client_id === null;
    if (clientId) return i.client_id === clientId;
    return true;
  });

  return (
    <section>
      <div className="mb-2 flex items-center justify-between gap-2 px-1">
        <h2 className="text-[13px] font-semibold text-ink">Items</h2>
        <div className="flex items-center gap-2">
          <select
            value={clientId}
            onChange={(e) => setClientId(e.target.value)}
            className="rounded-lg border border-line bg-card px-2 py-1 text-[12px] text-ink outline-none focus:border-accent"
            aria-label="Filter by client"
          >
            <option value="">All clients</option>
            <option value="internal">Internal</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <Link href="/items" className="text-[12px] text-accent hover:underline">
            View all
          </Link>
        </div>
      </div>
      <div className="card divide-y divide-line/70 overflow-hidden">
        {shown.length === 0 ? (
          <div className="px-4 py-6 text-center text-[12px] text-muted">
            Nothing due in the next 3 working days.
          </div>
        ) : (
          shown.map((i) => (
            <ItemRow key={i.id} item={i} client={clientMap.get(i.client_id ?? "")} />
          ))
        )}
      </div>
    </section>
  );
}
