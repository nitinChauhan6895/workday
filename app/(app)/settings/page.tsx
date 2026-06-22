import { createClient } from "@/lib/supabase/server";
import { getSettings } from "@/lib/data";
import { APP_VERSION } from "@/lib/version";
import PageHeader from "@/components/PageHeader";
import SignOutButton from "@/components/SignOutButton";
import CalendarSync from "@/components/CalendarSync";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const [{ data: { user } }, settings] = await Promise.all([
    createClient().auth.getUser(),
    getSettings(),
  ]);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <PageHeader title="Settings" />

      <div className="card divide-y divide-line/70 overflow-hidden">
        <Row label="Account" value={user?.email ?? "—"} action={<SignOutButton />} />
        <Row label="Sync" value="Supabase realtime — live" />
        <Row label="Theme" value="Light" />
        <Row label="Version" value={APP_VERSION} />
      </div>

      <section>
        <h2 className="mb-2 px-1 text-[13px] font-semibold text-ink">
          Outlook / Teams calendar
        </h2>
        <div className="card p-5">
          <CalendarSync
            icsUrl={settings?.ics_url ?? null}
            lastSynced={settings?.calendar_last_synced_at ?? null}
          />
        </div>
        <p className="mt-2 px-1 text-[11px] text-muted">
          In Outlook → Settings → Calendar → Shared calendars → Publish a calendar
          (permission “Can view all details”), copy the .ics link and paste it
          above. Outlook refreshes the feed on its own schedule, so new meetings
          can take a while to appear.
        </p>
      </section>
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
