import { Vec2 } from "../../geometry/Vec2"
import { Ray } from "../../geometry/primitives"
import { Viewport } from "../Viewport"
import { Constraint, ConstraintContext, ConstraintType } from "./types"

/**
 * Polar tracking, inspired by AutoCAD's POLAR (F10). It complements Ortho:
 * instead of locking only to 0°/90°, it locks the candidate point to the
 * nearest multiple of a configurable angle increment (15/30/45/90°, ...),
 * measured CCW from +X through the anchor — the same angle convention as the
 * dynamic-input Angle field and the Properties palette.
 *
 * The key behavioural difference from Ortho is that polar tracking does **not**
 * lock unconditionally. It only engages when the cursor is close to one of the
 * increment angles — within a small screen-space aperture, like AutoCAD's
 * aperture box. Outside that band the cursor is free, so as the user sweeps the
 * pointer around the anchor it "clicks" onto each polar angle and releases in
 * between. Measuring the aperture in pixels makes the angular catch tighten
 * with distance, exactly like AutoCAD.
 *
 * Composition with snapping mirrors {@link OrthoConstraint}: the engaged
 * direction is decided from the raw cursor, but the returned point is the
 * (possibly snapped) `point` projected onto the polar ray, so polar and object
 * snaps cooperate.
 */
export class PolarConstraint implements Constraint {
  readonly type = ConstraintType.Polar

  /** Angle increment in degrees. AutoCAD's default is 90; 45 is common. */
  angleStep = 45

  /** How close (in screen pixels) the cursor must be to engage an angle. */
  private readonly aperturePixels = 12

  constructor(private readonly viewport: Viewport) {}

  apply(context: ConstraintContext): Vec2 {
    const dir = this.engagedDir(context)
    if (!dir) return context.point
    const anchor = context.anchor!
    const { point } = context
    // Project the (possibly snapped) point onto the polar ray so snapping and
    // polar cooperate, just as Ortho keeps the snapped free coordinate.
    const len = (point.x - anchor.x) * dir.x + (point.y - anchor.y) * dir.y
    return { x: anchor.x + dir.x * len, y: anchor.y + dir.y * len }
  }

  /** The polar line currently locked through the anchor, or `null` if free. */
  ray(context: ConstraintContext): Ray | null {
    const dir = this.engagedDir(context)
    if (!dir) return null
    return { origin: context.anchor!, dir }
  }

  /**
   * The unit direction of the polar angle the cursor is currently locked to, or
   * `null` when there is no anchor, the cursor sits on the anchor, or the
   * cursor is too far from every increment angle to engage.
   */
  private engagedDir(context: ConstraintContext): Vec2 | null {
    const { anchor, world } = context
    if (!anchor || this.angleStep <= 0) return null
    const dx = world.x - anchor.x
    const dy = world.y - anchor.y
    if (Math.hypot(dx, dy) < 1e-9) return null

    const step = (this.angleStep * Math.PI) / 180
    const cursorAngle = Math.atan2(dy, dx)
    const nearest = Math.round(cursorAngle / step) * step
    const dir = { x: Math.cos(nearest), y: Math.sin(nearest) }

    // Perpendicular distance from the cursor to the candidate ray, in pixels.
    // The cursor is "near" the angle when this is within the aperture box.
    const perpWorld = Math.abs(dx * -dir.y + dy * dir.x)
    if (perpWorld * this.viewport.scale > this.aperturePixels) return null
    return dir
  }
}
