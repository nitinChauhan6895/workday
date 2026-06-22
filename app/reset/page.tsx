"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const inputCls =
  "w-full rounded-lg border border-line bg-card px-3 py-2.5 text-[13px] text-ink outline-none placeholder:text-muted focus:border-accent";

export default function ResetPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    setPending(true);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      setPending(false);
      setError(
        error.message.toLowerCase().includes("auth session missing")
          ? "This link has expired. Request a new one from “Forgot password”."
          : error.message,
      );
      return;
    }
    router.replace("/");
    router.refresh();
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-canvas px-6">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-semibold tracking-tight text-ink">Choose a password</h1>
          <p className="mt-1 text-[13px] text-subtle">Then you’ll be signed in.</p>
        </div>
        <form onSubmit={handleSubmit} className="card space-y-3 p-6">
          <input
            type="password"
            required
            autoFocus
            autoComplete="new-password"
            placeholder="New password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={inputCls}
          />
          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-lg bg-accent px-4 py-2.5 text-[13px] font-semibold text-white transition hover:bg-accent-dark disabled:opacity-60"
          >
            {pending ? "Saving…" : "Set password & continue"}
          </button>
          {error && <p className="text-center text-[12px] text-[#C81E1E]">{error}</p>}
        </form>
      </div>
    </main>
  );
}
