-- WorkDay — schema (Phase 2). Single user; RLS = auth.uid() = user_id on every table.
-- Re-runnable: safe to paste into the Supabase SQL editor more than once.

-- ---------- updated_at helper ----------
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------- clients ----------
create table if not exists public.clients (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  name text not null,
  products text[] not null default '{}',                 -- subset of ASR/STT/TTS
  stage text not null default 'onboarding'
    check (stage in ('onboarding','in_progress','in_qa','live','on_hold')),
  progress_mode text not null default 'auto'
    check (progress_mode in ('auto','manual')),
  progress_manual int not null default 0
    check (progress_manual between 0 and 100),
  primary_contact text,
  contact_email text,
  kickoff_date date,
  target_golive date,
  link text,
  notes text,
  created_at timestamptz not null default now()
);

-- ---------- meetings ----------
create table if not exists public.meetings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  title text not null,
  client_id uuid references public.clients(id) on delete set null,
  datetime timestamptz not null default now(),
  attendees text,
  raw_notes text,
  created_at timestamptz not null default now()
);

-- ---------- items ----------
create table if not exists public.items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  title text not null,
  description text,
  type text not null default 'action'
    check (type in ('deploy','bug','action','support','qa')),
  client_id uuid references public.clients(id) on delete set null,
  status text not null default 'backlog'
    check (status in ('backlog','in_progress','blocked_on_dev','in_qa','waiting_on_client','done')),
  priority text not null default 'med'
    check (priority in ('high','med','low')),
  owner text not null default 'me'
    check (owner in ('me','dev','client')),
  assigned_dev text,
  due_date date,
  flag_for_standup boolean not null default false,
  meeting_id uuid references public.meetings(id) on delete set null,
  external_link text,
  position int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------- indexes ----------
create index if not exists items_user_idx on public.items(user_id);
create index if not exists items_client_idx on public.items(client_id);
create index if not exists items_meeting_idx on public.items(meeting_id);
create index if not exists items_status_idx on public.items(status);
create index if not exists meetings_user_idx on public.meetings(user_id);
create index if not exists meetings_client_idx on public.meetings(client_id);
create index if not exists clients_user_idx on public.clients(user_id);

-- ---------- updated_at trigger (items) ----------
drop trigger if exists items_set_updated_at on public.items;
create trigger items_set_updated_at
  before update on public.items
  for each row execute function public.set_updated_at();

-- ---------- Row Level Security ----------
alter table public.clients  enable row level security;
alter table public.meetings enable row level security;
alter table public.items    enable row level security;

do $$
declare t text;
begin
  foreach t in array array['clients','meetings','items'] loop
    execute format('drop policy if exists %I_owner on public.%I', t, t);
    execute format(
      'create policy %I_owner on public.%I
         for all to authenticated
         using (auth.uid() = user_id)
         with check (auth.uid() = user_id)', t, t);
  end loop;
end $$;

-- ---------- Realtime ----------
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'items'
  ) then
    alter publication supabase_realtime add table public.items;
  end if;
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'clients'
  ) then
    alter publication supabase_realtime add table public.clients;
  end if;
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'meetings'
  ) then
    alter publication supabase_realtime add table public.meetings;
  end if;
end $$;
