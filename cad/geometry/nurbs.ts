import { V } from "./Vec2"
import { Vec3, add3, length3, scale3, sub3 } from "./Vec3"

/**
 * A B-spline in space: `knots.length === controlPoints.length + degree + 1`.
 * A planar curve's control points share one Z.
 * Its domain is `[knots[degree], knots[knots.length - degree - 1]]`, so one
 * shape serves the clamped curves (whose ends are their first and last control
 * points) and the periodic ones (whose control points wrap round).
 */
export interface BSplineCurve {
  readonly degree: number
  readonly knots: readonly number[]
  readonly controlPoints: readonly Vec3[]
  /** One positive weight per control point: a rational curve (DXF 41). Absent, every weight is 1. */
  readonly weights?: readonly number[]
}

const ZERO: Vec3 = { x: 0, y: 0, z: 0 }

/** AutoCAD's knot parameterizations (SPLKNOTS 0, 1, 2). */
export type KnotParameterization = "chord" | "sqrtChord" | "uniform"

export function bsplineDomain(curve: BSplineCurve): {
  readonly start: number
  readonly end: number
} {
  return {
    start: curve.knots[curve.degree],
    end: curve.knots[curve.knots.length - curve.degree - 1],
  }
}

/** The knot span holding `u`: `knots[span] <= u < knots[span + 1]`, clamped to the domain. */
function findSpan(curve: BSplineCurve, u: number): number {
  const { degree: p, knots } = curve
  const last = knots.length - p - 2
  if (u >= knots[last + 1]) {
    let span = last
    while (span > p && knots[span] >= knots[span + 1]) span--
    return span
  }
  if (u <= knots[p]) {
    let span = p
    while (span < last && knots[span] >= knots[span + 1]) span++
    return span
  }
  let low = p
  let high = last + 1
  while (high - low > 1) {
    const mid = (low + high) >> 1
    if (u < knots[mid]) high = mid
    else low = mid
  }
  return low
}

/** The `degree + 1` basis functions that are non-zero on `span`, at `u` (Piegl & Tiller A2.2). */
function basisFunctions(
  curve: BSplineCurve,
  span: number,
  u: number
): number[] {
  const { degree: p, knots } = curve
  const values = [1]
  const left: number[] = []
  const right: number[] = []
  for (let j = 1; j <= p; j++) {
    left[j] = u - knots[span + 1 - j]
    right[j] = knots[span + j] - u
    let saved = 0
    for (let r = 0; r < j; r++) {
      const denominator = right[r + 1] + left[j - r]
      const temp = denominator === 0 ? 0 : values[r] / denominator
      values[r] = saved + right[r + 1] * temp
      saved = left[j - r] * temp
    }
    values[j] = saved
  }
  return values
}

export function bsplinePoint(curve: BSplineCurve, u: number): Vec3 {
  const span = findSpan(curve, u)
  const basis = basisFunctions(curve, span, u)
  const { weights } = curve
  let x = 0
  let y = 0
  let z = 0
  let w = 0
  for (let j = 0; j <= curve.degree; j++) {
    const i = span - curve.degree + j
    const point = curve.controlPoints[i]
    const b = weights ? basis[j] * weights[i] : basis[j]
    x += b * point.x
    y += b * point.y
    z += b * point.z
    w += b
  }
  return weights ? { x: x / w, y: y / w, z: z / w } : { x, y, z }
}

/** The hodograph: a curve one degree lower whose points are this one's derivative. */
export function bsplineDerivativeCurve(curve: BSplineCurve): BSplineCurve {
  const { degree: p, knots, controlPoints } = curve
  if (p === 0) {
    return {
      degree: 0,
      knots,
      controlPoints: controlPoints.map(() => ZERO),
    }
  }
  const points: Vec3[] = []
  for (let i = 0; i < controlPoints.length - 1; i++) {
    const span = knots[i + p + 1] - knots[i + 1]
    points.push(
      span === 0
        ? ZERO
        : scale3(sub3(controlPoints[i + 1], controlPoints[i]), p / span)
    )
  }
  return { degree: p - 1, knots: knots.slice(1, -1), controlPoints: points }
}

export function bsplineDerivative(curve: BSplineCurve, u: number): Vec3 {
  return bsplineDifferentials(curve).first(u)
}

/** The curve's first and second derivatives by its parameter. */
export interface BSplineDifferentials {
  first(u: number): Vec3
  second(u: number): Vec3
}

/**
 * A non-rational curve's derivatives are its hodographs'; a rational one's
 * come from its homogeneous form (Piegl & Tiller §4.5): C = A / W, with
 * A = Σ N·w·P and W = Σ N·w, so C′ = (A′ − W′C) / W and
 * C″ = (A″ − 2W′C′ − W″C) / W.
 */
export function bsplineDifferentials(
  curve: BSplineCurve
): BSplineDifferentials {
  const { weights } = curve
  if (!weights) {
    const d1 = bsplineDerivativeCurve(curve)
    const d2 = bsplineDerivativeCurve(d1)
    return {
      first: (u) => bsplinePoint(d1, u),
      second: (u) => bsplinePoint(d2, u),
    }
  }
  const { degree, knots } = curve
  const numerator: BSplineCurve = {
    degree,
    knots,
    controlPoints: curve.controlPoints.map((p, i) => scale3(p, weights[i])),
  }
  const weight: BSplineCurve = {
    degree,
    knots,
    controlPoints: weights.map((w) => ({ x: w, y: 0, z: 0 })),
  }
  const a1 = bsplineDerivativeCurve(numerator)
  const a2 = bsplineDerivativeCurve(a1)
  const w1 = bsplineDerivativeCurve(weight)
  const w2 = bsplineDerivativeCurve(w1)
  const first = (u: number): Vec3 => {
    const c = bsplinePoint(curve, u)
    const w = bsplinePoint(weight, u).x
    const dw = bsplinePoint(w1, u).x
    return scale3(sub3(bsplinePoint(a1, u), scale3(c, dw)), 1 / w)
  }
  return {
    first,
    second: (u) => {
      const c = bsplinePoint(curve, u)
      const w = bsplinePoint(weight, u).x
      const dw = bsplinePoint(w1, u).x
      const ddw = bsplinePoint(w2, u).x
      const pushed = add3(scale3(first(u), 2 * dw), scale3(c, ddw))
      return scale3(sub3(bsplinePoint(a2, u), pushed), 1 / w)
    },
  }
}

/** The distinct knot values inside the domain, ends included: where the polynomial pieces meet. */
export function bsplineBreakpoints(curve: BSplineCurve): number[] {
  const { start, end } = bsplineDomain(curve)
  const breaks = [start]
  for (const knot of curve.knots) {
    if (knot > breaks[breaks.length - 1] && knot < end) breaks.push(knot)
  }
  if (end > start) breaks.push(end)
  return breaks
}

/**
 * Parameters for the curve and the points on it, subdividing each polynomial
 * piece until every chord's midpoint lies within `tolerance` of the curve in
 * space, so the chords follow it seen from any side.
 * The depth is capped: a curve with a cusp would otherwise halve for ever.
 */
export function bsplineTessellation(
  curve: BSplineCurve,
  tolerance: number
): { readonly params: number[]; readonly points: Vec3[] } {
  const breaks = bsplineBreakpoints(curve)
  const params = [breaks[0]]
  const points = [bsplinePoint(curve, breaks[0])]
  const tol = Math.max(tolerance, 1e-12)
  const refine = (a: number, pa: Vec3, b: number, pb: Vec3, depth: number) => {
    const m = (a + b) / 2
    const pm = bsplinePoint(curve, m)
    const q1 = bsplinePoint(curve, (a + m) / 2)
    const q3 = bsplinePoint(curve, (m + b) / 2)
    const flat =
      distanceToChord(pm, pa, pb) <= tol &&
      distanceToChord(q1, pa, pb) <= tol &&
      distanceToChord(q3, pa, pb) <= tol
    if (
      depth >= MAX_TESSELLATION_DEPTH ||
      (depth >= MIN_TESSELLATION_DEPTH && flat)
    ) {
      params.push(b)
      points.push(pb)
      return
    }
    refine(a, pa, m, pm, depth + 1)
    refine(m, pm, b, pb, depth + 1)
  }
  for (let i = 1; i < breaks.length; i++) {
    refine(
      breaks[i - 1],
      points[points.length - 1],
      breaks[i],
      bsplinePoint(curve, breaks[i]),
      0
    )
  }
  return { params, points }
}

/** Every piece is split at least into 4 chords, so a flat-looking sample cannot hide a bulge. */
const MIN_TESSELLATION_DEPTH = 2
/** 2¹² chords per piece is past any screen's resolution; deeper only chases a cusp. */
const MAX_TESSELLATION_DEPTH = 12

function distanceToChord(p: Vec3, a: Vec3, b: Vec3): number {
  const ab = sub3(b, a)
  const ap = sub3(p, a)
  const lengthSq = ab.x * ab.x + ab.y * ab.y + ab.z * ab.z
  if (lengthSq < 1e-24) return length3(ap)
  const t = Math.max(
    0,
    Math.min(1, (ap.x * ab.x + ap.y * ab.y + ap.z * ab.z) / lengthSq)
  )
  return length3(sub3(p, add3(a, scale3(ab, t))))
}

/**
 * The 16-point Gauss–Legendre rule on [−1, 1]: exact for a polynomial up to
 * degree 31, so for the area swept by a polynomial piece of any degree
 * SPLINE takes (2 × 10 − 1). Nodes by Newton on P₁₆ from Chebyshev's guesses.
 */
const GAUSS = ((n: number) => {
  const nodes: number[] = []
  const weights: number[] = []
  for (let i = 0; i < n; i++) {
    let x = Math.cos((Math.PI * (i + 0.75)) / (n + 0.5))
    let slope = 1
    for (let step = 0; step < 100; step++) {
      let p0 = 1
      let p1 = x
      for (let k = 2; k <= n; k++) {
        const p2 = ((2 * k - 1) * x * p1 - (k - 1) * p0) / k
        p0 = p1
        p1 = p2
      }
      slope = (n * (x * p1 - p0)) / (x * x - 1)
      const next = x - p1 / slope
      const done = Math.abs(next - x) < 1e-16
      x = next
      if (done) break
    }
    nodes.push(x)
    weights.push(2 / ((1 - x * x) * slope * slope))
  }
  return { nodes, weights }
})(16)

/** `∫ f` over `[a, b]` by {@link GAUSS}. */
function gauss(f: (u: number) => number, a: number, b: number): number {
  const half = (b - a) / 2
  const middle = (a + b) / 2
  let sum = 0
  for (let i = 0; i < GAUSS.nodes.length; i++) {
    sum += GAUSS.weights[i] * f(middle + half * GAUSS.nodes[i])
  }
  return sum * half
}

/** The pieces of `[from, to]` that lie on one polynomial piece of the curve each. */
function pieces(curve: BSplineCurve, from: number, to: number): number[] {
  const cuts = [from]
  for (const knot of bsplineBreakpoints(curve)) {
    if (knot > from && knot < to) cuts.push(knot)
  }
  cuts.push(to)
  return cuts
}

/**
 * The length of the curve from `from` to `to`, by Gauss on each polynomial
 * piece, halved until the halves agree. The speed is a square root, no
 * polynomial, so no rule is exact; a cusp (zero speed) converges slowly,
 * hence the cap.
 */
export function bsplineLength(
  curve: BSplineCurve,
  from: number = bsplineDomain(curve).start,
  to: number = bsplineDomain(curve).end
): number {
  if (!(to > from)) return 0
  const { first } = bsplineDifferentials(curve)
  const speed = (u: number) => length3(first(u))
  const adaptive = (
    a: number,
    b: number,
    whole: number,
    depth: number
  ): number => {
    const m = (a + b) / 2
    const left = gauss(speed, a, m)
    const right = gauss(speed, m, b)
    if (
      depth >= MAX_LENGTH_HALVINGS ||
      Math.abs(left + right - whole) <= 1e-14 * Math.max(whole, 1e-300)
    ) {
      return left + right
    }
    return adaptive(a, m, left, depth + 1) + adaptive(m, b, right, depth + 1)
  }
  const cuts = pieces(curve, from, to)
  let length = 0
  for (let i = 1; i < cuts.length; i++) {
    const a = cuts[i - 1]
    const b = cuts[i]
    length += adaptive(a, b, gauss(speed, a, b), 0)
  }
  return length
}

/** Halvings of one polynomial piece when measuring its length: 2¹⁰ sub-pieces is past a double's precision but for a cusp. */
const MAX_LENGTH_HALVINGS = 10

/**
 * The parameter `length` along the curve from its start, clamped to the
 * domain: Newton on the arc length within the piece that holds it, kept
 * inside a shrinking bracket.
 */
export function bsplineParamAtLength(
  curve: BSplineCurve,
  length: number
): number {
  const { start, end } = bsplineDomain(curve)
  if (!(length > 0)) return start
  const { first } = bsplineDifferentials(curve)
  const cuts = pieces(curve, start, end)
  let walked = 0
  for (let i = 1; i < cuts.length; i++) {
    const a = cuts[i - 1]
    const b = cuts[i]
    const piece = bsplineLength(curve, a, b)
    if (walked + piece < length && i < cuts.length - 1) {
      walked += piece
      continue
    }
    const target = length - walked
    if (target >= piece) return b
    let low = a
    let high = b
    let u = a + ((b - a) * target) / piece
    for (let step = 0; step < MAX_LENGTH_STEPS; step++) {
      const miss = bsplineLength(curve, a, u) - target
      if (Math.abs(miss) <= 1e-13 * Math.max(piece, 1e-300)) break
      if (miss > 0) high = u
      else low = u
      const speed = length3(first(u))
      const next = speed > 0 ? u - miss / speed : NaN
      u = next > low && next < high ? next : (low + high) / 2
    }
    return u
  }
  return end
}

/** Newton converges in a handful of steps; the rest are bisections near a cusp. */
const MAX_LENGTH_STEPS = 60

/**
 * The curve's length, and the parameter at any distance along it, for many
 * distances at once: a table of each polynomial piece cut in
 * {@link LENGTH_TABLE_PARTS} parts, each measured as {@link bsplineLength}
 * does; inside the part that holds a distance, at most
 * {@link LENGTH_TABLE_STEPS} Newton steps on {@link GAUSS}'s length from the
 * part's start, which on so short a stretch is exact to the double's
 * precision but near a cusp.
 */
export function bsplineLengthTable(curve: BSplineCurve): {
  readonly length: number
  /** The parameter at `distance` along the curve from its start, clamped to it. */
  paramAt(distance: number): number
} {
  const { first } = bsplineDifferentials(curve)
  const speed = (u: number) => length3(first(u))
  const breaks = bsplineBreakpoints(curve)
  const cuts = [breaks[0]]
  for (let i = 1; i < breaks.length; i++) {
    const h = (breaks[i] - breaks[i - 1]) / LENGTH_TABLE_PARTS
    for (let k = 1; k < LENGTH_TABLE_PARTS; k++) {
      cuts.push(breaks[i - 1] + k * h)
    }
    cuts.push(breaks[i])
  }
  const lengths = [0]
  for (let i = 1; i < cuts.length; i++) {
    lengths.push(lengths[i - 1] + bsplineLength(curve, cuts[i - 1], cuts[i]))
  }
  const length = lengths[lengths.length - 1]
  return {
    length,
    paramAt(distance: number): number {
      if (!(distance > 0) || !(length > 0)) return cuts[0]
      if (distance >= length) return cuts[cuts.length - 1]
      let low = 0
      let high = cuts.length - 1
      while (high - low > 1) {
        const mid = (low + high) >> 1
        if (lengths[mid] <= distance) low = mid
        else high = mid
      }
      const from = cuts[low]
      const to = cuts[low + 1]
      const part = lengths[low + 1] - lengths[low]
      const target = distance - lengths[low]
      let u = from + (part > 0 ? ((to - from) * target) / part : 0)
      for (let step = 0; step < LENGTH_TABLE_STEPS; step++) {
        const miss = gauss(speed, from, u) - target
        if (Math.abs(miss) <= 1e-12 * Math.max(part, 1e-300)) break
        const rate = speed(u)
        if (!(rate > 0)) break
        u = Math.min(Math.max(u - miss / rate, from), to)
      }
      return u
    },
  }
}

/** Parts of each polynomial piece in {@link bsplineLengthTable}: the speed varies little across one, so Newton starts close. */
const LENGTH_TABLE_PARTS = 8
/** Newton converges quadratically from the part's linear guess; near a cusp it stops where it got. */
const LENGTH_TABLE_STEPS = 6

/**
 * Half `∫ (x y′ − y x′) du` from `from` to `to`: the signed area the curve
 * sweeps about the origin, in plan.
 */
export function bsplineSweptArea(
  curve: BSplineCurve,
  from: number,
  to: number
): number {
  return bsplineIntegral(curve, from, to, (p, d) => V.cross(p, d), 1) / 2
}

/**
 * `∫ f(C(u), C′(u)) du` from `from` to `to`, for an `f` polynomial of degree
 * `degree` in the point and linear in the derivative. A non-rational piece's
 * integrand is then a polynomial of degree at most (`degree` + 1) × the
 * curve's − 1, which {@link GAUSS} integrates exactly up to 31; a rational
 * one's, or a higher one's, is no polynomial it can, so it is halved until
 * the halves agree to a fraction of the curve's own extent to the power of
 * the integrand's.
 */
export function bsplineIntegral(
  curve: BSplineCurve,
  from: number,
  to: number,
  f: (point: Vec3, derivative: Vec3) => number,
  degree: number
): number {
  if (to === from) return 0
  if (to < from) return -bsplineIntegral(curve, to, from, f, degree)
  const { first } = bsplineDifferentials(curve)
  const integrand = (u: number) => f(bsplinePoint(curve, u), first(u))
  const cuts = pieces(curve, from, to)
  let sum = 0
  const exact = (degree + 1) * curve.degree - 1 < 2 * GAUSS.nodes.length
  if (!curve.weights && exact) {
    for (let i = 1; i < cuts.length; i++) {
      sum += gauss(integrand, cuts[i - 1], cuts[i])
    }
    return sum
  }
  const extent = Math.max(
    1e-300,
    ...curve.controlPoints.map((p) => Math.abs(p.x) + Math.abs(p.y))
  )
  const tolerance = 1e-14 * extent ** (degree + 1)
  const adaptive = (
    a: number,
    b: number,
    whole: number,
    depth: number
  ): number => {
    const m = (a + b) / 2
    const left = gauss(integrand, a, m)
    const right = gauss(integrand, m, b)
    if (
      depth >= MAX_LENGTH_HALVINGS ||
      Math.abs(left + right - whole) <= tolerance
    ) {
      return left + right
    }
    return adaptive(a, m, left, depth + 1) + adaptive(m, b, right, depth + 1)
  }
  for (let i = 1; i < cuts.length; i++) {
    const a = cuts[i - 1]
    const b = cuts[i]
    sum += adaptive(a, b, gauss(integrand, a, b), 0)
  }
  return sum
}

/**
 * Where two curves meet in plan near `u` on the first and `v` on the second:
 * Newton on the X and Y of `C₁(u) − C₂(v) = 0`, each parameter clamped to its domain. Null when it
 * does not converge — the curves only came close there, or touch.
 */
export function bsplinesMeeting(
  first: BSplineCurve,
  u: number,
  second: BSplineCurve,
  v: number
): { readonly u: number; readonly v: number } | null {
  const d1 = bsplineDifferentials(first).first
  const d2 = bsplineDifferentials(second).first
  const one = bsplineDomain(first)
  const two = bsplineDomain(second)
  const size = Math.max(
    1,
    ...first.controlPoints.map((p) => Math.abs(p.x) + Math.abs(p.y))
  )
  for (let step = 0; step < MEETING_STEPS; step++) {
    const gap = V.sub(bsplinePoint(first, u), bsplinePoint(second, v))
    if (V.length(gap) <= 1e-13 * size) return { u, v }
    const a = d1(u)
    const b = V.scale(d2(v), -1)
    const det = V.cross(a, b)
    if (Math.abs(det) < 1e-300) return null
    u = Math.min(one.end, Math.max(one.start, u - V.cross(gap, b) / det))
    v = Math.min(two.end, Math.max(two.start, v - V.cross(a, gap) / det))
  }
  const gap = V.sub(bsplinePoint(first, u), bsplinePoint(second, v))
  return V.length(gap) <= 1e-9 * size ? { u, v } : null
}

/** Newton converges quadratically from a chord's crossing; a dozen steps are plenty. */
const MEETING_STEPS = 12

/**
 * The parameter of each fit point, starting at 0 and **not normalised** — the
 * range AutoCAD's LIST reports is the sum of the chords, in space (probe
 * spline/p200). A closed set gets one more value, for the closing chord back
 * to the first point.
 */
export function fitParameters(
  points: readonly Vec3[],
  method: KnotParameterization,
  closed: boolean
): number[] {
  const params = [0]
  const count = closed ? points.length : points.length - 1
  for (let i = 0; i < count; i++) {
    const chord = length3(sub3(points[(i + 1) % points.length], points[i]))
    const step =
      method === "chord" ? chord : method === "sqrtChord" ? Math.sqrt(chord) : 1
    params.push(params[i] + step)
  }
  return params
}

/**
 * The cubic through `points` at `params` (Piegl & Tiller §9.2.2): n + 1 points
 * give n + 3 control points, the count AutoCAD's LIST reports for a fit
 * spline. Each end takes the derivative given, or, with `null`, no curvature
 * (C″ = 0): AutoCAD's free end, which reproduces its control points to the
 * last decimal where Bessel's parabola is a third off (probes spline/p01,
 * p300, p301).
 */
export function interpolateCubic(
  points: readonly Vec3[],
  params: readonly number[],
  startDerivative: Vec3 | null,
  endDerivative: Vec3 | null
): BSplineCurve {
  const n = points.length - 1
  const u0 = params[0]
  const un = params[n]
  const knots = [u0, u0, u0, u0, ...params.slice(1, n), un, un, un, un]
  const draft: BSplineCurve = {
    degree: 3,
    knots,
    controlPoints: Array.from({ length: n + 3 }, () => ZERO),
  }
  const matrix: number[][] = []
  const rhs: Vec3[] = []
  for (let k = 0; k <= n; k++) {
    matrix.push(basisRow(draft, params[k], 0))
    rhs.push(points[k])
  }
  for (const [u, derivative] of [
    [u0, startDerivative],
    [un, endDerivative],
  ] as const) {
    matrix.push(basisRow(draft, u, derivative ? 1 : 2))
    rhs.push(derivative ?? ZERO)
  }
  return { degree: 3, knots, controlPoints: solveLinear(matrix, rhs) }
}

/**
 * The weight of each control point in the curve's `order`th derivative at
 * `u`: one row of an interpolation system. A derivative is read off the
 * hodograph of a curve whose only non-zero control point is the one weighed.
 */
function basisRow(curve: BSplineCurve, u: number, order: number): number[] {
  const count = curve.controlPoints.length
  const row = new Array<number>(count).fill(0)
  const span = findSpan(curve, u)
  if (order === 0) {
    const basis = basisFunctions(curve, span, u)
    for (let j = 0; j <= curve.degree; j++) {
      row[span - curve.degree + j] = basis[j]
    }
    return row
  }
  for (let i = span - curve.degree; i <= span; i++) {
    let unit: BSplineCurve = {
      ...curve,
      controlPoints: curve.controlPoints.map((_, j) =>
        j === i ? { x: 1, y: 0, z: 0 } : ZERO
      ),
    }
    for (let d = 0; d < order; d++) unit = bsplineDerivativeCurve(unit)
    row[i] = bsplinePoint(unit, u).x
  }
  return row
}

/**
 * The periodic cubic through a closed loop of `points` (C2 at the closure,
 * AutoCAD's SPLPERIODIC 1). `params` has one value more than `points`, the
 * closing one. The control points wrap: the first three repeat at the end.
 */
export function interpolatePeriodicCubic(
  points: readonly Vec3[],
  params: readonly number[]
): BSplineCurve {
  const n = points.length
  const period = params[n] - params[0]
  const knotAt = (i: number): number => {
    const wraps = Math.floor(i / n)
    return params[i - wraps * n] + wraps * period
  }
  const knots: number[] = []
  for (let i = 0; i < n + 7; i++) knots.push(knotAt(i - 3))
  const draft: BSplineCurve = {
    degree: 3,
    knots,
    controlPoints: Array.from({ length: n + 3 }, () => ZERO),
  }
  const matrix: number[][] = []
  for (let k = 0; k < n; k++) {
    const row = new Array<number>(n).fill(0)
    const span = findSpan(draft, params[k])
    const basis = basisFunctions(draft, span, params[k])
    for (let j = 0; j <= 3; j++) row[(span - 3 + j) % n] += basis[j]
    matrix.push(row)
  }
  const solved = solveLinear(matrix, [...points])
  return {
    degree: 3,
    knots,
    controlPoints: [...solved, solved[0], solved[1], solved[2]],
  }
}

/**
 * A curve on its control points with knots 1 apart, clamped so it starts and
 * ends on the first and last point — what AutoCAD's CV method draws.
 */
export function clampedUniformCurve(
  controlPoints: readonly Vec3[],
  degree: number
): BSplineCurve {
  const inner = controlPoints.length - degree - 1
  const knots: number[] = []
  for (let i = 0; i <= degree; i++) knots.push(0)
  for (let i = 1; i <= inner; i++) knots.push(i)
  for (let i = 0; i <= degree; i++) knots.push(inner + 1)
  return { degree, knots, controlPoints }
}

/** A closed curve on a loop of control points with knots 1 apart (periodic, C^(degree−1) everywhere). */
export function periodicUniformCurve(
  controlPoints: readonly Vec3[],
  degree: number,
  weights?: readonly number[]
): BSplineCurve {
  const knots = Array.from({ length: controlPoints.length + 1 }, (_, i) => i)
  return periodicCurve(controlPoints, degree, knots, weights)
}

/**
 * A closed curve as AutoCAD holds a periodic one: a loop of n control points
 * (`degree` at most n) and the n + 1 knots of one period, the curve starting
 * at the first (probe spline/p311: knots 0 to 4 on a closed CV spline of four
 * vertices, 0 to 80 on a closed fit spline of four points, and its four
 * control points). Unwrapped, the last `degree` points come first and the
 * knots run on by the period on either side.
 */
export function periodicCurve(
  controlPoints: readonly Vec3[],
  degree: number,
  knots: readonly number[],
  weights?: readonly number[]
): BSplineCurve {
  const n = controlPoints.length
  const period = knots[n] - knots[0]
  const knotAt = (i: number): number => {
    const wraps = Math.floor(i / n)
    return knots[i - wraps * n] + wraps * period
  }
  const wrap = <T>(loop: readonly T[]): T[] => [
    ...loop.slice(n - degree),
    ...loop,
  ]
  return {
    degree,
    knots: Array.from({ length: n + 2 * degree + 1 }, (_, i) =>
      knotAt(i - degree)
    ),
    controlPoints: wrap(controlPoints),
    ...(weights ? { weights: wrap(weights) } : {}),
  }
}

/**
 * The loop and the period a periodic curve unwraps, as AutoCAD holds them:
 * `curve`'s last `degree` control points are its first again, as
 * {@link periodicCurve} and {@link interpolatePeriodicCubic} leave them.
 */
export function periodicLoop(curve: BSplineCurve): BSplineCurve {
  const p = curve.degree
  const n = curve.controlPoints.length - p
  return {
    degree: p,
    knots: curve.knots.slice(p, p + n + 1),
    controlPoints: curve.controlPoints.slice(p),
    ...(curve.weights ? { weights: curve.weights.slice(p) } : {}),
  }
}

/** A control point and its weight as one homogeneous point: (wx, wy, wz, w). */
type Homogeneous = readonly [number, number, number, number]

function homogeneous(curve: BSplineCurve): Homogeneous[] {
  return curve.controlPoints.map((p, i) => {
    const w = curve.weights?.[i] ?? 1
    return [p.x * w, p.y * w, p.z * w, w]
  })
}

/** The curve on homogeneous points, weighed only where `rational`. */
function fromHomogeneous(
  degree: number,
  knots: readonly number[],
  points: readonly Homogeneous[],
  rational: boolean
): BSplineCurve {
  return {
    degree,
    knots,
    controlPoints: points.map(([x, y, z, w]) => ({
      x: x / w,
      y: y / w,
      z: z / w,
    })),
    ...(rational ? { weights: points.map((p) => p[3]) } : {}),
  }
}

function mix(a: Homogeneous, b: Homogeneous, t: number): Homogeneous {
  return [
    a[0] + (b[0] - a[0]) * t,
    a[1] + (b[1] - a[1]) * t,
    a[2] + (b[2] - a[2]) * t,
    a[3] + (b[3] - a[3]) * t,
  ]
}

/** The binomial coefficient C(n, k), 0 above `n`. */
function choose(n: number, k: number): number {
  let c = 1
  for (let j = 1; j <= k; j++) c = (c * (n - k + j)) / j
  return k > n ? 0 : c
}

/** How many times `u` stands in `knots`, compared exactly: a cut is snapped onto a knot first. */
export function knotMultiplicity(knots: readonly number[], u: number): number {
  return knots.filter((k) => k === u).length
}

/**
 * The same curve with the knot `u` inserted `times` more times (Boehm, Piegl
 * & Tiller A5.1), a rational one in its homogeneous form — how AutoCAD's
 * pieces get their knots and control points (probes spline-knots/k01–k08).
 * `u` lies inside the knot vector, short of its last value.
 */
export function bsplineInsertKnot(
  curve: BSplineCurve,
  u: number,
  times: number
): BSplineCurve {
  const p = curve.degree
  let knots = [...curve.knots]
  let points = homogeneous(curve)
  for (let n = 0; n < times; n++) {
    let k = knots.length - 2
    while (k > 0 && knots[k] > u) k--
    const next: Homogeneous[] = []
    for (let i = 0; i <= points.length; i++) {
      if (i <= k - p) next.push(points[i])
      else if (i > k) next.push(points[i - 1])
      else {
        const alpha = (u - knots[i]) / (knots[i + p] - knots[i])
        next.push(mix(points[i - 1], points[i], alpha))
      }
    }
    knots = [...knots.slice(0, k + 1), u, ...knots.slice(k + 1)]
    points = next
  }
  return fromHomogeneous(p, knots, points, !!curve.weights)
}

/**
 * The curve between `a` and `b` (a < b, both in its domain) as a curve of its
 * own, clamped on knots of full multiplicity at both ends, the knots between
 * kept as they were, never normalised: a piece keeps its parameters
 * (spline-knots/k01–k08). Each cut is inserted until it stands `degree` times.
 */
export function bsplineSegment(
  curve: BSplineCurve,
  a: number,
  b: number
): BSplineCurve {
  const p = curve.degree
  let cut = curve
  for (const u of [a, b]) {
    cut = bsplineInsertKnot(cut, u, p - knotMultiplicity(cut.knots, u))
  }
  const last = cut.knots.lastIndexOf(a)
  const first = cut.knots.indexOf(b)
  const ends = (u: number) => new Array<number>(p + 1).fill(u)
  return {
    degree: p,
    knots: [...ends(a), ...cut.knots.slice(last + 1, first), ...ends(b)],
    controlPoints: cut.controlPoints.slice(last - p, first),
    ...(cut.weights ? { weights: cut.weights.slice(last - p, first) } : {}),
  }
}

/**
 * The same clamped curve raised to `degree` (Piegl & Tiller A5.9), a rational
 * one in its homogeneous form: each knot stands once more for each degree
 * gained, as AutoCAD raises a piece JOIN joins to a spline of a higher one
 * (pieces/p433).
 */
export function bsplineElevated(
  curve: BSplineCurve,
  degree: number
): BSplineCurve {
  const p = curve.degree
  const t = degree - p
  if (t <= 0) return curve
  const U = curve.knots
  const Pw = homogeneous(curve)
  const m = Pw.length + p
  const ph = degree
  const ph2 = Math.floor(ph / 2)
  const bezalfs = Array.from({ length: ph + 1 }, () =>
    new Array<number>(p + 1).fill(0)
  )
  bezalfs[0][0] = bezalfs[ph][p] = 1
  for (let i = 1; i <= ph2; i++) {
    const inv = 1 / choose(ph, i)
    for (let j = Math.max(0, i - t); j <= Math.min(p, i); j++) {
      bezalfs[i][j] = inv * choose(p, j) * choose(t, i - j)
    }
  }
  for (let i = ph2 + 1; i < ph; i++) {
    for (let j = Math.max(0, i - t); j <= Math.min(p, i); j++) {
      bezalfs[i][j] = bezalfs[ph - i][p - j]
    }
  }
  let kind = ph + 1
  let r = -1
  let a = p
  let b = p + 1
  let cind = 1
  let ua = U[0]
  const Qw: Homogeneous[] = [Pw[0]]
  const Uh: number[] = new Array<number>(ph + 1).fill(ua)
  const bpts = Pw.slice(0, p + 1)
  const next: Homogeneous[] = []
  const ebpts: Homogeneous[] = []
  const alfs: number[] = []
  while (b < m) {
    const i0 = b
    while (b < m && U[b] === U[b + 1]) b++
    const mul = b - i0 + 1
    const ub = U[b]
    const oldr = r
    r = p - mul
    const lbz = oldr > 0 ? Math.floor((oldr + 2) / 2) : 1
    const rbz = r > 0 ? ph - Math.floor((r + 1) / 2) : ph
    if (r > 0) {
      for (let k = p; k > mul; k--)
        alfs[k - mul - 1] = (ub - ua) / (U[a + k] - ua)
      for (let j = 1; j <= r; j++) {
        const s = mul + j
        for (let k = p; k >= s; k--)
          bpts[k] = mix(bpts[k - 1], bpts[k], alfs[k - s])
        next[r - j] = bpts[p]
      }
    }
    for (let i = lbz; i <= ph; i++) {
      const e = [0, 0, 0, 0]
      for (let j = Math.max(0, i - t); j <= Math.min(p, i); j++) {
        for (let axis = 0; axis < 4; axis++)
          e[axis] += bezalfs[i][j] * bpts[j][axis]
      }
      ebpts[i] = e as unknown as Homogeneous
    }
    if (oldr > 1) {
      // The knot `ua` removed again the times the Bézier split put it in.
      let first = kind - 2
      let last = kind
      const den = ub - ua
      const bet = (ub - Uh[kind - 1]) / den
      for (let tr = 1; tr < oldr; tr++) {
        let i = first
        let j = last
        let kj = j - kind + 1
        while (j - i > tr) {
          if (i < cind) {
            Qw[i] = mix(Qw[i - 1], Qw[i], (ub - Uh[i]) / (ua - Uh[i]))
          }
          if (j >= lbz) {
            const gam =
              j - tr <= kind - ph + oldr ? (ub - Uh[j - tr]) / den : bet
            ebpts[kj] = mix(ebpts[kj + 1], ebpts[kj], gam)
          }
          i++
          j--
          kj--
        }
        first--
        last++
      }
    }
    if (a !== p) {
      for (let i = 0; i < ph - oldr; i++) Uh[kind++] = ua
    }
    for (let j = lbz; j <= rbz; j++) Qw[cind++] = ebpts[j]
    if (b < m) {
      for (let j = 0; j < r; j++) bpts[j] = next[j]
      for (let j = r; j <= p; j++) bpts[j] = Pw[b - p + j]
      a = b
      b++
      ua = ub
    } else {
      for (let i = 0; i <= ph; i++) Uh[kind + i] = ub
    }
  }
  return fromHomogeneous(ph, Uh, Qw, !!curve.weights)
}

/** The same curve run the other way, on the same parameter interval. */
export function bsplineReversed(curve: BSplineCurve): BSplineCurve {
  const { knots } = curve
  const sum = knots[0] + knots[knots.length - 1]
  return {
    degree: curve.degree,
    knots: knots.map((k) => sum - k).reverse(),
    controlPoints: [...curve.controlPoints].reverse(),
    ...(curve.weights ? { weights: [...curve.weights].reverse() } : {}),
  }
}

/**
 * Clamped curves, each starting where the one before ends, as one: raised to
 * the highest degree, its parameter from 0 with each piece's length kept, a
 * knot of `degree` where two meet (pieces/p331, p374, p375). Rational if any
 * piece is, each piece's weights scaled to meet the last one's.
 */
export function bsplineJoined(curves: readonly BSplineCurve[]): BSplineCurve {
  const degree = Math.max(...curves.map((curve) => curve.degree))
  const rational = curves.some((curve) => curve.weights)
  const knots: number[] = []
  const points: Homogeneous[] = []
  let at = 0
  curves.forEach((piece, n) => {
    const curve = bsplineElevated(piece, degree)
    const { knots: own } = curve
    const shift = at - own[0]
    const weights = curve.weights ?? curve.controlPoints.map(() => 1)
    const scale = n === 0 ? 1 : points[points.length - 1][3] / weights[0]
    const lifted = curve.controlPoints.map((q, i): Homogeneous => {
      const w = weights[i] * scale
      return [q.x * w, q.y * w, q.z * w, w]
    })
    if (n === 0) {
      knots.push(...own.slice(0, -1).map((k) => k + shift))
      points.push(...lifted)
    } else {
      knots.push(...own.slice(degree + 1, -1).map((k) => k + shift))
      points.push(...lifted.slice(1))
    }
    at = own[own.length - 1] + shift
  })
  knots.push(at)
  return fromHomogeneous(degree, knots, points, rational)
}

/**
 * The conic `center + cos θ·u + sin θ·v` for θ from `start` over `sweep`
 * (negative runs clockwise), as AutoCAD makes an arc's or an elliptical
 * arc's spline: quadratic and rational, on its own angle from 0, in the
 * fewest equal spans of a quarter turn or less, a knot of 2 between them
 * (Piegl & Tiller A7.1; pieces/p375, p424, p425).
 */
export function conicArcCurve(
  center: Vec3,
  u: Vec3,
  v: Vec3,
  start: number,
  sweep: number
): BSplineCurve {
  const spans = Math.max(1, Math.ceil(Math.abs(sweep) / (Math.PI / 2) - 1e-9))
  const step = sweep / spans
  const w = Math.cos(step / 2)
  const at = (theta: number, scale: number): Vec3 =>
    add3(
      center,
      add3(
        scale3(u, Math.cos(theta) * scale),
        scale3(v, Math.sin(theta) * scale)
      )
    )
  const controlPoints: Vec3[] = [at(start, 1)]
  const weights = [1]
  const knots = [0, 0, 0]
  for (let i = 1; i <= spans; i++) {
    const theta = start + step * i
    controlPoints.push(at(theta - step / 2, 1 / w), at(theta, 1))
    weights.push(w, 1)
    const k = Math.abs(step) * i
    knots.push(k, k)
  }
  knots.push(knots[knots.length - 1])
  return { degree: 2, knots, controlPoints, weights }
}

/**
 * The same curve with each knot inside its domain standing as often as it
 * does in `knots`, where it stands less: a fit spline whose own knots repeat
 * one AutoCAD keeps (k07's triple seam knot) cuts on them as AutoCAD's does.
 */
export function bsplineRaised(
  curve: BSplineCurve,
  knots: readonly number[]
): BSplineCurve {
  const { start, end } = bsplineDomain(curve)
  let raised = curve
  for (const u of new Set(knots)) {
    if (u <= start || u >= end) continue
    const more = knotMultiplicity(knots, u) - knotMultiplicity(raised.knots, u)
    if (more > 0) raised = bsplineInsertKnot(raised, u, more)
  }
  return raised
}

/**
 * Two turns of a closed curve, one after the other, its parameter running on
 * by the period, so a piece may run across its seam: a periodic one
 * ({@link periodicCurve}'s form) unwrapped over two periods, a clamped one
 * joined to itself at its seam, a knot of `degree` there.
 */
export function bsplineTwoTurns(
  curve: BSplineCurve,
  periodic: boolean
): BSplineCurve {
  const p = curve.degree
  if (periodic) {
    const loop = periodicLoop(curve)
    const period = loop.knots[loop.knots.length - 1] - loop.knots[0]
    return periodicCurve(
      [...loop.controlPoints, ...loop.controlPoints],
      p,
      [...loop.knots, ...loop.knots.slice(1).map((k) => k + period)],
      loop.weights && [...loop.weights, ...loop.weights]
    )
  }
  const { start, end } = bsplineDomain(curve)
  const period = end - start
  const clamped = bsplineSegment(curve, start, end)
  return {
    degree: p,
    knots: [
      ...clamped.knots.slice(0, -1),
      ...clamped.knots.slice(p + 1).map((k) => k + period),
    ],
    controlPoints: [
      ...clamped.controlPoints,
      ...clamped.controlPoints.slice(1),
    ],
    ...(clamped.weights
      ? { weights: [...clamped.weights, ...clamped.weights.slice(1)] }
      : {}),
  }
}

/**
 * A curve grown past one end: its points `t` on from the end, the parameter
 * running on outward, and the curve it makes grown by `t` — the old knots and
 * control points kept, the growth a piece of its own behind a knot of
 * `degree` (spline-knots/k10, k17), its parameter running on from the end's
 * (backwards from the start, k18, k19).
 */
export interface BSplineGrowth {
  at(t: number): Vec3
  grown(t: number): BSplineCurve
  /** A `t` the growth has gone `distance` or more from the end by, roughly. */
  reach(distance: number): number
}

/** The end's point, first and second derivative, homogeneous, the parameter running outward. */
function homogeneousJet(
  curve: BSplineCurve,
  atEnd: boolean
): [Homogeneous, Homogeneous, Homogeneous] {
  const u = atEnd ? bsplineDomain(curve).end : bsplineDomain(curve).start
  const lifted = (axis: number): BSplineCurve => ({
    degree: curve.degree,
    knots: curve.knots,
    controlPoints: homogeneous(curve).map((h) => ({ x: h[axis], y: 0, z: 0 })),
  })
  const jet: [number[], number[], number[]] = [[], [], []]
  for (let axis = 0; axis < 4; axis++) {
    let c = lifted(axis)
    for (let order = 0; order < 3; order++) {
      const value = bsplinePoint(c, u).x
      jet[order].push(order === 1 && !atEnd ? -value : value)
      c = bsplineDerivativeCurve(c)
    }
  }
  return jet as unknown as [Homogeneous, Homogeneous, Homogeneous]
}

/**
 * The Bézier points, at `degree`, of the polynomial Σ cₖ tᵏ over [0, h]:
 * by its blossom, Qᵢ = Σ cₖ hᵏ C(i, k) / C(degree, k). A term above the
 * degree is dropped.
 */
function polynomialBezier(
  coefficients: readonly Homogeneous[],
  degree: number,
  h: number
): Homogeneous[] {
  return Array.from({ length: degree + 1 }, (_, i) => {
    const q: number[] = [0, 0, 0, 0]
    coefficients.forEach((c, k) => {
      if (k > degree) return
      const f = (h ** k * choose(i, k)) / choose(degree, k)
      for (let axis = 0; axis < 4; axis++) q[axis] += c[axis] * f
    })
    return q as unknown as Homogeneous
  })
}

/**
 * The curve with a Bézier piece of parameter length `h` joined at its end
 * (`bezier` from the end outward), clamped there: the old end's knot then
 * stands `degree` times.
 */
function withPiece(
  curve: BSplineCurve,
  atEnd: boolean,
  bezier: readonly Homogeneous[],
  h: number
): BSplineCurve {
  const p = curve.degree
  const { start, end } = bsplineDomain(curve)
  const points = homogeneous(curve)
  const rational = !!curve.weights || bezier.some((q) => q[3] !== 1)
  const outer = (u: number) => new Array<number>(p + 1).fill(u)
  if (atEnd) {
    return fromHomogeneous(
      p,
      [...curve.knots.slice(0, -1), ...outer(end + h)],
      [...points, ...bezier.slice(1)],
      rational
    )
  }
  return fromHomogeneous(
    p,
    [...outer(start - h), ...curve.knots.slice(1)],
    [...bezier.slice(1).reverse(), ...points],
    rational
  )
}

function clampedCurve(curve: BSplineCurve): BSplineCurve {
  const { start, end } = bsplineDomain(curve)
  return bsplineSegment(curve, start, end)
}

function pointOf(h: Homogeneous): Vec3 {
  return { x: h[0] / h[3], y: h[1] / h[3], z: h[2] / h[3] }
}

/** How far a growth of speed `speed` and bend `bend` takes to go `distance`. */
function reachOf(speed: number, bend: number, distance: number): number {
  if (bend <= 1e-300) return distance / Math.max(speed, 1e-300)
  return (-speed + Math.sqrt(speed * speed + 2 * bend * distance)) / bend
}

/**
 * A CV spline grows by its end's second-order Taylor polynomial, in its
 * homogeneous form: the end's point, tangent and second derivative kept, a
 * curved piece AutoCAD's EXTEND leaves, the edge found on it (spline-knots/
 * k10's `43.2049…, 12.4037…`, k18, k31's weights). A curve of degree one
 * grows straight.
 */
export function bsplineTaylorGrowth(
  curve: BSplineCurve,
  atEnd: boolean
): BSplineGrowth {
  const clamped = clampedCurve(curve)
  const [c0, c1, c2] = homogeneousJet(clamped, atEnd)
  const half: Homogeneous = [c2[0] / 2, c2[1] / 2, c2[2] / 2, c2[3] / 2]
  const terms = clamped.degree >= 2 ? [c0, c1, half] : [c0, c1]
  const { first, second } = bsplineDifferentials(clamped)
  const { start, end } = bsplineDomain(clamped)
  const u = atEnd ? end : start
  return {
    at: (t) => {
      const h: number[] = [0, 0, 0, 0]
      terms.forEach((c, k) => {
        for (let axis = 0; axis < 4; axis++) h[axis] += c[axis] * t ** k
      })
      return pointOf(h as unknown as Homogeneous)
    },
    grown: (t) =>
      withPiece(clamped, atEnd, polynomialBezier(terms, clamped.degree, t), t),
    reach: (distance) =>
      reachOf(length3(first(u)), length3(second(u)), distance),
  }
}

/**
 * A fit spline grows straight on along its end's tangent, behind a piece
 * that eases its curvature off: a cubic keeping the end's point, tangent and
 * second derivative, its second derivative falling to none over a parameter
 * length that is the second derivative's own length, `|C″|` — measured,
 * AutoCAD 2027 documents no rule (spline-knots/k32 `0.5470`, k35 `0.0652`,
 * the lengths of the `C″` there to the digit) —, then a line as fast as the
 * piece ends. A free end has no curvature: it grows straight at once (k17,
 * k19). Its fit points are the ends of the pieces (k17, k32, k35).
 */
export function bsplineEasedGrowth(
  curve: BSplineCurve,
  atEnd: boolean
): BSplineGrowth {
  const clamped = clampedCurve(curve)
  const { start, end } = bsplineDomain(clamped)
  const u = atEnd ? end : start
  const { first, second } = bsplineDifferentials(clamped)
  const c = bsplinePoint(clamped, u)
  const d1 = scale3(first(u), atEnd ? 1 : -1)
  const d2 = second(u)
  const speed = length3(d1)
  const ease = length3(d2) > 1e-10 * Math.max(1, speed) ? length3(d2) : 0
  const lift = (v: Vec3): Homogeneous => [v.x, v.y, v.z, 0]
  const at = (v: Vec3): Homogeneous => [v.x, v.y, v.z, 1]
  const eased =
    ease > 0
      ? [
          at(c),
          lift(d1),
          lift(scale3(d2, 1 / 2)),
          lift(scale3(d2, -1 / (6 * ease))),
        ]
      : [at(c), lift(d1)]
  const easedAt = (t: number): Vec3 =>
    add3(
      add3(c, scale3(d1, t)),
      ease > 0
        ? scale3(d2, (t * t) / 2 - (t * t * t) / (6 * ease))
        : { x: 0, y: 0, z: 0 }
    )
  const bend = easedAt(ease)
  const onward = add3(d1, scale3(d2, ease / 2))
  const line = [at(bend), lift(onward)]
  return {
    at: (t) => (t <= ease ? easedAt(t) : add3(bend, scale3(onward, t - ease))),
    grown: (t) => {
      const eased1 = withPiece(
        clamped,
        atEnd,
        polynomialBezier(eased, 3, Math.min(t, ease || t)),
        Math.min(t, ease || t)
      )
      if (t <= ease || ease === 0) return eased1
      return withPiece(
        eased1,
        atEnd,
        polynomialBezier(line, 3, t - ease),
        t - ease
      )
    },
    reach: (distance) => ease + distance / Math.max(length3(onward), 1e-300),
  }
}

/**
 * Gaussian elimination with partial pivoting, for the small systems a fit
 * sets up (one row per fit point). A singular system — two fit points on the
 * same parameter — leaves the unsolvable unknowns at the origin rather than
 * producing NaN.
 */
function solveLinear(
  matrix: readonly number[][],
  rhs: readonly Vec3[]
): Vec3[] {
  const n = rhs.length
  const a = matrix.map((row) => [...row])
  const bx = rhs.map((p) => p.x)
  const by = rhs.map((p) => p.y)
  const bz = rhs.map((p) => p.z)
  for (let col = 0; col < n; col++) {
    let pivot = col
    for (let row = col + 1; row < n; row++) {
      if (Math.abs(a[row][col]) > Math.abs(a[pivot][col])) pivot = row
    }
    if (Math.abs(a[pivot][col]) < 1e-14) continue
    ;[a[col], a[pivot]] = [a[pivot], a[col]]
    ;[bx[col], bx[pivot]] = [bx[pivot], bx[col]]
    ;[by[col], by[pivot]] = [by[pivot], by[col]]
    ;[bz[col], bz[pivot]] = [bz[pivot], bz[col]]
    for (let row = col + 1; row < n; row++) {
      const factor = a[row][col] / a[col][col]
      if (factor === 0) continue
      for (let k = col; k < n; k++) a[row][k] -= factor * a[col][k]
      bx[row] -= factor * bx[col]
      by[row] -= factor * by[col]
      bz[row] -= factor * bz[col]
    }
  }
  const x = new Array<number>(n).fill(0)
  const y = new Array<number>(n).fill(0)
  const z = new Array<number>(n).fill(0)
  for (let row = n - 1; row >= 0; row--) {
    if (Math.abs(a[row][row]) < 1e-14) continue
    let sx = bx[row]
    let sy = by[row]
    let sz = bz[row]
    for (let k = row + 1; k < n; k++) {
      sx -= a[row][k] * x[k]
      sy -= a[row][k] * y[k]
      sz -= a[row][k] * z[k]
    }
    x[row] = sx / a[row][row]
    y[row] = sy / a[row][row]
    z[row] = sz / a[row][row]
  }
  return x.map((value, i) => ({ x: value, y: y[i], z: z[i] }))
}
