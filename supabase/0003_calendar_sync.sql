-- WorkDay — Phase 9: Outlook/Teams calendar sync via a published .ics feed.
-- Re-runnable.

-- Per-user app settings (holds the secret ICS URL + last sync time).
create table if not exists public.app_settings (
  user_id uuid primary key default auth.uid() references auth.users(id) on delete cascade,
  ics_url text,
  calendar_last_synced_at timestamptz
);

alter table public.app_settings enable row level security;
drop policy if exists app_settings_owner on public.app_settings;
create policy app_settings_owner on public.app_settings
  for all to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Stable identifier for a calendar-sourced meeting (event UID + occurrence),
-- used to upsert without duplicating. NULL for manually-created meetings.
alter table public.meetings add column if not exists ics_uid text;

-- (user_id, ics_uid) unique so re-syncs update in place. Multiple NULLs are
-- allowed (Postgres treats NULLs as distinct), so manual meetings don't collide.
create unique index if not exists meetings_user_ics_uid_key
  on public.meetings(user_id, ics_uid);
