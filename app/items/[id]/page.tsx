import Link from "next/link";
import { notFound } from "next/navigation";
import { items, clientById, meetingById } from "@/lib/mock";
import { TypeBadge, PriorityBadge, StatusBadge } from "@/components/Badge";

export default function ItemDetailPage({ params }: { params: { id: string } }) {
  const item = items.find((i) => i.id === params.id);
  if (!item) notFound();

  const client = clientById(item.client_id);
  const meeting = meetingById(item.meeting_id);

  return (
    <div className="mx-auto max-w-2xl">
      <Link href="/items" className="mb-4 inline-flex items-center gap-1 text-[12px] text-subtle hover:text-ink">
        ← Items
      </Link>

      <div className="card p-6">
        <div className="mb-3 flex flex-wrap items-center gap-1.5">
          <TypeBadge type={item.type} />
          <StatusBadge status={item.status} />
          <PriorityBadge priority={item.priority} />
        </div>

        <h1 className="text-lg font-semibold tracking-tight text-ink">{item.title}</h1>
        {item.description && (
          <p className="mt-2 whitespace-pre-wrap text-[13px] leading-relaxed text-subtle">
            {item.description}
          </p>
        )}

        <dl className="mt-5 grid grid-cols-2 gap-x-6 gap-y-3 text-[13px]">
          <Field label="Client">
            {client ? (
              <Link href={`/clients/${client.id}`} className="text-accent hover:underline">
                {client.name}
              </Link>
            ) : (
              <span className="text-muted">Internal</span>
            )}
          </Field>
          <Field label="Owner">{cap(item.owner)}</Field>
          <Field label="Assigned dev">{item.assigned_dev ?? <Dash />}</Field>
          <Field label="Due date">{item.due_date ?? <Dash />}</Field>
          <Field label="Flagged for standup">{item.flag_for_standup ? "Yes" : "No"}</Field>
          <Field label="From meeting">
            {meeting ? (
              <Link href={`/meetings/${meeting.id}`} className="text-accent hover:underline">
                {meeting.title}
              </Link>
            ) : (
              <Dash />
            )}
          </Field>
          <Field label="External link">
            {item.external_link ? (
              <a
                href={item.external_link}
                target="_blank"
                rel="noreferrer"
                className="break-all text-accent hover:underline"
              >
                {item.external_link}
              </a>
            ) : (
              <Dash />
            )}
          </Field>
          <Field label="Updated">
            {new Date(item.updated_at).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            })}
          </Field>
        </dl>

        <p className="mt-6 border-t border-line pt-4 text-[12px] text-muted">
          Editing, status history and delete arrive in Phase 3.
        </p>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="text-[11px] uppercase tracking-wide text-muted">{label}</dt>
      <dd className="mt-0.5 text-ink">{children}</dd>
    </div>
  );
}
function Dash() {
  return <span className="text-muted">—</span>;
}
function cap(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
