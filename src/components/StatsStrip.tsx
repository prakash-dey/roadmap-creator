function Stat({ label, value, suffix, valueColor, suffixColor }: { label: string; value: string; suffix?: string; valueColor?: string; suffixColor?: string }) {
  return (
    <div className="bg-[var(--panel)] px-5 py-4 flex flex-col gap-1.5">
      <div className="font-mono text-[10px] tracking-[0.16em]" style={{ color: "var(--muted-2)" }}>
        {label}
      </div>
      <div className="font-mono text-[26px] font-medium" style={{ color: valueColor ?? "var(--text)" }}>
        {value}
        {suffix && (
          <span className="text-[16px]" style={{ color: suffixColor ?? "var(--muted-3)" }}>
            {suffix}
          </span>
        )}
      </div>
    </div>
  );
}

export function StatsStrip({
  daysComplete,
  totalDays,
  streak,
  paceDays,
  mocksDone,
  mocksTotal,
  tasksDone,
  tasksTotal,
}: {
  daysComplete: number;
  totalDays: number;
  streak: number;
  paceDays: number;
  mocksDone: number;
  mocksTotal: number;
  tasksDone: number;
  tasksTotal: number;
}) {
  const paceLabel = paceDays > 0 ? `+${paceDays}` : String(paceDays);
  const paceColor = paceDays < 0 ? "var(--red)" : paceDays > 0 ? "var(--green)" : "var(--text)";
  const hasMocks = mocksTotal > 0;
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-px mt-6" style={{ background: "var(--border)", border: "1px solid var(--border)" }}>
      <Stat label="DAYS COMPLETE" value={String(daysComplete)} suffix={`/${totalDays}`} />
      <Stat label="CURRENT STREAK" value={String(streak)} suffix=" d" />
      <Stat label="PACE" value={paceLabel} suffix=" d" valueColor={paceColor} suffixColor={paceDays < 0 ? "#7c3a37" : undefined} />
      {hasMocks ? (
        <Stat label="MOCKS LOGGED" value={String(mocksDone)} suffix={`/${mocksTotal}`} />
      ) : (
        <Stat label="TASKS DONE" value={String(tasksDone)} suffix={`/${tasksTotal}`} />
      )}
    </div>
  );
}
