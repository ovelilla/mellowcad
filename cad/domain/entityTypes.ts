import { Vec2 } from "../geometry/Vec2"
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
  | "polyline"
  | "text"
  | "mtext"
  | "dimension"
  | "hatch"
  | "insert"

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
}

export interface LineEntity extends BaseEntity {
  readonly type: "line"
  readonly start: Vec2
  readonly end: Vec2
}

export interface CircleEntity extends BaseEntity {
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
export interface ArcEntity extends BaseEntity {
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
 */
export interface PolylineEntity extends BaseEntity {
  readonly type: "polyline"
  readonly vertices: readonly Vec2[]
  readonly closed: boolean
  readonly bulges?: readonly number[]
}

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
  readonly entities: readonly Entity[]
}

/**
 * How a pure function reaches the block table, which lives on the document.
 * Every helper that has to look inside a block reference takes one; without it
 * an insert degrades to its insertion point rather than pretending to be empty.
 */
export type BlockLookup = (id: BlockId) => BlockDefinition | undefined

/**
 * A block reference (AutoCAD's INSERT object): one placement of a
 * {@link BlockDefinition}, positioned, scaled and rotated as a whole.
 *
 * **Uniform scale only.** AutoCAD stores an X, Y and Z scale; unequal ones turn
 * a circle into an ellipse and an arc into an elliptical arc — objects this
 * engine does not have, and which AutoCAD itself warns "might explode into
 * unexpected objects". {@link mirrored} carries the one non-uniform case that
 * matters, a negative X scale, which is how MIRROR reflects a reference.
 */
export interface InsertEntity extends BaseEntity {
  readonly type: "insert"
  readonly blockId: BlockId
  /** Where the definition's base point lands. */
  readonly position: Vec2
  /** Uniform scale factor; always positive. */
  readonly scale: number
  /** Rotation about the insertion point, radians CCW from +X. */
  readonly rotation: number
  /** Reflected across its own Y axis before rotating (a negative X scale). */
  readonly mirrored?: boolean
}

export type Entity =
  | LineEntity
  | CircleEntity
  | ArcEntity
  | EllipseEntity
  | PolylineEntity
  | TextEntity
  | MTextEntity
  | DimensionEntity
  | HatchEntity
  | InsertEntity

export interface Bounds {
  readonly min: Vec2
  readonly max: Vec2
}
