/**
 * The mark's geometry on a 24-unit grid: a lowercase "m" as one polyline with
 * two arc segments (a PLINE's bulges), ending on an endpoint marker. The logo
 * component and the generated icons both draw from this, so they cannot drift.
 */
export const MARK_PATH =
  "M3.5 19.5V11.5A3.75 3.75 0 0 1 11 11.5V19.5V11.5A3.75 3.75 0 0 1 18.5 11.5V19.5"
export const MARK_STROKE = 2.25

/**
 * The endpoint marker, centred on the polyline's last vertex (18.5, 19.5) and,
 * like the editor's, a hollow square the line runs into — drawn finer than the
 * letter so the letter still reads first.
 */
export const MARK_MARKER = { x: 15.5, y: 16.5, size: 6, stroke: 1.25 }

/** A square box tight around the mark, so an icon is all mark. */
export const MARK_VIEWBOX = "2.25 4.875 20 20"

/** Ink and marker colours, for the few places CSS variables cannot reach. */
export const BRAND = {
  sheet: "#0b0f14",
  ink: "#e2e8f0",
  inkOnLight: "#0b0f14",
  precision: "#22d3ee",
  precisionOnLight: "#0e7490",
} as const
