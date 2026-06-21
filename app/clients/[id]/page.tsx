import Link from "next/link";
import { notFound } from "next/navigation";
import {
  clients,
  clientProgress,
  itemsForClient,
  meetings,
} from "@/lib/mock";
import { STAGE_META } from "@/lib/types";
import ItemRow from "@/components/ItemRow";

export default function ClientDetailPage({ params }: { params: { id: string } }) {
  const client = clients.find((c) => c.id === params.id);
  if (!client) notFound();

  const pct = clientProgress(client);
  const own = itemsForClient(client.id);
  const open = own.filter((i) => i.status !== "done");
  const done = own.filter((i) => i.status === "done");
  const clientMeetings = meetings
    .filter((m) => m.client_id === client.id)
    .sort((a, b) => b.datetime.localeCompare(a.datetime));

  return (
    <div className="mx-auto max-w-3xl">
      <Link href="/clients" className="mb-4 inline-flex items-center gap-1 text-[12px] text-subtle hover:text-ink">
        ← Clients
      </Link>

      <div className="card p-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-ink">{client.name}</h1>
            <p className="mt-0.5 text-[12px] text-muted">{client.products.join(" · ")}</p>
          </div>
          <span className="rounded-full bg-canvas px-2.5 py-1 text-[12px] font-medium text-subtle hairline">
            {STAGE_META[client.stage].label}
          </span>
        </div>

        <div className="mt-4 flex items-center gap-3">
          <div className="h-2 flex-1 overflow-hidden rounded-full bg-line">
            <div className="h-full rounded-full bg-accent" style={{ width: `${pct}%` }} />
          </div>
          <span className="text-[13px] font-medium tabular-nums text-ink">{pct}%</span>
          <span className="text-[11px] text-muted">
            ({client.progress_mode})
          </span>
        </div>

        <dl className="mt-5 grid grid-cols-2 gap-x-6 gap-y-3 text-[13px] sm:grid-cols-3">
          <Field label="Primary contact">{client.primary_contact ?? "—"}</Field>
          <Field label="Email">{client.contact_email ?? "—"}</Field>
          <Field label="Kickoff">{client.kickoff_date ?? "—"}</Field>
          <Field label="Target go-live">{client.target_golive ?? "—"}</Field>
          <Field label="Link">
            {client.link ? (
              <a href={client.link} target="_blank" rel="noreferrer" className="text-accent hover:underline">
                Open
              </a>
            ) : (
              "—"
            )}
          </Field>
        </dl>
        {client.notes && (
          <p className="mt-4 rounded-lg bg-canvas px-3 py-2 text-[12px] text-subtle">{client.notes}</p>
        )}
      </div>

      <Section title={`Open items (${open.length})`}>
        {open.length ? (
          <div className="card divide-y divide-line/70 overflow-hidden">
            {open.map((i) => <ItemRow key={i.id} item={i} />)}
          </div>
        ) : (
          <Empty>No open items.</Empty>
        )}
      </Section>

      {done.length > 0 && (
        <Section title={`Done (${done.length})`}>
          <div className="card divide-y divide-line/70 overflow-hidden">
            {done.map((i) => <ItemRow key={i.id} item={i} />)}
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
