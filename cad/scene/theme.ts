/**
 * Colour palette for the technical-drawing look. Pure data — usable by any
 * render backend and by tools composing overlay primitives.
 */
export const THEME = {
  background: "#0b0f14",
  gridMinor: "rgba(148, 163, 184, 0.08)",
  gridMajor: "rgba(148, 163, 184, 0.16)",
  axisX: "rgba(248, 113, 113, 0.55)",
  axisY: "rgba(74, 222, 128, 0.55)",
  /** The UCS icon's arms: the axis colours, solid, so it reads over the grid. */
  ucsIconX: "#f87171",
  ucsIconY: "#4ade80",
  entity: "#e2e8f0",
  entityHover: "#cbd5e1",
  selected: "#f59e0b",
  /** Cold selection grip (unselected handle) — AutoCAD's blue square. */
  grip: "#3b82f6",
  /** Hot grip currently being dragged — AutoCAD's red square. */
  gripHot: "#ef4444",
  snap: "#22d3ee",
  /** OSNAP tooltip (the little name that appears beside the marker). */
  snapTooltipBg: "rgba(15, 23, 42, 0.9)",
  snapTooltipBorder: "rgba(34, 211, 238, 0.35)",
  snapTooltipText: "#e2e8f0",
  /** Full-screen magnetic crosshair drawn in place of the OS cursor. */
  crosshair: "rgba(148, 163, 184, 0.45)",
  tracking: "rgba(167, 139, 250, 0.9)",
  trackingSolid: "#a78bfa",
  /** Polar tracking vector + tooltip border (AutoCAD's POLAR), a green hue. */
  polar: "rgba(74, 222, 128, 0.9)",
  polarTooltipBorder: "rgba(74, 222, 128, 0.35)",
  /**
   * The rubber-band line drawn from the last point to the cursor while a draw
   * command is active. AutoCAD renders this in the object/layer colour as a
   * solid line — it looks just like the segment about to be committed — so it
   * matches {@link THEME.entity} rather than a distinct highlight colour.
   */
  rubberBand: "#e2e8f0",
  preview: "#38bdf8",
  selectionWindowFill: "rgba(64, 140, 255, 0.12)",
  selectionWindowStroke: "#3b82f6",
  selectionCrossingFill: "rgba(74, 222, 128, 0.12)",
  selectionCrossingStroke: "#4ade80",
} as const

/**
 * The face drawing text is set in: Arial, AutoCAD's Standard style, or one
 * with its advance widths — the widths `measureTextWidth` measures with.
 */
export const DRAWING_FONT =
  'Arial, "Liberation Sans", Arimo, Helvetica, sans-serif'
