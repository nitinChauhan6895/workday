"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { STATUS_META, type ItemStatus } from "@/lib/types";

type SB = ReturnType<typeof createClient>;

function str(form: FormData, key: string): string | null {
  const v = (form.get(key) ?? "").toString().trim();
  return v === "" ? null : v;
}

// Best-effort activity log; never blocks the main mutation.
async function logEvent(
  supabase: SB,
  itemId: string,
  kind: "created" | "status" | "completed" | "reopened" | "edited",
  detail?: string | null,
) {
  try {
    await supabase.from("item_events").insert({ item_id: itemId, kind, detail: detail ?? null });
  } catch {
    /* table may not be migrated yet */
  }
}

function buildPayload(form: FormData) {
  return {
    title: str(form, "title") ?? "Untitled",
    description: str(form, "description"),
    type: str(form, "type") ?? "action",
    client_id: str(form, "client_id"),
    status: (str(form, "status") ?? "backlog") as ItemStatus,
    priority: str(form, "priority") ?? "med",
    owner: str(form, "owner") ?? "me",
    assigned_dev: str(form, "assigned_dev"),
    due_date: str(form, "due_date"),
    meeting_id: str(form, "meeting_id"),
    external_link: str(form, "external_link"),
    flag_for_standup: form.get("flag_for_standup") != null,
  };
}

export async function createItem(form: FormData) {
  const supabase = createClient();
  const payload = buildPayload(form);

  const { data, error } = await supabase
    .from("items")
    .insert(payload)
    .select("id")
    .single();

  if (error) throw new Error(error.message);

  await logEvent(supabase, data.id, "created");
  revalidatePath("/", "layout");
  redirect(`/items/${data.id}`);
}

export async function updateItem(id: string, form: FormData) {
  const supabase = createClient();
  const payload = buildPayload(form);

  // Detect a status change so we can log it.
  const { data: before } = await supabase
    .from("items")
    .select("status")
    .eq("id", id)
    .single();

  const { error } = await supabase.from("items").update(payload).eq("id", id);
  if (error) throw new Error(error.message);

  if (before && before.status !== payload.status) {
    await logEvent(
      supabase,
      id,
      payload.status === "done" ? "completed" : "status",
      `${STATUS_META[before.status as ItemStatus].label} → ${STATUS_META[payload.status].label}`,
    );
  } else {
    await logEvent(supabase, id, "edited");
  }

  revalidatePath("/", "layout");
  redirect(`/items/${id}`);
}

export async function deleteItem(id: string) {
  const supabase = createClient();
  const { error } = await supabase.from("items").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/", "layout");
  redirect("/items");
}

// Used by the Standup view to clear an item from the call without completing it.
export async function setStandupFlag(id: string, flag: boolean) {
  const supabase = createClient();
  const { error } = await supabase
    .from("items")
    .update({ flag_for_standup: flag })
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/", "layout");
}

// Used by the inline list checkboxes.
export async function toggleItemDone(id: string, done: boolean) {
  const supabase = createClient();
  const nextStatus: ItemStatus = done ? "done" : "in_progress";

  const { error } = await supabase
    .from("items")
    .update({ status: nextStatus })
    .eq("id", id);
  if (error) throw new Error(error.message);

  await logEvent(supabase, id, done ? "completed" : "reopened");
  revalidatePath("/", "layout");
}
