-- WorkDay — remove the demo seed data inserted by seed.sql. Surgical: deletes
-- only rows matching the exact seed values, scoped to your user. Leaves your
-- real items/clients and all calendar-synced meetings (ics_uid not null) intact.
-- Safe to re-run.

do $$
declare uid uuid;
begin
  select id into uid from auth.users
    where email = 'nitinchauhan771@gmail.com'
    order by created_at limit 1;
  if uid is null then
    raise notice 'No matching user.';
    return;
  end if;

  delete from public.items where user_id = uid and title in (
    'Set up ASR transcription endpoint for Helios',
    'Diarization misattributes overlapping speakers',
    'Confirm PII redaction covers spoken card numbers',
    'TTS latency spikes >400ms on long sentences',
    'Deploy neural voice v2 to Lumen staging',
    'Orbit — gather audio samples for ASR tuning',
    'Verdant — STT dropping final word on short clips',
    'Write runbook for Helios go-live',
    'Verdant STT endpoint migration to v3'
  );

  -- Only the demo (non-calendar) meetings — never the synced ones.
  delete from public.meetings where user_id = uid and ics_uid is null and title in (
    'Helios Bank — weekly sync',
    'Dev standup',
    'Lumen Health — QA review',
    'Orbit Logistics — kickoff'
  );

  delete from public.clients where user_id = uid and name in (
    'Helios Bank', 'Lumen Health', 'Orbit Logistics', 'Verdant Retail'
  );

  raise notice 'Removed demo seed for %.', uid;
end $$;
