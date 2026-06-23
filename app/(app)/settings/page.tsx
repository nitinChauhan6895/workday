import { getSettings, getSessionUser } from "@/lib/data";
import { APP_VERSION } from "@/lib/version";
import PageHeader from "@/components/PageHeader";
import SignOutButton from "@/components/SignOutButton";
import CalendarSync from "@/components/CalendarSync";
import ProfileForm from "@/components/ProfileForm";
import ChangePasswordForm from "@/components/ChangePasswordForm";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const [user, settings] = await Promise.all([getSessionUser(), getSettings()]);

  const meta = (user?.user_metadata ?? {}) as Record<string, string>;
  const profile = {
    first_name: meta.first_name ?? "",
    last_name: meta.last_name ?? "",
    organisation: meta.organisation ?? "",
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <PageHeader title="Settings" />

      <Section title="Profile">
        <ProfileForm initial={profile} email={user?.email ?? ""} />
      </Section>

      <Section title="Password">
        <ChangePasswordForm />
      </Section>

      <Section title="Account">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[13px] text-ink">{user?.email ?? "—"}</div>
            <div className="text-[12px] text-muted">Realtime sync · MyDay v{APP_VERSION}</div>
          </div>
          <SignOutButton />
        </div>
      </Section>

      <section>
        <h2 className="mb-2 px-1 text-[13px] font-semibold text-ink">Outlook / Teams calendar</h2>
        <div className="card p-5">
          <CalendarSync
            icsUrl={settings?.ics_url ?? null}
            lastSynced={settings?.calendar_last_synced_at ?? null}
          />
        </div>
        <p className="mt-2 px-1 text-[11px] text-muted">
          In Outlook → Settings → Calendar → Shared calendars → Publish a calendar
          (“Can view all details”), copy the .ics link and paste it above.
        </p>
      </section>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="mb-2 px-1 text-[13px] font-semibold text-ink">{title}</h2>
      <div className="card p-5">{children}</div>
    </section>
  );
}
