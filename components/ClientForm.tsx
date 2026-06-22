"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import type { Client, Product, ClientStage } from "@/lib/types";
import { STAGE_META } from "@/lib/types";

const PRODUCTS: Product[] = ["ASR", "STT", "TTS"];
const STAGES: ClientStage[] = ["onboarding", "in_progress", "in_qa", "live", "on_hold"];

const inputCls =
  "w-full rounded-lg border border-line bg-card px-3 py-2 text-[13px] text-ink outline-none placeholder:text-muted focus:border-accent";
const labelCls = "mb-1 block text-[11px] font-medium uppercase tracking-wide text-muted";

export default function ClientForm({
  action,
  initial,
  submitLabel = "Save",
}: {
  action: (form: FormData) => void | Promise<void>;
  initial?: Client;
  submitLabel?: string;
}) {
  const [mode, setMode] = useState<"auto" | "manual">(initial?.progress_mode ?? "auto");

  return (
    <form action={action} className="card space-y-4 p-5">
      <div>
        <label className={labelCls} htmlFor="name">Name</label>
        <input
          id="name"
          name="name"
          required
          autoFocus={!initial}
          defaultValue={initial?.name ?? ""}
          placeholder="Client / account name"
          className={inputCls}
        />
      </div>

      <div>
        <span className={labelCls}>Products</span>
        <div className="flex gap-2">
          {PRODUCTS.map((p) => (
            <label
              key={p}
              className="flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-line bg-card px-3 py-2 text-[13px] text-ink has-[:checked]:border-accent has-[:checked]:bg-accent-soft has-[:checked]:text-accent"
            >
              <input
                type="checkbox"
                name="products"
                value={p}
                defaultChecked={initial?.products?.includes(p) ?? false}
                className="sr-only"
              />
              {p}
            </label>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelCls} htmlFor="stage">Stage</label>
          <select
            id="stage"
            name="stage"
            defaultValue={initial?.stage ?? "onboarding"}
            className={inputCls}
          >
            {STAGES.map((s) => (
              <option key={s} value={s}>{STAGE_META[s].label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className={labelCls} htmlFor="progress_mode">Progress</label>
          <select
            id="progress_mode"
            name="progress_mode"
            value={mode}
            onChange={(e) => setMode(e.target.value as "auto" | "manual")}
            className={inputCls}
          >
            <option value="auto">Auto (% of items done)</option>
            <option value="manual">Manual</option>
          </select>
        </div>
      </div>

      {mode === "manual" && (
        <div>
          <label className={labelCls} htmlFor="progress_manual">Manual progress (%)</label>
          <input
            id="progress_manual"
            name="progress_manual"
            type="number"
            min={0}
            max={100}
            defaultValue={initial?.progress_manual ?? 0}
            className={inputCls}
          />
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelCls} htmlFor="primary_contact">Primary contact</label>
          <input
            id="primary_contact"
            name="primary_contact"
            defaultValue={initial?.primary_contact ?? ""}
            className={inputCls}
          />
        </div>
        <div>
          <label className={labelCls} htmlFor="contact_email">Contact email</label>
          <input
            id="contact_email"
            name="contact_email"
            type="email"
            defaultValue={initial?.contact_email ?? ""}
            className={inputCls}
          />
        </div>
        <div>
          <label className={labelCls} htmlFor="kickoff_date">Kickoff date</label>
          <input
            id="kickoff_date"
            name="kickoff_date"
            type="date"
            defaultValue={initial?.kickoff_date ?? ""}
            className={inputCls}
          />
        </div>
        <div>
          <label className={labelCls} htmlFor="target_golive">Target go-live</label>
          <input
            id="target_golive"
            name="target_golive"
            type="date"
            defaultValue={initial?.target_golive ?? ""}
            className={inputCls}
          />
        </div>
      </div>

      <div>
        <label className={labelCls} htmlFor="link">Link</label>
        <input
          id="link"
          name="link"
          type="url"
          defaultValue={initial?.link ?? ""}
          placeholder="https://…"
          className={inputCls}
        />
      </div>

      <div>
        <label className={labelCls} htmlFor="notes">Notes</label>
        <textarea
          id="notes"
          name="notes"
          rows={3}
          defaultValue={initial?.notes ?? ""}
          className={`${inputCls} resize-y`}
        />
      </div>

      <div className="flex justify-end gap-2 border-t border-line pt-4">
        <SubmitButton label={submitLabel} />
      </div>
    </form>
  );
}

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-lg bg-accent px-4 py-2 text-[13px] font-semibold text-white transition hover:bg-accent-dark disabled:opacity-60"
    >
      {pending ? "Saving…" : label}
    </button>
  );
}
