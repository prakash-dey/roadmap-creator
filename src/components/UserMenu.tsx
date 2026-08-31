"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { signOut } from "@/app/auth/actions";

function initialsFor(name: string, email: string): string {
  const source = name.trim() || email.trim();
  if (!source) return "?";
  const parts = source.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return source.slice(0, 2).toUpperCase();
}

export function UserMenu({ name, email }: { name: string; email: string }) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(e: PointerEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative shrink-0">
      <button
        type="button"
        aria-label="Account menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="flex h-9 w-9 items-center justify-center rounded-full font-mono text-[11px] font-bold cursor-pointer transition-colors hover:brightness-110"
        style={{
          border: `1px solid ${open ? "var(--amber)" : "var(--border-strong)"}`,
          background: open ? "var(--panel-alt)" : "transparent",
          color: "var(--amber)",
        }}
      >
        {initialsFor(name, email)}
      </button>

      {open && (
        <div
          className="absolute right-0 top-[calc(100%+8px)] z-50 flex w-[260px] flex-col overflow-hidden"
          style={{ border: "1px solid var(--border-strong)", background: "var(--panel)", boxShadow: "0 18px 45px rgba(0,0,0,.5)" }}
        >
          <div className="flex flex-col gap-0.5 px-4 py-3" style={{ borderBottom: "1px solid var(--border)" }}>
            <span className="truncate font-serif text-[15px]" style={{ color: "var(--text)" }}>
              {name || "Your account"}
            </span>
            <span className="truncate font-mono text-[10px] tracking-[0.08em]" style={{ color: "var(--muted-2)" }}>
              {email}
            </span>
          </div>

          <button
            type="button"
            disabled={isPending}
            onClick={() => startTransition(() => signOut())}
            className="px-4 py-3 text-left font-mono text-[11px] tracking-[0.12em] cursor-pointer transition-colors hover:brightness-110 disabled:opacity-60"
            style={{ color: "var(--red-soft)" }}
          >
            {isPending ? "SIGNING OUT…" : "SIGN OUT"}
          </button>
        </div>
      )}
    </div>
  );
}
