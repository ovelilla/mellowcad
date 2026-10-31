import { Vec2 } from "../geometry/Vec2"
import { Vec3, add3, length3, scale3, sub3 } from "../geometry/Vec3"
import {
  BSplineCurve,
  bsplineBreakpoints,
  bsplineDifferentials,
  bsplineDomain,
  bsplineElevated,
  bsplinePoint,
  bsplineSegment,
  periodicLoop,
} from "../geometry/nurbs"
import { PolylineEntity, Polyline3dEntity, SplineEntity } from "./entityTypes"
import { createPolyline, createPolyline3d } from "./entityFactories"
import { carryOverrides } from "./entityOverrides"
import {
  closestPointOnSpline,
  createSpline,
  isLevelSpline,
  isPeriodicSpline,
  splineCurve,
  splineWithoutFitData,
} from "./splines"
import { splineInWorld, splineRun } from "./splineEdits"
import { splineFitCurve } from "../geometry/splineFit"
import { splineOnItsPlane } from "./elevation"

/*
 * SPLINEDIT's edits of a spline's data, as AutoCAD 2027's console leaves
 * them (probes spline-knots/k57–k145): the fit points of a fit spline, the
 * control vertices, knots and weights of a CV spline.
 */

// `+ 0` turns a solve's −0 into the 0 a file writes.
const tidy = (p: Vec3): Vec3 => ({ x: p.x + 0, y: p.y + 0, z: p.z + 0 })

function without<K extends keyof SplineEntity>(
  spline: SplineEntity,
  ...fields: K[]
): Omit<SplineEntity, K> {
  const rest: Record<string, unknown> = { ...spline }
  for (const field of fields) delete rest[field]
  return rest as Omit<SplineEntity, K>
}

/**
 * Close and Open: a fit spline periodic through its fit points or open on
 * them again, its tangents dropped either way (k57, k59, k100); a CV spline
 * periodic on its vertices, knots 1 apart, or clamped on them, whatever knots
 * it had (k58, k60, k122).
 */
export function splineClosedAs(
  spline: SplineEntity,
  closed: boolean
): SplineEntity {
  const rest = without(spline, "startTangent", "endTangent", "knotVector")
  if (spline.method === "fit") return { ...rest, closed }
  const count = spline.points.length
  return {
    ...rest,
    closed,
    degree: closed ? spline.degree : Math.min(spline.degree, count - 1),
  }
}

/**
 * Reverse: the same curve run from its end (k74, k126): points and weights
 * the other way, the knots mirrored, the end tangents swapped and turned. A
 * closed one keeps its first point first, the rest the other way (k141,
 * k142).
 */
export function splineReversed(spline: SplineEntity): SplineEntity {
  const { knotVector, startTangent, endTangent } = spline
  const rest = without(spline, "startTangent", "endTangent", "knotVector")
  const sum = knotVector ? knotVector[0] + knotVector[knotVector.length - 1] : 0
  return {
    ...rest,
    points: reversed(spline.points, spline.closed),
    ...(endTangent ? { startTangent: tidy(scale3(endTangent, -1)) } : {}),
    ...(startTangent ? { endTangent: tidy(scale3(startTangent, -1)) } : {}),
    ...(knotVector
      ? { knotVector: knotVector.map((k) => sum - k + 0).reverse() }
      : {}),
    ...(spline.weights
      ? { weights: reversed(spline.weights, spline.closed) }
      : {}),
  }
}

function reversed<T>(items: readonly T[], closed: boolean): T[] {
  return closed && items.length > 0
    ? [items[0], ...items.slice(1).reverse()]
    : [...items].reverse()
}

/** A cubic's clamped knots on its fit points' parameters. */
function cubicKnots(params: readonly number[]): number[] {
  const first = params[0]
  const last = params[params.length - 1]
  return [first, first, first, ...params, last, last, last]
}

/**
 * Fit data on a CV spline, which AutoCAD makes a fit spline on the spot
 * (k76, k114, k115): its fit points the curve's at its distinct knots, an
 * open one's end tangents the derivatives there, its weights dropped, cubic.
 * Its knots stay its own: Uniform where they were 1 apart (k76's
 * `knotParam`), Custom otherwise and on a closed one (k114, k115).
 */
export function splineWithFitData(spline: SplineEntity): SplineEntity {
  if (spline.method === "fit") return spline
  const curve = splineCurve(spline)
  const rest = without(spline, "weights", "knotVector")
  if (spline.closed && isPeriodicSpline(spline)) {
    const loop = periodicLoop(curve).knots
    return {
      ...rest,
      method: "fit",
      degree: 3,
      points: loop.slice(0, -1).map((u) => tidy(bsplinePoint(curve, u))),
      knotVector: loop.map((k) => k + 0),
    }
  }
  const params = bsplineBreakpoints(curve)
  const { first } = bsplineDifferentials(curve)
  const points = params.map((u) => tidy(bsplinePoint(curve, u)))
  if (spline.closed) {
    return {
      ...rest,
      method: "fit",
      degree: 3,
      points: points.slice(0, -1),
      knotVector: params,
    }
  }
  const { start, end } = bsplineDomain(curve)
  return {
    ...rest,
    method: "fit",
    degree: 3,
    points,
    startTangent: tidy(first(start)),
    endTangent: tidy(first(end)),
    ...(spline.knotVector
      ? { knotVector: cubicKnots(params) }
      : { knots: "uniform" as const }),
  }
}

/** An open fit spline's fit point parameters on its own knots, or null on derived ones. */
function ownParams(spline: SplineEntity): number[] | null {
  if (!spline.knotVector || spline.closed) return null
  return spline.knotVector.filter((k, i, all) => i === 0 || k > all[i - 1])
}

/**
 * Fit data's Add: `point` the fit point at `index`, the rest after it.
 * Derived knots are worked out again, the tangents kept (k77, k135); on
 * knots of its own the new parameter is the middle of the span it falls in,
 * the ends kept, and the tangents dropped (k114, k138).
 */
export function fitPointAdded(
  spline: SplineEntity,
  index: number,
  point: Vec3
): SplineEntity {
  const points = [...spline.points]
  points.splice(index, 0, point)
  const params = ownParams(spline)
  if (!params) {
    return { ...without(spline, "knotVector"), points }
  }
  const at = Math.min(Math.max(index, 1), params.length - 1)
  params.splice(at, 0, (params[at - 1] + params[at]) / 2)
  return {
    ...without(spline, "startTangent", "endTangent"),
    points,
    knotVector: cubicKnots(params),
  }
}

/**
 * Fit data's Delete: derived knots worked out again, the tangents kept
 * (k62, k136); on knots of its own the last parameter goes, the rest kept,
 * and the tangents with it (k140).
 */
export function fitPointDeleted(
  spline: SplineEntity,
  index: number
): SplineEntity {
  const points = spline.points.filter((_, i) => i !== index)
  const params = ownParams(spline)
  if (!params) return { ...without(spline, "knotVector"), points }
  return {
    ...without(spline, "startTangent", "endTangent"),
    points,
    knotVector: cubicKnots(params.slice(0, -1)),
  }
}

/**
 * Fit data's Tangents: the start one pointing from the point given to the
 * curve's start, the end one from its end to the point, both unit (k66,
 * k110, k126); undefined keeps one, null (System default) drops the start
 * one, or both at the end's prompt (k82).
 */
export function splineTangentsAt(
  spline: SplineEntity,
  start: Vec3 | null | undefined,
  end: Vec3 | null | undefined
): SplineEntity {
  const unit = (v: Vec3) => {
    const length = length3(v)
    return length > 1e-12 ? tidy(scale3(v, 1 / length)) : undefined
  }
  const first = spline.points[0]
  const last = spline.points[spline.points.length - 1]
  const startTangent =
    end === null || start === null
      ? undefined
      : start
        ? unit(sub3(first, start))
        : spline.startTangent
  const endTangent =
    end === null ? undefined : end ? unit(sub3(end, last)) : spline.endTangent
  return {
    ...without(spline, "startTangent", "endTangent"),
    ...(startTangent ? { startTangent } : {}),
    ...(endTangent ? { endTangent } : {}),
  }
}

/** Purge: the fit data dropped, a CV spline on the curve's control points and knots (k65, k101). */
export function splinePurged(spline: SplineEntity): SplineEntity {
  return spline.method === "fit" ? splineWithoutFitData(spline) : spline
}

/** A CV spline's knots as it holds them: an open one's whole vector, a periodic one's one period. */
function ownKnots(spline: SplineEntity): number[] {
  const curve = splineCurve(spline)
  return [...(isPeriodicSpline(spline) ? periodicLoop(curve) : curve).knots]
}

/** Where `u` stands from `g` on a closed curve's period, or along an open one. */
function apart(u: number, g: number, period: number | null): number {
  if (period === null) return Math.abs(u - g)
  const d = (((u - g) % period) + period) % period
  return Math.min(d, period - d)
}

/**
 * The control vertex whose Greville abscissa (the mean of its `degree`
 * knots) is nearest `u` — the one a knot there belongs to; the first of two
 * as near (k124).
 */
function nearestVertex(
  knotAt: (i: number) => number,
  degree: number,
  candidates: readonly number[],
  u: number,
  period: number | null
): number {
  let best = candidates[0]
  let nearest = Infinity
  for (const i of candidates) {
    let sum = 0
    for (let s = 1; s <= degree; s++) sum += knotAt(i + s)
    const d = apart(u, sum / degree, period)
    if (d < nearest - 1e-9) {
      nearest = d
      best = i
    }
  }
  return best
}

/**
 * Edit vertex's Add: a knot at the parameter nearest `point`, and `point`
 * itself a control vertex there — the others left where they were, so the
 * curve changes (k68, k83, k84, k124): between the two vertices whose
 * Greville abscissae the knot falls nearest. Null where the nearest point is
 * an end of an open curve, which AutoCAD leaves as it is (k129).
 */
export function controlVertexAdded(
  spline: SplineEntity,
  point: Vec3
): SplineEntity | null {
  const curve = splineCurve(spline)
  const { start, end } = bsplineDomain(curve)
  const picked = start + closestPointOnSpline(spline, point).t * (end - start)
  const periodic = isPeriodicSpline(spline)
  const hair = 1e-9 * Math.max(1, end - start)
  if (!periodic && (picked <= start + hair || picked >= end - hair)) {
    return null
  }
  const knots = ownKnots(spline)
  // On a knot within a hair, that knot: AutoCAD's own (k124's 3).
  const u = knots.find((k) => Math.abs(k - picked) <= hair) ?? picked
  const at = knots.findIndex((k) => k > u)
  knots.splice(at < 0 ? knots.length : at, 0, u)
  const p = spline.degree
  const count = spline.points.length + 1
  const index = periodic
    ? nearestVertex(
        loopKnot(knots, count),
        p,
        Array.from({ length: count }, (_, j) => j),
        u,
        knots[count] - knots[0]
      )
    : nearestVertex(
        (i) => knots[i],
        p,
        Array.from({ length: count - 2 }, (_, j) => j + 1),
        u,
        null
      )
  const points = [...spline.points]
  points.splice(index, 0, point)
  const weights = spline.weights && [...spline.weights]
  weights?.splice(index, 0, 1)
  return {
    ...without(spline, "weights"),
    points,
    knotVector: knots,
    ...(weights ? { weights } : {}),
  }
}

/** A period's knots run on round the loop, as `periodicCurve` unwraps them. */
function loopKnot(knots: readonly number[], count: number) {
  const period = knots[count] - knots[0]
  return (i: number) => {
    const wraps = Math.floor(i / count)
    return knots[i - wraps * count] + wraps * period
  }
}

/**
 * Edit vertex's Delete: the vertex goes with the inner knot nearest its
 * Greville abscissa (k85, k111–k113, k130); with no inner knot left the
 * degree drops by one instead (k69, k104).
 */
export function controlVertexDeleted(
  spline: SplineEntity,
  index: number
): SplineEntity {
  const knots = ownKnots(spline)
  const p = spline.degree
  const periodic = isPeriodicSpline(spline)
  const count = spline.points.length
  const points = spline.points.filter((_, i) => i !== index)
  const weights = spline.weights?.filter((_, i) => i !== index)
  const rest = without(spline, "weights", "knotVector")
  const inner = periodic
    ? Array.from({ length: count - 1 }, (_, i) => i + 1)
    : Array.from({ length: knots.length - 2 * p - 2 }, (_, i) => i + p + 1)
  let degree = p
  let knotVector: number[]
  if (inner.length > 0) {
    const knotAt = periodic ? loopKnot(knots, count) : (i: number) => knots[i]
    let mean = 0
    for (let s = 1; s <= p; s++) mean += knotAt(index + s)
    mean /= p
    const period = periodic ? knots[count] - knots[0] : null
    const drop = inner.reduce((best, i) =>
      apart(knots[i], mean, period) < apart(knots[best], mean, period) - 1e-9
        ? i
        : best
    )
    knotVector = knots.filter((_, i) => i !== drop)
    if (periodic) degree = Math.min(p, points.length)
  } else {
    degree = points.length - 1
    const ends = (u: number) => new Array<number>(degree + 1).fill(u)
    knotVector = [...ends(knots[0]), ...ends(knots[knots.length - 1])]
  }
  return {
    ...rest,
    points,
    degree,
    knotVector,
    ...(weights ? { weights } : {}),
  }
}

/**
 * Edit vertex's Weight: the vertex's weight, a spline without any first made
 * rational, every weight 1 (k11, k87, k99).
 */
export function controlVertexWeighed(
  spline: SplineEntity,
  index: number,
  weight: number
): SplineEntity {
  const weights = spline.weights
    ? [...spline.weights]
    : spline.points.map(() => 1)
  weights[index] = weight
  return { ...spline, weights }
}

/**
 * Elevate order: the same curve raised to `degree` (k70, k86), each knot
 * once more for each degree gained; a periodic one clamped first on one turn,
 * so it stays closed but periodic no more, from where its curve starts
 * (k123).
 */
export function splineElevated(
  spline: SplineEntity,
  degree: number
): SplineEntity {
  // WHY its run: a periodic curve is clamped where its two turns meet.
  const run = splineRun(spline)
  const clamped = isPeriodicSpline(spline)
    ? bsplineSegment(run.curve, run.start, run.end)
    : run.curve
  const raised = bsplineElevated(clamped, degree)
  return {
    ...without(spline, "weights", "knotVector"),
    points: raised.controlPoints.map(tidy),
    degree,
    knotVector: raised.knots.map((k) => k + 0),
    ...(raised.weights ? { weights: [...raised.weights] } : {}),
  }
}

/**
 * The deepest a span is halved for convert to Polyline: AutoCAD's own
 * reached 2¹⁰ parts of a span at the default precision 10 (k73); a
 * precision near 99 would otherwise ask for millions of vertices.
 */
const MAX_POLYLINE_DEPTH = 12

/**
 * convert to Polyline's vertices, on the spline's own coordinates: each knot
 * span halved on its parameter until the curve's middle lies within a
 * tolerance of the chord's, as AutoCAD's vertices fall on 2⁻ⁿ of a span
 * (k73, k90–k92, k119, k131). WHY the tolerance is the control frame's
 * diagonal over 10⁴(precision + 1)²: it gives a single-span CV spline's
 * vertices to within a few of AutoCAD's at every precision probed; AutoCAD
 * leaves a fit spline far coarser (5 vertices at 0, 31 at 10: k120, k132),
 * by a rule the probes do not show. A closed spline's last vertex is its
 * first, left out.
 */
export function splinePolylinePoints(
  spline: SplineEntity,
  precision: number
): Vec3[] {
  const curve = splineCurve(spline)
  const tolerance = frameDiagonal(curve) / (1e4 * (precision + 1) ** 2)
  const at = (u: number) => bsplinePoint(curve, u)
  const breaks = bsplineBreakpoints(curve)
  const points: Vec3[] = [tidy(at(breaks[0]))]
  const halve = (a: number, b: number, depth: number) => {
    const mid = (a + b) / 2
    const pb = at(b)
    const chordMid = scale3(add3(at(a), pb), 0.5)
    if (
      depth < MAX_POLYLINE_DEPTH &&
      length3(sub3(at(mid), chordMid)) > tolerance
    ) {
      halve(a, mid, depth + 1)
      halve(mid, b, depth + 1)
    } else {
      points.push(tidy(pb))
    }
  }
  for (let i = 1; i < breaks.length; i++) halve(breaks[i - 1], breaks[i], 0)
  if (spline.closed && points.length > 2) points.pop()
  return points
}

/**
 * The spline as convert to Polyline and PEDIT leave it (k73, pedit/p07,
 * p99): a polyline of straight segments through {@link splinePolylinePoints}
 * in its plane, a 3D polyline where it lies in none, its properties carried.
 * PLINECONVERTMODE's arcs are not built.
 */
export function splinePolyline(
  spline: SplineEntity,
  precision: number
): PolylineEntity | Polyline3dEntity {
  const polyline = isLevelSpline(spline)
    ? createPolyline(
        splinePolylinePoints(spline, precision).map((p) => ({
          x: p.x,
          y: p.y,
        })),
        spline.closed,
        spline.layerId
      )
    : createPolyline3d(
        splinePolylinePoints(splineInWorld(spline), precision),
        spline.closed,
        spline.layerId
      )
  return carryOverrides(spline, polyline)
}

function frameDiagonal(curve: BSplineCurve): number {
  const min = { x: Infinity, y: Infinity, z: Infinity }
  const max = { x: -Infinity, y: -Infinity, z: -Infinity }
  for (const p of curve.controlPoints) {
    for (const axis of ["x", "y", "z"] as const) {
      min[axis] = Math.min(min[axis], p[axis])
      max[axis] = Math.max(max[axis], p[axis])
    }
  }
  return Math.max(length3(sub3(max, min)), 1e-9)
}

/** The index of the point of `points` within `tolerance` of `at` in plan, nearest first; null for none. */
export function splinePointNear(
  points: readonly Vec3[],
  at: Vec2,
  tolerance: number
): number | null {
  let best: number | null = null
  let nearest = tolerance
  points.forEach((p, i) => {
    const d = Math.hypot(p.x - at.x, p.y - at.y)
    if (d <= nearest) {
      nearest = d
      best = i
    }
  })
  return best
}

/**
 * SPLINE's Object (and SPLINEDIT's pick, k94) of a polyline PEDIT's Spline
 * fitted: the CV spline of the same curve, its control points the frame and
 * its knots 1 apart, clamped (pedit/p57, p178), a closed one cut where its
 * curve begins (p189), in the polyline's plane and properties. Null for any
 * other polyline, Fit's too: AutoCAD converts only these (p178).
 */
export function fittedPolylineSpline(
  poly: PolylineEntity | Polyline3dEntity
): SplineEntity | null {
  const fit = poly.fit
  if (!fit || fit.kind === "curve" || poly.vertices.length < 3) return null
  const frame: Vec3[] = poly.vertices.map((v) => ({
    x: v.x,
    y: v.y,
    z: "z" in v ? v.z : 0,
  }))
  const curve = splineFitCurve(
    frame,
    poly.closed,
    fit.kind === "quadratic" ? 2 : 3
  )
  const spline = createSpline("cv", curve.controlPoints, {
    degree: curve.degree,
    closed: poly.closed,
    knotVector: curve.knots,
  })
  const placed = carryOverrides(poly, { ...spline, layerId: poly.layerId })
  return poly.type === "polyline3d" ? splineOnItsPlane(placed) : placed
}
