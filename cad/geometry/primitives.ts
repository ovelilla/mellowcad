import { Vec2, V } from "./Vec2"

/**
 * Pure geometric algorithms on primitive shapes (segments, circles, rays),
 * dependency-free so hit-testing, snapping, tracking and tools can share them.
 */

/** An infinite line expressed as a point and a (unit) direction vector. */
export interface Ray {
  readonly origin: Vec2
  readonly dir: Vec2
}

export interface ClosestResult {
  readonly point: Vec2
  /** Distance from the query point to `point`, in world units. */
  readonly distance: number
  /**
   * Parametric position along the geometry when meaningful:
   * - segment: 0..1 from start to end
   * - circle: angle in radians
   */
  readonly t: number
}

/**
 * Sine of the smallest angle two lines may form and still be considered to
 * cross. Below it they are parallel for every practical purpose, and the
 * crossing would sit ~1e9 times the geometry's own size away — a point that
 * fillet, chamfer, trim/extend and the offset corner joins would then build
 * from, silently producing nonsense instead of declining.
 */
const PARALLEL_SINE_EPSILON = 1e-9

export function closestPointOnSegment(
  a: Vec2,
  b: Vec2,
  p: Vec2
): ClosestResult {
  const ab = V.sub(b, a)
  const lenSq = V.lengthSq(ab)
  if (lenSq === 0) {
    return { point: a, distance: V.distance(a, p), t: 0 }
  }
  let t = V.dot(V.sub(p, a), ab) / lenSq
  t = Math.max(0, Math.min(1, t))
  const point = V.add(a, V.scale(ab, t))
  return { point, distance: V.distance(point, p), t }
}

/**
 * Closest point on the *infinite* line through `a` and `b`. Unlike
 * {@link closestPointOnSegment}, `t` is not clamped, which is what
 * perpendicular snapping needs.
 */
export function closestPointOnInfiniteLine(
  a: Vec2,
  b: Vec2,
  p: Vec2
): ClosestResult {
  const ab = V.sub(b, a)
  const lenSq = V.lengthSq(ab)
  if (lenSq === 0) {
    return { point: a, distance: V.distance(a, p), t: 0 }
  }
  const t = V.dot(V.sub(p, a), ab) / lenSq
  const point = V.add(a, V.scale(ab, t))
  return { point, distance: V.distance(point, p), t }
}

export function closestPointOnCircle(
  center: Vec2,
  radius: number,
  p: Vec2
): ClosestResult {
  const d = V.sub(p, center)
  const len = V.length(d)
  if (len === 0) {
    // Degenerate: query point is the center. Pick an arbitrary point.
    const point = { x: center.x + radius, y: center.y }
    return { point, distance: radius, t: 0 }
  }
  const dir = V.scale(d, 1 / len)
  const point = V.add(center, V.scale(dir, radius))
  return {
    point,
    distance: Math.abs(len - radius),
    t: Math.atan2(dir.y, dir.x),
  }
}

/**
 * Offsets the segment `a`→`b` perpendicularly by `distance`, towards whichever
 * side the point `side` (typically the cursor) lies on — the core of AutoCAD's
 * OFFSET for a line. The result stays parallel to and the same length as the
 * original, shifted along the segment's unit normal; the sign of the shift is
 * the side `side` falls on, decided by the cross product of the direction with
 * `side - a`. Returns `null` for a degenerate (zero-length) segment.
 */
export function offsetSegment(
  a: Vec2,
  b: Vec2,
  distance: number,
  side: Vec2
): { readonly a: Vec2; readonly b: Vec2 } | null {
  const dir = V.sub(b, a)
  const len = V.length(dir)
  if (len < 1e-9) return null
  const unit = V.scale(dir, 1 / len)
  const normal = V.perpendicular(unit)
  const sign = V.cross(unit, V.sub(side, a)) >= 0 ? 1 : -1
  const shift = V.scale(normal, distance * sign)
  return { a: V.add(a, shift), b: V.add(b, shift) }
}

/**
 * Intersection of the two *infinite* lines through the given segment endpoints,
 * together with the parameters `t` (along `a1`→`a2`) and `u` (along `b1`→`b2`).
 * Returns `null` when the lines are parallel. A parameter in `[0, 1]` means the
 * point falls within that segment; outside means it lies on the segment's
 * extension. This underpins both the real and the "apparent" (extended)
 * intersection object snaps.
 */
export function infiniteLineIntersection(
  a1: Vec2,
  a2: Vec2,
  b1: Vec2,
  b2: Vec2
): { readonly point: Vec2; readonly t: number; readonly u: number } | null {
  const r = V.sub(a2, a1)
  const s = V.sub(b2, b1)
  const denom = V.cross(r, s)
  // `|cross| = |r|·|s|·sin θ`, so dividing out the magnitudes makes this a test
  // on the angle alone — the same tolerance holds for a drawing in millimetres
  // and one in kilometres. A zero-length segment falls out here too.
  if (Math.abs(denom) <= PARALLEL_SINE_EPSILON * V.length(r) * V.length(s)) {
    return null
  }
  const qp = V.sub(b1, a1)
  const t = V.cross(qp, s) / denom
  const u = V.cross(qp, r) / denom
  return { point: V.add(a1, V.scale(r, t)), t, u }
}

/**
 * Intersection points between two line segments.
 * Returns 0 or 1 points (segments are treated as finite).
 */
export function segmentSegmentIntersection(
  a1: Vec2,
  a2: Vec2,
  b1: Vec2,
  b2: Vec2
): Vec2 | null {
  const x = infiniteLineIntersection(a1, a2, b1, b2)
  if (!x) return null
  if (x.t < 0 || x.t > 1 || x.u < 0 || x.u > 1) return null
  return x.point
}

/** A resolved fillet: the arc tangent to two lines and where it touches them. */
export interface FilletResult {
  /** Intersection of the two (infinite) lines — the corner being rounded. */
  readonly corner: Vec2
  /** Centre of the fillet arc (equals `corner` when `radius` is 0). */
  readonly center: Vec2
  /** The realised arc radius (0 when the lines are merely joined at the corner). */
  readonly radius: number
  /** Tangent point on the first / second line, where each line is trimmed to. */
  readonly tangent1: Vec2
  readonly tangent2: Vec2
  /** Unit ray from the corner toward each line's kept (picked) side. */
  readonly direction1: Vec2
  readonly direction2: Vec2
  /** Arc angles about `center`, CCW `startAngle`→`endAngle` (the minor arc). */
  readonly startAngle: number
  readonly endAngle: number
}

/**
 * The fillet (rounded corner) of radius `radius` between the two lines `a1`→`a2`
 * and `b1`→`b2` — AutoCAD's FILLET. `pick1`/`pick2` are the points where the
 * user clicked each line; they select which of the four corners to round (the
 * arc sits in the wedge between the rays pointing from the corner toward the
 * picks). The lines are meant to be trimmed/extended to `tangent1`/`tangent2`.
 *
 * Returns `null` when the lines are parallel (no corner) or the picked rays are
 * coincident/opposite (no wedge to inscribe an arc in). With `radius` 0 the arc
 * collapses to the corner (`tangent1 = tangent2 = center = corner`), i.e. the
 * lines simply meet at the intersection.
 */
export function filletLines(
  a1: Vec2,
  a2: Vec2,
  b1: Vec2,
  b2: Vec2,
  pick1: Vec2,
  pick2: Vec2,
  radius: number
): FilletResult | null {
  const crossing = infiniteLineIntersection(a1, a2, b1, b2)
  if (!crossing) return null // parallel — no corner to fillet
  const corner = crossing.point

  const direction1 = keptDirection(a1, a2, corner, pick1)
  const direction2 = keptDirection(b1, b2, corner, pick2)
  if (!direction1 || !direction2) return null // degenerate (zero-length) line

  const half = Math.acos(clamp(V.dot(direction1, direction2), -1, 1)) / 2
  const sinHalf = Math.sin(half)
  if (sinHalf < 1e-9) return null // picked rays coincide (same line)

  if (radius <= 0) {
    return {
      corner,
      center: corner,
      radius: 0,
      tangent1: corner,
      tangent2: corner,
      direction1,
      direction2,
      startAngle: 0,
      endAngle: 0,
    }
  }

  const bisectorSum = V.add(direction1, direction2)
  if (V.length(bisectorSum) < 1e-9) return null // rays opposite (collinear)
  const tanHalf = Math.tan(half)
  if (tanHalf < 1e-9) return null

  const tangentDistance = radius / tanHalf
  const tangent1 = V.add(corner, V.scale(direction1, tangentDistance))
  const tangent2 = V.add(corner, V.scale(direction2, tangentDistance))
  const center = V.add(
    corner,
    V.scale(V.normalize(bisectorSum), radius / sinHalf)
  )

  let startAngle = Math.atan2(tangent1.y - center.y, tangent1.x - center.x)
  let endAngle = Math.atan2(tangent2.y - center.y, tangent2.x - center.x)
  // Keep the minor arc (its sweep is π − wedge, always < π) with the CCW
  // start→end invariant every ArcEntity relies on.
  if (normalizeAngle(endAngle - startAngle) > Math.PI) {
    ;[startAngle, endAngle] = [endAngle, startAngle]
  }

  return {
    corner,
    center,
    radius,
    tangent1,
    tangent2,
    direction1,
    direction2,
    startAngle,
    endAngle,
  }
}

/** A resolved chamfer: where each line is cut and the corner it replaces. */
export interface ChamferResult {
  /** Intersection of the two (infinite) lines — the corner being cut off. */
  readonly corner: Vec2
  /** Cut point on the first / second line, measured from the corner. */
  readonly point1: Vec2
  readonly point2: Vec2
  /** Unit ray from the corner toward each line's kept (picked) side. */
  readonly direction1: Vec2
  readonly direction2: Vec2
}

/**
 * The chamfer (bevel) between two lines — AutoCAD's CHAMFER distance method.
 * `distance1`/`distance2` are measured from the corner along each line's kept
 * side; the segment `point1`→`point2` is the bevel, and the lines are meant to
 * be trimmed/extended to those points. `pick1`/`pick2` choose which of the four
 * corners is cut, exactly as in {@link filletLines}.
 *
 * Returns `null` when the lines are parallel or collinear (no corner to cut).
 * Both distances 0 collapses the bevel to the corner, joining the lines.
 */
export function chamferLines(
  a1: Vec2,
  a2: Vec2,
  b1: Vec2,
  b2: Vec2,
  pick1: Vec2,
  pick2: Vec2,
  distance1: number,
  distance2: number
): ChamferResult | null {
  // A zero-radius fillet resolves exactly the geometry a chamfer needs: the
  // corner plus the unit ray along each line's picked side.
  const wedge = filletLines(a1, a2, b1, b2, pick1, pick2, 0)
  if (!wedge) return null
  const { corner, direction1, direction2 } = wedge
  // Opposite rays mean the picked sides are collinear: no wedge to cut.
  if (V.length(V.add(direction1, direction2)) < 1e-9) return null

  return {
    corner,
    point1: V.add(corner, V.scale(direction1, Math.max(0, distance1))),
    point2: V.add(corner, V.scale(direction2, Math.max(0, distance2))),
    direction1,
    direction2,
  }
}

/** Unit direction of a line, flipped to point from `corner` toward `pick`. */
function keptDirection(
  a: Vec2,
  b: Vec2,
  corner: Vec2,
  pick: Vec2
): Vec2 | null {
  const dir = V.sub(b, a)
  const len = V.length(dir)
  if (len < 1e-9) return null
  const unit = V.scale(dir, 1 / len)
  return V.dot(V.sub(pick, corner), unit) >= 0 ? unit : V.scale(unit, -1)
}

function clamp(value: number, min: number, max: number): number {
  return value < min ? min : value > max ? max : value
}

/** Intersection points between two circles (0, 1 or 2 points). */
export function circleCircleIntersection(
  c0: Vec2,
  r0: number,
  c1: Vec2,
  r1: number
): Vec2[] {
  const d = V.distance(c0, c1)
  if (d === 0) return [] // concentric
  if (d > r0 + r1) return [] // too far apart
  if (d < Math.abs(r0 - r1)) return [] // one inside the other
  const a = (r0 * r0 - r1 * r1 + d * d) / (2 * d)
  const hSq = r0 * r0 - a * a
  const h = hSq > 0 ? Math.sqrt(hSq) : 0
  const dir = V.scale(V.sub(c1, c0), 1 / d)
  const mid = V.add(c0, V.scale(dir, a))
  const perp = V.perpendicular(dir)
  if (h === 0) return [mid]
  return [V.add(mid, V.scale(perp, h)), V.sub(mid, V.scale(perp, h))]
}

/**
 * The circle passing through three points (the circumscribed circle), or `null`
 * when the points are collinear (no finite circle exists). Used by the CIRCLE
 * command's 3-Point mode.
 */
export function circleFrom3Points(
  a: Vec2,
  b: Vec2,
  c: Vec2
): { center: Vec2; radius: number } | null {
  const d = 2 * (a.x * (b.y - c.y) + b.x * (c.y - a.y) + c.x * (a.y - b.y))
  if (Math.abs(d) < 1e-9) return null
  const aSq = a.x * a.x + a.y * a.y
  const bSq = b.x * b.x + b.y * b.y
  const cSq = c.x * c.x + c.y * c.y
  const center: Vec2 = {
    x: (aSq * (b.y - c.y) + bSq * (c.y - a.y) + cSq * (a.y - b.y)) / d,
    y: (aSq * (c.x - b.x) + bSq * (a.x - c.x) + cSq * (b.x - a.x)) / d,
  }
  return { center, radius: V.distance(center, a) }
}

/** The point on a circle of `center`/`radius` at the given `angle` (radians). */
export function polarPoint(center: Vec2, radius: number, angle: number): Vec2 {
  return {
    x: center.x + Math.cos(angle) * radius,
    y: center.y + Math.sin(angle) * radius,
  }
}

/**
 * Converts a polyline *bulge* (AutoCAD's arc-segment encoding, `tan(θ/4)` where
 * θ is the signed included angle) into a concrete arc from `p0` to `p1`. The
 * result is expressed the way {@link closestPointOnArc} and the arc entity use
 * it: a CCW sweep from `startAngle` to `endAngle` that traces the segment. A
 * positive bulge curves counter-clockwise, a negative one clockwise; the two
 * angles are ordered so the CCW sweep always covers exactly the segment's arc.
 */
export function bulgeToArc(
  p0: Vec2,
  p1: Vec2,
  bulge: number
): { center: Vec2; radius: number; startAngle: number; endAngle: number } {
  const k = (1 - bulge * bulge) / (2 * bulge)
  const cx = (p0.x + p1.x) / 2 + ((p0.y - p1.y) / 2) * k
  const cy = (p0.y + p1.y) / 2 + ((p1.x - p0.x) / 2) * k
  const center = { x: cx, y: cy }
  const radius = Math.hypot(p0.x - cx, p0.y - cy)
  const a0 = Math.atan2(p0.y - cy, p0.x - cx)
  const a1 = Math.atan2(p1.y - cy, p1.x - cx)
  // For a CCW arc the segment runs p0→p1; for a CW one it is the same curve
  // swept the other way, so swap the ends to keep a valid CCW description.
  return bulge > 0
    ? { center, radius, startAngle: a0, endAngle: a1 }
    : { center, radius, startAngle: a1, endAngle: a0 }
}

/**
 * The bulge (`tan(θ/4)`) of the circular arc from `p0` to `p1` that bulges to
 * pass `through` — the inverse used by the polyline curvature grip. The sign
 * follows the same convention as {@link bulgeToArc}. The value comes from the
 * perpendicular component of `through` about the chord midpoint (its sagitta
 * over the half-chord), so it stays stable as the grip is dragged off the
 * perpendicular bisector. Returns 0 for a degenerate chord.
 */
export function bulgeThroughPoint(p0: Vec2, p1: Vec2, through: Vec2): number {
  const chord = V.sub(p1, p0)
  const len = V.length(chord)
  if (len < 1e-9) return 0
  const unit = V.scale(chord, 1 / len)
  // The right-hand normal matches bulgeToArc's sign: a positive bulge places
  // the arc on this side of the chord (for p0→p1 along +x that is −y).
  const normal: Vec2 = { x: unit.y, y: -unit.x }
  const sagitta = V.dot(V.sub(through, V.midpoint(p0, p1)), normal)
  return sagitta / (len / 2)
}

/** Normalises an angle (radians) into the `[0, 2π)` range. */
export function normalizeAngle(angle: number): number {
  const twoPi = Math.PI * 2
  const r = angle % twoPi
  if (r >= 0) return r
  const shifted = r + twoPi
  // A vanishingly small negative angle is absorbed by the addition and lands on
  // exactly 2π, which is outside the half-open range callers rely on.
  return shifted < twoPi ? shifted : 0
}

/** Normalises an angle (degrees) into the `[0, 360)` range. */
export function normalizeDegrees(degrees: number): number {
  const r = degrees % 360
  if (r >= 0) return r
  const shifted = r + 360
  // As in normalizeAngle: a vanishingly small negative angle is absorbed by the
  // addition and would otherwise land on exactly 360.
  return shifted < 360 ? shifted : 0
}

/**
 * Whether `angle` falls within the arc that sweeps counter-clockwise from
 * `startAngle` to `endAngle`. A degenerate zero sweep is treated as a full
 * circle (every angle is inside).
 */
export function angleWithinSweep(
  startAngle: number,
  endAngle: number,
  angle: number
): boolean {
  let sweep = normalizeAngle(endAngle - startAngle)
  if (sweep < 1e-9) sweep = Math.PI * 2
  return normalizeAngle(angle - startAngle) <= sweep + 1e-9
}

/**
 * Closest point on an arc (the portion of a circle sweeping CCW from
 * `startAngle` to `endAngle`). If the foot of the perpendicular onto the full
 * circle lies within the sweep it is returned; otherwise the nearer of the two
 * arc endpoints is. `t` carries the angle (radians) as for {@link
 * closestPointOnCircle}.
 */
export function closestPointOnArc(
  center: Vec2,
  radius: number,
  startAngle: number,
  endAngle: number,
  p: Vec2
): ClosestResult {
  const onCircle = closestPointOnCircle(center, radius, p)
  if (angleWithinSweep(startAngle, endAngle, onCircle.t)) return onCircle
  const start = polarPoint(center, radius, startAngle)
  const end = polarPoint(center, radius, endAngle)
  const ds = V.distance(start, p)
  const de = V.distance(end, p)
  return ds <= de
    ? { point: start, distance: ds, t: startAngle }
    : { point: end, distance: de, t: endAngle }
}

/**
 * A point on the ellipse centred at `center` whose semi-major axis is the
 * vector `majorAxis` and whose semi-minor axis is `ratio` times as long, at
 * parameter `t`:
 *
 *     p(t) = c + a·cos t + b·sin t,  b = perpendicular(a) · ratio
 *
 * This is AutoCAD's own parametrisation (the ELLIPSE entity stores exactly
 * `c`, `a` and `ratio`, and its start/end *parameters* are this `t`). Note `t`
 * is **not** the angle the point subtends at the centre unless `ratio` is 1 —
 * see {@link ellipseParamFromAngle}.
 */
export function ellipsePoint(
  center: Vec2,
  majorAxis: Vec2,
  ratio: number,
  t: number
): Vec2 {
  const minor = V.scale(V.perpendicular(majorAxis), ratio)
  return {
    x: center.x + majorAxis.x * Math.cos(t) + minor.x * Math.sin(t),
    y: center.y + majorAxis.y * Math.cos(t) + minor.y * Math.sin(t),
  }
}

/**
 * The parameter of the point where the ray leaving the centre at `angle`
 * (radians, measured from the major axis) meets the ellipse: `tan t = tan(angle)
 * / ratio`. This is the conversion AutoCAD's elliptical-arc prompts need — they
 * ask for an *angle* while the entity stores a parameter.
 */
export function ellipseParamFromAngle(ratio: number, angle: number): number {
  return Math.atan2(Math.sin(angle) / ratio, Math.cos(angle))
}

/** Inverse of {@link ellipseParamFromAngle}. */
export function ellipseAngleFromParam(ratio: number, t: number): number {
  return Math.atan2(Math.sin(t) * ratio, Math.cos(t))
}

/**
 * How finely the parameter range is scanned before refining. The closest point
 * on an ellipse has **no closed form** — it reduces to a quartic — so it is
 * solved numerically, and an iteration needs a starting point already in the
 * right basin: the squared distance can have up to four stationary points.
 */
const ELLIPSE_CLOSEST_SAMPLES = 48

/** Cap on the Newton steps, so a pathological query cannot spin. */
const ELLIPSE_CLOSEST_ITERATIONS = 12

/**
 * Closest point on an ellipse, or on the portion of it sweeping from
 * `startParam` to `endParam` when both are given (an elliptical arc). `t`
 * carries the ellipse parameter.
 *
 * Solved by scanning {@link ELLIPSE_CLOSEST_SAMPLES} parameters and refining
 * the best with Newton's method on `d²(t)'`, capped at
 * {@link ELLIPSE_CLOSEST_ITERATIONS} steps and clamped to the swept range. The
 * refinement is kept only when it actually improves on the sample, so a step
 * that escapes towards a maximum cannot make the answer worse than the scan.
 */
export function closestPointOnEllipse(
  center: Vec2,
  majorAxis: Vec2,
  ratio: number,
  p: Vec2,
  startParam?: number,
  endParam?: number
): ClosestResult {
  const a = V.length(majorAxis)
  if (a < 1e-12) {
    return { point: center, distance: V.distance(center, p), t: 0 }
  }
  const axis = V.scale(majorAxis, 1 / a)
  const normal = V.perpendicular(axis)
  const b = a * ratio
  const offset = V.sub(p, center)
  // The query point in the ellipse's own frame, where it is axis-aligned.
  const x = V.dot(offset, axis)
  const y = V.dot(offset, normal)

  const bounded = startParam !== undefined && endParam !== undefined
  const start = bounded ? startParam : 0
  let sweep = bounded ? normalizeAngle(endParam - startParam) : Math.PI * 2
  if (sweep < 1e-9) sweep = Math.PI * 2

  const squaredDistance = (t: number): number => {
    const dx = a * Math.cos(t) - x
    const dy = b * Math.sin(t) - y
    return dx * dx + dy * dy
  }

  let best = start
  let bestSq = Infinity
  for (let i = 0; i <= ELLIPSE_CLOSEST_SAMPLES; i++) {
    const t = start + (sweep * i) / ELLIPSE_CLOSEST_SAMPLES
    const sq = squaredDistance(t)
    if (sq < bestSq) {
      bestSq = sq
      best = t
    }
  }

  let t = best
  for (let i = 0; i < ELLIPSE_CLOSEST_ITERATIONS; i++) {
    const sin = Math.sin(t)
    const cos = Math.cos(t)
    const slope = (b * b - a * a) * sin * cos + a * x * sin - b * y * cos
    const curvature =
      (b * b - a * a) * Math.cos(2 * t) + a * x * cos + b * y * sin
    if (Math.abs(curvature) < 1e-12) break
    let next = t - slope / curvature
    if (!Number.isFinite(next)) break
    if (bounded) next = Math.min(Math.max(next, start), start + sweep)
    const converged = Math.abs(next - t) < 1e-12
    t = next
    if (converged) break
  }
  if (squaredDistance(t) > bestSq) t = best

  const point = ellipsePoint(center, majorAxis, ratio, t)
  return { point, distance: V.distance(point, p), t }
}

/**
 * The arc passing through three points, oriented so it runs from `a` through
 * `b` to `c`. Returns the circumscribed circle's centre/radius plus the start
 * and end angles of a CCW sweep (they are swapped when the natural order is
 * clockwise). `null` when the points are collinear.
 */
export function arcFrom3Points(
  a: Vec2,
  b: Vec2,
  c: Vec2
): {
  center: Vec2
  radius: number
  startAngle: number
  endAngle: number
} | null {
  const circle = circleFrom3Points(a, b, c)
  if (!circle) return null
  const { center, radius } = circle
  const angA = Math.atan2(a.y - center.y, a.x - center.x)
  const angB = Math.atan2(b.y - center.y, b.x - center.x)
  const angC = Math.atan2(c.y - center.y, c.x - center.x)
  // If b lies on the CCW path from a to c, the arc is CCW a→c; otherwise the
  // sweep through b runs the other way, expressed as the CCW arc c→a.
  const sweepToC = normalizeAngle(angC - angA)
  const sweepToB = normalizeAngle(angB - angA)
  return sweepToB <= sweepToC
    ? { center, radius, startAngle: angA, endAngle: angC }
    : { center, radius, startAngle: angC, endAngle: angA }
}

/**
 * The two tangent points on a circle from an external point `p`. Empty when
 * `p` lies on or inside the circle (no tangent exists). Each tangent line
 * touches the circle at a right angle to its radius — used by the tangent
 * object snap.
 */
export function tangentPointsFromPoint(
  p: Vec2,
  center: Vec2,
  radius: number
): Vec2[] {
  const d = V.sub(p, center)
  const dist = V.length(d)
  if (dist <= radius) return []
  const half = Math.acos(radius / dist)
  const base = Math.atan2(d.y, d.x)
  return [base + half, base - half].map((angle) => ({
    x: center.x + Math.cos(angle) * radius,
    y: center.y + Math.sin(angle) * radius,
  }))
}

/** Intersection points between a line segment and a circle (0, 1 or 2). */
export function segmentCircleIntersection(
  a: Vec2,
  b: Vec2,
  center: Vec2,
  radius: number
): Vec2[] {
  const d = V.sub(b, a)
  const f = V.sub(a, center)
  const A = V.dot(d, d)
  if (A === 0) return []
  const B = 2 * V.dot(f, d)
  const C = V.dot(f, f) - radius * radius
  const disc = B * B - 4 * A * C
  if (disc < 0) return []
  const sqrt = Math.sqrt(disc)
  const points: Vec2[] = []
  for (const t of [(-B - sqrt) / (2 * A), (-B + sqrt) / (2 * A)]) {
    if (t >= 0 && t <= 1) points.push(V.add(a, V.scale(d, t)))
  }
  return points
}

/**
 * Intersection points between a line segment and an arc — the subset of the
 * segment/circle intersections whose angle falls within the arc's CCW sweep
 * from `startAngle` to `endAngle`.
 */
export function segmentArcIntersection(
  a: Vec2,
  b: Vec2,
  center: Vec2,
  radius: number,
  startAngle: number,
  endAngle: number
): Vec2[] {
  return segmentCircleIntersection(a, b, center, radius).filter((p) =>
    angleWithinSweep(
      startAngle,
      endAngle,
      Math.atan2(p.y - center.y, p.x - center.x)
    )
  )
}

/**
 * Parametric intersections (t along the *infinite* line through `a`→`b`, where
 * 0 = `a` and 1 = `b`) with a circle — 0, 1 or 2 values, unbounded so points on
 * the segment's extension are included. Unlike {@link segmentCircleIntersection}
 * the `t` values are not clamped to the segment, which is what EXTEND needs to
 * find a circular boundary that lies past an endpoint.
 */
export function lineCircleIntersectionParams(
  a: Vec2,
  b: Vec2,
  center: Vec2,
  radius: number
): number[] {
  const d = V.sub(b, a)
  const f = V.sub(a, center)
  const A = V.dot(d, d)
  if (A === 0) return []
  const B = 2 * V.dot(f, d)
  const C = V.dot(f, f) - radius * radius
  const disc = B * B - 4 * A * C
  if (disc < 0) return []
  const sqrt = Math.sqrt(disc)
  if (disc === 0) return [-B / (2 * A)]
  return [(-B - sqrt) / (2 * A), (-B + sqrt) / (2 * A)]
}

/** Intersection of two infinite rays (lines), or `null` when (near) parallel. */
export function intersectRays(a: Ray, b: Ray): Vec2 | null {
  const denom = V.cross(a.dir, b.dir)
  if (Math.abs(denom) < 1e-12) return null
  const diff = V.sub(b.origin, a.origin)
  const t = V.cross(diff, b.dir) / denom
  return V.add(a.origin, V.scale(a.dir, t))
}

export function projectPointOntoRay(p: Vec2, ray: Ray): Vec2 {
  const t = V.dot(V.sub(p, ray.origin), ray.dir)
  return V.add(ray.origin, V.scale(ray.dir, t))
}

/** A line (infinite, through `a` and `b`) or a circle a circle can touch. */
export type TangentTarget =
  | { readonly kind: "line"; readonly a: Vec2; readonly b: Vec2 }
  | { readonly kind: "circle"; readonly center: Vec2; readonly radius: number }

/** A circle tangent to two targets: its centre and where it touches each. */
export interface TangentCircle {
  readonly center: Vec2
  readonly touchFirst: Vec2
  readonly touchSecond: Vec2
}

/**
 * Every circle of radius `r` tangent to both targets. Its centre lies at `r`
 * from each — on a line's two parallels, on a circle's concentric circles of
 * radius `R + r` and `|R − r|` — so the centres are where those loci cross.
 */
export function circlesTangentToBoth(
  first: TangentTarget,
  second: TangentTarget,
  r: number
): TangentCircle[] {
  if (!(r > 0)) return []
  const out: TangentCircle[] = []
  for (const a of centreLoci(first, r)) {
    for (const b of centreLoci(second, r)) {
      for (const center of lociCrossings(a, b)) {
        const touchFirst = touchPoint(first, center, r)
        const touchSecond = touchPoint(second, center, r)
        if (touchFirst && touchSecond) {
          out.push({ center, touchFirst, touchSecond })
        }
      }
    }
  }
  return out
}

function centreLoci(target: TangentTarget, r: number): TangentTarget[] {
  if (target.kind === "circle") {
    const inner = Math.abs(target.radius - r)
    return [
      { ...target, radius: target.radius + r },
      ...(inner > 1e-12 ? [{ ...target, radius: inner }] : []),
    ]
  }
  const dir = V.sub(target.b, target.a)
  const len = V.length(dir)
  if (len < 1e-12) return []
  const shift = V.scale(V.perpendicular(dir), r / len)
  return [-1, 1].map((sign) => ({
    kind: "line" as const,
    a: V.add(target.a, V.scale(shift, sign)),
    b: V.add(target.b, V.scale(shift, sign)),
  }))
}

function lociCrossings(a: TangentTarget, b: TangentTarget): Vec2[] {
  if (a.kind === "line" && b.kind === "line") {
    const hit = infiniteLineIntersection(a.a, a.b, b.a, b.b)
    return hit ? [hit.point] : []
  }
  if (a.kind === "circle" && b.kind === "circle") {
    return circleCircleIntersection(a.center, a.radius, b.center, b.radius)
  }
  if (a.kind === "circle") return lociCrossings(b, a)
  if (b.kind !== "circle") return []
  const d = V.sub(a.b, a.a)
  return lineCircleIntersectionParams(a.a, a.b, b.center, b.radius).map((t) =>
    V.add(a.a, V.scale(d, t))
  )
}

function touchPoint(
  target: TangentTarget,
  center: Vec2,
  r: number
): Vec2 | null {
  if (target.kind === "line") {
    return closestPointOnInfiniteLine(target.a, target.b, center).point
  }
  const away = V.sub(center, target.center)
  const len = V.length(away)
  if (len < 1e-12) return null
  // The near side, unless the target lies inside the new circle (r > R on
  // the inner locus), which it then touches on its far side.
  const near = V.add(target.center, V.scale(away, target.radius / len))
  const far = V.sub(target.center, V.scale(away, target.radius / len))
  return Math.abs(V.distance(center, near) - r) <=
    Math.abs(V.distance(center, far) - r)
    ? near
    : far
}
