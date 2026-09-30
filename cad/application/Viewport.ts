import { Observable } from "../shared/Observable"
import { Vec2, vec2 } from "../geometry/Vec2"
import {
  BlockLookup,
  Bounds,
  Entity,
  entitiesBounds,
  rotateEntity,
} from "../domain/entities"

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
 * - `xAxis` is the world direction that reads as screen-right (VIEWTWIST).
 *   The *view frame* is the world turned so that direction is +X: a screen
 *   rectangle is an axis-aligned one there, not in the world.
 *
 * Screen sizes are measured in CSS pixels; device-pixel-ratio is handled by the
 * render adapter, not here. The viewport structurally satisfies the scene
 * layer's `CameraTransform` interface.
 */
/** Everything needed to restore a view: what ZOOM Previous remembers. */
export interface Camera {
  readonly scale: number
  readonly translation: Vec2
  readonly xAxis: Vec2
}

const WORLD_X: Vec2 = { x: 1, y: 0 }

export class Viewport extends Observable {
  private scaleValue = 1
  private translationValue: Vec2 = { x: 0, y: 0 }
  private xAxisValue: Vec2 = WORLD_X

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

  /** Unit vector: the world direction drawn pointing right. */
  get xAxis(): Vec2 {
    return this.xAxisValue
  }

  /** The view's twist, radians CCW from the world X axis. */
  get twist(): number {
    return Math.atan2(this.xAxisValue.y, this.xAxisValue.x)
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

  worldToScreen(p: Vec2): Vec2 {
    const v = this.worldToView(p)
    return {
      x: v.x * this.scaleValue + this.translationValue.x,
      y: -v.y * this.scaleValue + this.translationValue.y,
    }
  }

  screenToWorld(p: Vec2): Vec2 {
    return this.viewToWorld({
      x: (p.x - this.translationValue.x) / this.scaleValue,
      y: -(p.y - this.translationValue.y) / this.scaleValue,
    })
  }

  /** A world point in the view frame (the world turned by minus the twist). */
  worldToView(p: Vec2): Vec2 {
    const { x: c, y: s } = this.xAxisValue
    if (s === 0 && c === 1) return p
    return { x: p.x * c + p.y * s, y: -p.x * s + p.y * c }
  }

  viewToWorld(p: Vec2): Vec2 {
    const { x: c, y: s } = this.xAxisValue
    if (s === 0 && c === 1) return p
    return { x: p.x * c - p.y * s, y: p.x * s + p.y * c }
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
      xAxis: this.xAxisValue,
    }
  }

  setCamera(camera: Camera): void {
    this.scaleValue = clamp(
      camera.scale,
      Viewport.MIN_SCALE,
      Viewport.MAX_SCALE
    )
    this.translationValue = camera.translation
    this.xAxisValue = camera.xAxis
    this.emit()
  }

  /**
   * Turns the view so the world direction `xAxis` reads as screen-right,
   * keeping the point at the centre of the screen where it is.
   */
  setXAxis(xAxis: Vec2): void {
    const length = Math.hypot(xAxis.x, xAxis.y)
    if (!(length > 0) || !Number.isFinite(length)) return
    const center = this.worldCenter()
    this.xAxisValue = { x: xAxis.x / length, y: xAxis.y / length }
    this.centerOn(center)
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
  const { x: c, y: s } = viewport.xAxis
  if (s === 0 && c === 1) return entity
  return rotateEntity(entity, { x: 0, y: 0 }, -viewport.twist)
}

/** The extents of `entities` in the view frame, for {@link Viewport.zoomToViewBounds}. */
export function entitiesViewBounds(
  entities: readonly Entity[],
  viewport: Viewport,
  blocks?: BlockLookup
): Bounds | null {
  return entitiesBounds(
    entities.map((entity) => entityInView(entity, viewport)),
    blocks
  )
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}
