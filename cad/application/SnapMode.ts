import { Observable } from "../shared/Observable"
import { Vec2 } from "../geometry/Vec2"
import { Ucs, ucsPointToWorld, worldPointToUcs } from "../domain/ucs"

/**
 * How the cursor is forced onto an increment: onto a rectangular lattice of
 * X/Y spacings, or onto distance increments measured along the engaged
 * Ortho/Polar alignment path (AutoCAD's SNAPTYPE).
 */
export type SnapModeType = "grid" | "polar"

const MIN_SPACING = 1e-6

/**
 * AutoCAD's SNAP mode (F9): the classic drafting aid that makes every picked
 * point land on a regular increment, so drawing to round dimensions needs no
 * typing at all. Object snaps still win over it — geometry beats the lattice.
 *
 * SNAPMODE and SNAPUNIT are the drawing's, as ORTHOMODE and GRIDMODE are
 * (rectang/p304): the runtime keeps this in step with its settings. SNAPTYPE
 * and the polar distance (POLARDIST) stay for the session.
 */
export class SnapMode extends Observable {
  private active = false
  private type: SnapModeType = "grid"
  private spacing: Vec2 = { x: 10, y: 10 }
  /** POLARDIST: 0 at first (probe workspace/p205), any sign taken (p211). */
  private polarDistance = 0

  isActive(): boolean {
    return this.active
  }

  /** True when picked points should be rounded onto the rectangular lattice. */
  isRectangular(): boolean {
    return this.active && this.type === "grid"
  }

  /** True when distances along an alignment path should be rounded. */
  isPolar(): boolean {
    return this.active && this.type === "polar"
  }

  setActive(active: boolean): void {
    if (this.active === active) return
    this.active = active
    this.emit()
  }

  toggleActive(): void {
    this.setActive(!this.active)
  }

  getType(): SnapModeType {
    return this.type
  }

  setType(type: SnapModeType): void {
    if (this.type === type) return
    this.type = type
    this.emit()
  }

  getSpacing(): Vec2 {
    return this.spacing
  }

  /** Sets the lattice spacing; `y` defaults to `x`, as in AutoCAD's dialog. */
  setSpacing(x: number, y: number = x): void {
    if (!(x >= MIN_SPACING) || !(y >= MIN_SPACING)) return
    if (this.spacing.x === x && this.spacing.y === y) return
    this.spacing = { x, y }
    this.emit()
  }

  getPolarDistance(): number {
    return this.polarDistance
  }

  setPolarDistance(distance: number): void {
    if (!Number.isFinite(distance) || distance === this.polarDistance) return
    this.polarDistance = distance
    this.emit()
  }

  /** Rounds a world point onto the UCS's lattice; unchanged unless rectangular snap is on. */
  snapPoint(point: Vec2, ucs: Ucs): Vec2 {
    if (!this.isRectangular()) return point
    const local = worldPointToUcs(ucs, point)
    return ucsPointToWorld(ucs, {
      x: roundTo(local.x, this.spacing.x),
      y: roundTo(local.y, this.spacing.y),
    })
  }

  /** Rounds a distance to a polar increment; unchanged unless polar snap is on. */
  snapPolarDistance(distance: number): number {
    if (!this.isPolar()) return distance
    // "If this value is 0, the PolarSnap distance assumes the value for Snap
    // X Spacing" (help GUID-66D637C9). WHY a negative steps by its size: what
    // AutoCAD does with one is unverified (p211 only shows it taken).
    const step =
      this.polarDistance === 0 ? this.spacing.x : Math.abs(this.polarDistance)
    return roundTo(distance, step)
  }

  /**
   * The lattice the visible grid should align to, so every drawn intersection
   * is a point the cursor can actually land on. `null` leaves the grid to pick
   * its own spacing from the zoom level.
   */
  displaySpacing(): Vec2 | null {
    return this.isRectangular() ? this.spacing : null
  }
}

function roundTo(value: number, step: number): number {
  return Math.round(value / step) * step
}
