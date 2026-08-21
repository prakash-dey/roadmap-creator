import type { CoverageVM } from "@/lib/data";

export function CoverageBars({ coverage, weekLabel }: { coverage: CoverageVM[]; weekLabel: string }) {
  const thinnest = [...coverage].filter((c) => c.total > 0).sort((a, b) => a.done / a.total - b.done / b.total)[0];
  return (
    <div className="flex flex-col gap-3">
      <div className="font-mono text-[10px] tracking-[0.16em]" style={{ color: "var(--muted-2)" }}>
        COVERAGE · {weekLabel}
      </div>
      <div className="flex flex-col gap-2.5">
        {coverage.map((c) => {
          const pct = c.total > 0 ? Math.max(0, Math.min(100, Math.round((c.done / c.total) * 100))) : 0;
          return (
            <div key={c.category} className="flex items-center gap-3">
              <span className="font-mono text-[10px] tracking-[0.12em] w-[52px]" style={{ color: "var(--muted)" }}>
                {c.label}
              </span>
              <span
                className="flex-1 h-1.5 block"
                role="progressbar"
                aria-label={`${c.label} coverage`}
                aria-valuemin={0}
                aria-valuemax={c.total}
                aria-valuenow={c.done}
                style={{ background: "#1c202c" }}
              >
                <span className="h-1.5 block" style={{ width: `${pct}%`, background: c.color }} />
              </span>
              <span className="font-mono text-[11px] w-[46px] text-right" style={{ color: "var(--text-dim)" }}>
                {c.done}/{c.total}
              </span>
            </div>
          );
        })}
      </div>
      {thinnest && (
        <div className="text-[12px] leading-relaxed mt-0.5" style={{ color: "var(--muted-2)" }}>
          {thinnest.label} is the thinnest column of the block so far — weight your next few days toward it.
        </div>
      )}
    </div>
  );
}
