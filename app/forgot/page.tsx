"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

const inputCls =
  "w-full rounded-lg border border-line bg-card px-3 py-2.5 text-[13px] text-ink outline-none placeholder:text-muted focus:border-accent";

export default function ForgotPage() {
  const [email, setEmail] = useState("");
  const [pending, setPending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setPending(true);
    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/auth/confirm?next=/reset`,
    });
    setPending(false);
    if (error) {
      setError(error.message);
      return;
    }
    setSent(true);
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-canvas px-6">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-semibold tracking-tight text-ink">Set a password</h1>
          <p className="mt-1 text-[13px] text-subtle">
            We’ll email you a link to set or reset your password.
          </p>
        </div>

        {sent ? (
          <div className="card p-6 text-center">
            <p className="text-[14px] font-medium text-ink">Check your inbox</p>
            <p className="mt-1.5 text-[13px] text-subtle">
              Open the link sent to <span className="text-ink">{email}</span> to
              choose a password.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="card space-y-3 p-6">
            <input
              type="email"
              required
              autoFocus
              autoCapitalize="none"
              autoCorrect="off"
              autoComplete="email"
              placeholder="you@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputCls}
            />
            <button
              type="submit"
              disabled={pending}
              className="w-full rounded-lg bg-accent px-4 py-2.5 text-[13px] font-semibold text-white transition hover:bg-accent-dark disabled:opacity-60"
            >
              {pending ? "Sending…" : "Send link"}
            </button>
            {error && <p className="text-center text-[12px] text-[#C81E1E]">{error}</p>}
          </form>
        )}

        <div className="mt-4 text-center">
          <Link href="/login" className="text-[12px] text-accent hover:underline">
            ← Back to sign in
          </Link>
        </div>
      </div>
    </main>
  );
}
