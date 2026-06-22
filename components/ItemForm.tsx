"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import type { Client, Item } from "@/lib/types";
import {
  ITEM_TYPE_META,
  STATUS_META,
  PRIORITY_META,
  OWNER_META,
  type ItemType,
  type ItemStatus,
  type Priority,
  type Owner,
} from "@/lib/types";
import LinksEditor from "./LinksEditor";
import ChecklistEditor from "./ChecklistEditor";

const TYPES: ItemType[] = ["bug", "product", "support", "action"];
const STATUSES: ItemStatus[] = [
  "backlog",
  "in_progress",
  "blocked_on_dev",
  "in_qa",
  "waiting_on_client",
  "done",
];
const PRIORITIES: Priority[] = ["high", "med", "low"];
const OWNERS: Owner[] = ["product", "support", "ic", "dev"];

const inputCls =
  "w-full rounded-lg border border-line bg-card px-3 py-2 text-[13px] text-ink outline-none placeholder:text-muted focus:border-accent";
const labelCls = "mb-1 block text-[11px] font-medium uppercase tracking-wide text-muted";

export default function ItemForm({
  action,
  clients,
  initial,
  submitLabel = "Save",
}: {
  action: (form: FormData) => void | Promise<void>;
  clients: Client[];
  initial?: Item;
  submitLabel?: string;
}) {
  const [clientId, setClientId] = useState(initial?.client_id ?? "");
  const languageOptions = clients.find((c) => c.id === clientId)?.languages ?? [];

  return (
    <form action={action} className="card space-y-4 p-5">
      <div>
        <label className={labelCls} htmlFor="title">Title</label>
        <input
          id="title"
          name="title"
          required
          autoFocus={!initial}
          defaultValue={initial?.title ?? ""}
          placeholder="What needs doing?"
          className={inputCls}
        />
      </div>

      <div>
        <label className={labelCls} htmlFor="description">Description</label>
        <textarea
          id="description"
          name="description"
          rows={3}
          defaultValue={initial?.description ?? ""}
          placeholder="Optional details, context, repro steps…"
          className={`${inputCls} resize-y`}
        />
        <div className="mt-2">
          <ChecklistEditor initial={initial?.checklist ?? []} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Select label="Type" name="type" defaultValue={initial?.type ?? "action"}>
          {TYPES.map((t) => (
            <option key={t} value={t}>{ITEM_TYPE_META[t].label}</option>
          ))}
        </Select>

        <Select label="Status" name="status" defaultValue={initial?.status ?? "backlog"}>
          {STATUSES.map((s) => (
            <option key={s} value={s}>{STATUS_META[s].label}</option>
          ))}
        </Select>

        <Select label="Priority" name="priority" defaultValue={initial?.priority ?? "med"}>
          {PRIORITIES.map((p) => (
            <option key={p} value={p}>{PRIORITY_META[p].label}</option>
          ))}
        </Select>

        <Select label="Owner" name="owner" defaultValue={initial?.owner ?? "ic"}>
          {OWNERS.map((o) => (
            <option key={o} value={o}>{OWNER_META[o].label}</option>
          ))}
        </Select>

        <div>
          <label className={labelCls} htmlFor="client_id">Client</label>
          <select
            id="client_id"
            name="client_id"
            value={clientId}
            onChange={(e) => setClientId(e.target.value)}
            className={inputCls}
          >
            <option value="">Internal (none)</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className={labelCls} htmlFor="language">Language</label>
          <select
            id="language"
            name="language"
            defaultValue={initial?.language ?? ""}
            disabled={languageOptions.length === 0}
            className={`${inputCls} disabled:opacity-60`}
          >
            <option value="">
              {clientId
                ? languageOptions.length
                  ? "—"
                  : "No languages on client"
                : "Select a client first"}
            </option>
            {languageOptions.map((l) => (
              <option key={l} value={l}>{l}</option>
            ))}
          </select>
        </div>

        <div>
          <label className={labelCls} htmlFor="assigned_dev">Assigned dev</label>
          <input
            id="assigned_dev"
            name="assigned_dev"
            defaultValue={initial?.assigned_dev ?? ""}
            placeholder="e.g. Anil"
            className={inputCls}
          />
        </div>

        <div>
          <label className={labelCls} htmlFor="due_date">Due date</label>
          <input
            id="due_date"
            name="due_date"
            type="date"
            defaultValue={initial?.due_date ?? ""}
            className={inputCls}
          />
        </div>
      </div>

      <div>
        <span className={labelCls}>Links</span>
        <LinksEditor initial={initial?.links ?? []} />
      </div>

      <label className="flex items-center gap-2 text-[13px] text-ink">
        <input
          type="checkbox"
          name="flag_for_standup"
          defaultChecked={initial?.flag_for_standup ?? false}
          className="h-4 w-4 rounded border-line text-accent focus:ring-accent"
        />
        Flag for standup
      </label>

      <div className="flex justify-end gap-2 border-t border-line pt-4">
        <SubmitButton label={submitLabel} />
      </div>
    </form>
  );
}

function Select({
  label,
  name,
  defaultValue,
  children,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className={labelCls} htmlFor={name}>{label}</label>
      <select id={name} name={name} defaultValue={defaultValue} className={inputCls}>
        {children}
      </select>
    </div>
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
