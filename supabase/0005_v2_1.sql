-- WorkDay v2.1 — clients & items: new stage/type/owner vocab, languages, multi-links, checklists.
-- Re-runnable. IMPORTANT: drop each CHECK constraint BEFORE updating values to the
-- new vocabulary, otherwise the still-active old constraint rejects the new values.

-- ===== clients: stage =====
alter table public.clients drop constraint if exists clients_stage_check;
update public.clients set stage = 'in_uat' where stage = 'in_qa';
update public.clients set stage = 'hold'   where stage = 'on_hold';
update public.clients set stage = 'onboarding'
  where stage not in ('onboarding','in_progress','in_uat','live','hold');
alter table public.clients add constraint clients_stage_check
  check (stage in ('onboarding','in_progress','in_uat','live','hold'));

-- ===== clients: new columns =====
alter table public.clients add column if not exists languages text[] not null default '{}';
alter table public.clients add column if not exists links jsonb not null default '[]';      -- [{title,url}]
alter table public.clients add column if not exists checklist jsonb not null default '[]';   -- [{text,done}]

-- ===== items: type =====
alter table public.items drop constraint if exists items_type_check;
update public.items set type = 'product' where type in ('deploy','qa');
update public.items set type = 'action'
  where type not in ('bug','product','support','action');
alter table public.items add constraint items_type_check
  check (type in ('bug','product','support','action'));

-- ===== items: owner =====
alter table public.items drop constraint if exists items_owner_check;
update public.items set owner = 'ic'      where owner = 'me';
update public.items set owner = 'product' where owner = 'dev';
update public.items set owner = 'support' where owner = 'client';
update public.items set owner = 'ic'
  where owner not in ('product','support','ic');
alter table public.items add constraint items_owner_check
  check (owner in ('product','support','ic'));
alter table public.items alter column owner set default 'ic';

-- ===== items: new columns =====
alter table public.items add column if not exists language text;
alter table public.items add column if not exists links jsonb not null default '[]';      -- [{title,url}]
alter table public.items add column if not exists checklist jsonb not null default '[]';   -- [{text,done}]
