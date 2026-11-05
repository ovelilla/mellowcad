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
  /**
   * The UCS icon, AutoCAD 2027's 3D one: White in model space, its arms and
   * letters alike (desktop ucs/d07-1, d01-2).
   */
  ucsIcon: "#ffffff",
  /**
   * The icon's arms and letters in Hidden and Conceptual, X red, Y green and
   * Z blue, each its lit side as AutoCAD 2027 draws them there (desktop
   * solid-inquiry/d03); 2D Wireframe draws {@link THEME.ucsIcon}.
   */
  ucsIconX: "#a94b4c",
  ucsIconY: "#65d264",
  ucsIconZ: "#609fff",
  entity: "#e2e8f0",
  entityHover: "#cbd5e1",
  /**
   * The selection's glow, laid over the object as AutoCAD's selection effect
   * does: blue at the edges, the object's colour paled beneath (desktop d15).
   */
  selected: "rgba(59, 130, 246, 0.45)",
  /** Cold selection grip (unselected handle) — AutoCAD's blue square. */
  grip: "#3b82f6",
  /** Hot grip currently being dragged — AutoCAD's red square. */
  gripHot: "#ef4444",
  /** A selected polar array's ring through its base point, grey (desktop arrays/d11-2). */
  arrayRing: "#8a8f96",
  /** TRIM's ✕ beside the cursor (desktop trim/d01-1z). */
  trimBadge: "#eb5555",
  /** The circle-and-slash beside the cursor where a pick is refused (desktop trim/d09-1). */
  refusedBadge: "#ffffff",
  /** The padlock beside the cursor over a locked layer's object (desktop properties/d01-1). */
  lockedBadge: "#ffffff",
  /** MATCHPROP's paintbrush beside the pick box (desktop properties/d07-1). */
  paintBadge: "#ffffff",
  /** The AutoSnap marker, AutoCAD's green as its dark theme draws it (desktop d05, d21). */
  snap: "#00a500",
  /** The cursor's tooltips (a snap's name, Polar's reading): AutoCAD's light grey box. */
  snapTooltipBg: "#999999",
  snapTooltipBorder: "#000000",
  snapTooltipText: "#000000",
  /** The crosshair drawn in place of the OS cursor, and the tracked point's ✕. */
  crosshair: "#e4e5e6",
  /** OTRACK's paths and acquired points, green as Polar's (desktop d13). */
  tracking: "#049606",
  trackingSolid: "#049606",
  /** Polar tracking's path (desktop d12). */
  polar: "#049606",
  /**
   * The rubber-band line drawn from the last point to the cursor while a draw
   * command is active. AutoCAD renders this in the object/layer colour as a
   * solid line — it looks just like the segment about to be committed — so it
   * matches {@link THEME.entity} rather than a distinct highlight colour.
   */
  rubberBand: "#e2e8f0",
  /**
   * AREA's corners: AutoCAD's translucent green, sampled (25,91,37) over
   * (33,40,48) (desktop inquiry/d03-1).
   */
  measureAreaFill: "rgba(0, 255, 0, 0.24)",
  /**
   * The dashed line PLINE draws from its last vertex at the width prompts and
   * along its arc's chord: amber beside a white polyline, so not the object's
   * colour (desktop pline/d03, d06).
   */
  dashedRubberBand: "#d7a320",
  /**
   * SPLINEDIT's Edit vertex: the control frame, dashed in a dim red, unlike
   * a selected CV spline's (desktop splinedit/d01-5).
   */
  splineEditFrame: "#7f493a",
  preview: "#38bdf8",
  selectionWindowFill: "rgba(64, 140, 255, 0.12)",
  /**
   * The window's outline, white over its blue as AutoCAD draws it, solid; the
   * crossing's dashed over its green, and a fence's (desktop erase/d02-1,
   * d03-1, d04-2).
   */
  selectionWindowStroke: "#ffffff",
  selectionCrossingFill: "rgba(74, 222, 128, 0.12)",
  selectionCrossingStroke: "#ffffff",
} as const

/**
 * The colour an object's own colour is drawn in. AutoCAD draws index colour 7
 * (`#ffffff`: layer 0's, a new layer's, `-COLOR 7`) in the screen's
 * foreground, white on its dark background; here that is {@link THEME.entity},
 * so an object set to 7 reads as one on layer 0 does.
 */
export function drawnColor(color: string): string {
  return color.toLowerCase() === "#ffffff" ? THEME.entity : color
}

/**
 * The face drawing text is set in: Arial, AutoCAD's Standard style, or one
 * with its advance widths — the widths `measureTextWidth` measures with.
 */
export const DRAWING_FONT =
  'Arial, "Liberation Sans", Arimo, Helvetica, sans-serif'
