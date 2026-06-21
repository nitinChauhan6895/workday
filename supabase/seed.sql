-- WorkDay — optional demo seed. Run AFTER schema.sql and AFTER you've signed in
-- once (so your auth user exists). Keyed to your email; dates are relative to
-- "today" so overdue/today logic stays meaningful. Safe to re-run: it only
-- seeds when you have zero items.

do $$
declare
  uid uuid;
  c_helios uuid;
  c_lumen  uuid;
  c_orbit  uuid;
  c_verdant uuid;
  m_helios uuid;
  m_standup uuid;
  m_lumen_qa uuid;
begin
  select id into uid from auth.users
    where email = 'nitinchauhan771@gmail.com'
    order by created_at limit 1;
  if uid is null then
    raise notice 'No auth user for that email yet — sign in once, then re-run.';
    return;
  end if;

  if exists (select 1 from public.items where user_id = uid) then
    raise notice 'Items already exist — skipping seed.';
    return;
  end if;

  -- clients
  insert into public.clients (user_id, name, products, stage, progress_mode, progress_manual, primary_contact, contact_email, kickoff_date, target_golive, link, notes)
  values (uid,'Helios Bank','{ASR,STT}','in_progress','auto',0,'Priya Nair','priya.nair@heliosbank.com', current_date - 48, current_date + 24,'https://heliosbank.example.com','Call-center transcription pilot. Strict on PII redaction.')
  returning id into c_helios;

  insert into public.clients (user_id, name, products, stage, progress_mode, progress_manual, primary_contact, contact_email, kickoff_date, target_golive, notes)
  values (uid,'Lumen Health','{TTS}','in_qa','auto',0,'Marco Devlin','marco@lumenhealth.io', current_date - 70, current_date + 9,'Neural voice for patient reminders. Latency-sensitive.')
  returning id into c_lumen;

  insert into public.clients (user_id, name, products, stage, progress_mode, progress_manual, primary_contact, contact_email, kickoff_date, target_golive, link, notes)
  values (uid,'Orbit Logistics','{ASR,STT,TTS}','onboarding','manual',15,'Sara Kim','sara.kim@orbitlogistics.com', current_date - 12, current_date + 72,'https://orbit.example.com','Driver voice-command + dispatch transcription.')
  returning id into c_orbit;

  insert into public.clients (user_id, name, products, stage, progress_mode, progress_manual, primary_contact, contact_email, kickoff_date, target_golive, notes)
  values (uid,'Verdant Retail','{STT}','live','auto',0,'Tom Becker','tbecker@verdant.shop', current_date - 140, current_date - 32,'In production. Occasional support threads.')
  returning id into c_verdant;

  -- meetings
  insert into public.meetings (user_id, title, client_id, datetime, attendees, raw_notes)
  values (uid,'Helios Bank — weekly sync', c_helios, date_trunc('day', now()) + interval '14 hour','Priya Nair, me','Discussed PII redaction edge cases on numbers. Need diarization tweak. Go-live still targeting mid-next-month.')
  returning id into m_helios;

  insert into public.meetings (user_id, title, client_id, datetime, attendees, raw_notes)
  values (uid,'Dev standup', null, date_trunc('day', now()) + interval '9 hour 30 minute','Dev team, me','Daily standup.')
  returning id into m_standup;

  insert into public.meetings (user_id, title, client_id, datetime, attendees, raw_notes)
  values (uid,'Lumen Health — QA review', c_lumen, now() - interval '2 day','Marco Devlin, QA, me','Voice latency spikes over 400ms on long sentences. QA to log repro.')
  returning id into m_lumen_qa;

  insert into public.meetings (user_id, title, client_id, datetime, attendees, raw_notes)
  values (uid,'Orbit Logistics — kickoff', c_orbit, now() + interval '3 day','Sara Kim, me','');

  -- items
  insert into public.items (user_id, title, description, type, client_id, status, priority, owner, assigned_dev, due_date, flag_for_standup, meeting_id, external_link, position) values
  (uid,'Set up ASR transcription endpoint for Helios','Provision streaming endpoint + auth keys.','deploy', c_helios,'in_progress','high','me',null, current_date, false, null,'https://jira.example.com/HEL-204',0),
  (uid,'Diarization misattributes overlapping speakers','Two-speaker overlap assigns both to one channel.','bug', c_helios,'blocked_on_dev','high','dev','Anil', current_date - 1, true, m_helios,'https://jira.example.com/HEL-211',1),
  (uid,'Confirm PII redaction covers spoken card numbers','From weekly sync — verify digit redaction.','action', c_helios,'waiting_on_client','med','client',null, current_date + 2, false, m_helios, null,2),
  (uid,'TTS latency spikes >400ms on long sentences','Lumen patient reminders. Repro pending from QA.','qa', c_lumen,'in_qa','high','dev','Bea', current_date + 1, true, m_lumen_qa, null,3),
  (uid,'Deploy neural voice v2 to Lumen staging',null,'deploy', c_lumen,'in_progress','med','me',null, current_date + 4, false, null, null,4),
  (uid,'Orbit — gather audio samples for ASR tuning','Need 2h of driver audio across noise profiles.','action', c_orbit,'backlog','low','client',null, null, false, null, null,5),
  (uid,'Verdant — STT dropping final word on short clips','Support thread from Tom.','support', c_verdant,'blocked_on_dev','med','dev','Anil', current_date, true, null,'https://support.example.com/T-8841',6),
  (uid,'Write runbook for Helios go-live',null,'action', c_helios,'backlog','med','me',null, current_date + 19, false, null, null,7),
  (uid,'Verdant STT endpoint migration to v3','Completed last week.','deploy', c_verdant,'done','low','me',null, current_date - 5, false, null, null,8);

  raise notice 'Seeded WorkDay demo data for %', uid;
end $$;
