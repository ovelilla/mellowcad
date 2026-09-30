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

export function withZ(point: Vec2, z: number): Vec3 {
  return { x: point.x, y: point.y, z }
}

/** `point` at the height of `source`: a move in the plane keeps the Z. */
export function withZOf(point: Vec2, source: Vec2 | Vec3): Vec3 {
  return withZ(point, zOf(source))
}

/** The point without its Z, for a field the model keeps in the plane. */
export function planar(point: Vec2 | Vec3): Vec2 {
  return { x: point.x, y: point.y }
}

/** The displacement from `from` to `to`, Z included. */
export function sub3(to: Vec3, from: Vec3): Vec3 {
  return { x: to.x - from.x, y: to.y - from.y, z: to.z - from.z }
}
