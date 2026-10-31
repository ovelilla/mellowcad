import { Vec2, V } from "./Vec2"
import type { BSplineCurve } from "./nurbs"

/**
 * A smooth curve in the plane, by its parameter: what OFFSET approximates the
 * offset of. `breaks` are where its pieces meet inside `(start, end)`, where
 * the approximation's spans begin.
 */
export interface PlanarCurve {
  readonly start: number
  readonly end: number
  readonly closed: boolean
  readonly breaks: readonly number[]
  point(t: number): Vec2
  first(t: number): Vec2
  second(t: number): Vec2
  /** How far `p` lies from the curve's nearest point. */
  distance(p: Vec2): number
}

/** One piece of an offset: a cubic on the source's own parameter. */
export interface OffsetCurvePiece {
  readonly curve: BSplineCurve
  readonly closed: boolean
}

/**
 * How far AutoCAD 2027's offset of a spline or an ellipse strays from the
 * exact one, in drawing units whatever the curve's size: its spans keep
 * within it at 0.05 across as at 500 (probes spline-knots/k38, k39, k55,
 * offset/p196, p197; 4.65e-4 to 9.86e-4 at most).
 */
export const OFFSET_CURVE_TOLERANCE = 1e-3

/**
 * The offset of `curve` at `distance`, to its left where positive, as AutoCAD
 * 2027 makes it of a spline or an ellipse: a cubic on the source's parameter
 * with every inner knot double, each span the Hermite cubic of the exact
 * offset's points and derivatives at its ends (offset/p196–p198, whose
 * control points follow from their knots this way). A span whose error
 * exceeds {@link OFFSET_CURVE_TOLERANCE} is split into as many equal ones as
 * the error's fourth root asks, as AutoCAD's runs of equal spans suggest;
 * where its knots fall is AutoCAD's own (its spans are not reproduced, their
 * tolerance is). Where the offset crosses itself it is cut there and what
 * comes nearer the curve than `distance` dropped, a closed one's pieces cut at
 * its seam too (k38, k42, k52); nothing left, or a corner on the curve (k51,
 * k54), and there is none.
 */
export function offsetCurvePieces(
  curve: PlanarCurve,
  distance: number
): OffsetCurvePiece[] {
  if (!(curve.end > curve.start) || hasCorner(curve)) return []
  const offset = offsetFunctions(curve, distance)
  const whole = adaptiveKnots(curve, offset, curve.start, curve.end)
  if (!whole) return []
  const cuts = selfCrossings(curve, offset, whole)
  const reach = Math.abs(distance) * (1 - 1e-6)
  const kept = (a: number, b: number) =>
    curve.distance(offset.point((a + b) / 2)) >= reach
  if (cuts.length === 0) {
    return kept(curve.start, curve.end)
      ? [
          {
            curve: hermiteCurve(offset, whole, curve.closed),
            closed: curve.closed,
          },
        ]
      : []
  }
  const bounds = [curve.start, ...cuts, curve.end]
  const pieces: OffsetCurvePiece[] = []
  const tiny = (curve.end - curve.start) * 1e-9
  for (let i = 1; i < bounds.length; i++) {
    const a = bounds[i - 1]
    const b = bounds[i]
    if (b - a <= tiny || !kept(a, b)) continue
    const knots = adaptiveKnots(curve, offset, a, b)
    if (knots) {
      pieces.push({ curve: hermiteCurve(offset, knots, false), closed: false })
    }
  }
  // WHY: a closed curve's pieces come last one first, then on from its start
  // (spline-knots/k38, k52); an open one's in order (k42).
  if (curve.closed && pieces.length > 1) pieces.unshift(pieces.pop()!)
  return pieces
}

export interface OffsetFunctions {
  point(t: number): Vec2
  first(t: number): Vec2
}

/**
 * `O = C + d·N` with `N` the unit left normal, and its derivative
 * `O′ = C′ + d·N′`, `N′ = (⊥C″·|C′|² − ⊥C′·(C′·C″)) / |C′|³`: the exact
 * offset OFFSET approximates and FILLET's centres lie on.
 */
export function offsetFunctions(
  curve: PlanarCurve,
  d: number
): OffsetFunctions {
  return {
    point: (t) => {
      const d1 = curve.first(t)
      const normal = V.scale(V.perpendicular(d1), 1 / V.length(d1))
      return V.add(curve.point(t), V.scale(normal, d))
    },
    first: (t) => {
      const d1 = curve.first(t)
      const d2 = curve.second(t)
      const speedSq = V.dot(d1, d1)
      const turn = V.scale(
        V.sub(
          V.scale(V.perpendicular(d2), speedSq),
          V.scale(V.perpendicular(d1), V.dot(d1, d2))
        ),
        1 / (speedSq * Math.sqrt(speedSq))
      )
      return V.add(d1, V.scale(turn, d))
    },
  }
}

/**
 * Whether the curve turns at a point instead of bending: its tangent's
 * direction jumps at a break, or at a closed one's seam, as at a CV spline's
 * tripled vertex or every vertex of one of degree 1.
 */
function hasCorner(curve: PlanarCurve): boolean {
  const step = (curve.end - curve.start) * 1e-8
  const turns = (before: Vec2, after: Vec2) =>
    !(V.length(before) > 0 && V.length(after) > 0) ||
    Math.abs(Math.atan2(V.cross(before, after), V.dot(before, after))) >
      CORNER_ANGLE
  return (
    curve.breaks.some((t) =>
      turns(curve.first(t - step), curve.first(t + step))
    ) ||
    (curve.closed &&
      turns(curve.first(curve.end - step), curve.first(curve.start + step)))
  )
}

/** A thousandth of a radian: far past what a smooth break turns over its step. */
const CORNER_ANGLE = 1e-3

/** Where the error of a span's Hermite cubic is sampled, as fractions of it. */
const ERROR_SAMPLES = [1 / 6, 1 / 3, 1 / 2, 2 / 3, 5 / 6]

/** Past this many spans the offset is given up: a curve no tolerance can follow. */
const MAX_SPANS = 4096

/**
 * The knots of `[a, b]`: the curve's breaks inside it, each span split until
 * its Hermite cubic keeps within the tolerance; null when it never does.
 */
function adaptiveKnots(
  curve: PlanarCurve,
  offset: OffsetFunctions,
  a: number,
  b: number
): number[] | null {
  const knots = [a]
  const minimum = (b - a) * 1e-9
  let failed = false
  const refine = (u: number, v: number) => {
    if (failed) return
    const error = hermiteError(offset, u, v)
    if (!Number.isFinite(error) || knots.length > MAX_SPANS) {
      failed = true
      return
    }
    if (error <= OFFSET_CURVE_TOLERANCE || v - u <= minimum) {
      knots.push(v)
      return
    }
    const n = Math.max(
      2,
      Math.ceil(Math.pow(error / OFFSET_CURVE_TOLERANCE, 1 / 4))
    )
    for (let k = 0; k < n; k++) {
      refine(
        u + ((v - u) * k) / n,
        k === n - 1 ? v : u + ((v - u) * (k + 1)) / n
      )
    }
  }
  const cuts = [
    a,
    ...curve.breaks.filter((t) => t > a + minimum && t < b - minimum),
    b,
  ]
  for (let i = 1; i < cuts.length; i++) refine(cuts[i - 1], cuts[i])
  return failed ? null : knots
}

/** The Bézier points of the Hermite cubic of `[u, v]`. */
function hermiteSpan(
  offset: OffsetFunctions,
  u: number,
  v: number
): [Vec2, Vec2, Vec2, Vec2] {
  const h = (v - u) / 3
  const p0 = offset.point(u)
  const p3 = offset.point(v)
  return [
    p0,
    V.add(p0, V.scale(offset.first(u), h)),
    V.sub(p3, V.scale(offset.first(v), h)),
    p3,
  ]
}

/** How far the span's cubic strays from the offset at the same parameter. */
function hermiteError(offset: OffsetFunctions, u: number, v: number): number {
  const [p0, p1, p2, p3] = hermiteSpan(offset, u, v)
  let error = 0
  for (const s of ERROR_SAMPLES) {
    const r = 1 - s
    const on = {
      x:
        r * r * r * p0.x +
        3 * s * r * r * p1.x +
        3 * s * s * r * p2.x +
        s * s * s * p3.x,
      y:
        r * r * r * p0.y +
        3 * s * r * r * p1.y +
        3 * s * s * r * p2.y +
        s * s * s * p3.y,
    }
    error = Math.max(error, V.distance(on, offset.point(u + (v - u) * s)))
  }
  return error
}

/**
 * The offset of `curve` at `distance` as the cubic through the Hermite spans
 * on `knots`, every inner knot double (C1): its control points the start,
 * each span's two inner Bézier points, and the end — a closed one's the start
 * again, to the bit. On AutoCAD's knots it gives AutoCAD's control points
 * (offset/p196–p198).
 */
export function offsetOnKnots(
  curve: PlanarCurve,
  distance: number,
  knots: readonly number[]
): BSplineCurve {
  return hermiteCurve(offsetFunctions(curve, distance), knots, curve.closed)
}

function hermiteCurve(
  offset: OffsetFunctions,
  knots: readonly number[],
  closed: boolean
): BSplineCurve {
  const points: Vec2[] = []
  for (let i = 1; i < knots.length; i++) {
    const [p0, p1, p2, p3] = hermiteSpan(offset, knots[i - 1], knots[i])
    if (i === 1) points.push(p0)
    points.push(p1, p2)
    if (i === knots.length - 1) points.push(closed ? points[0] : p3)
  }
  const first = knots[0]
  const last = knots[knots.length - 1]
  return {
    degree: 3,
    knots: [
      first,
      first,
      first,
      first,
      ...knots.slice(1, -1).flatMap((k) => [k, k]),
      last,
      last,
      last,
      last,
    ],
    controlPoints: points.map((p) => ({ x: p.x, y: p.y, z: 0 })),
  }
}

/** Chords each span of the offset is sampled into to find where it crosses itself. */
const CROSSING_CHORDS = 8

/**
 * The parameters where the offset crosses itself, each crossing's two,
 * sorted: found between the chords of a sampling of it, then refined by
 * Newton on `O(a) = O(b)`.
 */
function selfCrossings(
  curve: PlanarCurve,
  offset: OffsetFunctions,
  knots: readonly number[]
): number[] {
  const params: number[] = []
  for (let i = 1; i < knots.length; i++) {
    for (let k = 0; k < CROSSING_CHORDS; k++) {
      params.push(
        knots[i - 1] + ((knots[i] - knots[i - 1]) * k) / CROSSING_CHORDS
      )
    }
  }
  params.push(knots[knots.length - 1])
  const points = params.map((t) => offset.point(t))
  const chords = points.length - 1
  // Boxes of runs of chords, so only the runs that meet are compared chord by chord.
  const run = CROSSING_CHORDS
  const boxes: { min: Vec2; max: Vec2 }[] = []
  for (let start = 0; start < chords; start += run) {
    const span = points.slice(start, Math.min(start + run, chords) + 1)
    boxes.push({
      min: {
        x: Math.min(...span.map((p) => p.x)),
        y: Math.min(...span.map((p) => p.y)),
      },
      max: {
        x: Math.max(...span.map((p) => p.x)),
        y: Math.max(...span.map((p) => p.y)),
      },
    })
  }
  const found: number[] = []
  const range = curve.end - curve.start
  for (let bi = 0; bi < boxes.length; bi++) {
    for (let bj = bi; bj < boxes.length; bj++) {
      const a = boxes[bi]
      const b = boxes[bj]
      if (
        a.max.x < b.min.x ||
        b.max.x < a.min.x ||
        a.max.y < b.min.y ||
        b.max.y < a.min.y
      ) {
        continue
      }
      for (let i = bi * run; i < Math.min((bi + 1) * run, chords); i++) {
        const from = bi === bj ? i + 2 : bj * run
        for (let j = from; j < Math.min((bj + 1) * run, chords); j++) {
          // A closed offset's last chord meets its first at the seam.
          if (curve.closed && i === 0 && j === chords - 1) continue
          const hit = chordCrossing(
            points[i],
            points[i + 1],
            points[j],
            points[j + 1]
          )
          if (!hit) continue
          const crossing = refineCrossing(
            offset,
            params[i] + (params[i + 1] - params[i]) * hit.s,
            params[j] + (params[j + 1] - params[j]) * hit.t,
            curve
          )
          if (crossing[1] - crossing[0] > range * 1e-9) found.push(...crossing)
        }
      }
    }
  }
  found.sort((x, y) => x - y)
  return found.filter(
    (t, i) =>
      t > curve.start + range * 1e-12 &&
      t < curve.end - range * 1e-12 &&
      (i === 0 || t - found[i - 1] > range * 1e-12)
  )
}

/** Where chords `ab` and `cd` cross, as fractions along each; none for parallel ones. */
function chordCrossing(
  a: Vec2,
  b: Vec2,
  c: Vec2,
  d: Vec2
): { s: number; t: number } | null {
  const r = V.sub(b, a)
  const q = V.sub(d, c)
  const denominator = V.cross(r, q)
  if (denominator === 0) return null
  const ac = V.sub(c, a)
  const s = V.cross(ac, q) / denominator
  const t = V.cross(ac, r) / denominator
  return s >= 0 && s < 1 && t >= 0 && t < 1 ? { s, t } : null
}

/** Newton on `O(a) − O(b) = 0` from the chords' crossing; kept there when it wanders off. */
function refineCrossing(
  offset: OffsetFunctions,
  a0: number,
  b0: number,
  curve: PlanarCurve
): [number, number] {
  let a = a0
  let b = b0
  const range = curve.end - curve.start
  for (let step = 0; step < 8; step++) {
    const gap = V.sub(offset.point(a), offset.point(b))
    const da = offset.first(a)
    const db = offset.first(b)
    // Solve da·Δa − db·Δb = −gap.
    const det = V.cross(db, da)
    if (det === 0) break
    const deltaA = V.cross(gap, db) / det
    const deltaB = V.cross(gap, da) / det
    a += deltaA
    b += deltaB
    if (Math.abs(deltaA) + Math.abs(deltaB) <= range * 1e-15) break
  }
  const settled =
    Number.isFinite(a) &&
    Number.isFinite(b) &&
    Math.abs(a - a0) <= range * 0.01 &&
    Math.abs(b - b0) <= range * 0.01 &&
    a >= curve.start &&
    b <= curve.end
  return settled ? [Math.min(a, b), Math.max(a, b)] : [a0, b0]
}
