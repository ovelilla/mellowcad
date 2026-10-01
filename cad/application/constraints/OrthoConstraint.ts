import { Vec2 } from "../../geometry/Vec2"
import { Vec3, WORLD_Z, withZ, zOf } from "../../geometry/Vec3"
import { Ray } from "../../geometry/primitives"
import { ucsDirectionToWorld, worldDirectionToUcs } from "../../domain/ucs"
import { Constraint, ConstraintContext, ConstraintType } from "./types"
import {
  PointAlongZ,
  alongZ,
  footOnScreen,
  lineOnScreen,
  withSnapHeight,
  zOnScreen,
} from "./zGuide"

type OrthoAxis = "x" | "y" | "z"

/**
 * Ortho mode, inspired by AutoCAD's ORTHO. Once a base point exists it locks the
 * candidate point to a horizontal or vertical line through the anchor. The axis
 * is chosen from the *predominant direction of the mouse*: if the cursor has
 * moved further horizontally than vertically from the anchor, the line is
 * horizontal; otherwise it is vertical. In a 3D view the UCS's Z is a third
 * line ("additionally restricts the cursor to the up and down directions"), and
 * the one drawn nearest the cursor wins.
 *
 * Composition with snapping: the axis is decided from the raw cursor, but the
 * free coordinate is taken from `point` (which is the snapped point when a snap
 * is active). So locking horizontally keeps `anchor.y` while adopting the
 * snapped X — Ortho and object snaps genuinely cooperate.
 */
export class OrthoConstraint implements Constraint {
  readonly type = ConstraintType.Ortho

  apply(context: ConstraintContext): Vec2 | PointAlongZ {
    const up = this.alongZ(context)
    if (up) return withSnapHeight(up, context.snapPoint)
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
  ray(context: ConstraintContext): Ray | null {
    const { anchor, ucs } = context
    const axis = this.axis(context)
    if (!anchor || axis === null || axis === "z") return null
    return {
      origin: anchor,
      dir: ucsDirectionToWorld(
        ucs,
        axis === "x" ? { x: 1, y: 0 } : { x: 0, y: 1 }
      ),
    }
  }

  alongZ(context: ConstraintContext): PointAlongZ | null {
    const { anchor, view, world } = context
    if (!anchor || this.axis(context) !== "z") return null
    return alongZ(view, anchor, view.worldToScreen(world))?.point ?? null
  }

  private axis(context: ConstraintContext): OrthoAxis | null {
    const { anchor, world, ucs, view } = context
    if (!anchor) return null
    if (zOnScreen(view) === null) {
      const local = worldDirectionToUcs(ucs, {
        x: world.x - anchor.x,
        y: world.y - anchor.y,
      })
      return Math.abs(local.x) >= Math.abs(local.y) ? "x" : "y"
    }
    // WHY on the screen: AutoCAD does not publish the rule; the line the user
    // sees the cursor beside is the one meant ("when my reference point is too
    // high, it thinks I want to move my object vertically").
    const base: Vec3 = withZ(anchor, zOf(anchor))
    const screen = view.worldToScreen(world)
    const off = (dir: Vec3) =>
      footOnScreen(lineOnScreen(view, base, dir), screen)?.pixels ?? Infinity
    const along = (axis: Vec2) => withZ(ucsDirectionToWorld(ucs, axis), 0)
    const pixels: Record<OrthoAxis, number> = {
      x: off(along({ x: 1, y: 0 })),
      y: off(along({ x: 0, y: 1 })),
      z: off(WORLD_Z),
    }
    let best: OrthoAxis = "x"
    for (const axis of ["y", "z"] as const) {
      if (pixels[axis] < pixels[best]) best = axis
    }
    return best
  }
}
