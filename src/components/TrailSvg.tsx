"use client";

import { useEffect } from "react";
import type { CheckpointVM } from "@/lib/data";

const DESKTOP_PATH =
  "M60,170 Q109,170 158,138 T256,116 T354,124 T452,158 T550,188 T648,192 T746,166 T844,130 T942,108 T1040,116 T1138,148";
const MOBILE_PATH =
  "M58,24 Q58,46 71,68 T76,112 T70,156 T57,200 T44,244 T40,288 T47,332 T60,376 T72,420 T76,464 T69,508";

function checkpointShape(kind: CheckpointVM["kind"], number: number, radius: number, labelDy: number) {
  const label = String(number).padStart(2, "0");
  const textStyle = { fontFamily: "var(--font-mono)", fontSize: 11 } as const;

  if (kind === "finish") {
    const r = radius + 3;
    return (
      <>
        <rect x={-r} y={-r} width={r * 2} height={r * 2} fill="#12141C" stroke="#5B9DFF" strokeWidth={3} />
        <text x={0} y={labelDy} textAnchor="middle" fill="#5B9DFF" style={{ ...textStyle, letterSpacing: "0.02em" }}>
          {label}
        </text>
      </>
    );
  }
  if (kind === "current") {
    return (
      <>
        <circle cx={0} cy={0} r={radius + 4} fill="#12141C" stroke="#F5A524" strokeWidth={3} />
        <circle cx={0} cy={0} r={6} fill="#F5A524" />
        <text x={0} y={labelDy} textAnchor="middle" fill="#F5A524" style={{ ...textStyle, letterSpacing: "0.06em" }}>
          {label}
        </text>
      </>
    );
  }
  if (kind === "passed") {
    return (
      <>
        <circle cx={0} cy={0} r={radius} fill="#4ADE80" />
        <text x={0} y={labelDy} textAnchor="middle" fill="#5C6274" style={textStyle}>
          {label}
        </text>
      </>
    );
  }
  return (
    <>
      <circle cx={0} cy={0} r={radius - 3} fill="#12141C" stroke="#39405480" strokeWidth={3} />
      <text x={0} y={labelDy} textAnchor="middle" fill="#454B5C" style={textStyle}>
        {label}
      </text>
    </>
  );
}

/**
 * Positions checkpoints and the YOU/TODAY markers along the SVG path,
 * imperatively (getPointAtLength), since the number of checkpoints is
 * driven by the roadmap's week count rather than fixed geometry.
 */
function useTrailPlacement(opts: {
  pathId: string;
  travelId: string;
  gapIds: string[];
  youId: string;
  todayId: string;
  checkpointPrefix: string;
  checkpointCount: number;
  progress: number;
  today: number;
}) {
  const { pathId, travelId, gapIds, youId, todayId, checkpointPrefix, checkpointCount, progress, today } = opts;
  useEffect(() => {
    const place = () => {
      const p = document.getElementById(pathId) as unknown as SVGPathElement | null;
      if (!p || !p.getTotalLength) return;
      const L = p.getTotalLength();
      const set = (id: string, fn: (el: HTMLElement) => void) => {
        const el = document.getElementById(id);
        if (el) fn(el);
      };
      set(travelId, (e) => e.setAttribute("stroke-dasharray", `${L * progress} ${L}`));
      gapIds.forEach((id) =>
        set(id, (e) => {
          const gapLen = Math.max(0, L * (today - progress));
          e.setAttribute("stroke-dasharray", `${gapLen} ${L}`);
          e.setAttribute("stroke-dashoffset", String(-L * progress));
        })
      );
      const a = p.getPointAtLength(L * progress);
      const b = p.getPointAtLength(L * today);
      set(youId, (e) => e.setAttribute("transform", `translate(${a.x},${a.y})`));
      set(todayId, (e) => e.setAttribute("transform", `translate(${b.x},${b.y})`));

      for (let i = 0; i < checkpointCount; i++) {
        const t = checkpointCount === 1 ? 0 : i / (checkpointCount - 1);
        const pt = p.getPointAtLength(L * t);
        set(`${checkpointPrefix}${i}`, (e) => e.setAttribute("transform", `translate(${pt.x},${pt.y})`));
      }
    };
    place();
    window.addEventListener("resize", place);
    return () => window.removeEventListener("resize", place);
  }, [pathId, travelId, gapIds, youId, todayId, checkpointPrefix, checkpointCount, progress, today]);
}

export function DesktopTrail({
  checkpoints,
  progress,
  today,
  selectedWeek,
  onSelectWeek,
}: {
  checkpoints: CheckpointVM[];
  progress: number;
  today: number;
  selectedWeek?: number;
  onSelectWeek?: (weekNumber: number, trigger: SVGGElement) => void;
}) {
  useTrailPlacement({
    pathId: "asc-path",
    travelId: "asc-travel",
    gapIds: ["asc-gap", "asc-gaphatch"],
    youId: "asc-you",
    todayId: "asc-today",
    checkpointPrefix: "asc-cp-",
    checkpointCount: checkpoints.length,
    progress,
    today,
  });

  return (
    <svg viewBox="0 0 1200 250" width="100%" role="group" aria-label="Interactive roadmap checkpoints" style={{ display: "block", overflow: "visible" }}>
      <defs>
        <pattern id="asc-hatch" width={7} height={7} patternTransform="rotate(45)" patternUnits="userSpaceOnUse">
          <line x1={0} y1={0} x2={0} y2={7} stroke="#12141C" strokeWidth={3} opacity={0.45} />
        </pattern>
      </defs>
      <path id="asc-path" d={DESKTOP_PATH} fill="none" stroke="#2C3245" strokeWidth={14} strokeLinecap="round" />
      <path d={DESKTOP_PATH} fill="none" stroke="#171B26" strokeWidth={6} strokeLinecap="round" strokeDasharray="2 12" />
      <path id="asc-gap" d={DESKTOP_PATH} fill="none" stroke="#F0554E" strokeWidth={14} strokeLinecap="butt" opacity={0.85} />
      <path id="asc-gaphatch" d={DESKTOP_PATH} fill="none" stroke="url(#asc-hatch)" strokeWidth={14} strokeLinecap="butt" />
      <path id="asc-travel" d={DESKTOP_PATH} fill="none" stroke="#F5A524" strokeWidth={14} strokeLinecap="round" />

      {checkpoints.map((cp, i) => (
        <g
          key={i}
          id={`asc-cp-${i}`}
          role="button"
          tabIndex={0}
          aria-label={`Open week ${cp.number} tasks`}
          aria-pressed={selectedWeek === cp.number}
          className="trail-checkpoint cursor-pointer outline-none"
          onClick={(event) => {
            event.currentTarget.focus();
            onSelectWeek?.(cp.number, event.currentTarget);
          }}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              onSelectWeek?.(cp.number, event.currentTarget);
            }
          }}
        >
          <circle className="trail-focus-ring" r={24} fill="transparent" stroke={selectedWeek === cp.number ? "#F5A524" : "transparent"} strokeWidth={2} />
          {checkpointShape(cp.kind, cp.number, 13, 35)}
        </g>
      ))}

      <g id="asc-you" pointerEvents="none">
        <line x1={0} y1={0} x2={0} y2={-30} stroke="#F5A524" strokeWidth={1.5} />
        <circle cx={0} cy={0} r={8} fill="#12141C" stroke="#F5A524" strokeWidth={3} />
        <text x={0} y={-38} textAnchor="middle" fill="#F5A524" style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: 1.2 }}>
          YOU
        </text>
      </g>
      <g id="asc-today" pointerEvents="none">
        <line x1={0} y1={0} x2={0} y2={66} stroke="#F0554E" strokeWidth={1.5} strokeDasharray="3 4" />
        <path d="M-7,-11 L7,-11 L0,0 Z" fill="#F0554E" />
        <rect x={-38} y={66} width={76} height={24} fill="none" stroke="#F0554E" />
        <text x={0} y={83} textAnchor="middle" fill="#F0554E" style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: 1.2 }}>
          TODAY
        </text>
      </g>
    </svg>
  );
}

function mobileCheckpointShape(kind: CheckpointVM["kind"]) {
  if (kind === "finish") {
    return <rect x={-9} y={-9} width={18} height={18} fill="#12141C" stroke="#5B9DFF" strokeWidth={3} />;
  }
  if (kind === "current") {
    return (
      <>
        <circle cx={0} cy={0} r={14} fill="#12141C" stroke="#F5A524" strokeWidth={3} />
        <circle cx={0} cy={0} r={5} fill="#F5A524" />
      </>
    );
  }
  if (kind === "passed") {
    return <circle cx={0} cy={0} r={10} fill="#4ADE80" />;
  }
  return <circle cx={0} cy={0} r={8} fill="#12141C" stroke="#394054" strokeWidth={3} />;
}

export function MobileTrail({
  checkpoints,
  progress,
  today,
  selectedWeek,
  onSelectWeek,
}: {
  checkpoints: CheckpointVM[];
  progress: number;
  today: number;
  selectedWeek?: number;
  onSelectWeek?: (weekNumber: number, trigger: SVGGElement) => void;
}) {
  useTrailPlacement({
    pathId: "asc-mpath",
    travelId: "asc-mtravel",
    gapIds: ["asc-mgap"],
    youId: "asc-myou",
    todayId: "asc-mtoday",
    checkpointPrefix: "asc-mcp-",
    checkpointCount: checkpoints.length,
    progress,
    today,
  });

  return (
    <svg
      viewBox="0 0 160 540"
      role="group"
      aria-label="Interactive roadmap checkpoints showing progress and today's expected position"
      className="h-auto w-full max-w-[160px]"
      style={{ display: "block", flex: "none", overflow: "visible" }}
    >
      <path id="asc-mpath" d={MOBILE_PATH} fill="none" stroke="#2C3245" strokeWidth={11} strokeLinecap="round" />
      <path id="asc-mgap" d={MOBILE_PATH} fill="none" stroke="#F0554E" strokeWidth={11} opacity={0.85} />
      <path id="asc-mtravel" d={MOBILE_PATH} fill="none" stroke="#F5A524" strokeWidth={11} strokeLinecap="round" />

      {checkpoints.map((cp, i) => (
        <g
          key={i}
          id={`asc-mcp-${i}`}
          role="button"
          tabIndex={0}
          aria-label={`Open week ${cp.number} tasks`}
          aria-pressed={selectedWeek === cp.number}
          className="trail-checkpoint cursor-pointer outline-none"
          onClick={(event) => {
            event.currentTarget.focus();
            onSelectWeek?.(cp.number, event.currentTarget);
          }}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              onSelectWeek?.(cp.number, event.currentTarget);
            }
          }}
        >
          <circle className="trail-focus-ring" r={22} fill="transparent" stroke={selectedWeek === cp.number ? "#F5A524" : "transparent"} strokeWidth={2} />
          {mobileCheckpointShape(cp.kind)}
        </g>
      ))}

      <g id="asc-myou" pointerEvents="none">
        <line x1={0} y1={0} x2={46} y2={0} stroke="#F5A524" strokeWidth={1} />
        <text x={52} y={4} fill="#F5A524" style={{ fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: "0.1em" }}>
          HERE
        </text>
      </g>
      <g id="asc-mtoday" pointerEvents="none">
        <line x1={0} y1={0} x2={46} y2={0} stroke="#F0554E" strokeWidth={1} strokeDasharray="3 3" />
        <text x={52} y={4} fill="#F0554E" style={{ fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: "0.1em" }}>
          TODAY
        </text>
      </g>
    </svg>
  );
}
