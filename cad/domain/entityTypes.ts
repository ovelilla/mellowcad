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
import { HatchPatternId } from "./hatchPatterns"

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
 * polylines" among the ones modelled here. Absent means 0; negative extrudes
 * down.
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
  /** HPSCALE: multiplies every length in the pattern definition. */
  readonly patternScale: number
  /** HPANG: rotates the whole pattern, radians CCW from +X. */
  readonly patternAngle: number
  /** Where pattern generation starts (HPORIGIN); the UCS origin by default. */
  readonly origin: Vec2
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
 * What made a solid, kept while it is still that primitive: LIST's `Solid
 * type` and the Properties palette's Geometry (solid/p01, d03). A box rises
 * `height` along `normal` from the centre of its base, `position`; its length
 * runs along `xAxis`, its width along `normal × xAxis`. Both axes are unit.
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
 * A 3D solid (DXF's 3DSOLID): its boundary as the kernel's B-rep
 * (`geometry/solids.ts`), in the WCS. Like a 3D polyline it has no plane:
 * `normal` and `elevation` are never set.
 */
export interface Solid3dEntity extends BaseEntity {
  readonly type: "solid3d"
  readonly brep: Brep
  readonly primitive?: BoxPrimitive
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

export interface Bounds {
  readonly min: Vec2
  readonly max: Vec2
}
