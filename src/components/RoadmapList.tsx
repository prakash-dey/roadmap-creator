"use client";

import Link from "next/link";
import { useTransition } from "react";
import { deleteRoadmap } from "@/app/actions";
import type { RoadmapSummary } from "@/lib/data";

export function RoadmapList({ roadmaps }: { roadmaps: RoadmapSummary[] }) {
  return (
    <section className="flex w-full max-w-[560px] flex-col gap-3">
      <div className="font-mono text-[10px] tracking-[0.16em]" style={{ color: "var(--muted-2)" }}>
        YOUR ROADMAPS · {roadmaps.length}
      </div>
      {roadmaps.length === 0 ? (
        <div className="border px-4 py-5 text-[13px]" style={{ borderColor: "var(--border-strong)", color: "var(--muted)" }}>
          No roadmaps yet. Import one below to get started.
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {roadmaps.map((roadmap) => <RoadmapRow key={roadmap.id} roadmap={roadmap} />)}
        </div>
      )}
    </section>
  );
}

function RoadmapRow({ roadmap }: { roadmap: RoadmapSummary }) {
  const [pending, startTransition] = useTransition();

  function remove() {
    if (!window.confirm(`Delete “${roadmap.title}” and all of its progress? This cannot be undone.`)) return;
    startTransition(() => deleteRoadmap(roadmap.id));
  }

  return (
    <div className="flex min-w-0 items-center gap-3 border p-3" style={{ borderColor: "var(--border-strong)", background: "var(--panel)" }}>
      <Link href={`/?roadmap=${roadmap.id}`} className="min-w-0 flex-1">
        <span className="block truncate font-serif text-[18px]" style={{ color: "var(--text)" }}>{roadmap.title}</span>
        <span className="mt-1 block truncate font-mono text-[10px] tracking-[0.1em]" style={{ color: "var(--muted-2)" }}>
          {roadmap.totalWeeks} WEEKS · {roadmap.subtitle || "NO SUBTITLE"}
        </span>
      </Link>
      <button
        type="button"
        onClick={remove}
        disabled={pending}
        className="min-h-11 shrink-0 border px-3 font-mono text-[10px] tracking-[0.1em] disabled:opacity-50"
        style={{ borderColor: "#3a2523", color: "var(--red-soft)" }}
      >
        {pending ? "DELETING…" : "DELETE"}
      </button>
    </div>
  );
}
