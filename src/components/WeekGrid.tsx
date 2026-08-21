import type { DayVM } from "@/lib/data";

function statusChip(day: DayVM) {
  if (day.isFuture) return { text: day.reviewOnly ? "REVIEW ONLY" : "UPCOMING", color: "var(--faint)" };
  if (day.isToday) return { text: `TODAY ${day.tasks.filter((t) => t.done).length}/${day.tasks.length}`, color: "var(--amber)" };
  if (day.status === "CONFIRMED") return { text: "DONE", color: "var(--green)", icon: "✓" };
  if (day.status === "RECOVERED") return { text: "RECOVERED", color: "var(--amber)" };
  return { text: "MISSED", color: "var(--red)", icon: "×" };
}

export function WeekGrid({
  days,
  selectedDateKey,
  onSelect,
}: {
  days: DayVM[];
  selectedDateKey: string;
  onSelect: (dateKey: string) => void;
}) {
  return (
    <div className="grid grid-cols-4 sm:grid-cols-7 gap-2.5">
      {days.map((day) => {
        const chip = statusChip(day);
        const isSelected = day.dateKey === selectedDateKey;
        const isLapsed = !day.isFuture && !day.isToday && day.status !== "CONFIRMED";
        const dim = day.isFuture;
        return (
          <button
            key={day.dateKey}
            type="button"
            onClick={() => onSelect(day.dateKey)}
            className="relative flex flex-col gap-3.5 p-3 pb-3 min-h-[150px] text-left transition-colors hover:brightness-110 cursor-pointer"
            style={{
              border: `1px solid ${isSelected ? "var(--amber)" : isLapsed ? "#3a2523" : "var(--border-strong)"}`,
              background: isSelected ? "#1b1a1a" : isLapsed ? "#171319" : "var(--panel)",
            }}
          >
            <div className="flex items-baseline justify-between">
              <span className="font-mono text-[10px] tracking-[0.14em]" style={{ color: isSelected ? "var(--amber)" : "var(--muted-2)" }}>
                {day.weekdayShort}
              </span>
              <span className="font-mono text-[16px]" style={{ color: dim ? "var(--muted-2)" : isSelected ? "#F5EEE1" : "var(--text-dim)" }}>
                {day.dayNumber}
              </span>
            </div>
            <div className="flex gap-1.5 flex-wrap">
              {day.tasks.map((t) => (
                <i key={t.id} className="w-2 h-2 block" style={{ background: t.color, opacity: dim ? 0.5 : 1 }} />
              ))}
            </div>
            <div
              className="mt-auto flex items-center gap-1.5 font-mono text-[10px] tracking-[0.1em] whitespace-nowrap"
              style={{ color: chip.color }}
            >
              {chip.icon && <span className="text-[12px]">{chip.icon}</span>}
              {chip.text}
            </div>
          </button>
        );
      })}
    </div>
  );
}
