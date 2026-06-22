"use client";

import { useFormStatus } from "react-dom";
import { updateProfile } from "@/app/(app)/settings/actions";
import type { Profile } from "@/lib/types";

const inputCls =
  "w-full rounded-lg border border-line bg-card px-3 py-2 text-[13px] text-ink outline-none placeholder:text-muted focus:border-accent";
const labelCls = "mb-1 block text-[11px] font-medium uppercase tracking-wide text-muted";

export default function ProfileForm({
  initial,
  email,
}: {
  initial: Profile;
  email: string;
}) {
  return (
    <form action={updateProfile} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelCls} htmlFor="first_name">First name</label>
          <input id="first_name" name="first_name" defaultValue={initial.first_name} className={inputCls} />
        </div>
        <div>
          <label className={labelCls} htmlFor="last_name">Last name</label>
          <input id="last_name" name="last_name" defaultValue={initial.last_name} className={inputCls} />
        </div>
      </div>
      <div>
        <label className={labelCls} htmlFor="organisation">Organisation</label>
        <input id="organisation" name="organisation" defaultValue={initial.organisation} className={inputCls} />
      </div>
      <div>
        <label className={labelCls}>Email</label>
        <input value={email} disabled className={`${inputCls} opacity-60`} />
      </div>
      <div className="flex justify-end">
        <SaveButton />
      </div>
    </form>
  );
}

function SaveButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-lg bg-accent px-4 py-2 text-[13px] font-semibold text-white transition hover:bg-accent-dark disabled:opacity-60"
    >
      {pending ? "Saving…" : "Save profile"}
    </button>
  );
}
