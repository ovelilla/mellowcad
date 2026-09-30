import { Vec2, V } from "../geometry/Vec2"
import { Vec3, withZ } from "../geometry/Vec3"
import { Viewport } from "./Viewport"
import { SnapMode } from "./SnapMode"
import { SnapEngine } from "./snapping/SnapEngine"
import { SnapResult } from "./snapping/types"
import { ConstraintManager } from "./constraints/ConstraintManager"
import { ConstraintContext, ConstraintType } from "./constraints/types"
import { ObjectSnapTrackingEngine } from "./tracking/ObjectSnapTrackingEngine"
import { DrawingAidState, TrackingResult } from "./tracking/types"
import { Ucs } from "../domain/ucs"

/** What the resolver produced for one cursor position. */
export interface ResolvedPoint {
  /**
   * The effective world point a tool should act on. Its Z is the snapped
   * object's, the tracked point's, or else the elevation plane (ELEVATION above
   * the UCS's XY plane) — Ortho, Polar and the snap lattice work in the plane
   * and never change it.
   */
  readonly point: Vec3
  /** The tracking result that produced it, if tracking engaged. */
  readonly tracking: TrackingResult | null
}

/**
 * The precision pipeline: turns the raw cursor into the point a tool should
 * act on. The order is:
 *
 *   object snap (attract to geometry)
 *     → object snap tracking (align to acquired references)
 *       → snap mode (round onto the snap lattice)
 *         → drawing constraints (Ortho, ...)
 *
 * A direct snap wins over tracking and over the lattice — geometry always beats
 * an increment, as in AutoCAD; when tracking engages it already accounts for
 * the active Ortho line, so its point is returned as-is.
 */
export class PointResolver {
  constructor(
    private readonly viewport: Viewport,
    private readonly snapping: SnapEngine,
    private readonly constraints: ConstraintManager,
    private readonly tracking: ObjectSnapTrackingEngine,
    private readonly snapMode: SnapMode,
    private readonly currentUcs: () => Ucs,
    private readonly currentElevation: () => number
  ) {}

  /**
   * `allowSnapMode` is false while a tool is merely picking objects: SNAP is a
   * point-prompt aid, and rounding the cursor would only make objects harder
   * to hit.
   */
  resolve(
    world: Vec2,
    snap: SnapResult | null,
    anchor: Vec2 | null,
    forceOrtho = false,
    allowSnapMode = true
  ): ResolvedPoint {
    const snapPoint = snap ? snap.point : null
    const ucs = this.currentUcs()

    // Object snap tracking only when there is no direct snap.
    let tracked: TrackingResult | null = null
    if (!snap) {
      const anchorLine =
        anchor !== null
          ? this.constraints.activeRay(
              {
                anchor,
                world,
                snapPoint: null,
                point: world,
                ucs,
              },
              forceOrtho
            )
          : null
      const tolerance = this.viewport.screenToWorldDistance(
        this.snapping.pixelTolerance
      )
      tracked = this.tracking.resolve(
        world,
        tolerance,
        this.aidState(forceOrtho),
        anchorLine
      )
    }
    if (tracked) return { point: tracked.point, tracking: tracked }

    const candidate = snap
      ? snap.point
      : allowSnapMode
        ? this.snapMode.snapPoint(world, ucs)
        : world
    const context = { anchor, world, snapPoint, point: candidate, ucs }
    const constrained = this.constraints.apply(context, forceOrtho)
    return {
      point: withZ(
        allowSnapMode && !snap
          ? this.applyPolarSnap(context, constrained, forceOrtho)
          : constrained,
        snap ? snap.point.z : ucs.origin.z + this.currentElevation()
      ),
      tracking: null,
    }
  }

  /**
   * Polar snap rounds how far the point sits from the base point, measured
   * along the alignment path Ortho/Polar imposes. Without such a path there is
   * no direction to measure along, so nothing is rounded — as in AutoCAD, where
   * polar snap is only meaningful together with polar tracking.
   */
  private applyPolarSnap(
    context: ConstraintContext,
    point: Vec2,
    forceOrtho: boolean
  ): Vec2 {
    const { anchor } = context
    if (!this.snapMode.isPolar() || anchor === null) return point
    if (!this.constraints.activeRay({ ...context, point }, forceOrtho)) {
      return point
    }
    const offset = V.sub(point, anchor)
    const distance = V.length(offset)
    if (distance < 1e-9) return point
    const snapped = this.snapMode.snapPolarDistance(distance)
    if (snapped <= 0) return point
    return V.add(anchor, V.scale(offset, snapped / distance))
  }

  /**
   * Aggregates the current drawing aids for the tracking pipeline / UI.
   * `forceOrtho` (Shift held) temporarily forces Ortho and suppresses Polar,
   * matching AutoCAD's override.
   */
  aidState(forceOrtho = false): DrawingAidState {
    return {
      ortho: forceOrtho || this.constraints.isEnabled(ConstraintType.Ortho),
      polar: !forceOrtho && this.constraints.isEnabled(ConstraintType.Polar),
      polarAngleStep: this.constraints.getPolarAngleStep(),
      objectSnapTracking: this.tracking.isActive(),
      acquiredPoints: this.tracking.getAcquired(),
      ucs: this.currentUcs(),
    }
  }
}
