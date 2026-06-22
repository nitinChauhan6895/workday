"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient as createSupabase } from "@/lib/supabase/server";
import type { Product } from "@/lib/types";

const PRODUCTS: Product[] = ["ASR", "STT", "TTS"];

function str(form: FormData, key: string): string | null {
  const v = (form.get(key) ?? "").toString().trim();
  return v === "" ? null : v;
}

function buildPayload(form: FormData) {
  const products = form
    .getAll("products")
    .map((p) => p.toString())
    .filter((p): p is Product => (PRODUCTS as string[]).includes(p));

  const mode = str(form, "progress_mode") === "manual" ? "manual" : "auto";
  const manual = Math.max(0, Math.min(100, parseInt(str(form, "progress_manual") ?? "0", 10) || 0));

  return {
    name: str(form, "name") ?? "Untitled client",
    products,
    stage: str(form, "stage") ?? "onboarding",
    progress_mode: mode,
    progress_manual: manual,
    primary_contact: str(form, "primary_contact"),
    contact_email: str(form, "contact_email"),
    kickoff_date: str(form, "kickoff_date"),
    target_golive: str(form, "target_golive"),
    link: str(form, "link"),
    notes: str(form, "notes"),
  };
}

export async function createClient(form: FormData) {
  const supabase = createSupabase();
  const { data, error } = await supabase
    .from("clients")
    .insert(buildPayload(form))
    .select("id")
    .single();
  if (error) throw new Error(error.message);

  revalidatePath("/", "layout");
  redirect(`/clients/${data.id}`);
}

export async function updateClient(id: string, form: FormData) {
  const supabase = createSupabase();
  const { error } = await supabase.from("clients").update(buildPayload(form)).eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/", "layout");
  redirect(`/clients/${id}`);
}

export async function deleteClient(id: string) {
  const supabase = createSupabase();
  // Items/meetings FK to clients use ON DELETE SET NULL — they become internal.
  const { error } = await supabase.from("clients").delete().eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/", "layout");
  redirect("/clients");
}
