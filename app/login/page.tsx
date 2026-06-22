"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Mode = "signin" | "signup";

const inputCls =
  "w-full rounded-lg border border-line bg-card px-3 py-2.5 text-[13px] text-ink outline-none placeholder:text-muted focus:border-accent";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("signin");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [organisation, setOrganisation] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setNotice("");

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setPending(true);
    const supabase = createClient();

    if (mode === "signup") {
      if (!firstName.trim() || !lastName.trim()) {
        setPending(false);
        setError("Please enter your first and last name.");
        return;
      }
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            first_name: firstName.trim(),
            last_name: lastName.trim(),
            organisation: organisation.trim(),
          },
        },
      });
      if (error) {
        setPending(false);
        setError(friendly(error.message));
        return;
      }
      if (!data.session) {
        setPending(false);
        setNotice("Account created. Check your email to confirm, then sign in.");
        setMode("signin");
        return;
      }
      router.replace("/");
      router.refresh();
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    if (error) {
      setPending(false);
      setError(friendly(error.message));
      return;
    }
    router.replace("/");
    router.refresh();
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
            {mode === "signin" ? "Sign in to your workspace." : "Create your account."}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="card space-y-3 p-6">
          {mode === "signup" && (
            <>
              <div className="flex gap-3">
                <input
                  type="text"
                  required
                  autoComplete="given-name"
                  placeholder="First name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className={inputCls}
                />
                <input
                  type="text"
                  required
                  autoComplete="family-name"
                  placeholder="Last name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className={inputCls}
                />
              </div>
              <input
                type="text"
                autoComplete="organization"
                placeholder="Organisation"
                value={organisation}
                onChange={(e) => setOrganisation(e.target.value)}
                className={inputCls}
              />
            </>
          )}
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
          <input
            type="password"
            required
            autoComplete={mode === "signin" ? "current-password" : "new-password"}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={inputCls}
          />
          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-lg bg-accent px-4 py-2.5 text-[13px] font-semibold text-white transition hover:bg-accent-dark disabled:opacity-60"
          >
            {pending ? "Please wait…" : mode === "signin" ? "Sign in" : "Create account"}
          </button>

          {error && <p className="text-center text-[12px] text-[#C81E1E]">{error}</p>}
          {notice && <p className="text-center text-[12px] text-[#1A7F37]">{notice}</p>}
        </form>

        <div className="mt-4 flex items-center justify-between px-1 text-[12px]">
          <button
            type="button"
            onClick={() => {
              setMode(mode === "signin" ? "signup" : "signin");
              setError("");
              setNotice("");
            }}
            className="font-medium text-accent hover:underline"
          >
            {mode === "signin" ? "Create an account" : "Have an account? Sign in"}
          </button>
          {mode === "signin" && (
            <Link href="/forgot" className="text-subtle hover:text-ink">
              Forgot password?
            </Link>
          )}
        </div>
      </div>
    </main>
  );
}

function friendly(message: string): string {
  const m = message.toLowerCase();
  if (m.includes("invalid login credentials")) return "Wrong email or password.";
  if (m.includes("already registered") || m.includes("already been registered"))
    return "That email already has an account. Sign in, or use “Forgot password”.";
  if (m.includes("email not confirmed"))
    return "Email not confirmed yet — check your inbox.";
  return message;
}
