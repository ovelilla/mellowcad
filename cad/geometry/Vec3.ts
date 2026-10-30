import { Vec2 } from "./Vec2"

/**
 * A point or displacement with a Z. Most of the kernel's curves stay in
 * `Vec2`: a planar object's Z is one number beside its points rather than a
 * third coordinate on each of them. A spline's and a 3D polyline's points
 * carry their own.
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

export function add3(a: Vec3, b: Vec3): Vec3 {
  return { x: a.x + b.x, y: a.y + b.y, z: a.z + b.z }
}

export function scale3(v: Vec3, k: number): Vec3 {
  return { x: v.x * k, y: v.y * k, z: v.z * k }
}

export function dot3(a: Vec3, b: Vec3): number {
  return a.x * b.x + a.y * b.y + a.z * b.z
}

export function cross3(a: Vec3, b: Vec3): Vec3 {
  return {
    x: a.y * b.z - a.z * b.y,
    y: a.z * b.x - a.x * b.z,
    z: a.x * b.y - a.y * b.x,
  }
}

export function length3(v: Vec3): number {
  return Math.hypot(v.x, v.y, v.z)
}

/** `v` at unit length, or `null` for a zero or non-finite vector. */
export function normalize3(v: Vec3): Vec3 | null {
  const length = length3(v)
  if (!(length > 0) || !Number.isFinite(length)) return null
  return scale3(v, 1 / length)
}

export const WORLD_X: Vec3 = { x: 1, y: 0, z: 0 }
export const WORLD_Y: Vec3 = { x: 0, y: 1, z: 0 }
export const WORLD_Z: Vec3 = { x: 0, y: 0, z: 1 }
