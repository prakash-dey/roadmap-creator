"use client";

import { useMemo, useOptimistic, useState } from "react";
import type { CoverageVM, DayVM, RecentLogEntryVM, WeekDetailVM } from "@/lib/data";
import { addDays, formatMonthDay, fromDateKey, toDateKey } from "@/lib/dates";
import { WeekGrid } from "@/components/WeekGrid";
import { CheckInPanel } from "@/components/CheckInPanel";
import { CoverageBars } from "@/components/CoverageBars";
import { RecentLog } from "@/components/RecentLog";

export function DashboardWeekSection({
  roadmapId,
  allDays,
  todayDateKey,
  currentWeekNumber,
  totalWeeks,
  weekDetails,
  coverage,
  recentLog,
}: {
  roadmapId: number;
  allDays: DayVM[];
  todayDateKey: string;
  currentWeekNumber: number;
  totalWeeks: number;
  weekDetails: WeekDetailVM[];
  coverage: CoverageVM[];
  recentLog: RecentLogEntryVM[];
}) {
  const [activeWeekNumber, setActiveWeekNumber] = useState(currentWeekNumber);
  const [selectedDateKey, setSelectedDateKey] = useState(todayDateKey);
  const [localDays, setOptimisticTask] = useOptimistic(
    allDays,
    (current, change: { taskId: number; done: boolean }) => current.map((day) => ({
      ...day,
      tasks: day.tasks.map((task) => task.id === change.taskId ? { ...task, done: change.done } : task),
    })),
  );

  const days = useMemo(
    () => localDays.filter((d) => d.weekNumber === activeWeekNumber),
    [localDays, activeWeekNumber]
  );
  const weekFocus = weekDetails.find((w) => w.number === activeWeekNumber)?.focus ?? "";
  const weekLoad = useMemo(
    () => ({
      totalTasks: days.reduce((s, d) => s + d.tasks.length, 0),
      confirmedDays: days.filter((d) => d.status === "CONFIRMED").length,
      openDays: days.filter((d) => d.status === "PENDING").length,
      lapsedDays: days.filter((d) => d.status === "MISSED" || d.status === "RECOVERED").length,
    }),
    [days]
  );

  const selectedDay = days.find((d) => d.dateKey === selectedDateKey) ?? days.find((d) => d.dateKey === todayDateKey) ?? days[0];

  function setTaskDone(taskId: number, done: boolean) {
    setOptimisticTask({ taskId, done });
  }

  function goToWeek(weekNumber: number) {
    if (weekNumber < 1 || weekNumber > totalWeeks) return;
    setActiveWeekNumber(weekNumber);
    const firstDay = localDays.find((d) => d.weekNumber === weekNumber);
    setSelectedDateKey(weekNumber === currentWeekNumber ? todayDateKey : firstDay?.dateKey ?? todayDateKey);
  }

  const isLate = selectedDay.isPast && selectedDay.status !== "CONFIRMED" && selectedDay.tasks.length > 0;
  const nextDate = addDays(fromDateKey(selectedDay.dateKey), 1);
  const pushTargetDateKey = toDateKey(nextDate);
  const pushTargetLabel = formatMonthDay(nextDate);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-px" style={{ background: "var(--border)", borderTop: "1px solid var(--border)" }}>
      <div className="min-w-0 bg-[var(--panel)] px-4 sm:px-10 py-7 flex flex-col gap-4.5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              type="button"
              aria-label="Previous week"
              disabled={activeWeekNumber <= 1}
              onClick={() => goToWeek(activeWeekNumber - 1)}
              className="flex h-7 w-7 items-center justify-center font-mono text-[13px] cursor-pointer transition-colors hover:brightness-110 disabled:opacity-30 disabled:cursor-default"
              style={{ border: "1px solid var(--border-strong)", color: "var(--text-dim)" }}
            >
              ‹
            </button>
            <div className="flex items-baseline gap-3">
              <div className="font-serif text-[20px]">Week {String(activeWeekNumber).padStart(2, "0")}</div>
              <div className="font-mono text-[11px] tracking-[0.12em]" style={{ color: "var(--muted-2)" }}>
                {weekFocus}
              </div>
            </div>
            <button
              type="button"
              aria-label="Next week"
              disabled={activeWeekNumber >= totalWeeks}
              onClick={() => goToWeek(activeWeekNumber + 1)}
              className="flex h-7 w-7 items-center justify-center font-mono text-[13px] cursor-pointer transition-colors hover:brightness-110 disabled:opacity-30 disabled:cursor-default"
              style={{ border: "1px solid var(--border-strong)", color: "var(--text-dim)" }}
            >
              ›
            </button>
            {activeWeekNumber !== currentWeekNumber && (
              <button
                type="button"
                onClick={() => goToWeek(currentWeekNumber)}
                className="font-mono text-[10px] tracking-[0.12em] px-2.5 py-1 cursor-pointer transition-colors hover:brightness-110"
                style={{ color: "var(--amber)", border: "1px solid rgba(245,165,36,.4)" }}
              >
                BACK TO CURRENT
              </button>
            )}
          </div>
          <div className="flex gap-4 font-mono text-[10px] tracking-[0.1em] flex-wrap" style={{ color: "var(--muted-2)" }}>
            {coverage.map((c) => (
              <span key={c.category} className="flex items-center gap-1.5">
                <i className="w-[7px] h-[7px] block" style={{ background: c.color }} />
                {c.label}
              </span>
            ))}
          </div>
        </div>

        <WeekGrid days={days} selectedDateKey={selectedDay.dateKey} onSelect={setSelectedDateKey} />

        <div className="flex gap-6 flex-wrap pt-1.5 font-mono text-[11px]" style={{ borderTop: "1px solid #1a1e2a", color: "var(--muted-2)" }}>
          <span>
            WEEK LOAD <span style={{ color: "var(--text-dim)" }}>{weekLoad.totalTasks} TASKS</span>
          </span>
          <span>
            CONFIRMED <span style={{ color: "var(--green)" }}>{weekLoad.confirmedDays}</span>
          </span>
          <span>
            OPEN <span style={{ color: "var(--amber)" }}>{weekLoad.openDays}</span>
          </span>
          <span>
            LAPSED <span style={{ color: "var(--red)" }}>{weekLoad.lapsedDays}</span>
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mt-3.5">
          <CoverageBars coverage={coverage} weekLabel={`WEEKS 1–${currentWeekNumber}`} />
          <RecentLog entries={recentLog} />
        </div>
      </div>

      {/* On narrow screens this stacks below the content above (single grid
          column); at lg+ it becomes the right-hand side rail. */}
      <CheckInPanel roadmapId={roadmapId} day={selectedDay} isLate={isLate} pushTargetDateKey={pushTargetDateKey} pushTargetLabel={pushTargetLabel} onTaskChange={setTaskDone} />
    </div>
  );
}
