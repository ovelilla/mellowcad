import { Vec2 } from "../../geometry/Vec2"
import { DocumentReader } from "../../domain/Document"
import { Entity, EntityId } from "../../domain/entities"

/**
 * The kinds of snap the engine understands. Only a subset is implemented today,
 * but the type is exhaustive so new providers can be added without touching the
 * rest of the system. This mirrors the object-snap ("OSNAP") vocabulary of
 * classic CAD tools.
 */
export enum SnapType {
  Endpoint = "endpoint",
  Midpoint = "midpoint",
  Center = "center",
  Intersection = "intersection",
  /**
   * The point where two entities *would* meet if one or both were extended —
   * AutoCAD's "Apparent Intersection". Distinct from {@link Intersection},
   * which requires the geometries to actually cross.
   */
  ApparentIntersection = "apparentIntersection",
  Perpendicular = "perpendicular",
  Tangent = "tangent",
  /** The point a text object hangs off — AutoCAD's "Insertion". */
  Insertion = "insertion",
  /**
   * A point on the imaginary prolongation of a line, beyond its endpoints —
   * AutoCAD's "Extension". Lets a new point land on the line's extension.
   */
  Extension = "extension",
  /**
   * A point that keeps the segment being drawn *parallel* to an existing line —
   * AutoCAD's "Parallel". Needs a base point (the anchor), so it only offers
   * candidates while a point is pending.
   */
  Parallel = "parallel",
  /** The 0°/90°/180°/270° cardinal points of a circle. */
  Quadrant = "quadrant",
  Nearest = "nearest",
}

/** A single snap candidate produced by a provider. */
export interface SnapCandidate {
  readonly type: SnapType
  /** The snapped point, in world coordinates. */
  readonly point: Vec2
  /** Entities that produced this snap (for highlighting / debugging). */
  readonly sourceIds?: readonly EntityId[]
  /**
   * World distance the engine should use to decide whether this snap engages,
   * instead of the distance from the cursor to {@link point}. Perpendicular and
   * tangent set it to the distance from the cursor to the *source entity*, so
   * they engage while hovering anywhere over that line/circle (the snapped
   * point being the foot/tangent, often far from the cursor) — matching AutoCAD.
   */
  readonly pickDistance?: number
  /**
   * True when the snap is derived from provisional, moving geometry — the
   * rubber-band being drawn. Such points still attract the cursor, but must not
   * be *acquired* as object-snap-tracking references (you cannot pick up a
   * reference off a point that is still moving), matching AutoCAD.
   */
  readonly transient?: boolean
}

/**
 * Transient geometry the active tool is currently drawing (e.g. a line tool's
 * rubber-band segment) that is *not yet* committed to the document. Providers
 * treat it like real geometry so object snaps — chiefly intersection — engage
 * against the segment being drawn, exactly like AutoCAD.
 */
export type ConstructionGeometry = {
  readonly kind: "segment"
  readonly a: Vec2
  readonly b: Vec2
}

/** The resolved snap the engine hands to tools and the scene builder. */
export interface SnapResult extends SnapCandidate {
  /** Distance from the cursor to the snap point, in screen pixels. */
  readonly screenDistance: number
}

/**
 * Context passed to every provider. Providers get the raw world cursor plus a
 * `worldTolerance` (the screen pixel tolerance already converted to world units
 * at the current zoom) so they can do fast distance comparisons in world space.
 * The document is read-only: providers observe, they never mutate.
 */
export interface SnapContext {
  readonly document: DocumentReader
  /**
   * The geometry object snaps see: every entity in the drawing, with each block
   * reference replaced by the objects it draws (AutoCAD snaps to the geometry
   * inside a block). Built once per resolve, so providers share the work.
   * Visibility is still each provider's own check, as the layers are real.
   */
  readonly entities: readonly Entity[]
  readonly worldCursor: Vec2
  readonly worldTolerance: number
  /**
   * The point the current operation is measuring *from* — the line tool's
   * confirmed start, or a grip's fixed end. Snaps that are relative to it
   * (perpendicular, tangent) need this; it is `null` when no point is pending
   * (idle, or placing a first point), so those providers offer nothing then.
   */
  readonly anchor: Vec2 | null
  /**
   * Provisional geometry being drawn by the active tool (the rubber-band).
   * Empty unless a tool is mid-operation. Providers may cross it against the
   * committed document so snaps engage on the line currently being drawn.
   */
  readonly construction: readonly ConstructionGeometry[]
  /**
   * Ids of the lines the user has *acquired* as Parallel references (by
   * hovering over them). The Parallel provider offers a parallel only for these
   * lines, so it stays deliberate instead of firing on every line. Empty until
   * a line is acquired.
   */
  readonly parallelSourceIds: ReadonlySet<EntityId>
}

/**
 * A snap provider inspects the document near the cursor and returns any snap
 * points it can offer. Providers are intentionally tiny and single-purpose so
 * new snap types (perpendicular, tangent, ...) can be added independently.
 */
export interface SnapProvider {
  readonly type: SnapType
  collect(context: SnapContext): SnapCandidate[]
}
