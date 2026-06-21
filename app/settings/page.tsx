import PageHeader from "@/components/PageHeader";

export default function SettingsPage() {
  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader title="Settings" />

      <div className="card divide-y divide-line/70 overflow-hidden">
        <Row label="Account" value="Wired in Phase 2 (magic-link auth)" />
        <Row label="Sync" value="Supabase realtime — Phase 2" />
        <Row label="Theme" value="Light" />
        <Row label="Version" value="0.1.0 · Phase 1 scaffold" />
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between px-4 py-3">
      <span className="text-[13px] font-medium text-ink">{label}</span>
      <span className="text-[12px] text-muted">{value}</span>
    </div>
  );
}
