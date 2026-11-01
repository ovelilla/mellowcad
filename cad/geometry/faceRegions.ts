import { Vec3, cross3, dot3, length3, scale3, sub3 } from "./Vec3"
import { BSplineCurve, bsplineBreakpoints, bsplineDomain } from "./nurbs"
import { Rule, gaussRule } from "./quadrature"
import { EdgeTrace, edgeTrace } from "./brepCurves"
import { relaxedOnBoth } from "./surfaces"
import {
  Curved,
  FaceSample,
  Param,
  parameters,
  ruleOf,
  surfaceFrame,
  surfacePoint,
  sweptCurveDerivative,
  sweptCurvePoint,
} from "./faceDomains"
import type { Brep, BrepFace, FaceDomain, SweptCurve } from "./solids"

/**
 * A curved face as a region of its surface's parameters `(u, v)`
 * (`surfaceFrame`): each of its edges mapped there, and what closes the
 * region where its loops do not — a pole the face reaches, or, round a
 * surface closed both ways (a doughnut), the part of a cut across it that
 * lies inside. What Green's theorem integrates over and what a point is
 * found inside of.
 */

const TURN = 2 * Math.PI

export interface UV {
  readonly u: number
  readonly v: number
}

/** The period of each parameter, null for one that does not close. */
export interface Periods {
  readonly u: number | null
  readonly v: number | null
}

/** Whether a swept profile closes on itself, and its period then. */
function profilePeriod(c: SweptCurve): number | null {
  if (c.kind === "ellipse") return TURN
  const { start, end } = bsplineDomain(c.curve)
  const a = sweptCurvePoint(c, start)
  const b = sweptCurvePoint(c, end)
  const size = c.curve.controlPoints.reduce(
    (m, p) => Math.max(m, Math.abs(p.x), Math.abs(p.y), Math.abs(p.z)),
    1
  )
  return length3(sub3(a, b)) <= 1e-9 * size ? end - start : null
}

export function surfacePeriods(s: Curved): Periods {
  switch (s.kind) {
    case "cylinder":
    case "cone":
    case "sphere":
      return { u: TURN, v: null }
    case "torus":
      return { u: TURN, v: s.majorRadius > s.minorRadius ? TURN : null }
    case "revolution":
      return { u: TURN, v: profilePeriod(s.profile) }
    case "extrusion":
      return { u: profilePeriod(s.profile), v: null }
  }
}

/** `x` brought within half a period of `near`. */
function nearest(x: number, near: number, period: number | null): number {
  if (period === null) return x
  return x - period * Math.round((x - near) / period)
}

/** Iterations that close in on a profile's nearest point: Gauss–Newton from a near seed converges in a few. */
const PROJECTION_STEPS = 40

/** Samples of a profile searched for the seed nearest a point. */
const PROJECTION_SEEDS = 64

/**
 * The parameter of a profile's point nearest `q` under the linear map `m`
 * (`m(x) − m(0)` is linear): an ellipse's exactly, from its axes; a
 * spline's by Gauss–Newton from `near`, or the nearest of a few samples.
 */
function closestOnProfile(
  c: SweptCurve,
  m: (x: Vec3) => Vec3,
  q: Vec3,
  near: number | null,
  period: number | null
): number {
  const o = m({ x: 0, y: 0, z: 0 })
  const lin = (x: Vec3) => sub3(m(x), o)
  if (c.kind === "ellipse") {
    const a = lin(c.majorAxis)
    const b = lin(c.minorAxis)
    const r = sub3(q, m(c.center))
    const aa = dot3(a, a)
    const ab = dot3(a, b)
    const bb = dot3(b, b)
    const ar = dot3(a, r)
    const br = dot3(b, r)
    const det = aa * bb - ab * ab
    const x = (ar * bb - br * ab) / det
    const y = (aa * br - ab * ar) / det
    return Math.atan2(y, x)
  }
  const { start, end } = bsplineDomain(c.curve)
  const at = (t: number) => m(sweptCurvePoint(c, t))
  let t = near
  if (t === null) {
    let best = Infinity
    for (let k = 0; k <= PROJECTION_SEEDS; k++) {
      const s = start + ((end - start) * k) / PROJECTION_SEEDS
      const d = length3(sub3(at(s), q))
      if (d < best) {
        best = d
        t = s
      }
    }
  }
  let u = t ?? start
  for (let step = 0; step < PROJECTION_STEPS; step++) {
    const inside = period === null ? Math.min(end, Math.max(start, u)) : u
    const wrapped =
      period === null
        ? inside
        : start + ((((inside - start) % period) + period) % period)
    const r = sub3(at(wrapped), q)
    const d = lin(sweptCurveDerivative(c, wrapped))
    const dd = dot3(d, d)
    if (!(dd > 0)) break
    const delta = dot3(r, d) / dd
    u = inside - delta
    if (Math.abs(delta) <= 1e-15 * Math.max(1, Math.abs(end - start))) break
  }
  return period === null ? Math.min(end, Math.max(start, u)) : u
}

/** A revolution's profile lies in one half-plane off its axis: the way out to it. */
const outward = new WeakMap<Curved, Vec3>()

function revolutionOut(s: Extract<Curved, { kind: "revolution" }>): Vec3 {
  const found = outward.get(s)
  if (found) return found
  let best: Vec3 = { x: 0, y: 0, z: 0 }
  const c = s.profile
  const [lo, hi] =
    c.kind === "ellipse"
      ? [0, TURN]
      : [bsplineDomain(c.curve).start, bsplineDomain(c.curve).end]
  for (let k = 0; k <= 16; k++) {
    const q = sub3(sweptCurvePoint(c, lo + ((hi - lo) * k) / 16), s.origin)
    const w = sub3(q, scale3(s.axis, dot3(q, s.axis)))
    if (length3(w) > length3(best)) best = w
  }
  const out = scale3(best, 1 / length3(best))
  outward.set(s, out)
  return out
}

/**
 * The parameters of a point on the surface (or its nearest there), the
 * angle within half a turn of `near`'s when given: round the axis from the
 * surface's X, along or over it as `surfaceFrame` runs.
 */
export function surfaceParams(s: Curved, p: Vec3, near?: UV): UV {
  const periods = surfacePeriods(s)
  let u: number
  let v: number
  switch (s.kind) {
    case "cylinder":
    case "cone": {
      const d = sub3(p, s.kind === "cylinder" ? s.origin : s.apex)
      const y = cross3(s.axis, s.xAxis)
      v = dot3(d, s.axis)
      u = Math.atan2(dot3(d, y) / s.ratio, dot3(d, s.xAxis))
      break
    }
    case "sphere":
    case "torus": {
      const d = sub3(p, s.center)
      const y = cross3(s.axis, s.xAxis)
      const x = dot3(d, s.xAxis)
      const yy = dot3(d, y)
      u = Math.atan2(yy, x)
      const R = s.kind === "sphere" ? 0 : s.majorRadius
      v = Math.atan2(dot3(d, s.axis), Math.hypot(x, yy) - R)
      break
    }
    case "revolution": {
      const e = revolutionOut(s)
      const turn = cross3(s.axis, e)
      const d = sub3(p, s.origin)
      const h = dot3(d, s.axis)
      const w = sub3(d, scale3(s.axis, h))
      u = Math.atan2(dot3(w, turn), dot3(w, e))
      const meridian = (x: Vec3): Vec3 => {
        const q = sub3(x, s.origin)
        return { x: dot3(q, e), y: dot3(q, s.axis), z: 0 }
      }
      v = closestOnProfile(
        s.profile,
        meridian,
        { x: length3(w), y: h, z: 0 },
        near?.v ?? null,
        periods.v
      )
      break
    }
    case "extrusion": {
      const flat = (x: Vec3) =>
        sub3(x, scale3(s.direction, dot3(x, s.direction)))
      u = closestOnProfile(s.profile, flat, flat(p), near?.u ?? null, periods.u)
      v = dot3(sub3(p, sweptCurvePoint(s.profile, u)), s.direction)
      break
    }
  }
  if (near) {
    u = nearest(u, near.u, periods.u)
    v = nearest(v, near.v, periods.v)
  }
  return { u, v }
}

/** A stretch of a coedge mapped to the face's parameters, run its face's way. */
export interface EdgeRun {
  readonly kind: "edge"
  readonly edge: number
  readonly trace: EdgeTrace
  /** The edge's parameter where the stretch starts and ends. */
  readonly from: number
  readonly to: number
  /** Samples along it, the angles unwrapped as it runs. */
  readonly samples: readonly (UV & { readonly t: number })[]
  /** Along which parameter it holds still: a ruling, a parallel. */
  readonly iso: "u" | "v" | null
}

/**
 * Where a loop runs through a pole in 3D, it runs along the pole's line in
 * `(u, v)`, from the meridian it came up by to the one it leaves by.
 */
export interface PoleRun {
  readonly kind: "pole"
  readonly v: number
  readonly from: number
  readonly to: number
}

export type Run = EdgeRun | PoleRun

export interface MappedLoop {
  readonly runs: readonly Run[]
  /** How often it turns round each closed parameter, in whole periods. */
  readonly winding: UV
}

export interface FaceRegion {
  readonly surface: Curved
  readonly domain: FaceDomain
  /** +1 when the face's outside is `∂u × ∂v`, −1 when it faces the other way. */
  readonly sense: 1 | -1
  readonly periods: Periods
  readonly loops: readonly MappedLoop[]
  /** Where each `v` is integrated from: a pole when the face has one. */
  readonly vRef: number
  /** The pole at the far end of `v` the face reaches, which no loop bounds. */
  readonly top: number | null
  /**
   * A face round a surface closed both ways: the cut `v = cut` the region is
   * unrolled at, and the runs of `u` along it inside the face.
   */
  readonly cut: {
    readonly v: number
    readonly runs: readonly (readonly [number, number])[]
  } | null
}

/**
 * Where a face without a domain lies (a primitive's, solid/c01, h01, r05):
 * a whole turn round its axis, between its loops' heights along it, over a
 * sphere from pole to pole, round a doughnut's tube, or over an apple's or a
 * lemon's arc of it.
 */
export function primitiveDomain(brep: Brep, face: BrepFace): FaceDomain | null {
  const s = face.surface
  switch (s.kind) {
    case "cylinder":
    case "cone": {
      const vs = face.loops.map(
        (loop) =>
          surfaceParams(s, brep.vertices[brep.edges[loop[0].edge].start]).v
      )
      if (vs.length === 0) return null
      // A cone's rulings start opposite its X (solid/d04), a cylinder's at its seam.
      const u0 = s.kind === "cone" ? Math.PI : 0
      return { u: [u0, u0 + TURN], v: [Math.min(...vs), Math.max(...vs)] }
    }
    case "sphere":
      // Its meridians, and a torus' tube circles, start opposite its X (d06).
      return { u: [Math.PI, 3 * Math.PI], v: [-Math.PI / 2, Math.PI / 2] }
    case "torus": {
      const R = s.majorRadius
      const r = s.minorRadius
      if (R > r) return { u: [Math.PI, 3 * Math.PI], v: [-Math.PI, Math.PI] }
      const half = Math.acos(Math.max(-1, Math.min(1, -R / r)))
      return { u: [Math.PI, 3 * Math.PI], v: [-half, half] }
    }
    default:
      return null
  }
}

/** Samples of a stretch mapped: enough that no step between two turns half a period. */
function sampleCount(trace: EdgeTrace, from: number, to: number): number {
  if (trace.angular) {
    return Math.max(8, Math.ceil(Math.abs(to - from) / (TURN / 64)))
  }
  return 16
}

/** Whether the surface pinches to a point along `u` at `v`: a pole, an apex. */
function pinched(s: Curved, v: number, u: number): boolean {
  const { du, dv } = surfaceFrame(s, u, v)
  return length3(du) <= 1e-9 * Math.max(length3(dv), 1e-300)
}

/** The face's poles: the ends of its `v` where the surface pinches, round a closed `u`. */
function facePoles(s: Curved, domain: FaceDomain, periods: Periods): number[] {
  if (periods.u === null || periods.v !== null) return []
  const lo = Math.min(domain.v[0], domain.v[1])
  const hi = Math.max(domain.v[0], domain.v[1])
  return [lo, hi].filter((v) => pinched(s, v, domain.u[0]))
}

/** Golden sections that pin where an edge passes nearest a pole. */
const POLE_STEPS = 80

/** Where along `[from, to]` the edge passes through one of the points, its ends left out. */
function passages(
  trace: EdgeTrace,
  from: number,
  to: number,
  points: readonly Vec3[],
  tolerance: number
): number[] {
  if (points.length === 0) return []
  const n = sampleCount(trace, from, to)
  const ts = Array.from(
    { length: n + 1 },
    (_, i) => from + ((to - from) * i) / n
  )
  const out: number[] = []
  for (const q of points) {
    const d = ts.map((t) => length3(sub3(trace.point(t), q)))
    for (let i = 1; i < n; i++) {
      if (d[i] > d[i - 1] || d[i] > d[i + 1]) continue
      let a = ts[i - 1]
      let b = ts[i + 1]
      for (let step = 0; step < POLE_STEPS; step++) {
        const m1 = b - (b - a) / GOLDEN
        const m2 = a + (b - a) / GOLDEN
        if (
          length3(sub3(trace.point(m1), q)) < length3(sub3(trace.point(m2), q))
        )
          b = m2
        else a = m1
      }
      const t = (a + b) / 2
      if (length3(sub3(trace.point(t), q)) <= tolerance) out.push(t)
    }
  }
  return out.sort((x, y) => (to > from ? x - y : y - x))
}

const GOLDEN = (1 + Math.sqrt(5)) / 2

/** A stretch of an edge sampled in the face's parameters, a pole's angle taken from its neighbour. */
function mapStretch(
  s: Curved,
  edge: number,
  trace: EdgeTrace,
  from: number,
  to: number
): EdgeRun & { readonly ends: readonly [boolean, boolean] } {
  const n = sampleCount(trace, from, to)
  const samples: { t: number; u: number; v: number }[] = []
  const pole: boolean[] = []
  let prev: UV | undefined
  for (let i = 0; i <= n; i++) {
    const t = from + ((to - from) * i) / n
    const uv = surfaceParams(s, trace.point(t), prev)
    samples.push({ t, ...uv })
    pole.push(pinched(s, uv.v, uv.u))
    if (!pole[i]) prev = uv
    else if (prev) prev = { u: prev.u, v: uv.v }
  }
  const firstSound = pole.findIndex((x) => !x)
  for (let i = 0; i < firstSound; i++) samples[i].u = samples[firstSound].u
  for (let i = 1; i < samples.length; i++) {
    if (pole[i]) samples[i].u = samples[i - 1].u
  }
  const spread = (k: "u" | "v", size: number) =>
    samples.every((x) => Math.abs(x[k] - samples[0][k]) <= 1e-9 * size)
  const vSize =
    s.kind === "cylinder" || s.kind === "cone"
      ? Math.max(1, ...samples.map((x) => Math.abs(x.v)))
      : 1
  let iso: "u" | "v" | null = null
  if (spread("v", vSize)) iso = "v"
  else if (spread("u", 1)) iso = "u"
  return {
    kind: "edge",
    edge,
    trace,
    from,
    to,
    samples,
    iso,
    ends: [pole[0], pole[n]],
  }
}

function shifted(run: EdgeRun, du: number, dv: number): EdgeRun {
  if (du === 0 && dv === 0) return run
  return {
    ...run,
    samples: run.samples.map((x) => ({ t: x.t, u: x.u + du, v: x.v + dv })),
  }
}

/**
 * The loops mapped, each stretch carried on from the last's end: through a
 * pole along its line, round the way that keeps the face on the loop's left
 * (at the top of `v` towards −u, at the bottom towards +u, as the region
 * runs), else to the nearest of the angle's turns.
 */
function mapLoops(
  s: Curved,
  brep: Brep,
  face: BrepFace,
  domain: FaceDomain,
  sense: 1 | -1,
  periods: Periods
): MappedLoop[] {
  const poles = facePoles(s, domain, periods)
  const lo = Math.min(domain.v[0], domain.v[1])
  const hi = Math.max(domain.v[0], domain.v[1])
  const polePoints = poles.map((v) => surfacePoint(s, domain.u[0], v))
  const scale = brep.vertices.reduce(
    (m, p) => Math.max(m, Math.abs(p.x), Math.abs(p.y), Math.abs(p.z)),
    1
  )
  return face.loops.map((loop) => {
    const stretches: (EdgeRun & { ends: readonly [boolean, boolean] })[] = []
    for (const c of loop) {
      const e = brep.edges[c.edge]
      if (e.curve.kind === "point") continue
      const trace = edgeTrace(brep, e)
      const from = c.reversed ? trace.t1 : trace.t0
      const to = c.reversed ? trace.t0 : trace.t1
      const cuts = [
        from,
        ...passages(trace, from, to, polePoints, 1e-9 * scale),
        to,
      ]
      for (let i = 1; i < cuts.length; i++) {
        stretches.push(mapStretch(s, c.edge, trace, cuts[i - 1], cuts[i]))
      }
    }
    const runs: Run[] = []
    const P = periods.u
    let end: UV | null = null
    let endPinched = false
    const join = (next: UV): { du: number; pole: PoleRun | null } => {
      if (!end) return { du: 0, pole: null }
      if (endPinched && P !== null) {
        const top = Math.abs(end.v - hi) < Math.abs(end.v - lo)
        const raw = next.u - end.u
        const way = top ? -sense : sense
        const length = (((way * raw) % P) + P) % P
        const step = way * length
        return {
          du: end.u + step - next.u,
          pole:
            length > 1e-12
              ? { kind: "pole", v: end.v, from: end.u, to: end.u + step }
              : null,
        }
      }
      const du = P === null ? 0 : nearest(next.u, end.u, P) - next.u
      return { du, pole: null }
    }
    let first: UV | null = null
    for (const stretch of stretches) {
      const start = stretch.samples[0]
      const { du, pole } = join(start)
      const dv =
        end && periods.v !== null
          ? nearest(start.v, end.v, periods.v) - start.v
          : 0
      if (pole) runs.push(pole)
      const run = shifted(stretch, du, dv)
      runs.push(run)
      first ??= run.samples[0]
      end = run.samples[run.samples.length - 1]
      endPinched = stretch.ends[1]
    }
    if (first && end && endPinched && P !== null) {
      // Closing through a pole: the loop's start, a whole number of turns on.
      const { pole } = join(first)
      if (pole) runs.push(pole)
    }
    let du = 0
    let dvSum = 0
    for (const run of runs) {
      if (run.kind === "pole") {
        du += run.to - run.from
        continue
      }
      const a = run.samples[0]
      const b = run.samples[run.samples.length - 1]
      du += b.u - a.u
      dvSum += b.v - a.v
    }
    const turns = (total: number, period: number | null) =>
      period === null ? 0 : Math.round(total / period)
    return {
      runs,
      winding: { u: turns(du, periods.u), v: turns(dvSum, periods.v) },
    }
  })
}

/** `−∮ (v − from) du` round the loops: the area they bound in the parameters, as they run. */
function loopsArea(
  loops: readonly MappedLoop[],
  from: number,
  reduce: (v: number) => number
): number {
  let sum = 0
  for (const loop of loops) {
    for (const run of loop.runs) {
      if (run.kind === "pole") {
        sum -= (reduce(run.v) - from) * (run.to - run.from)
        continue
      }
      for (let i = 1; i < run.samples.length; i++) {
        const a = run.samples[i - 1]
        const b = run.samples[i]
        sum -= (reduce((a.v + b.v) / 2) - from) * (b.u - a.u)
      }
    }
  }
  return sum
}

/** The area a region's loops alone bound in its parameters, the region's way round. */
export function regionLoopsArea(region: FaceRegion): number {
  const { cut, periods } = region
  const P = periods.v
  const reduce =
    cut && P !== null
      ? (v: number) => cut.v + ((((v - cut.v) % P) + P) % P)
      : (v: number) => v
  return region.sense * loopsArea(region.loops, region.vRef, reduce)
}

const regions = new WeakMap<BrepFace, { brep: Brep; region: FaceRegion }>()

/**
 * The curved face's region in its parameters, null on a plane. A domain run
 * backwards either way turns the face inwards (`sense` −1): its loops, run
 * counter-clockwise about its outside, then run clockwise in `(u, v)`.
 */
export function faceRegion(brep: Brep, face: BrepFace): FaceRegion | null {
  const found = regions.get(face)
  if (found && found.brep === brep) return found.region
  const s = face.surface
  if (s.kind === "plane") return null
  const domain = face.domain ?? primitiveDomain(brep, face)
  if (!domain) return null
  const sense: 1 | -1 =
    Math.sign(domain.u[1] - domain.u[0]) *
      Math.sign(domain.v[1] - domain.v[0]) <
    0
      ? -1
      : 1
  const periods = surfacePeriods(s)
  const loops = mapLoops(s, brep, face, domain, sense, periods)
  const lo = Math.min(domain.v[0], domain.v[1])
  const hi = Math.max(domain.v[0], domain.v[1])
  let region: FaceRegion
  if (periods.v !== null && periods.u !== null) {
    region = cutRegion(s, domain, sense, periods, loops)
  } else {
    const poles = facePoles(s, domain, periods)
    const poleLo = poles.includes(lo)
    const poleHi = poles.includes(hi)
    const vRef = poleLo ? lo : poleHi ? hi : domain.v[0]
    let top: number | null = null
    if (poleLo && poleHi) {
      const winding = sense * loops.reduce((sum, l) => sum + l.winding.u, 0)
      const area = sense * loopsArea(loops, vRef, (v) => v)
      if (winding === 1 || (winding === 0 && area <= 0)) top = hi
    }
    region = { surface: s, domain, sense, periods, loops, vRef, top, cut: null }
  }
  regions.set(face, { brep, region })
  return region
}

/**
 * A face round a surface closed both ways, unrolled at `v = cut`: the cut is
 * put where no vertex and no parallel of the face lies, and the runs of it
 * inside the face found where the loops cross it — entering it where one
 * crosses downwards (the face on an edge's left), leaving where one crosses
 * upwards; crossed nowhere, it lies inside when the loops alone bound no
 * area (a doughnut's face, which no loop bounds).
 */
function cutRegion(
  s: Curved,
  domain: FaceDomain,
  sense: 1 | -1,
  periods: Periods,
  loops: readonly MappedLoop[]
): FaceRegion {
  const P = periods.v as number
  const Pu = periods.u as number
  const marks: number[] = []
  for (const loop of loops) {
    for (const run of loop.runs) {
      if (run.kind === "edge") marks.push(run.samples[0].v)
    }
  }
  const base = Math.min(domain.v[0], domain.v[1])
  let cut = base
  if (marks.length > 0) {
    const sorted = marks
      .map((v) => (((v - base) % P) + P) % P)
      .sort((a, b) => a - b)
    let best = -1
    for (let i = 0; i < sorted.length; i++) {
      const next = i + 1 < sorted.length ? sorted[i + 1] : sorted[0] + P
      if (next - sorted[i] > best) {
        best = next - sorted[i]
        cut = base + (sorted[i] + next) / 2
      }
    }
  }
  const reduce = (v: number) => cut + ((((v - cut) % P) + P) % P)
  const crossings: { u: number; down: boolean }[] = []
  for (const loop of loops) {
    for (const c of loop.runs) {
      if (c.kind === "pole" || c.iso === "v") continue
      for (const x of cutCrossings(s, c, cut, P)) {
        crossings.push({ u: x.u, down: sense * x.dv < 0 })
      }
    }
  }
  const runs: [number, number][] = []
  if (crossings.length === 0) {
    if (sense * loopsArea(loops, cut, reduce) <= 0) {
      runs.push([domain.u[0], domain.u[0] + Pu])
    }
  } else {
    const at = crossings
      .map((x) => ({ ...x, u: ((x.u % Pu) + Pu) % Pu }))
      .sort((a, b) => a.u - b.u)
    at.forEach((x, i) => {
      if (!x.down) return
      const next = at[(i + 1) % at.length]
      const end = next.u > x.u ? next.u : next.u + Pu
      runs.push([x.u, end])
    })
  }
  return {
    surface: s,
    domain,
    sense,
    periods,
    loops,
    vRef: cut,
    top: null,
    cut: { v: cut, runs },
  }
}

/** Bisections that pin where a coedge crosses a line of its face's parameters. */
const CROSSING_STEPS = 60

/** Where a coedge crosses `v ≡ cut`: the edge's parameter, `u` there and which way `v` runs. */
function cutCrossings(
  s: Curved,
  c: EdgeRun,
  cut: number,
  P: number
): { t: number; u: number; dv: number }[] {
  const out: { t: number; u: number; dv: number }[] = []
  const band = (v: number) => Math.floor((v - cut) / P)
  for (let i = 1; i < c.samples.length; i++) {
    const a = c.samples[i - 1]
    const b = c.samples[i]
    if (band(a.v) === band(b.v)) continue
    const level = cut + P * Math.max(band(a.v), band(b.v))
    let lo = a.t
    let hi = b.t
    let near: UV = a
    for (let step = 0; step < CROSSING_STEPS; step++) {
      const m = (lo + hi) / 2
      const uv = surfaceParams(s, c.trace.point(m), near)
      if ((uv.v - level) * (a.v - level) > 0) {
        lo = m
        near = uv
      } else hi = m
    }
    const t = (lo + hi) / 2
    out.push({
      t,
      u: surfaceParams(s, c.trace.point(t), near).u,
      dv: b.v - a.v,
    })
  }
  return out
}

/** A spline's rule on `[a, b]`, either inside its domain or, round a closed one, folded into it. */
function foldedRule(
  param: Param,
  a: number,
  b: number,
  exact: boolean,
  period: number | null
): Rule {
  if (
    typeof param === "string" ||
    param.kind === "ellipse" ||
    period === null
  ) {
    return ruleOf(param, a, b, exact)
  }
  const { start } = bsplineDomain(param.curve)
  if (b < a) {
    return foldedRule(param, b, a, exact, period).map(({ t, w }) => ({
      t,
      w: -w,
    }))
  }
  const out: { t: number; w: number }[] = []
  let x = a
  while (x < b - 1e-15 * period) {
    const k = Math.floor((x - start) / period + 1e-12)
    const top = Math.min(b, start + (k + 1) * period)
    const shift = k * period
    for (const node of ruleOf(param, x - shift, top - shift, exact)) {
      out.push(node)
    }
    x = top
  }
  return out
}

/** Gauss pieces along a coedge's own parameter: what no rule of the surface is exact for. */
function edgePieces(c: EdgeRun): number {
  const span = Math.abs(c.to - c.from)
  if (c.trace.angular) return Math.max(2, Math.ceil(span / (Math.PI / 8)))
  return 8
}

function splineSpans(curve: BSplineCurve, a: number, b: number): number[] {
  const lo = Math.min(a, b)
  const hi = Math.max(a, b)
  const cuts = [
    lo,
    ...bsplineBreakpoints(curve).filter((k) => k > lo && k < hi),
    hi,
  ]
  return a <= b ? cuts : cuts.reverse()
}

/** The unwrapped parameters a coedge's samples give at `t`, between the two nearest. */
function sampledAt(c: EdgeRun, t: number): UV {
  const n = c.samples.length - 1
  if (n === 0) return c.samples[0]
  const f = ((t - c.from) / (c.to - c.from)) * n
  const i = Math.max(0, Math.min(n - 1, Math.floor(f)))
  const a = c.samples[i]
  const b = c.samples[i + 1]
  const k = f - i
  return { u: a.u + (b.u - a.u) * k, v: a.v + (b.v - a.v) * k }
}

/**
 * The face's samples by Green's theorem in its parameters,
 * `∬ g du dv = −∮ H du` with `H(u, v) = ∫ g(u, t) dt` from `vRef` to `v`:
 * round each loop, a parallel (`v` still) along `u` by the surface's own
 * rule, which a face swept between them (a domain's rectangle) integrates as
 * exactly as their product did; a ruling (`u` still) adds nothing; any other
 * edge by Gauss on its own parameter. The pole at the top of a face that
 * reaches it, or the runs of the cut inside a face round a doughnut, close
 * the region. Each sample's `n` is the outward normal times the area there,
 * so a face's flux is `Σ w (p − a)·n` and its area `Σ w |n|` (`exact`
 * false, for a root no rule is exact for).
 */
export function faceSamples(
  brep: Brep,
  face: BrepFace,
  exact: boolean
): FaceSample[] {
  const region = faceRegion(brep, face)
  if (!region) return []
  const { surface: s, sense, periods, vRef, cut } = region
  const [pu, pv] = parameters(s)
  const out: FaceSample[] = []
  const reduce = cut
    ? (v: number) => {
        const P = periods.v as number
        return cut.v + ((((v - cut.v) % P) + P) % P)
      }
    : (v: number) => v
  const column = (u: number, from: number, to: number, weight: number) => {
    for (const { t, w } of foldedRule(pv, from, to, exact, periods.v)) {
      const { p, du, dv } = surfaceFrame(s, u, t)
      out.push({ p, n: scale3(cross3(du, dv), sense), w: weight * w })
    }
  }
  // A loop's node: −H du there, the region's way round when `sense` is −1.
  const node = (u: number, v: number, weight: number) =>
    column(u, vRef, reduce(v), -sense * weight)
  for (const loop of region.loops) {
    for (const c of loop.runs) {
      if (c.kind === "pole") {
        for (const { t, w } of foldedRule(pu, c.from, c.to, exact, periods.u)) {
          node(t, c.v, w)
        }
        continue
      }
      if (c.iso === "u") continue
      if (c.iso === "v") {
        const first = c.samples[0]
        const last = c.samples[c.samples.length - 1]
        for (const { t, w } of foldedRule(
          pu,
          first.u,
          last.u,
          exact,
          periods.u
        )) {
          node(t, first.v, w)
        }
        continue
      }
      const stops = [c.from]
      if (cut) {
        const ts = cutCrossings(s, c, cut.v, periods.v as number).map(
          (x) => x.t
        )
        stops.push(...(c.to > c.from ? ts : ts.reverse()))
      }
      stops.push(c.to)
      const edge = brep.edges[c.edge]
      const curve = edge.curve
      const other =
        curve.kind === "spline" ? meetingSurface(brep, face, c.edge) : null
      const at = (t: number, q: Vec3, d: Vec3, w: number) => {
        const uv = surfaceParams(s, q, sampledAt(c, t))
        const { du, dv } = surfaceFrame(s, uv.u, uv.v)
        const uu = dot3(du, du)
        const uvv = dot3(du, dv)
        const vv = dot3(dv, dv)
        const det = uu * vv - uvv * uvv
        if (!(Math.abs(det) > 0)) return
        const rate = (dot3(du, d) * vv - dot3(dv, d) * uvv) / det
        node(uv.u, uv.v, w * rate)
      }
      for (let i = 1; i < stops.length; i++) {
        const a = stops[i - 1]
        const b = stops[i]
        if (curve.kind === "spline") {
          const spans = splineSpans(curve.curve, a, b)
          if (other) {
            // A meeting of two surfaces, its spline only near it: each span
            // integrated on the curve itself, by a coordinate along it.
            const exact = spans.map((t) =>
              meetingPoint(brep, edge, c.trace, s, other, t)
            )
            for (let k = 1; k < spans.length; k++) {
              const r0 = exact[k - 1]
              const r1 = exact[k]
              const chord = sub3(r1, r0)
              const size = length3(chord)
              if (!(size > 0)) continue
              const along = scale3(chord, 1 / size)
              const s0 = dot3(along, r0)
              const s1 = dot3(along, r1)
              for (const { t: sigma, w } of gaussRule(s0, s1, 2)) {
                const t =
                  spans[k - 1] +
                  ((sigma - s0) / (s1 - s0)) * (spans[k] - spans[k - 1])
                const relaxed = relaxedOnBoth(
                  s,
                  other,
                  c.trace.point(t),
                  along,
                  sigma
                )
                if (relaxed && Math.abs(dot3(along, relaxed.tangent)) > 0) {
                  at(
                    t,
                    relaxed.point,
                    scale3(relaxed.tangent, 1 / dot3(along, relaxed.tangent)),
                    w
                  )
                } else {
                  const d = c.trace.derivative(t)
                  at(t, c.trace.point(t), scale3(d, 1 / dot3(along, d)), w)
                }
              }
            }
            continue
          }
          for (const { t, w } of spans
            .slice(1)
            .flatMap((y, k) => gaussRule(spans[k], y, 2))) {
            at(t, c.trace.point(t), c.trace.derivative(t), w)
          }
          continue
        }
        const share = Math.abs(b - a) / Math.abs(c.to - c.from)
        for (const { t, w } of gaussRule(
          a,
          b,
          Math.max(1, Math.ceil(edgePieces(c) * share))
        )) {
          at(t, c.trace.point(t), c.trace.derivative(t), w)
        }
      }
    }
  }
  const P = periods.u ?? 0
  if (region.top !== null) {
    for (const { t, w } of foldedRule(
      pu,
      region.domain.u[0],
      region.domain.u[0] + P,
      exact,
      periods.u
    )) {
      column(t, vRef, region.top, w)
    }
  }
  if (cut) {
    const Pv = periods.v as number
    for (const [a, b] of cut.runs) {
      for (const { t, w } of foldedRule(pu, a, b, exact, periods.u)) {
        column(t, cut.v, cut.v + Pv, w)
      }
    }
  }
  return out
}

const meetings = new WeakMap<Brep, Map<number, BrepFace[]>>()

/** The surface of the curved face across an edge from `face`, null when it is a plane's. */
function meetingSurface(
  brep: Brep,
  face: BrepFace,
  edge: number
): Curved | null {
  let map = meetings.get(brep)
  if (!map) {
    map = new Map()
    for (const f of brep.faces) {
      for (const loop of f.loops) {
        for (const c of loop) {
          const list = map.get(c.edge)
          if (list) list.push(f)
          else map.set(c.edge, [f])
        }
      }
    }
    meetings.set(brep, map)
  }
  const other = map.get(edge)?.find((f) => f !== face)
  return other && other.surface.kind !== "plane" ? other.surface : null
}

/**
 * The point of two surfaces' meeting at a spline's parameter: its vertex at
 * an end, else the spline's point carried onto both, square to the spline.
 */
function meetingPoint(
  brep: Brep,
  edge: { start: number; end: number },
  trace: EdgeTrace,
  a: Curved,
  b: Curved,
  t: number
): Vec3 {
  if (t === trace.t0) return brep.vertices[edge.start]
  if (t === trace.t1) return brep.vertices[edge.end]
  const p = trace.point(t)
  const d = trace.derivative(t)
  const size = length3(d)
  if (!(size > 0)) return p
  const along = scale3(d, 1 / size)
  return relaxedOnBoth(a, b, p, along, dot3(along, p))?.point ?? p
}

/** A curved face's area and its flux `∫ (x − about) · n dA`, by its samples. */
export function faceRegionMeasures(
  brep: Brep,
  face: BrepFace,
  about: Vec3
): { area: number; flux: number } {
  let flux = 0
  for (const { p, n, w } of faceSamples(brep, face, true)) {
    flux += dot3(sub3(p, about), n) * w
  }
  let area = 0
  for (const { n, w } of faceSamples(brep, face, false)) {
    area += length3(n) * w
  }
  return { area, flux }
}

/**
 * Whether `at` lies inside the face's region, by the parity of the loops
 * crossed by a ray up `v` from it: to the top of the parameters, where the
 * face goes on when it reaches a pole no loop bounds, or round a doughnut to
 * the cut, inside where a run of it is. Where a sampled crossing comes near,
 * it is pinned on the edge itself. A point on an edge is not asked here.
 */
export function regionContains(region: FaceRegion, at: UV): boolean {
  const { periods, cut, surface: s } = region
  const Pu = periods.u
  const Pv = periods.v
  let u0 = at.u
  // On a sample's own line (a ruling's, a seam's) the half-open count would
  // turn on rounding: the ray is moved off it.
  for (let tries = 0; tries < 8; tries++) {
    let hit = false
    for (const loop of region.loops) {
      for (const run of loop.runs) {
        const us =
          run.kind === "pole" ? [run.from, run.to] : run.samples.map((x) => x.u)
        if (us.some((u) => Math.abs(nearest(u, u0, Pu) - u0) <= 1e-10))
          hit = true
      }
    }
    if (!hit) break
    u0 += 3.7e-9
  }
  const reduce =
    cut && Pv !== null
      ? (v: number) => cut.v + ((((v - cut.v) % Pv) + Pv) % Pv)
      : (v: number) => v
  const v0 = reduce(at.v)
  let count = 0
  const across = (a: number, b: number): number | null => {
    const x = nearest(u0, (a + b) / 2, Pu)
    return (a <= x && x < b) || (b <= x && x < a) ? x : null
  }
  for (const loop of region.loops) {
    for (const run of loop.runs) {
      if (run.kind === "pole") {
        if (across(run.from, run.to) !== null && reduce(run.v) > v0) count++
        continue
      }
      const ss = run.samples
      for (let i = 1; i < ss.length; i++) {
        const a = ss[i - 1]
        const b = ss[i]
        const x = across(a.u, b.u)
        if (x === null) continue
        let v = a.v + ((b.v - a.v) * (x - a.u)) / (b.u - a.u)
        const spread = Math.abs(b.v - a.v) + Math.abs(b.u - a.u)
        if (Math.abs(reduce(v) - v0) <= spread) {
          // Near the point: the edge's own crossing of `u = x`.
          let lo = a.t
          let hi = b.t
          let near: UV = a
          for (let step = 0; step < CROSSING_STEPS; step++) {
            const m = (lo + hi) / 2
            const uv = surfaceParams(s, run.trace.point(m), near)
            if ((uv.u - x) * (a.u - x) > 0) {
              lo = m
              near = uv
            } else hi = m
          }
          v = surfaceParams(s, run.trace.point((lo + hi) / 2), near).v
        }
        if (reduce(v) > v0) count++
      }
    }
  }
  let top = region.top !== null
  if (cut && Pu !== null) {
    top = cut.runs.some(([a, b]) => {
      const x = a + ((((u0 - a) % Pu) + Pu) % Pu)
      return x < b
    })
  }
  return (count % 2 === 1) !== top
}

/** Stretches an iso line is sampled in for where it leaves and enters a face. */
const ISO_STRETCHES = 48

/** Bisections that pin where an iso line crosses an edge. */
const ISO_STEPS = 40

/**
 * The runs of the line of the face's parameters `along` held at `at`, from
 * `from` to `to` and that way round, that lie inside the face: its stretches'
 * middles tested, and where they change, the crossing pinned between them.
 */
export function isoRuns(
  region: FaceRegion,
  along: "u" | "v",
  at: number,
  from: number,
  to: number
): (readonly [number, number])[] {
  const point = (t: number): UV =>
    along === "v" ? { u: at, v: t } : { u: t, v: at }
  const n = ISO_STRETCHES
  const step = (to - from) / n
  const inside = Array.from({ length: n }, (_, i) =>
    regionContains(region, point(from + step * (i + 0.5)))
  )
  // Where two stretches disagree, the edge between their middles.
  const edge = (i: number): number => {
    let lo = from + step * (i + 0.5)
    let hi = from + step * (i + 1.5)
    const was = inside[i]
    for (let k = 0; k < ISO_STEPS; k++) {
      const m = (lo + hi) / 2
      if (regionContains(region, point(m)) === was) lo = m
      else hi = m
    }
    return (lo + hi) / 2
  }
  const out: [number, number][] = []
  let start: number | null = inside[0] ? from : null
  for (let i = 0; i + 1 < n; i++) {
    if (inside[i] === inside[i + 1]) continue
    const t = edge(i)
    if (inside[i]) {
      out.push([start as number, t])
      start = null
    } else start = t
  }
  if (start !== null) out.push([start, to])
  return out
}
