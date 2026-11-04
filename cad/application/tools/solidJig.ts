import { V, Vec2 } from "../../geometry/Vec2"
import { Vec3, add3, scale3 } from "../../geometry/Vec3"
import { THEME } from "../../scene/theme"
import type { ScenePrimitive } from "../../scene/types"
import type { Viewport } from "../Viewport"
import { axisOnScreen } from "./heightPick"

/**
 * How far beside the axis the height's dimension runs, on the screen: 37–38
 * px at two zooms (desktop primitives/d01, d11), so a fixed distance.
 */
const DIMENSION_OFFSET_PX = 38

/**
 * The amber dashed band from a prompt's base to the cursor, as CIRCLE's
 * radius draws it: a solid's radius, diameter, tube, top and height (desktop
 * primitives/d02, d07, d11); SOLIDEDIT's and SLICE's later points
 * (solid-edits/d02, d05).
 */
export function sizeBand(view: Viewport, from: Vec3, to: Vec3): ScenePrimitive {
  return {
    kind: "segment",
    a: view.worldToScreen(from),
    b: view.worldToScreen(to),
    stroke: { color: THEME.dashedRubberBand, width: 1, dash: [2, 3] },
  }
}

/**
 * The dotted dimension AutoCAD draws beside a height off the plan: from
 * `base` out to `side` (a unit vector across the axis), up along `axis` (a
 * unit vector) as far as the height, and back to the axis (desktop
 * primitives/d01, d11: beside the UCS's Y from the base or the far corner).
 * None in plan, where the axis is a point and the band shows the height.
 */
export function heightDimension(
  view: Viewport,
  base: Vec3,
  axis: Vec3,
  height: number,
  side: Vec3
): ScenePrimitive[] {
  if (height === 0 || !axisOnScreen(view, axis)) return []
  const a = view.worldToScreen(base)
  const b = view.worldToScreen(add3(base, scale3(axis, height)))
  const across = V.sub(view.worldToScreen(add3(base, side)), a)
  // A side seen end on gives no way out: the screen's square to the axis.
  const way =
    V.length(across) > 0.05 * view.scale ? across : V.perpendicular(V.sub(b, a))
  const offset = V.scale(V.normalize(way), DIMENSION_OFFSET_PX)
  const dotted = (from: Vec2, to: Vec2): ScenePrimitive => ({
    kind: "segment",
    a: from,
    b: to,
    stroke: { color: THEME.crosshair, width: 1, dash: [1, 2] },
  })
  return [
    dotted(a, V.add(a, offset)),
    dotted(V.add(a, offset), V.add(b, offset)),
    dotted(b, V.add(b, offset)),
  ]
}
