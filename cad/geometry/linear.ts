import { Vec2 } from "./Vec2"

/** A linear map of the plane, `[a, b, c, d]`: x' = a·x + c·y, y' = b·x + d·y. */
export type Linear2 = readonly [number, number, number, number]

export function applyLinear([a, b, c, d]: Linear2, v: Vec2): Vec2 {
  return { x: a * v.x + c * v.y, y: b * v.x + d * v.y }
}

/** `outer` after `inner`. */
export function composeLinear(outer: Linear2, inner: Linear2): Linear2 {
  const [p, q, r, t] = outer
  const [a, b, c, d] = inner
  return [p * a + r * b, q * a + t * b, p * c + r * d, q * c + t * d]
}

export function linearDeterminant([a, b, c, d]: Linear2): number {
  return a * d - b * c
}

/** The map undone, or null for one that flattens the plane. */
export function inverseLinear(map: Linear2): Linear2 | null {
  const [a, b, c, d] = map
  const det = linearDeterminant(map)
  if (!(Math.abs(det) > 1e-12)) return null
  return [d / det, -b / det, -c / det, a / det]
}

/** The turn by `radians`, counter-clockwise. */
export function rotationLinear(radians: number): Linear2 {
  const cos = Math.cos(radians)
  const sin = Math.sin(radians)
  return [cos, sin, -sin, cos]
}
