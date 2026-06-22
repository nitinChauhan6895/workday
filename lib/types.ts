// WorkDay data model. One shared `items` table is the core — deployments, bugs,
// action items, support threads and QA are the same object distinguished by `type`.

export type ItemType = "deploy" | "bug" | "action" | "support" | "qa";

export type ItemStatus =
  | "backlog"
  | "in_progress"
  | "blocked_on_dev"
  | "in_qa"
  | "waiting_on_client"
  | "done";

export type Priority = "high" | "med" | "low";

export type Owner = "me" | "dev" | "client";

export type Product = "ASR" | "STT" | "TTS";

export type ClientStage =
  | "onboarding"
  | "in_progress"
  | "in_qa"
  | "live"
  | "on_hold";

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
  meeting_id: string | null; // the meeting this came from
  external_link: string | null; // Jira / ticket / thread URL
  created_at: string;
  updated_at: string;
  position: number; // for board ordering
}

export interface Client {
  id: string;
  name: string;
  products: Product[];
  stage: ClientStage;
  progress_mode: "auto" | "manual"; // auto = % of items done
  progress_manual: number; // 0-100, used when progress_mode = manual
  primary_contact: string | null;
  contact_email: string | null;
  kickoff_date: string | null;
  target_golive: string | null;
  link: string | null;
  notes: string | null;
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
}

export interface AppSettings {
  user_id: string;
  ics_url: string | null;
  calendar_last_synced_at: string | null;
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

export const ITEM_TYPE_META: Record<
  ItemType,
  { label: string; chip: string }
> = {
  deploy: { label: "Deploy", chip: "bg-[#E8F0FE] text-[#1A56DB]" }, // blue
  bug: { label: "Bug", chip: "bg-[#FDECE8] text-[#D9480F]" }, // coral
  action: { label: "Action", chip: "bg-[#E4F4F0] text-[#0E7C66]" }, // teal
  support: { label: "Support", chip: "bg-[#FCE9F1] text-[#C81E78]" }, // pink
  qa: { label: "QA", chip: "bg-[#FEF2E2] text-[#B45309]" }, // amber
};

export const PRIORITY_META: Record<
  Priority,
  { label: string; chip: string; dot: string }
> = {
  high: { label: "High", chip: "bg-[#FDE8E8] text-[#C81E1E]", dot: "bg-[#E5484D]" },
  med: { label: "Med", chip: "bg-[#FEF2E2] text-[#B45309]", dot: "bg-[#F2A23B]" },
  low: { label: "Low", chip: "bg-[#E7F6EC] text-[#1A7F37]", dot: "bg-[#46A758]" },
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
  in_qa: { label: "In QA" },
  live: { label: "Live" },
  on_hold: { label: "On hold" },
};
