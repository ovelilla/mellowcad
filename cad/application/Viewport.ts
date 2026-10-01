import { Observable } from "../shared/Observable"
import { Vec2, vec2 } from "../geometry/Vec2"
import {
  Vec3,
  WORLD_X,
  WORLD_Z,
  cross3,
  dot3,
  normalize3,
  zOf,
} from "../geometry/Vec3"
import {
  BlockLookup,
  Bounds,
  Entity,
  entitiesBounds,
  rotateEntity,
} from "../domain/entities"
import { drawsTilted, entityScreenOutline } from "./viewOutline"

/**
 * The viewport owns the mapping between *world* coordinates (what entities are
 * stored in) and *screen* pixels (what any renderer draws with). It is
 * transient view state, so it lives in the application layer, not the domain.
 *
 * Conventions:
 * - World space is Y-up (mathematical), like a real CAD system.
 * - Screen space is Y-down (pixels).
 * - `scale` is pixels per world unit.
 * - `translation` is the screen-pixel position of the world origin (0, 0).
 * - The view is a parallel projection along `direction` (VIEWDIR in the WCS,
 *   pointing at the viewer), with `right` the world direction drawn pointing
 *   right and `up` = `direction` × `right`. The plan view of the WCS is
 *   `direction` +Z and `right` +X. The *view frame* holds a point as its
 *   `right` and `up` components: a screen rectangle is an axis-aligned one
 *   there, not in the world.
 *
 * Screen sizes are measured in CSS pixels; device-pixel-ratio is handled by the
 * render adapter, not here. The viewport structurally satisfies the scene
 * layer's `CameraTransform` interface.
 */
/** Everything needed to restore a view: what ZOOM Previous remembers. */
export interface Camera {
  readonly scale: number
  readonly translation: Vec2
  readonly direction: Vec3
  readonly right: Vec3
}

export class Viewport extends Observable {
  private scaleValue = 1
  private translationValue: Vec2 = { x: 0, y: 0 }
  private directionValue: Vec3 = WORLD_Z
  private rightValue: Vec3 = WORLD_X
  private upValue: Vec3 = { x: 0, y: 1, z: 0 }

  /** Canvas size in CSS pixels. */
  private widthValue = 0
  private heightValue = 0

  /** Views to step back through, oldest first (AutoCAD keeps 10). */
  private history: Camera[] = []

  private static readonly MIN_SCALE = 1e-4
  private static readonly MAX_SCALE = 1e6
  private static readonly MAX_HISTORY = 10

  get scale(): number {
    return this.scaleValue
  }

  get translation(): Vec2 {
    return this.translationValue
  }

  /** Unit vector: the line of sight, from the target towards the viewer. */
  get direction(): Vec3 {
    return this.directionValue
  }

  /** Unit vector: the world direction drawn pointing right. */
  get right(): Vec3 {
    return this.rightValue
  }

  /** Unit vector: the world direction drawn pointing up. */
  get up(): Vec3 {
    return this.upValue
  }

  /** True when the view looks straight down the world Z axis. */
  get isPlan(): boolean {
    return isWorldZ(this.directionValue)
  }

  /** A plan view's twist, radians CCW from the world X axis to screen-right. */
  get twist(): number {
    return Math.atan2(this.rightValue.y, this.rightValue.x)
  }

  get width(): number {
    return this.widthValue
  }

  get height(): number {
    return this.heightValue
  }

  setSize(width: number, height: number): void {
    if (width === this.widthValue && height === this.heightValue) return
    this.widthValue = width
    this.heightValue = height
    this.emit()
  }

  worldToScreen(p: Vec2 | Vec3): Vec2 {
    const v = this.worldToView(p)
    return {
      x: v.x * this.scaleValue + this.translationValue.x,
      y: -v.y * this.scaleValue + this.translationValue.y,
    }
  }

  screenToWorld(p: Vec2): Vec2 {
    return this.viewToWorld(this.screenToView(p))
  }

  /** A screen point in the view frame. */
  screenToView(p: Vec2): Vec2 {
    return {
      x: (p.x - this.translationValue.x) / this.scaleValue,
      y: -(p.y - this.translationValue.y) / this.scaleValue,
    }
  }

  /** The point drawn at screen `p` on the plane through the origin facing the viewer. */
  screenToFacing(p: Vec2): Vec3 {
    const v = this.viewToWorld(this.screenToView(p))
    return { x: v.x, y: v.y, z: zOf(v) }
  }

  /**
   * The point of the horizontal plane at `z` drawn at screen `p`: where the
   * line of sight through it meets the plane. Null when the view sees that
   * plane edge-on, as it does from the front.
   */
  screenToPlane(p: Vec2, z: number): Vec2 | null {
    if (this.isPlan) return this.screenToWorld(p)
    const d = this.directionValue
    if (Math.abs(d.z) < EDGE_ON_SINE) return null
    const onView = this.viewToWorld(this.screenToView(p))
    const t = (z - zOf(onView)) / d.z
    return { x: onView.x + t * d.x, y: onView.y + t * d.y }
  }

  /** A world point in the view frame: its `right` and `up` components. */
  worldToView(p: Vec2 | Vec3): Vec2 {
    if (this.isPlan) {
      // WHY the 2D formula: a plan view must keep today's arithmetic to the bit.
      const { x: c, y: s } = this.rightValue
      if (s === 0 && c === 1) return p
      return { x: p.x * c + p.y * s, y: -p.x * s + p.y * c }
    }
    const point: Vec3 = { x: p.x, y: p.y, z: zOf(p) }
    return { x: dot3(point, this.rightValue), y: dot3(point, this.upValue) }
  }

  /** The world point of the view frame's `p` on the plane through the origin facing the viewer. */
  viewToWorld(p: Vec2): Vec2 {
    if (this.isPlan) {
      const { x: c, y: s } = this.rightValue
      if (s === 0 && c === 1) return p
      return { x: p.x * c - p.y * s, y: p.x * s + p.y * c }
    }
    const { rightValue: r, upValue: u } = this
    const world: Vec3 = {
      x: r.x * p.x + u.x * p.y,
      y: r.y * p.x + u.y * p.y,
      z: r.z * p.x + u.z * p.y,
    }
    return world
  }

  /** Converts a length in world units to screen pixels. */
  worldToScreenDistance(distance: number): number {
    return distance * this.scaleValue
  }

  /** Converts a length in screen pixels to world units. */
  screenToWorldDistance(distance: number): number {
    return distance / this.scaleValue
  }

  /** Pans the view by a delta expressed in screen pixels. */
  panByScreen(delta: Vec2): void {
    this.translationValue = {
      x: this.translationValue.x + delta.x,
      y: this.translationValue.y + delta.y,
    }
    this.emit()
  }

  /**
   * Zooms by `factor` (>1 zooms in) while keeping the world point currently
   * under `screenAnchor` fixed on screen. This is the intuitive "zoom towards
   * the cursor" behaviour.
   */
  zoomAt(screenAnchor: Vec2, factor: number): void {
    const worldBefore = this.screenToWorld(screenAnchor)
    const nextScale = clamp(
      this.scaleValue * factor,
      Viewport.MIN_SCALE,
      Viewport.MAX_SCALE
    )
    this.scaleValue = nextScale
    // Solve translation so worldToScreen(worldBefore) === screenAnchor again.
    const view = this.worldToView(worldBefore)
    this.translationValue = {
      x: screenAnchor.x - view.x * nextScale,
      y: screenAnchor.y + view.y * nextScale,
    }
    this.emit()
  }

  getCamera(): Camera {
    return {
      scale: this.scaleValue,
      translation: this.translationValue,
      direction: this.directionValue,
      right: this.rightValue,
    }
  }

  setCamera(camera: Camera): void {
    this.scaleValue = clamp(
      camera.scale,
      Viewport.MIN_SCALE,
      Viewport.MAX_SCALE
    )
    this.translationValue = camera.translation
    this.directionValue = camera.direction
    this.rightValue = camera.right
    this.upValue = cross3(camera.direction, camera.right)
    this.emit()
  }

  /**
   * Looks along `direction` (towards the viewer) with the world direction
   * `right` drawn pointing right, keeping the point at the centre of the
   * screen where it is. `right` is taken square to `direction`; returns false,
   * changing nothing, when the two are parallel or either is zero.
   */
  setView(direction: Vec3, right: Vec3): boolean {
    const axes = viewAxes(direction, right)
    if (!axes) return false
    const center = this.worldCenter()
    this.directionValue = axes.direction
    this.rightValue = axes.right
    this.upValue = cross3(axes.direction, axes.right)
    this.centerOn(center)
    return true
  }

  /**
   * Remembers the current view so it can be stepped back to. Callers record a
   * snapshot *before* changing the view, once per user gesture — a continuous
   * wheel zoom or pan drag is one entry, not one per event.
   */
  pushHistory(): void {
    this.history.push(this.getCamera())
    if (this.history.length > Viewport.MAX_HISTORY) this.history.shift()
  }

  /** AutoCAD's ZOOM Previous. Returns false when there is nothing to go back to. */
  restorePrevious(): boolean {
    const previous = this.history.pop()
    if (!previous) return false
    this.setCamera(previous)
    return true
  }

  hasPreviousView(): boolean {
    return this.history.length > 0
  }

  /**
   * Frames a world rectangle, leaving `padding` screen pixels of margin. In a
   * twisted view that is the rectangle's bounding box in the view frame.
   */
  zoomToBounds(min: Vec2, max: Vec2, padding = 0): void {
    const corners = [
      min,
      { x: max.x, y: min.y },
      max,
      { x: min.x, y: max.y },
    ].map((corner) => this.worldToView(corner))
    this.zoomToViewBounds(
      {
        x: Math.min(...corners.map((c) => c.x)),
        y: Math.min(...corners.map((c) => c.y)),
      },
      {
        x: Math.max(...corners.map((c) => c.x)),
        y: Math.max(...corners.map((c) => c.y)),
      },
      padding
    )
  }

  /**
   * Frames a rectangle of the view frame — what the screen shows as an upright
   * rectangle. The smaller of the two axis scales is used, so all of it fits.
   */
  zoomToViewBounds(min: Vec2, max: Vec2, padding = 0): void {
    const worldWidth = Math.max(max.x - min.x, 1e-6)
    const worldHeight = Math.max(max.y - min.y, 1e-6)
    const scale = Math.min(
      (this.widthValue - padding * 2) / worldWidth,
      (this.heightValue - padding * 2) / worldHeight
    )
    this.scaleValue = clamp(scale, Viewport.MIN_SCALE, Viewport.MAX_SCALE)
    this.centerOn(
      this.viewToWorld({ x: (min.x + max.x) / 2, y: (min.y + max.y) / 2 })
    )
  }

  /** Resets pan/zoom so world origin sits at the centre with unit scale. */
  reset(): void {
    this.scaleValue = 1
    this.translationValue = {
      x: this.widthValue / 2,
      y: this.heightValue / 2,
    }
    this.emit()
  }

  /** Centres the view on a world point at the current scale. */
  centerOn(worldPoint: Vec2): void {
    const view = this.worldToView(worldPoint)
    this.translationValue = {
      x: this.widthValue / 2 - view.x * this.scaleValue,
      y: this.heightValue / 2 + view.y * this.scaleValue,
    }
    this.emit()
  }

  worldCenter(): Vec2 {
    return this.screenToWorld(vec2(this.widthValue / 2, this.heightValue / 2))
  }
}

/**
 * An entity as the view frame holds it, so a question about a screen
 * rectangle (window selection, a zoom's extents) is an axis-aligned one.
 */
export function entityInView(entity: Entity, viewport: Viewport): Entity {
  const { x: c, y: s } = viewport.right
  if (s === 0 && c === 1) return entity
  return rotateEntity(entity, { x: 0, y: 0 }, -viewport.twist)
}

/** The extents of `entities` in the view frame, for {@link Viewport.zoomToViewBounds}. */
export function entitiesViewBounds(
  entities: readonly Entity[],
  viewport: Viewport,
  blocks?: BlockLookup
): Bounds | null {
  const onScreen = viewport.isPlan
    ? entities.filter((entity) => drawsTilted(entity, blocks))
    : entities
  let bounds: Bounds | null = null
  const include = (p: Vec2) => {
    bounds = bounds
      ? {
          min: {
            x: Math.min(bounds.min.x, p.x),
            y: Math.min(bounds.min.y, p.y),
          },
          max: {
            x: Math.max(bounds.max.x, p.x),
            y: Math.max(bounds.max.y, p.y),
          },
        }
      : { min: p, max: p }
  }
  for (const entity of onScreen) {
    for (const line of entityScreenOutline(viewport, entity, blocks)) {
      for (const point of line) include(viewport.screenToView(point))
    }
  }
  if (!viewport.isPlan) return bounds
  const level = entitiesBounds(
    entities
      .filter((entity) => !drawsTilted(entity, blocks))
      .map((entity) => entityInView(entity, viewport)),
    blocks
  )
  if (level) {
    include(level.min)
    include(level.max)
  }
  return bounds
}

function isWorldZ(v: Vec3): boolean {
  return v.x === 0 && v.y === 0 && v.z > 0
}

/** Below this sine between the line of sight and a plane, the plane is seen edge-on. */
const EDGE_ON_SINE = 1e-6

/** Unit `direction` and a unit `right` square to it, or `null` when they are parallel. */
function viewAxes(
  direction: Vec3,
  right: Vec3
): { direction: Vec3; right: Vec3 } | null {
  const d = normalize3(direction)
  if (!d) return null
  if (Math.abs(d.x) < 1e-12 && Math.abs(d.y) < 1e-12 && d.z > 0) {
    const length = Math.hypot(right.x, right.y)
    if (!(length > 0) || !Number.isFinite(length)) return null
    return {
      direction: WORLD_Z,
      right: { x: right.x / length, y: right.y / length, z: 0 },
    }
  }
  const up = normalize3(cross3(d, right))
  if (!up) return null
  const r = normalize3(cross3(up, d))
  return r ? { direction: d, right: r } : null
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}
