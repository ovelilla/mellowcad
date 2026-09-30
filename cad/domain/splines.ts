import { Vec2, V } from "../geometry/Vec2"
import { planar } from "../geometry/Vec3"
import { ClosestResult, closestPointOnSegment } from "../geometry/primitives"
import {
  BSplineCurve,
  KnotParameterization,
  besselEndDerivative,
  besselStartDerivative,
  bsplineDerivativeCurve,
  bsplineDomain,
  bsplinePoint,
  bsplineTessellation,
  clampedUniformCurve,
  fitParameters,
  interpolateCubic,
  interpolatePeriodicCubic,
  periodicUniformCurve,
} from "../geometry/nurbs"
import { DEFAULT_LAYER_ID, LayerId } from "./layers"
import { Bounds, EntityId, SplineEntity, SplineMethod } from "./entityTypes"
import { nextEntityId } from "./entityFactories"

/** AutoCAD's SPLINE takes degrees 1 to 10 on the CV method. */
export const MAX_SPLINE_DEGREE = 10
export const DEFAULT_SPLINE_DEGREE = 3

export interface SplineOptions {
  readonly degree?: number
  readonly knots?: KnotParameterization
  readonly closed?: boolean
  readonly startTangent?: Vec2
  readonly endTangent?: Vec2
  readonly layerId?: LayerId
  readonly id?: EntityId
}

/**
 * Builds a spline. A fit spline is always cubic; a CV spline's degree drops to
 * one less than its vertex count when there are too few for the one asked —
 * "the degree of the resulting curve equals the number of vertices minus one".
 */
export function createSpline(
  method: SplineMethod,
  points: readonly Vec2[],
  options: SplineOptions = {}
): SplineEntity {
  const tangent = (v: Vec2 | undefined) =>
    v && V.length(v) > 1e-12 ? { x: v.x, y: v.y } : undefined
  const startTangent =
    method === "fit" ? tangent(options.startTangent) : undefined
  const endTangent =
    method === "fit" && !options.closed
      ? tangent(options.endTangent)
      : undefined
  return {
    id: options.id ?? nextEntityId(),
    type: "spline",
    layerId: options.layerId ?? DEFAULT_LAYER_ID,
    method,
    points: points.map((p) => ({ x: p.x, y: p.y })),
    degree:
      method === "fit"
        ? 3
        : clampDegree(
            Math.min(options.degree ?? DEFAULT_SPLINE_DEGREE, points.length - 1)
          ),
    knots: options.knots ?? "chord",
    closed: options.closed ?? false,
    ...(startTangent ? { startTangent } : {}),
    ...(endTangent ? { endTangent } : {}),
  }
}

function clampDegree(degree: number): number {
  if (!Number.isFinite(degree)) return DEFAULT_SPLINE_DEGREE
  return Math.max(1, Math.min(MAX_SPLINE_DEGREE, Math.round(degree)))
}

/**
 * The spline with every point (and the direction of each tangent) carried
 * through `map`, keeping its id — the one path every transform takes. A tangent
 * is mapped as the difference of two mapped points, so it rotates, scales and
 * reflects exactly as the curve does.
 */
export function mapSplinePoints(
  spline: SplineEntity,
  map: (point: Vec2) => Vec2
): SplineEntity {
  const origin = spline.points[0] ?? V.zero()
  const mapVector = (v: Vec2) => V.sub(map(V.add(origin, v)), map(origin))
  return {
    ...spline,
    points: spline.points.map(map),
    ...(spline.startTangent
      ? { startTangent: mapVector(spline.startTangent) }
      : {}),
    ...(spline.endTangent ? { endTangent: mapVector(spline.endTangent) } : {}),
  }
}

/** A *new* spline (fresh id) with the same settings on other points. */
export function splineCopy(
  spline: SplineEntity,
  map: (point: Vec2) => Vec2
): SplineEntity {
  return { ...mapSplinePoints(spline, map), id: nextEntityId() }
}

/** The spline with its `index`th fit point or control vertex moved — a grip drag. */
export function splineWithPoint(
  spline: SplineEntity,
  index: number,
  point: Vec2
): SplineEntity {
  return {
    ...spline,
    points: spline.points.map((p, i) => (i === index ? planar(point) : p)),
  }
}

/** The NURBS the spline draws. A fit spline's is re-derived from its fit points every time. */
export function splineCurve(spline: SplineEntity): BSplineCurve {
  return spline.method === "fit" ? fitCurve(spline) : controlCurve(spline)
}

function controlCurve(spline: SplineEntity): BSplineCurve {
  const points = spline.points
  if (points.length < 2) return pointCurve(points[0] ?? V.zero())
  const degree = clampDegree(Math.min(spline.degree, points.length - 1))
  return spline.closed
    ? periodicUniformCurve(points, degree)
    : clampedUniformCurve(points, degree)
}

function fitCurve(spline: SplineEntity): BSplineCurve {
  const points = distinctFitPoints(spline.points, spline.closed)
  if (points.length < 2) return pointCurve(points[0] ?? V.zero())
  if (spline.closed && points.length >= 3) {
    const params = fitParameters(points, spline.knots, true)
    if (!spline.startTangent) return interpolatePeriodicCubic(points, params)
    const loop = [...points, points[0]]
    const derivative = scaledTangent(spline.startTangent, loop, params)
    return interpolateCubic(loop, params, derivative, derivative)
  }
  const params = fitParameters(points, spline.knots, false)
  return interpolateCubic(
    points,
    params,
    spline.startTangent
      ? scaledTangent(spline.startTangent, points, params)
      : besselStartDerivative(points, params),
    spline.endTangent
      ? scaledTangent(spline.endTangent, points, params)
      : besselEndDerivative(points, params)
  )
}

/**
 * A picked tangent is only a direction. Its length is set to the chords' total
 * over the parameter range — 1 for chord-length knots — so the shape does not
 * change with the drawing's scale nor with how far away the direction was picked.
 */
function scaledTangent(
  direction: Vec2,
  points: readonly Vec2[],
  params: readonly number[]
): Vec2 {
  let chords = 0
  for (let i = 1; i < points.length; i++) {
    chords += V.distance(points[i - 1], points[i])
  }
  const range = params[points.length - 1] - params[0]
  return V.scale(V.normalize(direction), range > 0 ? chords / range : 1)
}

/** Two fit points on top of each other would share a parameter and leave the fit unsolvable. */
function distinctFitPoints(points: readonly Vec2[], closed: boolean): Vec2[] {
  const distinct: Vec2[] = []
  for (const point of points) {
    const last = distinct[distinct.length - 1]
    if (!last || V.distance(last, point) > 1e-9) distinct.push(point)
  }
  if (closed) {
    while (
      distinct.length > 1 &&
      V.distance(distinct[0], distinct[distinct.length - 1]) <= 1e-9
    ) {
      distinct.pop()
    }
  }
  return distinct
}

function pointCurve(point: Vec2): BSplineCurve {
  return { degree: 1, knots: [0, 0, 1, 1], controlPoints: [point, point] }
}

/**
 * The control polygon a selected spline shows with its CV grips. A periodic
 * curve lists its wrapped vertices once; the loop closes back to the first.
 */
export function splineControlFrame(spline: SplineEntity): Vec2[] {
  if (spline.method === "cv") return spline.points.slice()
  const curve = splineCurve(spline)
  const points = curve.controlPoints
  return spline.closed && !spline.startTangent && points.length > 3
    ? points.slice(0, points.length - 3)
    : points.slice()
}

/**
 * How closely the queries follow the curve: a hundred-thousandth of its extent.
 * Picking, bounds, length and snaps read the tessellation, so this is their
 * error; drawing tessellates again at the screen's own resolution.
 */
function queryTolerance(curve: BSplineCurve): number {
  let minX = Infinity
  let minY = Infinity
  let maxX = -Infinity
  let maxY = -Infinity
  for (const p of curve.controlPoints) {
    minX = Math.min(minX, p.x)
    minY = Math.min(minY, p.y)
    maxX = Math.max(maxX, p.x)
    maxY = Math.max(maxY, p.y)
  }
  return Math.max(Math.hypot(maxX - minX, maxY - minY) * 1e-5, 1e-9)
}

/** Points along the spline, the chords within `tolerance` of it (a size-relative one by default). */
export function splinePolyline(
  spline: SplineEntity,
  tolerance?: number
): Vec2[] {
  const curve = splineCurve(spline)
  return bsplineTessellation(curve, tolerance ?? queryTolerance(curve)).points
}

export function splineStartPoint(spline: SplineEntity): Vec2 {
  const curve = splineCurve(spline)
  return bsplinePoint(curve, bsplineDomain(curve).start)
}

export function splineEndPoint(spline: SplineEntity): Vec2 {
  const curve = splineCurve(spline)
  return bsplinePoint(curve, bsplineDomain(curve).end)
}

export function splineLength(spline: SplineEntity): number {
  const points = splinePolyline(spline)
  let length = 0
  for (let i = 1; i < points.length; i++) {
    length += V.distance(points[i - 1], points[i])
  }
  return length
}

/** The point halfway along the curve's length — Midpoint's point on a spline. */
export function splineMidpoint(spline: SplineEntity): Vec2 {
  const points = splinePolyline(spline)
  const half = splineLength(spline) / 2
  let walked = 0
  for (let i = 1; i < points.length; i++) {
    const step = V.distance(points[i - 1], points[i])
    if (walked + step >= half && step > 0) {
      return V.lerp(points[i - 1], points[i], (half - walked) / step)
    }
    walked += step
  }
  return points[points.length - 1]
}

/** The area a closed spline encloses (the Properties palette's Area). */
export function splineArea(spline: SplineEntity): number {
  const points = splinePolyline(spline)
  let twice = 0
  for (let i = 0; i < points.length; i++) {
    twice += V.cross(points[i], points[(i + 1) % points.length])
  }
  return Math.abs(twice) / 2
}

export function splineBounds(spline: SplineEntity): Bounds {
  const points = splinePolyline(spline)
  return {
    min: {
      x: Math.min(...points.map((p) => p.x)),
      y: Math.min(...points.map((p) => p.y)),
    },
    max: {
      x: Math.max(...points.map((p) => p.x)),
      y: Math.max(...points.map((p) => p.y)),
    },
  }
}

/**
 * The point on the curve nearest `point`. The closest point on a NURBS has no
 * closed form: the nearest chord of the tessellation gives a start, and a
 * bounded Newton on `(C(u) − p)·C′(u) = 0` refines it, kept only when it beats
 * the chord — the same budget rule as `closestPointOnEllipse`.
 */
export function closestPointOnSpline(
  spline: SplineEntity,
  point: Vec2
): ClosestResult {
  const curve = splineCurve(spline)
  const { params, points } = bsplineTessellation(curve, queryTolerance(curve))
  let best: ClosestResult = {
    point: points[0],
    distance: V.distance(points[0], point),
    t: 0,
  }
  let u = params[0]
  for (let i = 1; i < points.length; i++) {
    const candidate = closestPointOnSegment(points[i - 1], points[i], point)
    if (candidate.distance < best.distance) {
      best = candidate
      u = params[i - 1] + (params[i] - params[i - 1]) * candidate.t
    }
  }
  const first = bsplineDerivativeCurve(curve)
  const second = bsplineDerivativeCurve(first)
  const { start, end } = bsplineDomain(curve)
  for (let i = 0; i < NEWTON_STEPS; i++) {
    const offset = V.sub(bsplinePoint(curve, u), point)
    const d1 = bsplinePoint(first, u)
    const slope = V.dot(d1, d1) + V.dot(offset, bsplinePoint(second, u))
    if (slope <= 1e-18) break
    u = Math.min(end, Math.max(start, u - V.dot(offset, d1) / slope))
  }
  const refined = bsplinePoint(curve, u)
  const distance = V.distance(refined, point)
  const t = end > start ? (u - start) / (end - start) : 0
  return distance < best.distance
    ? { point: refined, distance, t }
    : { ...best, t }
}

/** Newton converges quadratically from the chord's estimate; a few steps are plenty. */
const NEWTON_STEPS = 6
