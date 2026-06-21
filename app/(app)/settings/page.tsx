import { createClient } from "@/lib/supabase/server";
import PageHeader from "@/components/PageHeader";
import SignOutButton from "@/components/SignOutButton";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const {
    data: { user },
  } = await createClient().auth.getUser();

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader title="Settings" />

      <div className="card divide-y divide-line/70 overflow-hidden">
        <Row label="Account" value={user?.email ?? "—"} action={<SignOutButton />} />
        <Row label="Sync" value="Supabase realtime — live" />
        <Row label="Theme" value="Light" />
        <Row label="Version" value="0.2.0 · Phase 2 (Supabase wired)" />
      </div>
    </div>
  );
}

function Row({
  label,
  value,
  action,
}: {
  label: string;
  value: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-3 px-4 py-3">
      <div className="min-w-0">
        <div className="text-[13px] font-medium text-ink">{label}</div>
        <div className="truncate text-[12px] text-muted">{value}</div>
      </div>
      {action}
    </div>
  );
}
