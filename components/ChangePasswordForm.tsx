"use client";

import { useRef, useState, useTransition } from "react";
import { changePassword } from "@/app/(app)/settings/actions";

const inputCls =
  "w-full rounded-lg border border-line bg-card px-3 py-2 text-[13px] text-ink outline-none placeholder:text-muted focus:border-accent";

export default function ChangePasswordForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null);

  return (
    <form
      ref={formRef}
      action={(form) => {
        setResult(null);
        startTransition(async () => {
          const r = await changePassword(form);
          setResult(r);
          if (r.ok) formRef.current?.reset();
        });
      }}
      className="flex flex-wrap items-center gap-2"
    >
      <input
        name="password"
        type="password"
        required
        autoComplete="new-password"
        placeholder="New password"
        className={`${inputCls} max-w-xs flex-1`}
      />
      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-accent px-4 py-2 text-[13px] font-semibold text-white transition hover:bg-accent-dark disabled:opacity-60"
      >
        {pending ? "Updating…" : "Update password"}
      </button>
      {result && (
        <span className={`text-[12px] ${result.ok ? "text-[#1A7F37]" : "text-[#C81E1E]"}`}>
          {result.message}
        </span>
      )}
    </form>
  );
}
