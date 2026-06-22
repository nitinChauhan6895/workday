-- WorkDay v2.1 — clients & items: new stage/type/owner vocab, languages, multi-links, checklists.
-- Re-runnable. Migrates existing rows before tightening the CHECK constraints.

-- ===== clients =====
update public.clients set stage = 'in_uat' where stage = 'in_qa';
update public.clients set stage = 'hold'   where stage = 'on_hold';

alter table public.clients drop constraint if exists clients_stage_check;
alter table public.clients add constraint clients_stage_check
  check (stage in ('onboarding','in_progress','in_uat','live','hold'));

alter table public.clients add column if not exists languages text[] not null default '{}';
alter table public.clients add column if not exists links jsonb not null default '[]';      -- [{title,url}]
alter table public.clients add column if not exists checklist jsonb not null default '[]';   -- [{text,done}]

-- ===== items =====
-- type: deploy/qa fold into 'product'
update public.items set type = 'product' where type in ('deploy','qa');
alter table public.items drop constraint if exists items_type_check;
alter table public.items add constraint items_type_check
  check (type in ('bug','product','support','action'));

-- owner: me->ic, dev->product, client->support
update public.items set owner = 'ic'      where owner = 'me';
update public.items set owner = 'product' where owner = 'dev';
update public.items set owner = 'support' where owner = 'client';
alter table public.items drop constraint if exists items_owner_check;
alter table public.items add constraint items_owner_check
  check (owner in ('product','support','ic'));
alter table public.items alter column owner set default 'ic';

alter table public.items add column if not exists language text;
alter table public.items add column if not exists links jsonb not null default '[]';      -- [{title,url}]
alter table public.items add column if not exists checklist jsonb not null default '[]';   -- [{text,done}]
