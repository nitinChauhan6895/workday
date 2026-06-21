// In-memory mock data for Phase 1. Replaced by live Supabase queries in Phase 2.
import type { Client, Item, Meeting, ItemStatus } from "./types";

// Reference "today" for the mock set (matches the seed dates below).
export const TODAY = "2026-06-21";

export const clients: Client[] = [
  {
    id: "c1",
    name: "Helios Bank",
    products: ["ASR", "STT"],
    stage: "in_progress",
    progress_mode: "auto",
    progress_manual: 0,
    primary_contact: "Priya Nair",
    contact_email: "priya.nair@heliosbank.com",
    kickoff_date: "2026-05-04",
    target_golive: "2026-07-15",
    link: "https://heliosbank.example.com",
    notes: "Call-center transcription pilot. Strict on PII redaction.",
  },
  {
    id: "c2",
    name: "Lumen Health",
    products: ["TTS"],
    stage: "in_qa",
    progress_mode: "auto",
    progress_manual: 0,
    primary_contact: "Marco Devlin",
    contact_email: "marco@lumenhealth.io",
    kickoff_date: "2026-04-12",
    target_golive: "2026-06-30",
    link: null,
    notes: "Neural voice for patient reminders. Latency-sensitive.",
  },
  {
    id: "c3",
    name: "Orbit Logistics",
    products: ["ASR", "STT", "TTS"],
    stage: "onboarding",
    progress_mode: "manual",
    progress_manual: 15,
    primary_contact: "Sara Kim",
    contact_email: "sara.kim@orbitlogistics.com",
    kickoff_date: "2026-06-09",
    target_golive: "2026-09-01",
    link: "https://orbit.example.com",
    notes: "Driver voice-command + dispatch transcription.",
  },
  {
    id: "c4",
    name: "Verdant Retail",
    products: ["STT"],
    stage: "live",
    progress_mode: "auto",
    progress_manual: 0,
    primary_contact: "Tom Becker",
    contact_email: "tbecker@verdant.shop",
    kickoff_date: "2026-02-01",
    target_golive: "2026-05-20",
    link: null,
    notes: "In production. Occasional support threads.",
  },
];

export const meetings: Meeting[] = [
  {
    id: "m1",
    title: "Helios Bank — weekly sync",
    client_id: "c1",
    datetime: "2026-06-21T14:00:00",
    attendees: "Priya Nair, me",
    raw_notes:
      "Discussed PII redaction edge cases on numbers. Need diarization tweak. Go-live still targeting mid-July.",
    created_at: "2026-06-18T09:00:00",
  },
  {
    id: "m2",
    title: "Dev standup",
    client_id: null,
    datetime: "2026-06-21T09:30:00",
    attendees: "Dev team, me",
    raw_notes: "Daily standup.",
    created_at: "2026-06-21T08:00:00",
  },
  {
    id: "m3",
    title: "Lumen Health — QA review",
    client_id: "c2",
    datetime: "2026-06-19T16:00:00",
    attendees: "Marco Devlin, QA, me",
    raw_notes: "Voice latency spikes over 400ms on long sentences. QA to log repro.",
    created_at: "2026-06-19T10:00:00",
  },
  {
    id: "m4",
    title: "Orbit Logistics — kickoff",
    client_id: "c3",
    datetime: "2026-06-24T11:00:00",
    attendees: "Sara Kim, me",
    raw_notes: "",
    created_at: "2026-06-15T12:00:00",
  },
];

export const items: Item[] = [
  {
    id: "i1",
    title: "Set up ASR transcription endpoint for Helios",
    description: "Provision streaming endpoint + auth keys.",
    type: "deploy",
    client_id: "c1",
    status: "in_progress",
    priority: "high",
    owner: "me",
    assigned_dev: null,
    due_date: "2026-06-21",
    flag_for_standup: false,
    meeting_id: null,
    external_link: "https://jira.example.com/HEL-204",
    created_at: "2026-06-10T09:00:00",
    updated_at: "2026-06-19T09:00:00",
    position: 0,
  },
  {
    id: "i2",
    title: "Diarization misattributes overlapping speakers",
    description: "Two-speaker overlap assigns both to one channel.",
    type: "bug",
    client_id: "c1",
    status: "blocked_on_dev",
    priority: "high",
    owner: "dev",
    assigned_dev: "Anil",
    due_date: "2026-06-20",
    flag_for_standup: true,
    meeting_id: "m1",
    external_link: "https://jira.example.com/HEL-211",
    created_at: "2026-06-16T09:00:00",
    updated_at: "2026-06-20T09:00:00",
    position: 1,
  },
  {
    id: "i3",
    title: "Confirm PII redaction covers spoken card numbers",
    description: "From weekly sync — verify digit redaction.",
    type: "action",
    client_id: "c1",
    status: "waiting_on_client",
    priority: "med",
    owner: "client",
    assigned_dev: null,
    due_date: "2026-06-23",
    flag_for_standup: false,
    meeting_id: "m1",
    external_link: null,
    created_at: "2026-06-18T14:30:00",
    updated_at: "2026-06-18T14:30:00",
    position: 2,
  },
  {
    id: "i4",
    title: "TTS latency spikes >400ms on long sentences",
    description: "Lumen patient reminders. Repro pending from QA.",
    type: "qa",
    client_id: "c2",
    status: "in_qa",
    priority: "high",
    owner: "dev",
    assigned_dev: "Bea",
    due_date: "2026-06-22",
    flag_for_standup: true,
    meeting_id: "m3",
    external_link: null,
    created_at: "2026-06-19T16:30:00",
    updated_at: "2026-06-20T11:00:00",
    position: 3,
  },
  {
    id: "i5",
    title: "Deploy neural voice v2 to Lumen staging",
    description: null,
    type: "deploy",
    client_id: "c2",
    status: "in_progress",
    priority: "med",
    owner: "me",
    assigned_dev: null,
    due_date: "2026-06-25",
    flag_for_standup: false,
    meeting_id: null,
    external_link: null,
    created_at: "2026-06-15T09:00:00",
    updated_at: "2026-06-18T09:00:00",
    position: 4,
  },
  {
    id: "i6",
    title: "Orbit — gather audio samples for ASR tuning",
    description: "Need 2h of driver audio across noise profiles.",
    type: "action",
    client_id: "c3",
    status: "backlog",
    priority: "low",
    owner: "client",
    assigned_dev: null,
    due_date: null,
    flag_for_standup: false,
    meeting_id: null,
    external_link: null,
    created_at: "2026-06-12T09:00:00",
    updated_at: "2026-06-12T09:00:00",
    position: 5,
  },
  {
    id: "i7",
    title: "Verdant — STT dropping final word on short clips",
    description: "Support thread from Tom.",
    type: "support",
    client_id: "c4",
    status: "blocked_on_dev",
    priority: "med",
    owner: "dev",
    assigned_dev: "Anil",
    due_date: "2026-06-21",
    flag_for_standup: true,
    meeting_id: null,
    external_link: "https://support.example.com/T-8841",
    created_at: "2026-06-17T13:00:00",
    updated_at: "2026-06-20T09:00:00",
    position: 6,
  },
  {
    id: "i8",
    title: "Write runbook for Helios go-live",
    description: null,
    type: "action",
    client_id: "c1",
    status: "backlog",
    priority: "med",
    owner: "me",
    assigned_dev: null,
    due_date: "2026-07-10",
    flag_for_standup: false,
    meeting_id: null,
    external_link: null,
    created_at: "2026-06-11T09:00:00",
    updated_at: "2026-06-11T09:00:00",
    position: 7,
  },
  {
    id: "i9",
    title: "Verdant STT endpoint migration to v3",
    description: "Completed last week.",
    type: "deploy",
    client_id: "c4",
    status: "done",
    priority: "low",
    owner: "me",
    assigned_dev: null,
    due_date: "2026-06-16",
    flag_for_standup: false,
    meeting_id: null,
    external_link: null,
    created_at: "2026-06-08T09:00:00",
    updated_at: "2026-06-16T15:00:00",
    position: 8,
  },
];

// ----- Derived helpers (mirror what Phase 2 will compute server-side) -----

export function clientById(id: string | null): Client | undefined {
  return id ? clients.find((c) => c.id === id) : undefined;
}

export function meetingById(id: string | null): Meeting | undefined {
  return id ? meetings.find((m) => m.id === id) : undefined;
}

export function itemsForClient(clientId: string): Item[] {
  return items.filter((i) => i.client_id === clientId);
}

export function clientProgress(client: Client): number {
  if (client.progress_mode === "manual") return client.progress_manual;
  const own = itemsForClient(client.id);
  if (own.length === 0) return 0;
  const done = own.filter((i) => i.status === "done").length;
  return Math.round((done / own.length) * 100);
}

export function isOverdue(item: Item): boolean {
  return (
    !!item.due_date && item.due_date < TODAY && item.status !== "done"
  );
}

export function isOpen(item: Item): boolean {
  return item.status !== "done";
}

export function isToday(iso: string): boolean {
  return iso.slice(0, 10) === TODAY;
}

const OPEN_STATUSES: ItemStatus[] = [
  "backlog",
  "in_progress",
  "blocked_on_dev",
  "in_qa",
  "waiting_on_client",
];

export function dashboardStats() {
  return {
    open: items.filter((i) => OPEN_STATUSES.includes(i.status)).length,
    overdue: items.filter(isOverdue).length,
    blockedOnDev: items.filter((i) => i.status === "blocked_on_dev").length,
    meetingsToday: meetings.filter((m) => isToday(m.datetime)).length,
  };
}
