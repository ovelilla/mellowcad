import { Vec2 } from "../../geometry/Vec2"
import { Ray } from "../../geometry/primitives"
import { Constraint, ConstraintContext, ConstraintType } from "./types"

/**
 * Ortho mode, inspired by AutoCAD's ORTHO. Once a base point exists it locks the
 * candidate point to a horizontal or vertical line through the anchor. The axis
 * is chosen from the *predominant direction of the mouse*: if the cursor has
 * moved further horizontally than vertically from the anchor, the line is
 * horizontal; otherwise it is vertical.
 *
 * Composition with snapping: the axis is decided from the raw cursor, but the
 * free coordinate is taken from `point` (which is the snapped point when a snap
 * is active). So locking horizontally keeps `anchor.y` while adopting the
 * snapped X — Ortho and object snaps genuinely cooperate.
 */
export class OrthoConstraint implements Constraint {
  readonly type = ConstraintType.Ortho

  apply({ anchor, world, point }: ConstraintContext): Vec2 {
    if (!anchor) return point

    const dx = world.x - anchor.x
    const dy = world.y - anchor.y

    if (Math.abs(dx) >= Math.abs(dy)) {
      // Horizontal lock: keep the (possibly snapped) X, pin Y to the anchor.
      return { x: point.x, y: anchor.y }
    }
    // Vertical lock: pin X to the anchor, keep the (possibly snapped) Y.
    return { x: anchor.x, y: point.y }
  }

  /** The horizontal or vertical line currently locked through the anchor. */
  ray({ anchor, world }: ConstraintContext): Ray | null {
    if (!anchor) return null
    const dx = world.x - anchor.x
    const dy = world.y - anchor.y
    const dir = Math.abs(dx) >= Math.abs(dy) ? { x: 1, y: 0 } : { x: 0, y: 1 }
    return { origin: anchor, dir }
  }
}
