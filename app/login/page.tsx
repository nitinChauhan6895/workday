"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [pending, setPending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setPending(true);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: {
        emailRedirectTo: `${window.location.origin}/auth/confirm`,
        shouldCreateUser: true,
      },
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
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-accent text-lg font-semibold text-white">
            W
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-ink">WorkDay</h1>
          <p className="mt-1 text-[13px] text-subtle">
            Sign in with a magic link to your email.
          </p>
        </div>

        {sent ? (
          <div className="card p-6 text-center">
            <p className="text-[14px] font-medium text-ink">Check your inbox</p>
            <p className="mt-1.5 text-[13px] text-subtle">
              We sent a sign-in link to <span className="text-ink">{email}</span>.
              Open it on this device to continue.
            </p>
            <button
              onClick={() => {
                setSent(false);
                setError("");
              }}
              className="mt-4 text-[13px] font-medium text-accent hover:underline"
            >
              Use a different email
            </button>
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
              className="w-full rounded-lg border border-line bg-card px-3 py-2.5 text-[13px] text-ink outline-none placeholder:text-muted focus:border-accent"
            />
            <button
              type="submit"
              disabled={pending}
              className="w-full rounded-lg bg-accent px-4 py-2.5 text-[13px] font-semibold text-white transition hover:bg-accent-dark disabled:opacity-60"
            >
              {pending ? "Sending…" : "Send magic link"}
            </button>
            {error && <p className="text-center text-[12px] text-[#C81E1E]">{error}</p>}
          </form>
        )}
      </div>
    </main>
  );
}
