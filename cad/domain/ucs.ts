import { Vec2 } from "../geometry/Vec2"

/**
 * A user coordinate system in the plane: an origin and the direction of its X
 * axis, both in the WCS. Y is X turned a quarter CCW and Z is the world's, so
 * the frame is rigid and never mirrored — tilting or flipping it needs a Z the
 * model does not have yet.
 */
export interface Ucs {
  readonly origin: Vec2
  /** Unit vector: kept as a direction, not an angle, so it maps like a point. */
  readonly xAxis: Vec2
}

/** A UCS saved by name (UCS Named Save), kept in the drawing's UCS table. */
export interface NamedUcs {
  readonly name: string
  readonly ucs: Ucs
}

export const WORLD_UCS: Ucs = {
  origin: { x: 0, y: 0 },
  xAxis: { x: 1, y: 0 },
}

const EPSILON = 1e-12

export function createUcs(origin: Vec2, xDirection: Vec2): Ucs | null {
  const length = Math.hypot(xDirection.x, xDirection.y)
  if (!(length > EPSILON) || !Number.isFinite(length)) return null
  return {
    origin,
    xAxis: { x: xDirection.x / length, y: xDirection.y / length },
  }
}

export function isWorldUcs(ucs: Ucs): boolean {
  return (
    Math.abs(ucs.origin.x) < 1e-9 &&
    Math.abs(ucs.origin.y) < 1e-9 &&
    Math.abs(ucs.xAxis.x - 1) < 1e-12 &&
    Math.abs(ucs.xAxis.y) < 1e-12
  )
}

export function sameUcs(a: Ucs, b: Ucs): boolean {
  return (
    Math.abs(a.origin.x - b.origin.x) < 1e-9 &&
    Math.abs(a.origin.y - b.origin.y) < 1e-9 &&
    Math.abs(a.xAxis.x - b.xAxis.x) < 1e-12 &&
    Math.abs(a.xAxis.y - b.xAxis.y) < 1e-12
  )
}

/** The angle of the UCS X axis, radians CCW from the world X axis. */
export function ucsRotation(ucs: Ucs): number {
  return Math.atan2(ucs.xAxis.y, ucs.xAxis.x)
}

/** A direction given in UCS axes, as a world direction. */
export function ucsDirectionToWorld(ucs: Ucs, direction: Vec2): Vec2 {
  const { x: c, y: s } = ucs.xAxis
  return {
    x: direction.x * c - direction.y * s,
    y: direction.x * s + direction.y * c,
  }
}

/** A world direction, in UCS axes. */
export function worldDirectionToUcs(ucs: Ucs, direction: Vec2): Vec2 {
  const { x: c, y: s } = ucs.xAxis
  return {
    x: direction.x * c + direction.y * s,
    y: -direction.x * s + direction.y * c,
  }
}

export function ucsPointToWorld(ucs: Ucs, point: Vec2): Vec2 {
  const offset = ucsDirectionToWorld(ucs, point)
  return { x: ucs.origin.x + offset.x, y: ucs.origin.y + offset.y }
}

export function worldPointToUcs(ucs: Ucs, point: Vec2): Vec2 {
  return worldDirectionToUcs(ucs, {
    x: point.x - ucs.origin.x,
    y: point.y - ucs.origin.y,
  })
}

/** An absolute angle measured from the UCS X axis, as one from the world's. */
export function ucsAngleToWorld(ucs: Ucs, radians: number): number {
  return radians + ucsRotation(ucs)
}

/** A world angle, measured from the UCS X axis instead. */
export function worldAngleToUcs(ucs: Ucs, radians: number): number {
  return radians - ucsRotation(ucs)
}

/** The UCS turned about its own Z axis by `radians` (UCS Z). */
export function rotateUcs(ucs: Ucs, radians: number): Ucs {
  const cos = Math.cos(radians)
  const sin = Math.sin(radians)
  return {
    origin: ucs.origin,
    xAxis: ucsDirectionToWorld(ucs, { x: cos, y: sin }),
  }
}
