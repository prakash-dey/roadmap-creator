"use client";

import { useEffect, useState } from "react";

function msUntilMidnight(now: Date) {
  const midnight = new Date(now);
  midnight.setHours(24, 0, 0, 0);
  return midnight.getTime() - now.getTime();
}

function formatDuration(ms: number) {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return [hours, minutes, seconds].map((n) => String(n).padStart(2, "0")).join(":");
}

export function CountdownTimer() {
  const [remainingMs, setRemainingMs] = useState<number | null>(null);

  useEffect(() => {
    function tick() {
      setRemainingMs(msUntilMidnight(new Date()));
    }
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="flex flex-col items-center gap-1 shrink-0">
      <div className="font-mono text-[10px] tracking-[0.18em]" style={{ color: "var(--muted-2)" }}>
        TIME LEFT TODAY
      </div>
      <div
        className="font-mono font-bold text-[32px] leading-none tracking-[0.03em] tabular-nums"
        style={{ color: "var(--amber)" }}
      >
        {remainingMs === null ? "--:--:--" : formatDuration(remainingMs)}
      </div>
    </div>
  );
}
