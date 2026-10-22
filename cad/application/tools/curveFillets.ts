import { Vec2, V } from "../../geometry/Vec2"
import {
  bulgeThroughPoint,
  circleCircleIntersection,
  closestPointOnInfiniteLine,
  infiniteLineIntersection,
  lineCircleIntersectionParams,
  normalizeAngle,
} from "../../geometry/primitives"
import type { PolylineSegmentGeometry } from "../../domain/entities"
import type { CornerCut } from "./polylineCorners"

/**
 * What FILLET rounds a corner between: a line or a polyline's segment, an arc
 * segment standing for its whole circle and a line for its whole line, as
 * AutoCAD 2023's console extends either to meet the other.
 */
export type Curve = PolylineSegmentGeometry

/** Which end of a curve a corner keeps: its `a` (start) or its `b` (end). */
export type CurveEnd = "a" | "b"

/**
 * One side of a corner: the curve kept from the corner toward its `far` end,
 * and its unit travel tangent at the corner — into it for the incoming side,
 * out of it for the outgoing one.
 */
export type FilletSide =
  | { readonly kind: "line"; readonly tangent: Vec2; readonly far: Vec2 }
  | {
      readonly kind: "arc"
      readonly tangent: Vec2
      readonly center: Vec2
      readonly radius: number
      /** Whether the kept arc turns counter-clockwise from the corner to `far`. */
      readonly ccw: boolean
      readonly far: Vec2
    }

const EPS = 1e-9

/**
 * The side of `curve` a corner at `corner` keeps toward its end `keep`:
 * `incoming` when it arrives at the corner (FILLET's first), else it leaves.
 * An arc's kept part runs round its circle from the corner, in the arc's own
 * turn toward `b` and against it toward `a`, past the arc's end if the corner
 * lies beyond it.
 */
export function keptSide(
  curve: Curve,
  corner: Vec2,
  keep: CurveEnd,
  incoming: boolean
): FilletSide {
  const far = keep === "a" ? curve.a : curve.b
  if (curve.kind === "line") {
    const away = V.normalize(V.sub(curve.b, curve.a))
    const outward = keep === "b" ? away : negate(away)
    return { kind: "line", tangent: incoming ? negate(outward) : outward, far }
  }
  const ccw = curve.bulge >= 0 === (keep === "b")
  const radial = V.normalize(V.sub(corner, curve.center))
  const outward = ccw
    ? V.perpendicular(radial)
    : negate(V.perpendicular(radial))
  return {
    kind: "arc",
    tangent: incoming ? negate(outward) : outward,
    center: curve.center,
    radius: curve.radius,
    ccw,
    far,
  }
}

/**
 * Where two curves cross, a line taken whole and an arc as its circle: the
 * crossing nearest `near`, or `null` when they do not meet.
 */
export function curveCrossing(
  first: Curve,
  second: Curve,
  near: Vec2
): Vec2 | null {
  if (first.kind === "line" && second.kind === "line") {
    return (
      infiniteLineIntersection(first.a, first.b, second.a, second.b)?.point ??
      null
    )
  }
  if (first.kind === "arc" && second.kind === "arc") {
    return nearestPoint(
      circleCircleIntersection(
        first.center,
        first.radius,
        second.center,
        second.radius
      ),
      near
    )
  }
  const [line, arc] = first.kind === "line" ? [first, second] : [second, first]
  if (arc.kind !== "arc") return null
  return nearestPoint(
    lineCirclePoints(line.a, line.b, arc.center, arc.radius),
    near
  )
}

/**
 * The end of `curve` a pick at `pick` keeps against a corner at `corner`: the
 * one on the pick's side of it — along a line, or round an arc's circle
 * measured in the arc's own turn from its start.
 */
export function keptEnd(curve: Curve, corner: Vec2, pick: Vec2): CurveEnd {
  if (curve.kind === "line") {
    return V.dot(V.sub(pick, corner), V.sub(curve.b, curve.a)) >= 0 ? "b" : "a"
  }
  const angle = (point: Vec2) =>
    Math.atan2(point.y - curve.center.y, point.x - curve.center.x)
  const start = angle(curve.a)
  const turned = (point: Vec2) =>
    curve.bulge >= 0
      ? normalizeAngle(angle(point) - start)
      : normalizeAngle(start - angle(point))
  const sweep = turned(curve.b)
  // Each measure is taken within half a turn either side of the arc's middle,
  // so a corner just before its start reads as before it, not near the end.
  const centred = (point: Vec2) => {
    const t = turned(point)
    return t > sweep / 2 + Math.PI ? t - 2 * Math.PI : t
  }
  return centred(pick) >= centred(corner) ? "b" : "a"
}

/**
 * A corner rounded at `radius` between a side arriving at `corner` and one
 * leaving it — the cut on each and the bulge from the first to the second —,
 * or met sharp at radius 0. `null` when the two run on as one (a tangent
 * corner) or the arc's tangent points fall off the kept parts: AutoCAD
 * 2023's console says `Cannot fillet between these two entities.`
 */
export function filletSides(
  inSide: FilletSide,
  outSide: FilletSide,
  corner: Vec2,
  radius: number
): CornerCut | null {
  if (turnOf(inSide, outSide) === 0) return null
  if (radius <= 0) return { entry: corner, exit: corner, bulge: 0 }
  return solveCornerFillet(inSide, outSide, corner, radius)
}

/**
 * The fillet circle of `radius` tangent to both sides, on the side the
 * corner turns to — read from the kept parts' chords, as AutoCAD 2027's
 * console reads an arc's (probes corners/p219, p322, p362–p365): where the
 * chords turn against the tangents, it lies in the wedge across the corner,
 * each side run on past it to the fillet. `null` at radius 0, at a tangent
 * corner, or when it does not fit.
 */
export function solveCornerFillet(
  inSide: FilletSide,
  outSide: FilletSide,
  corner: Vec2,
  radius: number
): CornerCut | null {
  if (radius <= 0) return null
  const tangentTurn = turnOf(inSide, outSide)
  if (tangentTurn === 0) return null // collinear — no corner to round
  const turn = chordTurn(inSide, outSide, corner) || tangentTurn
  const across = turn !== tangentTurn

  const nIn = interiorNormal(inSide.tangent, turn)
  const nOut = interiorNormal(outSide.tangent, turn)
  const locusIn = sideLocus(inSide, corner, nIn, radius)
  const locusOut = sideLocus(outSide, corner, nOut, radius)
  if (!locusIn || !locusOut) return null

  const ref = V.add(corner, V.scale(V.normalize(V.add(nIn, nOut)), radius))
  const center = intersectLoci(locusIn, locusOut, ref)
  if (!center) return null

  const entry = sideTangentPoint(inSide, corner, center)
  const exit = sideTangentPoint(outSide, corner, center)
  const on = across ? sideRunsOn : sideContains
  if (!on(inSide, entry, corner) || !on(outSide, exit, corner)) return null

  // WHY the bisector of the radii, not the way to the corner: `bulgeThroughPoint`
  // reads its point as the arc's middle, which beside an arc the corner's
  // direction is not (the console's -0.5176 where that gave -0.5144).
  const toEntry = V.normalize(V.sub(entry, center))
  const toExit = V.normalize(V.sub(exit, center))
  const mid = V.add(
    center,
    V.scale(V.normalize(V.add(toEntry, toExit)), radius)
  )
  return { entry, exit, bulge: bulgeThroughPoint(entry, exit, mid) }
}

function turnOf(inSide: FilletSide, outSide: FilletSide): number {
  const cross = V.cross(inSide.tangent, outSide.tangent)
  return Math.abs(cross) < EPS ? 0 : Math.sign(cross)
}

/** The way the chords of the kept parts turn at the corner, 0 in line. */
function chordTurn(
  inSide: FilletSide,
  outSide: FilletSide,
  corner: Vec2
): number {
  const into = V.normalize(V.sub(corner, inSide.far))
  const out = V.normalize(V.sub(outSide.far, corner))
  const cross = V.cross(into, out)
  return Math.abs(cross) < EPS ? 0 : Math.sign(cross)
}

/** The locus of fillet-circle centres at distance `radius` from a side, on the
 * corner-interior side: a parallel line, or a concentric circle. */
type CenterLocus =
  | { readonly kind: "line"; readonly p0: Vec2; readonly p1: Vec2 }
  | { readonly kind: "circle"; readonly center: Vec2; readonly radius: number }

function sideLocus(
  side: FilletSide,
  corner: Vec2,
  normal: Vec2,
  radius: number
): CenterLocus | null {
  if (side.kind === "line") {
    const p0 = V.add(corner, V.scale(normal, radius))
    return { kind: "line", p0, p1: V.add(p0, side.tangent) }
  }
  // Concentric circle: outside the arc when the interior lies outside, inside
  // otherwise. `rho` collapses when the fillet can't fit against the arc.
  const outward = V.normalize(V.sub(corner, side.center))
  const rho =
    V.dot(normal, outward) >= 0 ? side.radius + radius : side.radius - radius
  if (rho <= EPS) return null
  return { kind: "circle", center: side.center, radius: rho }
}

function intersectLoci(a: CenterLocus, b: CenterLocus, ref: Vec2): Vec2 | null {
  return nearestPoint(lociPoints(a, b), ref)
}

/** Every point where two loci meet. */
function lociPoints(a: CenterLocus, b: CenterLocus): Vec2[] {
  if (a.kind === "line" && b.kind === "line") {
    const x = infiniteLineIntersection(a.p0, a.p1, b.p0, b.p1)
    return x ? [x.point] : []
  }
  if (a.kind === "line" && b.kind === "circle") {
    return lineCirclePoints(a.p0, a.p1, b.center, b.radius)
  }
  if (a.kind === "circle" && b.kind === "line") {
    return lineCirclePoints(b.p0, b.p1, a.center, a.radius)
  }
  if (a.kind === "circle" && b.kind === "circle") {
    return circleCircleIntersection(a.center, a.radius, b.center, b.radius)
  }
  return []
}

/**
 * What FILLET rounds an ARC or a CIRCLE against: a line taken whole, and an
 * arc as its whole circle.
 */
export type WholeCurve =
  | { readonly kind: "line"; readonly a: Vec2; readonly b: Vec2 }
  | { readonly kind: "circle"; readonly center: Vec2; readonly radius: number }

/** A fillet circle's centre and where it touches the first and the second. */
export interface WholeFillet {
  readonly center: Vec2
  readonly first: Vec2
  readonly second: Vec2
}

/**
 * The fillet of `radius` AutoCAD 2023's console draws between two whole
 * curves, at least one a circle, or `null` (`No valid fillet with radius`).
 * As between two lines, it lies on the side of each — of a line, or in or out
 * of a circle — where the other was picked; of the two that leaves, the one
 * touching a line nearest its pick, else the one touching both nearest theirs
 * (acc/p1, r3, r9–r12).
 */
export function wholeFillet(
  first: WholeCurve,
  pick1: Vec2,
  second: WholeCurve,
  pick2: Vec2,
  radius: number
): WholeFillet | null {
  let best: WholeFillet | null = null
  let bestDistance = Infinity
  for (const locus1 of wholeLoci(first, radius)) {
    for (const locus2 of wholeLoci(second, radius)) {
      for (const center of lociPoints(locus1, locus2)) {
        if (
          sideOf(first, center) !== sideOf(first, pick2) ||
          sideOf(second, center) !== sideOf(second, pick1)
        ) {
          continue
        }
        const fillet = {
          center,
          first: touchPoint(first, center),
          second: touchPoint(second, center),
        }
        const distance =
          first.kind === "line"
            ? V.distance(fillet.first, pick1)
            : second.kind === "line"
              ? V.distance(fillet.second, pick2)
              : V.distance(fillet.first, pick1) +
                V.distance(fillet.second, pick2)
        if (distance < bestDistance - EPS) {
          bestDistance = distance
          best = fillet
        }
      }
    }
  }
  return best
}

/**
 * Where two whole curves meet for a fillet of radius 0: the crossing nearest
 * a line's pick, or between two circles the one nearest both picks.
 */
export function wholeCrossing(
  first: WholeCurve,
  pick1: Vec2,
  second: WholeCurve,
  pick2: Vec2
): Vec2 | null {
  if (first.kind === "circle" && second.kind === "circle") {
    return nearestPoint(
      circleCircleIntersection(
        first.center,
        first.radius,
        second.center,
        second.radius
      ),
      V.lerp(pick1, pick2, 0.5)
    )
  }
  const [line, circle, pick] =
    first.kind === "line" ? [first, second, pick1] : [second, first, pick2]
  if (line.kind !== "line" || circle.kind !== "circle") return null
  return nearestPoint(
    lineCirclePoints(line.a, line.b, circle.center, circle.radius),
    pick
  )
}

/** The loci of centres at `radius` from a whole curve, on both its sides. */
function wholeLoci(curve: WholeCurve, radius: number): CenterLocus[] {
  if (curve.kind === "line") {
    const along = V.sub(curve.b, curve.a)
    const normal = V.scale(V.normalize(V.perpendicular(along)), radius)
    return [normal, negate(normal)].map((offset) => {
      const p0 = V.add(curve.a, offset)
      return { kind: "line", p0, p1: V.add(p0, along) }
    })
  }
  const loci: CenterLocus[] = [
    { kind: "circle", center: curve.center, radius: curve.radius + radius },
  ]
  if (curve.radius - radius > EPS) {
    loci.push({
      kind: "circle",
      center: curve.center,
      radius: curve.radius - radius,
    })
  }
  return loci
}

/** Which side of a whole curve a point lies on: left of a line, out of a circle. */
function sideOf(curve: WholeCurve, point: Vec2): boolean {
  return curve.kind === "line"
    ? V.cross(V.sub(curve.b, curve.a), V.sub(point, curve.a)) >= 0
    : V.distance(point, curve.center) >= curve.radius
}

function touchPoint(curve: WholeCurve, center: Vec2): Vec2 {
  if (curve.kind === "line") {
    return closestPointOnInfiniteLine(curve.a, curve.b, center).point
  }
  return V.add(
    curve.center,
    V.scale(V.normalize(V.sub(center, curve.center)), curve.radius)
  )
}

/** The tangent point where the fillet circle at `center` touches a side. */
function sideTangentPoint(side: FilletSide, corner: Vec2, center: Vec2): Vec2 {
  if (side.kind === "line") {
    return closestPointOnInfiniteLine(
      corner,
      V.add(corner, side.tangent),
      center
    ).point
  }
  return V.add(
    side.center,
    V.scale(V.normalize(V.sub(center, side.center)), side.radius)
  )
}

/**
 * Whether a tangent point lies on the side's kept part, from the corner to its
 * far end — along the line, or round the arc's circle in its kept turn — so
 * the fillet doesn't fall off the object.
 */
function sideContains(side: FilletSide, point: Vec2, corner: Vec2): boolean {
  if (side.kind === "line") {
    const length = V.distance(corner, side.far)
    if (length < EPS) return V.distance(point, corner) < EPS
    const body = V.normalize(V.sub(side.far, corner))
    const along = V.dot(V.sub(point, corner), body)
    return along >= -EPS && along <= length + EPS
  }
  const angle = (p: Vec2) =>
    Math.atan2(p.y - side.center.y, p.x - side.center.x)
  const from = angle(corner)
  const turned = (p: Vec2) =>
    side.ccw ? normalizeAngle(angle(p) - from) : normalizeAngle(from - angle(p))
  const offset = turned(point)
  return offset <= turned(side.far) + EPS || offset >= 2 * Math.PI - EPS
}

/**
 * Whether a tangent point lies on the side run on past the corner, away from
 * its kept part — along the line, or round the arc's circle, by less than
 * half a turn.
 */
function sideRunsOn(side: FilletSide, point: Vec2, corner: Vec2): boolean {
  if (side.kind === "line") {
    return V.dot(V.sub(point, corner), V.sub(side.far, corner)) <= EPS
  }
  const angle = (p: Vec2) =>
    Math.atan2(p.y - side.center.y, p.x - side.center.x)
  const from = angle(corner)
  const offset = side.ccw
    ? normalizeAngle(angle(point) - from)
    : normalizeAngle(from - angle(point))
  return offset >= Math.PI || offset <= EPS
}

/** Points where the infinite line through `a`/`b` meets a circle. */
function lineCirclePoints(
  a: Vec2,
  b: Vec2,
  center: Vec2,
  radius: number
): Vec2[] {
  const dir = V.sub(b, a)
  return lineCircleIntersectionParams(a, b, center, radius).map((t) =>
    V.add(a, V.scale(dir, t))
  )
}

/** The point in `points` nearest `ref`, or `null` when there are none. */
function nearestPoint(points: readonly Vec2[], ref: Vec2): Vec2 | null {
  let best: Vec2 | null = null
  let bestDist = Infinity
  for (const p of points) {
    const d = V.distance(p, ref)
    if (d < bestDist) {
      bestDist = d
      best = p
    }
  }
  return best
}

/** The interior normal of a side's travel direction for a left (`turn` > 0) or
 * right (`turn` < 0) corner — the direction toward the fillet centre. */
function interiorNormal(tangent: Vec2, turn: number): Vec2 {
  const perp = V.perpendicular(tangent) // +90° (left)
  return turn > 0 ? perp : negate(perp)
}

function negate(v: Vec2): Vec2 {
  return { x: -v.x, y: -v.y }
}
