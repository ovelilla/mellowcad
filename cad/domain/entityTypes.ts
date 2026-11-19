import { Vec2 } from "../geometry/Vec2"
import { Vec3 } from "../geometry/Vec3"
import { KnotParameterization } from "../geometry/nurbs"
import type { Linear2 } from "../geometry/linear"
import type { RegionFace } from "../geometry/planarRegions"
import type { Brep } from "../geometry/solids"
import { EntityColor } from "./colors"
import { LayerId } from "./layers"
import { LinetypeId } from "./linetypes"
import { Lineweight } from "./lineweights"
import { TextStyleId } from "./textStyles"
import { DimStyleId } from "./dimStyles"
import {
  HatchPatternId,
  HatchPatternLine,
  HatchPatternType,
} from "./hatchPatterns"
import type { HatchGradient } from "./hatchGradients"

/**
 * Entities are the CAD domain model: real geometry in world coordinates, never
 * screen pixels, so a drawing is resolution- and zoom-independent. They are
 * immutable plain data operated on by the pure functions in this module.
 */

export type EntityId = string

export type EntityType =
  | "line"
  | "circle"
  | "arc"
  | "ellipse"
  | "spline"
  | "polyline"
  | "polyline3d"
  | "text"
  | "mtext"
  | "attdef"
  | "dimension"
  | "hatch"
  | "insert"
  | "region"
  | "solid3d"
  | "point"
  | "solid2d"
  | "leader"
  | "face3d"
  | "wipeout"
  | "image"
  | "table"
  | "mleader"

interface BaseEntity {
  readonly id: EntityId
  readonly type: EntityType
  /** The layer this entity belongs to; supplies its "ByLayer" appearance. */
  readonly layerId: LayerId
  /**
   * Per-object colour override (AutoCAD's ByObject). When absent the entity
   * inherits its layer's colour (ByLayer).
   */
  readonly color?: EntityColor
  /**
   * Per-object linetype override (AutoCAD's ByObject). When absent the entity
   * inherits its layer's linetype (ByLayer), mirroring how colour is resolved.
   */
  readonly linetype?: LinetypeId
  /**
   * The object's own linetype scale (Properties' Linetype scale, DXF 48),
   * which multiplies LTSCALE for it alone: CELTSCALE when it was made. Absent
   * means 1, which is never stored (ltype/p05).
   */
  readonly linetypeScale?: number
  /**
   * Per-object lineweight override in mm (ByObject). When absent the entity
   * inherits its layer's lineweight (ByLayer), like {@link linetype}.
   */
  readonly lineweight?: Lineweight
  /**
   * The plane the object lies in, as DXF keeps it: `elevation` is its distance
   * from the origin along {@link normal}, and the object's own points are in
   * that plane's object coordinate system (the arbitrary axis algorithm's
   * axes for the normal). With the normal on +Z that system is the WCS and
   * the elevation is a world Z. Absent means 0. A line is the exception: its
   * points are in the WCS, and this is its start's Z.
   */
  readonly elevation?: number
  /**
   * DXF 210: the unit normal of the object's plane, or a line's extrusion
   * direction. Absent means +Z, the only one the plan draws as it is stored.
   */
  readonly normal?: Vec3
}

/**
 * The objects AutoCAD extrudes by a thickness (DXF 39): "lines, arcs, circles,
 * polylines", points (point/p04) and 2D solids (solid2d/p07) among the ones
 * modelled here. Absent
 * means 0; negative extrudes down.
 */
interface Thick {
  readonly thickness?: number
}

/** A 3D segment: it starts at {@link BaseEntity.elevation} and rises by {@link deltaZ}. */
export interface LineEntity extends BaseEntity, Thick {
  readonly type: "line"
  readonly start: Vec2
  readonly end: Vec2
  /** End Z minus start Z, kept as a difference so it transforms like a vector. */
  readonly deltaZ?: number
}

/**
 * A point object (DXF POINT). `position` is in the OCS of its normal, at its
 * elevation, as a circle's centre is: DXF writes the WCS and the reader turns
 * it. What it shows is the drawing's PDMODE and PDSIZE, not the object's.
 */
export interface PointEntity extends BaseEntity, Thick {
  readonly type: "point"
  readonly position: Vec2
  /**
   * DXF 50: the X axis of the UCS the point was drawn in, as AutoCAD stores
   * it, so the figure turns by its negative (drawn in UCS Z 30, 50 is 330°
   * and the cross shows turned 30°: point/p04, desktop). Absent is 0.
   */
  readonly xAxisAngle?: number
}

/**
 * A 2D solid (DXF SOLID): SOLID's triangle or quadrilateral, its corners in
 * the order picked (DXF 10–13), in the OCS of its normal at its elevation.
 * Its outline runs 1, 2, 4, 3: the third corner is the one across from the
 * second, so corners given round the outline cross into a bow tie, as
 * AutoCAD draws it (solid2d/d02). A triangle's fourth corner is its third
 * (Enter at the fourth point, solid2d/p01). What it fills follows FILLMODE.
 */
export interface Solid2dEntity extends BaseEntity, Thick {
  readonly type: "solid2d"
  readonly corners: readonly [Vec2, Vec2, Vec2, Vec2]
}

/**
 * A 3D face (DXF 3DFACE, AutoCAD's 3DFACE): three or four corners in space,
 * each with its own Z in the WCS, as a 3D polyline's vertices are, and no
 * plane of its own; a triangle repeats its third corner as its fourth.
 * {@link invisibleEdges} is DXF 70: bit `i` hides the edge from corner `i`
 * to the next, which is then neither drawn, picked nor snapped to
 * (face3d/f04, f09).
 */
export interface Face3dEntity extends BaseEntity {
  readonly type: "face3d"
  readonly corners: readonly [Vec3, Vec3, Vec3, Vec3]
  readonly invisibleEdges?: number
}

/**
 * A wipeout (DXF WIPEOUT, AutoCAD's WIPEOUT): a polygon that masks what is
 * drawn before it with the background, its frame shown as WIPEOUTFRAME says.
 * Its vertices, three or more, in the OCS of its normal at its elevation,
 * close back to the first; AutoCAD keeps them as a one-pixel image's clip
 * boundary, which the DXF reader and writer turn (wipeout/w01).
 */
export interface WipeoutEntity extends BaseEntity {
  readonly type: "wipeout"
  readonly vertices: readonly Vec2[]
}

/**
 * A raster image (DXF IMAGE, AutoCAD's -IMAGE Attach) as AutoCAD opens one
 * whose file it cannot find, which a page always is: it reads only the file
 * it is given, never the folder beside it. It shows its frame, as
 * IMAGEFRAME says, and its file's path across it (image/i01), and keeps
 * what the file said of it, so DXFOUT writes it back.
 *
 * Its pixels are `width` by `height`: the frame runs from `position` (its
 * lower-left corner, DXF 10) along `width·u` and `height·v`. `u` and `v` are
 * one pixel's sides (DXF 11, 12) in the OCS of its normal, at its
 * elevation; MIRROR leaves them turning clockwise, as AutoCAD's normal then
 * points down (image/i06e).
 */
export interface ImageEntity extends BaseEntity {
  readonly type: "image"
  readonly position: Vec2
  readonly u: Vec2
  readonly v: Vec2
  readonly width: number
  readonly height: number
  readonly image: ImageReference
  /**
   * DXF 70: 1 shows it, 2 also when not square to the view, 4 clips it, 8
   * makes its background transparent. Absent is 7.
   */
  readonly display?: number
  /** DXF 281–283, absent being AutoCAD's 50, 50 and 0. */
  readonly brightness?: number
  readonly contrast?: number
  readonly fade?: number
  /**
   * Its clip boundary as DXF 14 keeps it, in pixels from the top-left
   * pixel's centre: a rectangle's two corners or a polygon's vertices.
   * AutoCAD applies none to an image it cannot find, nor lists it
   * (image/i01, c1, c2): it is kept to be written back, `off` when IMAGECLIP
   * turned it off (DXF 280 0).
   */
  readonly clip?: {
    readonly polygonal: boolean
    readonly points: readonly Vec2[]
    readonly off?: true
  }
}

/**
 * The image an image object shows (DXF IMAGEDEF): the name it is listed by,
 * its file's path as saved (1), and the size of one of its pixels in
 * `units` (11, 281), by which LIST gives its scale.
 */
export interface ImageReference {
  readonly name: string
  readonly path: string
  readonly pixelSize?: number
  readonly units?: number
}

/**
 * A table (DXF ACAD_TABLE, AutoCAD's TABLE): rows of cells under its style,
 * its top-left corner at `position` (DXF 10), its rows along `direction` (11,
 * a unit vector in the OCS of its normal) and down from it.
 *
 * What it draws is derived (`tableGeometry`), as AutoCAD rebuilds its block
 * from these on opening a file (table/t01: a block left stale or empty is
 * redrawn from them). SCALE scales these, never a factor (t00, t02); MIRROR
 * leaves its text readable (t02).
 */
export interface TableEntity extends BaseEntity {
  readonly type: "table"
  readonly position: Vec2
  readonly direction: Vec2
  /** DXF 141, top to bottom. */
  readonly rowHeights: readonly number[]
  /** DXF 142, left to right. */
  readonly columnWidths: readonly number[]
  /** Row by row, `rowHeights.length × columnWidths.length` of them. */
  readonly cells: readonly TableCell[]
  readonly style: TableStyleData
  /**
   * What it sets over its style (DXF 93 with 40, 41 and the three 140s), as
   * SCALE leaves it (t00, t02): its cell margins and its rows' text heights.
   */
  readonly overrides?: TableOverrides
}

/**
 * A multileader (DXF MULTILEADER, AutoCAD's MLEADER): leaders that end on a
 * landing, each with its dogleg, and the MTEXT or block they point to. It
 * is drawn from these, its context data, as AutoCAD draws one it opens:
 * the text where 12 puts it, the landing, each branch's dogleg length, the
 * arrowhead's size 140 and the text's height 41, whatever the object's own
 * 41 and 42 or its style say (mleader/v1–v12). What it draws is derived
 * (`mleaderGeometry`): the pieces EXPLODE leaves (m03).
 *
 * Its points are in the OCS of its normal at its elevation, as a leader's.
 */
export interface MLeaderEntity extends BaseEntity {
  readonly type: "mleader"
  /** Its LEADER{} branches, each with its own landing and leader lines. */
  readonly branches: readonly MLeaderBranch[]
  /** DXF 170: how its leader lines run; `none` draws none. */
  readonly path: MLeaderPath
  /**
   * DXF 291: the dogleg drawn from each landing. Off, a straight leader
   * runs on to where it would end, as a spline always does (mleader/v6, v7).
   */
  readonly dogleg: boolean
  /** Context 140: the closed filled arrowhead's length. */
  readonly arrowSize: number
  /** Context 145: from the dogleg's end to its content. */
  readonly landingGap: number
  readonly content?: MLeaderContent
  /** DXF 91: its leader lines' colour; absent, ByLayer. */
  readonly lineColor?: MLeaderColor
  readonly style: MLeaderStyleData
  /** What it holds and does not draw by, kept to be written back. */
  readonly kept: MLeaderKept
}

export type MLeaderPath = "none" | "straight" | "spline"

/**
 * A colour as a multileader holds its parts': ByLayer (absent), ByBlock
 * (the object's own) or one of its own.
 */
export type MLeaderColor = "ByBlock" | EntityColor

/**
 * One LEADER{} of its context: its landing (10), the unit direction of its
 * dogleg (11) and the dogleg's length (40), and its leader lines
 * (LEADER_LINE{}), each its vertices from the arrowhead's tip towards the
 * landing, the landing left out.
 */
export interface MLeaderBranch {
  readonly landing: Vec2
  readonly direction: Vec2
  readonly doglegLength: number
  readonly lines: readonly (readonly Vec2[])[]
}

export type MLeaderContent = MLeaderText | MLeaderBlockContent

/**
 * Its MTEXT (context 290 1): an MTEXT's fields, at 12 by its 171. It wears
 * the object's colour: neither its context's 90 nor the object's 92 changes
 * what AutoCAD draws (mleader/v19, v20).
 */
export interface MLeaderText {
  readonly kind: "mtext"
  readonly position: Vec2
  readonly contents: string
  readonly height: number
  readonly width: number
  readonly rotation: number
  readonly attachment: MTextAttachment
  readonly lineSpacingStyle: LineSpacingStyle
  readonly lineSpacingFactor: number
  readonly styleId: TextStyleId
}

/** Its block (context 296 1), placed as a reference by 15, 16 and 46. */
export interface MLeaderBlockContent {
  readonly kind: "block"
  readonly blockId: BlockId
  readonly position: Vec2
  readonly scaleX: number
  readonly scaleY: number
  readonly rotation: number
}

/**
 * See {@link MLeaderEntity.kept}: its context's base point (10) and plane
 * origin (110), which AutoCAD works out again as it edits one, and values
 * of the object's own that AutoCAD draws nothing by.
 */
export interface MLeaderKept {
  readonly base: Vec2
  readonly planeOrigin: Vec2
  /** Context 40 and the object's 45: its overall scale. */
  readonly scale: number
  /** The object's 90: which of its values override its style's. */
  readonly overrideFlags: number
  /** The object's 41 and 42, which SCALE leaves as they are (mleader/m05). */
  readonly doglegLength: number
  readonly arrowSize: number
  /** The object's 290. */
  readonly landing: boolean
}

/**
 * The multileader style it names (DXF MLEADERSTYLE), kept with it as a
 * table's style is: nothing here creates, edits or picks one (no
 * MLEADERSTYLE), and DXFOUT writes one per name, what is not here as
 * AutoCAD 2027's Standard says it (mleader/m02).
 */
export interface MLeaderStyleData {
  readonly name: string
  /** 170: what a new one holds. */
  readonly content: "none" | "block" | "mtext"
  /** 173 */
  readonly path: MLeaderPath
  /** 290, 42, 291 and 43. */
  readonly landing: boolean
  readonly landingGap: number
  readonly dogleg: boolean
  readonly doglegLength: number
  /** 44 */
  readonly arrowSize: number
  /** 342 and 45. */
  readonly textStyleId: TextStyleId
  readonly textHeight: number
  /** 142 */
  readonly scale: number
  /** 296 */
  readonly annotative: boolean
}

/**
 * The table style a table names (DXF TABLESTYLE), kept with the table.
 *
 * WHY with each table and not in a table of the drawing: nothing here
 * creates, edits or picks a table style (no TABLESTYLE), so the drawing's
 * table would only ever hold what its tables name; DXFOUT writes one
 * TABLESTYLE per name, as an image's definition is kept with its image.
 */
export interface TableStyleData {
  readonly name: string
  /** DXF 40 and 41. */
  readonly horizontalMargin: number
  readonly verticalMargin: number
  /** DXF 70 1: the rows run up from the insertion point. */
  readonly flowsUp?: true
  /** DXF 280 and 281. */
  readonly titleSuppressed?: true
  readonly headerSuppressed?: true
  /** Its three runs, in the order DXF writes them: data, title, header. */
  readonly data: TableRowStyle
  readonly title: TableRowStyle
  readonly header: TableRowStyle
}

/** What a table style gives one kind of row: DXF 7, 140 and 170. */
export interface TableRowStyle {
  readonly textStyleId: TextStyleId
  readonly textHeight: number
  readonly alignment: MTextAttachment
}

export interface TableOverrides {
  readonly horizontalMargin?: number
  readonly verticalMargin?: number
  readonly textHeights?: {
    readonly data: number
    readonly title: number
    readonly header: number
  }
}

/**
 * One cell (DXF 171 to the end of its value). A text cell shows `text`, an
 * MTEXT contents string; a block cell (171 2) its `block`. The cell at a
 * span's top left gives it (175, 176); the cells it covers are `merged`
 * (173) and show nothing.
 */
export interface TableCell {
  readonly text?: string
  readonly block?: TableCellBlock
  readonly span?: { readonly columns: number; readonly rows: number }
  readonly merged?: true
  /** Over its row's style: DXF 91's bits 1 (170), 16 (7) and 32 (140). */
  readonly alignment?: MTextAttachment
  readonly textStyleId?: TextStyleId
  readonly textHeight?: number
  /** DXF 145, kept and written back; not applied. */
  readonly rotation?: number
  /** DXF 91's bits it carries without a value of theirs (0x40000). */
  readonly flags?: number
}

/**
 * A block cell's block (DXF 340), at `scale` (144) or, `autoFit` (174), as
 * large as fits inside the cell's margins (table/t03: 0.362067).
 */
export interface TableCellBlock {
  readonly blockId: BlockId
  readonly scale: number
  readonly autoFit: boolean
}

export interface CircleEntity extends BaseEntity, Thick {
  readonly type: "circle"
  readonly center: Vec2
  readonly radius: number
}

/**
 * A circular arc: the portion of a circle that sweeps *counter-clockwise* from
 * `startAngle` to `endAngle` (radians, measured from the positive X axis). The
 * CCW convention (AutoCAD's) keeps every operation orientation-consistent, so
 * arithmetic never has to worry about which way the arc turns.
 */
export interface ArcEntity extends BaseEntity, Thick {
  readonly type: "arc"
  readonly center: Vec2
  readonly radius: number
  readonly startAngle: number
  readonly endAngle: number
}

/**
 * An ellipse, and — with {@link EllipseEntity.startParam} — an elliptical arc.
 *
 * The model is AutoCAD's own (the DXF ELLIPSE entity): a centre, the **vector**
 * from it to the endpoint of the major axis, and the ratio of the minor axis to
 * the major one. That vector carries size and orientation together and so
 * translates, rotates, scales and mirrors exactly like a point, which is what
 * keeps the transforms trivial; loose semi-axis lengths plus an angle would
 * need a reflection to be unpicked and reassembled.
 *
 * A full ellipse and an elliptical arc are **one type**, as they are one class
 * in AutoCAD and one entity in DXF: trimming an ellipse only narrows the
 * parameter range, where trimming a circle has to produce a different object.
 */
export interface EllipseEntity extends BaseEntity {
  readonly type: "ellipse"
  readonly center: Vec2
  /** Centre → endpoint of the major axis; its length is the semi-major axis. */
  readonly majorAxis: Vec2
  /** Minor axis ÷ major axis, in `(0, 1]`. */
  readonly ratio: number
  /**
   * Start of the swept parameter range, absent on a full ellipse. The
   * parameter is DXF's: `p(t) = c + a·cos t + b·sin t`, **not** the angle the
   * point subtends at the centre. Present exactly when {@link endParam} is.
   */
  readonly startParam?: number
  /** End of the swept parameter range; the sweep runs CCW from `startParam`. */
  readonly endParam?: number
}

/** How a spline was made (SPLMETHOD): through fit points, or on control vertices. */
export type SplineMethod = "fit" | "cv"

/**
 * A spline — AutoCAD's NURBS curve. It keeps what was picked: the fit points
 * or the control vertices (`points`, read by `method`), and the settings the
 * curve is derived from. A fit spline's control vertices and knots come out of
 * `splineCurve` every time, as a dimension's measurement does. One an edit
 * left on knots of its own carries them (`knotVector`), and a CV spline its
 * weights: AutoCAD leaves a fit spline it trims a CV spline on its control
 * points and knots (`splineWithoutFitData`), and one it breaks a fit spline on
 * knots of its own (probes spline-knots/k01–k08, desktop d01, d02).
 *
 * Its points carry their own Z (spline/p200, p216), in the object coordinates
 * of {@link BaseEntity.normal}: the curve need not lie in a plane, and has no
 * elevation of its own (its start's Z is it). One that does lie in a plane is
 * kept in it, its normal that plane's and every Z the same, as AutoCAD keeps
 * it (DXF 210 and flag 8, spline/p223, spline3d/s07–s11): `splineOnItsPlane`.
 */
export interface SplineEntity extends BaseEntity {
  readonly type: "spline"
  readonly method: SplineMethod
  readonly points: readonly Vec3[]
  /** 3 for a fit spline; for a CV spline, already lowered to `points.length − 1` when fewer (`points.length` closed), or its own knots'. */
  readonly degree: number
  /** How a fit spline spaces its knots; ignored by a CV spline. */
  readonly knots: KnotParameterization
  /** Closed splines are periodic (SPLPERIODIC 1) unless a fit spline was given a closure tangent or a CV spline open knots. */
  readonly closed: boolean
  /**
   * A fit spline's derivative at its start by the raw knot parameter, as typed
   * from the first point, in space (spline3d/s10); absent, the end is free (no
   * curvature). On a closed fit spline, which only a file holds, the one
   * tangent at the closure.
   */
  readonly startTangent?: Vec3
  /** An open fit spline's derivative at its end, unit as SPLINE gives it (spline3d/s12); absent, free. */
  readonly endTangent?: Vec3
  /**
   * Its own knots (DXF 40), as AutoCAD holds them, never normalised
   * (spline-knots/k01–k08): a CV spline's `points.length + degree + 1`, or,
   * closed and periodic, the `points.length + 1` of one period; a fit
   * spline's are its curve's, whose distinct values are the parameters of its
   * fit points (Knot parameterization Custom, desktop d02), a closed one's
   * one period of them. Absent, they are derived: a fit spline's from `knots`,
   * a CV spline's 1 apart.
   */
  readonly knotVector?: readonly number[]
  /** A CV spline's weight at each control vertex (DXF 41), each above 0; absent, it is not rational. */
  readonly weights?: readonly number[]
}

/**
 * A polyline: a single connected chain of segments through an ordered list of
 * `vertices` (at least two). When `closed`, an extra segment joins the last
 * vertex back to the first, so the outline forms a loop.
 *
 * Segments are straight by default. A non-zero `bulges[i]` turns the segment
 * that *starts* at vertex `i` into a circular arc — the value is AutoCAD's
 * bulge, `tan(θ/4)` for the signed included angle θ (positive = CCW). The array
 * is optional and, when present, is indexed like {@link polylineSegments}
 * (entry `i` = segment `i`; the closing segment is the last entry). A missing
 * or all-zero array means every segment is straight.
 *
 * `widths` is indexed the same way: each segment's starting and ending width
 * (DXF 40 / 41 of the vertex it starts at), absent or all zero for none. A
 * constant width (DXF 43) is not stored apart: it is every segment's one width,
 * read with `polylineConstantWidth`.
 */
export interface PolylineEntity extends BaseEntity, Thick {
  readonly type: "polyline"
  readonly vertices: readonly Vec2[]
  readonly closed: boolean
  readonly bulges?: readonly number[]
  readonly widths?: readonly PolylineWidth[]
  /**
   * PEDIT's Ltype gen (DXF 70 flag 128): its linetype laid in one pattern
   * along its whole length, not anew on each segment. Absent means off.
   */
  readonly linetypeGeneration?: true
  /**
   * PEDIT's Fit or Spline (DXF 70 flags 2 and 4, 75): `vertices` stay the
   * frame Edit vertex walks and the grips hold, the curve is
   * `polylineCurve`'s. Absent, the polyline is as drawn.
   */
  readonly fit?: PolylineFit
}

/**
 * How a polyline is fitted. **Fit** keeps each segment's two arcs as it laid
 * them — `arcs[i]` segment `i`'s, null where straight —, as AutoCAD keeps
 * its curve-fit vertices (DXF 70 flag 1 on the VERTEX) through a vertex
 * moved, inserted or straightened, which refits nothing (pedit/p152, p153,
 * p155); its frame's bulges are 0. **Spline** keeps what was chosen
 * (SPLINETYPE, SPLINESEGS) and its curve is derived from the frame, which
 * AutoCAD refits at every edit (p58, p157, p159). `tangents` are Edit
 * vertex's (DXF 50), one per vertex, null where none is given.
 */
export type PolylineFit =
  | {
      readonly kind: "curve"
      readonly arcs: readonly (FitArcs | null)[]
      readonly tangents?: readonly (number | null)[]
    }
  | {
      readonly kind: "quadratic" | "cubic"
      /** SPLINESEGS when it was fitted: points per span, arcs through them when negative. */
      readonly segments: number
      readonly tangents?: readonly (number | null)[]
    }

/** A Fit segment's arcs: to `joint` with the first bulge, on to the next vertex with the second. */
export interface FitArcs {
  readonly joint: Vec2
  readonly bulges: readonly [first: number, second: number]
}

/** A 3D polyline's PEDIT Spline curve: straight runs, |SPLINESEGS| per span (pedit/p55, p198). */
export interface Polyline3dFit {
  readonly kind: "quadratic" | "cubic"
  readonly segments: number
}

/**
 * A 3D polyline (3DPOLY; DXF POLYLINE flag 8): straight segments through
 * `vertices`, world points each at its own Z, so it need not lie in a plane.
 * The one object whose stored points carry their Z: it has no plane, so no
 * normal, elevation or thickness. AutoCAD keeps one with a single vertex
 * (3DPOLY ended at its second prompt, 3dpoly/p05).
 */
export interface Polyline3dEntity extends BaseEntity {
  readonly type: "polyline3d"
  readonly vertices: readonly Vec3[]
  readonly closed: boolean
  /** PEDIT's Spline curve: `vertices` the frame, the curve `polyline3dCurve`'s. */
  readonly fit?: Polyline3dFit
}

/** A polyline segment's starting and ending width, never negative. */
export type PolylineWidth = readonly [start: number, end: number]

/**
 * Where a text object hangs off its {@link TextEntity.position} — AutoCAD's
 * justification. `left`/`center`/`right` sit on the baseline; `middle` centres
 * on the whole text; the two-letter codes combine a vertical (Top / Middle /
 * Bottom) and a horizontal (Left / Center / Right) alignment.
 *
 * AutoCAD's Align and Fit are absent: both are defined by *two* points rather
 * than one, so they need a different model and prompt sequence.
 */
export type TextJustify =
  | "left"
  | "center"
  | "right"
  | "middle"
  | "tl"
  | "tc"
  | "tr"
  | "ml"
  | "mc"
  | "mr"
  | "bl"
  | "bc"
  | "br"

/** Every justification, in AutoCAD's own prompt order. */
export const TEXT_JUSTIFICATIONS: readonly TextJustify[] = [
  "left",
  "center",
  "right",
  "middle",
  "tl",
  "tc",
  "tr",
  "ml",
  "mc",
  "mr",
  "bl",
  "bc",
  "br",
]

/**
 * A single line of text (AutoCAD's TEXT / DTEXT object). `position` is the
 * justification point the text hangs off — which for left-justified text is
 * also its insertion point — and `height` is the capital-letter height in
 * drawing units, so text scales with the drawing rather than the zoom.
 */
export interface TextEntity extends BaseEntity {
  readonly type: "text"
  readonly position: Vec2
  readonly value: string
  /** Capital-letter height in drawing units. */
  readonly height: number
  /** Baseline rotation, radians CCW from +X. */
  readonly rotation: number
  readonly justify: TextJustify
  readonly styleId: TextStyleId
}

/**
 * Where a multiline text object's box hangs off its
 * {@link MTextEntity.position} (DXF 71). The column also aligns every line in
 * the box, and the row decides which way the box grows as lines are added.
 */
export type MTextAttachment =
  "tl" | "tc" | "tr" | "ml" | "mc" | "mr" | "bl" | "bc" | "br"

/** The nine attachments, in the order of AutoCAD's Justify prompt. */
export const MTEXT_ATTACHMENTS: readonly MTextAttachment[] = [
  "tl",
  "tc",
  "tr",
  "ml",
  "mc",
  "mr",
  "bl",
  "bc",
  "br",
]

/**
 * DXF 73. "At least" grows a line to fit its tallest character, "Exactly" never
 * does; with no inline height changes the two space lines identically.
 */
export type LineSpacingStyle = "atLeast" | "exactly"

/**
 * A multiline text object (AutoCAD's MTEXT): paragraphs that wrap to a width,
 * as one object. Only what AutoCAD stores is kept; the lines as wrapped and the
 * size of the box come out of `mtextLayout`.
 */
export interface MTextEntity extends BaseEntity {
  readonly type: "mtext"
  readonly position: Vec2
  /**
   * AutoCAD's contents string (DXF 1/3): `\P` ends a paragraph and `\\`, `\{`
   * and `\}` are literal, so inline format codes fit the same field.
   */
  readonly contents: string
  /** Capital-letter height in drawing units. */
  readonly height: number
  /** Wrapping width (DXF 41); 0 turns word wrap off. */
  readonly width: number
  /** Radians CCW from +X. */
  readonly rotation: number
  readonly attachment: MTextAttachment
  readonly lineSpacingStyle: LineSpacingStyle
  /** Multiple of single spacing (DXF 44), 0.25 to 4. */
  readonly lineSpacingFactor: number
  readonly styleId: TextStyleId
}

/** AFLAGS: how an attribute behaves when its block is inserted. */
export interface AttributeModes {
  /** Not shown in a reference, unless ATTDISP overrides it. */
  readonly invisible: boolean
  /** A fixed value, never asked for; the reference draws the definition's. */
  readonly constant: boolean
  /** Asked for a second time before the insertion is accepted. */
  readonly verify: boolean
  /** Takes its default without asking. */
  readonly preset: boolean
  /** Cannot be moved relative to the rest of the block. */
  readonly lockPosition: boolean
}

/**
 * An attribute definition (AutoCAD's ATTDEF): a single line of text laid out
 * like a {@link TextEntity}, which a block definition turns into a question
 * asked at every insertion. Loose in the drawing it shows its {@link tag}.
 */
export interface AttributeDefinitionEntity extends BaseEntity {
  readonly type: "attdef"
  readonly position: Vec2
  readonly height: number
  readonly rotation: number
  readonly justify: TextJustify
  readonly styleId: TextStyleId
  /** Uppercase, with no spaces or `!`; names the attribute in each reference. */
  readonly tag: string
  /** What INSERT asks; empty means the tag is asked instead. */
  readonly prompt: string
  /** The default value, or the value itself when the attribute is constant. */
  readonly value: string
  readonly modes: AttributeModes
}

/**
 * One attribute of a block reference (AutoCAD's ATTRIB): a value for one of
 * the definition's tags, with the text geometry it was given at insertion.
 *
 * The geometry is kept in the **block definition's** coordinates, like the
 * definition's own entities, so the reference's placement carries it and no
 * transform has to know it exists. It is a copy, not a link: redefining the
 * block leaves existing attributes as they were, as AutoCAD does.
 */
export interface BlockAttribute {
  readonly tag: string
  readonly value: string
  readonly position: Vec2
  readonly elevation?: number
  readonly height: number
  readonly rotation: number
  readonly justify: TextJustify
  readonly styleId: TextStyleId
  readonly invisible: boolean
  readonly layerId: LayerId
  readonly color?: EntityColor
  readonly linetype?: LinetypeId
  readonly lineweight?: Lineweight
}

/** ATTMODE: whether references show their attributes. */
export type AttributeDisplay = "normal" | "on" | "off"

/**
 * What a dimension measures, and therefore how it is drawn:
 *
 * - `linear` measures along its own {@link DimensionEntity.rotation} (AutoCAD's
 *   DIMLINEAR, whose Horizontal / Vertical / Rotated options set that angle);
 * - `aligned` measures along the two origins themselves (DIMALIGNED);
 * - `angular` measures the angle the two origins subtend at a
 *   {@link DimensionEntity.vertex} (DIMANGULAR), drawing its dimension line as
 *   an arc;
 * - `radius` and `diameter` measure a circle or arc (DIMRADIUS, DIMDIAMETER),
 *   drawing a radial line or a leader instead of extension lines.
 */
export type DimensionKind =
  "linear" | "aligned" | "angular" | "radius" | "diameter"

/**
 * A dimension: one object that draws its line work, arrowheads and the
 * measurement.
 *
 * Only the *definition points* are stored — the geometry, and the measurement
 * itself, are derived from them by {@link dimensionGeometry}. That keeps the
 * text honest (it can never disagree with the points) and is why nothing here
 * is a length.
 *
 * **Not associative.** AutoCAD's DIMASSOC defaults to 2, where the dimension
 * follows the geometry it was taken from; these points are independent copies,
 * so editing the measured object does not update the dimension.
 */
export interface DimensionEntity extends BaseEntity {
  readonly type: "dimension"
  readonly kind: DimensionKind
  /** Origin of the first extension line; the centre for a radial dimension. */
  readonly first: Vec2
  /**
   * Origin of the second extension line; for a radial dimension a point on the
   * measured circle or arc, which fixes both the radius and the direction the
   * dimension line runs in.
   */
  readonly second: Vec2
  /**
   * A point the dimension line passes through (where the user placed it); for a
   * radial dimension, where the measurement text goes, and for an angular one a
   * point on the dimension arc, which fixes its radius.
   */
  readonly linePoint: Vec2
  /**
   * The angle vertex of an `angular` dimension, about which `first` and
   * `second` become the two angle endpoints. Absent for every other kind.
   */
  readonly vertex?: Vec2
  /**
   * Where the user put the measurement text with its grip (DXF 11 with flag
   * 70's 128, desktop d03-1); absent while the text keeps its default place.
   * A linear or aligned dimension draws it above its line at this point's
   * projection, an angular one at its bearing; a radial one's text follows
   * `linePoint` and never stores one.
   */
  readonly textPoint?: Vec2
  /**
   * Direction measured along, radians CCW from +X. Ignored by every kind but
   * `linear`; the others take their direction from `first`→`second`.
   */
  readonly rotation: number
  /** Replacement for the derived measurement (AutoCAD's Text option). */
  readonly text?: string
  /**
   * Absolute text angle in radians CCW (AutoCAD's Angle option). When absent
   * the text follows the dimension line, as a dimension normally reads.
   */
  readonly textAngle?: number
  readonly styleId: DimStyleId
}

/**
 * One closed ring of a hatch boundary, shaped exactly like a closed polyline:
 * an ordered list of vertices, implicitly closed, where a non-zero `bulges[i]`
 * turns the segment starting at vertex `i` into a circular arc (AutoCAD's
 * bulge, `tan(θ/4)`). A circular boundary is two semicircle bulges.
 */
export interface HatchLoop {
  readonly vertices: readonly Vec2[]
  readonly bulges?: readonly number[]
}

/**
 * A hatch: an area filled with a pattern or a solid colour.
 *
 * The boundary is stored as its own {@link loops} — copies of the points, not
 * references to the objects they were traced from — for the same reason a
 * dimension stores its definition points: **not associative** (AutoCAD's
 * HPASSOC defaults to 1, where the fill follows its boundary objects), so a
 * reference would buy nothing and could only go stale.
 *
 * Several loops make one hatch (HPSEPARATE's initial value is 0), and they are
 * filled under the even-odd rule, so a loop inside another is a hole — the
 * island behaviour of AutoCAD's Normal style.
 */
export interface HatchEntity extends BaseEntity {
  readonly type: "hatch"
  readonly loops: readonly HatchLoop[]
  /** Pattern name (HPNAME); `SOLID` means a solid fill. */
  readonly patternId: HatchPatternId
  /**
   * AutoCAD's pattern type (DXF 76): absent is Predefined, its lines the
   * registry's by name; `user` a User-defined one (`_U`), whose scale is its
   * line spacing; `custom` one from a `.pat` of its own.
   */
  readonly patternType?: HatchPatternType
  /**
   * The pattern's lines as the hatch carries them, in pattern units about
   * {@link origin} before {@link patternScale} and {@link patternAngle}: set
   * where they are not the registry's for {@link patternId} (a pattern this
   * build does not ship, a user-defined one, acad.pat's inch lines of a
   * DXF), and drawn in their place, as AutoCAD draws a hatch from the
   * definition it holds, not from its `.pat` (probe hatchpat/p05).
   */
  readonly patternLines?: readonly HatchPatternLine[]
  /** HPSCALE: multiplies every length in the pattern definition. */
  readonly patternScale: number
  /** HPANG: rotates the whole pattern, radians CCW from +X. */
  readonly patternAngle: number
  /** Where pattern generation starts (HPORIGIN); the UCS origin by default. */
  readonly origin: Vec2
  /**
   * Set on a gradient fill (DXF 450 1), which is drawn in place of the
   * pattern: {@link patternId} is then SOLID, as AutoCAD stores it.
   */
  readonly gradient?: HatchGradient
  /**
   * The linear map (`[a, b, c, d]`: x' = a·x + c·y, y' = b·x + d·y) laid over
   * the pattern about {@link origin}: what a reference that reflects or
   * stretches its block shows of a hatch inside it (probe blocks/p230). Set
   * only on what `insertFlatGeometry` gives, never stored.
   */
  readonly patternFrame?: Linear2
}

/** A block definition's name, which is also its identity, as in AutoCAD. */
export type BlockId = string

/**
 * A block definition: named geometry that can be placed any number of times by
 * an {@link InsertEntity}. Its {@link entities} are stored in the definition's
 * own coordinates and {@link basePoint} is the insertion base point — "the
 * point specified as the base point is used for subsequent insertions of the
 * block", and the point a reference rotates about.
 *
 * The name is the identity (there is no separate id), so redefining a block is
 * replacing the entry under the same name and every reference follows.
 */
export interface BlockDefinition {
  readonly id: BlockId
  readonly name: string
  readonly basePoint: Vec2
  /** The base point's Z; absent means 0. */
  readonly baseElevation?: number
  readonly entities: readonly Entity[]
  /**
   * Set on an external reference (AutoCAD's xref): the drawing it names, which
   * is never read here, so its {@link entities} are the text AutoCAD draws in
   * place of one it cannot find, `Xref <path>`. A DXF written keeps the
   * reference and its path, never that text.
   */
  readonly xref?: XrefSource
}

/** Where an external reference's drawing is, as the file that holds it says. */
export interface XrefSource {
  /** As saved (DXF group 1): absolute, relative (`.\Res\Wall Base.dwg`) or a bare name. */
  readonly path: string
  /** Overlaid rather than attached (BLOCK flag 8): a drawing referencing this one does not see it. */
  readonly overlay?: boolean
}

/**
 * How a pure function reaches the block table, which lives on the document.
 * Every helper that has to look inside a block reference takes one; without it
 * an insert degrades to its insertion point rather than pretending to be empty.
 */
export interface BlockLookup {
  (id: BlockId): BlockDefinition | undefined
  /** ATTMODE, so every expansion of a reference shows what the drawing does. */
  readonly attributeDisplay?: AttributeDisplay
}

/**
 * A block reference (AutoCAD's INSERT object): one placement of a
 * {@link BlockDefinition}, positioned, scaled and rotated as a whole.
 *
 * AutoCAD stores an X, a Y and a Z scale; -INSERT makes the Z |X| (probes
 * blocks/p203, p205: `(41 . -1.0) (42 . -1.0) (43 . 1.0)`), and with no 3D
 * here the Z is derived, never stored. A negative factor is a reflected axis:
 * one negative reflects the block (MIRROR negates X, `insertReflects`), two
 * turn it half round. Unequal magnitudes draw through the affine map
 * (`insertFlatGeometry`).
 */
export interface InsertEntity extends BaseEntity {
  readonly type: "insert"
  readonly blockId: BlockId
  /** Where the definition's base point lands. */
  readonly position: Vec2
  /** The block's X scale (DXF 41), never 0. */
  readonly scaleX: number
  /** The block's Y scale (DXF 42), never 0. */
  readonly scaleY: number
  /** Rotation about the insertion point, radians CCW from +X. */
  readonly rotation: number
  /** The values given to the block's attribute definitions, in prompt order. */
  readonly attributes?: readonly BlockAttribute[]
  /**
   * Present on an associative array (AutoCAD's ARRAY object, probe
   * arrays/p400): the block holds the source, item 1, and the other items are
   * derived from these parameters (`domain/arrays.ts`).
   */
  readonly array?: ArrayParameters
}

/** One run of a path: a straight piece, or an arc swept from `start` by `sweep` (signed). */
export type ArrayPathPiece =
  | { readonly kind: "line"; readonly a: Vec2; readonly b: Vec2 }
  | {
      readonly kind: "arc"
      readonly center: Vec2
      readonly radius: number
      readonly start: number
      readonly sweep: number
    }

/**
 * A curve ARRAYPATH runs along, from the end it starts at: its pieces in
 * that order and its length.
 */
export interface ArrayPath {
  readonly pieces: readonly ArrayPathPiece[]
  readonly length: number
  readonly closed: boolean
}

/** ARRAYRECT's grid: columns along `axis`, rows square to it, counter-clockwise. */
export interface RectangularArray {
  readonly columns: number
  readonly rows: number
  readonly colSpacing: number
  readonly rowSpacing: number
  /** How far each row rises above the one before it. */
  readonly rowElevation: number
  /** The levels stacked along the block's Z, the UCS's when it was made (arrays/p439). */
  readonly levels: number
  readonly levelSpacing: number
  /** The columns' direction, a unit vector: the UCS's X when it was made. */
  readonly axis: Vec2
}

/** ARRAYPOLAR's ring, its angles in degrees. */
export interface PolarArray {
  readonly center: Vec2
  /** The point carried round when the items are not turned. */
  readonly basePoint: Vec2
  readonly items: number
  /** The angle the items fill, in (0, 360]. */
  readonly fill: number
  readonly clockwise: boolean
  readonly rotate: boolean
  /**
   * Where the base point stood when the source went into the block: absent,
   * the base point itself. The radius grip moves the base point along its
   * ray without touching the block (a copied array shares it), so every
   * item, the source's too, is placed from here (ARRAYS-D73).
   */
  readonly sourceBase?: Vec2
}

/** ARRAYPATH's layout: how the items are spaced along the path. */
export interface PathLayout {
  readonly method: "divide" | "measure"
  readonly items: number
  /** Measure's distance between items. */
  readonly spacing: number
  readonly align: boolean
}

/**
 * What an array reference derives its items from, in its block's own
 * coordinates, so whatever moves, turns, scales or mirrors the reference
 * carries the array with it. A path array keeps the path's geometry as it was
 * and the id of the object it was (ARRAYS-D9).
 */
export type ArrayParameters =
  | (RectangularArray & { readonly kind: "rectangular" })
  | (PolarArray & { readonly kind: "polar" })
  | (PathLayout & {
      readonly kind: "path"
      readonly path: ArrayPath
      readonly pathId: EntityId
    })

export type ArrayKind = ArrayParameters["kind"]

/**
 * REGION's object: a bounded area of one plane, as the kernel's faces of
 * loops of edges (`geometry/planarRegions.ts`) in the OCS of its normal, at
 * its elevation. It has no thickness: DXF gives a region none.
 */
export interface RegionEntity extends BaseEntity {
  readonly type: "region"
  readonly faces: readonly RegionFace[]
}

/**
 * A box as made: its base centred on `position`, its length along `xAxis`,
 * its width along `normal × xAxis`, `height` along `normal`. Both axes are
 * unit.
 */
export interface BoxPrimitive {
  readonly kind: "box"
  readonly position: Vec3
  readonly xAxis: Vec3
  readonly normal: Vec3
  readonly length: number
  readonly width: number
  readonly height: number
}

/**
 * A wedge: a box's sizes, its top sloping from the base's −`xAxis` edge,
 * `height` up, down to its +`xAxis` edge.
 */
export interface WedgePrimitive extends Omit<BoxPrimitive, "kind"> {
  readonly kind: "wedge"
}

/**
 * A pyramid on a regular polygon of `sides` centred on `position`, `xAxis`
 * towards the middle of one of its sides (LIST's Rotation), rising `height`
 * along `normal` to a point, or to the same polygon `topRadius` round. Both
 * radii are the circles the polygons are inscribed in (LIST's `Inscribed`);
 * `inscribed` is the Type it was made as, which the palette reads its radii
 * by (solid/y01, d05).
 */
export interface PyramidPrimitive {
  readonly kind: "pyramid"
  readonly position: Vec3
  readonly xAxis: Vec3
  readonly normal: Vec3
  readonly sides: number
  readonly radius: number
  readonly topRadius: number
  readonly height: number
  readonly inscribed: boolean
}

/**
 * A cylinder on the circle round `position` in the plane normal to
 * `normal`, `height` along it; `xAxis` is where ACIS starts the base round
 * (its seam, solid/c01). An elliptical one is `radius` along `xAxis` and
 * `radiusY` across (its second axis' and its first's, c04), LIST's Rotation
 * the heading of `xAxis`.
 */
export interface CylinderPrimitive {
  readonly kind: "cylinder"
  readonly position: Vec3
  readonly xAxis: Vec3
  readonly normal: Vec3
  readonly radius: number
  readonly radiusY?: number
  readonly height: number
}

/**
 * A cone or a frustum: a cylinder's base narrowing, or widening, to a top
 * `topRadius` round, its larger axis' when elliptical (LIST's `Top major
 * radius`, k03), to a point at 0.
 */
export interface ConePrimitive extends Omit<CylinderPrimitive, "kind"> {
  readonly kind: "cone"
  readonly topRadius: number
}

/**
 * A sphere `radius` round `position`, its north `normal` and its X `xAxis`,
 * the UCS's when made (solid/h01, h05), where its isolines start round.
 */
export interface SpherePrimitive {
  readonly kind: "sphere"
  readonly position: Vec3
  readonly xAxis: Vec3
  readonly normal: Vec3
  readonly radius: number
}

/**
 * A torus round `position`, square to `normal`: its tube `tubeRadius` round,
 * centred `radius` out (LIST's Torus radius), across the axis when negative
 * (a lemon, r03).
 */
export interface TorusPrimitive {
  readonly kind: "torus"
  readonly position: Vec3
  readonly xAxis: Vec3
  readonly normal: Vec3
  readonly radius: number
  readonly tubeRadius: number
}

/**
 * What made a solid, kept while it is still that primitive: LIST's `Solid
 * type` and the Properties palette's Geometry (solid/p01, d03, d05).
 */
export type SolidPrimitive =
  | BoxPrimitive
  | WedgePrimitive
  | PyramidPrimitive
  | CylinderPrimitive
  | ConePrimitive
  | SpherePrimitive
  | TorusPrimitive

/**
 * A 3D solid (DXF's 3DSOLID): its boundary as the kernel's B-rep
 * (`geometry/solids.ts`), in the WCS. Like a 3D polyline it has no plane:
 * `normal` and `elevation` are never set.
 */
/**
 * What swept a solid out of a profile, which LIST shows as its `Solid type`
 * (extrude/x01; revolve/r01): EXTRUDE's height (Direction's length) and
 * taper (radians), REVOLVE's start and angle (radians) and its axis' way in
 * the WCS.
 */
export type SolidSweep =
  | {
      readonly kind: "extrusion"
      readonly height: number
      readonly taper: number
    }
  | {
      readonly kind: "revolve"
      readonly start: number
      readonly angle: number
      readonly axis: Vec3
    }

export interface Solid3dEntity extends BaseEntity {
  readonly type: "solid3d"
  readonly brep: Brep
  readonly primitive?: SolidPrimitive
  readonly sweep?: SolidSweep
}

/**
 * What a leader points from (DXF 73 and 340): the MTEXT or block reference it
 * is associated with, which it follows (`domain/leaders.ts`). AutoCAD's third
 * kind, a TOLERANCE, has no object here.
 */
export interface LeaderAnnotation {
  readonly kind: "mtext" | "block"
  readonly id: EntityId
}

/**
 * The dimension variables a leader overrides of its style (DXF's `DSTYLE`
 * xdata), the ones its Properties palette shows: DIMASZ, DIMSCALE, DIMGAP and
 * DIMTAD. Absent, the style's.
 */
export interface LeaderOverrides {
  readonly arrowSize?: number
  readonly scale?: number
  readonly textGap?: number
  /**
   * DIMTAD: whether the text sits above the leader's last line (1, ISO-25's,
   * the only placement a style here has) or centred on its end (0). Absent,
   * above.
   */
  readonly textAbove?: boolean
}

/**
 * A leader (DXF LEADER, LEADER's object): a line or a spline from an arrowhead
 * through the points picked to its annotation. Its vertices are in the OCS of
 * its normal, at its elevation, as AutoCAD stores them, the hook line
 * included: with {@link hook}, the last vertex is the point picked and the one
 * before it was added a hook's length short of it (leader/p02). The arrowhead,
 * the spline and the line under its text are derived (`leaderGeometry`).
 */
export interface LeaderEntity extends BaseEntity {
  readonly type: "leader"
  readonly vertices: readonly Vec2[]
  /** DXF 71: an arrowhead at the first vertex. */
  readonly arrow: boolean
  /** DXF 72: a spline through the vertices rather than straight segments. */
  readonly spline: boolean
  /** DXF 75: the last segment is the hook line. */
  readonly hook: boolean
  /** DXF 211, the direction of the hook and the text, radians from the OCS's X. Absent, 0. */
  readonly horizontal?: number
  readonly annotation?: LeaderAnnotation
  /** DXF 41 and 40: the size of its text when last placed, which the line under it runs. */
  readonly textWidth?: number
  readonly textHeight?: number
  /** DXF 213: the last vertex's offset from where its text puts it, after a stretch (leader/p14). */
  readonly textOffset?: Vec2
  /** DXF 212: the last vertex's offset from its block reference's insertion point (leader/p05). */
  readonly blockOffset?: Vec2
  readonly styleId: DimStyleId
  readonly overrides?: LeaderOverrides
}

export type Entity =
  | LineEntity
  | CircleEntity
  | ArcEntity
  | EllipseEntity
  | SplineEntity
  | PolylineEntity
  | Polyline3dEntity
  | TextEntity
  | MTextEntity
  | AttributeDefinitionEntity
  | DimensionEntity
  | HatchEntity
  | InsertEntity
  | RegionEntity
  | Solid3dEntity
  | PointEntity
  | Solid2dEntity
  | LeaderEntity
  | Face3dEntity
  | WipeoutEntity
  | ImageEntity
  | TableEntity
  | MLeaderEntity

export interface Bounds {
  readonly min: Vec2
  readonly max: Vec2
}
