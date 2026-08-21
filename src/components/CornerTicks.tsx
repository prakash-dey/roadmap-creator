export function CornerTicks({ color = "#3a4256", inset = -6 }: { color?: string; inset?: number }) {
  const style = { color, font: "400 12px/1 monospace" as const };
  return (
    <>
      <i className="pointer-events-none absolute" style={{ ...style, top: inset, left: inset }}>
        +
      </i>
      <i className="pointer-events-none absolute" style={{ ...style, top: inset, right: inset }}>
        +
      </i>
      <i className="pointer-events-none absolute" style={{ ...style, bottom: inset, left: inset }}>
        +
      </i>
      <i className="pointer-events-none absolute" style={{ ...style, bottom: inset, right: inset }}>
        +
      </i>
    </>
  );
}
