import { Vec3 } from "../../geometry/Vec3"
import { Ray } from "../../geometry/primitives"
import { Ucs } from "../../domain/ucs"
import { EntityId } from "../../domain/entities"
import { SnapType } from "../snapping/types"

/**
 * Object Snap Tracking (AutoCAD's OTRACK). Unlike a snap, which *attracts* the
 * cursor onto geometry, tracking lets the user *acquire* an existing snap point
 * by hovering over it for a moment, then draws imaginary alignment guides from
 * it. The final point is often the intersection of such a guide with the active
 * drawing constraint (Ortho/Polar) — that is what lets you "close a rectangle"
 * precisely without clicking the reference corner.
 *
 * The whole feature is framework-agnostic and never creates real geometry; the
 * guides are transient overlay hints only.
 */

/** A snap point the user has "acquired" by hovering over it long enough. */
export interface TrackingPoint {
  readonly id: string
  /** The acquired point, in world coordinates, with the Z of its object. */
  readonly origin: Vec3
  /** Which object snap produced it (endpoint, midpoint, center, intersection). */
  readonly sourceType: SnapType
  /** The objects it was acquired on: an endpoint's object is what Extension prolongs. */
  readonly sourceIds: readonly EntityId[]
  /** Timestamp (ms) of acquisition, used for ordering / expiry. */
  readonly acquiredAt: number
}

export type TrackingGuideKind =
  | "horizontal"
  | "vertical"
  | "polar"
  | "z"
  /** A line's prolongation from an end acquired for Extension. */
  | "extension"

/** An infinite alignment line emanating from an acquired {@link TrackingPoint}. */
export interface TrackingGuide {
  readonly point: TrackingPoint
  /**
   * Unit direction in the frame: 0°, 90°, 45°, ... of the UCS in its plane, or
   * its Z for the `+Z` / `-Z` guide a 3D view adds.
   */
  readonly dir: Vec3
  /** Angle of {@link dir} in radians from the UCS X axis (from its XY plane for the Z), for labels / debugging. */
  readonly angle: number
  readonly kind: TrackingGuideKind
}

/** How the resolved tracking point was obtained (drives priority + rendering). */
export type TrackingHitKind =
  | "projection" // cursor projected onto a single guide
  | "guide-intersection" // two guides crossing
  | "guide-constraint" // a guide crossing the active Ortho/Polar line

/** The point the engine hands back when tracking engages. */
export interface TrackingResult {
  readonly point: Vec3
  readonly kind: TrackingHitKind
  /** The guides that produced the point (to draw them as active). */
  readonly guides: readonly TrackingGuide[]
  /** Unit direction along the primary guide, towards the point (used by dynamic input). */
  readonly direction: Vec3
}

/**
 * Aggregate snapshot of every drawing aid, passed down through the resolve
 * pipeline and surfaced to the UI. Keeping Ortho, Polar and OTRACK together
 * lets them be toggled/displayed uniformly.
 */
export interface DrawingAidState {
  readonly ortho: boolean
  readonly polar: boolean
  /** Polar tracking increment in degrees (e.g. 45). */
  readonly polarAngleStep: number
  readonly objectSnapTracking: boolean
  readonly acquiredPoints: readonly TrackingPoint[]
  /** The UCS whose horizontal, vertical and polar angles the guides follow. */
  readonly ucs: Ucs
}

export type { Ray }
