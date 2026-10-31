import { Vec3 } from "./Vec3"
import {
  BSplineCurve,
  bsplineDomain,
  bsplinePoint,
  bsplineSegment,
  clampedUniformCurve,
} from "./nurbs"

/**
 * The points PEDIT's Spline puts on the B-spline its vertices frame, `count`
 * per knot span (SPLINESEGS's size), as AutoCAD 2027 leaves them
 * (pedit/p52–p56, p157–p160, p190): uniform knots of `degree` (SPLINETYPE 5
 * quadratic, 6 cubic), clamped to the ends of an open frame, periodic round a
 * closed one from the span its first vertex begins (its first point
 * `(P₀ + 4P₁ + P₂) / 6`, a quadratic's `(P₀ + P₁) / 2`). An open cubic frame of
 * three is the Bézier on its middle vertex twice (p158, p190). The last point
 * of a closed one is its first again, left out. Empty for a frame of under
 * three, which AutoCAD leaves unfitted (p190).
 */
export function splineFitPoints(
  frame: readonly Vec3[],
  closed: boolean,
  degree: 2 | 3,
  count: number
): Vec3[] {
  const n = frame.length
  if (n < 3 || count < 1) return []
  const curve = splineFitCurve(frame, closed, degree)
  const { start, end } = bsplineDomain(curve)
  const spans = Math.round(end - start)
  return Array.from({ length: spans * count + (closed ? 0 : 1) }, (_, i) =>
    bsplinePoint(curve, start + i / count)
  )
}

/**
 * The B-spline PEDIT's Spline lays on `frame`, as SPLINE's Object turns it
 * into a spline (pedit/p57, p178, p189): clamped, knots 1 apart from 0 — a
 * closed one cut where its curve begins, its first and last control points
 * that point (`0 0 0 1 2 3 4 4 4` on a quadratic loop of four).
 */
export function splineFitCurve(
  frame: readonly Vec3[],
  closed: boolean,
  degree: 2 | 3
): BSplineCurve {
  const n = frame.length
  if (closed) {
    // The loop unwrapped with a span to spare at each end, so both cuts fall
    // inside its knots.
    const at = (i: number) => frame[(((i + degree) % n) + n) % n]
    const controlPoints = Array.from({ length: n + 2 * degree }, (_, i) =>
      at(i - degree)
    )
    const knots = Array.from({ length: n + 3 * degree + 1 }, (_, i) => i)
    const cut = bsplineSegment(
      { degree, knots, controlPoints },
      degree,
      degree + n
    )
    return { ...cut, knots: cut.knots.map((u) => u - degree) }
  }
  const points =
    n === 3 && degree === 3 ? [frame[0], frame[1], frame[1], frame[2]] : frame
  return clampedUniformCurve(points, degree)
}
