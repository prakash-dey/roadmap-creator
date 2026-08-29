"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { RoadmapSummary } from "@/lib/data";
import { useRouteTransition } from "@/components/RouteTransitionProvider";

export function BoardSwitcher({
  roadmaps,
  currentRoadmapId,
}: {
  roadmaps: RoadmapSummary[];
  currentRoadmapId: number;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const { navigate } = useRouteTransition();

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
        aria-label="Switch roadmap"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="flex h-9 w-9 flex-col items-center justify-center gap-[4px] cursor-pointer transition-colors hover:brightness-110"
        style={{ border: "1px solid var(--border-strong)", background: open ? "var(--panel-alt)" : "transparent" }}
      >
        <span className="block h-[1.5px] w-4" style={{ background: open ? "var(--amber)" : "var(--text-dim)" }} />
        <span className="block h-[1.5px] w-4" style={{ background: open ? "var(--amber)" : "var(--text-dim)" }} />
        <span className="block h-[1.5px] w-4" style={{ background: open ? "var(--amber)" : "var(--text-dim)" }} />
      </button>

      {open && (
        <div
          className="absolute left-0 top-[calc(100%+8px)] z-50 flex max-h-[70vh] w-[300px] flex-col gap-0 overflow-hidden"
          style={{ border: "1px solid var(--border-strong)", background: "var(--panel)", boxShadow: "0 18px 45px rgba(0,0,0,.5)" }}
        >
          <div
            className="px-4 py-3 font-mono text-[10px] tracking-[0.16em]"
            style={{ color: "var(--muted-2)", borderBottom: "1px solid var(--border)" }}
          >
            YOUR ROADMAPS · {roadmaps.length}
          </div>

          <div className="flex flex-col overflow-y-auto">
            {roadmaps.map((roadmap) => {
              const active = roadmap.id === currentRoadmapId;
              const href = `/?roadmap=${roadmap.id}`;
              return (
                <Link
                  key={roadmap.id}
                  href={href}
                  onClick={(e) => {
                    setOpen(false);
                    if (active || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
                    // Show the shimmer immediately and kick off the fetch in
                    // the background, instead of waiting on the plain <Link>
                    // navigation (which leaves the old page feeling stuck
                    // until the new roadmap's data resolves).
                    e.preventDefault();
                    navigate(href);
                  }}
                  className="flex min-w-0 flex-col gap-0.5 px-4 py-2.5 transition-colors hover:brightness-110"
                  style={{
                    background: active ? "var(--panel-alt)" : "transparent",
                    borderLeft: active ? "2px solid var(--amber)" : "2px solid transparent",
                  }}
                >
                  <span
                    className="block truncate font-serif text-[15px]"
                    style={{ color: active ? "var(--amber)" : "var(--text)" }}
                  >
                    {roadmap.title}
                  </span>
                  <span className="block truncate font-mono text-[10px] tracking-[0.08em]" style={{ color: "var(--muted-2)" }}>
                    {roadmap.totalWeeks} WEEKS
                  </span>
                </Link>
              );
            })}
          </div>

          <Link
            href="/roadmap"
            onClick={() => setOpen(false)}
            className="px-4 py-3 font-mono text-[11px] tracking-[0.12em] transition-colors hover:brightness-110"
            style={{ color: "var(--amber)", borderTop: "1px solid var(--border)" }}
          >
            + MANAGE / IMPORT ROADMAPS
          </Link>
        </div>
      )}
    </div>
  );
}
