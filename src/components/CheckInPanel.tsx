"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import type { DayVM } from "@/lib/data";
import { confirmDay, markDayMissed, pushOpenTasksToDay, toggleTask } from "@/app/actions";
import { CornerTicks } from "@/components/CornerTicks";

const STATUS_META: Record<DayVM["status"], { label: string; color: string }> = {
  PENDING: { label: "TODAY", color: "var(--amber)" },
  CONFIRMED: { label: "CONFIRMED", color: "var(--green)" },
  MISSED: { label: "MISSED", color: "var(--red)" },
  RECOVERED: { label: "RECOVERED", color: "var(--amber)" },
};

export function CheckInPanel({
  day,
  isLate,
  pushTargetDateKey,
  pushTargetLabel,
}: {
  day: DayVM;
  isLate: boolean;
  pushTargetDateKey?: string;
  pushTargetLabel?: string;
}) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const doneCount = day.tasks.filter((t) => t.done).length;
  const total = day.tasks.length;
  const donePct = total > 0 ? Math.round((doneCount / total) * 100) : 0;
  const openTasks = day.tasks.filter((t) => !t.done);
  const readOnly = day.status === "CONFIRMED" && !isLate;

  function run(action: () => Promise<void>) {
    startTransition(async () => {
      await action();
      router.refresh();
    });
  }

  return (
    <div className="relative flex flex-col gap-5 bg-[var(--panel-alt)] p-6" style={isLate ? { border: "1px solid #3a2523" } : undefined}>
      {isLate && <CornerTicks color="var(--red)" />}

      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div className="font-mono text-[10px] tracking-[0.16em]" style={{ color: isLate ? "var(--red)" : "var(--amber)" }}>
            {isLate ? "LATE CHECK-IN" : "DAY CHECK-IN"}
          </div>
          {isLate ? (
            <div className="font-mono text-[10px] tracking-[0.12em] px-2 py-1" style={{ color: "var(--red)", border: "1px solid var(--red)" }}>
              MISSED
            </div>
          ) : (
            <div
              className="font-mono text-[10px] tracking-[0.12em] px-2 py-1"
              style={{ color: "var(--panel)", background: STATUS_META[day.status].color }}
            >
              {day.isToday ? "TODAY" : STATUS_META[day.status].label}
            </div>
          )}
        </div>
        <div className="font-serif text-[22px] leading-tight">{day.longDateLabel}</div>
        <div className="font-mono text-[11px]" style={{ color: "var(--muted-2)" }}>
          WEEK {String(day.weekNumber).padStart(2, "0")} · DAY {day.dayOfWeek}
          {day.estimateMin > 0 ? ` · EST ${formatMinutes(day.estimateMin)}` : ""}
        </div>
      </div>

      {isLate && (
        <div
          className="text-[12px] leading-relaxed px-3 py-2.5"
          style={{ borderLeft: "2px solid var(--red)", background: "#1a1417", color: "#B9927F" }}
        >
          Confirming late keeps the day on the trail but does not restore the streak. Partial credit counts toward pace.
        </div>
      )}

      {total === 0 ? (
        <div className="text-[13px]" style={{ color: "var(--muted)" }}>
          Review-only day — no tasks scheduled.
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {day.tasks.map((t) => (
            <div key={t.id} className="flex items-stretch" style={{ border: "1px solid var(--border-strong)", background: "var(--panel)" }}>
              <button
                disabled={readOnly}
                onClick={() => run(() => toggleTask(t.id))}
                className="flex-1 flex gap-3 p-3 items-start text-left transition-colors disabled:cursor-default min-w-0"
              >
                <div
                  className="w-4 h-4 shrink-0 mt-0.5 flex items-center justify-center font-mono text-[11px] font-bold"
                  style={{
                    border: `1.5px solid ${t.done ? "var(--green)" : "var(--border-strong)"}`,
                    background: t.done ? "var(--green)" : "transparent",
                    color: "var(--panel)",
                  }}
                >
                  {t.done ? "✓" : ""}
                </div>
                <div className="flex flex-col gap-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <i className="w-[7px] h-[7px] shrink-0 block" style={{ background: t.color }} />
                    <span className="font-mono text-[9px] tracking-[0.14em]" style={{ color: t.color }}>
                      {t.category}
                    </span>
                    {t.meta && (
                      <span className="font-mono text-[9px] tracking-[0.1em]" style={{ color: "var(--muted-3)" }}>
                        {t.meta}
                      </span>
                    )}
                  </div>
                  <div className="text-[13px] leading-snug" style={{ color: t.done ? "var(--muted)" : "var(--text-dim)" }}>
                    {t.name}
                  </div>
                </div>
              </button>
              {t.link && (
                <a
                  href={t.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Open link"
                  className="flex items-center justify-center px-3 shrink-0 font-mono text-[13px] transition-colors"
                  style={{ color: "var(--muted)", borderLeft: "1px solid var(--border-strong)" }}
                >
                  ↗
                </a>
              )}
            </div>
          ))}
        </div>
      )}

      {!readOnly && total > 0 && (
        <div className="mt-auto flex flex-col gap-2.5">
          <div className="flex justify-between font-mono text-[10px] tracking-[0.12em]" style={{ color: "var(--muted-2)" }}>
            <span>{isLate ? `CONFIRM ${doneCount} OF ${total}` : "CONFIRMED"}</span>
            <span style={{ color: "var(--text)" }}>
              {doneCount} / {total}
            </span>
          </div>
          <div className="h-[3px]" style={{ background: "var(--border-strong)" }}>
            <div className="h-[3px]" style={{ background: "var(--amber)", width: `${donePct}%` }} />
          </div>

          <div className="relative mt-1.5">
            <CornerTicks color="var(--amber)" inset={-5} />
            <button
              disabled={isPending}
              onClick={() => run(() => confirmDay(day.id))}
              className="w-full border-none font-mono text-[12px] font-bold tracking-[0.14em] py-3.5 cursor-pointer transition-colors hover:brightness-110 disabled:opacity-60"
              style={{ background: "var(--amber)", color: "var(--panel)" }}
            >
              {isLate ? `CONFIRM ${doneCount} OF ${total} · CLOSE DAY` : "CONFIRM DAY COMPLETE"}
            </button>
          </div>

          {!isLate && (
            <button
              disabled={isPending}
              onClick={() => run(() => markDayMissed(day.id))}
              className="w-full font-mono text-[11px] tracking-[0.12em] py-2.5 cursor-pointer bg-transparent transition-colors disabled:opacity-60"
              style={{ border: "1px solid var(--border-strong)", color: "var(--muted)" }}
            >
              MARK DAY AS MISSED
            </button>
          )}

          {isLate && openTasks.length > 0 && pushTargetDateKey && (
            <button
              disabled={isPending}
              onClick={() => run(() => pushOpenTasksToDay(day.id, pushTargetDateKey))}
              className="w-full font-mono text-[11px] tracking-[0.12em] py-2.5 cursor-pointer bg-transparent transition-colors disabled:opacity-60"
              style={{ border: "1px solid var(--border-strong)", color: "var(--muted)" }}
            >
              PUSH {openTasks.length} TASK{openTasks.length === 1 ? "" : "S"} TO {pushTargetLabel}
            </button>
          )}
        </div>
      )}

      {readOnly && (
        <div className="mt-auto font-mono text-[11px] tracking-[0.12em]" style={{ color: "var(--green)" }}>
          ✓ DAY CONFIRMED
        </div>
      )}
    </div>
  );
}

function formatMinutes(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  if (h === 0) return `${m}m`;
  return `${h}h ${String(m).padStart(2, "0")}m`;
}
