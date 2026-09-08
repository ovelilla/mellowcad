import { Vec2, V } from "../geometry/Vec2"
import {
  ClosestResult,
  angleWithinSweep,
  bulgeToArc,
  closestPointOnArc,
  closestPointOnSegment,
  closestPointOnCircle,
  normalizeAngle,
  polarPoint,
  normalizeDegrees,
  segmentArcIntersection,
  segmentSegmentIntersection,
  segmentCircleIntersection,
} from "../geometry/primitives"
import { EntityColor } from "./colors"
import { DEFAULT_LAYER_ID, LayerId } from "./layers"
import { LinetypeId } from "./linetypes"
import { Lineweight } from "./lineweights"
import {
  DEFAULT_TEXT_HEIGHT,
  DEFAULT_TEXT_STYLE_ID,
  TextStyleId,
} from "./textStyles"
import {
  angleDecimalsOf,
  DEFAULT_DIM_STYLE,
  DEFAULT_DIM_STYLE_ID,
  DimStyle,
  DimStyleId,
  scaledDimStyle,
} from "./dimStyles"
import {
  DEFAULT_HATCH_ANGLE,
  DEFAULT_HATCH_PATTERN_ID,
  DEFAULT_HATCH_SCALE,
  HatchPatternId,
  HatchPatternLine,
  hatchPatternLines,
  isSolidHatchPattern,
} from "./hatchPatterns"

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
  | "polyline"
  | "text"
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
  | PolylineEntity
  | TextEntity
  | DimensionEntity
  | HatchEntity
  | InsertEntity

export interface Bounds {
  readonly min: Vec2
  readonly max: Vec2
}

let idCounter = 0

export function nextEntityId(): EntityId {
  idCounter += 1
  return `e${idCounter.toString(36)}-${Date.now().toString(36)}`
}

export function createLine(
  start: Vec2,
  end: Vec2,
  layerId: LayerId = DEFAULT_LAYER_ID,
  id: EntityId = nextEntityId()
): LineEntity {
  return { id, type: "line", layerId, start, end }
}

export function createCircle(
  center: Vec2,
  radius: number,
  layerId: LayerId = DEFAULT_LAYER_ID,
  id: EntityId = nextEntityId()
): CircleEntity {
  return { id, type: "circle", layerId, center, radius }
}

export function createArc(
  center: Vec2,
  radius: number,
  startAngle: number,
  endAngle: number,
  layerId: LayerId = DEFAULT_LAYER_ID,
  id: EntityId = nextEntityId()
): ArcEntity {
  return { id, type: "arc", layerId, center, radius, startAngle, endAngle }
}

export function createPolyline(
  vertices: readonly Vec2[],
  closed: boolean = false,
  layerId: LayerId = DEFAULT_LAYER_ID,
  bulges?: readonly number[],
  id: EntityId = nextEntityId()
): PolylineEntity {
  const normalized = normalizeBulges(bulges)
  return {
    id,
    type: "polyline",
    layerId,
    vertices: vertices.map((v) => ({ x: v.x, y: v.y })),
    closed,
    ...(normalized ? { bulges: normalized } : {}),
  }
}

/** The optional settings of a hatch; enough of them to want a bag. */
export interface HatchOptions {
  readonly patternId?: HatchPatternId
  readonly patternScale?: number
  readonly patternAngle?: number
  readonly origin?: Vec2
  readonly layerId?: LayerId
  readonly id?: EntityId
}

export function createHatch(
  loops: readonly HatchLoop[],
  options: HatchOptions = {}
): HatchEntity {
  return {
    id: options.id ?? nextEntityId(),
    type: "hatch",
    layerId: options.layerId ?? DEFAULT_LAYER_ID,
    loops: loops.map(cloneHatchLoop),
    patternId: options.patternId ?? DEFAULT_HATCH_PATTERN_ID,
    patternScale: options.patternScale ?? DEFAULT_HATCH_SCALE,
    patternAngle: options.patternAngle ?? DEFAULT_HATCH_ANGLE,
    origin: options.origin ? { ...options.origin } : { x: 0, y: 0 },
  }
}

function cloneHatchLoop(loop: HatchLoop): HatchLoop {
  return {
    vertices: loop.vertices.map((v) => ({ x: v.x, y: v.y })),
    ...(loop.bulges ? { bulges: loop.bulges.slice() } : {}),
  }
}

/** The optional settings of a block reference. */
export interface InsertOptions {
  readonly scale?: number
  readonly rotation?: number
  readonly mirrored?: boolean
  readonly layerId?: LayerId
  readonly id?: EntityId
}

export function createInsert(
  blockId: BlockId,
  position: Vec2,
  options: InsertOptions = {}
): InsertEntity {
  const scale = options.scale
  return {
    id: options.id ?? nextEntityId(),
    type: "insert",
    layerId: options.layerId ?? DEFAULT_LAYER_ID,
    blockId,
    position: { x: position.x, y: position.y },
    scale:
      Number.isFinite(scale) && (scale as number) > 0 ? (scale as number) : 1,
    rotation: Number.isFinite(options.rotation) ? options.rotation! : 0,
    ...(options.mirrored ? { mirrored: true } : {}),
  }
}

export function createBlockDefinition(
  name: string,
  basePoint: Vec2,
  entities: readonly Entity[]
): BlockDefinition {
  return {
    id: name,
    name,
    basePoint: { x: basePoint.x, y: basePoint.y },
    entities: entities.slice(),
  }
}

/**
 * How deep block references may nest before the expansion gives up. AutoCAD
 * forbids a block from referencing itself; a hand-edited file can still say so,
 * and this is what keeps that from hanging the renderer.
 */
export const MAX_BLOCK_NESTING = 8

const BLOCK_ORIGIN: Vec2 = { x: 0, y: 0 }
/** The +Y axis through the origin: reflecting across it negates X. */
const BLOCK_MIRROR_AXIS: Vec2 = { x: 0, y: 1 }

/**
 * The definition's entities placed in the drawing by one reference — a single
 * grouping level, which is what EXPLODE removes ("Removes one grouping level at
 * a time"), so a nested block comes back as a nested block.
 *
 * Objects drawn **on layer 0 inherit the reference's layer**: "if you want
 * objects in a block to inherit properties from the current layer, create them
 * on layer 0 with ByLayer properties". Anything on another layer, or carrying
 * its own override, keeps what it had. That inheritance is how a reference is
 * *displayed*, so EXPLODE turns it off (`inheritLayer: false`): the objects
 * "revert to their original properties", back onto layer 0.
 */
export function insertGeometry(
  insert: InsertEntity,
  block: BlockDefinition | undefined,
  options: { readonly inheritLayer?: boolean } = {}
): Entity[] {
  if (!block) return []
  const inheritLayer = options.inheritLayer ?? true
  return block.entities.map((entity) => {
    let placed = translateEntity(entity, V.scale(block.basePoint, -1))
    if (insert.mirrored) {
      placed = mirrorEntity(placed, BLOCK_ORIGIN, BLOCK_MIRROR_AXIS)
    }
    if (insert.scale !== 1) {
      placed = scaleEntity(placed, BLOCK_ORIGIN, insert.scale)
    }
    if (insert.rotation !== 0) {
      placed = rotateEntity(placed, BLOCK_ORIGIN, insert.rotation)
    }
    placed = translateEntity(placed, insert.position)
    return inheritLayer && placed.layerId === DEFAULT_LAYER_ID
      ? assignEntityLayer(placed, insert.layerId)
      : placed
  })
}

/**
 * Everything a reference draws, with nested references expanded away — the list
 * rendering, hit-testing and bounds all work from.
 */
export function insertFlatGeometry(
  insert: InsertEntity,
  blocks: BlockLookup,
  depth = 0
): Entity[] {
  if (depth >= MAX_BLOCK_NESTING) return []
  const out: Entity[] = []
  for (const entity of insertGeometry(insert, blocks(insert.blockId))) {
    if (entity.type === "insert") {
      out.push(...insertFlatGeometry(entity, blocks, depth + 1))
    } else {
      out.push(entity)
    }
  }
  return out
}

/**
 * A *new* hatch (fresh id) with the same pattern settings as `hatch` over other
 * loops — the building block of every `*Copy` transform.
 */
function hatchLike(
  hatch: HatchEntity,
  loops: readonly HatchLoop[],
  overrides: Pick<HatchOptions, "patternScale" | "patternAngle" | "origin"> = {}
): HatchEntity {
  return createHatch(loops, {
    patternId: hatch.patternId,
    patternScale: overrides.patternScale ?? hatch.patternScale,
    patternAngle: overrides.patternAngle ?? hatch.patternAngle,
    origin: overrides.origin ?? hatch.origin,
    layerId: hatch.layerId,
  })
}

/**
 * A *new* block reference (fresh id) of the same block, with the same scale,
 * rotation and reflection, placed somewhere else — the building block of every
 * `*Copy` transform.
 */
function insertLike(
  insert: InsertEntity,
  position: Vec2,
  overrides: Pick<InsertOptions, "scale" | "rotation" | "mirrored"> = {}
): InsertEntity {
  return createInsert(insert.blockId, position, {
    scale: overrides.scale ?? insert.scale,
    rotation: overrides.rotation ?? insert.rotation,
    mirrored: overrides.mirrored ?? insert.mirrored,
    layerId: insert.layerId,
  })
}

/** Maps every loop of a hatch through `map`, keeping its bulges. */
function mapHatchLoops(
  hatch: HatchEntity,
  map: (point: Vec2) => Vec2,
  mapBulges: (bulges: readonly number[]) => number[] = (b) => b.slice()
): HatchLoop[] {
  return hatch.loops.map((loop) => ({
    vertices: loop.vertices.map(map),
    ...(loop.bulges ? { bulges: mapBulges(loop.bulges) } : {}),
  }))
}

/**
 * The boundary loop an object contributes to a hatch, or `null` when it does
 * not enclose an area on its own. AutoCAD's Select-objects boundary accepts
 * objects "that form an enclosed area"; chaining several open objects into one
 * loop is not done here yet, so only self-closing ones qualify.
 */
export function hatchLoopFromEntity(entity: Entity): HatchLoop | null {
  switch (entity.type) {
    case "circle":
      // Two semicircles: a bulge of 1 is a half turn, so the pair traces the
      // whole circle counter-clockwise.
      return {
        vertices: [
          { x: entity.center.x + entity.radius, y: entity.center.y },
          { x: entity.center.x - entity.radius, y: entity.center.y },
        ],
        bulges: [1, 1],
      }
    case "polyline":
      if (!entity.closed || entity.vertices.length < 3) return null
      return {
        vertices: entity.vertices.map((v) => ({ x: v.x, y: v.y })),
        ...(entity.bulges ? { bulges: entity.bulges.slice() } : {}),
      }
    default:
      return null
  }
}

/**
 * The concrete geometry of a boundary loop, segment by segment. A loop always
 * closes, including the two-vertex ring a circle becomes — which is why it does
 * not go through {@link polylineSegments}, whose closing segment needs three.
 */
export function hatchLoopSegments(loop: HatchLoop): PolylineSegmentGeometry[] {
  const v = loop.vertices
  if (v.length < 2) return []
  const segments: [Vec2, Vec2][] = []
  for (let i = 0; i < v.length; i++) {
    segments.push([v[i], v[(i + 1) % v.length]])
  }
  return segmentGeometries(segments, loop.bulges)
}

/**
 * The largest number of pattern segments one hatch generates before the fill is
 * abandoned — AutoCAD's HPMAXLINES, whose initial value this is. Past it the
 * pattern is too dense to be either drawable or meaningful.
 */
export const MAX_HATCH_LINES = 100_000

/**
 * How finely a boundary arc is chopped into chords for pattern clipping: a 5°
 * facet, whose sagitta is under 0.1% of the radius. Clipping needs *one*
 * crossing convention to keep the even-odd parity honest, and mixing exact
 * circle roots with segment crossings is where that goes wrong — so every loop
 * becomes a polygon first.
 */
const HATCH_FACET_ANGLE = Math.PI / 36

/** Everything drawn for a hatch, derived from its loops and pattern. */
export interface HatchGeometry {
  /** Each boundary loop as a closed ring of points (arcs already chopped). */
  readonly rings: readonly (readonly Vec2[])[]
  /** Whether the area is a solid fill rather than a family of lines. */
  readonly solid: boolean
  /** The pattern's line work, already clipped to the boundary. */
  readonly lines: readonly [Vec2, Vec2][]
  /** True when generation stopped at {@link MAX_HATCH_LINES}. */
  readonly truncated: boolean
}

/**
 * The pattern line work of a hatch, clipped to its boundary, in **world**
 * coordinates.
 *
 * Clipping in world space rather than at paint time is what keeps this cheap:
 * a hatch's appearance does not depend on the zoom (HPSCALE is a drawing
 * scale, not a screen one), so the result is a pure function of the entity and
 * a caller may cache it per object. It is also what keeps the scene layer free
 * of any notion of clipping or patterned fill — everything downstream sees
 * ordinary segments.
 */
export function hatchGeometry(hatch: HatchEntity): HatchGeometry {
  const rings = hatch.loops
    .map(hatchLoopRing)
    .filter((ring) => ring.length >= 3)
  const solid = isSolidHatchPattern(hatch.patternId)
  if (solid || rings.length === 0) {
    return { rings, solid, lines: [], truncated: false }
  }

  const lines: [Vec2, Vec2][] = []
  let truncated = false
  for (const line of hatchPatternLines(hatch.patternId)) {
    if (truncated) break
    truncated = pushPatternFamily(lines, hatch, line, rings)
  }
  return { rings, solid, lines, truncated }
}

/** A boundary loop as a closed ring of points, arcs chopped into chords. */
function hatchLoopRing(loop: HatchLoop): Vec2[] {
  const segments = hatchLoopSegments(loop)
  const ring: Vec2[] = []
  for (const seg of segments) {
    ring.push(seg.a)
    if (seg.kind === "line") continue
    const theta = 4 * Math.atan(seg.bulge)
    const startAngle = Math.atan2(
      seg.a.y - seg.center.y,
      seg.a.x - seg.center.x
    )
    const steps = Math.max(2, Math.ceil(Math.abs(theta) / HATCH_FACET_ANGLE))
    for (let i = 1; i < steps; i++) {
      ring.push(
        polarPoint(seg.center, seg.radius, startAngle + theta * (i / steps))
      )
    }
  }
  return ring
}

/**
 * Expands one descriptor line into its family, clips each member against the
 * rings and appends the surviving runs. Returns whether the line budget ran out.
 */
function pushPatternFamily(
  out: [Vec2, Vec2][],
  hatch: HatchEntity,
  line: HatchPatternLine,
  rings: readonly (readonly Vec2[])[]
): boolean {
  const scale = hatch.patternScale
  const deltaY = line.deltaY * scale
  if (!Number.isFinite(deltaY) || Math.abs(deltaY) < 1e-9) return false

  const theta = line.angle + hatch.patternAngle
  const dir = { x: Math.cos(theta), y: Math.sin(theta) }
  const normal = { x: -dir.y, y: dir.x }
  const deltaX = line.deltaX * scale
  const dashes = line.dashes.map((d) => d * scale)
  const base = V.add(
    hatch.origin,
    rotatePoint(V.scale(line.origin, scale), { x: 0, y: 0 }, hatch.patternAngle)
  )

  // Which members of the infinite family can reach the boundary at all.
  let minU = Infinity
  let maxU = -Infinity
  for (const ring of rings) {
    for (const point of ring) {
      const u = V.dot(V.sub(point, base), normal)
      minU = Math.min(minU, u)
      maxU = Math.max(maxU, u)
    }
  }
  const lo = Math.floor(Math.min(minU, maxU) / Math.abs(deltaY)) - 1
  const hi = Math.ceil(Math.max(minU, maxU) / Math.abs(deltaY)) + 1
  const step = Math.sign(deltaY) || 1
  if (hi - lo > MAX_HATCH_LINES) return true

  for (let k = lo; k <= hi; k++) {
    const index = k * step
    const origin = V.add(
      V.add(base, V.scale(normal, index * deltaY)),
      V.scale(dir, index * deltaX)
    )
    for (const [from, to] of insideRuns(origin, dir, rings)) {
      pushDashedRun(out, origin, dir, from, to, dashes)
      if (out.length > MAX_HATCH_LINES) return true
    }
  }
  return false
}

/**
 * The parameter intervals along the infinite line `origin + t·dir` that lie
 * inside the boundary, under the even-odd rule (nested loops are holes).
 *
 * A crossing is counted with a half-open sign test, so a ring vertex sitting
 * exactly on the line is counted once when the outline crosses there and twice
 * when it merely touches — which is what keeps the parity right without any
 * special case.
 */
function insideRuns(
  origin: Vec2,
  dir: Vec2,
  rings: readonly (readonly Vec2[])[]
): [number, number][] {
  const crossings: number[] = []
  for (const ring of rings) {
    for (let i = 0; i < ring.length; i++) {
      const a = ring[i]
      const b = ring[(i + 1) % ring.length]
      const fa = V.cross(dir, V.sub(a, origin))
      const fb = V.cross(dir, V.sub(b, origin))
      const crosses = fa <= 0 ? fb > 0 : fb <= 0
      if (!crosses) continue
      const t = fa / (fa - fb)
      const point = V.lerp(a, b, t)
      crossings.push(V.dot(V.sub(point, origin), dir))
    }
  }
  crossings.sort((x, y) => x - y)
  const runs: [number, number][] = []
  for (let i = 0; i + 1 < crossings.length; i += 2) {
    if (crossings[i + 1] > crossings[i]) {
      runs.push([crossings[i], crossings[i + 1]])
    }
  }
  return runs
}

/** Emits `[from, to]` broken by the dash cycle, or whole when continuous. */
function pushDashedRun(
  out: [Vec2, Vec2][],
  origin: Vec2,
  dir: Vec2,
  from: number,
  to: number,
  dashes: readonly number[]
): void {
  const at = (t: number): Vec2 => V.add(origin, V.scale(dir, t))
  const cycle = dashes.reduce((sum, run) => sum + Math.abs(run), 0)
  if (dashes.length === 0 || cycle < 1e-9) {
    out.push([at(from), at(to)])
    return
  }
  // The dash pattern is anchored at the line's own origin, which delta-x has
  // already slid along the direction — that is how a pattern's dashes stagger.
  let t = Math.floor(from / cycle) * cycle
  while (t < to && out.length <= MAX_HATCH_LINES) {
    for (const run of dashes) {
      const next = t + Math.abs(run)
      if (run > 0) {
        const start = Math.max(t, from)
        const end = Math.min(next, to)
        if (end > start) out.push([at(start), at(end)])
      }
      t = next
      if (t >= to) break
    }
  }
}

/**
 * Whether a point lies inside the hatched area, under the same even-odd rule
 * the pattern is clipped with — so a hatch picks as the *area* it is, not as
 * the outline of its boundary.
 */
export function pointInsideHatch(hatch: HatchEntity, point: Vec2): boolean {
  let inside = false
  for (const loop of hatch.loops) {
    const ring = hatchLoopRing(loop)
    for (let i = 0; i < ring.length; i++) {
      const a = ring[i]
      const b = ring[(i + 1) % ring.length]
      if (a.y > point.y !== b.y > point.y) {
        const x = a.x + ((point.y - a.y) / (b.y - a.y)) * (b.x - a.x)
        if (x > point.x) inside = !inside
      }
    }
  }
  return inside
}

/** The optional settings of a text object; enough of them to want a bag. */
export interface TextOptions {
  readonly height?: number
  readonly rotation?: number
  readonly justify?: TextJustify
  readonly styleId?: TextStyleId
  readonly layerId?: LayerId
  readonly id?: EntityId
}

export function createText(
  position: Vec2,
  value: string,
  options: TextOptions = {}
): TextEntity {
  return {
    id: options.id ?? nextEntityId(),
    type: "text",
    layerId: options.layerId ?? DEFAULT_LAYER_ID,
    position: { x: position.x, y: position.y },
    value,
    height: options.height ?? DEFAULT_TEXT_HEIGHT,
    rotation: options.rotation ?? 0,
    justify: options.justify ?? "left",
    styleId: options.styleId ?? DEFAULT_TEXT_STYLE_ID,
  }
}

/** Returns a copy of `entity` using another text style (preserves its id). */
export function assignTextStyle(entity: Entity, styleId: TextStyleId): Entity {
  return entity.type === "text" ? { ...entity, styleId } : entity
}

/** Returns a copy of `entity` using another dimension style (preserves its id). */
export function assignDimStyle(entity: Entity, styleId: DimStyleId): Entity {
  return entity.type === "dimension" ? { ...entity, styleId } : entity
}

/**
 * A *new* text object (fresh id) with the same content and style as `text`,
 * moved to `position` — the building block of every `*Copy` transform.
 */
function textLike(
  text: TextEntity,
  position: Vec2,
  overrides: Pick<TextOptions, "height" | "rotation"> = {}
): TextEntity {
  return createText(position, text.value, {
    height: overrides.height ?? text.height,
    rotation: overrides.rotation ?? text.rotation,
    justify: text.justify,
    styleId: text.styleId,
    layerId: text.layerId,
  })
}

/**
 * Nominal advance width of one character, as a fraction of the text height.
 *
 * The engine is deliberately DOM-free, so it cannot measure glyphs the way the
 * canvas presenter can: bounds, hit-testing and box selection use this nominal
 * metric while rendering uses the real font. Close enough for a pick box, and
 * it keeps the domain pure.
 */
const TEXT_WIDTH_FACTOR = 0.6

/** Spacing between successive lines of TEXT — AutoCAD's single line spacing. */
export const TEXT_LINE_SPACING_FACTOR = 1.66

/** Nominal width of the whole string in drawing units. */
export function textWidth(text: TextEntity): number {
  return text.value.length * text.height * TEXT_WIDTH_FACTOR
}

/**
 * The four corners of a text object's box, in world coordinates and in order
 * around the outline. The box hangs off `position` according to the
 * justification, then rotates with the text.
 */
export function textCorners(text: TextEntity): Vec2[] {
  const w = textWidth(text)
  const h = text.height
  const [x0, x1] = horizontalExtent(text.justify, w)
  const [y0, y1] = verticalExtent(text.justify, h)
  const cos = Math.cos(text.rotation)
  const sin = Math.sin(text.rotation)
  return [
    [x0, y0],
    [x1, y0],
    [x1, y1],
    [x0, y1],
  ].map(([x, y]) => ({
    x: text.position.x + x * cos - y * sin,
    y: text.position.y + x * sin + y * cos,
  }))
}

/** Local X extent of the box, relative to the justification point. */
function horizontalExtent(justify: TextJustify, w: number): [number, number] {
  switch (justify) {
    case "left":
    case "tl":
    case "ml":
    case "bl":
      return [0, w]
    case "right":
    case "tr":
    case "mr":
    case "br":
      return [-w, 0]
    default:
      return [-w / 2, w / 2]
  }
}

/**
 * Local Y extent of the box, relative to the justification point. Baseline
 * justifications carry the text above the point; the Top ones below it; the
 * Middle ones straddle it.
 */
function verticalExtent(justify: TextJustify, h: number): [number, number] {
  switch (justify) {
    case "tl":
    case "tc":
    case "tr":
      return [-h, 0]
    case "middle":
    case "ml":
    case "mc":
    case "mr":
      return [-h / 2, h / 2]
    default:
      return [0, h]
  }
}

/** The box outline as four segments, for hit-testing and crossing tests. */
function textEdges(text: TextEntity): [Vec2, Vec2][] {
  const c = textCorners(text)
  return [
    [c[0], c[1]],
    [c[1], c[2]],
    [c[2], c[3]],
    [c[3], c[0]],
  ]
}

/** Whether a world point falls within the text's box (its rotation undone). */
function pointInsideText(text: TextEntity, point: Vec2): boolean {
  const cos = Math.cos(-text.rotation)
  const sin = Math.sin(-text.rotation)
  const dx = point.x - text.position.x
  const dy = point.y - text.position.y
  const x = dx * cos - dy * sin
  const y = dx * sin + dy * cos
  const [x0, x1] = horizontalExtent(text.justify, textWidth(text))
  const [y0, y1] = verticalExtent(text.justify, text.height)
  return x >= x0 && x <= x1 && y >= y0 && y <= y1
}

/**
 * Drops a bulge array that carries no arcs (undefined or all zeros) so a
 * straight polyline never stores a redundant array, and copies it otherwise.
 */
function normalizeBulges(
  bulges: readonly number[] | undefined
): readonly number[] | undefined {
  if (!bulges || bulges.every((b) => b === 0)) return undefined
  return bulges.slice()
}

/** The optional settings of a dimension; enough of them to want a bag. */
export interface DimensionOptions {
  /** Measurement direction in radians CCW; `linear` dimensions only. */
  readonly rotation?: number
  /** The angle vertex; `angular` dimensions only. */
  readonly vertex?: Vec2
  readonly text?: string
  readonly textAngle?: number
  readonly styleId?: DimStyleId
  readonly layerId?: LayerId
  readonly id?: EntityId
}

export function createDimension(
  kind: DimensionKind,
  first: Vec2,
  second: Vec2,
  linePoint: Vec2,
  options: DimensionOptions = {}
): DimensionEntity {
  return {
    id: options.id ?? nextEntityId(),
    type: "dimension",
    layerId: options.layerId ?? DEFAULT_LAYER_ID,
    kind,
    first: { x: first.x, y: first.y },
    second: { x: second.x, y: second.y },
    linePoint: { x: linePoint.x, y: linePoint.y },
    ...(options.vertex
      ? { vertex: { x: options.vertex.x, y: options.vertex.y } }
      : {}),
    rotation: options.rotation ?? 0,
    ...(options.text !== undefined ? { text: options.text } : {}),
    ...(options.textAngle !== undefined
      ? { textAngle: options.textAngle }
      : {}),
    styleId: options.styleId ?? DEFAULT_DIM_STYLE_ID,
  }
}

/** The definition points of a dimension: three, or four for an angular one. */
export interface DimensionPoints {
  readonly first: Vec2
  readonly second: Vec2
  readonly linePoint: Vec2
  readonly vertex?: Vec2
}

/**
 * Every definition point of `dim` put through `map`, including the vertex only
 * when there is one.
 *
 * The single place that knows how many points a dimension has. Every transform
 * spreads its result, because spreading the entity and naming the points by
 * hand silently drops the optional vertex — TypeScript cannot catch a field
 * that is merely inherited from `...entity`.
 */
export function mapDimensionPoints(
  dim: DimensionEntity,
  map: (point: Vec2) => Vec2
): DimensionPoints {
  return {
    first: map(dim.first),
    second: map(dim.second),
    linePoint: map(dim.linePoint),
    ...(dim.vertex ? { vertex: map(dim.vertex) } : {}),
  }
}

/**
 * A *new* dimension (fresh id) with the same settings as `dim` but different
 * definition points — the building block of every `*Copy` transform.
 */
function dimensionLike(
  dim: DimensionEntity,
  points: DimensionPoints,
  overrides: Pick<DimensionOptions, "rotation" | "textAngle"> = {}
): DimensionEntity {
  return createDimension(
    dim.kind,
    points.first,
    points.second,
    points.linePoint,
    {
      ...(points.vertex ? { vertex: points.vertex } : {}),
      rotation: overrides.rotation ?? dim.rotation,
      ...(dim.text !== undefined ? { text: dim.text } : {}),
      ...(overrides.textAngle !== undefined
        ? { textAngle: overrides.textAngle }
        : dim.textAngle !== undefined
          ? { textAngle: dim.textAngle }
          : {}),
      styleId: dim.styleId,
      layerId: dim.layerId,
    }
  )
}

/** The direction a dimension measures along, radians CCW from +X. */
export function dimensionAxisAngle(dim: DimensionEntity): number {
  if (dim.kind === "linear") return dim.rotation
  const offset = V.sub(dim.second, dim.first)
  return V.length(offset) < 1e-9 ? 0 : Math.atan2(offset.y, offset.x)
}

/** The point an angular dimension turns about; its `first` origin if unset. */
export function dimensionVertex(dim: DimensionEntity): Vec2 {
  return dim.vertex ?? dim.first
}

/** Whether a kind reports a length or an angle in radians. */
export function dimensionMeasurementUnit(
  kind: DimensionKind
): "length" | "angle" {
  return kind === "angular" ? "angle" : "length"
}

/**
 * What a dimension reports: the two origins projected onto its axis, the radius
 * (doubled for a diameter) of the circle a radial one measures, or — for an
 * angular one — the angle they subtend, **in radians**. Ask
 * {@link dimensionMeasurementUnit} which of the two a kind returns.
 */
export function dimensionMeasurement(dim: DimensionEntity): number {
  if (dim.kind === "angular") return angularFrame(dim).sweep
  const offset = V.sub(dim.second, dim.first)
  if (dim.kind === "radius") return V.length(offset)
  if (dim.kind === "diameter") return 2 * V.length(offset)
  const angle = dimensionAxisAngle(dim)
  const dir = { x: Math.cos(angle), y: Math.sin(angle) }
  return Math.abs(V.dot(offset, dir))
}

/**
 * What a dimension reads. Derived from the definition points and formatted to
 * the style's decimal places, never stored — so the number can never drift from
 * the geometry. A radial measurement carries AutoCAD's radius or diameter
 * symbol in front of it. An explicit `text` override replaces the lot, with
 * `<>` standing in for the bare measurement exactly as AutoCAD's Text option
 * does.
 */
export function dimensionText(
  dim: DimensionEntity,
  style: DimStyle = DEFAULT_DIM_STYLE
): string {
  const measured = formatMeasurement(dim, style)
  return dim.text === undefined
    ? radialPrefix(dim.kind) + measured
    : dim.text.replace(/<>/g, measured)
}

/**
 * The measurement as a string. An angular one is written in degrees with the
 * degree sign, which is part of how the value itself reads rather than a
 * prefix — so `<>` in a Text override substitutes it complete.
 *
 * Angular dimensions count their decimals with DIMADEC rather than DIMDEC, so
 * the two can be set apart: AutoCAD ships with DIMADEC 0, which is why a fresh
 * angular dimension reads whole degrees while a linear one keeps two places.
 * AutoCAD's angular unit formats (DIMAUNIT) are not modelled — only decimal
 * degrees.
 */
function formatMeasurement(dim: DimensionEntity, style: DimStyle): string {
  const measured = dimensionMeasurement(dim)
  return dimensionMeasurementUnit(dim.kind) === "angle"
    ? `${((measured * 180) / Math.PI).toFixed(angleDecimalsOf(style))}\u00b0`
    : measured.toFixed(style.decimals)
}

/**
 * The symbol AutoCAD puts in front of a radial measurement. The diameter sign
 * is written with U+00D8 rather than the typographically correct U+2300, which
 * the UI fonts do not reliably carry — a missing glyph would render as a box.
 */
function radialPrefix(kind: DimensionKind): string {
  if (kind === "radius") return "R"
  return kind === "diameter" ? "\u00d8" : ""
}

/** Everything a dimension draws, resolved from its definition points. */
export interface DimensionGeometry {
  /** Where the dimension line starts; for a radial one, its inner end. */
  readonly lineStart: Vec2
  /** Where it ends: the far extension line, or the measured arc. */
  readonly lineEnd: Vec2
  /**
   * Halfway along the dimension line — around the arc when there is one, which
   * for a wide angular sweep is nowhere near the midpoint of the chord.
   */
  readonly lineMidpoint: Vec2
  /**
   * The dimension line itself when it curves: an angular dimension draws it as
   * an arc between the extension lines, its ends being `lineStart`/`lineEnd`.
   */
  readonly arc?: {
    readonly center: Vec2
    readonly radius: number
    readonly startAngle: number
    readonly endAngle: number
  }
  /**
   * Every other straight run the dimension draws: the two extension lines of a
   * linear dimension, or a radial one's centre mark and outside arrow stub.
   */
  readonly lines: readonly (readonly [Vec2, Vec2])[]
  /** Filled arrowhead outlines, tips on the dimension line's ends. */
  readonly arrows: readonly (readonly Vec2[])[]
  /** Justification point of the measurement text (it sits above the line). */
  readonly textPosition: Vec2
  /** Text baseline angle, radians CCW — always kept readable. */
  readonly textAngle: number
  /** Capital height of the measurement text, DIMSCALE already applied. */
  readonly textHeight: number
  readonly text: string
}

/**
 * Resolves a dimension into the lines, arrowheads and text it draws.
 *
 * The dimension line is the two origins projected onto the axis through
 * `linePoint`, so dragging the location slides the whole assembly while the
 * measurement stays put. The text sits *above* the dimension line rather than
 * breaking it (ISO's DIMTAD 1) — which is also the only placement this engine
 * can honour, having no glyph metrics with which to size a gap in the line.
 */
export function dimensionGeometry(
  dim: DimensionEntity,
  style: DimStyle = DEFAULT_DIM_STYLE
): DimensionGeometry {
  const sized = scaledDimStyle(style)
  if (dim.kind === "angular") return angularGeometry(dim, sized)
  if (dim.kind === "radius" || dim.kind === "diameter")
    return radialGeometry(dim, sized)

  const angle = dimensionAxisAngle(dim)
  const dir = { x: Math.cos(angle), y: Math.sin(angle) }
  const project = (p: Vec2): Vec2 =>
    V.add(dim.linePoint, V.scale(dir, V.dot(V.sub(p, dim.linePoint), dir)))

  const lineStart = project(dim.first)
  const lineEnd = project(dim.second)
  const mid = V.midpoint(lineStart, lineEnd)

  return {
    lineStart,
    lineEnd,
    lineMidpoint: mid,
    lines: [
      extensionLine(dim.first, lineStart, sized),
      extensionLine(dim.second, lineEnd, sized),
    ],
    arrows: [
      arrowHead(lineStart, lineEnd, sized.arrowSize),
      arrowHead(lineEnd, lineStart, sized.arrowSize),
    ],
    ...textPlacement(dim, angle, mid, sized),
  }
}

/**
 * The sweep an angular dimension measures, resolved from its four definition
 * points.
 *
 * Two arcs join the endpoints around the vertex; the measured one is whichever
 * contains the location the dimension arc was placed at. That is what AutoCAD
 * means by the location "determining the direction to draw the extension
 * lines", and it is why dragging the location across a ray gives the reflex
 * angle instead.
 */
interface AngularFrame {
  readonly vertex: Vec2
  /** Distance from the vertex to the dimension arc. */
  readonly radius: number
  readonly startAngle: number
  readonly endAngle: number
  readonly sweep: number
  /** Where each angle endpoint lies: its bearing and distance from the vertex. */
  readonly firstAngle: number
  readonly secondAngle: number
}

function angularFrame(dim: DimensionEntity): AngularFrame {
  const vertex = dimensionVertex(dim)
  const firstAngle = bearingFrom(vertex, dim.first)
  const secondAngle = bearingFrom(vertex, dim.second)
  const placed = bearingFrom(vertex, dim.linePoint)
  const forward = angleWithinSweep(firstAngle, secondAngle, placed)
  const startAngle = forward ? firstAngle : secondAngle
  const endAngle = forward ? secondAngle : firstAngle
  return {
    vertex,
    radius: V.distance(vertex, dim.linePoint),
    startAngle,
    endAngle,
    sweep: normalizeAngle(endAngle - startAngle),
    firstAngle,
    secondAngle,
  }
}

/** The bearing of `to` seen from `from`, radians CCW; 0 when they coincide. */
function bearingFrom(from: Vec2, to: Vec2): number {
  const offset = V.sub(to, from)
  return V.length(offset) < 1e-9 ? 0 : Math.atan2(offset.y, offset.x)
}

/**
 * An angular dimension. "The dimension line is drawn as an arc between the
 * extension lines. The extension lines are drawn from the angle endpoints to
 * the intersection of the dimension line" — so an extension line exists only
 * where the arc has been pulled past that endpoint, and the arrowheads sit
 * tangent to the arc at its two ends.
 */
function angularGeometry(
  dim: DimensionEntity,
  sized: DimStyle
): DimensionGeometry {
  const frame = angularFrame(dim)
  const { vertex, radius, startAngle, endAngle, sweep } = frame
  const at = (angle: number) => polarPoint(vertex, radius, angle)
  const lineStart = at(startAngle)
  const lineEnd = at(endAngle)
  const midAngle = startAngle + sweep / 2

  const lines: (readonly [Vec2, Vec2])[] = []
  for (const [origin, angle] of [
    [dim.first, frame.firstAngle],
    [dim.second, frame.secondAngle],
  ] as const) {
    if (radius > V.distance(vertex, origin) + 1e-9)
      lines.push(extensionLine(origin, at(angle), sized))
  }

  // Tangents pointing out of the measured sweep, so each arrowhead lies along
  // the arc it terminates exactly as a straight dimension's lies along its line.
  const tangent = (angle: number, sign: number): Vec2 => ({
    x: -sign * Math.sin(angle),
    y: sign * Math.cos(angle),
  })

  return {
    lineStart,
    lineEnd,
    lineMidpoint: at(midAngle),
    arc: { center: vertex, radius, startAngle, endAngle },
    lines,
    arrows: [
      arrowHead(
        lineStart,
        V.add(lineStart, tangent(startAngle, 1)),
        sized.arrowSize
      ),
      arrowHead(
        lineEnd,
        V.add(lineEnd, tangent(endAngle, -1)),
        sized.arrowSize
      ),
    ],
    ...angularTextPlacement(dim, frame, midAngle, sized),
  }
}

/**
 * The measurement of an angular dimension: on the outside of the arc, reading
 * along its tangent at the midpoint.
 *
 * The glyphs grow along the text's own "up"; when keeping the number readable
 * turns that inwards, the baseline moves a text height further out so the
 * lettering still occupies the same band clear of the arc.
 */
function angularTextPlacement(
  dim: DimensionEntity,
  frame: AngularFrame,
  midAngle: number,
  sized: DimStyle
): Pick<
  DimensionGeometry,
  "textPosition" | "textAngle" | "textHeight" | "text"
> {
  const readable = readableAngle(midAngle - Math.PI / 2)
  const up = { x: -Math.sin(readable), y: Math.cos(readable) }
  const outward = { x: Math.cos(midAngle), y: Math.sin(midAngle) }
  const gap = sized.textGap + (V.dot(up, outward) >= 0 ? 0 : sized.textHeight)
  return {
    textPosition: polarPoint(frame.vertex, frame.radius + gap, midAngle),
    textAngle: dim.textAngle ?? readable,
    textHeight: sized.textHeight,
    text: dimensionText(dim, sized),
  }
}

/**
 * A radius or diameter dimension. The dimension line runs along the radius
 * through `second`: from the centre (or, for a diameter, right across from the
 * far side) out to the measured point when the text was placed inside the
 * circle, and as a leader coming in from the text when it was placed outside —
 * where AutoCAD also marks the centre it no longer reaches (DIMCEN).
 *
 * A simplification: AutoCAD's leader ends in a horizontal landing under the
 * text, whose length depends on how wide the text is. This engine has no glyph
 * metrics, so the text sits above the end of the leader, as it does on every
 * other dimension here.
 */
function radialGeometry(
  dim: DimensionEntity,
  sized: DimStyle
): DimensionGeometry {
  const center = dim.first
  const offset = V.sub(dim.second, center)
  const radius = V.length(offset)
  const dir = radius < 1e-9 ? { x: 1, y: 0 } : V.scale(offset, 1 / radius)
  const at = (distance: number): Vec2 => V.add(center, V.scale(dir, distance))

  const arcPoint = at(radius)
  const far = at(-radius)
  // The text is pinned to the radial line, so the assembly always reads
  // straight however the location has since been dragged.
  const along = V.dot(V.sub(dim.linePoint, center), dir)
  const outside = along > radius
  const textAnchor = at(outside ? along : Math.max(along, 0))

  const lines: [Vec2, Vec2][] = []
  const arrows: Vec2[][] = []
  let lineStart: Vec2

  if (outside) {
    // A leader coming in from the text, with the arrowhead against the circle.
    lineStart = textAnchor
    arrows.push(arrowHead(arcPoint, textAnchor, sized.arrowSize))
    if (dim.kind === "diameter") {
      // The opposite arrowhead sits outside too, on a stub of its own.
      const stub = at(-radius - 2 * sized.arrowSize)
      lines.push([far, stub])
      arrows.push(arrowHead(far, stub, sized.arrowSize))
    }
    if (sized.centerMark > 0)
      lines.push(...centerMark(center, sized.centerMark))
  } else {
    lineStart = dim.kind === "diameter" ? far : center
    arrows.push(arrowHead(arcPoint, lineStart, sized.arrowSize))
    if (dim.kind === "diameter")
      arrows.push(arrowHead(far, arcPoint, sized.arrowSize))
  }

  return {
    lineStart,
    lineEnd: arcPoint,
    lineMidpoint: V.midpoint(lineStart, arcPoint),
    lines,
    arrows,
    ...textPlacement(dim, Math.atan2(dir.y, dir.x), textAnchor, sized),
  }
}

/** The two crossing runs of a centre mark, aligned with the drawing axes. */
function centerMark(center: Vec2, size: number): [Vec2, Vec2][] {
  return [
    [
      { x: center.x - size, y: center.y },
      { x: center.x + size, y: center.y },
    ],
    [
      { x: center.x, y: center.y - size },
      { x: center.x, y: center.y + size },
    ],
  ]
}

/** The measurement text, sitting DIMGAP above `anchor` and never upside down. */
function textPlacement(
  dim: DimensionEntity,
  angle: number,
  anchor: Vec2,
  sized: DimStyle
): Pick<
  DimensionGeometry,
  "textPosition" | "textAngle" | "textHeight" | "text"
> {
  const readable = readableAngle(angle)
  const up = { x: -Math.sin(readable), y: Math.cos(readable) }
  return {
    textPosition: V.add(anchor, V.scale(up, sized.textGap)),
    textAngle: dim.textAngle ?? readable,
    textHeight: sized.textHeight,
    text: dimensionText(dim, sized),
  }
}

/**
 * Keeps text the right way up: a dimension is read from below or from the
 * right, so any axis angle is folded into (−90°, 90°].
 */
function readableAngle(angle: number): number {
  const folded = normalizeAngle(angle)
  return folded > Math.PI / 2 && folded <= (3 * Math.PI) / 2
    ? folded - Math.PI
    : normalizeAngle(folded + Math.PI / 2) - Math.PI / 2
}

/**
 * One extension line: it starts a gap away from the point being measured
 * (DIMEXO) and runs a little past the dimension line (DIMEXE). A degenerate
 * case — the dimension line passing through the origin — yields a zero-length
 * segment, which simply draws nothing.
 */
function extensionLine(
  origin: Vec2,
  onLine: Vec2,
  style: DimStyle
): readonly [Vec2, Vec2] {
  const offset = V.sub(onLine, origin)
  const distance = V.length(offset)
  if (distance < 1e-9) return [onLine, onLine]
  const dir = V.scale(offset, 1 / distance)
  return [
    V.add(origin, V.scale(dir, Math.min(style.extensionOffset, distance))),
    V.add(onLine, V.scale(dir, style.extensionBeyond)),
  ]
}

/**
 * A solid arrowhead: a closed triangle with its tip on `tip`, pointing away
 * from `away`. The 1:6 length-to-half-width ratio is AutoCAD's closed-filled
 * arrow.
 */
function arrowHead(tip: Vec2, away: Vec2, size: number): Vec2[] {
  const offset = V.sub(away, tip)
  const distance = V.length(offset)
  if (distance < 1e-9) return []
  const dir = V.scale(offset, 1 / distance)
  const base = V.add(tip, V.scale(dir, size))
  const half = V.scale({ x: -dir.y, y: dir.x }, size / 6)
  return [tip, V.add(base, half), V.sub(base, half)]
}

/**
 * The dimension's line work as segments, for hit-testing and bounds. A curved
 * dimension line is sampled: its chord would run straight through the vertex,
 * which is where a wide angular dimension is emphatically not drawn.
 */
function dimensionSegments(g: DimensionGeometry): [Vec2, Vec2][] {
  const runs: [Vec2, Vec2][] = g.lines.map((line) => [line[0], line[1]])
  if (!g.arc) {
    runs.push([g.lineStart, g.lineEnd])
    return runs
  }
  const { center, radius, startAngle } = g.arc
  const sweep = normalizeAngle(g.arc.endAngle - startAngle)
  let previous = g.lineStart
  for (let i = 1; i <= ARC_SAMPLES; i++) {
    const point = polarPoint(
      center,
      radius,
      startAngle + (sweep * i) / ARC_SAMPLES
    )
    runs.push([previous, point])
    previous = point
  }
  return runs
}

/** How finely a curved dimension line is sampled for picking and bounds. */
const ARC_SAMPLES = 16

function dimensionEdges(dim: DimensionEntity): [Vec2, Vec2][] {
  return dimensionSegments(dimensionGeometry(dim))
}

/** Flips the sign of every bulge — used when a reflection reverses orientation. */
function negateBulges(bulges: readonly number[]): number[] {
  return bulges.map((b) => -b)
}

/** The bulge of the segment starting at vertex `index` (0 = straight). */
export function polylineBulge(poly: PolylineEntity, index: number): number {
  return poly.bulges?.[index] ?? 0
}

/**
 * The concrete geometry of each polyline segment: a straight `line`, or an
 * `arc` when the segment carries a bulge. Ordered like {@link polylineSegments}
 * (the closing segment last, when closed). This is the single source of truth
 * that rendering, bounds, hit-testing and explode all read, so arcs are handled
 * uniformly wherever a polyline is walked segment by segment.
 */
export type PolylineSegmentGeometry =
  | { readonly kind: "line"; readonly a: Vec2; readonly b: Vec2 }
  | {
      readonly kind: "arc"
      readonly a: Vec2
      readonly b: Vec2
      readonly bulge: number
      readonly center: Vec2
      readonly radius: number
      readonly startAngle: number
      readonly endAngle: number
    }

export function polylineSegmentGeometries(
  poly: PolylineEntity
): PolylineSegmentGeometry[] {
  return segmentGeometries(polylineSegments(poly), poly.bulges)
}

/**
 * The segment geometry of a chord list — shared by polylines and by hatch
 * boundary loops, which are the same shape without being the same entity.
 */
function segmentGeometries(
  segments: readonly [Vec2, Vec2][],
  bulges: readonly number[] | undefined
): PolylineSegmentGeometry[] {
  const out: PolylineSegmentGeometry[] = []
  for (let i = 0; i < segments.length; i++) {
    const [a, b] = segments[i]
    const bulge = bulges?.[i] ?? 0
    if (bulge === 0 || V.equals(a, b)) {
      out.push({ kind: "line", a, b })
      continue
    }
    const arc = bulgeToArc(a, b, bulge)
    out.push({ kind: "arc", a, b, bulge, ...arc })
  }
  return out
}

/**
 * The polyline's segments as `[from, to]` chord pairs, including the closing
 * segment (last→first) when the polyline is closed. Note these are chords: a
 * segment with a bulge is an arc between the two points (see
 * {@link polylineSegmentGeometries}).
 */
export function polylineSegments(poly: PolylineEntity): [Vec2, Vec2][] {
  const segments: [Vec2, Vec2][] = []
  const { vertices } = poly
  for (let i = 0; i < vertices.length - 1; i++) {
    segments.push([vertices[i], vertices[i + 1]])
  }
  if (poly.closed && vertices.length > 2) {
    segments.push([vertices[vertices.length - 1], vertices[0]])
  }
  return segments
}

/** Total length of a polyline's outline (world units), arcs included. */
export function polylineLength(poly: PolylineEntity): number {
  let total = 0
  for (const seg of polylineSegmentGeometries(poly)) {
    if (seg.kind === "line") {
      total += V.distance(seg.a, seg.b)
    } else {
      let sweep = normalizeAngle(seg.endAngle - seg.startAngle)
      if (sweep < 1e-9) sweep = Math.PI * 2
      total += seg.radius * sweep
    }
  }
  return total
}

/**
 * The enclosed area of a polyline, treated as implicitly closed: the signed
 * shoelace of the vertices plus each bulged segment's circular-segment area
 * (positive when the arc bows outward, negative when it bows in), then made
 * positive. Straight closed polylines reduce to the plain polygon area.
 */
export function polylineArea(poly: PolylineEntity): number {
  const v = poly.vertices
  const n = v.length
  if (n < 3) return 0
  let signed = 0
  for (let i = 0; i < n; i++) {
    const a = v[i]
    const b = v[(i + 1) % n]
    signed += a.x * b.y - b.x * a.y
  }
  signed /= 2
  const segments = polylineSegments(poly)
  for (let i = 0; i < segments.length; i++) {
    const bulge = polylineBulge(poly, i)
    if (bulge === 0) continue
    const [p0, p1] = segments[i]
    const chord = V.distance(p0, p1)
    if (chord < 1e-12) continue
    const theta = 4 * Math.atan(bulge)
    const halfSin = Math.sin(theta / 2)
    if (Math.abs(halfSin) < 1e-12) continue
    const radiusSq = (chord * chord) / (4 * halfSin * halfSin)
    signed += (radiusSq / 2) * (theta - Math.sin(theta))
  }
  return Math.abs(signed)
}

/**
 * Returns a copy of `poly` with the vertex at `index` moved to `point`
 * (preserves its id) — the building block of polyline vertex grip editing.
 */
export function replacePolylineVertex(
  poly: PolylineEntity,
  index: number,
  point: Vec2
): PolylineEntity {
  const vertices = poly.vertices.map((v, i) =>
    i === index ? { x: point.x, y: point.y } : v
  )
  return { ...poly, vertices }
}

/**
 * Returns a copy of `poly` with a new vertex inserted at `point`, splitting
 * segment `segmentIndex` in two (preserves its id) — the building block of the
 * "add vertex" midpoint grip. Both resulting sub-segments are straight, which
 * is why the grip only offers this on straight segments.
 */
export function insertPolylineVertex(
  poly: PolylineEntity,
  segmentIndex: number,
  point: Vec2
): PolylineEntity {
  const vertices = poly.vertices.slice()
  // For the closing segment of a closed polyline `segmentIndex` is the last
  // segment, so the new vertex is appended (splice at length); for any other
  // segment it lands between the segment's two vertices.
  vertices.splice(segmentIndex + 1, 0, { x: point.x, y: point.y })
  let bulges: number[] | undefined
  if (poly.bulges) {
    bulges = poly.bulges.slice()
    bulges.splice(segmentIndex, 1, 0, 0) // both halves are straight
  }
  return createPolyline(vertices, poly.closed, poly.layerId, bulges, poly.id)
}

/**
 * Returns a copy of `poly` with the vertex at `index` removed, merging its two
 * adjacent segments into one straight segment (preserves its id). Returns
 * `null` when the removal would leave too few vertices — an open polyline needs
 * at least two, a closed one at least three.
 */
export function removePolylineVertex(
  poly: PolylineEntity,
  index: number
): PolylineEntity | null {
  const n = poly.vertices.length
  if (n <= (poly.closed ? 3 : 2)) return null
  const vertices = poly.vertices.filter((_, i) => i !== index)
  const bulges = poly.bulges ? removeBulgeForVertex(poly, index) : undefined
  return createPolyline(vertices, poly.closed, poly.layerId, bulges, poly.id)
}

/** Rebuilds the bulge array after dropping vertex `index`, straightening the
 * segment that spans the gap. */
function removeBulgeForVertex(poly: PolylineEntity, index: number): number[] {
  const bulges = (poly.bulges ?? []).slice()
  const n = poly.vertices.length
  if (poly.closed) {
    // Closed: one segment per vertex; vertex `index` joins segment (index-1)
    // (incoming) and segment `index` (outgoing). Straighten the incoming one
    // and drop the outgoing one — their merger spans the removed vertex.
    const inSeg = (index - 1 + n) % n
    bulges[inSeg] = 0
    bulges.splice(index, 1)
    return bulges
  }
  // Open: n-1 segments. Removing an end vertex drops its single segment; an
  // interior vertex merges its two segments into one straight segment.
  if (index === 0) {
    bulges.splice(0, 1)
  } else if (index === n - 1) {
    bulges.splice(n - 2, 1)
  } else {
    bulges[index - 1] = 0
    bulges.splice(index, 1)
  }
  return bulges
}

/**
 * Returns a copy of `poly` with the bulge of segment `segmentIndex` set to
 * `bulge` (preserves its id) — the building block of the arc-segment curvature
 * grip. A negligible bulge is stored as straight.
 */
export function setPolylineBulge(
  poly: PolylineEntity,
  segmentIndex: number,
  bulge: number
): PolylineEntity {
  const segCount = polylineSegments(poly).length
  const bulges = new Array<number>(segCount).fill(0)
  if (poly.bulges) {
    for (let i = 0; i < segCount; i++) bulges[i] = poly.bulges[i] ?? 0
  }
  bulges[segmentIndex] = Math.abs(bulge) < 1e-9 ? 0 : bulge
  return createPolyline(
    poly.vertices,
    poly.closed,
    poly.layerId,
    bulges,
    poly.id
  )
}

/** Returns a copy of `entity` moved onto layer `layerId` (preserves its id). */
export function assignEntityLayer(entity: Entity, layerId: LayerId): Entity {
  switch (entity.type) {
    case "line":
      return { ...entity, layerId }
    case "circle":
      return { ...entity, layerId }
    case "arc":
      return { ...entity, layerId }
    case "polyline":
      return { ...entity, layerId }
    case "text":
      return { ...entity, layerId }
    case "dimension":
      return { ...entity, layerId }
    case "hatch":
      return { ...entity, layerId }
    case "insert":
      return { ...entity, layerId }
  }
}

/**
 * Returns a copy of `entity` with an explicit colour override, or back to
 * ByLayer when `color` is undefined (preserves its id). Mirrors
 * {@link assignEntityLayer} for the colour axis.
 */
export function assignEntityColor(
  entity: Entity,
  color: EntityColor | undefined
): Entity {
  switch (entity.type) {
    case "line":
      return { ...entity, color }
    case "circle":
      return { ...entity, color }
    case "arc":
      return { ...entity, color }
    case "polyline":
      return { ...entity, color }
    case "text":
      return { ...entity, color }
    case "dimension":
      return { ...entity, color }
    case "hatch":
      return { ...entity, color }
    case "insert":
      return { ...entity, color }
  }
}

/**
 * Returns a copy of `entity` with an explicit linetype override, or back to
 * ByLayer when `linetype` is undefined (preserves its id).
 */
export function assignEntityLinetype(
  entity: Entity,
  linetype: LinetypeId | undefined
): Entity {
  switch (entity.type) {
    case "line":
      return { ...entity, linetype }
    case "circle":
      return { ...entity, linetype }
    case "arc":
      return { ...entity, linetype }
    case "polyline":
      return { ...entity, linetype }
    case "text":
      return { ...entity, linetype }
    case "dimension":
      return { ...entity, linetype }
    case "hatch":
      return { ...entity, linetype }
    case "insert":
      return { ...entity, linetype }
  }
}

/**
 * Returns a copy of `entity` with an explicit lineweight override, or back to
 * ByLayer when `lineweight` is undefined (preserves its id).
 */
export function assignEntityLineweight(
  entity: Entity,
  lineweight: Lineweight | undefined
): Entity {
  switch (entity.type) {
    case "line":
      return { ...entity, lineweight }
    case "circle":
      return { ...entity, lineweight }
    case "arc":
      return { ...entity, lineweight }
    case "polyline":
      return { ...entity, lineweight }
    case "text":
      return { ...entity, lineweight }
    case "dimension":
      return { ...entity, lineweight }
    case "hatch":
      return { ...entity, lineweight }
    case "insert":
      return { ...entity, lineweight }
  }
}

/** Returns a copy of `entity` translated by `delta` (preserves its id). */
export function translateEntity(entity: Entity, delta: Vec2): Entity {
  switch (entity.type) {
    case "line":
      return {
        ...entity,
        start: V.add(entity.start, delta),
        end: V.add(entity.end, delta),
      }
    case "circle":
      return { ...entity, center: V.add(entity.center, delta) }
    case "arc":
      return { ...entity, center: V.add(entity.center, delta) }
    case "polyline":
      return {
        ...entity,
        vertices: entity.vertices.map((v) => V.add(v, delta)),
      }
    case "text":
      return { ...entity, position: V.add(entity.position, delta) }
    case "dimension":
      return {
        ...entity,
        ...mapDimensionPoints(entity, (p) => V.add(p, delta)),
      }
    case "hatch":
      // The pattern is anchored at its origin, so that moves with the area and
      // the fill rides along instead of sliding through it.
      return {
        ...entity,
        loops: mapHatchLoops(entity, (p) => V.add(p, delta)),
        origin: V.add(entity.origin, delta),
      }
    case "insert":
      return { ...entity, position: V.add(entity.position, delta) }
  }
}

/**
 * Returns a copy of `entity` with only the points inside the stretch frame
 * displaced by `delta` — the deformation behind AutoCAD's STRETCH (preserves
 * its id). `inFrame` reports whether a point lies inside the crossing window,
 * so an endpoint or vertex caught by the frame follows the cursor while the
 * rest of the object stays put, bending the geometry.
 *
 * Circles and arcs are *not* deformed (their shape has no free vertices): they
 * move rigidly when their centre is inside the frame, matching how AutoCAD
 * treats circles. Polyline bulges are preserved, so an arc segment whose ends
 * move keeps its curvature ratio.
 */
export function stretchEntity(
  entity: Entity,
  delta: Vec2,
  inFrame: (point: Vec2) => boolean
): Entity {
  const shift = (point: Vec2): Vec2 =>
    inFrame(point) ? V.add(point, delta) : point

  switch (entity.type) {
    case "line":
      return { ...entity, start: shift(entity.start), end: shift(entity.end) }
    case "circle":
    case "arc":
      return inFrame(entity.center)
        ? { ...entity, center: V.add(entity.center, delta) }
        : entity
    case "polyline":
      return { ...entity, vertices: entity.vertices.map(shift) }
    case "text":
      // Text has no free vertices either: it rides along whole when its
      // insertion point is caught by the frame.
      return inFrame(entity.position)
        ? { ...entity, position: V.add(entity.position, delta) }
        : entity
    case "dimension": {
      // Each measured origin follows the frame on its own, so stretching the
      // geometry restates the measurement. The dimension line rides along only
      // when both origins move, otherwise it stays where it was placed.
      const moved = mapDimensionPoints(entity, shift)
      const bothMoved =
        !V.equals(moved.first, entity.first) &&
        !V.equals(moved.second, entity.second)
      return {
        ...entity,
        ...moved,
        linePoint: bothMoved
          ? V.add(entity.linePoint, delta)
          : entity.linePoint,
      }
    }
    case "hatch":
      // A boundary loop is a vertex chain like a polyline's, and the objects it
      // was traced from are being stretched by the same gesture, so following
      // the frame keeps the fill on the area the user is dragging.
      return { ...entity, loops: mapHatchLoops(entity, shift) }
    case "insert":
      // A reference has no free vertices to bend: it rides along whole when the
      // frame catches its insertion point, as a circle does with its centre.
      return inFrame(entity.position)
        ? { ...entity, position: V.add(entity.position, delta) }
        : entity
  }
}

/** Applies `source`'s ByObject overrides (if any) onto a freshly-built entity. */
export function carryOverrides(source: Entity, copy: Entity): Entity {
  const withColor = source.color ? assignEntityColor(copy, source.color) : copy
  const withLinetype = source.linetype
    ? assignEntityLinetype(withColor, source.linetype)
    : withColor
  return source.lineweight !== undefined
    ? assignEntityLineweight(withLinetype, source.lineweight)
    : withLinetype
}

/**
 * Gives `target` the general properties of `source` — layer, colour, linetype
 * and lineweight — keeping its own geometry and identity. This is MATCHPROP:
 * an override the source does *not* have is cleared on the target, so the two
 * end up drawn the same way rather than merely sharing what was set.
 */
export function matchEntityProperties(source: Entity, target: Entity): Entity {
  const onLayer = assignEntityLayer(target, source.layerId)
  const withColor = assignEntityColor(onLayer, source.color)
  const withLinetype = assignEntityLinetype(withColor, source.linetype)
  return assignEntityLineweight(withLinetype, source.lineweight)
}

/**
 * Returns a *new* entity (fresh id) that duplicates `entity` translated by
 * `delta`, on the same layer — the building block of the COPY command.
 */
export function copyEntity(entity: Entity, delta: Vec2): Entity {
  const copy: Entity = (() => {
    switch (entity.type) {
      case "line":
        return createLine(
          V.add(entity.start, delta),
          V.add(entity.end, delta),
          entity.layerId
        )
      case "circle":
        return createCircle(
          V.add(entity.center, delta),
          entity.radius,
          entity.layerId
        )
      case "arc":
        return createArc(
          V.add(entity.center, delta),
          entity.radius,
          entity.startAngle,
          entity.endAngle,
          entity.layerId
        )
      case "polyline":
        return createPolyline(
          entity.vertices.map((v) => V.add(v, delta)),
          entity.closed,
          entity.layerId,
          entity.bulges
        )
      case "text":
        return textLike(entity, V.add(entity.position, delta))
      case "dimension":
        return dimensionLike(
          entity,
          mapDimensionPoints(entity, (p) => V.add(p, delta))
        )
      case "hatch":
        return hatchLike(
          entity,
          mapHatchLoops(entity, (p) => V.add(p, delta)),
          { origin: V.add(entity.origin, delta) }
        )
      case "insert":
        return insertLike(entity, V.add(entity.position, delta))
    }
  })()
  return carryOverrides(entity, copy)
}

/** Rotates `point` about `pivot` by `radians` (counter-clockwise positive). */
export function rotatePoint(point: Vec2, pivot: Vec2, radians: number): Vec2 {
  const cos = Math.cos(radians)
  const sin = Math.sin(radians)
  const dx = point.x - pivot.x
  const dy = point.y - pivot.y
  return {
    x: pivot.x + dx * cos - dy * sin,
    y: pivot.y + dx * sin + dy * cos,
  }
}

/**
 * Returns a copy of `entity` rotated about `pivot` by `radians` (preserves its
 * id) — the in-place ROTATE command. A circle's radius is invariant under
 * rotation, so only its centre moves.
 */
export function rotateEntity(
  entity: Entity,
  pivot: Vec2,
  radians: number
): Entity {
  switch (entity.type) {
    case "line":
      return {
        ...entity,
        start: rotatePoint(entity.start, pivot, radians),
        end: rotatePoint(entity.end, pivot, radians),
      }
    case "circle":
      return { ...entity, center: rotatePoint(entity.center, pivot, radians) }
    case "arc":
      return {
        ...entity,
        center: rotatePoint(entity.center, pivot, radians),
        startAngle: entity.startAngle + radians,
        endAngle: entity.endAngle + radians,
      }
    case "polyline":
      return {
        ...entity,
        vertices: entity.vertices.map((v) => rotatePoint(v, pivot, radians)),
      }
    case "text":
      return {
        ...entity,
        position: rotatePoint(entity.position, pivot, radians),
        rotation: entity.rotation + radians,
      }
    case "dimension":
      return {
        ...entity,
        ...mapDimensionPoints(entity, (p) => rotatePoint(p, pivot, radians)),
        rotation: entity.rotation + radians,
        ...(entity.textAngle !== undefined
          ? { textAngle: entity.textAngle + radians }
          : {}),
      }
    case "hatch":
      return {
        ...entity,
        loops: mapHatchLoops(entity, (p) => rotatePoint(p, pivot, radians)),
        patternAngle: entity.patternAngle + radians,
        origin: rotatePoint(entity.origin, pivot, radians),
      }
    case "insert":
      return {
        ...entity,
        position: rotatePoint(entity.position, pivot, radians),
        rotation: entity.rotation + radians,
      }
  }
}

/**
 * Returns a *new* entity (fresh id) duplicating `entity` rotated about `pivot`
 * by `radians`, on the same layer — the building block of ROTATE's Copy option.
 */
export function rotateEntityCopy(
  entity: Entity,
  pivot: Vec2,
  radians: number
): Entity {
  const copy: Entity = (() => {
    switch (entity.type) {
      case "line":
        return createLine(
          rotatePoint(entity.start, pivot, radians),
          rotatePoint(entity.end, pivot, radians),
          entity.layerId
        )
      case "circle":
        return createCircle(
          rotatePoint(entity.center, pivot, radians),
          entity.radius,
          entity.layerId
        )
      case "arc":
        return createArc(
          rotatePoint(entity.center, pivot, radians),
          entity.radius,
          entity.startAngle + radians,
          entity.endAngle + radians,
          entity.layerId
        )
      case "polyline":
        return createPolyline(
          entity.vertices.map((v) => rotatePoint(v, pivot, radians)),
          entity.closed,
          entity.layerId,
          entity.bulges
        )
      case "text":
        return textLike(entity, rotatePoint(entity.position, pivot, radians), {
          rotation: entity.rotation + radians,
        })
      case "dimension":
        return dimensionLike(
          entity,
          mapDimensionPoints(entity, (p) => rotatePoint(p, pivot, radians)),
          {
            rotation: entity.rotation + radians,
            ...(entity.textAngle !== undefined
              ? { textAngle: entity.textAngle + radians }
              : {}),
          }
        )
      case "hatch":
        return hatchLike(
          entity,
          mapHatchLoops(entity, (p) => rotatePoint(p, pivot, radians)),
          {
            patternAngle: entity.patternAngle + radians,
            origin: rotatePoint(entity.origin, pivot, radians),
          }
        )
      case "insert":
        return insertLike(
          entity,
          rotatePoint(entity.position, pivot, radians),
          {
            rotation: entity.rotation + radians,
          }
        )
    }
  })()
  return carryOverrides(entity, copy)
}

/** Scales `point` about `base` by `factor` (uniform). */
export function scalePoint(point: Vec2, base: Vec2, factor: number): Vec2 {
  return {
    x: base.x + (point.x - base.x) * factor,
    y: base.y + (point.y - base.y) * factor,
  }
}

/**
 * Returns a copy of `entity` uniformly scaled about `base` by `factor`
 * (preserves its id) — the in-place SCALE command. A circle's radius scales
 * with the factor.
 */
export function scaleEntity(
  entity: Entity,
  base: Vec2,
  factor: number
): Entity {
  switch (entity.type) {
    case "line":
      return {
        ...entity,
        start: scalePoint(entity.start, base, factor),
        end: scalePoint(entity.end, base, factor),
      }
    case "circle":
      return {
        ...entity,
        center: scalePoint(entity.center, base, factor),
        radius: entity.radius * factor,
      }
    case "arc":
      return {
        ...entity,
        center: scalePoint(entity.center, base, factor),
        radius: entity.radius * factor,
      }
    case "polyline":
      return {
        ...entity,
        vertices: entity.vertices.map((v) => scalePoint(v, base, factor)),
      }
    case "text":
      return {
        ...entity,
        position: scalePoint(entity.position, base, factor),
        height: entity.height * factor,
      }
    case "dimension":
      // Only the definition points scale: the text and arrow sizes come from
      // the style, which AutoCAD scales through DIMSCALE rather than per object.
      return {
        ...entity,
        ...mapDimensionPoints(entity, (p) => scalePoint(p, base, factor)),
      }
    case "hatch":
      // Unlike a dimension's text, the pattern is drawing geometry: scaling the
      // area scales its spacing, so the fill keeps looking the same.
      return {
        ...entity,
        loops: mapHatchLoops(entity, (p) => scalePoint(p, base, factor)),
        patternScale: entity.patternScale * factor,
        origin: scalePoint(entity.origin, base, factor),
      }
    case "insert":
      return {
        ...entity,
        position: scalePoint(entity.position, base, factor),
        scale: entity.scale * factor,
      }
  }
}

/**
 * Returns a *new* entity (fresh id) duplicating `entity` scaled about `base` by
 * `factor`, on the same layer — the building block of SCALE's Copy option.
 */
export function scaleEntityCopy(
  entity: Entity,
  base: Vec2,
  factor: number
): Entity {
  const copy: Entity = (() => {
    switch (entity.type) {
      case "line":
        return createLine(
          scalePoint(entity.start, base, factor),
          scalePoint(entity.end, base, factor),
          entity.layerId
        )
      case "circle":
        return createCircle(
          scalePoint(entity.center, base, factor),
          entity.radius * factor,
          entity.layerId
        )
      case "arc":
        return createArc(
          scalePoint(entity.center, base, factor),
          entity.radius * factor,
          entity.startAngle,
          entity.endAngle,
          entity.layerId
        )
      case "polyline":
        return createPolyline(
          entity.vertices.map((v) => scalePoint(v, base, factor)),
          entity.closed,
          entity.layerId,
          entity.bulges
        )
      case "text":
        return textLike(entity, scalePoint(entity.position, base, factor), {
          height: entity.height * factor,
        })
      case "dimension":
        return dimensionLike(
          entity,
          mapDimensionPoints(entity, (p) => scalePoint(p, base, factor))
        )
      case "hatch":
        return hatchLike(
          entity,
          mapHatchLoops(entity, (p) => scalePoint(p, base, factor)),
          {
            patternScale: entity.patternScale * factor,
            origin: scalePoint(entity.origin, base, factor),
          }
        )
      case "insert":
        return insertLike(entity, scalePoint(entity.position, base, factor), {
          scale: entity.scale * factor,
        })
    }
  })()
  return carryOverrides(entity, copy)
}

/**
 * Reflects `point` across the infinite mirror line through `a` and `b`. A
 * degenerate line (a ≈ b) returns the point unchanged.
 */
export function mirrorPoint(point: Vec2, a: Vec2, b: Vec2): Vec2 {
  const dx = b.x - a.x
  const dy = b.y - a.y
  const lenSq = dx * dx + dy * dy
  if (lenSq < 1e-12) return point
  const t = ((point.x - a.x) * dx + (point.y - a.y) * dy) / lenSq
  const footX = a.x + t * dx
  const footY = a.y + t * dy
  return { x: 2 * footX - point.x, y: 2 * footY - point.y }
}

/**
 * Returns a copy of `entity` reflected across the mirror line through `a`,`b`
 * (preserves its id) — MIRROR when the source is erased. A circle keeps its
 * radius; only its centre reflects.
 */
export function mirrorEntity(entity: Entity, a: Vec2, b: Vec2): Entity {
  switch (entity.type) {
    case "line":
      return {
        ...entity,
        start: mirrorPoint(entity.start, a, b),
        end: mirrorPoint(entity.end, a, b),
      }
    case "circle":
      return { ...entity, center: mirrorPoint(entity.center, a, b) }
    case "arc": {
      const angles = mirrorArcAngles(entity, a, b)
      return {
        ...entity,
        center: mirrorPoint(entity.center, a, b),
        startAngle: angles.startAngle,
        endAngle: angles.endAngle,
      }
    }
    case "polyline":
      return {
        ...entity,
        vertices: entity.vertices.map((v) => mirrorPoint(v, a, b)),
        // Reflection reverses orientation, so every arc's turn flips sign.
        ...(entity.bulges ? { bulges: negateBulges(entity.bulges) } : {}),
      }
    case "text":
      // Only the insertion point reflects: AutoCAD's MIRRTEXT defaults to 0,
      // which keeps mirrored text upright and readable.
      return { ...entity, position: mirrorPoint(entity.position, a, b) }
    case "dimension":
      return {
        ...entity,
        ...mapDimensionPoints(entity, (p) => mirrorPoint(p, a, b)),
        rotation: mirrorAngle(entity.rotation, a, b),
        ...(entity.textAngle !== undefined
          ? { textAngle: mirrorAngle(entity.textAngle, a, b) }
          : {}),
      }
    case "hatch":
      return {
        ...entity,
        loops: mapHatchLoops(
          entity,
          (p) => mirrorPoint(p, a, b),
          // Reflection reverses the loop's turn, so each arc's bulge flips.
          negateBulges
        ),
        patternAngle: mirrorAngle(entity.patternAngle, a, b),
        origin: mirrorPoint(entity.origin, a, b),
      }
    case "insert":
      return { ...entity, ...mirroredInsert(entity, a, b) }
  }
}

/**
 * How a block reference reflects. AutoCAD mirrors a reference by negating its X
 * scale, which is what {@link InsertEntity.mirrored} carries here. Composing the
 * reflection with the reference's own transform gives, for either starting
 * value of `mirrored`, the same pair: the rotation reflects and turns a further
 * half turn, and the reflection flag flips — so mirroring twice is the identity.
 */
function mirroredInsert(
  insert: InsertEntity,
  a: Vec2,
  b: Vec2
): Pick<InsertEntity, "position" | "rotation" | "mirrored"> {
  return {
    position: mirrorPoint(insert.position, a, b),
    rotation: mirrorAngle(insert.rotation, a, b) + Math.PI,
    mirrored: !insert.mirrored,
  }
}

/** Reflects a direction across the mirror line through `a`,`b`. */
function mirrorAngle(angle: number, a: Vec2, b: Vec2): number {
  return 2 * Math.atan2(b.y - a.y, b.x - a.x) - angle
}

/**
 * Returns a *new* entity (fresh id) reflecting `entity` across the mirror line
 * through `a`,`b`, on the same layer — MIRROR when the source is kept.
 */
export function mirrorEntityCopy(entity: Entity, a: Vec2, b: Vec2): Entity {
  const copy: Entity = (() => {
    switch (entity.type) {
      case "line":
        return createLine(
          mirrorPoint(entity.start, a, b),
          mirrorPoint(entity.end, a, b),
          entity.layerId
        )
      case "circle":
        return createCircle(
          mirrorPoint(entity.center, a, b),
          entity.radius,
          entity.layerId
        )
      case "arc": {
        const angles = mirrorArcAngles(entity, a, b)
        return createArc(
          mirrorPoint(entity.center, a, b),
          entity.radius,
          angles.startAngle,
          angles.endAngle,
          entity.layerId
        )
      }
      case "polyline":
        return createPolyline(
          entity.vertices.map((v) => mirrorPoint(v, a, b)),
          entity.closed,
          entity.layerId,
          entity.bulges ? negateBulges(entity.bulges) : undefined
        )
      case "text":
        return textLike(entity, mirrorPoint(entity.position, a, b))
      case "dimension":
        return dimensionLike(
          entity,
          mapDimensionPoints(entity, (p) => mirrorPoint(p, a, b)),
          {
            rotation: mirrorAngle(entity.rotation, a, b),
            ...(entity.textAngle !== undefined
              ? { textAngle: mirrorAngle(entity.textAngle, a, b) }
              : {}),
          }
        )
      case "hatch":
        return hatchLike(
          entity,
          mapHatchLoops(entity, (p) => mirrorPoint(p, a, b), negateBulges),
          {
            patternAngle: mirrorAngle(entity.patternAngle, a, b),
            origin: mirrorPoint(entity.origin, a, b),
          }
        )
      case "insert": {
        const reflected = mirroredInsert(entity, a, b)
        return insertLike(entity, reflected.position, {
          rotation: reflected.rotation,
          mirrored: reflected.mirrored,
        })
      }
    }
  })()
  return carryOverrides(entity, copy)
}

/**
 * Reflecting an arc reverses its orientation, so to keep the CCW start→end
 * invariant the angles are both mirrored across the axis direction *and*
 * swapped: an angle φ reflects to `2α − φ` (α = the mirror line's direction),
 * and the swept ends trade places.
 */
function mirrorArcAngles(
  arc: ArcEntity,
  a: Vec2,
  b: Vec2
): { startAngle: number; endAngle: number } {
  const axis = Math.atan2(b.y - a.y, b.x - a.x)
  return {
    startAngle: 2 * axis - arc.endAngle,
    endAngle: 2 * axis - arc.startAngle,
  }
}

/**
 * Shortest distance (world units) from a point to an entity's outline.
 * Used for click hit-testing.
 */
export function distanceToEntity(
  entity: Entity,
  point: Vec2,
  blocks?: BlockLookup
): number {
  return closestOnEntity(entity, point, blocks).distance
}

/**
 * The point on an entity's outline nearest `point`. A block reference is
 * measured against the geometry it draws, which is why `blocks` is needed to
 * reach inside one; without it a reference answers with its insertion point,
 * the one thing about it that is knowable on its own.
 */
export function closestOnEntity(
  entity: Entity,
  point: Vec2,
  blocks?: BlockLookup
): ClosestResult {
  switch (entity.type) {
    case "line":
      return closestPointOnSegment(entity.start, entity.end, point)
    case "circle":
      return closestPointOnCircle(entity.center, entity.radius, point)
    case "arc":
      return closestPointOnArc(
        entity.center,
        entity.radius,
        entity.startAngle,
        entity.endAngle,
        point
      )
    case "polyline": {
      let best: ClosestResult = {
        point: entity.vertices[0] ?? point,
        distance: Infinity,
        t: 0,
      }
      for (const seg of polylineSegmentGeometries(entity)) {
        const candidate =
          seg.kind === "line"
            ? closestPointOnSegment(seg.a, seg.b, point)
            : closestPointOnArc(
                seg.center,
                seg.radius,
                seg.startAngle,
                seg.endAngle,
                point
              )
        if (candidate.distance < best.distance) best = candidate
      }
      return best
    }
    case "text": {
      // Text is picked by its box, filled rather than hollow: clicking on the
      // lettering itself must select it, the way AutoCAD picks an annotation.
      let best: ClosestResult = {
        point: entity.position,
        distance: Infinity,
        t: 0,
      }
      for (const [a, b] of textEdges(entity)) {
        const candidate = closestPointOnSegment(a, b, point)
        if (candidate.distance < best.distance) best = candidate
      }
      return pointInsideText(entity, point) ? { ...best, distance: 0 } : best
    }
    case "dimension": {
      // Picked by its line work, the way you grab a dimension in AutoCAD; the
      // text is not part of the pick target.
      let best: ClosestResult = {
        point: entity.linePoint,
        distance: Infinity,
        t: 0,
      }
      for (const [a, b] of dimensionEdges(entity)) {
        const candidate = closestPointOnSegment(a, b, point)
        if (candidate.distance < best.distance) best = candidate
      }
      return best
    }
    case "hatch": {
      // A hatch is an area, so it picks solid: clicking anywhere in the fill
      // selects it, not only along the boundary it was traced from.
      let best: ClosestResult = {
        point: entity.loops[0]?.vertices[0] ?? point,
        distance: Infinity,
        t: 0,
      }
      for (const loop of entity.loops) {
        for (const seg of hatchLoopSegments(loop)) {
          const candidate =
            seg.kind === "line"
              ? closestPointOnSegment(seg.a, seg.b, point)
              : closestPointOnArc(
                  seg.center,
                  seg.radius,
                  seg.startAngle,
                  seg.endAngle,
                  point
                )
          if (candidate.distance < best.distance) best = candidate
        }
      }
      return pointInsideHatch(entity, point) ? { ...best, distance: 0 } : best
    }
    case "insert": {
      let best: ClosestResult = {
        point: entity.position,
        distance: V.distance(entity.position, point),
        t: 0,
      }
      if (!blocks) return best
      for (const nested of insertFlatGeometry(entity, blocks)) {
        const candidate = closestOnEntity(nested, point, blocks)
        if (candidate.distance < best.distance) best = candidate
      }
      return best
    }
  }
}

export function entityBounds(entity: Entity, blocks?: BlockLookup): Bounds {
  switch (entity.type) {
    case "line":
      return {
        min: {
          x: Math.min(entity.start.x, entity.end.x),
          y: Math.min(entity.start.y, entity.end.y),
        },
        max: {
          x: Math.max(entity.start.x, entity.end.x),
          y: Math.max(entity.start.y, entity.end.y),
        },
      }
    case "circle":
      return {
        min: {
          x: entity.center.x - entity.radius,
          y: entity.center.y - entity.radius,
        },
        max: {
          x: entity.center.x + entity.radius,
          y: entity.center.y + entity.radius,
        },
      }
    case "arc": {
      // The extent is spanned by the two endpoints plus any cardinal point
      // (0/90/180/270°) the sweep actually passes through.
      const points = [arcStartPoint(entity), arcEndPoint(entity)]
      for (const angle of [0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2]) {
        if (angleWithinSweep(entity.startAngle, entity.endAngle, angle)) {
          points.push(polarPoint(entity.center, entity.radius, angle))
        }
      }
      let minX = Infinity
      let minY = Infinity
      let maxX = -Infinity
      let maxY = -Infinity
      for (const p of points) {
        minX = Math.min(minX, p.x)
        minY = Math.min(minY, p.y)
        maxX = Math.max(maxX, p.x)
        maxY = Math.max(maxY, p.y)
      }
      return { min: { x: minX, y: minY }, max: { x: maxX, y: maxY } }
    }
    case "polyline": {
      let minX = Infinity
      let minY = Infinity
      let maxX = -Infinity
      let maxY = -Infinity
      const include = (p: Vec2) => {
        minX = Math.min(minX, p.x)
        minY = Math.min(minY, p.y)
        maxX = Math.max(maxX, p.x)
        maxY = Math.max(maxY, p.y)
      }
      for (const seg of polylineSegmentGeometries(entity)) {
        include(seg.a)
        include(seg.b)
        if (seg.kind === "arc") {
          // An arc can bulge past its endpoints, so include any cardinal point
          // (0/90/180/270°) the sweep actually reaches.
          for (const angle of [0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2]) {
            if (angleWithinSweep(seg.startAngle, seg.endAngle, angle)) {
              include(polarPoint(seg.center, seg.radius, angle))
            }
          }
        }
      }
      if (minX === Infinity) for (const v of entity.vertices) include(v)
      return { min: { x: minX, y: minY }, max: { x: maxX, y: maxY } }
    }
    case "text": {
      const corners = textCorners(entity)
      return {
        min: {
          x: Math.min(...corners.map((c) => c.x)),
          y: Math.min(...corners.map((c) => c.y)),
        },
        max: {
          x: Math.max(...corners.map((c) => c.x)),
          y: Math.max(...corners.map((c) => c.y)),
        },
      }
    }
    case "dimension": {
      const g = dimensionGeometry(entity)
      const points = [
        entity.first,
        entity.second,
        ...dimensionSegments(g).flat(),
        g.textPosition,
      ]
      return {
        min: {
          x: Math.min(...points.map((p) => p.x)),
          y: Math.min(...points.map((p) => p.y)),
        },
        max: {
          x: Math.max(...points.map((p) => p.x)),
          y: Math.max(...points.map((p) => p.y)),
        },
      }
    }
    case "hatch": {
      let minX = Infinity
      let minY = Infinity
      let maxX = -Infinity
      let maxY = -Infinity
      for (const loop of entity.loops) {
        // The chopped ring already contains the points an arc bulges out to.
        for (const p of hatchLoopRing(loop)) {
          minX = Math.min(minX, p.x)
          minY = Math.min(minY, p.y)
          maxX = Math.max(maxX, p.x)
          maxY = Math.max(maxY, p.y)
        }
      }
      if (minX === Infinity) {
        return { min: { x: 0, y: 0 }, max: { x: 0, y: 0 } }
      }
      return { min: { x: minX, y: minY }, max: { x: maxX, y: maxY } }
    }
    case "insert": {
      const nested = blocks ? insertFlatGeometry(entity, blocks) : []
      return (
        entitiesBounds(nested, blocks) ?? {
          min: entity.position,
          max: entity.position,
        }
      )
    }
  }
}

/**
 * Where an entity sits in the paint order: lower is drawn first, and therefore
 * further back. Only hatches move — HPDRAWORDER's initial value is 3, "send
 * behind boundary", so a fill never paints over the outline it was traced from
 * and a click on that outline picks the outline. There is no per-object draw
 * order here, so "behind its boundary" is approximated by "behind everything",
 * which is the same thing for every drawing a single hatch appears in.
 */
export function entityDrawOrder(entity: Entity): number {
  return entity.type === "hatch" ? 0 : 1
}

/** The combined extent of several entities, or `null` when there are none. */
export function entitiesBounds(
  entities: Iterable<Entity>,
  blocks?: BlockLookup
): Bounds | null {
  let minX = Infinity
  let minY = Infinity
  let maxX = -Infinity
  let maxY = -Infinity
  for (const entity of entities) {
    const bounds = entityBounds(entity, blocks)
    minX = Math.min(minX, bounds.min.x)
    minY = Math.min(minY, bounds.min.y)
    maxX = Math.max(maxX, bounds.max.x)
    maxY = Math.max(maxY, bounds.max.y)
  }
  if (minX === Infinity) return null
  return { min: { x: minX, y: minY }, max: { x: maxX, y: maxY } }
}

export function lineMidpoint(line: LineEntity): Vec2 {
  return V.midpoint(line.start, line.end)
}

export function lineLength(line: LineEntity): number {
  return V.distance(line.start, line.end)
}

/**
 * Direction angle of a line in degrees, measured counter-clockwise from the
 * positive X axis and normalised to the `[0, 360)` range (AutoCAD convention).
 */
export function lineAngleDegrees(line: LineEntity): number {
  return normalizeDegrees(
    (Math.atan2(line.end.y - line.start.y, line.end.x - line.start.x) * 180) /
      Math.PI
  )
}

export function circleCircumference(circle: CircleEntity): number {
  return 2 * Math.PI * circle.radius
}

export function circleArea(circle: CircleEntity): number {
  return Math.PI * circle.radius * circle.radius
}

/** The arc's start point (at `startAngle`). */
export function arcStartPoint(arc: ArcEntity): Vec2 {
  return polarPoint(arc.center, arc.radius, arc.startAngle)
}

/** The arc's end point (at `endAngle`). */
export function arcEndPoint(arc: ArcEntity): Vec2 {
  return polarPoint(arc.center, arc.radius, arc.endAngle)
}

/** The arc's swept angle (radians), always positive in `(0, 2π]`. */
export function arcSweepAngle(arc: ArcEntity): number {
  const sweep = normalizeAngle(arc.endAngle - arc.startAngle)
  return sweep < 1e-9 ? Math.PI * 2 : sweep
}

/** The point at the middle of the arc's sweep. */
export function arcMidpoint(arc: ArcEntity): Vec2 {
  return polarPoint(
    arc.center,
    arc.radius,
    arc.startAngle + arcSweepAngle(arc) / 2
  )
}

/** The arc's length (world units): `radius × sweep`. */
export function arcLength(arc: ArcEntity): number {
  return arc.radius * arcSweepAngle(arc)
}

/** A geometry value that can be retyped directly on a selected entity. */
export type EntityProperty =
  | "length"
  | "angle"
  | "startX"
  | "startY"
  | "endX"
  | "endY"
  | "radius"
  | "diameter"
  | "centerX"
  | "centerY"
  | "startAngle"
  | "endAngle"
  | "totalAngle"
  | "positionX"
  | "positionY"
  | "textHeight"
  | "rotation"
  | "dimensionRotation"
  | "patternScale"
  | "patternAngle"
  | "insertScale"

/**
 * Rebuilds an entity with one geometry value replaced, following AutoCAD's
 * Properties palette: a line keeps its start point when you retype its length
 * or angle, a circle keeps its centre when you retype its radius. Angles are in
 * degrees, CCW from +X. Returns null when the value doesn't apply to the entity
 * or would degenerate it.
 */
export function applyEntityProperty(
  entity: Entity,
  property: EntityProperty,
  value: number
): Entity | null {
  if (!Number.isFinite(value)) return null
  switch (entity.type) {
    case "line":
      return applyLineProperty(entity, property, value)
    case "circle":
      return applyCircleProperty(entity, property, value)
    case "arc":
      return applyArcProperty(entity, property, value)
    case "text":
      return applyTextProperty(entity, property, value)
    case "dimension":
      // Only the measurement direction is a value: the definition points are
      // edited with grips and the measurement itself is derived, so AutoCAD
      // shows it read-only too.
      return property === "dimensionRotation" && entity.kind === "linear"
        ? { ...entity, rotation: toRadians(value) }
        : null
    case "hatch":
      // The pattern's scale and angle are AutoCAD's editable hatch rows; the
      // boundary is geometry the palette has no way to retype.
      if (property === "patternScale") {
        return value > 0 ? { ...entity, patternScale: value } : null
      }
      if (property === "patternAngle") {
        return { ...entity, patternAngle: toRadians(value) }
      }
      return null
    case "polyline":
      return null
    case "insert":
      return applyInsertProperty(entity, property, value)
  }
}

const toRadians = (degrees: number) => (degrees * Math.PI) / 180

function applyLineProperty(
  line: LineEntity,
  property: EntityProperty,
  value: number
): LineEntity | null {
  const moved = (start: Vec2, end: Vec2): LineEntity | null =>
    V.equals(start, end) ? null : { ...line, start, end }

  switch (property) {
    case "length":
      return value <= 0
        ? null
        : {
            ...line,
            end: polarPoint(
              line.start,
              value,
              toRadians(lineAngleDegrees(line))
            ),
          }
    case "angle":
      return {
        ...line,
        end: polarPoint(line.start, lineLength(line), toRadians(value)),
      }
    case "startX":
      return moved({ x: value, y: line.start.y }, line.end)
    case "startY":
      return moved({ x: line.start.x, y: value }, line.end)
    case "endX":
      return moved(line.start, { x: value, y: line.end.y })
    case "endY":
      return moved(line.start, { x: line.end.x, y: value })
    default:
      return null
  }
}

function applyCircleProperty(
  circle: CircleEntity,
  property: EntityProperty,
  value: number
): CircleEntity | null {
  switch (property) {
    case "radius":
      return value > 0 ? { ...circle, radius: value } : null
    case "diameter":
      return value > 0 ? { ...circle, radius: value / 2 } : null
    case "centerX":
      return { ...circle, center: { x: value, y: circle.center.y } }
    case "centerY":
      return { ...circle, center: { x: circle.center.x, y: value } }
    default:
      return null
  }
}

function applyArcProperty(
  arc: ArcEntity,
  property: EntityProperty,
  value: number
): ArcEntity | null {
  switch (property) {
    case "radius":
      return value > 0 ? { ...arc, radius: value } : null
    case "centerX":
      return { ...arc, center: { x: value, y: arc.center.y } }
    case "centerY":
      return { ...arc, center: { x: arc.center.x, y: value } }
    case "startAngle":
      return { ...arc, startAngle: normalizeAngle(toRadians(value)) }
    case "endAngle":
      return { ...arc, endAngle: normalizeAngle(toRadians(value)) }
    case "totalAngle":
      // A sweep is CCW start→end, so a full turn lands back on the start angle.
      return value > 0 && value <= 360
        ? {
            ...arc,
            endAngle: normalizeAngle(arc.startAngle + toRadians(value)),
          }
        : null
    default:
      return null
  }
}

function applyTextProperty(
  text: TextEntity,
  property: EntityProperty,
  value: number
): TextEntity | null {
  switch (property) {
    case "positionX":
      return { ...text, position: { x: value, y: text.position.y } }
    case "positionY":
      return { ...text, position: { x: text.position.x, y: value } }
    case "textHeight":
      return value > 0 ? { ...text, height: value } : null
    case "rotation":
      return { ...text, rotation: toRadians(value) }
    default:
      return null
  }
}

function applyInsertProperty(
  insert: InsertEntity,
  property: EntityProperty,
  value: number
): InsertEntity | null {
  switch (property) {
    case "positionX":
      return { ...insert, position: { x: value, y: insert.position.y } }
    case "positionY":
      return { ...insert, position: { x: insert.position.x, y: value } }
    case "insertScale":
      return value > 0 ? { ...insert, scale: value } : null
    case "rotation":
      return { ...insert, rotation: toRadians(value) }
    default:
      return null
  }
}

function pointInRect(p: Vec2, min: Vec2, max: Vec2): boolean {
  return p.x >= min.x && p.x <= max.x && p.y >= min.y && p.y <= max.y
}

function rectEdges(min: Vec2, max: Vec2): [Vec2, Vec2][] {
  const tl = { x: min.x, y: max.y }
  const tr = { x: max.x, y: max.y }
  const br = { x: max.x, y: min.y }
  const bl = { x: min.x, y: min.y }
  return [
    [tl, tr],
    [tr, br],
    [br, bl],
    [bl, tl],
  ]
}

/**
 * True when the entire entity lies within the axis-aligned rectangle
 * `min`..`max`. This is AutoCAD's *window* selection rule (drag left→right):
 * only fully-enclosed objects match.
 */
export function entityWithinRect(
  entity: Entity,
  min: Vec2,
  max: Vec2,
  blocks?: BlockLookup
): boolean {
  const b = entityBounds(entity, blocks)
  return (
    b.min.x >= min.x && b.min.y >= min.y && b.max.x <= max.x && b.max.y <= max.y
  )
}

/**
 * True when the entity's outline crosses the boundary of the rectangle
 * `min`..`max` (i.e. it is partially inside). Combined with
 * {@link entityWithinRect} this yields AutoCAD's *crossing* selection rule
 * (drag right→left): objects inside or touching the box match.
 */
export function entityCrossesRect(
  entity: Entity,
  min: Vec2,
  max: Vec2,
  blocks?: BlockLookup
): boolean {
  const edges = rectEdges(min, max)
  switch (entity.type) {
    case "line": {
      if (pointInRect(entity.start, min, max)) return true
      if (pointInRect(entity.end, min, max)) return true
      for (const [e1, e2] of edges) {
        if (segmentSegmentIntersection(entity.start, entity.end, e1, e2)) {
          return true
        }
      }
      return false
    }
    case "circle": {
      for (const [e1, e2] of edges) {
        if (
          segmentCircleIntersection(e1, e2, entity.center, entity.radius)
            .length > 0
        ) {
          return true
        }
      }
      return false
    }
    case "arc": {
      if (pointInRect(arcStartPoint(entity), min, max)) return true
      if (pointInRect(arcEndPoint(entity), min, max)) return true
      for (const [e1, e2] of edges) {
        if (
          segmentArcIntersection(
            e1,
            e2,
            entity.center,
            entity.radius,
            entity.startAngle,
            entity.endAngle
          ).length > 0
        ) {
          return true
        }
      }
      return false
    }
    case "polyline": {
      for (const v of entity.vertices) {
        if (pointInRect(v, min, max)) return true
      }
      for (const seg of polylineSegmentGeometries(entity)) {
        for (const [e1, e2] of edges) {
          if (seg.kind === "line") {
            if (segmentSegmentIntersection(seg.a, seg.b, e1, e2)) return true
          } else if (
            segmentArcIntersection(
              e1,
              e2,
              seg.center,
              seg.radius,
              seg.startAngle,
              seg.endAngle
            ).length > 0
          ) {
            return true
          }
        }
      }
      return false
    }
    case "text": {
      for (const [a, b] of textEdges(entity)) {
        if (pointInRect(a, min, max)) return true
        for (const [e1, e2] of edges) {
          if (segmentSegmentIntersection(a, b, e1, e2)) return true
        }
      }
      return false
    }
    case "dimension": {
      for (const [a, b] of dimensionEdges(entity)) {
        if (pointInRect(a, min, max) || pointInRect(b, min, max)) return true
        for (const [e1, e2] of edges) {
          if (segmentSegmentIntersection(a, b, e1, e2)) return true
        }
      }
      return false
    }
    case "hatch": {
      // A box drawn wholly inside the fill still crosses it: the hatch is the
      // area, not just its outline.
      for (const corner of [min, max, { x: min.x, y: max.y }]) {
        if (pointInsideHatch(entity, corner)) return true
      }
      for (const loop of entity.loops) {
        const ring = hatchLoopRing(loop)
        for (let i = 0; i < ring.length; i++) {
          const a = ring[i]
          const b = ring[(i + 1) % ring.length]
          if (pointInRect(a, min, max)) return true
          for (const [e1, e2] of edges) {
            if (segmentSegmentIntersection(a, b, e1, e2)) return true
          }
        }
      }
      return false
    }
    case "insert": {
      if (pointInRect(entity.position, min, max)) return true
      if (!blocks) return false
      for (const nested of insertFlatGeometry(entity, blocks)) {
        if (entityCrossesRect(nested, min, max, blocks)) return true
      }
      return false
    }
  }
}
