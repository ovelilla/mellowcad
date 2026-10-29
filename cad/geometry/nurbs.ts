import { Vec2, V } from "./Vec2"

/**
 * A non-rational B-spline: `knots.length === controlPoints.length + degree + 1`.
 * Its domain is `[knots[degree], knots[knots.length - degree - 1]]`, so one
 * shape serves the clamped curves (whose ends are their first and last control
 * points) and the periodic ones (whose control points wrap round).
 */
export interface BSplineCurve {
  readonly degree: number
  readonly knots: readonly number[]
  readonly controlPoints: readonly Vec2[]
}

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

export function bsplinePoint(curve: BSplineCurve, u: number): Vec2 {
  const span = findSpan(curve, u)
  const basis = basisFunctions(curve, span, u)
  let x = 0
  let y = 0
  for (let j = 0; j <= curve.degree; j++) {
    const point = curve.controlPoints[span - curve.degree + j]
    x += basis[j] * point.x
    y += basis[j] * point.y
  }
  return { x, y }
}

/** The hodograph: a curve one degree lower whose points are this one's derivative. */
export function bsplineDerivativeCurve(curve: BSplineCurve): BSplineCurve {
  const { degree: p, knots, controlPoints } = curve
  if (p === 0) {
    return {
      degree: 0,
      knots,
      controlPoints: controlPoints.map(() => V.zero()),
    }
  }
  const points: Vec2[] = []
  for (let i = 0; i < controlPoints.length - 1; i++) {
    const span = knots[i + p + 1] - knots[i + 1]
    points.push(
      span === 0
        ? V.zero()
        : V.scale(V.sub(controlPoints[i + 1], controlPoints[i]), p / span)
    )
  }
  return { degree: p - 1, knots: knots.slice(1, -1), controlPoints: points }
}

export function bsplineDerivative(curve: BSplineCurve, u: number): Vec2 {
  return bsplinePoint(bsplineDerivativeCurve(curve), u)
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
 * piece until every chord's midpoint lies within `tolerance` of the curve.
 * The depth is capped: a curve with a cusp would otherwise halve for ever.
 */
export function bsplineTessellation(
  curve: BSplineCurve,
  tolerance: number
): { readonly params: number[]; readonly points: Vec2[] } {
  const breaks = bsplineBreakpoints(curve)
  const params = [breaks[0]]
  const points = [bsplinePoint(curve, breaks[0])]
  const tol = Math.max(tolerance, 1e-12)
  const refine = (a: number, pa: Vec2, b: number, pb: Vec2, depth: number) => {
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

function distanceToChord(p: Vec2, a: Vec2, b: Vec2): number {
  const ab = V.sub(b, a)
  const lengthSq = V.lengthSq(ab)
  if (lengthSq < 1e-24) return V.distance(p, a)
  const t = Math.max(0, Math.min(1, V.dot(V.sub(p, a), ab) / lengthSq))
  return V.distance(p, V.add(a, V.scale(ab, t)))
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
  const hodograph = bsplineDerivativeCurve(curve)
  const speed = (u: number) => V.length(bsplinePoint(hodograph, u))
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
  const hodograph = bsplineDerivativeCurve(curve)
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
      const speed = V.length(bsplinePoint(hodograph, u))
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
  const hodograph = bsplineDerivativeCurve(curve)
  const speed = (u: number) => V.length(bsplinePoint(hodograph, u))
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
 * sweeps about the origin. Each piece is a polynomial of degree at most
 * 2 × degree − 1, which {@link GAUSS} integrates exactly.
 */
export function bsplineSweptArea(
  curve: BSplineCurve,
  from: number,
  to: number
): number {
  if (to === from) return 0
  if (to < from) return -bsplineSweptArea(curve, to, from)
  const hodograph = bsplineDerivativeCurve(curve)
  const integrand = (u: number) =>
    V.cross(bsplinePoint(curve, u), bsplinePoint(hodograph, u))
  const cuts = pieces(curve, from, to)
  let twice = 0
  for (let i = 1; i < cuts.length; i++) {
    twice += gauss(integrand, cuts[i - 1], cuts[i])
  }
  return twice / 2
}

/**
 * Where two curves meet near `u` on the first and `v` on the second: Newton
 * on `C₁(u) − C₂(v) = 0`, each parameter clamped to its domain. Null when it
 * does not converge — the curves only came close there, or touch.
 */
export function bsplinesMeeting(
  first: BSplineCurve,
  u: number,
  second: BSplineCurve,
  v: number
): { readonly u: number; readonly v: number } | null {
  const d1 = bsplineDerivativeCurve(first)
  const d2 = bsplineDerivativeCurve(second)
  const one = bsplineDomain(first)
  const two = bsplineDomain(second)
  const size = Math.max(
    1,
    ...first.controlPoints.map((p) => Math.abs(p.x) + Math.abs(p.y))
  )
  for (let step = 0; step < MEETING_STEPS; step++) {
    const gap = V.sub(bsplinePoint(first, u), bsplinePoint(second, v))
    if (V.length(gap) <= 1e-13 * size) return { u, v }
    const a = bsplinePoint(d1, u)
    const b = V.scale(bsplinePoint(d2, v), -1)
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
 * range AutoCAD's LIST reports is the sum of the chords. A closed set gets one
 * more value, for the closing chord back to the first point.
 */
export function fitParameters(
  points: readonly Vec2[],
  method: KnotParameterization,
  closed: boolean
): number[] {
  const params = [0]
  const count = closed ? points.length : points.length - 1
  for (let i = 0; i < count; i++) {
    const chord = V.distance(points[i], points[(i + 1) % points.length])
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
  points: readonly Vec2[],
  params: readonly number[],
  startDerivative: Vec2 | null,
  endDerivative: Vec2 | null
): BSplineCurve {
  const n = points.length - 1
  const u0 = params[0]
  const un = params[n]
  const knots = [u0, u0, u0, u0, ...params.slice(1, n), un, un, un, un]
  const draft: BSplineCurve = {
    degree: 3,
    knots,
    controlPoints: Array.from({ length: n + 3 }, () => V.zero()),
  }
  const matrix: number[][] = []
  const rhs: Vec2[] = []
  for (let k = 0; k <= n; k++) {
    matrix.push(basisRow(draft, params[k], 0))
    rhs.push(points[k])
  }
  for (const [u, derivative] of [
    [u0, startDerivative],
    [un, endDerivative],
  ] as const) {
    matrix.push(basisRow(draft, u, derivative ? 1 : 2))
    rhs.push(derivative ?? V.zero())
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
        j === i ? { x: 1, y: 0 } : V.zero()
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
  points: readonly Vec2[],
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
    controlPoints: Array.from({ length: n + 3 }, () => V.zero()),
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
  controlPoints: readonly Vec2[],
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
  controlPoints: readonly Vec2[],
  degree: number
): BSplineCurve {
  const knots: number[] = []
  for (let i = 0; i <= controlPoints.length + 2 * degree; i++)
    knots.push(i - degree)
  return {
    degree,
    knots,
    controlPoints: [...controlPoints, ...controlPoints.slice(0, degree)],
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
  rhs: readonly Vec2[]
): Vec2[] {
  const n = rhs.length
  const a = matrix.map((row) => [...row])
  const bx = rhs.map((p) => p.x)
  const by = rhs.map((p) => p.y)
  for (let col = 0; col < n; col++) {
    let pivot = col
    for (let row = col + 1; row < n; row++) {
      if (Math.abs(a[row][col]) > Math.abs(a[pivot][col])) pivot = row
    }
    if (Math.abs(a[pivot][col]) < 1e-14) continue
    ;[a[col], a[pivot]] = [a[pivot], a[col]]
    ;[bx[col], bx[pivot]] = [bx[pivot], bx[col]]
    ;[by[col], by[pivot]] = [by[pivot], by[col]]
    for (let row = col + 1; row < n; row++) {
      const factor = a[row][col] / a[col][col]
      if (factor === 0) continue
      for (let k = col; k < n; k++) a[row][k] -= factor * a[col][k]
      bx[row] -= factor * bx[col]
      by[row] -= factor * by[col]
    }
  }
  const x = new Array<number>(n).fill(0)
  const y = new Array<number>(n).fill(0)
  for (let row = n - 1; row >= 0; row--) {
    if (Math.abs(a[row][row]) < 1e-14) continue
    let sx = bx[row]
    let sy = by[row]
    for (let k = row + 1; k < n; k++) {
      sx -= a[row][k] * x[k]
      sy -= a[row][k] * y[k]
    }
    x[row] = sx / a[row][row]
    y[row] = sy / a[row][row]
  }
  return x.map((value, i) => ({ x: value, y: y[i] }))
}
