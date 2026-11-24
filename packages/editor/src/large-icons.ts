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
/** The UCS tripod: Y up, X right, Z toward the viewer, from (13, 19). */
const TRIPOD = ["M13 19 V4", "M13 19 H28", "M13 19 L4 28"]
/** A cube's front face, and its top and side as far as they are seen. */
const CUBE_FRONT = "M4 11 H21 V28 H4 Z"
const CUBE_TOP = "M4 11 L11 4 H28 L21 11 Z"
const CUBE_SIDE = "M21 11 L28 4 V21 L21 28 Z"
const CUBE_SEEN = [CUBE_FRONT, "M4 11 L11 4 H28 L21 11", "M21 28 L28 21 V4"]
/** The magnifier of the Zoom members. */
const LENS = ["M4 13 A9 9 0 1 0 22 13 A9 9 0 1 0 4 13", "M20 20 L28 28"]
/** A block with two attributes' values, the attribute display modes' ground. */
const ATT_BLOCK = "M4 6 H28 V26 H4 Z"
const ATT_FIRST = "M8 12 H24"
const ATT_SECOND = "M8 20 H20"
const PALETTE_SHEET = ["M5 3 H27 V29 H5 Z", "M5 9 H27"]

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
  // Four arrows out of one point: Modify's panel button, folded or minimized.
  move: largeIcon("Move", {
    d: [
      "M16 3 V29",
      "M3 16 H29",
      "M12 7 L16 3 L20 7",
      "M12 25 L16 29 L20 25",
      "M7 12 L3 16 L7 20",
      "M25 12 L29 16 L25 20",
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
  // Create Block: loose pieces gathered into one, on its base point.
  block: largeIcon("Block", {
    d: [
      "M4 4 H28 V28 H4 Z",
      "M9 9 H17 V17 H9 Z",
      "M17 20 A4 4 0 1 0 25 20 A4 4 0 1 0 17 20",
    ],
    beads: [[9, 23]],
  }),
  // Define Attributes: the tag an attribute is defined by.
  attdef: largeIcon("AttDef", {
    d: ["M4 4 H15 L28 17 L17 28 L4 15 Z"],
    beads: [[10, 10]],
  }),
  // Wipeout: a frame that masks what runs behind it.
  wipeout: largeIcon("Wipeout", {
    d: [
      "M10 10 H28 V26 H10 Z",
      "M3 14 H10",
      "M3 20 H10",
      "M16 3 V10",
      "M22 3 V10",
    ],
  }),
  // Continue: the next dimension chained on from the last one's second line
  // (the arrowheads meeting there would read as a star at 32).
  dimcontinue: largeIcon("DimContinue", {
    d: [
      "M4 10 V28",
      "M16 10 V28",
      "M28 10 V28",
      "M4 14 H28",
      "M7 11 L4 14 L7 17",
      "M25 11 L28 14 L25 17",
    ],
  }),
  // Baseline: each dimension measured from the first one's origin, stacked.
  dimbaseline: largeIcon("DimBaseline", {
    d: [
      "M4 4 V28",
      "M16 18 V28",
      "M28 8 V28",
      "M4 22 H16",
      "M4 12 H28",
      "M7 19 L4 22 L7 25",
      "M13 19 L16 22 L13 25",
      "M7 9 L4 12 L7 15",
      "M25 9 L28 12 L25 15",
    ],
  }),
  // The solid primitives: the edges seen, and the hidden ones dashed.
  box: largeIcon("Box", {
    d: ["M4 14 H20 V28 H4 Z", "M4 14 L12 6 H28 L20 14", "M20 28 L28 20 V6"],
    dashed: ["M12 6 V20 H28", "M4 28 L12 20"],
  }),
  cylinder: largeIcon("Cylinder", {
    d: [
      "M5 8 A11 4 0 1 0 27 8 A11 4 0 1 0 5 8",
      "M5 8 V24",
      "M27 8 V24",
      "M5 24 A11 4 0 0 0 27 24",
    ],
    dashed: ["M5 24 A11 4 0 0 1 27 24"],
  }),
  cone: largeIcon("Cone", {
    d: ["M4 24 L16 4 L28 24", "M4 24 A12 4 0 0 0 28 24"],
    dashed: ["M4 24 A12 4 0 0 1 28 24"],
  }),
  sphere: largeIcon("Sphere", {
    d: [RING, "M4 16 A12 4 0 0 0 28 16"],
    dashed: ["M4 16 A12 4 0 0 1 28 16"],
  }),
  pyramid: largeIcon("Pyramid", {
    d: ["M3 23 L19 28 L29 22", "M15 4 L3 23", "M15 4 L19 28", "M15 4 L29 22"],
    dashed: ["M3 23 L13 18 L29 22", "M15 4 L13 18"],
  }),
  // The wedge: a box cut on its diagonal, its slope falling toward X.
  wedge: largeIcon("Wedge", {
    d: ["M4 12 V28 H20 Z", "M4 12 L12 4 L28 20 L20 28"],
    dashed: ["M12 4 V20 H28", "M4 28 L12 20"],
  }),
  // The torus: its outline and the hole through it.
  torus: largeIcon("Torus", {
    d: [
      "M2 16 A14 9 0 1 0 30 16 A14 9 0 1 0 2 16",
      "M8 14 A9 5 0 0 0 24 14",
      "M11 16 A6 3 0 0 1 21 16",
    ],
  }),
  // Extrude: a profile on the ground, pulled up into a solid.
  extrude: largeIcon("Extrude", {
    d: ["M3 27 L10 22 H29 L22 27 Z", "M16 24 V5", "M11 10 L16 5 L21 10"],
    dashed: ["M3 27 V15", "M22 27 V15", "M29 22 V10"],
    tint: ["M3 27 L10 22 H29 L22 27 Z"],
  }),
  // Revolve: a profile swept round an axis beside it.
  revolve: largeIcon("Revolve", {
    d: [
      "M15 6 H24 L20 18 H15 Z",
      "M10 22 A7 3 0 1 0 17 25",
      "M15 27 L17 25 L19 27",
    ],
    dashed: ["M10 3 V29"],
    tint: ["M15 6 H24 L20 18 H15 Z"],
  }),
  // Fillet Edge, Chamfer Edge: a box with one edge rounded, or bevelled.
  filletedge: largeIcon("FilletEdge", {
    d: [
      "M4 12 H15 A5 5 0 0 1 20 17 V28 H4 Z",
      "M4 12 L12 4 H23 A5 5 0 0 1 28 9 V20 L20 28",
      "M15 12 L23 4",
      "M20 17 L28 9",
    ],
    tint: ["M15 12 L23 4 A5 5 0 0 1 28 9 L20 17 A5 5 0 0 0 15 12 Z"],
  }),
  chamferedge: largeIcon("ChamferEdge", {
    d: [
      "M4 12 H15 L20 17 V28 H4 Z",
      "M4 12 L12 4 H23 L28 9 V20 L20 28",
      "M15 12 L23 4",
      "M20 17 L28 9",
    ],
    tint: ["M15 12 L23 4 L28 9 L20 17 Z"],
  }),
}

/** The Layer Properties Manager's large button: layers stacked. */
export const LayerPropertiesLarge: LargeIcon = largeIcon("LayerProperties", {
  d: [
    "M16 4 L28 10 L16 16 L4 10 Z",
    "M4 16 L16 22 L28 16",
    "M4 22 L16 28 L28 22",
  ],
})

/**
 * The ribbon's 32 px glyph for each button that runs a command or one of its
 * options rather than a tool, by the button's id.
 */
export const LARGE_BUTTON_ICONS: Readonly<Record<string, LargeIcon>> = {
  layerProperties: LayerPropertiesLarge,
  // World: the axes, and the globe they belong to.
  ucsWorld: largeIcon("UcsWorld", {
    d: [
      "M5 4 V27 H28",
      "M15 11 A6 6 0 1 0 27 11 A6 6 0 1 0 15 11",
      "M21 5 A3 6 0 0 0 21 17 A3 6 0 0 0 21 5",
      "M15 11 H27",
    ],
  }),
  // X, Y, Z: the UCS turned round that axis.
  ucsX: largeIcon("UcsX", {
    d: [...TRIPOD, "M21 13 A3 6 0 0 1 21 25", "M24 22 L21 25 L24 28"],
  }),
  ucsY: largeIcon("UcsY", {
    d: [...TRIPOD, "M13 7 A6 3 0 1 0 19 10", "M16 13 L19 10 L22 13"],
  }),
  ucsZ: largeIcon("UcsZ", {
    d: [...TRIPOD, "M23 19 A10 10 0 0 0 13 9", "M16 6 L13 9 L16 12"],
  }),
  // 3 Point: the origin, a point on X and one in the XY plane.
  ucs3Point: largeIcon("Ucs3Point", {
    d: ["M5 4 V26 H28"],
    beads: [
      [5, 26],
      [20, 26],
      [16, 12],
    ],
  }),
  ucsPrevious: largeIcon("UcsPrevious", {
    d: [
      "M5 14 V27 H18",
      "M18 3 L14 7 L18 11",
      "M14 7 H22 A6 6 0 0 1 22 19 H21",
    ],
  }),
  // View: the axes square to the screen.
  ucsView: largeIcon("UcsView", {
    d: [
      "M4 10 V4 H10",
      "M22 4 H28 V10",
      "M28 22 V28 H22",
      "M10 28 H4 V22",
      "M11 10 V21 H22",
    ],
  }),
  // Face: the axes laid on a face of a solid.
  ucsFace: largeIcon("UcsFace", {
    d: [
      "M4 12 H20 V28 H4 Z",
      "M4 12 L12 4 H28 L20 12",
      "M20 28 L28 20 V4",
      "M8 24 V16",
      "M8 24 H16",
    ],
    tint: ["M4 12 H20 V28 H4 Z"],
  }),
  // Object: the axes on an object, here at a circle's centre.
  ucsObject: largeIcon("UcsObject", {
    d: ["M5 20 A7 7 0 1 0 19 20 A7 7 0 1 0 5 20", "M12 20 H29", "M12 20 V3"],
    beads: [[12, 20]],
  }),
  // The UCS icon: the X and Y arrows from the origin, lettered.
  ucsIcon: largeIcon("UcsIcon", {
    d: ["M6 26 V5", "M6 26 H27", "M2 9 L6 5 L10 9", "M23 22 L27 26 L23 30"],
    thin: ["M18 12 L24 18", "M24 12 L18 18", "M10 5 L13 9 L16 5", "M13 9 V13"],
  }),
  // The ViewCube: the cube, and the compass ring under it.
  viewCube: largeIcon("ViewCube", {
    d: [
      "M16 2 L24 6 L16 10 L8 6 Z",
      "M8 6 V15 L16 19 V10",
      "M24 6 V15 L16 19",
      "M3 25 A13 4 0 1 0 29 25 A13 4 0 1 0 3 25",
    ],
  }),
  // A palette: rows of a label and its value.
  propertiesPalette: largeIcon("PropertiesPalette", {
    d: [...PALETTE_SHEET, "M9 14 H13", "M9 19 H13", "M9 24 H13"],
    thin: ["M17 14 H23", "M17 19 H23", "M17 24 H23"],
  }),
  // A palette: a grid of block thumbnails.
  blocksPalette: largeIcon("BlocksPalette", {
    d: [
      ...PALETTE_SHEET,
      "M9 12 H15 V18 H9 Z",
      "M17 12 H23 V18 H17 Z",
      "M9 20 H15 V26 H9 Z",
      "M17 20 H23 V26 H17 Z",
    ],
  }),
  // ATTDISP: a block's attributes as defined (the invisible one dashed), all
  // shown, all hidden.
  attModeNormal: largeIcon("AttModeNormal", {
    d: [ATT_BLOCK, ATT_FIRST],
    dashed: [ATT_SECOND],
  }),
  attModeOn: largeIcon("AttModeOn", { d: [ATT_BLOCK, ATT_FIRST, ATT_SECOND] }),
  attModeOff: largeIcon("AttModeOff", {
    d: [ATT_BLOCK, "M7 23 L25 9"],
    thin: [ATT_FIRST, ATT_SECOND],
  }),
  // Extents: the view grown out to everything.
  zoomExtents: largeIcon("ZoomExtents", {
    d: [
      "M7 14 A7 7 0 1 0 21 14 A7 7 0 1 0 7 14",
      "M19 19 L27 27",
      "M3 9 V3 H9",
      "M23 3 H29 V9",
      "M3 23 V29 H9",
    ],
  }),
  zoomWindow: largeIcon("ZoomWindow", {
    d: LENS,
    dashed: ["M9 10 H17 V16 H9 Z"],
  }),
  zoomPrevious: largeIcon("ZoomPrevious", {
    d: [...LENS, "M9 13 H17", "M12 10 L9 13 L12 16"],
  }),
  zoomIn: largeIcon("ZoomIn", { d: [...LENS, "M9 13 H17", "M13 9 V17"] }),
  zoomOut: largeIcon("ZoomOut", { d: [...LENS, "M9 13 H17"] }),
  // Orbit: the view turned round the drawing, an arrow over a sphere.
  orbit: largeIcon("Orbit", {
    d: [
      "M9 18 A7 7 0 1 0 23 18 A7 7 0 1 0 9 18",
      "M5 18 A11 11 0 0 1 27 18",
      "M24 15 L27 18 L30 15",
    ],
    thin: ["M9 18 A7 2.5 0 0 0 23 18"],
  }),
  // The visual styles: every edge; only the edges seen; the faces shaded.
  vs2dWireframe: largeIcon("Vs2dWireframe", {
    d: [
      CUBE_FRONT,
      "M11 4 H28 V21 H11 Z",
      "M4 11 L11 4",
      "M21 11 L28 4",
      "M21 28 L28 21",
      "M4 28 L11 21",
    ],
  }),
  vsHidden: largeIcon("VsHidden", { d: CUBE_SEEN }),
  vsConceptual: largeIcon("VsConceptual", {
    d: CUBE_SEEN,
    tint: [CUBE_FRONT, CUBE_TOP, CUBE_SIDE],
  }),
}
