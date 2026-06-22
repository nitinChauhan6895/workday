-- WorkDay — Phase 3: lightweight activity log for items. Re-runnable.
-- The app works without this table (the activity panel just stays empty), but
-- running it gives each item a status-history / activity feed.

create table if not exists public.item_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  item_id uuid not null references public.items(id) on delete cascade,
  kind text not null
    check (kind in ('created','status','completed','reopened','edited')),
  detail text,
  created_at timestamptz not null default now()
);

create index if not exists item_events_item_idx on public.item_events(item_id);
create index if not exists item_events_user_idx on public.item_events(user_id);

alter table public.item_events enable row level security;

drop policy if exists item_events_owner on public.item_events;
create policy item_events_owner on public.item_events
  for all to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
