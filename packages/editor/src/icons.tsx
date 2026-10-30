import { createLucideIcon, type LucideIcon } from "lucide-react"

/**
 * Custom CAD glyphs authored on lucide's 24px grid via {@link createLucideIcon},
 * so they inherit its stroke, sizing and colour props and sit seamlessly beside
 * the built-in lucide icons. Kept together so the whole app shares one icon
 * vocabulary and new glyphs have an obvious home.
 */

// Filled marker dot. `stroke: none` (not lucide's inherited 2px stroke) so a dot
// sitting on a ring at the viewBox edge stays a crisp disc instead of clipping.
const DOT = { r: "2", fill: "currentColor", stroke: "none" } as const

export const OffsetIcon: LucideIcon = createLucideIcon("Offset", [
  [
    "rect",
    { x: "3", y: "3", width: "18", height: "18", rx: "2", key: "outer" },
  ],
  [
    "rect",
    { x: "7", y: "7", width: "10", height: "10", rx: "1.5", key: "inner" },
  ],
])

export const Circle2PointsIcon: LucideIcon = createLucideIcon("Circle2Points", [
  ["circle", { cx: "12", cy: "12", r: "10", key: "ring" }],
  ["circle", { cx: "12", cy: "2", ...DOT, key: "p1" }],
  ["circle", { cx: "12", cy: "22", ...DOT, key: "p2" }],
])

export const Circle3PointsIcon: LucideIcon = createLucideIcon("Circle3Points", [
  ["circle", { cx: "12", cy: "12", r: "10", key: "ring" }],
  ["circle", { cx: "12", cy: "2", ...DOT, key: "p1" }],
  ["circle", { cx: "20.66", cy: "17", ...DOT, key: "p2" }],
  ["circle", { cx: "3.34", cy: "17", ...DOT, key: "p3" }],
])

export const CircleRadiusIcon: LucideIcon = createLucideIcon("CircleRadius", [
  ["circle", { cx: "12", cy: "12", r: "10", key: "ring" }],
  ["line", { x1: "12", y1: "12", x2: "22", y2: "12", key: "spoke" }],
  ["circle", { cx: "12", cy: "12", ...DOT, key: "hub" }],
])

export const CircleDiameterIcon: LucideIcon = createLucideIcon(
  "CircleDiameter",
  [
    ["circle", { cx: "12", cy: "12", r: "10", key: "ring" }],
    ["line", { x1: "2", y1: "12", x2: "22", y2: "12", key: "span" }],
    ["circle", { cx: "12", cy: "12", ...DOT, key: "hub" }],
  ]
)

/** Three-point arc: an arc with a bead at each defining point. */
export const ArcIcon: LucideIcon = createLucideIcon("Arc", [
  ["path", { d: "M3 17 A 9 9 0 0 1 21 17", key: "arc" }],
  ["circle", { cx: "3", cy: "17", ...DOT, key: "p1" }],
  ["circle", { cx: "12", cy: "8", ...DOT, key: "p2" }],
  ["circle", { cx: "21", cy: "17", ...DOT, key: "p3" }],
])

/** Start-Center-End arc: an arc with a spoke to its centre and a start bead. */
export const ArcStartCenterEndIcon: LucideIcon = createLucideIcon(
  "ArcStartCenterEnd",
  [
    ["path", { d: "M3 17 A 9 9 0 0 1 21 17", key: "arc" }],
    ["line", { x1: "12", y1: "17", x2: "3", y2: "17", key: "spoke" }],
    ["circle", { cx: "3", cy: "17", ...DOT, key: "start" }],
    ["circle", { cx: "12", cy: "17", ...DOT, key: "center" }],
  ]
)

/** Center-Start-End arc: centre emphasised, with spokes to the two ends. */
export const ArcCenterStartEndIcon: LucideIcon = createLucideIcon(
  "ArcCenterStartEnd",
  [
    ["path", { d: "M3 17 A 9 9 0 0 1 21 17", key: "arc" }],
    ["line", { x1: "12", y1: "17", x2: "3", y2: "17", key: "spoke1" }],
    ["line", { x1: "12", y1: "17", x2: "21", y2: "17", key: "spoke2" }],
    ["circle", { cx: "12", cy: "17", ...DOT, key: "center" }],
  ]
)

/** Axis-End ellipse: the axis being defined, with a bead at each end. */
export const EllipseIcon: LucideIcon = createLucideIcon("Ellipse", [
  ["ellipse", { cx: "12", cy: "12", rx: "10", ry: "6", key: "ring" }],
  ["circle", { cx: "2", cy: "12", ...DOT, key: "p1" }],
  ["circle", { cx: "22", cy: "12", ...DOT, key: "p2" }],
])

/** Center ellipse: the centre emphasised, with a spoke out to one axis end. */
export const EllipseCenterIcon: LucideIcon = createLucideIcon("EllipseCenter", [
  ["ellipse", { cx: "12", cy: "12", rx: "10", ry: "6", key: "ring" }],
  ["line", { x1: "12", y1: "12", x2: "22", y2: "12", key: "spoke" }],
  ["circle", { cx: "12", cy: "12", ...DOT, key: "hub" }],
])

/** Elliptical arc: a part-swept ellipse with a bead at each end of the sweep. */
export const EllipseArcIcon: LucideIcon = createLucideIcon("EllipseArc", [
  ["path", { d: "M2 12 A 10 6 0 0 1 20 8.4", key: "arc" }],
  ["circle", { cx: "2", cy: "12", ...DOT, key: "start" }],
  ["circle", { cx: "20", cy: "8.4", ...DOT, key: "end" }],
])

/**
 * Spline CV: the curve under its dashed control frame, a bead at each vertex
 * (lucide's Spline, beads on the curve, is the fit one).
 */
export const SplineCvIcon: LucideIcon = createLucideIcon("SplineCv", [
  ["path", { d: "M3 20 C7 6 17 6 21 20", key: "curve" }],
  [
    "path",
    { d: "M3 20 L7 6 L17 6 L21 20", strokeDasharray: "2 2", key: "frame" },
  ],
  ["circle", { cx: "7", cy: "6", ...DOT, key: "v1" }],
  ["circle", { cx: "17", cy: "6", ...DOT, key: "v2" }],
])

/** Fillet: two lines meeting at a rounded (arc) corner. */
export const FilletIcon: LucideIcon = createLucideIcon("Fillet", [
  ["path", { d: "M5 21 L5 11 A6 6 0 0 1 11 5 L21 5", key: "corner" }],
])

/** Chamfer: the same corner cut straight — the bevel that pairs with Fillet. */
export const ChamferIcon: LucideIcon = createLucideIcon("Chamfer", [
  ["path", { d: "M5 21 L5 11 L11 5 L21 5", key: "corner" }],
])

/** Stretch: a selection frame pulling the geometry it catches to the right. */
export const StretchIcon: LucideIcon = createLucideIcon("Stretch", [
  [
    "rect",
    {
      x: "2",
      y: "5",
      width: "11",
      height: "14",
      rx: "1",
      strokeDasharray: "3 2",
      key: "frame",
    },
  ],
  ["path", { d: "M9 12 H21", key: "pull" }],
  ["path", { d: "M18 9 L21 12 L18 15", key: "head" }],
])

/**
 * Linear dimension: two extension lines rising from the measured points to a
 * horizontal dimension line with an arrowhead at each end.
 */
export const DimLinearIcon: LucideIcon = createLucideIcon("DimLinear", [
  ["path", { d: "M4 20 V8", key: "ext1" }],
  ["path", { d: "M20 20 V8", key: "ext2" }],
  ["path", { d: "M4 11 H20", key: "line" }],
  ["path", { d: "M7 8.5 L4 11 L7 13.5", key: "head1" }],
  ["path", { d: "M17 8.5 L20 11 L17 13.5", key: "head2" }],
])

/** Aligned dimension: the same assembly, parallel to a sloping measured edge. */
export const DimAlignedIcon: LucideIcon = createLucideIcon("DimAligned", [
  ["path", { d: "M3 21 L8 16", key: "ext1" }],
  ["path", { d: "M15 9 L20 4", key: "ext2" }],
  ["path", { d: "M5 19 L18 6", key: "line" }],
  ["path", { d: "M5 15.5 L5 19 L8.5 19", key: "head1" }],
  ["path", { d: "M18 9.5 L18 6 L14.5 6", key: "head2" }],
])

/**
 * Baseline dimension: two dimension lines stacked above a shared left datum,
 * the second offset by DIMDLI.
 */
export const DimBaselineIcon: LucideIcon = createLucideIcon("DimBaseline", [
  ["path", { d: "M4 21 V4", key: "datum" }],
  ["path", { d: "M13 21 V13", key: "ext1" }],
  ["path", { d: "M21 21 V6", key: "ext2" }],
  ["path", { d: "M4 15 H13", key: "line1" }],
  ["path", { d: "M4 8 H21", key: "line2" }],
])

/** Continued dimension: two dimension lines running end to end on one level. */
export const DimContinueIcon: LucideIcon = createLucideIcon("DimContinue", [
  ["path", { d: "M3 20 V8", key: "ext1" }],
  ["path", { d: "M12 20 V8", key: "ext2" }],
  ["path", { d: "M21 20 V8", key: "ext3" }],
  ["path", { d: "M3 11 H21", key: "line" }],
])

/**
 * Angular dimension: two rays off a shared vertex with the dimension arc drawn
 * between them.
 */
export const DimAngularIcon: LucideIcon = createLucideIcon("DimAngular", [
  ["path", { d: "M4 20 H21", key: "ray1" }],
  ["path", { d: "M4 20 L17.5 6.5", key: "ray2" }],
  ["path", { d: "M14 20 A10 10 0 0 0 11.07 12.93", key: "arc" }],
  ["circle", { cx: "4", cy: "20", ...DOT, key: "vertex" }],
])

/**
 * Radius dimension: a leader from inside the circle out to the text, with the
 * arrowhead against the arc.
 */
export const DimRadiusIcon: LucideIcon = createLucideIcon("DimRadius", [
  ["circle", { cx: "11", cy: "13", r: "8", key: "ring" }],
  ["path", { d: "M11 13 L21 3", key: "leader" }],
  ["path", { d: "M13.3 12.8 L16.7 7.3 L17.3 10.7 Z", key: "head" }],
])

/** Diameter dimension: the same, drawn right across the circle. */
export const DimDiameterIcon: LucideIcon = createLucideIcon("DimDiameter", [
  ["circle", { cx: "11", cy: "13", r: "8", key: "ring" }],
  ["path", { d: "M5.3 18.7 L21 3", key: "leader" }],
  ["path", { d: "M13.3 12.8 L16.7 7.3 L17.3 10.7 Z", key: "head1" }],
  ["path", { d: "M8.7 13.2 L5.3 18.7 L4.7 15.3 Z", key: "head2" }],
])

/**
 * Dimension spacing: a series of dimension lines off a shared datum, made
 * evenly spaced, with the arrow that measures the gap between them.
 */
export const DimSpaceIcon: LucideIcon = createLucideIcon("DimSpace", [
  ["path", { d: "M3 21 V3", key: "datum" }],
  ["path", { d: "M3 18 H14", key: "line1" }],
  ["path", { d: "M3 12 H14", key: "line2" }],
  ["path", { d: "M3 6 H14", key: "line3" }],
  ["path", { d: "M19 7 V17", strokeWidth: "1.25", key: "gap" }],
  ["path", { d: "M17 9 L19 7 L21 9", strokeWidth: "1.25", key: "head1" }],
  ["path", { d: "M17 15 L19 17 L21 15", strokeWidth: "1.25", key: "head2" }],
])

/**
 * Hatch: a bounded area filled with 45° pattern lines, which is what the
 * command's default ANSI31 draws.
 */
export const HatchIcon: LucideIcon = createLucideIcon("Hatch", [
  [
    "rect",
    { x: "3", y: "3", width: "18", height: "18", rx: "2", key: "boundary" },
  ],
  ["path", { d: "M4 14 L14 4", strokeWidth: "1.25", key: "l1" }],
  ["path", { d: "M4 20 L20 4", strokeWidth: "1.25", key: "l2" }],
  ["path", { d: "M10 20 L20 10", strokeWidth: "1.25", key: "l3" }],
])

/**
 * Create block: loose pieces gathered into one named object, with a bead on the
 * insertion base point.
 */
export const BlockIcon: LucideIcon = createLucideIcon("Block", [
  [
    "rect",
    { x: "3", y: "3", width: "18", height: "18", rx: "2", key: "frame" },
  ],
  ["path", { d: "M7 8 H12 V13 H7 Z", strokeWidth: "1.25", key: "piece1" }],
  ["path", { d: "M13 12 H17 V16 H13 Z", strokeWidth: "1.25", key: "piece2" }],
  ["circle", { cx: "7", cy: "17", ...DOT, key: "base" }],
])

/** Insert block: a named object dropped onto its insertion point. */
export const InsertIcon: LucideIcon = createLucideIcon("Insert", [
  [
    "rect",
    { x: "8", y: "3", width: "13", height: "13", rx: "2", key: "block" },
  ],
  ["path", { d: "M3 21 L8 16", strokeWidth: "1.25", key: "leader" }],
  ["circle", { cx: "3", cy: "21", ...DOT, key: "point" }],
])

/** Break: one object cut into two, with the removed gap between the pieces. */
export const BreakIcon: LucideIcon = createLucideIcon("Break", [
  ["path", { d: "M3 12 H9", key: "left" }],
  ["path", { d: "M15 12 H21", key: "right" }],
  ["path", { d: "M9 7 V17", strokeWidth: "1.25", key: "cut1" }],
  ["path", { d: "M15 7 V17", strokeWidth: "1.25", key: "cut2" }],
])

/** Break at point: the same object split in place, with no gap. */
export const BreakAtPointIcon: LucideIcon = createLucideIcon("BreakAtPoint", [
  ["path", { d: "M3 12 H11", key: "left" }],
  ["path", { d: "M13 12 H21", key: "right" }],
  ["circle", { cx: "12", cy: "12", ...DOT, key: "point" }],
])

/** Polyline: a connected chain of straight segments with beads at its vertices. */
export const PolylineIcon: LucideIcon = createLucideIcon("Polyline", [
  ["path", { d: "M3 6 L9 18 L15 8 L21 17", key: "chain" }],
  ["circle", { cx: "3", cy: "6", ...DOT, key: "v1" }],
  ["circle", { cx: "9", cy: "18", ...DOT, key: "v2" }],
  ["circle", { cx: "15", cy: "8", ...DOT, key: "v3" }],
  ["circle", { cx: "21", cy: "17", ...DOT, key: "v4" }],
])

/**
 * 3D Polyline: a chain that leaves its ground plane — an isometric run along
 * the floor, then up and away — beads at its vertices, like AutoCAD's button.
 */
export const Polyline3dIcon: LucideIcon = createLucideIcon("Polyline3d", [
  ["path", { d: "M3 20 L12 15 L12 6 L21 3", key: "chain" }],
  ["path", { d: "M12 15 L21 20", strokeDasharray: "2 2", key: "floor" }],
  ["circle", { cx: "3", cy: "20", ...DOT, key: "v1" }],
  ["circle", { cx: "12", cy: "15", ...DOT, key: "v2" }],
  ["circle", { cx: "12", cy: "6", ...DOT, key: "v3" }],
  ["circle", { cx: "21", cy: "3", ...DOT, key: "v4" }],
])

/** Lineweight display: three rules of clearly growing thickness. */
export const LineweightIcon: LucideIcon = createLucideIcon("Lineweight", [
  ["path", { d: "M4 5 H20", strokeWidth: "1", key: "thin" }],
  ["path", { d: "M4 12 H20", strokeWidth: "3", key: "medium" }],
  ["path", { d: "M4 19.5 H20", strokeWidth: "5", key: "thick" }],
])

/**
 * Selection cycling: the two offset rectangles AutoCAD shows beside the cursor
 * when the pick box covers more than one object.
 */
export const SelectionCyclingIcon: LucideIcon = createLucideIcon(
  "SelectionCycling",
  [
    [
      "rect",
      { x: "3", y: "8", width: "13", height: "13", rx: "1.5", key: "back" },
    ],
    [
      "rect",
      { x: "8", y: "3", width: "13", height: "13", rx: "1.5", key: "front" },
    ],
  ]
)

/** Snap mode: a lattice with the cursor stuck to one of its nodes. */
export const SnapModeIcon: LucideIcon = createLucideIcon("SnapMode", [
  ["path", { d: "M4 9 H20", key: "h1" }],
  ["path", { d: "M4 15 H20", key: "h2" }],
  ["path", { d: "M9 4 V20", key: "v1" }],
  ["path", { d: "M15 4 V20", key: "v2" }],
  [
    "circle",
    {
      cx: "15",
      cy: "9",
      r: "2.5",
      fill: "currentColor",
      stroke: "none",
      key: "node",
    },
  ],
])

/**
 * Zoom previous: lucide's magnifier with a back arrow in the lens, so it never
 * reads as Undo's arrow alone.
 */
export const ZoomPreviousIcon: LucideIcon = createLucideIcon("ZoomPrevious", [
  ["circle", { cx: "11", cy: "11", r: "8", key: "lens" }],
  ["path", { d: "m21 21-4.35-4.35", key: "handle" }],
  ["path", { d: "M7.5 11h7", key: "shaft" }],
  ["path", { d: "m10.5 8-3 3 3 3", key: "head" }],
])
