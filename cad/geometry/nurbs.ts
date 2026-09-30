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
 * The cubic through `points` at `params`, with the given derivatives at its two
 * ends (Piegl & Tiller §9.2.2): n + 1 points give n + 3 control points, the
 * count AutoCAD's LIST reports for a fit spline.
 */
export function interpolateCubic(
  points: readonly Vec2[],
  params: readonly number[],
  startDerivative: Vec2,
  endDerivative: Vec2
): BSplineCurve {
  const n = points.length - 1
  const u0 = params[0]
  const un = params[n]
  const knots = [u0, u0, u0, u0, ...params.slice(1, n), un, un, un, un]
  const first = points[0]
  const last = points[n]
  const second = V.add(first, V.scale(startDerivative, (params[1] - u0) / 3))
  const beforeLast = V.sub(
    last,
    V.scale(endDerivative, (un - params[n - 1]) / 3)
  )
  const unknowns = n - 1
  if (unknowns <= 0) {
    return {
      degree: 3,
      knots,
      controlPoints: [first, second, beforeLast, last],
    }
  }
  const draft: BSplineCurve = {
    degree: 3,
    knots,
    controlPoints: Array.from({ length: n + 3 }, () => V.zero()),
  }
  const known = new Map<number, Vec2>([
    [0, first],
    [1, second],
    [n + 1, beforeLast],
    [n + 2, last],
  ])
  const matrix: number[][] = []
  const rhs: Vec2[] = []
  for (let k = 1; k < n; k++) {
    const row = new Array<number>(unknowns).fill(0)
    let target = points[k]
    const span = findSpan(draft, params[k])
    const basis = basisFunctions(draft, span, params[k])
    for (let j = 0; j <= 3; j++) {
      const index = span - 3 + j
      const fixed = known.get(index)
      if (fixed) target = V.sub(target, V.scale(fixed, basis[j]))
      else row[index - 2] += basis[j]
    }
    matrix.push(row)
    rhs.push(target)
  }
  const solved = solveLinear(matrix, rhs)
  return {
    degree: 3,
    knots,
    controlPoints: [first, second, ...solved, beforeLast, last],
  }
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
 * The derivative at the start of a fit that has no tangent given: that of the
 * parabola through the first three points (Bessel's end condition), or of the
 * chord when there are only two.
 */
export function besselStartDerivative(
  points: readonly Vec2[],
  params: readonly number[]
): Vec2 {
  const d1 = V.scale(V.sub(points[1], points[0]), 1 / (params[1] - params[0]))
  if (points.length < 3) return d1
  const d2 = V.scale(V.sub(points[2], points[1]), 1 / (params[2] - params[1]))
  const a = params[1] - params[0]
  const b = params[2] - params[1]
  const middle = V.scale(V.add(V.scale(d1, b), V.scale(d2, a)), 1 / (a + b))
  return V.sub(V.scale(d1, 2), middle)
}

/** {@link besselStartDerivative} at the other end, pointing along the curve. */
export function besselEndDerivative(
  points: readonly Vec2[],
  params: readonly number[]
): Vec2 {
  const last = points.length - 1
  const reversedPoints = [...points].reverse()
  const reversedParams = params
    .slice(0, last + 1)
    .map((u) => params[last] - u)
    .reverse()
  return V.scale(besselStartDerivative(reversedPoints, reversedParams), -1)
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
