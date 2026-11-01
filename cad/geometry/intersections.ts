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
import { Vec2 } from "./Vec2"
import { arbitraryAxis } from "./ocs"
import {
  BSplineCurve,
  bsplineDomain,
  bsplinePoint,
  conicArcCurve,
  interpolateCubic,
} from "./nurbs"
import { EdgeTrace, splineFirst } from "./brepCurves"
import { PlanarCurve, curveMeetings, curvePoint } from "./planarCurves"
import { curveSurfaceHits, surfaceLevel } from "./surfaces"
import { sweptCurvePoint, turnedAbout } from "./faceDomains"
import type { Box3, BrepSurface, SweptCurve } from "./solids"

/**
 * Where two surfaces meet, in the cases that have a closed form (the brief's
 * phase 4): a plane with a plane, a cylinder, a cone, a sphere, a torus
 * square to its axis or through it, an extrusion or a revolution square to
 * its axis or through it; surfaces turned round one axis (their meridians
 * meet in circles); surfaces drawn along one way (their sections meet in
 * rulings); two cylinders whose axes meet. Every other pair is
 * `"unsupported"`: a general intersection is the brief's phase 7.
 */

/**
 * A curve two surfaces meet in: a whole line (`direction` unit), circle or
 * ellipse, or a spline — a conic's arc that does not close (a parabola's, a
 * hyperbola's branch) cut to the box asked about, a profile carried onto a
 * plane, two cylinders' quartic.
 */
export type SpaceCurve =
  | { readonly kind: "line"; readonly origin: Vec3; readonly direction: Vec3 }
  | {
      readonly kind: "circle"
      readonly center: Vec3
      readonly normal: Vec3
      readonly radius: number
      /** Where its angle starts: its vertex, if nothing cuts it. */
      readonly xAxis: Vec3
    }
  | {
      readonly kind: "ellipse"
      readonly center: Vec3
      readonly normal: Vec3
      readonly majorAxis: Vec3
      readonly ratio: number
    }
  | {
      readonly kind: "spline"
      readonly curve: BSplineCurve
      readonly closed: boolean
    }

export type Meeting = SpaceCurve[] | "unsupported"

/** A space curve's trace on its own parameter, a line's across `box`. */
export function spaceTrace(c: SpaceCurve, box: Box3): EdgeTrace {
  switch (c.kind) {
    case "line": {
      const [t0, t1] = lineSpan(c.origin, c.direction, box)
      return {
        t0,
        t1,
        angular: false,
        point: (t) => add3(c.origin, scale3(c.direction, t)),
        derivative: () => c.direction,
      }
    }
    case "circle":
    case "ellipse": {
      const major =
        c.kind === "circle" ? scale3(c.xAxis, c.radius) : c.majorAxis
      const minor = scale3(
        cross3(c.normal, major),
        c.kind === "circle" ? 1 : c.ratio
      )
      return {
        t0: 0,
        t1: 2 * Math.PI,
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
  }
}

/** Where a line runs through a box, a little past it. */
function lineSpan(o: Vec3, d: Vec3, box: Box3): [number, number] {
  let lo = -Infinity
  let hi = Infinity
  const size = length3(sub3(box.max, box.min))
  for (const k of ["x", "y", "z"] as const) {
    if (Math.abs(d[k]) < 1e-300) continue
    const a = (box.min[k] - o[k]) / d[k]
    const b = (box.max[k] - o[k]) / d[k]
    lo = Math.max(lo, Math.min(a, b))
    hi = Math.min(hi, Math.max(a, b))
  }
  if (!(lo <= hi)) return [0, 0]
  return [lo - 0.01 * size - 1, hi + 0.01 * size + 1]
}

const TURN = 2 * Math.PI

function parallel(a: Vec3, b: Vec3): boolean {
  return length3(cross3(a, b)) <= 1e-12
}

function square(a: Vec3, b: Vec3): boolean {
  return Math.abs(dot3(a, b)) <= 1e-12
}

function circleOf(center: Vec3, normal: Vec3, radius: number): SpaceCurve {
  return {
    kind: "circle",
    center,
    normal,
    radius,
    xAxis: arbitraryAxis(normal)!.x,
  }
}

/** An ellipse by two conjugate semi-diameters, on its principal axes. */
function ellipseOf(center: Vec3, a: Vec3, b: Vec3): SpaceCurve {
  // The angle at which the diameters turn into the axes: tan 2t = 2a·b / (a² − b²).
  const t = 0.5 * Math.atan2(2 * dot3(a, b), dot3(a, a) - dot3(b, b))
  let p = add3(scale3(a, Math.cos(t)), scale3(b, Math.sin(t)))
  let q = add3(scale3(a, -Math.sin(t)), scale3(b, Math.cos(t)))
  if (length3(q) > length3(p)) [p, q] = [q, p]
  const normal = normalize3(cross3(a, b))!
  const ratio = Math.min(1, length3(q) / length3(p))
  if (ratio >= 1 - 1e-12) return circleOf(center, normal, length3(p))
  return { kind: "ellipse", center, normal, majorAxis: p, ratio }
}

/**
 * The surfaces' meeting near `box` (the faces' boxes' overlap), the
 * model's `tolerance` deciding tangency. Equal surfaces are not asked here.
 */
export function surfacesMeet(
  a: BrepSurface,
  b: BrepSurface,
  box: Box3,
  tolerance: number
): Meeting {
  if (a.kind === "plane") return planeMeets(a, b, box, tolerance)
  if (b.kind === "plane") return planeMeets(b, a, box, tolerance)
  const axial = coaxialMeets(a, b, box, tolerance)
  if (axial !== null) return axial
  const ruled = parallelMeets(a, b, box, tolerance)
  if (ruled !== null) return ruled
  if (a.kind === "cylinder" && b.kind === "cylinder") {
    return cylindersMeet(a, b, tolerance)
  }
  return "unsupported"
}

type Plane = Extract<BrepSurface, { kind: "plane" }>

function planeMeets(
  p: Plane,
  s: BrepSurface,
  box: Box3,
  tolerance: number
): Meeting {
  const n = p.normal
  switch (s.kind) {
    case "plane": {
      const d = cross3(n, s.normal)
      const size = length3(d)
      if (size <= 1e-12) return []
      const dir = scale3(d, 1 / size)
      // The point of both nearest the first's origin.
      const c1 = dot3(n, p.origin)
      const c2 = dot3(s.normal, s.origin)
      const k = dot3(n, s.normal)
      const det = 1 - k * k
      const origin = add3(
        scale3(n, (c1 - k * c2) / det),
        scale3(s.normal, (c2 - k * c1) / det)
      )
      return [{ kind: "line", origin, direction: dir }]
    }
    case "sphere": {
      const h = dot3(sub3(s.center, p.origin), n)
      const r2 = s.radius * s.radius - h * h
      if (r2 <= tolerance * tolerance || Math.sqrt(r2) <= tolerance) return []
      return [circleOf(sub3(s.center, scale3(n, h)), n, Math.sqrt(r2))]
    }
    case "cylinder":
    case "cone":
      return planeQuadric(p, s, box, tolerance)
    case "torus": {
      const h = dot3(sub3(p.origin, s.center), s.axis)
      if (parallel(n, s.axis)) {
        const rest = s.minorRadius * s.minorRadius - h * h
        if (rest <= 0 || Math.sqrt(rest) <= tolerance) return []
        const at = add3(s.center, scale3(s.axis, h))
        return [
          s.majorRadius + Math.sqrt(rest),
          s.majorRadius - Math.sqrt(rest),
        ]
          .filter((rho) => rho > tolerance)
          .map((rho) => circleOf(at, s.axis, rho))
      }
      const off = dot3(sub3(s.center, p.origin), n)
      if (square(n, s.axis) && Math.abs(off) <= tolerance) {
        const w = normalize3(cross3(n, s.axis))!
        return [1, -1].map((k) =>
          circleOf(
            add3(s.center, scale3(w, k * s.majorRadius)),
            n,
            s.minorRadius
          )
        )
      }
      return "unsupported"
    }
    case "extrusion": {
      const along = dot3(n, s.direction)
      const c = dot3(n, p.origin)
      // Along the plane within the tolerance over the box: its rulings, as
      // the profile carried onto it would run off to where `along` sends it.
      const reach = length3(sub3(box.max, box.min))
      if (Math.abs(along) * reach > tolerance) {
        // The profile carried along the direction onto the plane: affine.
        const onto = (x: Vec3) =>
          sub3(x, scale3(s.direction, (dot3(n, x) - c) / along))
        const linear = (x: Vec3) =>
          sub3(x, scale3(s.direction, dot3(n, x) / along))
        return [carried(s.profile, onto, linear)]
      }
      return rulings(s.profile, p, s.direction, tolerance)
    }
    case "revolution": {
      if (parallel(n, s.axis)) {
        const level = dot3(sub3(p.origin, s.origin), s.axis)
        const trace = profileTrace(s.profile)
        const hits = curveSurfaceHits(trace, trace.t0, trace.t1, p, tolerance)
        if (hits === "inside") return "unsupported"
        const out: SpaceCurve[] = []
        for (const t of hits) {
          const q = sub3(trace.point(t), s.origin)
          const rho = length3(sub3(q, scale3(s.axis, dot3(q, s.axis))))
          if (rho > tolerance) {
            out.push(
              circleOf(add3(s.origin, scale3(s.axis, level)), s.axis, rho)
            )
          }
        }
        return out
      }
      const off = dot3(sub3(s.origin, p.origin), n)
      if (square(n, s.axis) && Math.abs(off) <= tolerance) {
        const out = profileOut(s.profile, s.origin, s.axis)
        const w = normalize3(cross3(n, s.axis))!
        const turn = Math.atan2(dot3(cross3(out, w), s.axis), dot3(out, w))
        return [turn, turn + Math.PI].map((angle) =>
          carried(
            s.profile,
            (x) => turnedAbout(x, s.origin, s.axis, angle),
            (x) =>
              sub3(
                turnedAbout(add3(s.origin, x), s.origin, s.axis, angle),
                s.origin
              )
          )
        )
      }
      return "unsupported"
    }
  }
}

/** The way out from a revolution's axis to its profile's half-plane. */
function profileOut(profile: SweptCurve, origin: Vec3, axis: Vec3): Vec3 {
  const t = profileTrace(profile)
  let best: Vec3 = arbitraryAxis(axis)!.x
  let reach = 0
  for (let k = 0; k <= 16; k++) {
    const q = sub3(t.point(t.t0 + ((t.t1 - t.t0) * k) / 16), origin)
    const w = sub3(q, scale3(axis, dot3(q, axis)))
    if (length3(w) > reach) {
      reach = length3(w)
      best = scale3(w, 1 / reach)
    }
  }
  return best
}

function profileTrace(c: SweptCurve): EdgeTrace {
  if (c.kind === "ellipse") {
    return {
      t0: 0,
      t1: TURN,
      angular: true,
      point: (t) => sweptCurvePoint(c, t),
      derivative: (t) =>
        add3(
          scale3(c.majorAxis, -Math.sin(t)),
          scale3(c.minorAxis, Math.cos(t))
        ),
    }
  }
  const { start, end } = bsplineDomain(c.curve)
  return {
    t0: start,
    t1: end,
    angular: false,
    point: (t) => bsplinePoint(c.curve, t),
    derivative: (t) => splineFirst(c.curve, t),
  }
}

/** A profile through an affine map (`linear` its linear part): an ellipse's diameters, a spline's points. */
function carried(
  c: SweptCurve,
  map: (p: Vec3) => Vec3,
  linear: (v: Vec3) => Vec3
): SpaceCurve {
  if (c.kind === "ellipse") {
    return ellipseOf(map(c.center), linear(c.majorAxis), linear(c.minorAxis))
  }
  const curve = { ...c.curve, controlPoints: c.curve.controlPoints.map(map) }
  const { start, end } = bsplineDomain(curve)
  const closed =
    length3(sub3(bsplinePoint(curve, start), bsplinePoint(curve, end))) <=
    1e-9 * Math.max(1, ...curve.controlPoints.map(length3))
  return { kind: "spline", curve, closed }
}

/** The lines along `direction` through where the profile crosses the plane. */
function rulings(
  profile: SweptCurve,
  p: Plane,
  direction: Vec3,
  tolerance: number
): Meeting {
  const trace = profileTrace(profile)
  const hits = curveSurfaceHits(trace, trace.t0, trace.t1, p, tolerance)
  if (hits === "inside") return "unsupported"
  const out: SpaceCurve[] = []
  for (const t of hits) {
    const q = trace.point(t)
    if (
      out.some(
        (c) => c.kind === "line" && length3(sub3(c.origin, q)) <= tolerance
      )
    )
      continue
    out.push({ kind: "line", origin: q, direction })
  }
  return out
}

type Quadric = Extract<BrepSurface, { kind: "cylinder" | "cone" }>

/** A cylinder's or a cone's equation, `x² + (y/k)² − r²` or `− (s t)²`, at a point. */
function quadricValue(s: Quadric, p: Vec3): number {
  const d = sub3(p, s.kind === "cylinder" ? s.origin : s.apex)
  const y = cross3(s.axis, s.xAxis)
  const x = dot3(d, s.xAxis)
  const yy = dot3(d, y) / s.ratio
  const r = s.kind === "cylinder" ? s.radius : s.slope * dot3(d, s.axis)
  return x * x + yy * yy - r * r
}

/**
 * A plane through a cylinder or a cone: square to its axis a circle or an
 * ellipse; along a cylinder's, its rulings; through a cone's apex, the lines
 * it holds there; any other way the conic its equation leaves in the plane —
 * an ellipse, or a parabola's or a hyperbola's arcs across the box, as
 * rational quadratic splines. A cone's other nappe is the equation's, not the
 * surface's: the faces' own test leaves what lies there out.
 */
function planeQuadric(
  p: Plane,
  s: Quadric,
  box: Box3,
  tolerance: number
): Meeting {
  const n = p.normal
  const base = s.kind === "cylinder" ? s.origin : s.apex
  const y = cross3(s.axis, s.xAxis)
  if (parallel(n, s.axis)) {
    const h = dot3(sub3(p.origin, base), s.axis)
    const r = s.kind === "cylinder" ? s.radius : s.slope * h
    if (!(r > tolerance)) return []
    const at = add3(base, scale3(s.axis, h))
    return [ellipseOf(at, scale3(s.xAxis, r), scale3(y, r * s.ratio))]
  }
  const axes = arbitraryAxis(n)!
  const size = Math.max(1, length3(sub3(box.max, box.min)))
  const o = add3(
    p.origin,
    add3(
      scale3(axes.x, dot3(sub3(base, p.origin), axes.x)),
      scale3(axes.y, dot3(sub3(base, p.origin), axes.y))
    )
  )
  const at = (u: number, v: number) =>
    add3(o, add3(scale3(axes.x, u * size), scale3(axes.y, v * size)))
  const Q = (u: number, v: number) => quadricValue(s, at(u, v)) / (size * size)
  // Its restriction to the plane is a quadratic in (u, v): six values fix it.
  const f = Q(0, 0)
  const a = (Q(1, 0) + Q(-1, 0)) / 2 - f
  const dx = (Q(1, 0) - Q(-1, 0)) / 4
  const c = (Q(0, 1) + Q(0, -1)) / 2 - f
  const ey = (Q(0, 1) - Q(0, -1)) / 4
  const b = (Q(1, 1) - a - c - 2 * dx - 2 * ey - f) / 2
  const to3 = (q: Vec2) => at(q.x, q.y)
  const vec3 = (q: Vec2) =>
    add3(scale3(axes.x, q.x * size), scale3(axes.y, q.y * size))
  const tol = tolerance / size
  return conicCurves(a, b, c, dx, ey, f, tol).map((curve) =>
    lift(curve, to3, vec3, n)
  )
}

/** A conic of the plane's own coordinates, before it is carried into space. */
type FlatConic =
  | {
      readonly kind: "ellipse"
      readonly center: Vec2
      readonly a: Vec2
      readonly b: Vec2
    }
  | { readonly kind: "line"; readonly origin: Vec2; readonly direction: Vec2 }
  | {
      readonly kind: "spline"
      readonly points: Vec2[]
      readonly weights: number[]
    }

function lift(
  c: FlatConic,
  to3: (q: Vec2) => Vec3,
  vec3: (q: Vec2) => Vec3,
  normal: Vec3
): SpaceCurve {
  void normal
  switch (c.kind) {
    case "ellipse":
      return ellipseOf(to3(c.center), vec3(c.a), vec3(c.b))
    case "line":
      return {
        kind: "line",
        origin: to3(c.origin),
        direction: normalize3(vec3(c.direction))!,
      }
    case "spline": {
      const spans = (c.points.length - 1) / 2
      const knots = [0, 0, 0]
      for (let i = 1; i < spans; i++) knots.push(i, i)
      knots.push(spans, spans, spans)
      return {
        kind: "spline",
        curve: {
          degree: 2,
          knots,
          controlPoints: c.points.map(to3),
          weights: c.weights,
        },
        closed: false,
      }
    }
  }
}

/** How far a hyperbola's or a parabola's arcs are drawn, the box's own size being 1. */
const CONIC_REACH = 2

/**
 * The real curves of `a u² + 2b uv + c v² + 2d u + 2e v + f = 0`, its
 * coefficients scaled so the box is about a unit: an ellipse; a hyperbola's
 * two branches or its two lines; a parabola, or its parallel lines; nothing
 * where it is imaginary or a single touching point.
 */
function conicCurves(
  a: number,
  b: number,
  c: number,
  d: number,
  e: number,
  f: number,
  tolerance: number
): FlatConic[] {
  const scale = Math.max(Math.abs(a), Math.abs(b), Math.abs(c))
  if (!(scale > 0)) return []
  ;[a, b, c, d, e, f] = [a, b, c, d, e, f].map((x) => x / scale)
  // The quadratic form's axes: eigenvalues λ1 ≥ λ2 along v1, v2.
  const mean = (a + c) / 2
  const spread = Math.hypot((a - c) / 2, b)
  const l1 = mean + spread
  const l2 = mean - spread
  const angle = 0.5 * Math.atan2(2 * b, a - c)
  const v1 = { x: Math.cos(angle), y: Math.sin(angle) }
  const v2 = { x: -v1.y, y: v1.x }
  const det = l1 * l2
  if (Math.abs(det) > 1e-10) {
    const cu = (-d * c + e * b) / (a * c - b * b)
    const cv = (-a * e + b * d) / (a * c - b * b)
    const center = { x: cu, y: cv }
    const f0 = f + d * cu + e * cv
    if (det > 0) {
      if (Math.abs(f0) <= tolerance * Math.abs(l1)) return []
      if (f0 * l1 > 0) return []
      const ra = Math.sqrt(-f0 / l1)
      const rb = Math.sqrt(-f0 / l2)
      return [
        {
          kind: "ellipse",
          center,
          a: { x: v1.x * ra, y: v1.y * ra },
          b: { x: v2.x * rb, y: v2.y * rb },
        },
      ]
    }
    if (Math.abs(f0) <= tolerance * tolerance) {
      // Two lines through the centre, where λ1 x² + λ2 y² = 0.
      const k = Math.sqrt(-l1 / l2)
      return [1, -1].map((s) => ({
        kind: "line" as const,
        origin: center,
        direction: {
          x: v1.x + s * k * v2.x,
          y: v1.y + s * k * v2.y,
        },
      }))
    }
    // A hyperbola, its branches opening along the axis whose term f0 opposes.
    const [p, q, lp, lq] = f0 * l1 < 0 ? [v1, v2, l1, l2] : [v2, v1, l2, l1]
    const ra = Math.sqrt(-f0 / lp)
    const rb = Math.sqrt(f0 / lq)
    const reach = Math.asinh(CONIC_REACH / Math.min(ra, rb)) + 1
    return [1, -1].map((side) =>
      hyperbolaArc(center, scale2(p, side * ra), scale2(q, rb), reach)
    )
  }
  // A parabola: one eigenvalue vanishes, along w; x along the other.
  const [x, w, lx] = Math.abs(l1) >= Math.abs(l2) ? [v1, v2, l1] : [v2, v1, l2]
  const dx = d * x.x + e * x.y
  const dw = d * w.x + e * w.y
  if (Math.abs(dw) <= tolerance) {
    // Parallel lines: lx s² + 2 dx s + f = 0.
    const disc = dx * dx - lx * f
    if (disc < 0) return []
    const roots =
      disc <= tolerance * tolerance
        ? [-dx / lx]
        : [(-dx + Math.sqrt(disc)) / lx, (-dx - Math.sqrt(disc)) / lx]
    return roots.map((s) => ({
      kind: "line" as const,
      origin: { x: x.x * s, y: x.y * s },
      direction: w,
    }))
  }
  // t = −(lx s² + 2 dx s + f) / (2 dw) along w, s along x.
  const vertex = -dx / lx
  const at = (s: number) => {
    const t = -(lx * s * s + 2 * dx * s + f) / (2 * dw)
    return { x: x.x * s + w.x * t, y: x.y * s + w.y * t }
  }
  const slope = (s: number) => -(2 * lx * s + 2 * dx) / (2 * dw)
  const spans = 8
  const lo = vertex - CONIC_REACH * 2
  const hi = vertex + CONIC_REACH * 2
  const points: Vec2[] = [at(lo)]
  const weights = [1]
  for (let i = 0; i < spans; i++) {
    const s0 = lo + ((hi - lo) * i) / spans
    const s1 = lo + ((hi - lo) * (i + 1)) / spans
    const m = (s0 + s1) / 2
    // The tangents' meeting over the middle: t(s0) + t′(s0)(m − s0).
    const t0 = -(lx * s0 * s0 + 2 * dx * s0 + f) / (2 * dw)
    const tm = t0 + slope(s0) * (m - s0)
    points.push({ x: x.x * m + w.x * tm, y: x.y * m + w.y * tm }, at(s1))
    weights.push(1, 1)
  }
  return [{ kind: "spline", points, weights }]
}

function scale2(v: Vec2, k: number): Vec2 {
  return { x: v.x * k, y: v.y * k }
}

/**
 * The branch `center + a cosh τ + b sinh τ` for |τ| ≤ `reach`, as rational
 * quadratic spans: each span's middle point the tangents' meeting,
 * `(a cosh m + b sinh m) / cosh h`, of weight `cosh h`.
 */
function hyperbolaArc(
  center: Vec2,
  a: Vec2,
  b: Vec2,
  reach: number
): FlatConic {
  const spans = Math.max(4, Math.ceil((2 * reach) / 0.5))
  const step = (2 * reach) / spans
  const h = step / 2
  const at = (t: number, k: number) => ({
    x: center.x + k * (a.x * Math.cosh(t) + b.x * Math.sinh(t)),
    y: center.y + k * (a.y * Math.cosh(t) + b.y * Math.sinh(t)),
  })
  const toCenter = (q: Vec2) => ({ x: q.x - center.x, y: q.y - center.y })
  void toCenter
  const points: Vec2[] = [at(-reach, 1)]
  const weights = [1]
  for (let i = 0; i < spans; i++) {
    const m = -reach + step * (i + 0.5)
    const mid = at(m, 1 / Math.cosh(h))
    // `at(m, k)` scales the offset from the centre, not the point.
    const p = {
      x: center.x + (mid.x - center.x),
      y: center.y + (mid.y - center.y),
    }
    points.push(p, at(-reach + step * (i + 1), 1))
    weights.push(Math.cosh(h), 1)
  }
  return { kind: "spline", points, weights }
}

/** A surface's axis, when it is one turned round a line: a sphere's is any through its centre. */
function turnedAxis(
  s: BrepSurface
): { origin: Vec3; axis: Vec3 } | "any" | null {
  switch (s.kind) {
    case "cylinder":
      return s.ratio === 1 ? { origin: s.origin, axis: s.axis } : null
    case "cone":
      return s.ratio === 1 ? { origin: s.apex, axis: s.axis } : null
    case "torus":
      return { origin: s.center, axis: s.axis }
    case "revolution":
      return { origin: s.origin, axis: s.axis }
    case "sphere":
      return "any"
    default:
      return null
  }
}

/**
 * Two surfaces turned round one axis meet in circles: their meridians, in
 * the half-plane of `(ρ, h)` off the axis, meet where the circles lie (a
 * sphere's axis is any through its centre). Null when they share no axis.
 */
function coaxialMeets(
  a: BrepSurface,
  b: BrepSurface,
  box: Box3,
  tolerance: number
): Meeting | null {
  let ax = turnedAxis(a)
  let bx = turnedAxis(b)
  if (ax === null || bx === null) return null
  if (ax === "any" && bx === "any") {
    const s1 = a as Extract<BrepSurface, { kind: "sphere" }>
    const s2 = b as Extract<BrepSurface, { kind: "sphere" }>
    const d = sub3(s2.center, s1.center)
    const axis = normalize3(d)
    if (!axis) return []
    ax = bx = { origin: s1.center, axis }
  } else if (ax === "any") {
    const s1 = a as Extract<BrepSurface, { kind: "sphere" }>
    const other = bx as { origin: Vec3; axis: Vec3 }
    if (!onAxis(s1.center, other, tolerance)) return null
    ax = other
  } else if (bx === "any") {
    const s2 = b as Extract<BrepSurface, { kind: "sphere" }>
    if (!onAxis(s2.center, ax, tolerance)) return null
    bx = ax
  }
  const one = ax as { origin: Vec3; axis: Vec3 }
  const two = bx as { origin: Vec3; axis: Vec3 }
  if (!parallel(one.axis, two.axis) || !onAxis(two.origin, one, tolerance)) {
    return null
  }
  const frame = { origin: one.origin, axis: one.axis }
  const out = arbitraryAxis(frame.axis)!.x
  const reach = length3(sub3(box.max, box.min)) + 1
  const centre = (box.min.x + box.max.x) / 2
  void centre
  const middle = scale3(add3(box.min, box.max), 0.5)
  const hMid = dot3(sub3(middle, frame.origin), frame.axis)
  const ma = meridian(a, frame, out, hMid, reach)
  const mb = meridian(b, frame, out, hMid, reach)
  if (ma === null || mb === null) return "unsupported"
  const circles: SpaceCurve[] = []
  for (const ca of ma) {
    for (const cb of mb) {
      const { meetings, overlaps } = curveMeetings(ca, cb)
      if (overlaps.length > 0) return "unsupported"
      for (const m of meetings) {
        const q = curvePoint(ca, m.s)
        if (!(q.x > tolerance)) continue
        if (
          circles.some(
            (c) =>
              c.kind === "circle" &&
              Math.abs(c.radius - q.x) <= tolerance &&
              length3(
                sub3(c.center, add3(frame.origin, scale3(frame.axis, q.y)))
              ) <= tolerance
          )
        )
          continue
        circles.push(
          circleOf(add3(frame.origin, scale3(frame.axis, q.y)), frame.axis, q.x)
        )
      }
    }
  }
  return circles
}

function onAxis(
  p: Vec3,
  line: { origin: Vec3; axis: Vec3 },
  tolerance: number
): boolean {
  const d = sub3(p, line.origin)
  return length3(sub3(d, scale3(line.axis, dot3(d, line.axis)))) <= tolerance
}

/** A turned surface's meridian in `(ρ, h)`: `h` along the frame's axis, ρ out from it towards `out`. */
function meridian(
  s: BrepSurface,
  frame: { origin: Vec3; axis: Vec3 },
  out: Vec3,
  hMid: number,
  reach: number
): PlanarCurve[] | null {
  const h = (p: Vec3) => dot3(sub3(p, frame.origin), frame.axis)
  switch (s.kind) {
    case "cylinder":
      return [
        {
          kind: "line",
          start: { x: s.radius, y: hMid - reach },
          end: { x: s.radius, y: hMid + reach },
        },
      ]
    case "cone": {
      const tip = h(s.apex)
      const up = dot3(s.axis, frame.axis)
      return [
        {
          kind: "line",
          start: { x: 0, y: tip },
          end: { x: s.slope * 2 * reach, y: tip + up * 2 * reach },
        },
      ]
    }
    case "sphere":
      return [
        {
          kind: "arc",
          center: { x: 0, y: h(s.center) },
          radius: s.radius,
          startAngle: -Math.PI / 2,
          sweep: Math.PI,
        },
      ]
    case "torus":
      return [
        {
          kind: "arc",
          center: { x: s.majorRadius, y: h(s.center) },
          radius: s.minorRadius,
          startAngle: 0,
          sweep: TURN,
        },
      ]
    case "revolution": {
      const e = profileOut(s.profile, frame.origin, frame.axis)
      void out
      const curve =
        s.profile.kind === "spline"
          ? s.profile.curve
          : conicArcCurve(
              s.profile.center,
              s.profile.majorAxis,
              s.profile.minorAxis,
              0,
              TURN
            )
      const flat: BSplineCurve = {
        ...curve,
        controlPoints: curve.controlPoints.map((p) => ({
          x: dot3(sub3(p, frame.origin), e),
          y: h(p),
          z: 0,
        })),
      }
      const { start, end } = bsplineDomain(flat)
      return [{ kind: "spline", curve: flat, from: start, to: end }]
    }
    default:
      return null
  }
}

/** A surface drawn along one way, and its section across it. */
function sectionOf(
  s: BrepSurface,
  frame: { origin: Vec3; x: Vec3; y: Vec3; d: Vec3 }
): PlanarCurve | null {
  const flat = (p: Vec3): Vec3 => {
    const q = sub3(p, frame.origin)
    return { x: dot3(q, frame.x), y: dot3(q, frame.y), z: 0 }
  }
  // Along the way, to the section's plane: a point slides back by its height.
  const drop = (p: Vec3) =>
    flat(
      sub3(
        p,
        scale3(
          frame.d,
          dot3(sub3(p, frame.origin), frame.d) / dot3(frame.d, frame.d)
        )
      )
    )
  if (s.kind === "cylinder") {
    const y = cross3(s.axis, s.xAxis)
    const c = drop(s.origin)
    const a = flat(add3(frame.origin, scale3(s.xAxis, s.radius)))
    const b = flat(add3(frame.origin, scale3(y, s.radius * s.ratio)))
    const e = ellipseOf({ x: c.x, y: c.y, z: 0 }, a, b)
    if (e.kind === "circle") {
      return {
        kind: "arc",
        center: { x: c.x, y: c.y },
        radius: e.radius,
        startAngle: 0,
        sweep: TURN,
      }
    }
    if (e.kind !== "ellipse") return null
    return {
      kind: "ellipse",
      center: { x: c.x, y: c.y },
      majorAxis: { x: e.majorAxis.x, y: e.majorAxis.y },
      ratio: e.ratio,
      startParam: 0,
      sweep: e.normal.z >= 0 ? TURN : -TURN,
    }
  }
  if (s.kind === "extrusion") {
    const curve =
      s.profile.kind === "spline"
        ? s.profile.curve
        : conicArcCurve(
            s.profile.center,
            s.profile.majorAxis,
            s.profile.minorAxis,
            0,
            TURN
          )
    const section: BSplineCurve = {
      ...curve,
      controlPoints: curve.controlPoints.map(drop),
    }
    const { start, end } = bsplineDomain(section)
    return { kind: "spline", curve: section, from: start, to: end }
  }
  return null
}

/**
 * Two surfaces drawn along one way — cylinders, extrusions — meet in
 * rulings: lines that way through where their sections across it meet. Null
 * when they are not both so, or not the same way.
 */
function parallelMeets(
  a: BrepSurface,
  b: BrepSurface,
  box: Box3,
  tolerance: number
): Meeting | null {
  const way = (s: BrepSurface) =>
    s.kind === "cylinder" ? s.axis : s.kind === "extrusion" ? s.direction : null
  const da = way(a)
  const db = way(b)
  if (!da || !db || !parallel(da, db)) return null
  const axes = arbitraryAxis(da)!
  const origin = scale3(add3(box.min, box.max), 0.5)
  const frame = { origin, x: axes.x, y: axes.y, d: da }
  const sa = sectionOf(a, frame)
  const sb = sectionOf(b, frame)
  if (!sa || !sb) return "unsupported"
  const { meetings, overlaps } = curveMeetings(sa, sb)
  if (overlaps.length > 0) return "unsupported"
  const out: SpaceCurve[] = []
  for (const m of meetings) {
    const q = curvePoint(sa, m.s)
    const at = add3(origin, add3(scale3(axes.x, q.x), scale3(axes.y, q.y)))
    if (
      out.some(
        (c) => c.kind === "line" && length3(sub3(c.origin, at)) <= tolerance
      )
    )
      continue
    out.push({ kind: "line", origin: at, direction: da })
  }
  return out
}

type Cylinder = Extract<BrepSurface, { kind: "cylinder" }>

/** Points a quartic of two cylinders is fitted through, round each of its loops. */
const QUARTIC_POINTS = 64

/**
 * Two cylinders whose axes cross: of one radius, the two ellipses in the
 * planes that halve the angle between the axes (union/k06's tee, 7.0711 by
 * 5); else, the thinner one passing through the thicker, two loops round it,
 * each a periodic cubic through points of the quartic on the thinner one's
 * angle — `h(θ)` along its axis where the thicker one's equation holds — as
 * ACIS approximates it by a cubic (union/k05's, 66 control points). Elliptical
 * ones, and axes that miss each other, are unsupported.
 */
function cylindersMeet(a: Cylinder, b: Cylinder, tolerance: number): Meeting {
  if (a.ratio !== 1 || b.ratio !== 1) return "unsupported"
  const n = cross3(a.axis, b.axis)
  const size = length3(n)
  if (size <= 1e-12) return "unsupported"
  const gap = dot3(sub3(b.origin, a.origin), n) / size
  if (Math.abs(gap) > tolerance) return "unsupported"
  // Where the axes cross.
  const w = sub3(b.origin, a.origin)
  const k = dot3(a.axis, b.axis)
  const ta = (dot3(w, a.axis) - k * dot3(w, b.axis)) / (1 - k * k)
  const c = add3(a.origin, scale3(a.axis, ta))
  if (Math.abs(a.radius - b.radius) <= tolerance) {
    const out: SpaceCurve[] = []
    for (const normal of [sub3(a.axis, b.axis), add3(a.axis, b.axis)]) {
      const m = normalize3(normal)
      if (!m) continue
      const section = planeQuadric(
        { kind: "plane", origin: c, normal: m },
        a,
        {
          min: sub3(c, { x: a.radius * 4, y: a.radius * 4, z: a.radius * 4 }),
          max: add3(c, { x: a.radius * 4, y: a.radius * 4, z: a.radius * 4 }),
        },
        tolerance
      )
      if (section === "unsupported") return section
      out.push(...section)
    }
    return out
  }
  const [thin, thick] = a.radius < b.radius ? [a, b] : [b, a]
  const y = cross3(thin.axis, thin.xAxis)
  const beta = dot3(thin.axis, thick.axis)
  const r1 = thick.radius
  const r2 = thin.radius
  const loops: SpaceCurve[] = []
  for (const side of [1, -1]) {
    const at = (theta: number) => {
      const round = add3(
        scale3(thin.xAxis, r2 * Math.cos(theta)),
        scale3(y, r2 * Math.sin(theta))
      )
      const wa = dot3(round, thick.axis)
      const disc = wa * wa + (1 - beta * beta) * (r1 * r1 - r2 * r2)
      const h =
        (wa * beta + side * Math.sqrt(Math.max(0, disc))) / (1 - beta * beta)
      return add3(c, add3(round, scale3(thin.axis, h)))
    }
    const points = Array.from({ length: QUARTIC_POINTS + 1 }, (_, i) =>
      at((TURN * i) / QUARTIC_POINTS)
    )
    // Parameters by the chords, as ACIS's run along its length; the ends
    // meet with the curve's own tangent, a unit one on that parameter.
    const params = [0]
    for (let i = 1; i <= QUARTIC_POINTS; i++) {
      params.push(params[i - 1] + length3(sub3(points[i], points[i - 1])))
    }
    const h = 1e-6
    const tangent = normalize3(sub3(at(h), at(-h)))!
    points[QUARTIC_POINTS] = points[0]
    loops.push({
      kind: "spline",
      curve: interpolateCubic(points, params, tangent, tangent),
      closed: true,
    })
  }
  return loops
}

/** Whether a point lies on both surfaces, within `tolerance`. */
export function onBoth(
  a: BrepSurface,
  b: BrepSurface,
  p: Vec3,
  tolerance: number
): boolean {
  return (
    Math.abs(surfaceLevel(a, p).value) <= tolerance &&
    Math.abs(surfaceLevel(b, p).value) <= tolerance
  )
}
