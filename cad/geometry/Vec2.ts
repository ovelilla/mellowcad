/** Immutable, dependency-free 2D vector shared across the CAD system. */
export interface Vec2 {
  readonly x: number
  readonly y: number
}

export function vec2(x: number, y: number): Vec2 {
  return { x, y }
}

export const V = {
  zero(): Vec2 {
    return { x: 0, y: 0 }
  },

  add(a: Vec2, b: Vec2): Vec2 {
    return { x: a.x + b.x, y: a.y + b.y }
  },

  sub(a: Vec2, b: Vec2): Vec2 {
    return { x: a.x - b.x, y: a.y - b.y }
  },

  scale(a: Vec2, s: number): Vec2 {
    return { x: a.x * s, y: a.y * s }
  },

  /** Linear interpolation. `t = 0` returns `a`, `t = 1` returns `b`. */
  lerp(a: Vec2, b: Vec2, t: number): Vec2 {
    return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t }
  },

  midpoint(a: Vec2, b: Vec2): Vec2 {
    return { x: (a.x + b.x) * 0.5, y: (a.y + b.y) * 0.5 }
  },

  dot(a: Vec2, b: Vec2): number {
    return a.x * b.x + a.y * b.y
  },

  /** 2D cross product magnitude (z component of the 3D cross product). */
  cross(a: Vec2, b: Vec2): number {
    return a.x * b.y - a.y * b.x
  },

  length(a: Vec2): number {
    return Math.hypot(a.x, a.y)
  },

  lengthSq(a: Vec2): number {
    return a.x * a.x + a.y * a.y
  },

  distance(a: Vec2, b: Vec2): number {
    return Math.hypot(a.x - b.x, a.y - b.y)
  },

  distanceSq(a: Vec2, b: Vec2): number {
    const dx = a.x - b.x
    const dy = a.y - b.y
    return dx * dx + dy * dy
  },

  normalize(a: Vec2): Vec2 {
    const len = Math.hypot(a.x, a.y)
    if (len === 0) return { x: 0, y: 0 }
    return { x: a.x / len, y: a.y / len }
  },

  /** Rotate the vector 90° counter-clockwise. */
  perpendicular(a: Vec2): Vec2 {
    return { x: -a.y, y: a.x }
  },

  equals(a: Vec2, b: Vec2, epsilon = 1e-9): boolean {
    return Math.abs(a.x - b.x) <= epsilon && Math.abs(a.y - b.y) <= epsilon
  },
}
