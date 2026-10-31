import { Vec2, V } from "../../geometry/Vec2"
import {
  angleWithinSweep,
  ellipsePoint,
  signChanges,
} from "../../geometry/primitives"
import { bsplineDomain, bsplinePoint } from "../../geometry/nurbs"
import {
  EllipseEntity,
  Entity,
  SplineEntity,
  ellipseParamWithinSweep,
  ellipseSweepParams,
  isFullEllipse,
  polylineSegmentGeometries,
  polyline3dSegments,
  splineCurve,
  splinePolyline,
} from "../../domain/entities"

/**
 * Where TRIM and EXTEND find an ellipse or a spline crossing an edge: none
 * has a closed form against every other object, so each is found by scanning
 * one curve's parameter for the sign changes of the other's implicit function
 * (`signChanges`), bisected to full precision.
 */

/** An edge as a zero set: `f` changes sign across it, `within` keeps its own extent. */
export interface ImplicitEdge {
  readonly f: (p: Vec2) => number
  readonly within: (p: Vec2) => boolean
}

/** Steps of the scan round a whole ellipse. */
const ELLIPSE_SCAN = 720

/** Steps of the scan of a spline, per control point. */
const SPLINE_SCAN = 32

const PARAM_EPS = 1e-6

/** The infinite line through `a` and `b`, kept to the segment between them. */
export function segmentImplicit(a: Vec2, b: Vec2): ImplicitEdge | null {
  const d = V.sub(b, a)
  const lenSq = V.lengthSq(d)
  if (lenSq === 0) return null
  return {
    f: (p) => V.cross(d, V.sub(p, a)),
    within: (p) => {
      const u = V.dot(V.sub(p, a), d) / lenSq
      return u >= -PARAM_EPS && u <= 1 + PARAM_EPS
    },
  }
}

/** A circle, kept to the arc that sweeps CCW from `sweep.start` to `sweep.end`. */
export function circleImplicit(
  center: Vec2,
  radius: number,
  sweep?: { readonly start: number; readonly end: number }
): ImplicitEdge {
  return {
    f: (p) => V.distance(p, center) - radius,
    within: (p) =>
      !sweep ||
      angleWithinSweep(
        sweep.start,
        sweep.end,
        Math.atan2(p.y - center.y, p.x - center.x)
      ),
  }
}

/** The ellipse's parameter at `p`, read in its own frame. */
export function ellipseParamOf(ellipse: EllipseEntity, p: Vec2): number {
  const a = V.length(ellipse.majorAxis)
  const axis = V.scale(ellipse.majorAxis, 1 / a)
  const offset = V.sub(p, ellipse.center)
  return Math.atan2(
    V.dot(offset, V.perpendicular(axis)) / (a * ellipse.ratio),
    V.dot(offset, axis) / a
  )
}

/** The ellipse, kept to its sweep. */
export function ellipseImplicit(ellipse: EllipseEntity): ImplicitEdge {
  const a = V.length(ellipse.majorAxis)
  const axis = V.scale(ellipse.majorAxis, 1 / a)
  const normal = V.perpendicular(axis)
  const b = a * ellipse.ratio
  return {
    f: (p) => {
      const offset = V.sub(p, ellipse.center)
      return (
        (V.dot(offset, axis) / a) ** 2 + (V.dot(offset, normal) / b) ** 2 - 1
      )
    },
    within: (p) =>
      isFullEllipse(ellipse) ||
      ellipseParamWithinSweep(ellipse, ellipseParamOf(ellipse, p)),
  }
}

/**
 * The edge as zero sets: a polyline's segments each, a spline as its chords
 * (a spline has no implicit form; this serves only where the other object is
 * a spline too, and whether it is crossed).
 */
export function implicitEdges(o: Entity): ImplicitEdge[] {
  switch (o.type) {
    case "line": {
      const edge = segmentImplicit(o.start, o.end)
      return edge ? [edge] : []
    }
    case "circle":
      return [circleImplicit(o.center, o.radius)]
    case "arc":
      return [
        circleImplicit(o.center, o.radius, {
          start: o.startAngle,
          end: o.endAngle,
        }),
      ]
    case "polyline":
      return polylineSegmentGeometries(o).flatMap((g) => {
        if (g.kind === "arc") {
          return [
            circleImplicit(g.center, g.radius, {
              start: g.startAngle,
              end: g.endAngle,
            }),
          ]
        }
        const edge = segmentImplicit(g.a, g.b)
        return edge ? [edge] : []
      })
    case "polyline3d":
      return polyline3dSegments(o).flatMap(([a, b]) => {
        const edge = segmentImplicit(a, b)
        return edge ? [edge] : []
      })
    case "ellipse":
      return [ellipseImplicit(o)]
    case "spline": {
      const points = splinePolyline(o)
      const chords: ImplicitEdge[] = []
      for (let i = 1; i < points.length; i++) {
        const edge = segmentImplicit(points[i - 1], points[i])
        if (edge) chords.push(edge)
      }
      return chords
    }
    case "text":
    case "mtext":
    case "attdef":
    case "dimension":
    case "hatch":
    case "insert":
    case "region":
      return []
  }
}

/** A curve's points by its parameter, the range to scan and how finely. */
interface ParametricCurve {
  readonly at: (t: number) => Vec2
  readonly start: number
  readonly sweep: number
  readonly samples: number
}

export function parametricCurve(
  curve: EllipseEntity | SplineEntity
): ParametricCurve {
  if (curve.type === "ellipse") {
    const { start, sweep } = ellipseSweepParams(curve)
    return {
      at: (t) => ellipsePoint(curve.center, curve.majorAxis, curve.ratio, t),
      start,
      sweep,
      samples: Math.max(16, Math.ceil((ELLIPSE_SCAN * sweep) / (2 * Math.PI))),
    }
  }
  const nurbs = splineCurve(curve)
  const domain = bsplineDomain(nurbs)
  return {
    at: (t) => bsplinePoint(nurbs, t),
    start: domain.start,
    sweep: domain.end - domain.start,
    samples: Math.max(64, SPLINE_SCAN * nurbs.controlPoints.length),
  }
}

/** The parameters of `curve` where it crosses `edge`, within the edge's extent. */
export function crossingParams(
  curve: ParametricCurve,
  edge: ImplicitEdge
): number[] {
  return signChanges(
    (t) => edge.f(curve.at(t)),
    curve.start,
    curve.sweep,
    curve.samples
  ).filter((t) => edge.within(curve.at(t)))
}

/** The points where an ellipse or a spline edge crosses the zero set of `f`. */
export function curveCrossings(
  edge: EllipseEntity | SplineEntity,
  f: (p: Vec2) => number
): Vec2[] {
  const curve = parametricCurve(edge)
  return crossingParams(curve, { f, within: () => true }).map(curve.at)
}
