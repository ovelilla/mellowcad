import { V, Vec2 } from "./Vec2"
import {
  BSplineCurve,
  bsplineBreakpoints,
  bsplineDifferentials,
  bsplineLength,
  bsplinePoint,
  bsplineSweptArea,
  bsplineTessellation,
} from "./nurbs"
import { signChanges } from "./primitives"

/**
 * The model's one tolerance, ACIS's resabs (1e-6): two points closer than
 * this are the same point, a curve within it of another runs along it. The
 * solids' kernel decides with it too, so it is fixed from the first object
 * the kernel makes (docs/next-solids.md §3).
 */
export const MODEL_TOLERANCE = 1e-6

/**
 * An edge of a planar region in its plane's coordinates, with a direction of
 * travel. Each kind keeps the curve it lies on exactly: an arc its circle, an
 * elliptical arc its ellipse, a spline piece its whole NURBS and the stretch of
 * parameter it runs over, so a piece cut from a piece is still that curve.
 *
 * - `arc`: from `startAngle`, `sweep` radians, counter-clockwise when positive,
 *   a whole turn at most.
 * - `ellipse`: the points `center + majorAxis·cos t + minor·sin t`, minor being
 *   the major axis turned a quarter counter-clockwise and scaled by `ratio`,
 *   for `t` from `startParam` over `sweep`.
 * - `spline`: the NURBS from parameter `from` to `to`; `to < from` runs it
 *   backwards. Its control points lie at Z 0.
 */
export type PlanarCurve =
  | { readonly kind: "line"; readonly start: Vec2; readonly end: Vec2 }
  | {
      readonly kind: "arc"
      readonly center: Vec2
      readonly radius: number
      readonly startAngle: number
      readonly sweep: number
    }
  | {
      readonly kind: "ellipse"
      readonly center: Vec2
      readonly majorAxis: Vec2
      readonly ratio: number
      readonly startParam: number
      readonly sweep: number
    }
  | {
      readonly kind: "spline"
      readonly curve: BSplineCurve
      readonly from: number
      readonly to: number
    }

const FULL_TURN = Math.PI * 2

/** The ellipse's minor semi-axis as a vector. */
function minorAxis(c: Extract<PlanarCurve, { kind: "ellipse" }>): Vec2 {
  return V.scale(V.perpendicular(c.majorAxis), c.ratio)
}

const differentials = new WeakMap<
  BSplineCurve,
  ReturnType<typeof bsplineDifferentials>
>()

function splineDifferentials(curve: BSplineCurve) {
  let found = differentials.get(curve)
  if (!found) {
    found = bsplineDifferentials(curve)
    differentials.set(curve, found)
  }
  return found
}

/** The point at `s` of the curve's own run, `s` from 0 at its start to 1 at its end. */
export function curvePoint(c: PlanarCurve, s: number): Vec2 {
  switch (c.kind) {
    case "line":
      return V.lerp(c.start, c.end, s)
    case "arc": {
      const angle = c.startAngle + c.sweep * s
      return {
        x: c.center.x + c.radius * Math.cos(angle),
        y: c.center.y + c.radius * Math.sin(angle),
      }
    }
    case "ellipse": {
      const t = c.startParam + c.sweep * s
      const minor = minorAxis(c)
      return {
        x: c.center.x + c.majorAxis.x * Math.cos(t) + minor.x * Math.sin(t),
        y: c.center.y + c.majorAxis.y * Math.cos(t) + minor.y * Math.sin(t),
      }
    }
    case "spline": {
      const p = bsplinePoint(c.curve, c.from + (c.to - c.from) * s)
      return { x: p.x, y: p.y }
    }
  }
}

/** The derivative by `s`: the direction of travel, scaled by the speed. */
export function curveDerivative(c: PlanarCurve, s: number): Vec2 {
  switch (c.kind) {
    case "line":
      return V.sub(c.end, c.start)
    case "arc": {
      const angle = c.startAngle + c.sweep * s
      const k = c.radius * c.sweep
      return { x: -Math.sin(angle) * k, y: Math.cos(angle) * k }
    }
    case "ellipse": {
      const t = c.startParam + c.sweep * s
      const minor = minorAxis(c)
      return {
        x: (-c.majorAxis.x * Math.sin(t) + minor.x * Math.cos(t)) * c.sweep,
        y: (-c.majorAxis.y * Math.sin(t) + minor.y * Math.cos(t)) * c.sweep,
      }
    }
    case "spline": {
      const span = c.to - c.from
      const d = splineDifferentials(c.curve).first(c.from + span * s)
      return { x: d.x * span, y: d.y * span }
    }
  }
}

export function curveStart(c: PlanarCurve): Vec2 {
  return c.kind === "line" ? c.start : curvePoint(c, 0)
}

export function curveEnd(c: PlanarCurve): Vec2 {
  return c.kind === "line" ? c.end : curvePoint(c, 1)
}

/** The unit direction of travel at `s`; a cusp's is read a little further on. */
export function curveTangent(c: PlanarCurve, s: number): Vec2 {
  const d = curveDerivative(c, s)
  const length = V.length(d)
  if (length > 1e-12) return V.scale(d, 1 / length)
  const ahead = curvePoint(c, Math.min(1, s + 1e-6))
  const behind = curvePoint(c, Math.max(0, s - 1e-6))
  return V.normalize(V.sub(ahead, behind))
}

/** The same curve run the other way. */
export function curveReversed(c: PlanarCurve): PlanarCurve {
  switch (c.kind) {
    case "line":
      return { kind: "line", start: c.end, end: c.start }
    case "arc":
      return { ...c, startAngle: c.startAngle + c.sweep, sweep: -c.sweep }
    case "ellipse":
      return { ...c, startParam: c.startParam + c.sweep, sweep: -c.sweep }
    case "spline":
      return { ...c, from: c.to, to: c.from }
  }
}

/** The stretch of the curve from `s0` to `s1` of its run, as a curve of its own. */
export function curvePiece(
  c: PlanarCurve,
  s0: number,
  s1: number
): PlanarCurve {
  switch (c.kind) {
    case "line":
      return {
        kind: "line",
        start: s0 === 0 ? c.start : curvePoint(c, s0),
        end: s1 === 1 ? c.end : curvePoint(c, s1),
      }
    case "arc":
      return {
        ...c,
        startAngle: c.startAngle + c.sweep * s0,
        sweep: c.sweep * (s1 - s0),
      }
    case "ellipse":
      return {
        ...c,
        startParam: c.startParam + c.sweep * s0,
        sweep: c.sweep * (s1 - s0),
      }
    case "spline": {
      const span = c.to - c.from
      return { ...c, from: c.from + span * s0, to: c.from + span * s1 }
    }
  }
}

/** Gauss–Legendre's nodes and weights on [-1, 1], eight points. */
const GAUSS_8: readonly (readonly [number, number])[] = [
  [-0.9602898564975363, 0.1012285362903763],
  [-0.7966664774136267, 0.2223810344533745],
  [-0.525532409916329, 0.3137066458778873],
  [-0.1834346424956498, 0.362683783378362],
  [0.1834346424956498, 0.362683783378362],
  [0.525532409916329, 0.3137066458778873],
  [0.7966664774136267, 0.2223810344533745],
  [0.9602898564975363, 0.1012285362903763],
]

/** Parts an elliptical arc's length is summed over: its speed has no closed integral. */
const ELLIPSE_LENGTH_PARTS = 64

export function curveLength(c: PlanarCurve): number {
  switch (c.kind) {
    case "line":
      return V.distance(c.start, c.end)
    case "arc":
      return Math.abs(c.radius * c.sweep)
    case "ellipse": {
      const parts = Math.max(
        4,
        Math.ceil((ELLIPSE_LENGTH_PARTS * Math.abs(c.sweep)) / FULL_TURN)
      )
      let sum = 0
      for (let i = 0; i < parts; i++) {
        for (const [x, w] of GAUSS_8) {
          const s = (i + (x + 1) / 2) / parts
          sum += (w / 2 / parts) * V.length(curveDerivative(c, s))
        }
      }
      return sum
    }
    case "spline":
      return bsplineLength(
        c.curve,
        Math.min(c.from, c.to),
        Math.max(c.from, c.to)
      )
  }
}

/**
 * Half `∫ (x dy − y dx)` along the curve: summed round a closed loop, its
 * signed area, positive counter-clockwise (Green). Exact for every kind but a
 * rational spline, which {@link bsplineSweptArea} integrates to convergence.
 */
export function curveSweptArea(c: PlanarCurve): number {
  switch (c.kind) {
    case "line":
      return V.cross(c.start, c.end) / 2
    case "arc": {
      const { center: o, radius: r, startAngle: a0, sweep } = c
      const a1 = a0 + sweep
      return (
        (r *
          (o.x * (Math.sin(a1) - Math.sin(a0)) -
            o.y * (Math.cos(a1) - Math.cos(a0))) +
          r * r * sweep) /
        2
      )
    }
    case "ellipse": {
      const m = c.majorAxis
      const n = minorAxis(c)
      const t0 = c.startParam
      const t1 = t0 + c.sweep
      return (
        (V.cross(c.center, m) * (Math.cos(t1) - Math.cos(t0)) +
          V.cross(c.center, n) * (Math.sin(t1) - Math.sin(t0)) +
          V.cross(m, n) * c.sweep) /
        2
      )
    }
    case "spline":
      return bsplineSweptArea(c.curve, c.from, c.to)
  }
}

/**
 * Points along the curve no further than `tolerance` from it, with the `s`
 * of each: the first at 0, the last at 1.
 */
export function curveTessellation(
  c: PlanarCurve,
  tolerance: number
): { readonly s: number[]; readonly points: Vec2[] } {
  const even = (steps: number) => {
    const n = Math.min(4096, Math.max(1, steps))
    const s = Array.from({ length: n + 1 }, (_, i) => i / n)
    return { s, points: s.map((t) => curvePoint(c, t)) }
  }
  switch (c.kind) {
    case "line":
      return { s: [0, 1], points: [c.start, c.end] }
    case "arc":
    case "ellipse": {
      const r = c.kind === "arc" ? c.radius : V.length(c.majorAxis)
      const step =
        tolerance >= r ? Math.PI / 2 : 2 * Math.acos(1 - tolerance / r)
      return even(Math.ceil(Math.abs(c.sweep) / Math.max(step, 1e-4)))
    }
    case "spline": {
      const lo = Math.min(c.from, c.to)
      const hi = Math.max(c.from, c.to)
      const whole = bsplineTessellation(c.curve, tolerance)
      const params = [lo, ...whole.params.filter((u) => u > lo && u < hi), hi]
      const s = params.map((u) => (u - c.from) / (c.to - c.from))
      if (c.to < c.from) s.reverse()
      return { s, points: s.map((t) => curvePoint(c, t)) }
    }
  }
}

export interface Box2 {
  readonly min: Vec2
  readonly max: Vec2
}

/** A box round the curve: exact for lines and arcs, the hull's for a spline. */
export function curveBox(c: PlanarCurve): Box2 {
  const points: Vec2[] = [curveStart(c), curveEnd(c)]
  switch (c.kind) {
    case "line":
      break
    case "arc":
    case "ellipse": {
      const m = c.kind === "arc" ? { x: c.radius, y: 0 } : c.majorAxis
      const n = c.kind === "arc" ? { x: 0, y: c.radius } : minorAxis(c)
      const start = c.kind === "arc" ? c.startAngle : c.startParam
      // x and y are extreme where their derivatives by t vanish.
      for (const t0 of [Math.atan2(n.x, m.x), Math.atan2(n.y, m.y)]) {
        for (const t of [t0, t0 + Math.PI]) {
          const s = sweptFraction(start, c.sweep, t)
          if (s !== null) points.push(curvePoint(c, s))
        }
      }
      break
    }
    case "spline":
      for (const p of c.curve.controlPoints) points.push(p)
      break
  }
  return boxOf(points)
}

export function boxOf(points: readonly Vec2[]): Box2 {
  let minX = Infinity
  let minY = Infinity
  let maxX = -Infinity
  let maxY = -Infinity
  for (const p of points) {
    minX = Math.min(minX, p.x)
    minY = Math.min(minY, p.y)
    maxX = Math.max(maxX, p.x)
    maxY = Math.max(maxY, p.y)
  }
  return { min: { x: minX, y: minY }, max: { x: maxX, y: maxY } }
}

export function boxesTouch(a: Box2, b: Box2, margin: number): boolean {
  return (
    a.min.x <= b.max.x + margin &&
    b.min.x <= a.max.x + margin &&
    a.min.y <= b.max.y + margin &&
    b.min.y <= a.max.y + margin
  )
}

/** Where angle `t` falls along a sweep from `start`, as a fraction of it, or null outside. */
export function sweptFraction(
  start: number,
  sweep: number,
  t: number
): number | null {
  const turn = sweep >= 0 ? t - start : start - t
  const along = ((turn % FULL_TURN) + FULL_TURN) % FULL_TURN
  const s = along / Math.abs(sweep)
  if (s <= 1) return s
  // A point just before the start reads as nearly a whole turn.
  if ((FULL_TURN - along) / Math.abs(sweep) < 1e-12) return 0
  return null
}

/**
 * A map of the plane: `linear`, then a shift. {@link curveMapped} takes one
 * that keeps shapes (a turn or a reflection, `linear`'s columns orthogonal
 * and of one length, its scale); {@link curveAffine} any.
 */
export interface PlanarSimilarity {
  readonly linear: {
    readonly xx: number
    readonly xy: number
    readonly yx: number
    readonly yy: number
  }
  readonly translation: Vec2
}

export function similarityPoint(map: PlanarSimilarity, p: Vec2): Vec2 {
  const { linear: l, translation: t } = map
  return { x: l.xx * p.x + l.xy * p.y + t.x, y: l.yx * p.x + l.yy * p.y + t.y }
}

function similarityVector(map: PlanarSimilarity, v: Vec2): Vec2 {
  const l = map.linear
  return { x: l.xx * v.x + l.xy * v.y, y: l.yx * v.x + l.yy * v.y }
}

export function similarityReflects(map: PlanarSimilarity): boolean {
  const l = map.linear
  return l.xx * l.yy - l.xy * l.yx < 0
}

/**
 * The curve carried through `map`, running the same way. A reflection turns
 * an arc's sweep clockwise and an ellipse's parameter backwards: its minor
 * axis, a quarter turn from the major one, lands on the other side.
 */
export function curveMapped(
  c: PlanarCurve,
  map: PlanarSimilarity
): PlanarCurve {
  const reflects = similarityReflects(map)
  switch (c.kind) {
    case "line":
      return {
        kind: "line",
        start: similarityPoint(map, c.start),
        end: similarityPoint(map, c.end),
      }
    case "arc": {
      const center = similarityPoint(map, c.center)
      const start = V.sub(similarityPoint(map, curveStart(c)), center)
      return {
        kind: "arc",
        center,
        radius: V.length(start),
        startAngle: Math.atan2(start.y, start.x),
        sweep: reflects ? -c.sweep : c.sweep,
      }
    }
    case "ellipse":
      return {
        ...c,
        center: similarityPoint(map, c.center),
        majorAxis: similarityVector(map, c.majorAxis),
        startParam: reflects ? -c.startParam : c.startParam,
        sweep: reflects ? -c.sweep : c.sweep,
      }
    case "spline":
      return {
        ...c,
        curve: {
          ...c.curve,
          controlPoints: c.curve.controlPoints.map((p) => ({
            ...similarityPoint(map, p),
            z: 0,
          })),
        },
      }
  }
}

/** The point of the curve nearest `p`, with its `s`. */
export function curveClosest(
  c: PlanarCurve,
  p: Vec2
): { readonly s: number; readonly point: Vec2; readonly distance: number } {
  const at = (s: number) => {
    const point = curvePoint(c, s)
    return { s, point, distance: V.distance(point, p) }
  }
  if (c.kind === "line") {
    const d = V.sub(c.end, c.start)
    const lengthSq = V.lengthSq(d)
    const s =
      lengthSq === 0
        ? 0
        : Math.max(0, Math.min(1, V.dot(V.sub(p, c.start), d) / lengthSq))
    return at(s)
  }
  if (c.kind === "arc") {
    const s = sweptFraction(
      c.startAngle,
      c.sweep,
      Math.atan2(p.y - c.center.y, p.x - c.center.x)
    )
    if (s !== null) return at(s)
    const a = at(0)
    const b = at(1)
    return a.distance <= b.distance ? a : b
  }
  // No closed form: the nearest chord's point, then Newton on (P − p)·P′ = 0.
  const size = V.distance(curveBox(c).min, curveBox(c).max)
  const { s: params, points } = curveTessellation(
    c,
    Math.max(size * 1e-3, MODEL_TOLERANCE)
  )
  let best = at(0)
  for (let i = 0; i + 1 < points.length; i++) {
    const a = points[i]
    const d = V.sub(points[i + 1], a)
    const lengthSq = V.lengthSq(d)
    const f =
      lengthSq === 0
        ? 0
        : Math.max(0, Math.min(1, V.dot(V.sub(p, a), d) / lengthSq))
    const guess = at(params[i] + (params[i + 1] - params[i]) * f)
    if (guess.distance < best.distance) best = guess
  }
  let s = best.s
  for (let k = 0; k < 12; k++) {
    const offset = V.sub(curvePoint(c, s), p)
    const d1 = curveDerivative(c, s)
    const h = 1e-6
    const d2 = V.scale(
      V.sub(
        curveDerivative(c, Math.min(1, s + h)),
        curveDerivative(c, Math.max(0, s - h))
      ),
      1 / (Math.min(1, s + h) - Math.max(0, s - h))
    )
    const g = V.dot(offset, d1)
    const dg = V.dot(d1, d1) + V.dot(offset, d2)
    if (!(Math.abs(dg) > 0)) break
    const next = Math.max(0, Math.min(1, s - g / dg))
    if (Math.abs(next - s) < 1e-15) break
    s = next
  }
  const refined = at(s)
  return refined.distance <= best.distance ? refined : best
}

/** One place two curves meet: `s` along the first, `t` along the second. */
export interface CurveMeeting {
  readonly s: number
  readonly t: number
}

/** A stretch two curves share: `s0`–`s1` of the first runs along `t0`–`t1` of the second. */
export interface CurveOverlap {
  readonly s0: number
  readonly s1: number
  readonly t0: number
  readonly t1: number
}

/**
 * Where two curves cross or touch, and the stretches they share. Lines and
 * circles meet in closed form; anything with an ellipse or a spline is found
 * on chords of both and polished by Newton on `P(s) = Q(t)`, which finds
 * crossings and misses a mere touch (one with no closed form).
 */
export function curveMeetings(
  a: PlanarCurve,
  b: PlanarCurve
): { meetings: CurveMeeting[]; overlaps: CurveOverlap[] } {
  if (!boxesTouch(curveBox(a), curveBox(b), MODEL_TOLERANCE)) {
    return { meetings: [], overlaps: [] }
  }
  const overlaps = sharedStretches(a, b)
  if (overlaps !== null) return { meetings: [], overlaps }
  let meetings: CurveMeeting[]
  if (a.kind === "line" && b.kind === "line") meetings = lineLine(a, b)
  else if (a.kind === "line" && b.kind === "arc") meetings = lineArc(a, b)
  else if (a.kind === "arc" && b.kind === "line")
    meetings = lineArc(b, a).map(({ s, t }) => ({ s: t, t: s }))
  else if (a.kind === "arc" && b.kind === "arc") meetings = arcArc(a, b)
  else meetings = numericMeetings(a, b)
  return { meetings: distinctMeetings(meetings), overlaps: [] }
}

function distinctMeetings(meetings: CurveMeeting[]): CurveMeeting[] {
  const out: CurveMeeting[] = []
  for (const m of meetings.sort((x, y) => x.s - y.s)) {
    const last = out[out.length - 1]
    if (last && Math.abs(last.s - m.s) < 1e-9 && Math.abs(last.t - m.t) < 1e-9)
      continue
    out.push(m)
  }
  return out
}

const PARAM_SLACK = 1e-9

function within(s: number): boolean {
  return s >= -PARAM_SLACK && s <= 1 + PARAM_SLACK
}

function clamp01(s: number): number {
  return Math.max(0, Math.min(1, s))
}

type Line = Extract<PlanarCurve, { kind: "line" }>
type Arc = Extract<PlanarCurve, { kind: "arc" }>

function lineLine(a: Line, b: Line): CurveMeeting[] {
  const r = V.sub(a.end, a.start)
  const q = V.sub(b.end, b.start)
  const denom = V.cross(r, q)
  const w = V.sub(b.start, a.start)
  if (Math.abs(denom) < 1e-15 * V.length(r) * V.length(q)) {
    // Parallel: only ends touching can meet.
    return endTouches(a, b)
  }
  const s = V.cross(w, q) / denom
  const t = V.cross(w, r) / denom
  const out: CurveMeeting[] = []
  if (within(s) && within(t)) out.push({ s: clamp01(s), t: clamp01(t) })
  return out.length > 0 ? out : endTouches(a, b)
}

/** An end of either curve lying on the other, within the tolerance. */
function endTouches(a: PlanarCurve, b: PlanarCurve): CurveMeeting[] {
  const out: CurveMeeting[] = []
  for (const s of [0, 1]) {
    const hit = curveClosest(b, curvePoint(a, s))
    if (hit.distance <= MODEL_TOLERANCE) out.push({ s, t: hit.s })
  }
  for (const t of [0, 1]) {
    const hit = curveClosest(a, curvePoint(b, t))
    if (hit.distance <= MODEL_TOLERANCE) out.push({ s: hit.s, t })
  }
  return out
}

function lineArc(line: Line, arc: Arc): CurveMeeting[] {
  const d = V.sub(line.end, line.start)
  const f = V.sub(line.start, arc.center)
  const A = V.dot(d, d)
  const B = 2 * V.dot(f, d)
  const C = V.dot(f, f) - arc.radius * arc.radius
  let disc = B * B - 4 * A * C
  // A tangent line grazes within the tolerance: one root.
  const nearest = Math.abs(V.cross(d, f)) / Math.sqrt(A)
  if (disc < 0 && Math.abs(nearest - arc.radius) <= MODEL_TOLERANCE) disc = 0
  if (disc < 0) return endTouches(line, arc)
  const root = Math.sqrt(disc)
  const out: CurveMeeting[] = []
  for (const s of disc === 0
    ? [-B / (2 * A)]
    : [(-B - root) / (2 * A), (-B + root) / (2 * A)]) {
    if (!within(s)) continue
    const p = curvePoint(line, clamp01(s))
    const t = sweptFraction(
      arc.startAngle,
      arc.sweep,
      Math.atan2(p.y - arc.center.y, p.x - arc.center.x)
    )
    if (t !== null) out.push({ s: clamp01(s), t })
  }
  return [...out, ...endTouches(line, arc)]
}

function arcArc(a: Arc, b: Arc): CurveMeeting[] {
  const d = V.distance(a.center, b.center)
  const out: CurveMeeting[] = []
  if (d > MODEL_TOLERANCE) {
    const r0 = a.radius
    const r1 = b.radius
    let h2 = 0
    const x = (d * d + r0 * r0 - r1 * r1) / (2 * d)
    h2 = r0 * r0 - x * x
    const touching =
      Math.abs(d - (r0 + r1)) <= MODEL_TOLERANCE ||
      Math.abs(d - Math.abs(r0 - r1)) <= MODEL_TOLERANCE
    if (h2 >= 0 || touching) {
      const h = h2 > 0 && !touching ? Math.sqrt(h2) : 0
      const u = V.scale(V.sub(b.center, a.center), 1 / d)
      const base = V.add(a.center, V.scale(u, x))
      const across = V.perpendicular(u)
      for (const p of h === 0
        ? [base]
        : [V.add(base, V.scale(across, h)), V.sub(base, V.scale(across, h))]) {
        const s = sweptFraction(
          a.startAngle,
          a.sweep,
          Math.atan2(p.y - a.center.y, p.x - a.center.x)
        )
        const t = sweptFraction(
          b.startAngle,
          b.sweep,
          Math.atan2(p.y - b.center.y, p.x - b.center.x)
        )
        if (s !== null && t !== null) out.push({ s, t })
      }
    }
  }
  return [...out, ...endTouches(a, b)]
}

/** Chords per whole turn of an ellipse, and per control point of a spline, to seed Newton. */
const SEED_CHORDS = 96

function seedPolyline(c: PlanarCurve): { s: number[]; points: Vec2[] } {
  const n =
    c.kind === "line"
      ? 1
      : c.kind === "spline"
        ? Math.max(8, SEED_CHORDS * bsplineBreakpoints(c.curve).length)
        : Math.max(8, Math.ceil((SEED_CHORDS * Math.abs(c.sweep)) / FULL_TURN))
  const s = Array.from({ length: n + 1 }, (_, i) => i / n)
  return { s, points: s.map((t) => curvePoint(c, t)) }
}

function numericMeetings(a: PlanarCurve, b: PlanarCurve): CurveMeeting[] {
  const pa = seedPolyline(a)
  const pb = seedPolyline(b)
  const out: CurveMeeting[] = []
  for (let i = 0; i + 1 < pa.points.length; i++) {
    const a0 = pa.points[i]
    const r = V.sub(pa.points[i + 1], a0)
    for (let j = 0; j + 1 < pb.points.length; j++) {
      const b0 = pb.points[j]
      const q = V.sub(pb.points[j + 1], b0)
      const denom = V.cross(r, q)
      if (denom === 0) continue
      const w = V.sub(b0, a0)
      const u = V.cross(w, q) / denom
      const v = V.cross(w, r) / denom
      // A crossing near a chord's end may fall in the next one: widen a little.
      if (u < -0.25 || u > 1.25 || v < -0.25 || v > 1.25) continue
      const s0 = pa.s[i] + (pa.s[i + 1] - pa.s[i]) * u
      const t0 = pb.s[j] + (pb.s[j + 1] - pb.s[j]) * v
      const hit = newtonMeeting(a, b, clamp01(s0), clamp01(t0))
      if (hit) out.push(hit)
    }
  }
  return [...out, ...endTouches(a, b)]
}

function newtonMeeting(
  a: PlanarCurve,
  b: PlanarCurve,
  s0: number,
  t0: number
): CurveMeeting | null {
  let s = s0
  let t = t0
  for (let k = 0; k < 30; k++) {
    const f = V.sub(curvePoint(a, s), curvePoint(b, t))
    if (V.length(f) < 1e-12) break
    const da = curveDerivative(a, s)
    const db = curveDerivative(b, t)
    // Solve da·Δs − db·Δt = −f.
    const det = -da.x * db.y + da.y * db.x
    if (Math.abs(det) < 1e-300) return null
    const ds = (-f.x * -db.y - -db.x * -f.y) / det
    const dt = (da.x * -f.y - da.y * -f.x) / det
    s = clamp01(s + ds)
    t = clamp01(t + dt)
  }
  const gap = V.distance(curvePoint(a, s), curvePoint(b, t))
  return gap <= MODEL_TOLERANCE ? { s, t } : null
}

/**
 * The stretches two curves on one support share: collinear lines, arcs of one
 * circle, elliptical arcs of one ellipse, pieces of one spline. Null when the
 * supports differ or share no stretch, which leaves only isolated meetings.
 */
function sharedStretches(
  a: PlanarCurve,
  b: PlanarCurve
): CurveOverlap[] | null {
  if (!sameSupport(a, b)) return null
  // Each end of either, placed along the other: the shared stretch runs between them.
  const ends: CurveMeeting[] = []
  for (const s of [0, 1]) {
    const hit = curveClosest(b, curvePoint(a, s))
    if (hit.distance <= MODEL_TOLERANCE) ends.push({ s, t: hit.s })
  }
  for (const t of [0, 1]) {
    const hit = curveClosest(a, curvePoint(b, t))
    if (hit.distance <= MODEL_TOLERANCE) ends.push({ s: hit.s, t })
  }
  const sorted = distinctMeetings(ends)
  const out: CurveOverlap[] = []
  for (let i = 0; i + 1 < sorted.length; i++) {
    const p = sorted[i]
    const q = sorted[i + 1]
    if (q.s - p.s < 1e-9) continue
    const mid = curvePoint(a, (p.s + q.s) / 2)
    if (curveClosest(b, mid).distance > MODEL_TOLERANCE) continue
    out.push({ s0: p.s, s1: q.s, t0: p.t, t1: q.t })
  }
  // Only touching where one ends: the meetings find that.
  return out.length > 0 ? out : null
}

function sameSupport(a: PlanarCurve, b: PlanarCurve): boolean {
  if (a.kind !== b.kind) return false
  const near = (p: Vec2, q: Vec2) => V.distance(p, q) <= MODEL_TOLERANCE
  switch (a.kind) {
    case "line": {
      const l = b as Line
      const d = V.sub(a.end, a.start)
      const length = V.length(d)
      if (length === 0) return false
      const off = (p: Vec2) => Math.abs(V.cross(d, V.sub(p, a.start))) / length
      return off(l.start) <= MODEL_TOLERANCE && off(l.end) <= MODEL_TOLERANCE
    }
    case "arc": {
      const o = b as Arc
      return (
        near(a.center, o.center) &&
        Math.abs(a.radius - o.radius) <= MODEL_TOLERANCE
      )
    }
    case "ellipse": {
      const o = b as Extract<PlanarCurve, { kind: "ellipse" }>
      if (!near(a.center, o.center)) return false
      const sameAxis =
        near(a.majorAxis, o.majorAxis) ||
        near(a.majorAxis, V.scale(o.majorAxis, -1))
      return (
        sameAxis &&
        Math.abs(a.ratio - o.ratio) * V.length(a.majorAxis) <= MODEL_TOLERANCE
      )
    }
    case "spline": {
      const o = b as Extract<PlanarCurve, { kind: "spline" }>
      return a.curve === o.curve
    }
  }
}

/**
 * Where a ray from `origin` along `direction` crosses the curve: the `s` of
 * each crossing. `null` when it passes through one of the curve's ends or
 * grazes it, where counting crossings would be ambiguous: cast another.
 */
export function rayCrossings(
  c: PlanarCurve,
  origin: Vec2,
  direction: Vec2
): number[] | null {
  const across = (p: Vec2) => V.cross(direction, V.sub(p, origin))
  const ahead = (p: Vec2) => V.dot(direction, V.sub(p, origin)) > 0
  let roots: number[]
  switch (c.kind) {
    case "line": {
      const fa = across(c.start)
      const fb = across(c.end)
      if (Math.abs(fa) <= MODEL_TOLERANCE || Math.abs(fb) <= MODEL_TOLERANCE) {
        if (ahead(c.start) || ahead(c.end)) return null
        return []
      }
      roots = fa * fb < 0 ? [fa / (fa - fb)] : []
      break
    }
    case "arc":
    case "ellipse": {
      // In the frame where the conic is the unit circle, the ray is a line.
      const m = c.kind === "arc" ? { x: c.radius, y: 0 } : c.majorAxis
      const n = c.kind === "arc" ? { x: 0, y: c.radius } : minorAxis(c)
      const det = V.cross(m, n)
      const local = (v: Vec2) => ({
        x: V.cross(v, n) / det,
        y: V.cross(m, v) / det,
      })
      const o = local(V.sub(origin, c.center))
      const d = local(direction)
      const A = V.dot(d, d)
      const B = 2 * V.dot(o, d)
      const C = V.dot(o, o) - 1
      const disc = B * B - 4 * A * C
      if (disc < 0) return []
      const root = Math.sqrt(disc)
      if (root < 1e-9 * A) return null
      roots = []
      const start = c.kind === "arc" ? c.startAngle : c.startParam
      for (const k of [(-B - root) / (2 * A), (-B + root) / (2 * A)]) {
        const p = { x: o.x + d.x * k, y: o.y + d.y * k }
        const s = sweptFraction(start, c.sweep, Math.atan2(p.y, p.x))
        if (s !== null) roots.push(s)
      }
      break
    }
    case "spline": {
      const samples = Math.max(16, 32 * c.curve.controlPoints.length)
      roots = signChanges((s) => across(curvePoint(c, s)), 0, 1, samples)
      break
    }
  }
  const out: number[] = []
  for (const s of roots) {
    const p = curvePoint(c, s)
    if (!ahead(p)) continue
    if (s < 1e-9 || s > 1 - 1e-9) return null
    const tangent = curveTangent(c, s)
    if (Math.abs(V.cross(direction, tangent)) < 1e-9) return null
    out.push(s)
  }
  return out
}

/**
 * The curve carried through any affine `map`, for a block reference scaled
 * apart in X and Y: a line, an ellipse and a spline stay what they are, an arc
 * becomes an elliptical arc. The image of `c + U cos t + W sin t` is an
 * ellipse given by two conjugate semi-diameters; its axes lie where they are
 * perpendicular, at `tan 2t₀ = 2 U·W / (|U|² − |W|²)`.
 */
export function curveAffine(
  c: PlanarCurve,
  map: PlanarSimilarity
): PlanarCurve {
  if (c.kind === "line" || c.kind === "spline") return curveMapped(c, map)
  const u0 = c.kind === "arc" ? { x: c.radius, y: 0 } : c.majorAxis
  const w0 = c.kind === "arc" ? { x: 0, y: c.radius } : minorAxis(c)
  const start = c.kind === "arc" ? c.startAngle : c.startParam
  const u = similarityVector(map, u0)
  const w = similarityVector(map, w0)
  let t0 = Math.atan2(2 * V.dot(u, w), V.dot(u, u) - V.dot(w, w)) / 2
  let major = V.add(V.scale(u, Math.cos(t0)), V.scale(w, Math.sin(t0)))
  let minor = V.add(V.scale(u, -Math.sin(t0)), V.scale(w, Math.cos(t0)))
  if (V.length(minor) > V.length(major)) {
    t0 += Math.PI / 2
    ;[major, minor] = [minor, V.scale(major, -1)]
  }
  // A map that turns the frame over runs the parameter the other way.
  const way = V.cross(major, minor) >= 0 ? 1 : -1
  return {
    kind: "ellipse",
    center: similarityPoint(map, c.center),
    majorAxis: major,
    ratio: V.length(minor) / V.length(major),
    startParam: way * (start - t0),
    sweep: way * c.sweep,
  }
}
