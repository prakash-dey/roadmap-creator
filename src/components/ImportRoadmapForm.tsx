"use client";

import { useActionState, useState } from "react";
import { importRoadmapFile, type ImportRoadmapState } from "@/app/actions";
import { CornerTicks } from "@/components/CornerTicks";

const initialState: ImportRoadmapState = {};

export function ImportRoadmapForm() {
  const [state, formAction, isPending] = useActionState(importRoadmapFile, initialState);
  const [fileName, setFileName] = useState<string | null>(null);

  return (
    <div className="flex flex-col gap-8 w-full max-w-[560px]">
      <div className="flex flex-col gap-2">
        <div className="font-mono text-[11px] tracking-[0.16em]" style={{ color: "var(--amber)" }}>
          CREATE ANOTHER ROADMAP
        </div>
        <div className="font-serif text-[26px] leading-tight">Import a roadmap</div>
        <div className="text-[13px] leading-relaxed" style={{ color: "var(--muted)" }}>
          Download a template, fill in your own weeks and tasks — any category labels you like, with
          optional links — and upload it here. Existing roadmaps stay untouched.
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <div className="font-mono text-[10px] tracking-[0.16em]" style={{ color: "var(--muted-2)" }}>
          1 · DOWNLOAD A TEMPLATE
        </div>
        <div className="flex gap-3 flex-wrap">
          <a
            href="/api/template/xlsx"
            className="font-mono text-[11px] tracking-[0.12em] px-4 py-2.5 transition-colors hover:brightness-110"
            style={{ border: "1px solid var(--border-strong)", color: "var(--text-dim)" }}
          >
            EXCEL TEMPLATE (.xlsx)
          </a>
          <a
            href="/api/template/json"
            className="font-mono text-[11px] tracking-[0.12em] px-4 py-2.5 transition-colors hover:brightness-110"
            style={{ border: "1px solid var(--border-strong)", color: "var(--text-dim)" }}
          >
            JSON TEMPLATE (.json)
          </a>
        </div>
      </div>

      <form action={formAction} className="flex flex-col gap-3">
        <div className="font-mono text-[10px] tracking-[0.16em]" style={{ color: "var(--muted-2)" }}>
          2 · UPLOAD YOUR FILLED-IN FILE
        </div>
        <label
          className="flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors hover:brightness-110"
          style={{ border: "1px solid var(--border-strong)", background: "var(--panel-alt)" }}
        >
          <input
            type="file"
            name="file"
            accept=".xlsx,.json,application/json,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            required
            className="sr-only"
            onChange={(e) => setFileName(e.target.files?.[0]?.name ?? null)}
          />
          <span
            className="font-mono text-[11px] tracking-[0.12em] px-3 py-1.5 shrink-0"
            style={{ background: "var(--border-strong)", color: "var(--text-dim)" }}
          >
            CHOOSE FILE
          </span>
          <span
            className="font-mono text-[12px] truncate"
            style={{ color: fileName ? "var(--text-dim)" : "var(--muted-2)" }}
          >
            {fileName ?? "No file selected"}
          </span>
        </label>
        {state.error && (
          <div className="text-[12px] leading-relaxed px-3 py-2.5" style={{ borderLeft: "2px solid var(--red)", background: "#1a1417", color: "#B9927F" }}>
            {state.error}
          </div>
        )}
        <div className="relative mt-1 self-start">
          <CornerTicks color="var(--amber)" inset={-5} />
          <button
            type="submit"
            disabled={isPending}
            className="font-mono text-[12px] font-bold tracking-[0.14em] px-6 py-3 cursor-pointer transition-colors hover:brightness-110 disabled:opacity-60"
            style={{ background: "var(--amber)", color: "var(--panel)", border: "none" }}
          >
            {isPending ? "IMPORTING…" : "IMPORT ROADMAP"}
          </button>
        </div>
      </form>

    </div>
  );
}
