import Link from "next/link";
import { notFound } from "next/navigation";
import { getClient, getItemsForClient, getMeetingsForClient } from "@/lib/data";
import { clientProgress } from "@/lib/derive";
import { STAGE_META } from "@/lib/types";
import ItemRow from "@/components/ItemRow";
import ClientOpenItems from "@/components/ClientOpenItems";

export const dynamic = "force-dynamic";

export default async function ClientDetailPage({ params }: { params: { id: string } }) {
  const client = await getClient(params.id);
  if (!client) notFound();

  const [own, clientMeetings] = await Promise.all([
    getItemsForClient(client.id),
    getMeetingsForClient(client.id),
  ]);
  const pct = clientProgress(client, own);
  const open = own.filter((i) => i.status !== "done");
  const done = own.filter((i) => i.status === "done");

  return (
    <div className="mx-auto max-w-3xl">
      <Link href="/clients" className="mb-4 inline-flex items-center gap-1 text-[12px] text-subtle hover:text-ink">
        ← Clients
      </Link>

      <div className="card p-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-ink">{client.name}</h1>
            <p className="mt-0.5 text-[12px] text-muted">{client.products.join(" · ") || "—"}</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-canvas px-2.5 py-1 text-[12px] font-medium text-subtle hairline">
              {STAGE_META[client.stage].label}
            </span>
            <Link
              href={`/clients/${client.id}/edit`}
              className="rounded-lg border border-line bg-card px-3 py-1.5 text-[12px] font-medium text-ink transition hover:bg-canvas"
            >
              Edit
            </Link>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-3">
          <div className="h-2 flex-1 overflow-hidden rounded-full bg-line">
            <div className="h-full rounded-full bg-accent" style={{ width: `${pct}%` }} />
          </div>
          <span className="text-[13px] font-medium tabular-nums text-ink">{pct}%</span>
          <span className="text-[11px] text-muted">({client.progress_mode})</span>
        </div>

        {client.languages.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-1.5">
            {client.languages.map((l) => (
              <span key={l} className="rounded-full bg-accent-soft px-2 py-0.5 text-[11px] font-medium text-accent">
                {l}
              </span>
            ))}
          </div>
        )}

        <dl className="mt-5 grid grid-cols-2 gap-x-6 gap-y-3 text-[13px] sm:grid-cols-3">
          <Field label="Kickoff">{client.kickoff_date ?? "—"}</Field>
          <Field label="Target go-live">{client.target_golive ?? "—"}</Field>
        </dl>

        {client.links.length > 0 && (
          <div className="mt-4">
            <div className="mb-1 text-[11px] uppercase tracking-wide text-muted">Links</div>
            <ul className="flex flex-wrap gap-2">
              {client.links.map((l, i) => (
                <li key={i}>
                  <a
                    href={l.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 rounded-lg border border-line bg-card px-2.5 py-1 text-[12px] text-accent hover:bg-canvas"
                  >
                    {l.title || l.url}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}

        {client.notes && (
          <p className="mt-4 rounded-lg bg-canvas px-3 py-2 text-[12px] text-subtle">{client.notes}</p>
        )}

        {client.checklist.length > 0 && (
          <ul className="mt-4 space-y-1">
            {client.checklist.map((c, i) => (
              <li key={i} className="flex items-center gap-2 text-[13px]">
                <span
                  className={`flex h-4 w-4 items-center justify-center rounded border ${
                    c.done ? "border-accent bg-accent text-white" : "border-line"
                  }`}
                >
                  {c.done && (
                    <svg viewBox="0 0 24 24" className="h-2.5 w-2.5" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12l5 5 9-11" />
                    </svg>
                  )}
                </span>
                <span className={c.done ? "text-muted line-through" : "text-ink"}>{c.text}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <ClientOpenItems items={open} client={client} />

      {done.length > 0 && (
        <Section title={`Done (${done.length})`}>
          <div className="card divide-y divide-line/70 overflow-hidden">
            {done.map((i) => <ItemRow key={i.id} item={i} client={client} />)}
          </div>
        </Section>
      )}

      <Section title={`Meetings (${clientMeetings.length})`}>
        {clientMeetings.length ? (
          <div className="card divide-y divide-line/70 overflow-hidden">
            {clientMeetings.map((m) => (
              <Link key={m.id} href={`/meetings/${m.id}`} className="flex items-center justify-between px-4 py-3 transition hover:bg-canvas">
                <span className="truncate text-[13px] text-ink">{m.title}</span>
                <span className="shrink-0 text-[11px] text-muted">
                  {new Date(m.datetime).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                </span>
              </Link>
            ))}
          </div>
        ) : (
          <Empty>No meetings yet.</Empty>
        )}
      </Section>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="text-[11px] uppercase tracking-wide text-muted">{label}</dt>
      <dd className="mt-0.5 break-words text-ink">{children}</dd>
    </div>
  );
}
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-6">
      <h2 className="mb-2 px-1 text-[13px] font-semibold text-ink">{title}</h2>
      {children}
    </section>
  );
}
function Empty({ children }: { children: React.ReactNode }) {
  return <div className="card px-4 py-6 text-center text-[12px] text-muted">{children}</div>;
}
