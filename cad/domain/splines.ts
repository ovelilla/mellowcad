import { Vec2, V } from "../geometry/Vec2"
import { Vec3, length3, sub3, zOf } from "../geometry/Vec3"
import {
  ClosestResult,
  closestPointOnSegment,
  signChanges,
} from "../geometry/primitives"
import {
  BSplineCurve,
  KnotParameterization,
  bsplineDerivativeCurve,
  bsplineDomain,
  bsplineLength,
  bsplineLengthTable,
  bsplineParamAtLength,
  bsplinePoint,
  bsplineSweptArea,
  bsplineTessellation,
  bsplinesMeeting,
  clampedUniformCurve,
  fitParameters,
  interpolateCubic,
  interpolatePeriodicCubic,
  periodicUniformCurve,
} from "../geometry/nurbs"
import { DEFAULT_LAYER_ID, LayerId } from "./layers"
import { Bounds, EntityId, SplineEntity, SplineMethod } from "./entityTypes"
import { nextEntityId } from "./entityIds"

/** AutoCAD's SPLINE takes degrees 1 to 10 on the CV method. */
export const MAX_SPLINE_DEGREE = 10
export const DEFAULT_SPLINE_DEGREE = 3

export interface SplineOptions {
  readonly degree?: number
  readonly knots?: KnotParameterization
  readonly closed?: boolean
  readonly startTangent?: Vec2 | Vec3
  readonly endTangent?: Vec2 | Vec3
  readonly layerId?: LayerId
  readonly id?: EntityId
}

/**
 * Builds a spline. A fit spline is always cubic; a CV spline's degree drops to
 * one less than its vertex count when there are too few for the one asked —
 * "the degree of the resulting curve equals the number of vertices minus one"
 * — and a closed one's to the vertex count itself (probe spline/p305). A
 * point or a tangent without a Z lies at Z 0.
 */
export function createSpline(
  method: SplineMethod,
  points: readonly (Vec2 | Vec3)[],
  options: SplineOptions = {}
): SplineEntity {
  const tangent = (v: Vec2 | Vec3 | undefined) => {
    const t = v && { x: v.x, y: v.y, z: zOf(v) }
    return t && length3(t) > 1e-12 ? t : undefined
  }
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
    points: points.map((p) => ({ x: p.x, y: p.y, z: zOf(p) })),
    degree:
      method === "fit"
        ? 3
        : cvDegree(
            options.degree ?? DEFAULT_SPLINE_DEGREE,
            points.length,
            options.closed ?? false
          ),
    knots: options.knots ?? "chord",
    closed: options.closed ?? false,
    ...(startTangent ? { startTangent } : {}),
    ...(endTangent ? { endTangent } : {}),
  }
}

function cvDegree(degree: number, count: number, closed: boolean): number {
  return clampDegree(Math.min(degree, closed ? count : count - 1))
}

function clampDegree(degree: number): number {
  if (!Number.isFinite(degree)) return DEFAULT_SPLINE_DEGREE
  return Math.max(1, Math.min(MAX_SPLINE_DEGREE, Math.round(degree)))
}

/**
 * The spline with every point carried through `map`, a similarity in plan,
 * keeping its id and each point's Z — the one path every transform takes; the
 * Z half of a scale is `scaleEntityZ`'s. A tangent is the derivative at the
 * raw knot parameter, and the knots scale with the points as the chords,
 * their square roots or not at all, so it is turned and reflected as a vector
 * and its length scaled to keep the curve the mapped one: unchanged on chord
 * knots, by the factor on uniform ones, by its root on square-root ones — the
 * curve AutoCAD's SCALE leaves (probe spline/p321). Its Z takes that change
 * here, and the factor with the points' Z.
 */
export function mapSplinePoints(
  spline: SplineEntity,
  map: (point: Vec2) => Vec2
): SplineEntity {
  const origin = spline.points[0] ?? V.zero()
  const linear = (v: Vec2) => V.sub(map(V.add(origin, v)), map(origin))
  const factor = V.length(linear({ x: 1, y: 0 }))
  const growth =
    spline.knots === "uniform"
      ? 1
      : spline.knots === "sqrtChord"
        ? 1 / Math.sqrt(factor)
        : 1 / factor
  const mapVector = (v: Vec3): Vec3 =>
    factor > 0
      ? { ...V.scale(linear(v), growth), z: v.z * growth }
      : { x: v.x, y: v.y, z: v.z }
  return {
    ...spline,
    points: spline.points.map((p) => ({ ...map(p), z: p.z })),
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

/**
 * The spline with its `index`th fit point or control vertex moved — a grip
 * drag —, given in its own coordinates, Z and all.
 */
export function splineWithPoint(
  spline: SplineEntity,
  index: number,
  point: Vec3
): SplineEntity {
  return {
    ...spline,
    points: spline.points.map((p, i) =>
      i === index ? { x: point.x, y: point.y, z: point.z } : p
    ),
  }
}

/**
 * The points the Properties palette steps through, as AutoCAD lists them: a
 * closed fit spline's first fit point again at its end (desktop spline/d10-3
 * counts 4 for three picks). Each is the stored point of index `i` modulo
 * their count.
 */
export function splineDataPoints(spline: SplineEntity): readonly Vec3[] {
  return spline.method === "fit" && spline.closed && spline.points.length > 0
    ? [...spline.points, spline.points[0]]
    : spline.points
}

/** How far off its plane a point may stand, in units of the spline's size, and still lie in it. */
const LEVEL_TOLERANCE = 1e-10

/**
 * Whether the spline lies in the plane of its normal: every point at one Z
 * and its tangents along it. A spline kept on its own plane
 * (`splineOnItsPlane`) lies in a plane exactly when it does.
 */
export function isLevelSpline(spline: SplineEntity): boolean {
  const z = spline.points[0]?.z ?? 0
  const size = Math.max(
    1,
    ...spline.points.map((p) => Math.abs(p.x) + Math.abs(p.y) + Math.abs(p.z))
  )
  const flat = (v: Vec3 | undefined) =>
    !v || Math.abs(v.z) <= LEVEL_TOLERANCE * Math.max(1, length3(v))
  return (
    spline.points.every((p) => Math.abs(p.z - z) <= LEVEL_TOLERANCE * size) &&
    flat(spline.startTangent) &&
    flat(spline.endTangent)
  )
}

/** The Z of the curve over `point`, a point of its plan: where it passes nearest there. */
export function splineZAt(spline: SplineEntity, point: Vec2): number {
  if (isLevelSpline(spline)) return spline.points[0]?.z ?? 0
  return closestPointOnSpline(spline, point).point.z
}

/** The NURBS the spline draws. A fit spline's is re-derived from its fit points every time. */
export function splineCurve(spline: SplineEntity): BSplineCurve {
  return spline.method === "fit" ? fitCurve(spline) : controlCurve(spline)
}

function controlCurve(spline: SplineEntity): BSplineCurve {
  const points = spline.points
  if (points.length < 2) return pointCurve(points[0] ?? ZERO)
  const degree = cvDegree(spline.degree, points.length, spline.closed)
  if (!spline.closed) return clampedUniformCurve(points, degree)
  // WHY rotated: AutoCAD's periodic curve starts where ours would be at
  // u = n − degree (probe spline/p305's five starts, p311's End snap).
  const n = points.length
  const loop = points.map((_, i) => points[(i + n - degree) % n])
  return periodicUniformCurve(loop, degree)
}

/**
 * A given tangent is the curve's derivative at its end, by the raw knot
 * parameter, as stored; a free end has no curvature (probes spline/p01,
 * p300–p302, p306, p308).
 */
function fitCurve(spline: SplineEntity): BSplineCurve {
  const points = distinctFitPoints(spline.points, spline.closed)
  if (points.length < 2) return pointCurve(points[0] ?? ZERO)
  if (spline.closed && points.length >= 3) {
    const params = fitParameters(points, spline.knots, true)
    if (!spline.startTangent) return interpolatePeriodicCubic(points, params)
    // Only a file holds one: SPLINE drops the tangent at Close (p307).
    const loop = [...points, points[0]]
    return interpolateCubic(
      loop,
      params,
      spline.startTangent,
      spline.startTangent
    )
  }
  const params = fitParameters(points, spline.knots, false)
  return interpolateCubic(
    points,
    params,
    spline.startTangent ?? null,
    spline.endTangent ?? null
  )
}

/** Two fit points on top of each other would share a parameter and leave the fit unsolvable. */
function distinctFitPoints(points: readonly Vec3[], closed: boolean): Vec3[] {
  const apart = (a: Vec3, b: Vec3) => length3(sub3(a, b)) > 1e-9
  const distinct: Vec3[] = []
  for (const point of points) {
    const last = distinct[distinct.length - 1]
    if (!last || apart(last, point)) distinct.push(point)
  }
  if (closed) {
    while (
      distinct.length > 1 &&
      !apart(distinct[0], distinct[distinct.length - 1])
    ) {
      distinct.pop()
    }
  }
  return distinct
}

const ZERO: Vec3 = { x: 0, y: 0, z: 0 }

function pointCurve(point: Vec3): BSplineCurve {
  return { degree: 1, knots: [0, 0, 1, 1], controlPoints: [point, point] }
}

/**
 * How closely the queries follow the curve: a hundred-thousandth of its extent.
 * Picking and bounds read the tessellation, so this is their error; the
 * measures and snaps start from it and refine onto the curve; drawing
 * tessellates again at the screen's own resolution.
 */
function queryTolerance(curve: BSplineCurve): number {
  const min = { x: Infinity, y: Infinity, z: Infinity }
  const max = { x: -Infinity, y: -Infinity, z: -Infinity }
  for (const p of curve.controlPoints) {
    for (const axis of ["x", "y", "z"] as const) {
      min[axis] = Math.min(min[axis], p[axis])
      max[axis] = Math.max(max[axis], p[axis])
    }
  }
  return Math.max(length3(sub3(max, min)) * 1e-5, 1e-9)
}

/** Points along the spline, the chords within `tolerance` of it (a size-relative one by default). */
export function splinePolyline(
  spline: SplineEntity,
  tolerance?: number
): Vec3[] {
  const curve = splineCurve(spline)
  return bsplineTessellation(curve, tolerance ?? queryTolerance(curve)).points
}

/** The curve and its query tessellation, each point with its parameter: where a crossing is looked for before it is refined. */
export function splineChords(spline: SplineEntity): {
  readonly curve: BSplineCurve
  readonly params: readonly number[]
  readonly points: readonly Vec3[]
} {
  const curve = splineCurve(spline)
  return { curve, ...bsplineTessellation(curve, queryTolerance(curve)) }
}

export function splineStartPoint(spline: SplineEntity): Vec3 {
  const curve = splineCurve(spline)
  return bsplinePoint(curve, bsplineDomain(curve).start)
}

export function splineEndPoint(spline: SplineEntity): Vec3 {
  const curve = splineCurve(spline)
  return bsplinePoint(curve, bsplineDomain(curve).end)
}

/** Its length along the curve in space, by quadrature (LIST's and AREA's, probes spline/p327, spline3d/s02). */
export function splineLength(spline: SplineEntity): number {
  return bsplineLength(splineCurve(spline))
}

/**
 * The point halfway along the curve from its start, in space — Midpoint's
 * point on a spline, a closed one's too (probes spline/p310, p311,
 * spline3d/s03).
 */
export function splineMidpoint(spline: SplineEntity): Vec3 {
  const curve = splineCurve(spline)
  return bsplinePoint(
    curve,
    bsplineParamAtLength(curve, bsplineLength(curve) / 2)
  )
}

/** A spline measured along its length. */
export interface SplineLength {
  readonly curve: BSplineCurve
  readonly length: number
  /** The curve's parameter at `distance` along it from its start, clamped to it. */
  paramAt(distance: number): number
}

/**
 * The curve's length, and the parameter at any distance along it
 * ({@link bsplineLengthTable}): the linetype's dashes are laid by length,
 * many at once, where {@link splineMidpoint}'s one search would walk every
 * piece each.
 */
export function splineLengthTable(spline: SplineEntity): SplineLength {
  const curve = splineCurve(spline)
  const { length, paramAt } = bsplineLengthTable(curve)
  return { curve, length, paramAt }
}

/**
 * The area AREA reports: the curve closed by its chord — nothing when closed
 * — cut where it crosses itself or the chord into loops, their areas added
 * whatever their turn (probes spline/p327 `85.84165405`, the two loops an
 * open spline makes with its chord; p317 `39.7222`, a closed bowtie). A loop
 * entered and left at one crossing is taken out whole as the walk comes back
 * to it; loops that interleave (two crossings, each inside the other's loop)
 * are split as they are met.
 */
export function splineArea(spline: SplineEntity): number {
  const { curve, params, points } = splineChords(spline)
  const { start, end } = bsplineDomain(curve)
  const first = bsplinePoint(curve, start)
  const last = bsplinePoint(curve, end)
  const crossings = [
    ...selfCrossings(curve, params, points, spline.closed),
    ...chordCrossings(curve, params, points, last, first),
  ].slice(0, MAX_AREA_CROSSINGS)

  // A walk along the curve, then back along the chord: `s` is the curve's
  // parameter, or `end` plus the chord's fraction from its end to its start.
  const curveArea = bsplineSweptArea(curve, start, end)
  const sweptTo = (s: number): number =>
    s <= end
      ? bsplineSweptArea(curve, start, s)
      : curveArea + V.cross(last, V.lerp(last, first, s - end)) / 2
  const events = crossings
    .flatMap(([a, b], pair) => [
      { s: a, pair },
      { s: b, pair },
    ])
    .sort((x, y) => x.s - y.s)
  const stack: { readonly s: number; readonly pair: number }[] = []
  const loops: { from: number; to: number; area: number; inside: boolean }[] =
    []
  const takeOut = (from: number, to: number) => {
    let area = sweptTo(to) - sweptTo(from)
    for (const loop of loops) {
      if (!loop.inside && loop.from >= from && loop.to <= to) {
        area -= loop.area
        loop.inside = true
      }
    }
    loops.push({ from, to, area, inside: false })
  }
  for (const event of events) {
    const open = stack.findIndex((held) => held.pair === event.pair)
    if (open < 0) {
      stack.push(event)
      continue
    }
    const from = stack[open].s
    stack.length = open + 1
    takeOut(from, event.s)
  }
  takeOut(start, end + 1)
  return loops.reduce((sum, loop) => sum + Math.abs(loop.area), 0)
}

/** Crossings AREA cuts loops at: past this many the rest are taken as one loop. */
const MAX_AREA_CROSSINGS = 64

/**
 * Where the curve crosses itself, as pairs of parameters: chords that cross,
 * their crossing refined onto the curve. A touch that does not cross is no
 * loop's corner, nor is a closed curve's start.
 */
function selfCrossings(
  curve: BSplineCurve,
  params: readonly number[],
  points: readonly Vec2[],
  closed: boolean
): [number, number][] {
  const found: [number, number][] = []
  const last = points.length - 2
  const boxes = points.slice(1).map((b, i) => {
    const a = points[i]
    return {
      i,
      minX: Math.min(a.x, b.x),
      maxX: Math.max(a.x, b.x),
      minY: Math.min(a.y, b.y),
      maxY: Math.max(a.y, b.y),
    }
  })
  boxes.sort((x, y) => x.minX - y.minX)
  for (let m = 0; m < boxes.length; m++) {
    const one = boxes[m]
    for (let k = m + 1; k < boxes.length && boxes[k].minX <= one.maxX; k++) {
      const two = boxes[k]
      if (two.minY > one.maxY || two.maxY < one.minY) continue
      const i = Math.min(one.i, two.i)
      const j = Math.max(one.i, two.i)
      if (j - i < 2 || (closed && i === 0 && j === last)) continue
      const hit = segmentsCrossAt(
        points[i],
        points[i + 1],
        points[j],
        points[j + 1]
      )
      if (!hit) continue
      const u = params[i] + (params[i + 1] - params[i]) * hit.s
      const v = params[j] + (params[j + 1] - params[j]) * hit.t
      const met = bsplinesMeeting(curve, u, curve, v)
      if (!met || Math.abs(met.u - met.v) <= SAME_PARAM) continue
      const pair: [number, number] =
        met.u < met.v ? [met.u, met.v] : [met.v, met.u]
      // A crossing on a tessellation vertex is found by each chord there.
      if (
        !found.some(
          ([a, b]) =>
            Math.abs(a - pair[0]) <= SAME_PARAM &&
            Math.abs(b - pair[1]) <= SAME_PARAM
        )
      ) {
        found.push(pair)
      }
      if (found.length >= MAX_AREA_CROSSINGS) return found
    }
  }
  return found
}

/**
 * Where the curve crosses its chord from `from` (its end) to `to` (its start),
 * strictly between them: the curve's parameter, and the walk's along the
 * chord (its end plus the fraction).
 */
function chordCrossings(
  curve: BSplineCurve,
  params: readonly number[],
  points: readonly Vec2[],
  from: Vec2,
  to: Vec2
): [number, number][] {
  const chord = V.sub(to, from)
  const lengthSq = V.lengthSq(chord)
  if (lengthSq < 1e-24) return []
  const side = (q: Vec2) => V.cross(chord, V.sub(q, from))
  const { end } = bsplineDomain(curve)
  const found: [number, number][] = []
  for (let i = 1; i < points.length; i++) {
    const a = side(points[i - 1])
    const b = side(points[i])
    if (a === 0 || b === 0 || Math.sign(a) === Math.sign(b)) continue
    const [u] = signChanges(
      (t) => side(bsplinePoint(curve, t)),
      params[i - 1],
      params[i] - params[i - 1],
      1
    )
    if (u === undefined) continue
    const t = V.dot(V.sub(bsplinePoint(curve, u), from), chord) / lengthSq
    if (t > 1e-12 && t < 1 - 1e-12) found.push([u, end + t])
  }
  return found
}

/** Parameters this close are one crossing, found twice. */
const SAME_PARAM = 1e-9

/** Where two segments cross, ends included, as each one's fraction. */
function segmentsCrossAt(
  a: Vec2,
  b: Vec2,
  c: Vec2,
  d: Vec2
): { readonly s: number; readonly t: number } | null {
  const r = V.sub(b, a)
  const q = V.sub(d, c)
  const denominator = V.cross(r, q)
  if (Math.abs(denominator) < 1e-300) return null
  const offset = V.sub(c, a)
  const s = V.cross(offset, q) / denominator
  const t = V.cross(offset, r) / denominator
  return s >= 0 && s <= 1 && t >= 0 && t <= 1 ? { s, t } : null
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
 * The point on the curve nearest `point` in plan, with the curve's Z there
 * (spline3d/s03's Nearest). The closest point on a NURBS has no
 * closed form: the nearest chord of the tessellation gives a parameter, and a
 * bounded Newton on `(C(u) − p)·C′(u) = 0` refines it. Both candidates are
 * points of the curve: the chord's own point can lie nearer than the curve
 * ever comes, inside its bend (probe spline/p310's Nearest).
 */
export function closestPointOnSpline(
  spline: SplineEntity,
  point: Vec2
): ClosestResult & { readonly point: Vec3 } {
  const { curve, params, points } = splineChords(spline)
  let nearest = Infinity
  let u = params[0]
  for (let i = 1; i < points.length; i++) {
    const candidate = closestPointOnSegment(points[i - 1], points[i], point)
    if (candidate.distance < nearest) {
      nearest = candidate.distance
      u = params[i - 1] + (params[i] - params[i - 1]) * candidate.t
    }
  }
  const first = bsplineDerivativeCurve(curve)
  const second = bsplineDerivativeCurve(first)
  const { start, end } = bsplineDomain(curve)
  const onChord = u
  for (let i = 0; i < NEWTON_STEPS; i++) {
    const offset = V.sub(bsplinePoint(curve, u), point)
    const d1 = bsplinePoint(first, u)
    const slope = V.dot(d1, d1) + V.dot(offset, bsplinePoint(second, u))
    if (slope <= 1e-18) break
    u = Math.min(end, Math.max(start, u - V.dot(offset, d1) / slope))
  }
  const refined = bsplinePoint(curve, u)
  const unrefined = bsplinePoint(curve, onChord)
  if (V.distance(unrefined, point) < V.distance(refined, point)) u = onChord
  const closest = bsplinePoint(curve, u)
  return {
    point: closest,
    distance: V.distance(closest, point),
    t: end > start ? (u - start) / (end - start) : 0,
  }
}

/** Newton converges quadratically from the chord's estimate; a few steps are plenty. */
const NEWTON_STEPS = 8
