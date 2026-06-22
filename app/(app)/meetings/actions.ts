"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

function str(form: FormData, key: string): string | null {
  const v = (form.get(key) ?? "").toString().trim();
  return v === "" ? null : v;
}

function buildPayload(form: FormData) {
  return {
    title: str(form, "title") ?? "Untitled meeting",
    client_id: str(form, "client_id"),
    datetime: str(form, "datetime") ?? new Date().toISOString(),
    attendees: str(form, "attendees"),
    raw_notes: str(form, "raw_notes"),
  };
}

export async function createMeeting(form: FormData) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("meetings")
    .insert(buildPayload(form))
    .select("id")
    .single();
  if (error) throw new Error(error.message);

  revalidatePath("/", "layout");
  redirect(`/meetings/${data.id}`);
}

export async function updateMeeting(id: string, form: FormData) {
  const supabase = createClient();
  const { error } = await supabase.from("meetings").update(buildPayload(form)).eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/", "layout");
  redirect(`/meetings/${id}`);
}

export async function deleteMeeting(id: string) {
  const supabase = createClient();
  // Items keep their data; meeting_id is set null by the FK.
  const { error } = await supabase.from("meetings").delete().eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/", "layout");
  redirect("/meetings");
}

// Save just the notes from the capture view (no redirect — stays on page).
export async function saveMeetingNotes(id: string, notes: string) {
  const supabase = createClient();
  const { error } = await supabase
    .from("meetings")
    .update({ raw_notes: notes.trim() === "" ? null : notes })
    .eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath(`/meetings/${id}`);
}

// Capture-view quick-add: create an action item linked to this meeting,
// inheriting the meeting's client.
export async function createActionItem(meetingId: string, form: FormData) {
  const supabase = createClient();
  const title = (form.get("title") ?? "").toString().trim();
  if (!title) return;

  const priority = (form.get("priority") ?? "med").toString();

  const { data: meeting } = await supabase
    .from("meetings")
    .select("client_id")
    .eq("id", meetingId)
    .single();

  const { data: item, error } = await supabase
    .from("items")
    .insert({
      title,
      type: "action",
      status: "backlog",
      priority,
      owner: "me",
      client_id: meeting?.client_id ?? null,
      meeting_id: meetingId,
    })
    .select("id")
    .single();
  if (error) throw new Error(error.message);

  // Best-effort activity log.
  try {
    await supabase.from("item_events").insert({ item_id: item.id, kind: "created" });
  } catch {
    /* item_events may not be migrated */
  }

  revalidatePath("/", "layout");
}
