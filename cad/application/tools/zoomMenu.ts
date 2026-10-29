/** A member of the navigation bar's Zoom drop-down. */
export type ZoomOption = "extents" | "window" | "previous" | "in" | "out"

/**
 * The Zoom drop-down's members that exist here, in the ribbon's order
 * (Extents, Window, Previous, …, In, Out); Realtime, All, Dynamic, Scale,
 * Center and Object are not offered. Each runs as `zoom(option)`.
 */
export const ZOOM_MENU: readonly ZoomOption[] = [
  "extents",
  "window",
  "previous",
  "in",
  "out",
]

/** What each member's acad.cuix macro answers ZOOM's first prompt (`'_zoom 2x`). */
export const ZOOM_ANSWERS: Readonly<Record<ZoomOption, string>> = {
  extents: "_e",
  window: "_w",
  previous: "_p",
  in: "2x",
  out: ".5x",
}
