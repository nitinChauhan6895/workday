-- MyDay v2.2 — allow 'dev' as an item owner. Re-runnable.
alter table public.items drop constraint if exists items_owner_check;
alter table public.items add constraint items_owner_check
  check (owner in ('product','support','ic','dev'));
