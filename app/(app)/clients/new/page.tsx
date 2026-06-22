import Link from "next/link";
import { createClient } from "../actions";
import PageHeader from "@/components/PageHeader";
import ClientForm from "@/components/ClientForm";

export const dynamic = "force-dynamic";

export default function NewClientPage() {
  return (
    <div className="mx-auto max-w-2xl">
      <Link href="/clients" className="mb-4 inline-flex items-center gap-1 text-[12px] text-subtle hover:text-ink">
        ← Clients
      </Link>
      <PageHeader title="New client" />
      <ClientForm action={createClient} submitLabel="Create client" />
    </div>
  );
}
