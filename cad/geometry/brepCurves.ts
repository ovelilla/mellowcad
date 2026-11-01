import {
  Vec3,
  add3,
  cross3,
  dot3,
  length3,
  normalize3,
  scale3,
  sub3,
} from "./Vec3"
import {
  BSplineCurve,
  bsplineDifferentials,
  bsplineDomain,
  bsplinePoint,
} from "./nurbs"
import type { Brep, BrepEdge } from "./solids"

/**
 * An edge of a B-rep as a curve in space, run from its start vertex to its
 * end: a segment on `[0, 1]`, a circle or an ellipse by its own angle (from
 * the start's, counter-clockwise about its normal, a whole turn when it
 * starts and ends at one vertex), a spline on its domain, a point on `[0, 0]`.
 */
export interface EdgeTrace {
  readonly t0: number
  readonly t1: number
  /** Whether `t` is an angle: a circle's or an ellipse's. */
  readonly angular: boolean
  point(t: number): Vec3
  derivative(t: number): Vec3
}

const differentials = new WeakMap<
  BSplineCurve,
  ReturnType<typeof bsplineDifferentials>
>()

/** A spline's first derivative, its differentials made once per curve. */
export function splineFirst(curve: BSplineCurve, t: number): Vec3 {
  let found = differentials.get(curve)
  if (!found) {
    found = bsplineDifferentials(curve)
    differentials.set(curve, found)
  }
  return found.first(t)
}

const TURN = 2 * Math.PI

/** The angle from `from` to `to` counter-clockwise, in `[0, 2π)`. */
export function ccwSweep(from: number, to: number): number {
  return (((to - from) % TURN) + TURN) % TURN
}

export function edgeTrace(brep: Brep, edge: BrepEdge): EdgeTrace {
  return curveTrace(brep.vertices[edge.start], brep.vertices[edge.end], edge)
}

/** The edge's curve run from `a` to `b`, which its start and end vertices are. */
export function curveTrace(
  a: Vec3,
  b: Vec3,
  edge: Pick<BrepEdge, "start" | "end" | "curve">
): EdgeTrace {
  const c = edge.curve
  const closed = edge.start === edge.end
  switch (c.kind) {
    case "line": {
      const d = sub3(b, a)
      return {
        t0: 0,
        t1: 1,
        angular: false,
        point: (t) => add3(a, scale3(d, t)),
        derivative: () => d,
      }
    }
    case "point":
      return {
        t0: 0,
        t1: 0,
        angular: false,
        point: () => a,
        derivative: () => ({ x: 0, y: 0, z: 0 }),
      }
    case "spline": {
      const { start, end } = bsplineDomain(c.curve)
      return {
        t0: start,
        t1: end,
        angular: false,
        point: (t) => bsplinePoint(c.curve, t),
        derivative: (t) => splineFirst(c.curve, t),
      }
    }
    case "circle":
    case "ellipse": {
      const major =
        c.kind === "circle"
          ? scale3(
              normalize3(
                sub3(
                  sub3(a, c.center),
                  scale3(c.normal, dot3(sub3(a, c.center), c.normal))
                )
              ) ?? { x: 1, y: 0, z: 0 },
              c.radius
            )
          : c.majorAxis
      const minor = scale3(
        cross3(c.normal, major),
        c.kind === "circle" ? 1 : c.ratio
      )
      const param = (p: Vec3) => {
        const d = sub3(p, c.center)
        return Math.atan2(
          dot3(d, minor) / dot3(minor, minor),
          dot3(d, major) / dot3(major, major)
        )
      }
      const t0 = c.kind === "circle" ? 0 : param(a)
      const sweep = closed ? TURN : ccwSweep(t0, param(b))
      return {
        t0,
        t1: t0 + sweep,
        angular: true,
        point: (t) =>
          add3(
            c.center,
            add3(scale3(major, Math.cos(t)), scale3(minor, Math.sin(t)))
          ),
        derivative: (t) =>
          add3(scale3(major, -Math.sin(t)), scale3(minor, Math.cos(t))),
      }
    }
  }
}

/** Samples a curve is searched by for its nearest point to another, or to a point. */
const NEAREST_SAMPLES = 64

/** Golden sections that close in on a nearest point. */
const NEAREST_STEPS = 80

const GOLDEN = (1 + Math.sqrt(5)) / 2

/**
 * The parameter of the trace's point nearest `p` between `from` and `to`,
 * and how far it is: a segment's exactly, any other's from its nearest of a
 * few samples closed in by golden sections.
 */
export function traceNearest(
  trace: EdgeTrace,
  p: Vec3,
  from = trace.t0,
  to = trace.t1
): { t: number; distance: number } {
  const lo = Math.min(from, to)
  const hi = Math.max(from, to)
  if (hi === lo) {
    return { t: lo, distance: length3(sub3(trace.point(lo), p)) }
  }
  const gap = (t: number) => length3(sub3(trace.point(t), p))
  if (!trace.angular && trace.t0 === 0 && trace.t1 === 1) {
    const d = trace.derivative(0)
    const dd = dot3(d, d)
    if (dd > 0 && length3(sub3(trace.derivative(1), d)) === 0) {
      const a = trace.point(0)
      const t = Math.min(hi, Math.max(lo, dot3(sub3(p, a), d) / dd))
      return { t, distance: gap(t) }
    }
  }
  const gaps: number[] = []
  for (let i = 0; i <= NEAREST_SAMPLES; i++) {
    gaps.push(gap(lo + ((hi - lo) * i) / NEAREST_SAMPLES))
  }
  let best = 0
  for (let i = 1; i <= NEAREST_SAMPLES; i++) if (gaps[i] < gaps[best]) best = i
  const step = (hi - lo) / NEAREST_SAMPLES
  // Round a whole turn the nearest may lie across its start; along a closed
  // spline, at its other end.
  const whole = trace.angular && hi - lo >= TURN - 1e-12
  const closed =
    !whole &&
    length3(sub3(trace.point(lo), trace.point(hi))) <=
      1e-9 * Math.max(1, length3(trace.point(lo)))
  const starts = [lo + step * best]
  if (closed && best === 0) starts.push(hi)
  if (closed && best === NEAREST_SAMPLES) starts.push(lo)
  let found = { t: starts[0], distance: Infinity }
  for (const at of starts) {
    let a = whole ? at - step : Math.max(lo, at - step)
    let b = whole ? at + step : Math.min(hi, at + step)
    for (let i = 0; i < NEAREST_STEPS; i++) {
      const m1 = b - (b - a) / GOLDEN
      const m2 = a + (b - a) / GOLDEN
      if (gap(m1) < gap(m2)) b = m2
      else a = m1
    }
    let t = (a + b) / 2
    if (whole) t = lo + ((((t - lo) % TURN) + TURN) % TURN)
    const distance = gap(t)
    if (distance < found.distance) found = { t, distance }
  }
  return found
}

/**
 * Where two traces meet within `tolerance`: the parameters on the first, a
 * crossing's and each end of the second that lies on it (where two run along
 * each other). Each pair of nearby samples is closed in by Gauss–Newton on
 * the gap between them.
 */
export function traceMeetings(
  a: EdgeTrace,
  b: EdgeTrace,
  tolerance: number
): number[] {
  const out: number[] = []
  const push = (t: number) => {
    if (!out.some((x) => Math.abs(x - t) <= 1e-9 * Math.max(1, Math.abs(t)))) {
      out.push(t)
    }
  }
  for (const t of [b.t0, b.t1]) {
    const hit = traceNearest(a, b.point(t))
    if (hit.distance <= tolerance) push(hit.t)
  }
  const n = NEAREST_SAMPLES
  const sa = Array.from(
    { length: n + 1 },
    (_, i) => a.t0 + ((a.t1 - a.t0) * i) / n
  )
  const sb = Array.from(
    { length: n + 1 },
    (_, i) => b.t0 + ((b.t1 - b.t0) * i) / n
  )
  const pa = sa.map((t) => a.point(t))
  const pb = sb.map((t) => b.point(t))
  const reach =
    Math.max(
      ...pa.slice(1).map((p, i) => length3(sub3(p, pa[i]))),
      ...pb.slice(1).map((p, i) => length3(sub3(p, pb[i])))
    ) + tolerance
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      if (length3(sub3(pa[i], pb[j])) > 2 * reach) continue
      let s = (sa[i] + sa[i + 1]) / 2
      let t = (sb[j] + sb[j + 1]) / 2
      for (let step = 0; step < 30; step++) {
        const r = sub3(a.point(s), b.point(t))
        const da = a.derivative(s)
        const db = scale3(b.derivative(t), -1)
        const aa = dot3(da, da)
        const ab = dot3(da, db)
        const bb = dot3(db, db)
        const det = aa * bb - ab * ab
        if (!(Math.abs(det) > 1e-300)) break
        const ra = dot3(r, da)
        const rb = dot3(r, db)
        const ds = (ra * bb - rb * ab) / det
        const dt = (aa * rb - ab * ra) / det
        s -= ds
        t -= dt
        if (Math.abs(ds) + Math.abs(dt) < 1e-15) break
      }
      const inA =
        s >= Math.min(a.t0, a.t1) - 1e-12 && s <= Math.max(a.t0, a.t1) + 1e-12
      const inB =
        t >= Math.min(b.t0, b.t1) - 1e-12 && t <= Math.max(b.t0, b.t1) + 1e-12
      if (inA && inB && length3(sub3(a.point(s), b.point(t))) <= tolerance) {
        // Running along each other, they meet nowhere but at the ends.
        const ahead = (a.t1 - a.t0) * 0.01
        const along = [s - ahead, s + ahead].some(
          (x) =>
            x >= Math.min(a.t0, a.t1) &&
            x <= Math.max(a.t0, a.t1) &&
            traceNearest(b, a.point(x)).distance <= tolerance
        )
        if (!along) push(s)
      }
    }
  }
  return out
}
