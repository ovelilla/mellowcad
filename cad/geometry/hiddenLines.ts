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
import { arbitraryAxis } from "./ocs"
import {
  BSplineCurve,
  bsplineDomain,
  bsplineSegment,
  conicArcCurve,
} from "./nurbs"
import { EdgeTrace, edgeTrace } from "./brepCurves"
import {
  Curved,
  surfaceFrame,
  surfacePoint,
  sweptCurvePoint,
} from "./faceDomains"
import {
  UV,
  faceRegion,
  isoRuns,
  regionContains,
  surfaceParams,
} from "./faceRegions"
import {
  faceBox,
  facePlace,
  lineSurfaceHits,
  inBox,
  rayInBox,
  solidBox,
} from "./brepQueries"
import { MODEL_TOLERANCE } from "./planarCurves"
import { surfaceLevel } from "./surfaces"
import type { Box3, Brep, BrepFace, Wire } from "./solids"

/**
 * What the Hidden visual style draws of solids (docs/next-solids.md §2):
 * their edges and the silhouettes of their curved faces for a direction of
 * view, each cut where it passes behind a face. Parallel projection only.
 * Exact where the curve is (an edge, a ruling, a sphere's outline), sampled
 * where it is not (a torus' or a revolution's outline, the ends of a hidden
 * stretch): the caps below say how finely.
 */

/** A stretch of an edge or a silhouette, and whether a face hides it. */
export interface ViewLine {
  readonly wire: Wire
  readonly visible: boolean
}

/** A curve to be cut into what shows and what does not: a trace and its pieces. */
interface ViewCurve {
  readonly trace: Pick<EdgeTrace, "t0" | "t1" | "point">
  piece(from: number, to: number): Wire | null
  /** A line: one chord is the whole of it, seen along the view. */
  readonly straight?: boolean
}

/**
 * Stretches a curve is tested in for what hides it (each tested at its
 * middle) per turn of an angle, and on a line or a spline: a stretch hidden
 * shorter than one of these between two shown ones is missed. AutoCAD's own
 * Hidden is faceted (visualstyle/p02), so a hair's slip at the ends is within
 * what it draws.
 */
const VIEW_STRETCHES = 32

/** Bisections that pin where a curve passes behind a face, or leaves its face. */
const VIEW_STEPS = 32

/** Bisections that pin where a traced outline crosses a cell's side: a millionth of it. */
const CROSSING_STEPS = 20

/**
 * The cells a torus' or a revolution's parameters are cut into each way to
 * trace its outline; between two crossings of a cell the outline is a chord.
 */
const OUTLINE_CELLS = { u: 96, v: 48 }

/**
 * The runs of `[from, to]` where `inside` holds: `stretches` middles tested,
 * and where two disagree the change pinned between them, as isoRuns does.
 * `breaks` cut the stretches further, each piece tested at its middle: where
 * a change can lie, so that a run narrower than a stretch is still found.
 */
export function runsWhere(
  inside: (t: number) => boolean,
  from: number,
  to: number,
  stretches: number,
  breaks: readonly number[] = []
): (readonly [number, number])[] {
  const step = (to - from) / stretches
  const mids = breaks.length
    ? middles(from, to, stretches, breaks)
    : Array.from({ length: stretches }, (_, i) => from + step * (i + 0.5))
  const flags = mids.map(inside)
  const change = (i: number): number => {
    let lo = mids[i]
    let hi = mids[i + 1]
    const was = flags[i]
    for (let k = 0; k < VIEW_STEPS; k++) {
      const m = (lo + hi) / 2
      if (inside(m) === was) lo = m
      else hi = m
    }
    return (lo + hi) / 2
  }
  const out: [number, number][] = []
  let start: number | null = flags[0] ? from : null
  for (let i = 0; i + 1 < mids.length; i++) {
    if (flags[i] === flags[i + 1]) continue
    const t = change(i)
    if (flags[i]) {
      out.push([start as number, t])
      start = null
    } else start = t
  }
  if (start !== null) out.push([start, to])
  return out
}

/**
 * A piece of a stretch narrower than this share of it is not tested apart:
 * a curve's own ends, where the edges beside it cross it, and what no view
 * would draw.
 */
const SLIVER = 1e-3

/** The middles of `[from, to]` cut into `stretches` and at each of `breaks` within it. */
function middles(
  from: number,
  to: number,
  stretches: number,
  breaks: readonly number[]
): number[] {
  const step = (to - from) / stretches
  const least = step * SLIVER
  const cuts = [
    ...Array.from({ length: stretches }, (_, i) => from + step * i),
    to,
    ...breaks.filter((t) => t > from + least && t < to - least),
  ].sort((a, b) => a - b)
  // The stretches' own middles stay tested too: a run around one whose ends
  // no crossing marks is still found as it was without the breaks.
  const out = Array.from(
    { length: stretches },
    (_, i) => from + step * (i + 0.5)
  )
  let last = cuts[0]
  for (let i = 1; i < cuts.length; i++) {
    if (cuts[i] - last < least && i < cuts.length - 1) continue
    out.push((last + cuts[i]) / 2)
    last = cuts[i]
  }
  return out
    .sort((a, b) => a - b)
    .filter((t, i, all) => i === 0 || t > all[i - 1])
}

/** The stretches a curve over `[t0, t1]` is tested in: more round a longer turn. */
function stretchesOf(trace: ViewCurve["trace"], angular: boolean): number {
  if (!angular) return VIEW_STRETCHES
  const turns = Math.abs(trace.t1 - trace.t0) / (2 * Math.PI)
  return Math.max(16, Math.ceil(VIEW_STRETCHES * turns))
}

/** An edge as a curve to cut: its pieces the curve's own, exactly. */
function edgeCurve(
  brep: Brep,
  index: number
): (ViewCurve & { angular: boolean }) | null {
  const edge = brep.edges[index]
  const c = edge.curve
  if (c.kind === "point") return null
  const trace = edgeTrace(brep, edge)
  const piece = (from: number, to: number): Wire | null => {
    switch (c.kind) {
      case "line":
        return { kind: "line", start: trace.point(from), end: trace.point(to) }
      case "circle":
        return {
          kind: "arc",
          center: c.center,
          normal: c.normal,
          radius: c.radius,
          start: trace.point(from),
          sweep: to - from,
        }
      case "ellipse": {
        const major = sub3(trace.point(0), c.center)
        const minor = sub3(trace.point(Math.PI / 2), c.center)
        return {
          kind: "curve",
          curve: conicArcCurve(c.center, major, minor, from, to - from),
        }
      }
      case "spline": {
        const { start, end } = bsplineDomain(c.curve)
        const whole = from <= start && to >= end
        return {
          kind: "curve",
          curve: whole ? c.curve : bsplineSegment(c.curve, from, to),
        }
      }
    }
  }
  return { trace, piece, angular: trace.angular, straight: c.kind === "line" }
}

/** The cosine between the normal at `(u, v)` and `w`: zero where the surface turns edge-on to the view, and at a pole. */
function facing(s: Curved, w: Vec3, u: number, v: number): number {
  const { du, dv } = surfaceFrame(s, u, v)
  const n = cross3(du, dv)
  const size = length3(n)
  return size > 0 ? dot3(n, w) / size : 0
}

/** The roots of `f` over `[a, b]`: its sign changes between samples, bisected. */
function signRoots(
  f: (x: number) => number,
  a: number,
  b: number,
  n: number,
  zero = 0
): number[] {
  const xs = Array.from({ length: n + 1 }, (_, i) => a + ((b - a) * i) / n)
  const fs = xs.map(f)
  const out: number[] = []
  for (let i = 0; i <= n; i++) {
    // A root on a sample changes no sign: a cylinder's outline on its seam.
    if (Math.abs(fs[i]) <= zero) {
      out.push(xs[i])
      continue
    }
    if (i === n || Math.abs(fs[i + 1]) <= zero || fs[i] * fs[i + 1] > 0) {
      continue
    }
    let lo = xs[i]
    let hi = xs[i + 1]
    const flo = fs[i]
    for (let k = 0; k < 60; k++) {
      const m = (lo + hi) / 2
      if (f(m) * flo > 0) lo = m
      else hi = m
    }
    out.push((lo + hi) / 2)
  }
  return out
}

/** A cosine under this is a surface seen edge-on: a ruling straight down the view. */
const EDGE_ON = 1e-12

/**
 * The outline of a curved face seen along `w`: where its surface turns
 * edge-on, within the face. A cylinder's, a cone's and an extrusion's are
 * rulings (`(du × dv) · w` keeps its sign along one), a sphere's the great
 * circle square to `w`; a torus' and a revolution's are traced through a grid
 * of their parameters. A plane has none.
 */
export function faceOutlines(brep: Brep, face: BrepFace, w: Vec3): ViewCurve[] {
  const s = face.surface
  if (s.kind === "plane") return []
  const region = faceRegion(brep, face)
  if (!region) return []
  const { u, v } = region.domain
  const u0 = Math.min(u[0], u[1])
  const u1 = Math.max(u[0], u[1])
  const v0 = Math.min(v[0], v[1])
  const v1 = Math.max(v[0], v[1])
  const out: ViewCurve[] = []
  switch (s.kind) {
    case "cylinder":
    case "cone":
    case "extrusion": {
      // A cone's sign flips through its apex: read it on the far end.
      const at = Math.abs(v1) >= Math.abs(v0) ? v1 : v0
      const g = (x: number) => facing(s, w, x, at)
      // Seen along a cylinder's axis every ruling is edge-on: no outline of its own.
      const turn = u1 - u0 >= 2 * Math.PI - 1e-9
      const samples = Array.from({ length: 33 }, (_, i) =>
        g(u0 + ((u1 - u0) * i) / 32)
      )
      if (samples.every((x) => Math.abs(x) <= EDGE_ON)) return []
      const roots = signRoots(g, u0, u1, 128, EDGE_ON).filter(
        // A whole turn's end is its start again.
        (x) => !(turn && x >= u1 - 1e-12)
      )
      for (const ur of roots) {
        for (const [a, b] of isoRuns(region, "v", ur, v0, v1)) {
          out.push({
            trace: {
              t0: a,
              t1: b,
              point: (t) => surfacePoint(s, ur, t),
            },
            straight: true,
            piece: (from, to) => ({
              kind: "line",
              start: surfacePoint(s, ur, from),
              end: surfacePoint(s, ur, to),
            }),
          })
        }
      }
      return out
    }
    case "sphere": {
      const axes = arbitraryAxis(w)
      if (!axes) return []
      const e1 = axes.x
      const e2 = axes.y
      const at = (t: number) =>
        add3(
          s.center,
          add3(
            scale3(e1, s.radius * Math.cos(t)),
            scale3(e2, s.radius * Math.sin(t))
          )
        )
      const inside = (uv: UV) => regionContains(region, uv)
      for (const [a, b] of runsWhere(
        (t) => inside(surfaceParams(s, at(t))),
        0,
        2 * Math.PI,
        VIEW_STRETCHES
      )) {
        out.push({
          trace: { t0: a, t1: b, point: at },
          piece: (from, to) => ({
            kind: "arc",
            center: s.center,
            normal: w,
            radius: s.radius,
            start: at(from),
            sweep: to - from,
          }),
        })
      }
      return out
    }
    case "torus":
    case "revolution": {
      const inside = (uv: UV) => regionContains(region, uv)
      for (const line of contour(
        (x, y) => facing(s, w, x, y),
        u0,
        u1,
        v0,
        v1
      )) {
        const uvAt = (t: number): UV => {
          const i = Math.min(Math.floor(t), line.length - 2)
          const f = t - i
          return {
            u: line[i].u + (line[i + 1].u - line[i].u) * f,
            v: line[i].v + (line[i + 1].v - line[i].v) * f,
          }
        }
        const at = (t: number) => {
          const uv = onOutline(s, w, uvAt(t))
          return surfacePoint(s, uv.u, uv.v)
        }
        const last = line.length - 1
        for (const [a, b] of runsWhere(
          (t) => inside(uvAt(t)),
          0,
          last,
          Math.max(16, Math.min(last, 2 * VIEW_STRETCHES))
        )) {
          out.push({
            trace: { t0: a, t1: b, point: at },
            piece: (from, to) => polylineWire(at, from, to),
          })
        }
      }
      return out
    }
  }
}

/** Newton steps that bring a point between two traced crossings onto the outline. */
const OUTLINE_STEPS = 3

/**
 * `uv` moved onto the outline down the gradient of {@link facing}: between
 * two crossings a chord of the parameters runs a hair off it, and a ray from
 * there no longer grazes the surface but enters it.
 */
function onOutline(s: Curved, w: Vec3, uv: UV): UV {
  let { u, v } = uv
  const h = 1e-6
  for (let k = 0; k < OUTLINE_STEPS; k++) {
    const f = facing(s, w, u, v)
    const fu = (facing(s, w, u + h, v) - facing(s, w, u - h, v)) / (2 * h)
    const fv = (facing(s, w, u, v + h) - facing(s, w, u, v - h)) / (2 * h)
    const g = fu * fu + fv * fv
    if (!(g > 0)) break
    const du = (f * fu) / g
    const dv = (f * fv) / g
    // A step longer than a cell's is no correction but a jump to another branch.
    if (Math.abs(du) > 0.1 || Math.abs(dv) > 0.1) break
    u -= du
    v -= dv
  }
  return { u, v }
}

/** The chords of a traced outline from `from` to `to` as a NURBS of degree 1. */
function polylineWire(
  at: (t: number) => Vec3,
  from: number,
  to: number
): Wire | null {
  const ts = [from]
  for (let k = Math.floor(from) + 1; k < to; k++) ts.push(k)
  ts.push(to)
  const points = ts.map(at)
  const length = points.reduce(
    (sum, p, i) => (i ? sum + length3(sub3(p, points[i - 1])) : 0),
    0
  )
  if (!(length > MODEL_TOLERANCE)) return null
  const knots = [0, ...points.map((_, i) => i), points.length - 1]
  const curve: BSplineCurve = { degree: 1, knots, controlPoints: points }
  return { kind: "curve", curve }
}

/**
 * The zero lines of `f` over a rectangle, by marching squares on
 * {@link OUTLINE_CELLS}: each crossing of a cell's side bisected on it, the
 * crossings chained into polylines (a saddle split by the cell's middle).
 */
function contour(
  f: (u: number, v: number) => number,
  u0: number,
  u1: number,
  v0: number,
  v1: number
): UV[][] {
  const nu = OUTLINE_CELLS.u
  const nv = OUTLINE_CELLS.v
  const us = Array.from({ length: nu + 1 }, (_, i) => u0 + ((u1 - u0) * i) / nu)
  const vs = Array.from({ length: nv + 1 }, (_, j) => v0 + ((v1 - v0) * j) / nv)
  const grid = us.map((x) => vs.map((y) => f(x, y)))
  const scale = Math.max(...grid.flat().map(Math.abs))
  if (!(scale > 0)) return []
  const zero = scale * 1e-12
  const up = (x: number) => x > zero
  const crossings = new Map<string, UV>()
  const cross = (key: string, a: UV, b: UV, fa: number): UV => {
    let found = crossings.get(key)
    if (found) return found
    let lo = 0
    let hi = 1
    for (let k = 0; k < CROSSING_STEPS; k++) {
      const m = (lo + hi) / 2
      const fm = f(a.u + (b.u - a.u) * m, a.v + (b.v - a.v) * m)
      if (up(fm) === up(fa)) lo = m
      else hi = m
    }
    const m = (lo + hi) / 2
    found = { u: a.u + (b.u - a.u) * m, v: a.v + (b.v - a.v) * m }
    crossings.set(key, found)
    return found
  }
  const links = new Map<string, string[]>()
  const link = (a: string, b: string) => {
    links.set(a, [...(links.get(a) ?? []), b])
    links.set(b, [...(links.get(b) ?? []), a])
  }
  for (let i = 0; i < nu; i++) {
    for (let j = 0; j < nv; j++) {
      const corner = [
        { uv: { u: us[i], v: vs[j] }, f: grid[i][j] },
        { uv: { u: us[i + 1], v: vs[j] }, f: grid[i + 1][j] },
        { uv: { u: us[i + 1], v: vs[j + 1] }, f: grid[i + 1][j + 1] },
        { uv: { u: us[i], v: vs[j + 1] }, f: grid[i][j + 1] },
      ]
      const sides = [
        `h${i},${j}`,
        `v${i + 1},${j}`,
        `h${i},${j + 1}`,
        `v${i},${j}`,
      ]
      const hit: number[] = []
      for (let k = 0; k < 4; k++) {
        const a = corner[k]
        const b = corner[(k + 1) % 4]
        if (up(a.f) !== up(b.f)) {
          cross(sides[k], a.uv, b.uv, a.f)
          hit.push(k)
        }
      }
      if (hit.length === 2) link(sides[hit[0]], sides[hit[1]])
      else if (hit.length === 4) {
        const middle = f((us[i] + us[i + 1]) / 2, (vs[j] + vs[j + 1]) / 2)
        // The middle's sign joins the corners that share it.
        if (up(middle) === up(corner[0].f)) {
          link(sides[0], sides[1])
          link(sides[2], sides[3])
        } else {
          link(sides[0], sides[3])
          link(sides[1], sides[2])
        }
      }
    }
  }
  const seen = new Set<string>()
  const lines: UV[][] = []
  const walk = (from: string): string[] => {
    const chain = [from]
    seen.add(from)
    for (;;) {
      const next = (links.get(chain[chain.length - 1]) ?? []).find(
        (k) => !seen.has(k)
      )
      if (next === undefined) return chain
      seen.add(next)
      chain.push(next)
    }
  }
  // Open chains from their ends first, then the closed ones.
  const ends = [...links.keys()].filter((k) => links.get(k)!.length === 1)
  for (const key of [...ends, ...links.keys()]) {
    if (seen.has(key)) continue
    const chain = walk(key)
    const closed =
      chain.length > 2 &&
      (links.get(chain[chain.length - 1]) ?? []).includes(chain[0])
    if (closed) chain.push(chain[0])
    if (chain.length >= 2) lines.push(chain.map((k) => crossings.get(k)!))
  }
  return lines
}

/** A face's box seen along the view: its spread across it and how near it comes. */
interface Shadow {
  readonly brep: Brep
  readonly face: BrepFace
  readonly min: readonly [number, number]
  readonly max: readonly [number, number]
  /** The face's nearest reach towards the viewer, along `w`. */
  readonly near: number
}

/** The view's frame: two axes across it and `w`, towards the viewer. */
interface ViewFrame {
  readonly e1: Vec3
  readonly e2: Vec3
  readonly w: Vec3
}

function shadowOf(brep: Brep, face: BrepFace, frame: ViewFrame): Shadow {
  const box = faceBox(brep, face)
  const min: [number, number] = [Infinity, Infinity]
  const max: [number, number] = [-Infinity, -Infinity]
  let near = -Infinity
  for (const corner of boxCorners(box)) {
    const a = dot3(corner, frame.e1)
    const b = dot3(corner, frame.e2)
    min[0] = Math.min(min[0], a)
    min[1] = Math.min(min[1], b)
    max[0] = Math.max(max[0], a)
    max[1] = Math.max(max[1], b)
    near = Math.max(near, dot3(corner, frame.w))
  }
  return { brep, face, min, max, near }
}

function boxCorners(box: Box3): Vec3[] {
  const out: Vec3[] = []
  for (const x of [box.min.x, box.max.x]) {
    for (const y of [box.min.y, box.max.y]) {
      for (const z of [box.min.z, box.max.z]) out.push({ x, y, z })
    }
  }
  return out
}

/**
 * Where a ray from `o` towards the viewer crosses a surface beyond `from`.
 * A plane, a cylinder, a cone and a sphere in closed form; a torus by the
 * sign changes of its level; a swept surface on its profile's parameter. A
 * ray that only grazes a surface hides nothing behind it: a touch has no
 * area.
 */
function rayHits(
  o: Vec3,
  w: Vec3,
  from: number,
  to: number,
  brep: Brep,
  face: BrepFace
): number[] {
  const s = face.surface
  const within = (t: number) => t >= from && t <= to
  switch (s.kind) {
    case "plane":
    case "cylinder":
    case "cone":
    case "sphere":
      return lineSurfaceHits(o, w, from, to, s, MODEL_TOLERANCE) ?? []
    case "torus": {
      // Sampled where the ray is in the face's box, not along all of it.
      const span = rayInBox(o, w, faceBox(brep, face))
      if (!span) return []
      const a = Math.max(from, span[0])
      const b = Math.min(to, span[1])
      if (!(b > a)) return []
      return signRoots(
        (t) => surfaceLevel(s, add3(o, scale3(w, t))).value,
        a,
        b,
        RAY_SAMPLES
      )
    }
    case "extrusion":
      return extrusionHits(o, w, s).filter(within)
    case "revolution":
      return revolutionHits(o, w, s).filter(within)
  }
}

/** Samples along a ray's stretch over a torus' box, or along a profile. */
const RAY_SAMPLES = 96

type Swept = Extract<BrepFace["surface"], { kind: "extrusion" | "revolution" }>

/** The profile's whole parameter range. */
function profileRange(s: Swept): [number, number] {
  if (s.profile.kind === "ellipse") return [0, 2 * Math.PI]
  const { start, end } = bsplineDomain(s.profile.curve)
  return [start, end]
}

/**
 * Where the line `o + t w` meets an extrusion: seen down its direction the
 * surface is its profile and the line a line, so the profile's parameter is
 * found where it crosses that line. A line along the direction grazes it.
 */
function extrusionHits(
  o: Vec3,
  w: Vec3,
  s: Extract<Swept, { kind: "extrusion" }>
): number[] {
  const axes = arbitraryAxis(s.direction)
  if (!axes) return []
  const flat = (p: Vec3) => [dot3(p, axes.x), dot3(p, axes.y)] as const
  const [wx, wy] = flat(w)
  const ww = wx * wx + wy * wy
  if (!(ww > 1e-18)) return []
  const [ox, oy] = flat(o)
  const [a, b] = profileRange(s)
  const off = (u: number) => {
    const [px, py] = flat(sweptCurvePoint(s.profile, u))
    return [px - ox, py - oy] as const
  }
  return signRoots(
    (u) => {
      const [dx, dy] = off(u)
      return dx * wy - dy * wx
    },
    a,
    b,
    RAY_SAMPLES
  ).map((u) => {
    const [dx, dy] = off(u)
    return (dx * wx + dy * wy) / ww
  })
}

/**
 * Below this cosine between a line and a revolution's axis, the line is read
 * as across the axis ({@link revolutionHits}).
 */
const ALONG_AXIS = 0.1

/**
 * Where the line `o + t w` meets a revolution: read in a half-plane through
 * the axis, the line's height and distance from the axis are what the
 * profile's must be, so its parameter is found where they agree. Along the
 * axis the height gives `t`; across it the distance does, nearer and
 * farther, and the profile's height must then be the line's there.
 */
function revolutionHits(
  o: Vec3,
  w: Vec3,
  s: Extract<Swept, { kind: "revolution" }>
): number[] {
  const d = sub3(o, s.origin)
  const h0 = dot3(d, s.axis)
  const wa = dot3(w, s.axis)
  // Squared distance from the axis along the line: a t² + b t + c.
  const qa = 1 - wa * wa
  const qb = 2 * (dot3(d, w) - h0 * wa)
  const qc = dot3(d, d) - h0 * h0
  const meridian = (v: number) => {
    const q = sub3(sweptCurvePoint(s.profile, v), s.origin)
    const h = dot3(q, s.axis)
    return { h, rr: Math.max(dot3(q, q) - h * h, 0) }
  }
  const [a, b] = profileRange(s)
  if (Math.abs(wa) > ALONG_AXIS) {
    const tOf = (v: number) => (meridian(v).h - h0) / wa
    return signRoots(
      (v) => {
        const t = tOf(v)
        return qa * t * t + qb * t + qc - meridian(v).rr
      },
      a,
      b,
      RAY_SAMPLES
    ).map(tOf)
  }
  // WHY not the height here too: nearly square to the axis the line's height
  // hardly changes, `t` from it is a division by almost nothing, and the
  // samples missed the hair of the profile where it is met (a ruling of a
  // cylinder 1e-9 off square, behind a ring on its axis). The height is kept
  // for the rest, as exact there and about four times cheaper.
  const disc = (v: number) => qb * qb - 4 * qa * (qc - meridian(v).rr)
  // Cut where the line stops coming that near the axis: there its nearer
  // and farther meetings with the profile's circle are one, and a meeting
  // between the last sample and that end is found only against it.
  const cuts = [a, ...signRoots(disc, a, b, RAY_SAMPLES), b]
  const out: number[] = []
  for (let i = 0; i + 1 < cuts.length; i++) {
    const [p, q] = [cuts[i], cuts[i + 1]]
    if (!(q > p) || disc((p + q) / 2) < 0) continue
    for (const side of [-1, 1]) {
      const tAt = (v: number) =>
        (-qb + side * Math.sqrt(Math.max(disc(v), 0))) / (2 * qa)
      const g = (v: number) => h0 + wa * tAt(v) - meridian(v).h
      for (const v of signRoots(g, p, q, RAY_SAMPLES)) out.push(tAt(v))
    }
  }
  return out
}

/**
 * Whether a face hides `p`: whether the ray from it towards the viewer
 * enters a face of any solid, further than `gap` from it. A ray that meets
 * a solid only on its edges hides `p` when it runs inside the solid between
 * them: through a ring where two cones meet, from one side of it to the
 * other. Along an edge-on face it does not: what it would hide there lies
 * on that edge's own line.
 */
function hidden(
  p: Vec3,
  frame: ViewFrame,
  shadows: readonly Shadow[],
  gap: number
): boolean {
  const a = dot3(p, frame.e1)
  const b = dot3(p, frame.e2)
  const depth = dot3(p, frame.w)
  const margin = MODEL_TOLERANCE
  const touches = new Map<Brep, number[]>()
  for (const sh of shadows) {
    if (sh.near <= depth + gap) continue
    if (a < sh.min[0] - margin || a > sh.max[0] + margin) continue
    if (b < sh.min[1] - margin || b > sh.max[1] + margin) continue
    for (const t of rayHits(
      p,
      frame.w,
      gap,
      sh.near - depth + margin,
      sh.brep,
      sh.face
    )) {
      if (!(t > gap)) continue
      const q = add3(p, scale3(frame.w, t))
      const place = facePlace(sh.brep, sh.face, q, MODEL_TOLERANCE)
      if (place === "inside") return true
      if (place === "boundary") {
        touches.set(sh.brep, [...(touches.get(sh.brep) ?? []), t])
      }
    }
  }
  for (const [brep, ts] of touches) {
    const stops = [gap, ...ts.sort((x, y) => x - y)]
    for (let i = 1; i < stops.length; i++) {
      if (stops[i] - stops[i - 1] <= gap) continue
      const mid = add3(p, scale3(frame.w, (stops[i - 1] + stops[i]) / 2))
      if (insideSolid(brep, mid, frame.w)) return true
    }
  }
  return false
}

/** Samples a curve's spread across the view is taken over, padded by what bulges between them. */
const SPREAD_SAMPLES = 32

/**
 * The faces that can hide some of a curve: those whose box, seen along the
 * view, overlaps the curve's and reaches nearer the viewer than it. Most of
 * a drawing's curves have none, and are shown whole without a ray cast.
 */
function shadowsOver(
  trace: ViewCurve["trace"],
  frame: ViewFrame,
  shadows: readonly Shadow[],
  gap: number
): Shadow[] {
  let a0 = Infinity
  let a1 = -Infinity
  let b0 = Infinity
  let b1 = -Infinity
  let far = Infinity
  for (let i = 0; i <= SPREAD_SAMPLES; i++) {
    const p = trace.point(
      trace.t0 + ((trace.t1 - trace.t0) * i) / SPREAD_SAMPLES
    )
    const a = dot3(p, frame.e1)
    const b = dot3(p, frame.e2)
    a0 = Math.min(a0, a)
    a1 = Math.max(a1, a)
    b0 = Math.min(b0, b)
    b1 = Math.max(b1, b)
    far = Math.min(far, dot3(p, frame.w))
  }
  const pad = 0.02 * Math.max(a1 - a0, b1 - b0) + MODEL_TOLERANCE
  return shadows.filter(
    (sh) =>
      sh.near > far + gap &&
      sh.min[0] <= a1 + pad &&
      sh.max[0] >= a0 - pad &&
      sh.min[1] <= b1 + pad &&
      sh.max[1] >= b0 - pad
  )
}

/** A curve seen along the view: chords across it, each point with the parameter it was taken at. */
interface FlatCurve {
  readonly ts: readonly number[]
  readonly a: readonly number[]
  readonly b: readonly number[]
  /** How near the viewer each point is, along `w`. */
  readonly d: readonly number[]
  readonly box: readonly [number, number, number, number]
}

/** Chords a curve is seen as, per stretch it is tested in, to find where it crosses another. */
const FLAT_CHORDS = 1

function flatCurve(
  trace: ViewCurve["trace"],
  frame: ViewFrame,
  chords: number
): FlatCurve {
  const ts: number[] = []
  const a: number[] = []
  const b: number[] = []
  const d: number[] = []
  for (let i = 0; i <= chords; i++) {
    const t = trace.t0 + ((trace.t1 - trace.t0) * i) / chords
    const p = trace.point(t)
    ts.push(t)
    a.push(dot3(p, frame.e1))
    b.push(dot3(p, frame.e2))
    d.push(dot3(p, frame.w))
  }
  return {
    ts,
    a,
    b,
    d,
    box: [Math.min(...a), Math.min(...b), Math.max(...a), Math.max(...b)],
  }
}

const boxesMeet = (
  p: FlatCurve["box"],
  q: FlatCurve["box"],
  pad: number
): boolean =>
  p[0] <= q[2] + pad &&
  q[0] <= p[2] + pad &&
  p[1] <= q[3] + pad &&
  q[1] <= p[3] + pad

/**
 * The parameters of `c` where its chords cross those of `o` nearer the
 * viewer than it by over `gap`, read off its own chord: where `o` runs
 * behind, its face is behind `c` too, and hides nothing there.
 */
function flatCrossings(
  c: FlatCurve,
  o: FlatCurve,
  pad: number,
  gap: number
): number[] {
  if (!boxesMeet(c.box, o.box, pad)) return []
  const out: number[] = []
  for (let i = 0; i + 1 < c.ts.length; i++) {
    const a0 = c.a[i]
    const b0 = c.b[i]
    const da = c.a[i + 1] - a0
    const db = c.b[i + 1] - b0
    const chord: FlatCurve["box"] = [
      Math.min(a0, a0 + da),
      Math.min(b0, b0 + db),
      Math.max(a0, a0 + da),
      Math.max(b0, b0 + db),
    ]
    if (!boxesMeet(chord, o.box, pad)) continue
    for (let j = 0; j + 1 < o.ts.length; j++) {
      const ea = o.a[j + 1] - o.a[j]
      const eb = o.b[j + 1] - o.b[j]
      const den = da * eb - db * ea
      if (den === 0) continue
      const fa = o.a[j] - a0
      const fb = o.b[j] - b0
      const s = (fa * eb - fb * ea) / den
      const r = (fa * db - fb * da) / den
      if (s < 0 || s > 1 || r < 0 || r > 1) continue
      const depth = c.d[i] + (c.d[i + 1] - c.d[i]) * s
      if (o.d[j] + (o.d[j + 1] - o.d[j]) * r <= depth + gap) continue
      out.push(c.ts[i] + (c.ts[i + 1] - c.ts[i]) * s)
    }
  }
  return out
}

/**
 * Directions a ray is cast in, after the view's, to count the faces it
 * crosses: one that meets an edge cannot tell, and the next is tried.
 */
const PARITY_DIRECTIONS: readonly Vec3[] = [
  { x: 0.3719, y: 0.6142, z: 0.6961 },
  { x: -0.5287, y: 0.2903, z: -0.7976 },
  { x: 0.8113, y: -0.5412, z: 0.2215 },
]

/**
 * Whether `q` lies inside the solid, by the parity of the faces a ray from
 * it crosses, cut as {@link rayHits} cuts the view's rays: `pointInSolid`'s
 * own rays sample a swept face's level, seconds where this takes
 * milliseconds. On a face, or every ray through an edge, it is taken as
 * outside.
 */
function insideSolid(brep: Brep, q: Vec3, w: Vec3): boolean {
  // On a face is on the solid's boundary: what runs along it hides nothing.
  for (const face of brep.faces) {
    if (!inBox(q, faceBox(brep, face), MODEL_TOLERANCE)) continue
    if (Math.abs(surfaceLevel(face.surface, q).value) > MODEL_TOLERANCE)
      continue
    if (facePlace(brep, face, q, MODEL_TOLERANCE) !== "outside") return false
  }
  const box = solidBox(brep)
  const reach =
    length3(sub3(box.max, box.min)) +
    length3(sub3(q, scale3(add3(box.min, box.max), 0.5)))
  for (const d of [w, ...PARITY_DIRECTIONS]) {
    let count = 0
    let clean = true
    for (const face of brep.faces) {
      for (const t of rayHits(q, d, MODEL_TOLERANCE, reach, brep, face)) {
        const place = facePlace(
          brep,
          face,
          add3(q, scale3(d, t)),
          MODEL_TOLERANCE
        )
        if (place === "boundary") clean = false
        else if (place === "inside") count++
      }
      if (!clean) break
    }
    if (clean) return count % 2 === 1
  }
  return false
}

/**
 * Every edge and outline of each solid seen along `toViewer` (from the scene
 * towards the viewer, VIEWDIR), cut into the stretches shown and the ones a
 * face of any of them hides; one list per solid, in its order.
 */
export function viewLines(
  breps: readonly Brep[],
  toViewer: Vec3
): ViewLine[][] {
  const w = normalize3(toViewer)
  if (!w) return breps.map(() => [])
  const axes = arbitraryAxis(w)
  if (!axes) return breps.map(() => [])
  const frame: ViewFrame = { e1: axes.x, e2: axes.y, w }
  const shadows = breps.flatMap((brep) =>
    brep.faces.map((face) => shadowOf(brep, face, frame))
  )
  // How far from its own face a ray must get before what it meets hides it:
  // a hair over the model's size times the doubles' noise.
  const reach = shadows.reduce(
    (m, sh) =>
      Math.max(
        m,
        Math.abs(sh.min[0]),
        Math.abs(sh.min[1]),
        Math.abs(sh.max[0]),
        Math.abs(sh.max[1]),
        Math.abs(sh.near)
      ),
    1
  )
  const gap = Math.max(MODEL_TOLERANCE, reach * 1e-9)
  type Curve = ViewCurve & { angular?: boolean }
  const seen = breps.map((brep) => {
    const edges = brep.edges.map((_, i) => edgeCurve(brep, i))
    const outlines = new Map<BrepFace, Curve[]>(
      brep.faces.map((face) => [face, faceOutlines(brep, face, w)])
    )
    return { edges, outlines }
  })
  const flats = new Map<Curve, FlatCurve>()
  const flatOf = (c: Curve): FlatCurve => {
    let f = flats.get(c)
    if (!f) {
      f = flatCurve(
        c.trace,
        frame,
        c.straight ? 1 : FLAT_CHORDS * stretchesOf(c.trace, c.angular ?? false)
      )
      flats.set(c, f)
    }
    return f
  }
  const bounds = new Map<BrepFace, Curve[]>()
  const boundOf = (sh: Shadow): Curve[] => {
    let found = bounds.get(sh.face)
    if (!found) {
      const { edges, outlines } = seen[breps.indexOf(sh.brep)]
      found = [
        ...sh.face.loops.flatMap((loop) =>
          loop.flatMap((co) => edges[co.edge] ?? [])
        ),
        ...(outlines.get(sh.face) ?? []),
      ]
      bounds.set(sh.face, found)
    }
    return found
  }
  return breps.map((brep, index) => {
    const { edges, outlines } = seen[index]
    const curves: Curve[] = [
      ...edges.filter((c): c is NonNullable<typeof c> => c !== null),
      ...brep.faces.flatMap((face) => outlines.get(face) ?? []),
    ]
    const out: ViewLine[] = []
    for (const curve of curves) {
      const { t0, t1 } = curve.trace
      if (!(t1 > t0)) continue
      const near = shadowsOver(curve.trace, frame, shadows, gap)
      // WHY: a face hides a stretch of a curve only up to where, seen along
      // the view, the curve crosses the face's edges or outline: there the
      // samples are cut too, or a solid thinner than a stretch in front of
      // it (a 3° wedge before a cylinder's far rim) is missed.
      const breaks: number[] = []
      if (near.length) {
        const flat = flatOf(curve)
        for (const sh of near) {
          for (const other of boundOf(sh)) {
            if (other === curve || !(other.trace.t1 > other.trace.t0)) continue
            breaks.push(
              ...flatCrossings(flat, flatOf(other), MODEL_TOLERANCE, gap)
            )
          }
        }
      }
      const shown =
        near.length === 0
          ? [[t0, t1] as const]
          : runsWhere(
              (t) => !hidden(curve.trace.point(t), frame, near, gap),
              t0,
              t1,
              stretchesOf(curve.trace, curve.angular ?? false),
              breaks
            )
      let at = t0
      const push = (from: number, to: number, visible: boolean) => {
        if (!(to > from)) return
        const wire = curve.piece(from, to)
        if (wire) out.push({ wire, visible })
      }
      for (const [a, b] of shown) {
        push(at, a, false)
        push(a, b, true)
        at = b
      }
      push(at, t1, false)
    }
    return out
  })
}

/**
 * Whether a point of the solids is drawn in Hidden seen along `toViewer`: no
 * face of any of them hides it, as {@link viewLines} cuts their lines. What a
 * Ctrl+click finds of an edge in a shaded style, where a hidden one is not
 * drawn; null for a direction of no length.
 */
export function pointShown(
  breps: readonly Brep[],
  toViewer: Vec3
): ((p: Vec3) => boolean) | null {
  const w = normalize3(toViewer)
  const axes = w && arbitraryAxis(w)
  if (!w || !axes) return null
  const frame: ViewFrame = { e1: axes.x, e2: axes.y, w }
  const shadows = breps.flatMap((brep) =>
    brep.faces.map((face) => shadowOf(brep, face, frame))
  )
  const reach = shadows.reduce(
    (m, sh) =>
      Math.max(
        m,
        Math.abs(sh.min[0]),
        Math.abs(sh.min[1]),
        Math.abs(sh.max[0]),
        Math.abs(sh.max[1]),
        Math.abs(sh.near)
      ),
    1
  )
  const gap = Math.max(MODEL_TOLERANCE, reach * 1e-9)
  return (p) => !hidden(p, frame, shadows, gap)
}

/** A face the line of sight crosses, and how far towards the viewer along it. */
export interface FaceCrossing {
  readonly face: number
  readonly depth: number
}

/**
 * The faces the line of sight through `point` along `toViewer` crosses,
 * nearest the viewer first, each once: what a Ctrl+click on a face takes, and
 * Ctrl+Space the next behind it (desktop, the box's top then its back). Cut
 * as the view's rays are; a face it only grazes is not crossed.
 */
export function facesAlong(
  brep: Brep,
  point: Vec3,
  toViewer: Vec3
): FaceCrossing[] {
  const w = normalize3(toViewer)
  if (!w) return []
  const box = solidBox(brep)
  const pad = length3(sub3(box.max, box.min)) * 0.01 + MODEL_TOLERANCE
  const span = rayInBox(point, w, {
    min: sub3(box.min, { x: pad, y: pad, z: pad }),
    max: add3(box.max, { x: pad, y: pad, z: pad }),
  })
  if (!span) return []
  const found: FaceCrossing[] = []
  brep.faces.forEach((face, index) => {
    let best = -Infinity
    for (const t of rayHits(point, w, span[0], span[1], brep, face)) {
      const q = add3(point, scale3(w, t))
      if (facePlace(brep, face, q, MODEL_TOLERANCE) === "outside") continue
      best = Math.max(best, t)
    }
    if (best > -Infinity) found.push({ face: index, depth: best })
  })
  return found.sort((a, b) => b.depth - a.depth)
}
