import { Vec2 } from "../../geometry/Vec2"
import { Ray } from "../../geometry/primitives"
import { ucsDirectionToWorld, worldDirectionToUcs } from "../../domain/ucs"
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

  apply(context: ConstraintContext): Vec2 {
    const ray = this.ray(context)
    if (!ray) return context.point
    const { point } = context
    const along =
      (point.x - ray.origin.x) * ray.dir.x +
      (point.y - ray.origin.y) * ray.dir.y
    return {
      x: ray.origin.x + ray.dir.x * along,
      y: ray.origin.y + ray.dir.y * along,
    }
  }

  /** The horizontal or vertical line of the UCS currently locked through the anchor. */
  ray({ anchor, world, ucs }: ConstraintContext): Ray | null {
    if (!anchor) return null
    const local = worldDirectionToUcs(ucs, {
      x: world.x - anchor.x,
      y: world.y - anchor.y,
    })
    const axis =
      Math.abs(local.x) >= Math.abs(local.y) ? { x: 1, y: 0 } : { x: 0, y: 1 }
    return { origin: anchor, dir: ucsDirectionToWorld(ucs, axis) }
  }
}
