import { V, Vec2 } from "./Vec2"
import { circleFrom3Points, normalizeAngle } from "./primitives"

/**
 * An arc segment of a polyline as AutoCAD's PLINE builds it from where the
 * chain stands: the point it runs to and its bulge, `tan(θ/4)` of the signed
 * included angle θ (positive counter-clockwise).
 */
export interface ArcSegment {
  readonly end: Vec2
  readonly bulge: number
}

const EPSILON = 1e-9

/** The bulge of an arc that turns through `included` radians. */
export function bulgeOfAngle(included: number): number {
  return Math.tan(included / 4)
}

/**
 * The direction a segment from `a` to `b` heads at `b`: the chord's for a
 * straight one; an arc's chord bisects its two tangents, so its exit is the
 * chord turned on by half the included angle. Null for a segment of no length.
 */
export function segmentExitTangent(
  a: Vec2,
  b: Vec2,
  bulge: number
): Vec2 | null {
  const chord = V.sub(b, a)
  const length = V.length(chord)
  if (length < EPSILON) return null
  return turn(V.scale(chord, 1 / length), 2 * Math.atan(bulge))
}

/**
 * The bulge of the arc leaving `start` along `tangent` to `end`: half the
 * turn from the tangent to the chord, since the chord bisects the arc's two
 * tangents. Null when `end` lies on the tangent's line, ahead or behind,
 * where no arc leaves that way (AutoCAD's `*Invalid*`).
 */
export function tangentArcBulge(
  start: Vec2,
  tangent: Vec2,
  end: Vec2
): number | null {
  const chord = V.sub(end, start)
  const length = V.length(chord)
  if (length < EPSILON) return null
  const turnAngle = signedAngle(tangent, V.scale(chord, 1 / length))
  if (Math.abs(Math.sin(turnAngle)) < EPSILON) return null
  return Math.tan(turnAngle / 2)
}

/** Where an arc of `included` radians about `center` from `start` ends. */
export function endAround(start: Vec2, center: Vec2, included: number): Vec2 {
  return V.add(center, turn(V.sub(start, center), included))
}

/**
 * CEnter and an endpoint: the arc about `center` from `start` to the ray
 * towards `toward`, counter-clockwise, or clockwise with Ctrl held. Null with
 * no radius or no ray.
 */
export function arcAroundToward(
  start: Vec2,
  center: Vec2,
  toward: Vec2,
  clockwise: boolean
): ArcSegment | null {
  const from = V.sub(start, center)
  const to = V.sub(toward, center)
  const radius = V.length(from)
  if (radius < EPSILON || V.length(to) < EPSILON) return null
  const ccw = normalizeAngle(
    Math.atan2(to.y, to.x) - Math.atan2(from.y, from.x)
  )
  if (ccw < EPSILON) return null
  const included = clockwise ? ccw - 2 * Math.PI : ccw
  return {
    end: endAround(start, center, included),
    bulge: bulgeOfAngle(included),
  }
}

/**
 * CEnter and a chord length: counter-clockwise, the minor arc for a positive
 * length and the major one for a negative, as AutoCAD 2027's console draws
 * them (pline/p117). Null for a chord longer than the diameter.
 */
export function arcAroundChord(
  start: Vec2,
  center: Vec2,
  chord: number,
  clockwise: boolean
): ArcSegment | null {
  const radius = V.distance(start, center)
  if (radius < EPSILON || Math.abs(chord) > 2 * radius + EPSILON) return null
  const minor = 2 * Math.asin(Math.min(1, Math.abs(chord) / (2 * radius)))
  if (minor < EPSILON) return null
  const sweep = chord >= 0 ? minor : 2 * Math.PI - minor
  const included = clockwise ? -sweep : sweep
  return {
    end: endAround(start, center, included),
    bulge: bulgeOfAngle(included),
  }
}

/**
 * An included angle, a radius and the direction of the chord (radians): the
 * chord runs that way for as long as the angle and radius make it, a
 * negative radius as long as its size (pline/p256, p257).
 */
export function arcAlongChord(
  start: Vec2,
  radius: number,
  included: number,
  direction: number
): ArcSegment {
  const length = 2 * Math.abs(radius) * Math.abs(Math.sin(included / 2))
  return {
    end: V.add(start, {
      x: length * Math.cos(direction),
      y: length * Math.sin(direction),
    }),
    bulge: bulgeOfAngle(included),
  }
}

/**
 * A radius and an endpoint: the minor arc for a positive radius and the major
 * one for a negative, counter-clockwise or clockwise with Ctrl held, whichever
 * side the end lies (AutoCAD 2027's console, pline/p121, p122). Null when the
 * end is farther than the diameter.
 */
export function radiusArcBulge(
  start: Vec2,
  end: Vec2,
  radius: number,
  clockwise: boolean
): number | null {
  const chord = V.distance(start, end)
  const size = Math.abs(radius)
  if (chord < EPSILON || chord > 2 * size + EPSILON) return null
  const minor = 2 * Math.asin(Math.min(1, chord / (2 * size)))
  const included = radius < 0 ? 2 * Math.PI - minor : minor
  return bulgeOfAngle(clockwise ? -included : included)
}

/**
 * The bulge of an arc segment of bulge `bulge` and radius `radius` whose ends
 * move to `start` and `end`, as AutoCAD 2023's CHAMFER refits one it cut as
 * its chord: the same radius, turn and side of a half circle (a half circle
 * stays the major arc). An end past the diameter opens it as far as the
 * chord asks, `s / (1 ± 0)` with `s` half the chord over the radius — the
 * console's `-1.0357` for a chord of 82.85 at radius 40.
 */
export function refitArcBulge(
  bulge: number,
  radius: number,
  start: Vec2,
  end: Vec2
): number {
  const s = V.distance(start, end) / (2 * radius)
  if (s < EPSILON) return 0
  const rise = Math.sqrt(Math.max(0, 1 - s * s))
  const magnitude = s / (Math.abs(bulge) >= 1 ? 1 - rise : 1 + rise)
  return bulge < 0 ? -magnitude : magnitude
}

/**
 * The bulge of an arc of bulge `bulge` on a chord `chord` long once its chord
 * is `newChord` long, its chord height kept on the same side, as AutoCAD's
 * STRETCH refits an arc caught at one end (transforms/p271, p281): the height
 * is half the chord times the bulge. Kept as it was on a chord of no length.
 */
export function sameHeightBulge(
  bulge: number,
  chord: number,
  newChord: number
): number {
  return newChord < EPSILON ? bulge : (bulge * chord) / newChord
}

/**
 * The bulge of the arc from `start` through `second` to `end`. Null when the
 * three lie on one line.
 */
export function arcThroughBulge(
  start: Vec2,
  second: Vec2,
  end: Vec2
): number | null {
  const circle = circleFrom3Points(start, second, end)
  if (!circle) return null
  const { center } = circle
  const a0 = Math.atan2(start.y - center.y, start.x - center.x)
  const a1 = Math.atan2(end.y - center.y, end.x - center.x)
  const ccw = normalizeAngle(a1 - a0)
  const turnsLeft = V.cross(V.sub(second, start), V.sub(end, second)) > 0
  return bulgeOfAngle(turnsLeft ? ccw : ccw - 2 * Math.PI)
}

/** Radians, `(-π, π]`, from `from` to `to`. */
function signedAngle(from: Vec2, to: Vec2): number {
  return Math.atan2(V.cross(from, to), V.dot(from, to))
}

/** `v` turned counter-clockwise by `angle` radians. */
function turn(v: Vec2, angle: number): Vec2 {
  const cos = Math.cos(angle)
  const sin = Math.sin(angle)
  return { x: v.x * cos - v.y * sin, y: v.x * sin + v.y * cos }
}
