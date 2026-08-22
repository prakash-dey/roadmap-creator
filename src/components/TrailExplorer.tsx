"use client";

import { useEffect, useRef, useState } from "react";
import type { WeekDetailVM } from "@/lib/data";
import { DesktopTrail, MobileTrail } from "@/components/TrailSvg";

type PopoverPosition = { left: number; top?: number; bottom?: number; arrowLeft: number; placement: "above" | "below" };

const KIND_LABEL: Record<WeekDetailVM["kind"], string> = { passed: "PASSED", current: "CURRENT", upcoming: "UPCOMING", finish: "FINISH" };
const TASK_STATE = {
  completed: { label: "COMPLETED", color: "var(--green)" },
  "in-progress": { label: "IN PROGRESS", color: "var(--amber)" },
  pending: { label: "PENDING", color: "var(--muted-2)" },
} as const;

export function TrailExplorer({ weeks, progress, today }: { weeks: WeekDetailVM[]; progress: number; today: number }) {
  const [selectedWeek, setSelectedWeek] = useState<number | null>(null);
  const [position, setPosition] = useState<PopoverPosition | null>(null);
  const [activeTrigger, setActiveTrigger] = useState<SVGGElement | null>(null);
  const selected = weeks.find((week) => week.number === selectedWeek) ?? null;

  function openWeek(weekNumber: number, trigger: SVGGElement) {
    setActiveTrigger(trigger);
    setPosition(getPopoverPosition(trigger));
    setSelectedWeek(weekNumber);
  }

  function closeWeek() {
    setSelectedWeek(null);
    setPosition(null);
    requestAnimationFrame(() => activeTrigger?.focus());
  }

  return <>
    <div className="hidden md:block pb-12">
      <DesktopTrail checkpoints={weeks} progress={progress} today={today} selectedWeek={selectedWeek ?? undefined} onSelectWeek={openWeek} />
    </div>
    <div className="md:hidden flex justify-center py-4">
      <MobileTrail checkpoints={weeks} progress={progress} today={today} selectedWeek={selectedWeek ?? undefined} onSelectWeek={openWeek} />
    </div>
    {selected && position && <WeekDetailPopover week={selected} position={position} trigger={activeTrigger} onClose={closeWeek} />}
  </>;
}

function getPopoverPosition(trigger: SVGGElement): PopoverPosition {
  const rect = trigger.getBoundingClientRect();
  const edge = 12;
  const width = 200;
  const anchorX = rect.left + rect.width / 2;
  const left = Math.min(Math.max(edge, anchorX - width / 2), window.innerWidth - width - edge);
  const placement = window.innerHeight - rect.bottom >= 224 ? "below" : "above";
  return {
    left,
    top: placement === "below" ? rect.bottom + 16 : undefined,
    bottom: placement === "above" ? window.innerHeight - rect.top + 16 : undefined,
    arrowLeft: Math.min(Math.max(12, anchorX - left), width - 12),
    placement,
  };
}

function WeekDetailPopover({ week, position, trigger, onClose }: { week: WeekDetailVM; position: PopoverPosition; trigger: SVGGElement | null; onClose: () => void }) {
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) { if (event.key === "Escape") onClose(); }
    function onPointerDown(event: PointerEvent) {
      const target = event.target as Node;
      if (!popoverRef.current?.contains(target) && !trigger?.contains(target)) onClose();
    }
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [onClose, trigger]);

  const total = week.tasks.length;
  return (
    <div ref={popoverRef} role="dialog" aria-modal="false" aria-labelledby="week-detail-title" className="week-detail-popover fixed z-50 h-[200px] w-[200px] overflow-visible border bg-[var(--panel-alt)] text-[var(--text)]" style={{ left: position.left, top: position.top, bottom: position.bottom }}>
      <span className={`week-detail-notch week-detail-notch-${position.placement}`} style={{ left: position.arrowLeft }} aria-hidden="true" />
      {(["tl", "tr", "bl", "br"] as const).map((corner) => <span key={corner} className={`week-detail-corner week-detail-corner-${corner}`} aria-hidden="true" />)}
      <div className="flex h-full flex-col overflow-hidden p-2">
        <header className="flex shrink-0 items-start justify-between gap-2 border-b pb-2" style={{ borderColor: "var(--border)" }}>
          <div className="min-w-0 overflow-hidden">
            <div className="font-mono text-[7px] leading-none tracking-[0.08em]" style={{ color: "var(--muted-2)" }}>W{String(week.number).padStart(2, "0")} · {KIND_LABEL[week.kind]}</div>
            <h2 id="week-detail-title" className="mt-1 truncate font-serif text-xs leading-tight">{week.focus || `Week ${week.number}`}</h2>
          </div>
          <button type="button" onClick={onClose} className="flex h-6 w-6 shrink-0 items-center justify-center font-mono text-sm leading-none" style={{ color: "var(--muted)" }} aria-label="Close week details">×</button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto py-1">
          {week.tasks.length === 0 ? <p className="text-[9px] leading-tight" style={{ color: "var(--muted)" }}>No tasks</p> : (
            <ul>
              {week.tasks.map((task) => {
                const state = TASK_STATE[task.state];
                return <li key={task.id} className="flex min-w-0 items-center gap-1.5 border-t py-1.5 first:border-t-0" style={{ borderColor: "var(--border)" }} aria-label={`${task.name}, ${state.label}`} title={`${task.name} — ${state.label}`}>
                  <span className="h-[5px] w-[5px] shrink-0" style={{ background: state.color }} aria-hidden="true" />
                  <span className="min-w-0 flex-1 truncate text-[9px] leading-tight" style={{ color: "var(--text-dim)" }}>{task.name}</span>
                  <span className="shrink-0 font-mono text-[7px] leading-none" style={{ color: state.color }}>{state.label.charAt(0)}</span>
                </li>;
              })}
            </ul>
          )}
        </div>

        <footer className="flex shrink-0 items-center justify-between border-t pt-2 font-mono text-[7px] leading-none" style={{ borderColor: "var(--border)" }} aria-label={`${week.completed} completed, ${week.inProgress} in progress, ${week.pending} pending`}>
          <span style={{ color: "var(--green)" }}>C{week.completed}</span>
          <span style={{ color: "var(--amber)" }}>I{week.inProgress}</span>
          <span style={{ color: "var(--muted-2)" }}>P{week.pending}</span>
          <span style={{ color: "var(--text-dim)" }}>{week.completed}/{total}</span>
        </footer>
      </div>
    </div>
  );
}
