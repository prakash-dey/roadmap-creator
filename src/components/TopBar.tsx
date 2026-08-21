export function TopBar({
  title,
  subtitle,
  startLabel,
  endLabel,
  weekNumber,
  totalWeeks,
}: {
  title: string;
  subtitle: string;
  startLabel: string;
  endLabel: string;
  weekNumber: number;
  totalWeeks: number;
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-5 px-6 sm:px-10" style={{ borderBottom: "1px solid var(--border)" }}>
      <div className="flex items-baseline gap-3.5 flex-wrap">
        <div className="font-serif font-semibold text-[26px] tracking-tight">{title}</div>
        <div className="font-mono text-[11px] tracking-[0.14em]" style={{ color: "var(--muted-2)" }}>
          {subtitle}
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-3 sm:gap-7">
        <div className="whitespace-nowrap font-mono text-[11px] sm:text-[12px] tracking-[0.08em] sm:tracking-[0.1em]" style={{ color: "var(--muted)" }}>
          {startLabel} → {endLabel}
        </div>
        <div
          className="whitespace-nowrap font-mono text-[11px] sm:text-[12px] tracking-[0.1em] px-3 py-1.5"
          style={{ color: "var(--amber)", border: "1px solid rgba(245,165,36,.4)" }}
        >
          WEEK {String(weekNumber).padStart(2, "0")} / {totalWeeks}
        </div>
      </div>
    </div>
  );
}
