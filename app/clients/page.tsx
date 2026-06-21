import Link from "next/link";
import { clients, clientProgress, itemsForClient } from "@/lib/mock";
import { STAGE_META } from "@/lib/types";
import PageHeader from "@/components/PageHeader";

export default function ClientsPage() {
  return (
    <div>
      <PageHeader title="Clients" subtitle={`${clients.length} active`} />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {clients.map((c) => {
          const pct = clientProgress(c);
          const open = itemsForClient(c.id).filter((i) => i.status !== "done").length;
          return (
            <Link key={c.id} href={`/clients/${c.id}`} className="card p-4 transition hover:shadow-pop">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="truncate text-[14px] font-semibold text-ink">{c.name}</div>
                  <div className="mt-0.5 text-[12px] text-muted">
                    {c.products.join(" · ")}
                  </div>
                </div>
                <span className="shrink-0 rounded-full bg-canvas px-2 py-0.5 text-[11px] font-medium text-subtle hairline">
                  {STAGE_META[c.stage].label}
                </span>
              </div>

              <div className="mt-3 flex items-center gap-2">
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-line">
                  <div className="h-full rounded-full bg-accent" style={{ width: `${pct}%` }} />
                </div>
                <span className="w-8 text-right text-[11px] tabular-nums text-subtle">{pct}%</span>
              </div>

              <div className="mt-2 text-[11px] text-muted">{open} open items</div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
