"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { fetchIcs, parseIcsToMeetings } from "@/lib/calendar";

export type SyncResult = { ok: boolean; message: string };

// Save (or clear) the published ICS URL for the current user.
export async function saveIcsUrl(form: FormData): Promise<void> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not signed in.");

  const raw = (form.get("ics_url") ?? "").toString().trim();
  const ics_url = raw === "" ? null : raw;

  const { error } = await supabase
    .from("app_settings")
    .upsert({ user_id: user.id, ics_url }, { onConflict: "user_id" });
  if (error) throw new Error(error.message);

  revalidatePath("/settings");
}

// Pull the feed and upsert meetings. Only touches calendar-owned fields
// (title/time/attendees) — notes, client and action items you add are preserved.
export async function syncCalendar(): Promise<SyncResult> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, message: "Not signed in." };

  const { data: settings } = await supabase
    .from("app_settings")
    .select("ics_url")
    .maybeSingle();

  const url = settings?.ics_url?.trim();
  if (!url) return { ok: false, message: "Add your calendar URL first." };

  let parsed;
  try {
    const text = await fetchIcs(url);
    parsed = parseIcsToMeetings(text);
  } catch (e: any) {
    return { ok: false, message: e?.message ?? "Could not read the calendar feed." };
  }

  if (parsed.length === 0) {
    await supabase
      .from("app_settings")
      .update({ calendar_last_synced_at: new Date().toISOString() })
      .eq("user_id", user.id);
    revalidatePath("/", "layout");
    return { ok: true, message: "No meetings found in the sync window." };
  }

  const rows = parsed.map((m) => ({
    user_id: user.id,
    ics_uid: m.ics_uid,
    title: m.title,
    datetime: m.datetime,
    attendees: m.attendees,
  }));

  const { error } = await supabase
    .from("meetings")
    .upsert(rows, { onConflict: "user_id,ics_uid" });
  if (error) return { ok: false, message: error.message };

  await supabase
    .from("app_settings")
    .update({ calendar_last_synced_at: new Date().toISOString() })
    .eq("user_id", user.id);

  revalidatePath("/", "layout");
  return { ok: true, message: `Synced ${rows.length} meeting${rows.length === 1 ? "" : "s"}.` };
}
