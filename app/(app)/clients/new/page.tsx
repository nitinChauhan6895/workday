import Link from "next/link";
import PageHeader from "@/components/PageHeader";

export default function NewClientPage() {
  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader title="New client" />
      <div className="card p-6 text-[13px] text-subtle">
        <p>
          The New client form (name, products, stage, contacts, dates, progress
          mode) is built in{" "}
          <span className="font-medium text-ink">Phase 4 — Clients</span>.
        </p>
        <Link href="/clients" className="mt-4 inline-block text-accent hover:underline">
          ← Back to Clients
        </Link>
      </div>
    </div>
  );
}
