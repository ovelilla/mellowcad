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
}

/**
 * Stretches a curve is tested in for what hides it (each tested at its
 * middle) per turn of an angle, and on a line or a spline: a stretch hidden
 * shorter than one of these between two shown ones is missed. AutoCAD's own
 * Hidden is faceted (visualstyle/p02), so a hair's slip at the ends is within
 * what it draws.
 */
const VIEW_STRETCHES = 64

/** Bisections that pin where a curve passes behind a face, or leaves its face. */
const VIEW_STEPS = 32

/**
 * The cells a torus' or a revolution's parameters are cut into each way to
 * trace its outline; between two crossings of a cell the outline is a chord.
 */
const OUTLINE_CELLS = { u: 96, v: 48 }

/**
 * The runs of `[from, to]` where `inside` holds: `stretches` middles tested,
 * and where two disagree the change pinned between them, as isoRuns does.
 */
export function runsWhere(
  inside: (t: number) => boolean,
  from: number,
  to: number,
  stretches: number
): (readonly [number, number])[] {
  const step = (to - from) / stretches
  const flags = Array.from({ length: stretches }, (_, i) =>
    inside(from + step * (i + 0.5))
  )
  const change = (i: number): number => {
    let lo = from + step * (i + 0.5)
    let hi = from + step * (i + 1.5)
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
  for (let i = 0; i + 1 < stretches; i++) {
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
  return { trace, piece, angular: trace.angular }
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
    for (let k = 0; k < VIEW_STEPS * 2; k++) {
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
    case "torus":
      return signRoots(
        (t) => surfaceLevel(s, add3(o, scale3(w, t))).value,
        from,
        to,
        RAY_SAMPLES
      )
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
 * Where the line `o + t w` meets a revolution: read in a half-plane through
 * the axis, the line's height and distance from the axis are what the
 * profile's must be, so its parameter is found where they agree. A line
 * square to the axis keeps one height: the profile's points at it, each
 * met where the line comes as far from the axis.
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
  if (Math.abs(wa) > 1e-9) {
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
  const out: number[] = []
  for (const v of signRoots((x) => meridian(x).h - h0, a, b, RAY_SAMPLES)) {
    const disc = qb * qb - 4 * qa * (qc - meridian(v).rr)
    if (!(qa > 0) || disc < 0) continue
    const root = Math.sqrt(disc)
    out.push((-qb - root) / (2 * qa), (-qb + root) / (2 * qa))
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
      for (const t of rayHits(q, d, MODEL_TOLERANCE, reach, face)) {
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
  return breps.map((brep) => {
    const curves: (ViewCurve & { angular?: boolean })[] = []
    for (let i = 0; i < brep.edges.length; i++) {
      const c = edgeCurve(brep, i)
      if (c) curves.push(c)
    }
    for (const face of brep.faces) curves.push(...faceOutlines(brep, face, w))
    const out: ViewLine[] = []
    for (const curve of curves) {
      const { t0, t1 } = curve.trace
      if (!(t1 > t0)) continue
      const shown = runsWhere(
        (t) => !hidden(curve.trace.point(t), frame, shadows, gap),
        t0,
        t1,
        stretchesOf(curve.trace, curve.angular ?? false)
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
