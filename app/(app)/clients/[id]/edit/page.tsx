import Link from "next/link";
import { notFound } from "next/navigation";
import { getClient } from "@/lib/data";
import { updateClient } from "../../actions";
import PageHeader from "@/components/PageHeader";
import ClientForm from "@/components/ClientForm";
import DeleteClientButton from "@/components/DeleteClientButton";

export const dynamic = "force-dynamic";

export default async function EditClientPage({ params }: { params: { id: string } }) {
  const client = await getClient(params.id);
  if (!client) notFound();

  const update = updateClient.bind(null, client.id);

  return (
    <div className="mx-auto max-w-2xl">
      <Link href={`/clients/${client.id}`} className="mb-4 inline-flex items-center gap-1 text-[12px] text-subtle hover:text-ink">
        ← {client.name}
      </Link>
      <PageHeader
        title="Edit client"
        action={<DeleteClientButton id={client.id} />}
      />
      <ClientForm action={update} initial={client} submitLabel="Save changes" />
    </div>
  );
}
