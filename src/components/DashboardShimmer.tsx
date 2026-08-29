// Mirrors the dashboard's layout shape (top bar, trail, week section) so the
// swap-in feels continuous rather than a generic spinner. Rendered as a fixed
// overlay while a roadmap switch is in flight — see RouteTransitionProvider.
export function DashboardShimmer() {
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" style={{ background: "var(--bg)" }}>
      {/* top bar */}
      <div
        className="flex flex-col gap-3 py-5 px-6 sm:grid sm:grid-cols-[1fr_auto_1fr] sm:items-center sm:gap-4 sm:px-10"
        style={{ borderBottom: "1px solid var(--border)" }}
      >
        <div className="flex items-center gap-3.5">
          <div className="skeleton h-9 w-9 shrink-0" style={{ border: "1px solid var(--border-strong)" }} />
          <div className="flex items-baseline gap-3.5">
            <div className="skeleton h-[26px] w-[150px]" />
            <div className="skeleton h-[11px] w-[110px]" />
          </div>
        </div>

        <div className="order-first sm:order-0 flex flex-col items-center gap-1.5">
          <div className="skeleton h-[10px] w-[90px]" />
          <div className="skeleton h-[32px] w-[130px]" />
        </div>

        <div className="flex items-center justify-start gap-3 sm:justify-end sm:gap-7">
          <div className="skeleton h-[12px] w-[110px]" />
          <div className="skeleton h-[27px] w-[90px]" />
        </div>
      </div>

      {/* hero trail */}
      <div className="px-6 sm:px-10 pt-4 pb-5 flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <div className="skeleton h-[11px] w-[90px]" />
          <div className="skeleton h-[19px] w-[280px]" />
        </div>

        <div className="skeleton h-[110px] w-full" />

        <div className="flex gap-3 flex-wrap">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="skeleton h-[52px] flex-1 min-w-[100px]" />
          ))}
        </div>
      </div>

      {/* week section */}
      <div
        className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-px"
        style={{ background: "var(--border)", borderTop: "1px solid var(--border)" }}
      >
        <div className="min-w-0 bg-[var(--panel)] px-4 sm:px-10 py-7 flex flex-col gap-4.5">
          <div className="flex items-center gap-3">
            <div className="skeleton h-7 w-7" style={{ border: "1px solid var(--border-strong)" }} />
            <div className="skeleton h-5 w-[100px]" />
            <div className="skeleton h-[11px] w-[150px]" />
            <div className="skeleton h-7 w-7" style={{ border: "1px solid var(--border-strong)" }} />
          </div>

          <div className="grid grid-cols-2 min-[480px]:grid-cols-4 md:grid-cols-7 gap-2.5">
            {Array.from({ length: 7 }).map((_, i) => (
              <div key={i} className="skeleton min-h-[132px] sm:min-h-[150px]" style={{ border: "1px solid var(--border-strong)" }} />
            ))}
          </div>

          <div className="skeleton h-[14px] w-full max-w-[420px]" />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mt-3.5">
            <div className="skeleton h-[140px] w-full" />
            <div className="skeleton h-[140px] w-full" />
          </div>
        </div>

        <div className="min-w-0 flex flex-col gap-5 bg-[var(--panel-alt)] p-4 sm:p-6">
          <div className="flex flex-col gap-2">
            <div className="skeleton h-[10px] w-[100px]" />
            <div className="skeleton h-[22px] w-[220px]" />
            <div className="skeleton h-[11px] w-[160px]" />
          </div>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="skeleton h-[64px] w-full" style={{ border: "1px solid var(--border-strong)" }} />
          ))}
          <div className="skeleton h-[52px] w-full mt-auto" />
        </div>
      </div>
    </div>
  );
}
