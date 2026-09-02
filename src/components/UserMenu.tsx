"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { signOut } from "@/app/auth/actions";
import { Avatar } from "@/components/Avatar";

export function UserMenu({ name, email }: { name: string; email: string }) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const firstItemRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(e: PointerEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    }
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    firstItemRef.current?.focus();
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative shrink-0">
      <button
        ref={buttonRef}
        type="button"
        aria-label="Account menu"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="flex items-center justify-center rounded-full cursor-pointer transition-all hover:brightness-110"
        style={{
          outline: `1px solid ${open ? "var(--amber)" : "transparent"}`,
          outlineOffset: 2,
        }}
      >
        <Avatar name={name} email={email} size={36} />
      </button>

      {open && (
        <div
          role="menu"
          aria-label="Account menu"
          className="absolute right-0 top-[calc(100%+8px)] z-50 flex w-[260px] flex-col overflow-hidden"
          style={{ border: "1px solid var(--border-strong)", background: "var(--panel)", boxShadow: "0 18px 45px rgba(0,0,0,.5)" }}
        >
          <div className="flex items-center gap-3 px-4 py-3" style={{ borderBottom: "1px solid var(--border)" }}>
            <Avatar name={name} email={email} size={40} />
            <div className="flex min-w-0 flex-col gap-0.5">
              <span className="truncate font-serif text-[15px]" style={{ color: "var(--text)" }}>
                {name || "Your account"}
              </span>
              <span className="truncate font-mono text-[10px] tracking-[0.08em]" style={{ color: "var(--muted-2)" }}>
                {email}
              </span>
            </div>
          </div>

          <button
            ref={firstItemRef}
            type="button"
            role="menuitem"
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
