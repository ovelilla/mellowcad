import { Vec2, V } from "../../geometry/Vec2"
import { Vec3, zOf } from "../../geometry/Vec3"
import { Ray } from "../../geometry/primitives"
import { Viewport } from "../Viewport"

/**
 * Below this the UCS's Z seen on the screen is shorter than this share of its
 * length: the plan, or so near it that one pixel along the guide would be tens
 * of units, so there is no guide to point along.
 */
const MIN_Z_ON_SCREEN = 0.05

/** A point a drawing aid put on the UCS's Z through a base point: the base's in plan, `z` its height. */
export interface PointAlongZ extends Vec3 {
  readonly alongZ: true
}

export function isAlongZ(point: Vec2): point is PointAlongZ {
  return "alongZ" in point
}

/** Where a screen point falls along a line drawn on the screen: its parameter and how many pixels off it. */
export interface ScreenFoot {
  readonly t: number
  readonly pixels: number
}

/**
 * The screen pixels one unit along the UCS's Z moves (in the frame, where it is
 * the Z), or `null` where it is too short to point along: in plan, from below,
 * nearly so. Only where it is not does a 3D view offer the `+Z` / `-Z` guide.
 */
export function zOnScreen(view: Viewport): Vec2 | null {
  if (view.isPlan) return null
  const { right, up } = view
  if (Math.hypot(right.z, up.z) < MIN_Z_ON_SCREEN) return null
  return { x: right.z * view.scale, y: -up.z * view.scale }
}

/** A line of the frame through `origin` along `dir`, as drawn: its direction is pixels per unit. */
export function lineOnScreen(view: Viewport, origin: Vec3, dir: Vec3): Ray {
  const { right, up, scale } = view
  return {
    origin: view.worldToScreen(origin),
    dir: {
      x: (dir.x * right.x + dir.y * right.y + dir.z * right.z) * scale,
      y: -(dir.x * up.x + dir.y * up.y + dir.z * up.z) * scale,
    },
  }
}

/** The foot of `screen` on a line drawn on the screen, or `null` for one drawn as a point. */
export function footOnScreen(line: Ray, screen: Vec2): ScreenFoot | null {
  const squared = V.dot(line.dir, line.dir)
  if (!(squared > 1e-18)) return null
  const offset = V.sub(screen, line.origin)
  return {
    t: V.dot(offset, line.dir) / squared,
    pixels: Math.abs(V.cross(offset, line.dir)) / Math.sqrt(squared),
  }
}

/** The point of a line of the frame drawn nearest `screen`, or `null` for one drawn as a point. */
export function nearestOnScreen(
  view: Viewport,
  origin: Vec3,
  dir: Vec3,
  screen: Vec2
): Vec3 | null {
  const foot = footOnScreen(lineOnScreen(view, origin, dir), screen)
  if (foot === null) return null
  return {
    x: origin.x + dir.x * foot.t,
    y: origin.y + dir.y * foot.t,
    z: origin.z + dir.z * foot.t,
  }
}

/** The point of the Z through `base` drawn nearest `screen`, and how far off it the screen point is. */
export function alongZ(
  view: Viewport,
  base: Vec2 | Vec3,
  screen: Vec2
): { readonly point: PointAlongZ; readonly pixels: number } | null {
  const dir = zOnScreen(view)
  if (dir === null) return null
  const z = zOf(base)
  const foot = footOnScreen(
    { origin: view.worldToScreen({ x: base.x, y: base.y, z }), dir },
    screen
  )
  if (foot === null) return null
  return {
    point: { x: base.x, y: base.y, z: z + foot.t, alongZ: true },
    pixels: foot.pixels,
  }
}

/**
 * A snapped point taken onto the Z guide, as a snap is taken onto a polar ray:
 * the guide decided from the raw cursor, the height from the object.
 */
export function withSnapHeight(
  point: PointAlongZ,
  snap: Vec2 | null
): PointAlongZ {
  if (snap === null || !("z" in snap)) return point
  return { ...point, z: zOf(snap) }
}

/** The point of a line of the frame drawn at the screen point where it crosses another drawn line. */
export function crossingOnScreen(
  view: Viewport,
  origin: Vec3,
  dir: Vec3,
  other: Ray
): Vec3 | null {
  const line = lineOnScreen(view, origin, dir)
  const denom = V.cross(line.dir, other.dir)
  if (Math.abs(denom) <= 1e-9 * V.length(line.dir) * V.length(other.dir)) {
    return null
  }
  const t = V.cross(V.sub(other.origin, line.origin), other.dir) / denom
  return {
    x: origin.x + dir.x * t,
    y: origin.y + dir.y * t,
    z: origin.z + dir.z * t,
  }
}
