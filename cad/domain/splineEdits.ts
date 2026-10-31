import { Vec2 } from "../geometry/Vec2"
import { Vec3, length3, sub3 } from "../geometry/Vec3"
import { axesToWorld, worldToAxes } from "../geometry/ocs"
import {
  BSplineCurve,
  BSplineGrowth,
  bsplineDifferentials,
  bsplineDomain,
  bsplineEasedGrowth,
  bsplineInsertKnot,
  bsplinePoint,
  bsplineRaised,
  bsplineSegment,
  bsplineTaylorGrowth,
  bsplineTwoTurns,
  knotMultiplicity,
} from "../geometry/nurbs"
import { SplineEntity } from "./entityTypes"
import { planeAxes } from "./elevation"
import { closestPointOnSpline, drawsPeriodic, splineCurve } from "./splines"

/*
 * TRIM's, BREAK's and EXTEND's pieces of a spline, as AutoCAD 2027 leaves
 * them (probes spline-knots/k01–k37): cut on its own parameter by knot
 * insertion, each piece on the knots it had there, never normalised.
 */

/**
 * The curve an edit cuts, on the parameter of {@link splineCurve}: a fit
 * spline's own knots stand as often as AutoCAD keeps them (k07's triple seam
 * knot), and a closed one runs two turns, so a piece may cross its seam,
 * where AutoCAD's pieces have a knot of `degree` (k03, k07, k36).
 */
export interface SplineRun {
  readonly curve: BSplineCurve
  readonly start: number
  /** The end of one turn: the curve's end, open. */
  readonly end: number
  /** A closed one's period; null on an open one. */
  readonly period: number | null
}

export function splineRun(spline: SplineEntity): SplineRun {
  let curve = splineCurve(spline)
  if (spline.method === "fit" && spline.knotVector) {
    curve = bsplineRaised(curve, spline.knotVector)
  }
  const { start, end } = bsplineDomain(curve)
  const ends = sub3(bsplinePoint(curve, end), bsplinePoint(curve, start))
  if (!spline.closed || length3(ends) > 1e-9 * Math.max(1, end - start)) {
    return { curve, start, end, period: null }
  }
  const period = end - start
  let run = bsplineTwoTurns(curve, drawsPeriodic(spline))
  const seam = end
  const more = run.degree - knotMultiplicity(run.knots, seam)
  if (more > 0) run = bsplineInsertKnot(run, seam, more)
  return { curve: run, start, end, period }
}

/**
 * The parameter of the curve nearest `point` in plan, on a knot it falls
 * within a hair of: a cut there must not leave a piece too short to hold a
 * fit point of its own.
 */
export function splineParamAt(spline: SplineEntity, point: Vec2): number {
  const run = splineRun(spline)
  const { t } = closestPointOnSpline(spline, point)
  return snappedParam(run, run.start + t * (run.end - run.start))
}

/** `u` on the knot or the end it lies within a hair of, so a cut there leaves no sliver. */
export function snappedParam(run: SplineRun, u: number): number {
  const hair = 1e-9 * Math.max(1, run.end - run.start)
  for (const k of [run.start, run.end, ...run.curve.knots]) {
    if (Math.abs(u - k) <= hair) return k
  }
  return u
}

/** The fields a spline's geometry is, which a piece sets afresh. */
function withoutGeometry(
  spline: SplineEntity
): Omit<
  SplineEntity,
  "startTangent" | "endTangent" | "knotVector" | "weights"
> {
  const rest: Record<string, unknown> = { ...spline }
  for (const field of ["startTangent", "endTangent", "knotVector", "weights"]) {
    delete rest[field]
  }
  return rest as Omit<
    SplineEntity,
    "startTangent" | "endTangent" | "knotVector" | "weights"
  >
}

// `+ 0` turns a solve's −0 into the 0 a file writes.
const tidy = (p: Vec3): Vec3 => ({ x: p.x + 0, y: p.y + 0, z: p.z + 0 })

/** The spline on a curve of its own, as a CV spline, its other properties kept. */
function onControlPoints(
  spline: SplineEntity,
  curve: BSplineCurve
): SplineEntity {
  return {
    ...withoutGeometry(spline),
    method: "cv",
    points: curve.controlPoints.map(tidy),
    degree: curve.degree,
    closed: false,
    knotVector: curve.knots.map((k) => k + 0),
    ...(curve.weights ? { weights: [...curve.weights] } : {}),
  }
}

/**
 * The spline on a cubic of its own, as a fit spline: its fit points the
 * curve's at its distinct knots, evaluated as AutoCAD evaluates them (k07's
 * `6.66e-16, 20`), its ends' tangents the derivatives there, its knots
 * Custom (k05, k07, k17, k21).
 */
function onFitPoints(spline: SplineEntity, curve: BSplineCurve): SplineEntity {
  const { start, end } = bsplineDomain(curve)
  const params = [...new Set(curve.knots)].filter((k) => k >= start && k <= end)
  const { first } = bsplineDifferentials(curve)
  return {
    ...withoutGeometry(spline),
    method: "fit",
    points: params.map((u) => tidy(bsplinePoint(curve, u))),
    degree: 3,
    closed: false,
    startTangent: tidy(first(start)),
    endTangent: tidy(first(end)),
    knotVector: curve.knots.map((k) => k + 0),
  }
}

/**
 * TRIM's piece between `from` and `to` on the spline's run: a CV spline on
 * the piece's control points and knots, its fit data dropped, open — a
 * closed one's too (k01–k04, k28, k36).
 */
export function splineCutPiece(
  spline: SplineEntity,
  from: number,
  to: number
): SplineEntity {
  return onControlPoints(
    spline,
    bsplineSegment(splineRun(spline).curve, from, to)
  )
}

/**
 * BREAK's piece between `from` and `to`: TRIM's of a CV spline (k06, k22,
 * k29's weights), a fit spline's a fit spline, the cut ends new fit points
 * (k05, k07, k21, k33).
 */
export function splineBreakPiece(
  spline: SplineEntity,
  from: number,
  to: number
): SplineEntity {
  const curve = bsplineSegment(splineRun(spline).curve, from, to)
  return spline.method === "fit"
    ? onFitPoints(spline, curve)
    : onControlPoints(spline, curve)
}

/**
 * How an open spline grows past an end, EXTEND's: a CV spline by its end's
 * Taylor polynomial, a fit spline straight on, behind a piece that eases its
 * curvature off (`bsplineTaylorGrowth`, `bsplineEasedGrowth`).
 */
export function splineGrowth(
  spline: SplineEntity,
  atEnd: boolean
): BSplineGrowth {
  const curve = splineRun(spline).curve
  return spline.method === "fit"
    ? bsplineEasedGrowth(curve, atEnd)
    : bsplineTaylorGrowth(curve, atEnd)
}

/**
 * The open spline run on past both ends by about `distance`, each end as
 * EXTEND grows it: FILLET's curve, which meets the other object on a growth
 * as on the spline (corners/p237, p448). On the parameter of
 * {@link splineRun}: past its end `u` is {@link splineGrown}'s `u − end`,
 * before its start `start − u`.
 */
export function splineRunOn(
  spline: SplineEntity,
  distance: number
): BSplineCurve {
  const grow =
    spline.method === "fit" ? bsplineEasedGrowth : bsplineTaylorGrowth
  const atEnd = splineGrowth(spline, true)
  const ended = atEnd.grown(atEnd.reach(distance))
  const atStart = grow(ended, false)
  return atStart.grown(atStart.reach(distance))
}

/** The spline grown by `t` past an end, a fit spline still one (k17, k32, k35). */
export function splineGrown(
  spline: SplineEntity,
  atEnd: boolean,
  t: number
): SplineEntity {
  const curve = splineGrowth(spline, atEnd).grown(t)
  return spline.method === "fit"
    ? onFitPoints(spline, curve)
    : onControlPoints(spline, curve)
}

/**
 * The spline with its points in the WCS and no normal, as TRIM and BREAK
 * read one at an angle to the UCS: in plan, on the same parameter (k26,
 * k33). A rotation keeps chords and knots, so the curve is the same one.
 */
export function splineInWorld(spline: SplineEntity): SplineEntity {
  const axes = planeAxes(spline)
  if (!axes) return spline
  const map = (v: Vec3 | undefined) => v && axesToWorld(axes, v)
  return mapped(spline, map, undefined)
}

/** A piece of `source` made in the WCS ({@link splineInWorld}), back in `source`'s plane. */
export function splineInPlaneOf(
  piece: SplineEntity,
  source: SplineEntity
): SplineEntity {
  const axes = planeAxes(source)
  if (!axes) return piece
  const map = (v: Vec3 | undefined) => v && worldToAxes(axes, v)
  return mapped(piece, map, source.normal)
}

function mapped(
  spline: SplineEntity,
  map: (v: Vec3 | undefined) => Vec3 | undefined,
  normal: Vec3 | undefined
): SplineEntity {
  const rest: Record<string, unknown> = { ...spline }
  delete rest.normal
  const startTangent = map(spline.startTangent)
  const endTangent = map(spline.endTangent)
  return {
    ...(rest as Omit<SplineEntity, "normal">),
    points: spline.points.map((p) => map(p)!),
    ...(startTangent ? { startTangent } : {}),
    ...(endTangent ? { endTangent } : {}),
    ...(normal ? { normal } : {}),
  }
}
