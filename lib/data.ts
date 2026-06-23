// Server-side data access. RLS scopes every query to the signed-in user.
// Fetchers are wrapped in React cache() so repeated calls within one request
// hit the DB only once. Prefer the *scoped* fetchers over the "all rows" ones.
import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import type { Client, Item, Meeting, ItemEvent, AppSettings } from "./types";

// Columns needed to render a meeting list/grid (skips raw_notes/created_at).
const MEETING_LIST_COLS = "id,title,client_id,datetime,attendees,ics_uid,join_url";

// Coerce array-ish columns so the UI never sees null/undefined (e.g. pre-migration).
function arr<T>(v: any): T[] {
  return Array.isArray(v) ? v : [];
}
function normItem(r: any): Item {
  return { ...r, links: arr(r.links), checklist: arr(r.checklist) } as Item;
}
function normClient(r: any): Client {
  return {
    ...r,
    products: arr(r.products),
    languages: arr(r.languages),
    links: arr(r.links),
    checklist: arr(r.checklist),
  } as Client;
}
function normMeeting(r: any): Meeting {
  return { raw_notes: null, created_at: "", ...r } as Meeting;
}

// Display-only current user — reads the cookie session (no network round-trip).
// Middleware already validated the session on this request.
export const getSessionUser = cache(async () => {
  const supabase = createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session?.user ?? null;
});

export const getSettings = cache(async (): Promise<AppSettings | null> => {
  const supabase = createClient();
  const { data, error } = await supabase.from("app_settings").select("*").maybeSingle();
  if (error) return null;
  return (data as AppSettings) ?? null;
});

export const getItems = cache(async (): Promise<Item[]> => {
  const supabase = createClient();
  const { data } = await supabase
    .from("items")
    .select("*")
    .order("position", { ascending: true })
    .order("created_at", { ascending: true });
  return (data ?? []).map(normItem);
});

export const getItemsForClient = cache(async (clientId: string): Promise<Item[]> => {
  const supabase = createClient();
  const { data } = await supabase
    .from("items")
    .select("*")
    .eq("client_id", clientId)
    .order("position", { ascending: true });
  return (data ?? []).map(normItem);
});

export const getItemsForMeeting = cache(async (meetingId: string): Promise<Item[]> => {
  const supabase = createClient();
  const { data } = await supabase
    .from("items")
    .select("*")
    .eq("meeting_id", meetingId)
    .order("position", { ascending: true });
  return (data ?? []).map(normItem);
});

export const getItem = cache(async (id: string): Promise<Item | null> => {
  const supabase = createClient();
  const { data } = await supabase.from("items").select("*").eq("id", id).maybeSingle();
  return data ? normItem(data) : null;
});

export const getClients = cache(async (): Promise<Client[]> => {
  const supabase = createClient();
  const { data } = await supabase
    .from("clients")
    .select("*")
    .order("name", { ascending: true });
  return (data ?? []).map(normClient);
});

export const getClient = cache(async (id: string): Promise<Client | null> => {
  const supabase = createClient();
  const { data } = await supabase.from("clients").select("*").eq("id", id).maybeSingle();
  return data ? normClient(data) : null;
});

// All meetings (full rows) — avoid on hot paths; prefer the scoped fetchers below.
export const getMeetings = cache(async (): Promise<Meeting[]> => {
  const supabase = createClient();
  const { data } = await supabase
    .from("meetings")
    .select("*")
    .order("datetime", { ascending: false });
  return (data ?? []) as Meeting[];
});

// Meetings whose datetime falls within [startIso, endIso). Light columns.
export const getMeetingsRange = cache(
  async (startIso: string, endIso: string): Promise<Meeting[]> => {
    const supabase = createClient();
    const { data } = await supabase
      .from("meetings")
      .select(MEETING_LIST_COLS)
      .gte("datetime", startIso)
      .lt("datetime", endIso)
      .order("datetime", { ascending: true });
    return (data ?? []).map(normMeeting);
  },
);

export const getMeetingsForClient = cache(async (clientId: string): Promise<Meeting[]> => {
  const supabase = createClient();
  const { data } = await supabase
    .from("meetings")
    .select(MEETING_LIST_COLS)
    .eq("client_id", clientId)
    .order("datetime", { ascending: false });
  return (data ?? []).map(normMeeting);
});

export const getMeeting = cache(async (id: string): Promise<Meeting | null> => {
  const supabase = createClient();
  const { data } = await supabase.from("meetings").select("*").eq("id", id).maybeSingle();
  return (data as Meeting) ?? null;
});

export const getItemEvents = cache(async (itemId: string): Promise<ItemEvent[]> => {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("item_events")
    .select("*")
    .eq("item_id", itemId)
    .order("created_at", { ascending: false });
  if (error) return [];
  return (data ?? []) as ItemEvent[];
});

// Convenience: a Map for O(1) client lookups when rendering item lists.
export function clientsById(clients: Client[]): Map<string, Client> {
  return new Map(clients.map((c) => [c.id, c]));
}
