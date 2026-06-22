// MyDay data model. One shared `items` table is the core — bugs, product,
// support and action items are the same object distinguished by `type`.

export type ItemType = "bug" | "product" | "support" | "action";

export type ItemStatus =
  | "backlog"
  | "in_progress"
  | "blocked_on_dev"
  | "in_qa"
  | "waiting_on_client"
  | "done";

export type Priority = "high" | "med" | "low";

export type Owner = "product" | "support" | "ic" | "dev";

export type Product = "Voicebot" | "RTS" | "AQM" | "ImporterFlow";

export type ClientStage = "onboarding" | "in_progress" | "in_uat" | "live" | "hold";

// A titled link (Teams channel, files, mail thread, ticket, …).
export interface LinkItem {
  title: string;
  url: string;
}

// A checklist row used inside notes/descriptions.
export interface ChecklistItem {
  text: string;
  done: boolean;
}

export interface Item {
  id: string;
  title: string;
  description: string | null;
  type: ItemType;
  client_id: string | null; // null = internal
  status: ItemStatus;
  priority: Priority;
  owner: Owner;
  assigned_dev: string | null;
  due_date: string | null; // ISO date
  flag_for_standup: boolean;
  meeting_id: string | null; // the meeting this came from (set via capture view)
  external_link: string | null; // legacy single link (superseded by `links`)
  language: string | null; // delivery language, scoped to the client
  links: LinkItem[];
  checklist: ChecklistItem[];
  created_at: string;
  updated_at: string;
  position: number; // for board ordering
}

export interface Client {
  id: string;
  name: string;
  products: Product[];
  languages: string[]; // STT/TTS delivery languages
  stage: ClientStage;
  progress_mode: "auto" | "manual"; // auto = % of items done
  progress_manual: number; // 0-100, used when progress_mode = manual
  kickoff_date: string | null;
  target_golive: string | null;
  links: LinkItem[];
  notes: string | null;
  checklist: ChecklistItem[];
  // Legacy (no longer surfaced in the form):
  primary_contact: string | null;
  contact_email: string | null;
}

export interface Meeting {
  id: string;
  title: string;
  client_id: string | null;
  datetime: string; // ISO
  attendees: string | null;
  raw_notes: string | null;
  created_at: string;
  ics_uid: string | null; // calendar-sourced meetings; null if created manually
  join_url: string | null; // Teams/online meeting join link, from calendar sync
}

export interface AppSettings {
  user_id: string;
  ics_url: string | null;
  calendar_last_synced_at: string | null;
}

// Profile lives in Supabase auth user-metadata.
export interface Profile {
  first_name: string;
  last_name: string;
  organisation: string;
}

export type ItemEventKind =
  | "created"
  | "status"
  | "completed"
  | "reopened"
  | "edited";

export interface ItemEvent {
  id: string;
  item_id: string;
  kind: ItemEventKind;
  detail: string | null;
  created_at: string;
}

// ----- Display metadata (labels + badge styling) -----

export const ITEM_TYPE_META: Record<ItemType, { label: string; chip: string }> = {
  bug: { label: "Bug", chip: "bg-[#FDECE8] text-[#D9480F]" }, // coral
  product: { label: "Product", chip: "bg-[#E8F0FE] text-[#1A56DB]" }, // blue
  support: { label: "Support", chip: "bg-[#FCE9F1] text-[#C81E78]" }, // pink
  action: { label: "Action", chip: "bg-[#E4F4F0] text-[#0E7C66]" }, // teal
};

export const OWNER_META: Record<Owner, { label: string }> = {
  product: { label: "Product" },
  support: { label: "Support" },
  ic: { label: "IC" },
  dev: { label: "Dev" },
};

export const PRIORITY_META: Record<
  Priority,
  { label: string; chip: string; dot: string }
> = {
  high: { label: "High", chip: "bg-[#FBE3E3] text-[#991B1B]", dot: "bg-[#991B1B]" }, // dark red
  med: { label: "Med", chip: "bg-[#FEEBD9] text-[#EA580C]", dot: "bg-[#EA580C]" }, // orange
  low: { label: "Low", chip: "bg-[#FBF3D0] text-[#B7791F]", dot: "bg-[#EAB308]" }, // yellow
};

export const STATUS_META: Record<ItemStatus, { label: string; chip: string }> = {
  backlog: { label: "Backlog", chip: "bg-[#F1F2F4] text-[#5C6066]" },
  in_progress: { label: "In progress", chip: "bg-[#E8F0FE] text-[#1A56DB]" },
  blocked_on_dev: { label: "Blocked on dev", chip: "bg-[#FDECE8] text-[#D9480F]" },
  in_qa: { label: "In QA", chip: "bg-[#FEF2E2] text-[#B45309]" },
  waiting_on_client: { label: "Waiting on client", chip: "bg-[#FCE9F1] text-[#C81E78]" },
  done: { label: "Done", chip: "bg-[#E7F6EC] text-[#1A7F37]" },
};

export const STAGE_META: Record<ClientStage, { label: string }> = {
  onboarding: { label: "Onboarding" },
  in_progress: { label: "In progress" },
  in_uat: { label: "In UAT" },
  live: { label: "Live" },
  hold: { label: "Hold" },
};
