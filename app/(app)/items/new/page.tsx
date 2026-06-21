import Link from "next/link";
import PageHeader from "@/components/PageHeader";

export default function NewItemPage() {
  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader title="New item" />
      <div className="card p-6 text-[13px] text-subtle">
        <p>
          The New item form (title, type, client, status, priority, owner,
          assigned dev, due date, links) is built in{" "}
          <span className="font-medium text-ink">Phase 3 — Items</span>, once
          Supabase is wired up.
        </p>
        <Link href="/items" className="mt-4 inline-block text-accent hover:underline">
          ← Back to Items
        </Link>
      </div>
    </div>
  );
}
