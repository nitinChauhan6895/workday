-- MyDay v2.3.3 — index to support meeting date-range queries (dashboard/day/week). Re-runnable.
create index if not exists meetings_user_datetime_idx
  on public.meetings(user_id, datetime);
