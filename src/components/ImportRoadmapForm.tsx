"use client";

import { useActionState } from "react";
import { importRoadmapFile, resetDemoProgram, type ImportRoadmapState } from "@/app/actions";
import { CornerTicks } from "@/components/CornerTicks";

const initialState: ImportRoadmapState = {};

export function ImportRoadmapForm() {
  const [state, formAction, isPending] = useActionState(importRoadmapFile, initialState);

  return (
    <div className="flex flex-col gap-8 w-full max-w-[560px]">
      <div className="flex flex-col gap-2">
        <div className="font-mono text-[11px] tracking-[0.16em]" style={{ color: "var(--amber)" }}>
          BUILD YOUR OWN ROADMAP
        </div>
        <div className="font-serif text-[26px] leading-tight">Import a roadmap</div>
        <div className="text-[13px] leading-relaxed" style={{ color: "var(--muted)" }}>
          Download a template, fill in your own weeks and tasks — any category labels you like, with
          optional links — and upload it here. This replaces whatever roadmap is currently loaded.
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
        <input
          type="file"
          name="file"
          accept=".xlsx,.json,application/json,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
          required
          className="font-mono text-[12px]"
          style={{ color: "var(--text-dim)" }}
        />
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

      <div className="flex flex-col gap-3 pt-4" style={{ borderTop: "1px solid var(--border)" }}>
        <div className="font-mono text-[10px] tracking-[0.16em]" style={{ color: "var(--muted-2)" }}>
          OR
        </div>
        <form action={resetDemoProgram}>
          <button
            type="submit"
            className="font-mono text-[11px] tracking-[0.12em] px-4 py-2.5 cursor-pointer bg-transparent transition-colors"
            style={{ border: "1px solid var(--border-strong)", color: "var(--muted)" }}
          >
            RESET TO DEMO PROGRAM
          </button>
        </form>
      </div>
    </div>
  );
}
