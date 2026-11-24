"use client"

import { createElement, type ReactElement } from "react"

/**
 * The glyphs the ribbon draws at 32 px: its large buttons and the rows of its
 * drop-down lists (docs/plans/autocad-ui.md, §2.3). Each is drawn for that
 * size, not the 24 px glyph of `icons.tsx` scaled (decision 5): lucide's 2 px
 * stroke with round caps and joins on a grid of 32, on whole pixels, so at 32
 * a line is as thin and as crisp as at 16. Beads are filled discs of r 2.5, a
 * hatch's lines 1.5.
 */
export type LargeIcon = (props: { className?: string }) => ReactElement

/** The ring every circle glyph shares: r 12 round (16, 16). */
const RING = "M4 16 A12 12 0 1 0 28 16 A12 12 0 1 0 4 16"
const ARC = "M4 22 A12 12 0 0 1 28 22"
const ELLIPSE = "M3 16 A13 8 0 1 0 29 16 A13 8 0 1 0 3 16"
const COPY = ["M4 4 H20 V20 H4 Z", "M12 24 V28 H28 V12 H24"]

type Bead = readonly [number, number]

function largeIcon(
  name: string,
  {
    d = [],
    dashed = [],
    thin = [],
    beads = [],
    tint = [],
  }: {
    readonly d?: readonly string[]
    readonly dashed?: readonly string[]
    readonly thin?: readonly string[]
    readonly beads?: readonly Bead[]
    /** An area, filled faintly under its outline. */
    readonly tint?: readonly string[]
  }
): LargeIcon {
  const icon = ({ className }: { className?: string }): ReactElement =>
    createElement(
      "svg",
      {
        xmlns: "http://www.w3.org/2000/svg",
        width: 32,
        height: 32,
        viewBox: "0 0 32 32",
        fill: "none",
        stroke: "currentColor",
        strokeWidth: 2,
        strokeLinecap: "round",
        strokeLinejoin: "round",
        "aria-hidden": true,
        className,
      },
      ...tint.map((path, i) =>
        createElement("path", {
          key: `t${i}`,
          d: path,
          fill: "currentColor",
          fillOpacity: 0.2,
          stroke: "none",
        })
      ),
      ...d.map((path, i) => createElement("path", { key: `d${i}`, d: path })),
      ...dashed.map((path, i) =>
        createElement("path", { key: `s${i}`, d: path, strokeDasharray: "3 3" })
      ),
      ...thin.map((path, i) =>
        createElement("path", { key: `h${i}`, d: path, strokeWidth: 1.5 })
      ),
      ...beads.map(([cx, cy], i) =>
        createElement("circle", {
          key: `b${i}`,
          cx,
          cy,
          r: 2.5,
          fill: "currentColor",
          stroke: "none",
        })
      )
    )
  icon.displayName = `${name}Large`
  return icon
}

/** The ribbon's 32 px glyph for each tool that shows one, by tool id. */
export const LARGE_TOOL_ICONS: Readonly<Record<string, LargeIcon>> = {
  line: largeIcon("Line", {
    d: ["M5 27 L27 5"],
    beads: [
      [5, 27],
      [27, 5],
    ],
  }),
  // A line, then an arc back over it, as PLINE draws one.
  polyline: largeIcon("Polyline", {
    d: ["M4 22 H17 A6 6 0 0 0 17 10 H8"],
    beads: [
      [4, 22],
      [17, 22],
      [17, 10],
    ],
  }),
  circle: largeIcon("CircleRadius", {
    d: [RING, "M16 16 L24.5 7.5"],
    beads: [[16, 16]],
  }),
  circlediameter: largeIcon("CircleDiameter", {
    d: [RING, "M7.5 24.5 L24.5 7.5"],
    beads: [[16, 16]],
  }),
  circle2p: largeIcon("Circle2Points", {
    d: [RING],
    beads: [
      [16, 4],
      [16, 28],
    ],
  }),
  circle3p: largeIcon("Circle3Points", {
    d: [RING],
    beads: [
      [16, 4],
      [26.4, 22],
      [5.6, 22],
    ],
  }),
  arc: largeIcon("Arc", {
    d: [ARC],
    beads: [
      [4, 22],
      [16, 10],
      [28, 22],
    ],
  }),
  arcsce: largeIcon("ArcStartCenterEnd", {
    d: [ARC, "M16 22 H4"],
    beads: [
      [4, 22],
      [16, 22],
      [28, 22],
    ],
  }),
  arccse: largeIcon("ArcCenterStartEnd", {
    d: [ARC, "M4 22 H28"],
    beads: [[16, 22]],
  }),
  rectangle: largeIcon("Rectangle", {
    d: ["M5 8 H27 V24 H5 Z"],
    beads: [
      [5, 24],
      [27, 8],
    ],
  }),
  polygon: largeIcon("Polygon", {
    d: ["M16 5 L27.4 13.3 L23 26.7 H9 L4.6 13.3 Z"],
    beads: [[16, 17]],
  }),
  ellipsecenter: largeIcon("EllipseCenter", {
    d: [ELLIPSE, "M16 16 H29"],
    beads: [[16, 16]],
  }),
  ellipse: largeIcon("Ellipse", {
    d: [ELLIPSE],
    beads: [
      [3, 16],
      [29, 16],
    ],
  }),
  ellipsearc: largeIcon("EllipseArc", {
    d: ["M3 16 A13 8 0 0 1 25.2 10.3"],
    dashed: ["M25.2 10.3 A13 8 0 0 1 16 24 A13 8 0 0 1 3 16"],
    beads: [
      [3, 16],
      [25.2, 10.3],
    ],
  }),
  hatch: largeIcon("Hatch", {
    d: ["M5 5 H27 V27 H5 Z"],
    thin: [
      "M5 11 L11 5",
      "M5 19 L19 5",
      "M5 27 L27 5",
      "M13 27 L27 13",
      "M21 27 L27 21",
    ],
  }),
  // The cutting edge, the part kept and, dashed, the part trimmed away.
  trim: largeIcon("Trim", {
    d: ["M16 4 V28", "M4 16 H16"],
    dashed: ["M19 16 H28"],
  }),
  // The line grown, dashed, to the boundary it meets.
  extend: largeIcon("Extend", {
    d: ["M27 4 V28", "M4 16 H13", "M21 11 L26 16 L21 21"],
    dashed: ["M16 16 H24"],
  }),
  fillet: largeIcon("Fillet", { d: ["M6 28 V16 A10 10 0 0 1 16 6 H28"] }),
  chamfer: largeIcon("Chamfer", { d: ["M6 28 V14 L14 6 H28"] }),
  array: largeIcon("Array", {
    d: [
      "M4 4 H13 V13 H4 Z",
      "M19 4 H28 V13 H19 Z",
      "M4 19 H13 V28 H4 Z",
      "M19 19 H28 V28 H19 Z",
    ],
  }),
  arraypath: largeIcon("ArrayPath", {
    dashed: ["M4 28 C8 14 18 18 28 4"],
    d: ["M3 19 H9 V25 H3 Z", "M13 13 H19 V19 H13 Z", "M22 6 H28 V12 H22 Z"],
  }),
  arraypolar: largeIcon("ArrayPolar", {
    d: [
      "M24 16 A3 3 0 1 0 30 16 A3 3 0 1 0 24 16",
      "M2 16 A3 3 0 1 0 8 16 A3 3 0 1 0 2 16",
      "M13 5 A3 3 0 1 0 19 5 A3 3 0 1 0 13 5",
      "M13 27 A3 3 0 1 0 19 27 A3 3 0 1 0 13 27",
    ],
    beads: [[16, 16]],
  }),
  // Multiline Text: a paragraph in its box.
  mtext: largeIcon("Mtext", {
    d: ["M8 11 H24", "M8 16 H24", "M8 21 H18"],
    dashed: ["M4 5 H28 V27 H4 Z"],
  }),
  // Single Line text: a letter on its baseline.
  text: largeIcon("Text", { d: ["M7 27 L16 5 L25 27", "M10.5 19 H21.5"] }),
  dimlinear: largeIcon("DimLinear", {
    d: [
      "M5 10 V28",
      "M27 10 V28",
      "M5 15 H27",
      "M9 11 L5 15 L9 19",
      "M23 11 L27 15 L23 19",
    ],
  }),
  dimaligned: largeIcon("DimAligned", {
    d: [
      "M10 28 L4 22",
      "M28 10 L22 4",
      "M5 21 L21 5",
      "M5 15 V21 H11",
      "M15 5 H21 V11",
    ],
    dashed: ["M12 26 L26 12"],
  }),
  dimangular: largeIcon("DimAngular", {
    d: ["M5 27 H28", "M5 27 L20 6", "M19 27 A14 14 0 0 0 13.1 15.6"],
  }),
  dimradius: largeIcon("DimRadius", {
    d: [RING, "M16 16 L24.5 7.5", "M19 7.5 H24.5 V13"],
    beads: [[16, 16]],
  }),
  dimdiameter: largeIcon("DimDiameter", {
    d: [RING, "M7.5 24.5 L24.5 7.5", "M19 7.5 H24.5 V13", "M13 24.5 H7.5 V19"],
  }),
  // Insert: a block, and the arrow that brings it in.
  insert: largeIcon("Insert", {
    d: ["M12 4 H28 V20 H12 Z", "M4 28 L18 14", "M10 14 H18 V22"],
  }),
  // Edit Attributes' Single: a value's field, its caret in it.
  attedit: largeIcon("AttEdit", {
    d: ["M3 9 H29 V23 H3 Z", "M13 12 V20", "M11 12 H15", "M11 20 H15"],
  }),
  // Match Properties: one object's look carried onto another.
  matchprop: largeIcon("MatchProp", {
    d: ["M4 4 H14 V14 H4 Z", "M14 9 C21 9 23 11 23 18", "M20 15 L23 18 L26 15"],
    dashed: ["M18 21 H28 V28 H18 Z"],
    tint: ["M4 4 H14 V14 H4 Z"],
  }),
  // Measure's Distance (DIST here): a rule and its marks.
  measure: largeIcon("Distance", {
    d: [
      "M3 11 H29 V21 H3 Z",
      "M8 11 V16",
      "M13 11 V14",
      "M18 11 V16",
      "M23 11 V14",
    ],
  }),
  // Measure's Area (AREA here): an outline and what it encloses.
  measurearea: largeIcon("Area", {
    d: ["M5 24 L10 6 L27 10 L24 27 Z"],
    tint: ["M5 24 L10 6 L27 10 L24 27 Z"],
  }),
  paste: largeIcon("Paste", {
    d: [
      "M8 6 H6 V29 H26 V6 H24",
      "M11 3 H21 V9 H11 Z",
      "M11 16 H21",
      "M11 22 H18",
    ],
  }),
  cutclip: largeIcon("Cut", {
    d: [
      "M5 24 A4 4 0 1 0 13 24 A4 4 0 1 0 5 24",
      "M19 24 A4 4 0 1 0 27 24 A4 4 0 1 0 19 24",
      "M11.8 21.2 L24 4",
      "M20.2 21.2 L8 4",
    ],
  }),
  copyclip: largeIcon("CopyClip", { d: COPY }),
  // Copy with Base Point: the copy, and the point it is taken by.
  copybase: largeIcon("CopyBase", { d: COPY, beads: [[12, 28]] }),
}

/** The Layer Properties Manager's large button: layers stacked. */
export const LayerPropertiesLarge: LargeIcon = largeIcon("LayerProperties", {
  d: [
    "M16 4 L28 10 L16 16 L4 10 Z",
    "M4 16 L16 22 L28 16",
    "M4 22 L16 28 L28 22",
  ],
})
