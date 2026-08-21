"use client";

import Link from "next/link";
import { useActionState } from "react";
import type { AuthState } from "@/app/auth/actions";

type AuthAction = (previous: AuthState, formData: FormData) => Promise<AuthState>;

export function AuthForm({ mode, action }: { mode: "sign-in" | "sign-up"; action: AuthAction }) {
  const [state, formAction, pending] = useActionState(action, null);
  const signingUp = mode === "sign-up";

  return (
    <main className="flex min-h-screen items-center justify-center px-6" style={{ background: "var(--bg)" }}>
      <form action={formAction} className="w-full max-w-sm border p-7" style={{ background: "var(--panel)", borderColor: "var(--border-strong)" }}>
        <p className="font-mono text-[10px] tracking-[0.2em]" style={{ color: "var(--amber)" }}>THE ASCENT</p>
        <h1 className="mt-2 font-serif text-3xl">{signingUp ? "Begin your ascent" : "Welcome back"}</h1>
        <p className="mt-2 text-sm" style={{ color: "var(--muted)" }}>
          {signingUp ? "Create an account to protect your roadmap." : "Sign in to continue to your roadmap."}
        </p>

        <div className="mt-7 flex flex-col gap-4">
          {signingUp && <Field label="Name" name="name" type="text" autoComplete="name" />}
          <Field label="Email" name="email" type="email" autoComplete="email" />
          <Field label="Password" name="password" type="password" autoComplete={signingUp ? "new-password" : "current-password"} />
        </div>

        {state?.error && <p className="mt-4 text-sm" style={{ color: "var(--red-soft)" }}>{state.error}</p>}

        <button
          type="submit"
          disabled={pending}
          className="mt-6 w-full px-4 py-3 font-mono text-xs font-bold tracking-[0.12em] disabled:opacity-60"
          style={{ background: "var(--amber)", color: "var(--bg)" }}
        >
          {pending ? "PLEASE WAIT…" : signingUp ? "CREATE ACCOUNT" : "SIGN IN"}
        </button>

        <p className="mt-5 text-center text-sm" style={{ color: "var(--muted)" }}>
          {signingUp ? "Already have an account? " : "New here? "}
          <Link href={signingUp ? "/auth/sign-in" : "/auth/sign-up"}>
            {signingUp ? "Sign in" : "Create an account"}
          </Link>
        </p>
      </form>
    </main>
  );
}

function Field({ label, ...props }: { label: string; name: string; type: string; autoComplete: string }) {
  return (
    <label className="flex flex-col gap-2 text-xs font-medium tracking-wide" style={{ color: "var(--text-dim)" }}>
      {label.toUpperCase()}
      <input
        {...props}
        required
        className="border bg-transparent px-3 py-2.5 text-sm outline-none focus:border-[var(--amber)]"
        style={{ borderColor: "var(--border-strong)", color: "var(--text)" }}
      />
    </label>
  );
}
