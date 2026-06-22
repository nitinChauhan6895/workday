"use client";

import { useRouter, useSearchParams } from "next/navigation";
import type { Client } from "@/lib/types";

export default function MeetingsClientFilter({ clients }: { clients: Client[] }) {
  const router = useRouter();
  const params = useSearchParams();
  const client = params.get("client") ?? "";

  return (
    <select
      value={client}
      onChange={(e) => {
        const v = e.target.value;
        const p = new URLSearchParams(params.toString());
        if (v) p.set("client", v);
        else p.delete("client");
        const qs = p.toString();
        router.push(qs ? `/meetings?${qs}` : "/meetings");
      }}
      className="rounded-lg border border-line bg-card px-2.5 py-1.5 text-[12px] text-ink outline-none focus:border-accent"
      aria-label="Filter by client"
    >
      <option value="">All clients</option>
      <option value="internal">Internal (none)</option>
      {clients.map((c) => (
        <option key={c.id} value={c.id}>{c.name}</option>
      ))}
    </select>
  );
}
