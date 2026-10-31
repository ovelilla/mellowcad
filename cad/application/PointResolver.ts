import { Vec2, V } from "../geometry/Vec2"
import { Vec3, length3, scale3, sub3, withZ, zOf } from "../geometry/Vec3"
import { Viewport } from "./Viewport"
import { SnapMode } from "./SnapMode"
import { SnapEngine } from "./snapping/SnapEngine"
import { SnapResult, SnapType } from "./snapping/types"
import { ConstraintManager } from "./constraints/ConstraintManager"
import { ConstraintContext, ConstraintType } from "./constraints/types"
import { isAlongZ } from "./constraints/zGuide"
import { ObjectSnapTrackingEngine } from "./tracking/ObjectSnapTrackingEngine"
import {
  DrawingAidState,
  TrackingGuide,
  TrackingPoint,
  TrackingResult,
} from "./tracking/types"
import { Ucs } from "../domain/ucs"

/** What the resolver produced for one cursor position. */
export interface ResolvedPoint {
  /**
   * The effective world point a tool should act on. Its Z is the snapped
   * object's, the tracked point's, the base point's where Ortho or Polar
   * locks it to a line through that point (on the `+Z` / `-Z` path of a 3D
   * view, the height they set), or else the cursor's on the work plane.
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
 * A direct snap wins over everything after it — tracking, the lattice, Ortho
 * and Polar — and is returned as-is; when tracking engages it already accounts
 * for the active Ortho line, so its point is returned as-is too.
 */
export class PointResolver {
  /** The direction a typed `<angle` locks the next point to, if one was typed. */
  private angleOverride: Vec2 | null = null

  constructor(
    private readonly currentView: () => Viewport,
    private readonly snapping: SnapEngine,
    private readonly constraints: ConstraintManager,
    private readonly tracking: ObjectSnapTrackingEngine,
    private readonly snapMode: SnapMode,
    private readonly currentUcs: () => Ucs,
    private readonly currentExtensions: () => readonly TrackingGuide[] = () => []
  ) {}

  /**
   * `world` is the cursor on the work plane (UCS XY + ELEVATION), `anchor` the tool's base point,
   * both in the frame `currentView` reads. `allowSnapMode` is false while a
   * tool is merely picking objects: SNAP is a point-prompt aid, and rounding
   * the cursor would only make objects harder to hit.
   */
  resolve(
    world: Vec3,
    snap: SnapResult | null,
    anchor: Vec2 | Vec3 | null,
    orthoOverride = false,
    allowSnapMode = true
  ): ResolvedPoint {
    // WHY returned untouched: "Ortho is ignored when you enter coordinates or
    // specify an object snap" (AutoCAD), and polar tracking yields to a snap
    // the same way — projecting it onto the ray left the point off the object
    // the marker was showing.
    if (snap) return { point: snap.point, tracking: extensionPath(snap) }

    // "The angle you specify will lock the cursor, overriding Grid Snap, Ortho
    // mode, and PolarSnap": the point slides along the line through the base
    // point at that angle, at the base point's height, as `@dist<angle` would.
    if (this.angleOverride !== null && anchor !== null) {
      const dir = this.angleOverride
      const along = V.dot(V.sub(this.onBasePlane(world, anchor), anchor), dir)
      return {
        point: withZ(V.add(anchor, V.scale(dir, along)), zOf(anchor)),
        tracking: null,
      }
    }

    const ucs = this.currentUcs()
    const tracked = this.track(world, anchor, orthoOverride)
    if (tracked) return { point: tracked.point, tracking: tracked }

    const context = this.constraintContext(world, anchor, allowSnapMode)
    const constrained = this.constraints.apply(context, orthoOverride)
    if (isAlongZ(constrained)) {
      return {
        point: allowSnapMode
          ? this.polarSnapAlongZ(anchor, constrained)
          : withZ(constrained, constrained.z),
        tracking: null,
      }
    }
    // Locked to a line through the base point, the point is on it, at the
    // base point's height (desktop interaction3d/d03, d04, d07: Ortho and
    // Polar from 0,100,50 give Z 50, in a 3D view and in plan alike).
    if (anchor !== null && this.constraints.activeRay(context, orthoOverride)) {
      return {
        point: withZ(
          allowSnapMode
            ? this.applyPolarSnap(context, constrained, orthoOverride)
            : constrained,
          zOf(anchor)
        ),
        tracking: null,
      }
    }
    // Free, the point is the cursor on the work plane, the lattice's there
    // (d02, d05: 80,100,0 from 0,100,50 with SNAP alone); edge-on, on the
    // plane facing the screen, at the height it has there (d08).
    return {
      point: withZ(
        allowSnapMode ? this.snapMode.snapPoint(world, ucs) : world,
        world.z
      ),
      tracking: null,
    }
  }

  /**
   * What Ortho, Polar and the lattice under them read: the cursor on the base
   * point's plane, rounded onto the lattice when `allowSnapMode`. Every caller
   * that asks a constraint about the cursor builds its context here.
   */
  constraintContext(
    world: Vec3,
    anchor: Vec2 | Vec3 | null,
    allowSnapMode = true
  ): ConstraintContext {
    const ucs = this.currentUcs()
    const view = this.currentView()
    const cursor = this.onBasePlane(world, anchor)
    const point = allowSnapMode ? this.snapMode.snapPoint(cursor, ucs) : cursor
    return { anchor, world: cursor, point, ucs, view }
  }

  /**
   * The cursor where the line of sight meets the plane through the base point
   * parallel to the UCS's XY: a constraint from a base point at another height
   * reads it there. With the pointer on 80,100,0's pixel in SEISO, Ortho from
   * 0,100,50 gives 129.875,100,50, where that line of sight is at Z 50 —
   * neither the pointer's plan (80) nor its foot on the drawn axis (≈105);
   * the grid under Ortho rounds it to 130 (desktop interaction3d/d03, d05).
   * Edge-on, where the line of sight never meets it, the work plane's.
   */
  private onBasePlane(world: Vec3, anchor: Vec2 | Vec3 | null): Vec3 {
    if (anchor === null) return world
    const z = zOf(anchor)
    if (Math.abs(z - world.z) < 1e-9) return world
    const view = this.currentView()
    const on = view.screenToPlane(view.worldToScreen(world), z)
    return on === null ? world : withZ(on, z)
  }

  /**
   * Locks the next point to the line through the base point along `dir` (a
   * unit direction in the frame), AutoCAD's `<angle` angle override, or
   * releases it with `null`.
   */
  setAngleOverride(dir: Vec2 | null): void {
    this.angleOverride = dir
  }

  hasAngleOverride(): boolean {
    return this.angleOverride !== null
  }

  /** The heading the angle override holds the next point to, or null. */
  heldAngle(): Vec2 | null {
    return this.angleOverride
  }

  /**
   * Where alignment paths cross under the cursor — two OTRACK guides, a guide
   * and an Extension, a guide and the Ortho / Polar line — or `null`. Such a
   * point beats a snap that merely slides along one path (Extension,
   * Parallel, Nearest): it is the point that path was followed to.
   */
  crossing(
    world: Vec3,
    anchor: Vec2 | Vec3 | null,
    orthoOverride = false
  ): TrackingResult | null {
    const tracked = this.track(world, anchor, orthoOverride)
    return tracked && tracked.kind !== "projection" ? tracked : null
  }

  /**
   * The tracking guides the cursor is on — one it slides along, or the ones
   * crossing under it — for Intersection to cross with objects, as it crosses
   * the polar path.
   */
  engagedGuides(
    world: Vec3,
    anchor: Vec2 | Vec3 | null,
    orthoOverride = false
  ): readonly TrackingGuide[] {
    const tracked = this.track(world, anchor, orthoOverride)
    return tracked ? tracked.guides.filter((g) => g.kind !== "z") : []
  }

  private track(
    world: Vec3,
    anchor: Vec2 | Vec3 | null,
    orthoOverride: boolean
  ): TrackingResult | null {
    const view = this.currentView()
    const raw = this.constraintContext(world, anchor, false)
    const anchorLine =
      anchor !== null ? this.constraints.activeRay(raw, orthoOverride) : null
    const anchorUp =
      anchor !== null && this.constraints.activeAlongZ(raw, orthoOverride)
        ? withZ(anchor, zOf(anchor))
        : null
    return this.tracking.resolve(
      world,
      view.screenToWorldDistance(this.snapping.pixelTolerance),
      this.aidState(orthoOverride),
      anchorLine,
      view,
      anchorUp,
      this.currentExtensions()
    )
  }

  /**
   * Polar snap on the `+Z` / `-Z` path rounds the height above the base point,
   * as on any other path; the lattice has no step along Z, so it leaves it be.
   */
  private polarSnapAlongZ(anchor: Vec2 | Vec3 | null, point: Vec3): Vec3 {
    const base = anchor === null ? point.z : zOf(anchor)
    const rise = point.z - base
    if (!this.snapMode.isPolar() || Math.abs(rise) < 1e-9) {
      return withZ(point, point.z)
    }
    const snapped = this.snapMode.snapPolarDistance(Math.abs(rise))
    if (snapped <= 0) return withZ(point, point.z)
    return withZ(point, base + Math.sign(rise) * snapped)
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
    orthoOverride: boolean
  ): Vec2 {
    const { anchor } = context
    if (!this.snapMode.isPolar() || anchor === null) return point
    if (!this.constraints.activeRay({ ...context, point }, orthoOverride)) {
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
   * `orthoOverride` (Shift held) temporarily toggles Ortho and suppresses Polar,
   * matching AutoCAD's override.
   */
  aidState(orthoOverride = false): DrawingAidState {
    return {
      ortho: orthoOverride !== this.constraints.isEnabled(ConstraintType.Ortho),
      polar: !orthoOverride && this.constraints.isEnabled(ConstraintType.Polar),
      polarAngleStep: this.constraints.getPolarAngleStep(),
      objectSnapTracking: this.tracking.isActive(),
      acquiredPoints: this.tracking.getAcquired(),
      ucs: this.currentUcs(),
    }
  }
}

/**
 * A line's Extension as the alignment path it is: a typed distance runs along
 * it from the acquired end ("use direct distance to specify points at precise
 * distances along alignment paths from the acquired object snap point"),
 * exactly as along an OTRACK guide. An arc's extension has no such reading.
 */
function extensionPath(snap: SnapResult): TrackingResult | null {
  if (snap.type !== SnapType.Extension || snap.path?.length !== 2) return null
  const origin = snap.path[0]
  const along = sub3(snap.point, origin)
  const length = length3(along)
  if (length < 1e-9) return null
  const dir = scale3(along, 1 / length)
  const point: TrackingPoint = {
    id: "extension",
    origin,
    sourceType: SnapType.Endpoint,
    sourceIds: snap.sourceIds ?? [],
    acquiredAt: 0,
  }
  return {
    point: snap.point,
    kind: "projection",
    guides: [
      { point, dir, angle: Math.atan2(dir.y, dir.x), kind: "extension" },
    ],
    direction: dir,
  }
}
