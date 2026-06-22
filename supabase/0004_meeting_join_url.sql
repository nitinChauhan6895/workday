-- WorkDay — store the Teams/online join URL for a meeting (from calendar sync).
-- Re-runnable. Re-sync your calendar after running this to backfill existing rows.

alter table public.meetings add column if not exists join_url text;
