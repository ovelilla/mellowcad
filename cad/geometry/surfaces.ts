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
import { EdgeTrace } from "./brepCurves"
import { surfaceFrame } from "./faceDomains"
import { surfaceParams, surfacePeriods } from "./faceRegions"
import { bsplineDomain } from "./nurbs"
import type { BrepSurface } from "./solids"

/**
 * A surface as a level set: a value that is its signed distance there (or
 * close to it, an elliptical one's), positive on its outside — a plane's
 * normal side, away from an axis, out of a sphere or a tube, `∂u × ∂v` of a
 * swept one — and its gradient. What a curve is cut by and a point measured
 * against.
 */
export function surfaceLevel(
  s: BrepSurface,
  p: Vec3
): { value: number; gradient: Vec3 } {
  switch (s.kind) {
    case "plane":
      return { value: dot3(sub3(p, s.origin), s.normal), gradient: s.normal }
    case "cylinder":
    case "cone": {
      const d = sub3(p, s.kind === "cylinder" ? s.origin : s.apex)
      const y = cross3(s.axis, s.xAxis)
      const x = dot3(d, s.xAxis)
      const yy = dot3(d, y)
      const k = s.ratio
      const rho = Math.hypot(x, yy / k)
      const radial =
        rho > 0
          ? add3(scale3(s.xAxis, x / rho), scale3(y, yy / (k * k * rho)))
          : { x: 0, y: 0, z: 0 }
      if (s.kind === "cylinder") {
        return { value: rho - s.radius, gradient: radial }
      }
      const t = dot3(d, s.axis)
      const norm = Math.hypot(1, s.slope)
      return {
        value: (rho - s.slope * t) / norm,
        gradient: scale3(sub3(radial, scale3(s.axis, s.slope)), 1 / norm),
      }
    }
    case "sphere": {
      const d = sub3(p, s.center)
      const r = length3(d)
      return {
        value: r - s.radius,
        gradient: r > 0 ? scale3(d, 1 / r) : s.axis,
      }
    }
    case "torus": {
      const d = sub3(p, s.center)
      const z = dot3(d, s.axis)
      const w = sub3(d, scale3(s.axis, z))
      const rho = length3(w)
      const out = rho > 0 ? scale3(w, 1 / rho) : s.xAxis
      const a = rho - s.majorRadius
      const q = Math.hypot(a, z)
      return {
        value: q - s.minorRadius,
        gradient: q > 0 ? add3(scale3(out, a / q), scale3(s.axis, z / q)) : out,
      }
    }
    case "extrusion":
    case "revolution": {
      const uv = surfaceParams(s, p)
      const { p: foot, du, dv } = surfaceFrame(s, uv.u, uv.v)
      const n = normalize3(cross3(du, dv)) ?? { x: 0, y: 0, z: 1 }
      const off = sub3(p, foot)
      const along = dot3(off, n)
      // Past an end of an open profile the nearest point is the end, and
      // the offset no normal: the distance itself, never a false zero.
      const t = s.kind === "extrusion" ? uv.u : uv.v
      const c = s.profile
      const ends =
        c.kind === "spline" &&
        surfacePeriods(s)[s.kind === "extrusion" ? "u" : "v"] === null
          ? bsplineDomain(c.curve)
          : null
      if (ends && (t <= ends.start || t >= ends.end)) {
        return { value: (along < 0 ? -1 : 1) * length3(off), gradient: n }
      }
      return { value: along, gradient: n }
    }
  }
}

/** Whether two surfaces are one, either way round, within `tolerance`. */
export function sameSurface(
  a: BrepSurface,
  b: BrepSurface,
  tolerance: number
): boolean {
  const parallel = (x: Vec3, y: Vec3) =>
    length3(cross3(x, y)) <= 1e-9 && Math.abs(dot3(x, y)) > 0
  const close = (x: Vec3, y: Vec3) => length3(sub3(x, y)) <= tolerance
  const onLine = (p: Vec3, o: Vec3, axis: Vec3) => {
    const d = sub3(p, o)
    return length3(sub3(d, scale3(axis, dot3(d, axis)))) <= tolerance
  }
  if (a.kind === "plane" && b.kind === "plane") {
    return (
      parallel(a.normal, b.normal) &&
      Math.abs(dot3(sub3(b.origin, a.origin), a.normal)) <= tolerance
    )
  }
  if (a.kind === "cylinder" && b.kind === "cylinder") {
    if (!parallel(a.axis, b.axis) || !onLine(b.origin, a.origin, a.axis)) {
      return false
    }
    if (a.ratio === 1 && b.ratio === 1) {
      return Math.abs(a.radius - b.radius) <= tolerance
    }
    // An elliptical one is the same where its axes are.
    const p = add3(b.origin, scale3(b.xAxis, b.radius))
    const q = add3(
      b.origin,
      scale3(cross3(b.axis, b.xAxis), b.radius * b.ratio)
    )
    return (
      Math.abs(surfaceLevel(a, p).value) <= tolerance &&
      Math.abs(surfaceLevel(a, q).value) <= tolerance &&
      Math.abs(a.radius * a.ratio * a.radius - b.radius * b.ratio * b.radius) <=
        tolerance * (a.radius + b.radius)
    )
  }
  if (a.kind === "cone" && b.kind === "cone") {
    return (
      close(a.apex, b.apex) &&
      dot3(a.axis, b.axis) > 1 - 1e-12 &&
      Math.abs(a.slope - b.slope) <= 1e-9 &&
      a.ratio === 1 &&
      b.ratio === 1
    )
  }
  if (a.kind === "sphere" && b.kind === "sphere") {
    return (
      close(a.center, b.center) && Math.abs(a.radius - b.radius) <= tolerance
    )
  }
  if (a.kind === "torus" && b.kind === "torus") {
    return (
      close(a.center, b.center) &&
      parallel(a.axis, b.axis) &&
      Math.abs(a.majorRadius - b.majorRadius) <= tolerance &&
      Math.abs(a.minorRadius - b.minorRadius) <= tolerance
    )
  }
  return false
}

/** Samples an edge is searched by for where it meets a surface, per turn or per edge. */
const ROOT_SAMPLES = 64

/** Bisections that close in on a crossing. */
const ROOT_STEPS = 100

/**
 * Where a curve meets a surface: the parameters at which the level changes
 * sign, or touches zero (a tangency, the level's least within `tolerance`),
 * between `from` and `to`; `"inside"` when every sample lies on it — an edge
 * of the surface's own. A quartic (a torus) meets a line no more often than
 * the samples tell apart.
 */
export function curveSurfaceHits(
  trace: Pick<EdgeTrace, "point">,
  from: number,
  to: number,
  s: BrepSurface,
  tolerance: number,
  samples = ROOT_SAMPLES
): number[] | "inside" {
  const level = (t: number) => surfaceLevel(s, trace.point(t)).value
  const ts = Array.from(
    { length: samples + 1 },
    (_, i) => from + ((to - from) * i) / samples
  )
  const fs = ts.map(level)
  if (fs.every((f) => Math.abs(f) <= tolerance)) return "inside"
  const out: number[] = []
  const push = (t: number) => {
    if (!out.some((x) => Math.abs(x - t) <= 1e-12 * Math.max(1, Math.abs(t)))) {
      out.push(t)
    }
  }
  for (let i = 0; i <= samples; i++) {
    if (Math.abs(fs[i]) <= tolerance * 1e-3) {
      push(ts[i])
      continue
    }
    if (
      i < samples &&
      fs[i] * fs[i + 1] < 0 &&
      Math.abs(fs[i + 1]) > tolerance * 1e-3
    ) {
      let lo = ts[i]
      let hi = ts[i + 1]
      let flo = fs[i]
      for (let step = 0; step < ROOT_STEPS && hi !== lo; step++) {
        const m = (lo + hi) / 2
        const fm = level(m)
        if (fm === 0) {
          lo = hi = m
          break
        }
        if (fm * flo > 0) {
          lo = m
          flo = fm
        } else hi = m
      }
      // A swept surface's level jumps where the nearest point of its
      // profile does, far from it: a sign change there is no crossing.
      const t = (lo + hi) / 2
      if (Math.abs(level(t)) <= tolerance * 100) push(t)
      continue
    }
    // A touch: the level's least magnitude between its neighbours, near zero.
    if (i > 0 && i < samples) {
      const a = Math.abs(fs[i - 1])
      const b = Math.abs(fs[i])
      const c = Math.abs(fs[i + 1])
      if (b <= a && b <= c && fs[i - 1] * fs[i] > 0 && fs[i] * fs[i + 1] > 0) {
        let lo = ts[i - 1]
        let hi = ts[i + 1]
        for (let step = 0; step < ROOT_STEPS; step++) {
          const m1 = hi - (hi - lo) / GOLDEN
          const m2 = lo + (hi - lo) / GOLDEN
          if (Math.abs(level(m1)) < Math.abs(level(m2))) hi = m2
          else lo = m1
        }
        const t = (lo + hi) / 2
        if (Math.abs(level(t)) <= tolerance) push(t)
      }
    }
  }
  return out.sort((a, b) => (to > from ? a - b : b - a))
}

const GOLDEN = (1 + Math.sqrt(5)) / 2

/**
 * The point on both surfaces nearest `seed`, where `along · p = sigma`
 * holds too: Newton on the two levels and that plane, which pins a point of
 * their intersection curve by a coordinate along it. Null where the
 * surfaces meet too nearly tangent for it to converge.
 */
export function relaxedOnBoth(
  a: BrepSurface,
  b: BrepSurface,
  seed: Vec3,
  along: Vec3,
  sigma: number
): { point: Vec3; tangent: Vec3 } | null {
  let p = seed
  for (let step = 0; step < RELAX_STEPS; step++) {
    const la = surfaceLevel(a, p)
    const lb = surfaceLevel(b, p)
    const r = [la.value, lb.value, dot3(along, p) - sigma]
    const rows = [la.gradient, lb.gradient, along]
    const det = dot3(rows[0], cross3(rows[1], rows[2]))
    if (!(Math.abs(det) > 1e-12)) return null
    // Cramer's rule on the rows: J δ = r.
    const c0 = cross3(rows[1], rows[2])
    const c1 = cross3(rows[2], rows[0])
    const c2 = cross3(rows[0], rows[1])
    const delta = scale3(
      add3(add3(scale3(c0, r[0]), scale3(c1, r[1])), scale3(c2, r[2])),
      1 / det
    )
    p = sub3(p, delta)
    if (length3(delta) <= 1e-15 * Math.max(1, length3(p))) break
  }
  const tangent = cross3(
    surfaceLevel(a, p).gradient,
    surfaceLevel(b, p).gradient
  )
  return { point: p, tangent }
}

/** Newton converges quadratically from a point of a fitted curve; a few steps do. */
const RELAX_STEPS = 12
