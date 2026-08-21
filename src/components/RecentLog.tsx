import type { RecentLogEntryVM } from "@/lib/data";

const STATUS_LABEL: Record<RecentLogEntryVM["status"], string> = {
  CONFIRMED: "CONFIRMED",
  MISSED: "MISSED",
  RECOVERED: "RECOVERED",
  PENDING: "PENDING",
};
const STATUS_COLOR: Record<RecentLogEntryVM["status"], string> = {
  CONFIRMED: "var(--green)",
  MISSED: "var(--red)",
  RECOVERED: "var(--amber)",
  PENDING: "var(--muted)",
};

export function RecentLog({ entries }: { entries: RecentLogEntryVM[] }) {
  return (
    <div className="flex flex-col gap-3">
      <div className="font-mono text-[10px] tracking-[0.16em]" style={{ color: "var(--muted-2)" }}>
        RECENT LOG
      </div>
      <div className="flex flex-col gap-px" style={{ background: "#1a1e2a" }}>
        {entries.length === 0 && (
          <div className="bg-[var(--panel)] px-0.5 py-2.5 text-[12px]" style={{ color: "var(--muted)" }}>
            No days logged yet.
          </div>
        )}
        {entries.map((e) => (
          <div key={e.dateKey} className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1 bg-[var(--panel)] px-0.5 py-2.5 sm:flex-nowrap">
            <span className="font-mono text-[11px] w-[56px]" style={{ color: "var(--faint)" }}>
              {e.dateLabel}
            </span>
            <span className="min-w-0 flex-1 text-[12px]" style={{ color: "var(--text-dim)" }}>
              {e.summary}
            </span>
            <span className="ml-[68px] font-mono text-[10px] tracking-[0.1em] sm:ml-0" style={{ color: STATUS_COLOR[e.status] }}>
              {STATUS_LABEL[e.status]}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
