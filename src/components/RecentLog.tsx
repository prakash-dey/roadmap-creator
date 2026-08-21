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
          <div key={e.dateKey} className="flex items-center gap-3 bg-[var(--panel)] px-0.5 py-2.5">
            <span className="font-mono text-[11px] w-[56px]" style={{ color: "var(--faint)" }}>
              {e.dateLabel}
            </span>
            <span className="text-[12px] flex-1" style={{ color: "var(--text-dim)" }}>
              {e.summary}
            </span>
            <span className="font-mono text-[10px] tracking-[0.1em]" style={{ color: STATUS_COLOR[e.status] }}>
              {STATUS_LABEL[e.status]}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
