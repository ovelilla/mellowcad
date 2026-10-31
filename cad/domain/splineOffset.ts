import { V, Vec2 } from "../geometry/Vec2"
import { closestPointOnEllipse } from "../geometry/primitives"
import type { BSplineCurve } from "../geometry/nurbs"
import {
  bsplineBreakpoints,
  bsplineDifferentials,
  bsplineDomain,
  bsplinePoint,
} from "../geometry/nurbs"
import { type PlanarCurve, offsetCurvePieces } from "../geometry/curveOffset"
import type { EllipseEntity, SplineEntity } from "./entityTypes"
import {
  ellipseMinorAxis,
  ellipseSemiMajor,
  ellipseSweepParams,
  isFullEllipse,
} from "./ellipses"
import {
  closestPointOnSpline,
  isLevelSpline,
  splineCurve,
  splineNearest,
} from "./splines"

/**
 * OFFSET of a spline or an ellipse, in its own plane (its stored points), as
 * AutoCAD 2027 makes it: a CV spline on knots of its own approximating the
 * exact offset ({@link offsetCurvePieces}), perhaps in pieces, or none; a
 * round ellipse's a concentric one (spline-knots/k41, k56).
 */
export type CurveOffsetShape =
  | {
      readonly kind: "spline"
      readonly curve: BSplineCurve
      readonly closed: boolean
    }
  | {
      readonly kind: "ellipse"
      readonly center: Vec2
      readonly majorAxis: Vec2
      readonly ratio: number
      readonly startParam?: number
      readonly endParam?: number
    }

/**
 * Whether OFFSET takes the curve: a spline only lying in a plane; one out of
 * every plane AutoCAD takes and passes over in silence (spline-knots/k46).
 */
export function offsetsCurve(source: SplineEntity | EllipseEntity): boolean {
  return source.type === "ellipse" || isLevelSpline(source)
}

/** The offset of `source` at `distance` on the side of `side`; none on the curve. */
export function offsetCurveEntity(
  source: SplineEntity | EllipseEntity,
  distance: number,
  side: Vec2
): CurveOffsetShape[] {
  if (isRound(source)) return roundOffset(source, distance, side)
  const curve = planarCurve(source)
  const t = nearestParam(source, curve, side)
  const turn = V.cross(curve.first(t), V.sub(side, curve.point(t)))
  if (turn === 0) return []
  return offsetCurvePieces(curve, turn > 0 ? distance : -distance).map(
    (piece) => ({ kind: "spline", ...piece })
  )
}

/**
 * Through's distance: from `point` to the curve's nearest point, an open
 * one's ends included (beyond them unprobed).
 */
export function curveThroughDistance(
  source: SplineEntity | EllipseEntity,
  point: Vec2
): number {
  return planarCurve(source).distance(point)
}

/** An ellipse whose axes are equal: AutoCAD offsets it into an ellipse (k41, k56). */
function isRound(
  source: SplineEntity | EllipseEntity
): source is EllipseEntity {
  return source.type === "ellipse" && Math.abs(source.ratio - 1) <= 1e-10
}

/** Concentric, outward when the side lies outside; none at its centre or past. */
function roundOffset(
  source: EllipseEntity,
  distance: number,
  side: Vec2
): CurveOffsetShape[] {
  const radius = ellipseSemiMajor(source)
  const outward = V.distance(side, source.center) >= radius
  const next = radius + (outward ? distance : -distance)
  if (!(next > 1e-9)) return []
  return [
    {
      kind: "ellipse",
      center: source.center,
      majorAxis: V.scale(source.majorAxis, next / radius),
      ratio: source.ratio,
      ...(isFullEllipse(source)
        ? {}
        : { startParam: source.startParam, endParam: source.endParam }),
    },
  ]
}

/** The curve OFFSET follows: an ellipse by its own parameter, a spline by its knots'. */
export function planarCurve(source: SplineEntity | EllipseEntity): PlanarCurve {
  return source.type === "ellipse"
    ? ellipseCurve(source)
    : splinePlanarCurve(source)
}

/**
 * `p(t) = c + A·cos t + B·sin t` over the swept parameters; its spans begin a
 * quarter turn of parameter apart at most.
 */
function ellipseCurve(ellipse: EllipseEntity): PlanarCurve {
  const { center, majorAxis: a } = ellipse
  const b = ellipseMinorAxis(ellipse)
  const { start, sweep } = ellipseSweepParams(ellipse)
  const quarters = Math.max(1, Math.ceil(sweep / (Math.PI / 2) - 1e-9))
  const breaks: number[] = []
  for (let k = 1; k < quarters; k++) breaks.push(start + (sweep * k) / quarters)
  const along = (cos: number, sin: number) =>
    V.add(V.scale(a, cos), V.scale(b, sin))
  return {
    start,
    end: start + sweep,
    closed: isFullEllipse(ellipse),
    breaks,
    point: (t) => V.add(center, along(Math.cos(t), Math.sin(t))),
    first: (t) => along(-Math.sin(t), Math.cos(t)),
    second: (t) => along(-Math.cos(t), -Math.sin(t)),
    distance: (p) =>
      closestPointOnEllipse(
        center,
        a,
        ellipse.ratio,
        p,
        ellipse.startParam,
        ellipse.endParam
      ).distance,
  }
}

function splinePlanarCurve(spline: SplineEntity): PlanarCurve {
  const curve = splineCurve(spline)
  const { start, end } = bsplineDomain(curve)
  const { first, second } = bsplineDifferentials(curve)
  const nearest = splineNearest(spline)
  return {
    start,
    end,
    closed: spline.closed,
    breaks: bsplineBreakpoints(curve).slice(1, -1),
    point: (t) => bsplinePoint(curve, t),
    first: (t) => first(t),
    second: (t) => second(t),
    distance: (p) => nearest(p).distance,
  }
}

/** The parameter of the curve's point nearest `p`, which says the side `p` lies on. */
function nearestParam(
  source: SplineEntity | EllipseEntity,
  curve: PlanarCurve,
  p: Vec2
): number {
  if (source.type === "ellipse") {
    return closestPointOnEllipse(
      source.center,
      source.majorAxis,
      source.ratio,
      p,
      source.startParam,
      source.endParam
    ).t
  }
  const { t } = closestPointOnSpline(source, p)
  return curve.start + (curve.end - curve.start) * t
}
