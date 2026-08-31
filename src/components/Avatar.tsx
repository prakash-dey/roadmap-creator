"use client";

/**
 * Deterministic, dependency-free avatar. A mirrored 5-column identicon plus the
 * user's initials, both seeded from a stable hash of name + email so the same
 * person always renders the same mark.
 */

const PALETTE = [
  "var(--cat-dsa)",
  "var(--cat-lld)",
  "var(--cat-hld)",
  "var(--cat-mock)",
  "var(--amber)",
  "var(--green)",
  "var(--blue)",
];

function hash(seed: string): number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function initialsFor(name: string, email: string): string {
  const source = name.trim() || email.trim();
  if (!source) return "?";
  const parts = source.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return source.slice(0, 2).toUpperCase();
}

export function Avatar({
  name,
  email,
  size = 36,
  showInitials = true,
}: {
  name: string;
  email: string;
  size?: number;
  showInitials?: boolean;
}) {
  const seed = `${name.trim().toLowerCase()}|${email.trim().toLowerCase()}`;
  const h = hash(seed);
  const color = PALETTE[h % PALETTE.length];

  // 5x5 grid, left 3 columns generated then mirrored onto the right 2.
  const cells: boolean[] = [];
  for (let i = 0; i < 15; i++) cells.push(((h >> i) & 1) === 1);

  const rects: React.ReactNode[] = [];
  for (let row = 0; row < 5; row++) {
    for (let col = 0; col < 3; col++) {
      if (!cells[row * 3 + col]) continue;
      const cols = col === 2 ? [2] : [col, 4 - col];
      for (const c of cols) {
        rects.push(<rect key={`${row}-${c}`} x={c} y={row} width={1} height={1} />);
      }
    }
  }

  return (
    <span
      className="relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full"
      style={{
        width: size,
        height: size,
        background: "var(--panel-alt)",
        border: "1px solid var(--border-strong)",
      }}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 5 5"
        width={size}
        height={size}
        style={{ display: "block", opacity: showInitials ? 0.22 : 0.9, color }}
        fill="currentColor"
        shapeRendering="crispEdges"
      >
        {rects}
      </svg>
      {showInitials && (
        <span
          className="absolute inset-0 flex items-center justify-center font-mono font-bold"
          style={{ color, fontSize: Math.round(size * 0.34) }}
        >
          {initialsFor(name, email)}
        </span>
      )}
    </span>
  );
}
