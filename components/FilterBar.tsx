"use client";

import { useRouter, useSearchParams } from "next/navigation";
import type { Client } from "@/lib/types";
import {
  ITEM_TYPE_META,
  STATUS_META,
  type ItemType,
  type ItemStatus,
} from "@/lib/types";

const TYPES: ItemType[] = ["bug", "product", "support", "action"];
const STATUSES: ItemStatus[] = [
  "backlog",
  "in_progress",
  "blocked_on_dev",
  "in_qa",
  "waiting_on_client",
  "done",
];

const selectCls =
  "rounded-lg border border-line bg-card px-2.5 py-1 text-[12px] text-ink outline-none focus:border-accent";

export default function FilterBar({ clients }: { clients: Client[] }) {
  const router = useRouter();
  const params = useSearchParams();

  const type = params.get("type") ?? "";
  const status = params.get("status") ?? "";
  const client = params.get("client") ?? "";

  function setParam(key: string, value: string) {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    const qs = next.toString();
    router.push(qs ? `/items?${qs}` : "/items");
  }

  return (
    <div className="mb-4 flex flex-wrap items-center gap-2">
      <div className="flex flex-wrap items-center gap-1.5">
        <Chip active={type === ""} onClick={() => setParam("type", "")}>
          All
        </Chip>
        {TYPES.map((t) => (
          <Chip key={t} active={type === t} onClick={() => setParam("type", t)}>
            {ITEM_TYPE_META[t].label}
          </Chip>
        ))}
      </div>

      <div className="ml-auto flex items-center gap-2">
        <select
          value={status}
          onChange={(e) => setParam("status", e.target.value)}
          className={selectCls}
        >
          <option value="">Any status</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>{STATUS_META[s].label}</option>
          ))}
        </select>

        <select
          value={client}
          onChange={(e) => setParam("client", e.target.value)}
          className={selectCls}
        >
          <option value="">Any client</option>
          <option value="internal">Internal (none)</option>
          {clients.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>
    </div>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-2.5 py-1 text-[12px] font-medium transition ${
        active ? "bg-ink text-white" : "bg-card text-subtle hairline hover:text-ink"
      }`}
    >
      {children}
    </button>
  );
}
