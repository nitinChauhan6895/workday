// Server-side data access. RLS scopes every query to the signed-in user.
import { createClient } from "@/lib/supabase/server";
import type { Client, Item, Meeting, ItemEvent, AppSettings } from "./types";

export async function getSettings(): Promise<AppSettings | null> {
  const supabase = createClient();
  // app_settings may not be migrated yet — degrade gracefully.
  const { data, error } = await supabase.from("app_settings").select("*").maybeSingle();
  if (error) return null;
  return (data as AppSettings) ?? null;
}

export async function getItems(): Promise<Item[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from("items")
    .select("*")
    .order("position", { ascending: true })
    .order("created_at", { ascending: true });
  return (data ?? []) as Item[];
}

export async function getItem(id: string): Promise<Item | null> {
  const supabase = createClient();
  const { data } = await supabase.from("items").select("*").eq("id", id).maybeSingle();
  return (data as Item) ?? null;
}

export async function getClients(): Promise<Client[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from("clients")
    .select("*")
    .order("name", { ascending: true });
  return (data ?? []) as Client[];
}

export async function getClient(id: string): Promise<Client | null> {
  const supabase = createClient();
  const { data } = await supabase.from("clients").select("*").eq("id", id).maybeSingle();
  return (data as Client) ?? null;
}

export async function getMeetings(): Promise<Meeting[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from("meetings")
    .select("*")
    .order("datetime", { ascending: false });
  return (data ?? []) as Meeting[];
}

export async function getMeeting(id: string): Promise<Meeting | null> {
  const supabase = createClient();
  const { data } = await supabase.from("meetings").select("*").eq("id", id).maybeSingle();
  return (data as Meeting) ?? null;
}

export async function getItemEvents(itemId: string): Promise<ItemEvent[]> {
  const supabase = createClient();
  // Best-effort: if the item_events table hasn't been migrated yet, return [].
  const { data, error } = await supabase
    .from("item_events")
    .select("*")
    .eq("item_id", itemId)
    .order("created_at", { ascending: false });
  if (error) return [];
  return (data ?? []) as ItemEvent[];
}

// Convenience: a Map for O(1) client lookups when rendering item lists.
export function clientsById(clients: Client[]): Map<string, Client> {
  return new Map(clients.map((c) => [c.id, c]));
}
