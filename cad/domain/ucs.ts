import { Vec2 } from "../geometry/Vec2"
import {
  Vec3,
  add3,
  cross3,
  dot3,
  length3,
  normalize3,
  scale3,
  sub3,
  zOf,
} from "../geometry/Vec3"
import { Axes3 } from "../geometry/ocs"

/**
 * A user coordinate system: an origin and the directions of its X and Y axes,
 * all in the WCS. The axes are unit and square to each other, and Z is X × Y,
 * so the frame is rigid and right-handed; its XY plane may lie at any angle.
 */
export interface Ucs {
  readonly origin: Vec3
  /** Unit vectors: kept as directions, not angles, so they map like points. */
  readonly xAxis: Vec3
  readonly yAxis: Vec3
  /**
   * The WCS as the frame this UCS is given in reads it, when that frame is
   * not the WCS itself (the tools' frame of a tilted UCS): what `*` reads a
   * typed point in.
   */
  readonly wcs?: Ucs
}

/** A UCS saved by name (UCS Named Save), kept in the drawing's UCS table. */
export interface NamedUcs {
  readonly name: string
  readonly ucs: Ucs
}

export const WORLD_UCS: Ucs = {
  origin: { x: 0, y: 0, z: 0 },
  xAxis: { x: 1, y: 0, z: 0 },
  yAxis: { x: 0, y: 1, z: 0 },
}

const EPSILON = 1e-12

/**
 * A UCS whose XY plane is level, its X axis along `xDirection` in plan. An
 * origin given without a Z lies on Z = 0.
 */
export function createUcs(origin: Vec2 | Vec3, xDirection: Vec2): Ucs | null {
  const length = Math.hypot(xDirection.x, xDirection.y)
  if (!(length > EPSILON) || !Number.isFinite(length)) return null
  const x = xDirection.x / length
  const y = xDirection.y / length
  return {
    origin: { x: origin.x, y: origin.y, z: zOf(origin) },
    xAxis: { x, y, z: 0 },
    yAxis: { x: 0 - y, y: x, z: 0 },
  }
}

/**
 * The UCS at `origin` with its X axis along `xDirection` and `towardsY` on
 * the positive Y side of its XY plane (UCS's three points), or `null` when
 * the two directions do not fix a plane.
 */
export function ucsFromAxes(
  origin: Vec3,
  xDirection: Vec3,
  towardsY: Vec3
): Ucs | null {
  const x = normalize3(xDirection)
  if (!x) return null
  const normal = cross3(x, towardsY)
  const z = normalize3(normal)
  if (!z || length3(normal) < EPSILON * length3(towardsY)) return null
  if (Math.abs(z.x) < EPSILON && Math.abs(z.y) < EPSILON && z.z > 0) {
    return createUcs(origin, x)
  }
  // `+ 0` turns a -0, which reads as a different axis to an exact compare, into 0.
  const clean = (v: Vec3): Vec3 => ({ x: v.x + 0, y: v.y + 0, z: v.z + 0 })
  return { origin, xAxis: clean(x), yAxis: clean(cross3(z, x)) }
}

/** The UCS's Z axis, X × Y. */
export function ucsZAxis(ucs: Ucs): Vec3 {
  return isUpright(ucs) ? { x: 0, y: 0, z: 1 } : cross3(ucs.xAxis, ucs.yAxis)
}

/** The UCS's axes as a coordinate system: what its points are given in. */
export function ucsAxes(ucs: Ucs): Axes3 {
  return { x: ucs.xAxis, y: ucs.yAxis, z: ucsZAxis(ucs) }
}

/**
 * Whether the UCS's XY plane is level with its Z up, as every UCS was before
 * one could tilt: its points then read in plan with the 2D formulas, to the bit.
 */
export function isUpright(ucs: Ucs): boolean {
  const { xAxis: x, yAxis: y } = ucs
  return x.z === 0 && y.z === 0 && y.x === -x.y && y.y === x.x
}

export function isWorldUcs(ucs: Ucs): boolean {
  return (
    Math.abs(ucs.origin.x) < 1e-9 &&
    Math.abs(ucs.origin.y) < 1e-9 &&
    Math.abs(ucs.origin.z) < 1e-9 &&
    Math.abs(ucs.xAxis.x - 1) < 1e-12 &&
    Math.abs(ucs.xAxis.y) < 1e-12 &&
    Math.abs(ucs.xAxis.z) < 1e-12 &&
    Math.abs(ucs.yAxis.x) < 1e-12 &&
    Math.abs(ucs.yAxis.y - 1) < 1e-12 &&
    Math.abs(ucs.yAxis.z) < 1e-12
  )
}

export function sameUcs(a: Ucs, b: Ucs): boolean {
  const close = (u: Vec3, v: Vec3, tolerance: number) =>
    Math.abs(u.x - v.x) < tolerance &&
    Math.abs(u.y - v.y) < tolerance &&
    Math.abs(u.z - v.z) < tolerance
  return (
    close(a.origin, b.origin, 1e-9) &&
    close(a.xAxis, b.xAxis, 1e-12) &&
    close(a.yAxis, b.yAxis, 1e-12)
  )
}

/**
 * The angle of the UCS X axis in plan, radians CCW from the world X axis:
 * what an absolute angle is measured from in a level UCS.
 */
export function ucsRotation(ucs: Ucs): number {
  return Math.atan2(ucs.xAxis.y, ucs.xAxis.x)
}

/** A direction given in UCS axes (without a Z, in its XY plane), as a world direction. */
export function ucsDirectionToWorld(ucs: Ucs, direction: Vec2 | Vec3): Vec3 {
  if (isUpright(ucs)) {
    const { x: c, y: s } = ucs.xAxis
    return {
      x: direction.x * c - direction.y * s,
      y: direction.x * s + direction.y * c,
      z: zOf(direction),
    }
  }
  return add3(
    add3(scale3(ucs.xAxis, direction.x), scale3(ucs.yAxis, direction.y)),
    scale3(ucsZAxis(ucs), zOf(direction))
  )
}

/** A world direction (without a Z, in the world's XY plane), in UCS axes. */
export function worldDirectionToUcs(ucs: Ucs, direction: Vec2 | Vec3): Vec3 {
  if (isUpright(ucs)) {
    const { x: c, y: s } = ucs.xAxis
    return {
      x: direction.x * c + direction.y * s,
      y: -direction.x * s + direction.y * c,
      z: zOf(direction),
    }
  }
  const v: Vec3 = { x: direction.x, y: direction.y, z: zOf(direction) }
  return {
    x: dot3(v, ucs.xAxis),
    y: dot3(v, ucs.yAxis),
    z: dot3(v, ucsZAxis(ucs)),
  }
}

/** A point given without a Z lies on the UCS's XY plane. */
export function ucsPointToWorld(ucs: Ucs, point: Vec2 | Vec3): Vec3 {
  if (!isUpright(ucs)) return add3(ucs.origin, ucsDirectionToWorld(ucs, point))
  const offset = ucsDirectionToWorld(ucs, { x: point.x, y: point.y })
  return {
    x: ucs.origin.x + offset.x,
    y: ucs.origin.y + offset.y,
    z: ucs.origin.z + zOf(point),
  }
}

/** A world point given without a Z lies on the world's XY plane. */
export function worldPointToUcs(ucs: Ucs, point: Vec2 | Vec3): Vec3 {
  if (!isUpright(ucs)) {
    return worldDirectionToUcs(
      ucs,
      sub3({ x: point.x, y: point.y, z: zOf(point) }, ucs.origin)
    )
  }
  const inPlane = worldDirectionToUcs(ucs, {
    x: point.x - ucs.origin.x,
    y: point.y - ucs.origin.y,
  })
  return { x: inPlane.x, y: inPlane.y, z: zOf(point) - ucs.origin.z }
}

/** An absolute angle measured from the X axis of a level UCS, as one from the world's. */
export function ucsAngleToWorld(ucs: Ucs, radians: number): number {
  return radians + ucsRotation(ucs)
}

/** A world angle, measured from the X axis of a level UCS instead. */
export function worldAngleToUcs(ucs: Ucs, radians: number): number {
  return radians - ucsRotation(ucs)
}

/**
 * The UCS turned about one of its own axes by `radians`, the right-hand rule
 * giving the positive sense (UCS X, Y and Z).
 */
export function rotateUcs(
  ucs: Ucs,
  axis: "x" | "y" | "z",
  radians: number
): Ucs {
  const cos = Math.cos(radians)
  const sin = Math.sin(radians)
  if (axis === "z" && isUpright(ucs)) {
    const xAxis = ucsDirectionToWorld(ucs, { x: cos, y: sin })
    return {
      origin: ucs.origin,
      xAxis,
      yAxis: { x: 0 - xAxis.y, y: xAxis.x, z: 0 },
    }
  }
  const { xAxis: x, yAxis: y } = ucs
  const z = ucsZAxis(ucs)
  const turn = (u: Vec3, v: Vec3) => add3(scale3(u, cos), scale3(v, sin))
  switch (axis) {
    case "x":
      return { origin: ucs.origin, xAxis: x, yAxis: turn(y, z) }
    case "y":
      return { origin: ucs.origin, xAxis: turn(x, scale3(z, -1)), yAxis: y }
    case "z":
      return {
        origin: ucs.origin,
        xAxis: turn(x, y),
        yAxis: turn(y, scale3(x, -1)),
      }
  }
}
