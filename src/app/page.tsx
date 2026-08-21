import Link from "next/link";
import { redirect } from "next/navigation";
import { getProgramView } from "@/lib/data";
import { requireUser } from "@/lib/auth/session";
import { TopBar } from "@/components/TopBar";
import { DesktopTrail, MobileTrail } from "@/components/TrailSvg";
import { StatsStrip } from "@/components/StatsStrip";
import { DashboardWeekSection } from "@/components/DashboardWeekSection";

export const dynamic = "force-dynamic";

export default async function Home({ searchParams }: { searchParams: Promise<{ roadmap?: string }> }) {
  const user = await requireUser();
  const { roadmap } = await searchParams;
  const requestedId = roadmap && /^\d+$/.test(roadmap) ? Number(roadmap) : undefined;
  const p = await getProgramView(user.id, requestedId);
  if (!p) redirect("/roadmap");

  const behindDays = p.paceDays < 0 ? -p.paceDays : 0;
  const aheadDays = p.paceDays > 0 ? p.paceDays : 0;
  const paceHeadline =
    p.paceDays < 0
      ? `You are ${behindDays} day${behindDays === 1 ? "" : "s"} short of where the calendar puts you.`
      : p.paceDays > 0
        ? `You are ${aheadDays} day${aheadDays === 1 ? "" : "s"} ahead of where the calendar puts you.`
        : "You are exactly on pace with the calendar.";

  return (
    <div className="min-h-screen" style={{ background: "var(--bg)" }}>
      <TopBar
        title={p.programTitle}
        subtitle={p.programSubtitle}
        startLabel={p.programStartLabel}
        endLabel={p.programEndLabel}
        weekNumber={p.currentWeekNumber}
        totalWeeks={p.totalWeeks}
      />

      <div className="flex justify-end px-6 sm:px-10 pt-4">
        <Link href="/roadmap" className="font-mono text-[11px] tracking-[0.1em]" style={{ color: "var(--muted-2)" }}>
          MANAGE ROADMAPS →
        </Link>
      </div>

      {/* hero trail */}
      <div className="px-6 sm:px-10 pt-4 pb-5">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-1">
          <div className="flex flex-col gap-1">
            <div className="font-mono text-[11px] tracking-[0.18em]" style={{ color: "var(--muted-2)" }}>
              THE TRAIL
            </div>
            <div className="font-serif text-[19px]" style={{ color: "var(--text-dim)" }}>
              {paceHeadline}
            </div>
          </div>
          <div className="flex items-center gap-3 sm:gap-5 font-mono text-[10px] tracking-[0.12em] flex-wrap" style={{ color: "var(--muted-2)" }}>
            {p.paceDays < 0 && (
              <div className="font-bold tracking-[0.14em] px-2.5 py-1" style={{ background: "var(--red)", color: "var(--panel)" }}>
                {behindDays} DAYS BEHIND
              </div>
            )}
            {p.paceDays > 0 && (
              <div className="font-bold tracking-[0.14em] px-2.5 py-1" style={{ background: "var(--green)", color: "var(--panel)" }}>
                {aheadDays} DAYS AHEAD
              </div>
            )}
            <div className="flex items-center gap-1.5">
              <span className="w-4 h-[3px] block" style={{ background: "var(--amber)" }} />
              TRAVELED
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-4 h-[3px] block" style={{ background: "var(--red)" }} />
              GAP
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-4 h-[3px] block" style={{ background: "#2C3245" }} />
              AHEAD
            </div>
          </div>
        </div>

        <div className="hidden md:block pb-12">
          <DesktopTrail checkpoints={p.checkpoints} progress={p.progressFraction} today={p.todayFraction} />
        </div>
        <div className="md:hidden flex justify-center py-4">
          <MobileTrail checkpoints={p.checkpoints} progress={p.progressFraction} today={p.todayFraction} />
        </div>

        <StatsStrip
          daysComplete={p.daysComplete}
          totalDays={p.totalDays}
          streak={p.streak}
          paceDays={p.paceDays}
          mocksDone={p.mocksDone}
          mocksTotal={p.mocksTotal}
          tasksDone={p.tasksDone}
          tasksTotal={p.tasksTotal}
        />
      </div>

      <DashboardWeekSection
        days={p.currentWeekDays}
        todayDateKey={p.today.dateKey}
        weekNumber={p.currentWeekNumber}
        weekFocus={p.weekFocus}
        coverage={p.coverage}
        recentLog={p.recentLog}
        weekLoad={p.weekLoad}
      />
    </div>
  );
}
