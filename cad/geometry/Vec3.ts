import { Vec2 } from "./Vec2"

/**
 * A point or displacement with a Z. The kernel's curves stay in `Vec2`: every
 * object is planar with its normal on +Z, so its Z is one number beside its
 * points rather than a third coordinate on each of them.
 */
export interface Vec3 extends Vec2 {
  readonly z: number
}

export function vec3(x: number, y: number, z: number): Vec3 {
  return { x, y, z }
}

/** The Z of a point that may not have one: a 2D point lies on Z = 0. */
export function zOf(point: Vec2 | Vec3): number {
  return "z" in point ? point.z : 0
}
