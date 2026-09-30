import { Vec2 } from "./Vec2"
import {
  Vec3,
  WORLD_Y,
  WORLD_Z,
  add3,
  cross3,
  dot3,
  normalize3,
  scale3,
  zOf,
} from "./Vec3"

/** Three orthonormal axes, right-handed: `z = x × y`. */
export interface Axes3 {
  readonly x: Vec3
  readonly y: Vec3
  readonly z: Vec3
}

/** DXF's bound on the "square polar cap", exact in six decimal and six binary digits. */
const POLAR_CAP = 1 / 64

/**
 * The object coordinate system of a plane with this normal, by DXF's
 * Arbitrary Axis Algorithm: the one X axis AutoCAD pairs with a given Z.
 * Returns `null` for a zero normal.
 */
export function arbitraryAxis(normal: Vec3): Axes3 | null {
  const z = normalize3(normal)
  if (!z) return null
  const near =
    Math.abs(z.x) < POLAR_CAP && Math.abs(z.y) < POLAR_CAP ? WORLD_Y : WORLD_Z
  const x = normalize3(cross3(near, z))
  if (!x) return null
  const y = normalize3(cross3(z, x))
  if (!y) return null
  return { x, y, z }
}

/** A point given in `axes` (a Vec2 lies on their XY plane) as world coordinates. */
export function axesToWorld(axes: Axes3, point: Vec2 | Vec3): Vec3 {
  return add3(
    add3(scale3(axes.x, point.x), scale3(axes.y, point.y)),
    scale3(axes.z, zOf(point))
  )
}

/** A world point in `axes`: the inverse of {@link axesToWorld}. */
export function worldToAxes(axes: Axes3, point: Vec2 | Vec3): Vec3 {
  const p: Vec3 = { x: point.x, y: point.y, z: zOf(point) }
  return { x: dot3(p, axes.x), y: dot3(p, axes.y), z: dot3(p, axes.z) }
}
