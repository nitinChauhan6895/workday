// Server-side data access. RLS scopes every query to the signed-in user.
import { createClient } from "@/lib/supabase/server";
import type { Client, Item, Meeting } from "./types";

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

// Convenience: a Map for O(1) client lookups when rendering item lists.
export function clientsById(clients: Client[]): Map<string, Client> {
  return new Map(clients.map((c) => [c.id, c]));
}
