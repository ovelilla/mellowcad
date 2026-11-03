import { Vec3, dot3, length3, sub3 } from "../../geometry/Vec3"
import { footOnScreen, lineOnScreen } from "../constraints/zGuide"
import type { Viewport } from "../Viewport"
import type { PointerInput } from "./Tool"

/**
 * Below this an axis seen on the screen is shorter than this share of its
 * length, as the UCS's Z is in plan: there is no way along it to read.
 */
const MIN_AXIS_ON_SCREEN = 0.05

/**
 * A height given with the mouse where a solid rises along `axis` (a unit
 * vector) from `base`: BOX's, CYLINDER's, CONE's, PYRAMID's and EXTRUDE's.
 * Where the axis shows on the screen it is read along it, with its sign: a
 * point an object snap or a tracking guide gave by how far it lies along the
 * axis, so another solid's top corner gives its height (desktop solid/d13,
 * extrude/d05; console solid/z01, z02, below it too), and the free cursor by
 * where it falls on the axis as drawn, however far beside it (solid/d11,
 * d12, extrude/d02–d04). WHY not the distance to the cursor on the work
 * plane: that point runs away from the base faster or slower than the mouse
 * moves, and is never below it. In plan, where the axis is a point, the
 * distance to the point picked (solid/d14, z03). A point typed is read where
 * the cursor would be on it: {@link pointAsCursor}.
 */
export function pickedHeight(
  input: Pick<PointerInput, "screen" | "point" | "snap" | "tracking">,
  base: Vec3,
  axis: Vec3,
  view: Viewport
): number {
  const line = lineOnScreen(view, base, axis)
  if (Math.hypot(line.dir.x, line.dir.y) < MIN_AXIS_ON_SCREEN * view.scale) {
    return length3(sub3(input.point, base))
  }
  if (input.snap || input.tracking) {
    return dot3(sub3(input.point, base), axis)
  }
  return footOnScreen(line, input.screen)?.t ?? 0
}

/**
 * A point typed for a height, as {@link pickedHeight} reads it: the cursor
 * on it, so off the plan by where it falls on the axis as drawn (console
 * solid/z01: 100,200,0 from 300,500,0 in SE Isometric is -50; z02), in plan
 * its distance (p06).
 */
export function pointAsCursor(
  point: Vec3,
  view: Viewport
): Pick<PointerInput, "screen" | "point" | "snap" | "tracking"> {
  return {
    screen: view.worldToScreen(point),
    point,
    snap: null,
    tracking: null,
  }
}
