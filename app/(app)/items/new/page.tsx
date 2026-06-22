import Link from "next/link";
import { getClients, getMeetings } from "@/lib/data";
import { createItem } from "../actions";
import PageHeader from "@/components/PageHeader";
import ItemForm from "@/components/ItemForm";

export const dynamic = "force-dynamic";

export default async function NewItemPage() {
  const [clients, meetings] = await Promise.all([getClients(), getMeetings()]);

  return (
    <div className="mx-auto max-w-2xl">
      <Link href="/items" className="mb-4 inline-flex items-center gap-1 text-[12px] text-subtle hover:text-ink">
        ← Items
      </Link>
      <PageHeader title="New item" />
      <ItemForm
        action={createItem}
        clients={clients}
        meetings={meetings}
        submitLabel="Create item"
      />
    </div>
  );
}
