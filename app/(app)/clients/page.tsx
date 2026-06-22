import Link from "next/link";
import { getClients, getItems } from "@/lib/data";
import { clientProgress } from "@/lib/derive";
import { STAGE_META } from "@/lib/types";
import PageHeader from "@/components/PageHeader";
import RealtimeRefresh from "@/components/RealtimeRefresh";

export const dynamic = "force-dynamic";

export default async function ClientsPage() {
  const [clients, items] = await Promise.all([getClients(), getItems()]);

  return (
    <div>
      <RealtimeRefresh />
      <PageHeader
        title="Clients"
        subtitle={`${clients.length} active`}
        action={
          <Link
            href="/clients/new"
            className="rounded-lg bg-accent px-3 py-2 text-[13px] font-medium text-white transition hover:bg-accent-dark"
          >
            New client
          </Link>
        }
      />

      {clients.length === 0 ? (
        <Link
          href="/clients/new"
          className="card block px-4 py-10 text-center text-[13px] text-muted transition hover:bg-canvas"
        >
          No clients yet — add your first one.
        </Link>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {clients.map((c) => {
            const pct = clientProgress(c, items);
            const open = items.filter(
              (i) => i.client_id === c.id && i.status !== "done",
            ).length;
            return (
              <Link key={c.id} href={`/clients/${c.id}`} className="card p-4 transition hover:shadow-pop">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="truncate text-[14px] font-semibold text-ink">{c.name}</div>
                    <div className="mt-0.5 text-[12px] text-muted">
                      {c.products.join(" · ") || "—"}
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
      )}
    </div>
  );
}
