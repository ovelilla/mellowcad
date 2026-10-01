import { Vec3, cross3, normalize3, scale3, sub3 } from "../../geometry/Vec3"
import { arbitraryAxis, worldToAxes } from "../../geometry/ocs"

/** Below this the three points' heights count as one: their plane is level. */
const LEVEL = 1e-9

/** The plane through three points that do not share a height. */
export interface PlaneThrough {
  /** Unit, facing up the UCS's Z where it can (the frame's +Z). */
  readonly normal: Vec3
  /** The points as the plane's OCS reads them: level, at their common Z. */
  readonly points: readonly [Vec3, Vec3, Vec3]
}

/**
 * The plane CIRCLE and ARC by three points lie in when the points are at
 * different heights: AutoCAD builds the curve through them in their own plane.
 * `null` when they share a height, or lie on one line, and the plan reads them.
 */
export function planeThrough(
  p1: Vec3,
  p2: Vec3,
  p3: Vec3
): PlaneThrough | null {
  if (Math.abs(p2.z - p1.z) <= LEVEL && Math.abs(p3.z - p1.z) <= LEVEL) {
    return null
  }
  const unit = normalize3(cross3(sub3(p2, p1), sub3(p3, p1)))
  if (!unit) return null
  const normal = unit.z < 0 ? scale3(unit, -1) : unit
  const axes = arbitraryAxis(normal)
  if (!axes) return null
  return {
    normal,
    points: [
      worldToAxes(axes, p1),
      worldToAxes(axes, p2),
      worldToAxes(axes, p3),
    ],
  }
}
