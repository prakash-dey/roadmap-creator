"use client";

import { useState } from "react";
import type { CoverageVM, DayVM, RecentLogEntryVM } from "@/lib/data";
import { addDays, formatMonthDay, fromDateKey, toDateKey } from "@/lib/dates";
import { WeekGrid } from "@/components/WeekGrid";
import { CheckInPanel } from "@/components/CheckInPanel";
import { CoverageBars } from "@/components/CoverageBars";
import { RecentLog } from "@/components/RecentLog";

export function DashboardWeekSection({
  days,
  todayDateKey,
  weekNumber,
  weekFocus,
  coverage,
  recentLog,
  weekLoad,
}: {
  days: DayVM[];
  todayDateKey: string;
  weekNumber: number;
  weekFocus: string;
  coverage: CoverageVM[];
  recentLog: RecentLogEntryVM[];
  weekLoad: { totalTasks: number; confirmedDays: number; openDays: number; lapsedDays: number };
}) {
  const [selectedDateKey, setSelectedDateKey] = useState(todayDateKey);

  const selectedDay = days.find((d) => d.dateKey === selectedDateKey) ?? days.find((d) => d.dateKey === todayDateKey) ?? days[0];

  const isLate = selectedDay.isPast && selectedDay.status !== "CONFIRMED" && selectedDay.tasks.length > 0;
  const nextDate = addDays(fromDateKey(selectedDay.dateKey), 1);
  const pushTargetDateKey = toDateKey(nextDate);
  const pushTargetLabel = formatMonthDay(nextDate);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-px" style={{ background: "var(--border)", borderTop: "1px solid var(--border)" }}>
      <div className="bg-[var(--panel)] px-6 sm:px-10 py-7 flex flex-col gap-4.5">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <div className="flex items-baseline gap-3">
            <div className="font-serif text-[20px]">Week {String(weekNumber).padStart(2, "0")}</div>
            <div className="font-mono text-[11px] tracking-[0.12em]" style={{ color: "var(--muted-2)" }}>
              {weekFocus}
            </div>
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
          <CoverageBars coverage={coverage} weekLabel={`WEEKS 1–${weekNumber}`} />
          <RecentLog entries={recentLog} />
        </div>
      </div>

      {/* On narrow screens this stacks below the content above (single grid
          column); at lg+ it becomes the right-hand side rail. */}
      <CheckInPanel day={selectedDay} isLate={isLate} pushTargetDateKey={pushTargetDateKey} pushTargetLabel={pushTargetLabel} />
    </div>
  );
}
