import { Vec2 } from "../../geometry/Vec2"
import { Vec3 } from "../../geometry/Vec3"
import { DocumentReader } from "../../domain/Document"
import { Entity, EntityId } from "../../domain/entities"
import { CameraTransform } from "../../scene/types"

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
  /**
   * The snapped point, in world coordinates, at the Z of the object there
   * (AutoCAD's OSNAPZ 0): a snap is where a point takes a height from.
   */
  readonly point: Vec3
  /** Entities that produced this snap (for highlighting / debugging). */
  readonly sourceIds?: readonly EntityId[]
  /**
   * The point on the source object nearest the cursor, when the snap engages
   * by proximity to the object rather than to {@link point}: Perpendicular and
   * Tangent engage while hovering anywhere over the line or circle (the
   * snapped point being the foot or the tangent, often far from the cursor),
   * matching AutoCAD. The engine measures the screen distance to it.
   */
  readonly pickPoint?: Vec3
  /**
   * True when the snap is derived from provisional, moving geometry — the
   * rubber-band being drawn. Such points still attract the cursor, but must not
   * be *acquired* as object-snap-tracking references (you cannot pick up a
   * reference off a point that is still moving), matching AutoCAD.
   */
  readonly transient?: boolean
  /**
   * The direction of the alignment the point lies on (Extension's
   * prolongation, Parallel's parallel), for the dashed guide drawn through it.
   */
  readonly direction?: Vec2
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
 * Context passed to every provider. A provider asks its 2D questions in each
 * object's own plane, with the cursor that plane sees ({@link cursorOn}), and
 * lets {@link isNear} judge a point: in a plan view both are the plain world
 * cursor and tolerance, off the plan the cursor is the line of sight and
 * nearness is measured on screen. The document is read-only: providers
 * observe, they never mutate.
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
  /** The cursor on the work plane (ELEVATION above the UCS's XY plane). */
  readonly worldCursor: Vec2
  /** The cursor as a point in the plan of `entity`'s plane (a line's: along it on screen). */
  cursorOn(entity: Entity): Vec2
  /** Whether `point` is within the aperture of the cursor, `reach` times widened. */
  isNear(point: Vec3, reach?: number): boolean
  /** The view, for what is found on the screen rather than in a plane (apparent intersection). */
  readonly view: CameraTransform
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
