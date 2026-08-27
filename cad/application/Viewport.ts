import { Observable } from "../shared/Observable"
import { Vec2, vec2 } from "../geometry/Vec2"

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
 *
 * Screen sizes are measured in CSS pixels; device-pixel-ratio is handled by the
 * render adapter, not here. The viewport structurally satisfies the scene
 * layer's `CameraTransform` interface.
 */
/** Everything needed to restore a view: what ZOOM Previous remembers. */
export interface Camera {
  readonly scale: number
  readonly translation: Vec2
}

export class Viewport extends Observable {
  private scaleValue = 1
  private translationValue: Vec2 = { x: 0, y: 0 }

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
    return {
      x: p.x * this.scaleValue + this.translationValue.x,
      y: -p.y * this.scaleValue + this.translationValue.y,
    }
  }

  screenToWorld(p: Vec2): Vec2 {
    return {
      x: (p.x - this.translationValue.x) / this.scaleValue,
      y: -(p.y - this.translationValue.y) / this.scaleValue,
    }
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
    this.translationValue = {
      x: screenAnchor.x - worldBefore.x * nextScale,
      y: screenAnchor.y + worldBefore.y * nextScale,
    }
    this.emit()
  }

  getCamera(): Camera {
    return { scale: this.scaleValue, translation: this.translationValue }
  }

  setCamera(camera: Camera): void {
    this.scaleValue = clamp(
      camera.scale,
      Viewport.MIN_SCALE,
      Viewport.MAX_SCALE
    )
    this.translationValue = camera.translation
    this.emit()
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
   * Frames a world rectangle, leaving `padding` screen pixels of margin. The
   * smaller of the two axis scales is used, so the whole rectangle fits.
   */
  zoomToBounds(min: Vec2, max: Vec2, padding = 0): void {
    const worldWidth = Math.max(max.x - min.x, 1e-6)
    const worldHeight = Math.max(max.y - min.y, 1e-6)
    const scale = Math.min(
      (this.widthValue - padding * 2) / worldWidth,
      (this.heightValue - padding * 2) / worldHeight
    )
    this.scaleValue = clamp(scale, Viewport.MIN_SCALE, Viewport.MAX_SCALE)
    this.centerOn({ x: (min.x + max.x) / 2, y: (min.y + max.y) / 2 })
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
    this.translationValue = {
      x: this.widthValue / 2 - worldPoint.x * this.scaleValue,
      y: this.heightValue / 2 + worldPoint.y * this.scaleValue,
    }
    this.emit()
  }

  worldCenter(): Vec2 {
    return this.screenToWorld(vec2(this.widthValue / 2, this.heightValue / 2))
  }
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}
