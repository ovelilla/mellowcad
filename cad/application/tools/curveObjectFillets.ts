import { Vec2, V } from "../../geometry/Vec2"
import {
  infiniteLineIntersection,
  normalizeAngle,
  signChanges,
} from "../../geometry/primitives"
import { type PlanarCurve, offsetFunctions } from "../../geometry/curveOffset"
import {
  ArcEntity,
  EllipseEntity,
  Entity,
  EntityId,
  LineEntity,
  SplineEntity,
  assignEntityLineweight,
  carryPlane,
  createArc,
  ellipseParamWithinSweep,
  ellipseSweepParams,
  ellipseWithSpan,
  entitiesBounds,
  isFullEllipse,
} from "../../domain/entities"
import type { LayerId } from "../../domain/layers"
import { LINEWEIGHT_BYLAYER, type Lineweight } from "../../domain/lineweights"
import {
  curveRunOn,
  curveSignedDistance,
  nearestParam,
  planarCurve,
} from "../../domain/splineOffset"
import {
  splineBreakPiece,
  splineGrown,
  splineRun,
} from "../../domain/splineEdits"
import type { CurveObject } from "./cornerObjects"
import {
  type RoundFillet,
  type RoundObject,
  keptAtCorner,
  keptFrom,
} from "./roundFillets"

/** What FILLET rounds an ELLIPSE or a SPLINE against: a line, an ARC, a CIRCLE or another of them. */
export type CurvePartner = LineEntity | RoundObject | CurveObject

/**
 * Why no fillet is made: `unable` is `Unable to fillet curves.` (the
 * tangents at the picks parallel, or no centre), `noValid` `No valid fillet
 * with radius` (an object would keep nothing), `nothing` a corner that
 * changes nothing or no crossing at radius 0, said by no word.
 */
export type CurveFilletRefusal = "unable" | "noValid" | "nothing"

/**
 * FILLET of an ELLIPSE or a SPLINE with a line, an ARC, a CIRCLE or another
 * of them, as AutoCAD 2027's console makes it (probes corners/p389–p482).
 *
 * At a radius each object is read as its tangent at the point picked — a
 * line as itself —, as two lines are filleted: the centre lies on the side
 * of each tangent the other was picked on (an elliptical arc's fillet inside
 * the ellipse though a line was picked outside, p446; a circle's inside it,
 * p453), where the curves' exact offsets cross (`offsetFunctions`), nearest
 * the two tangents' own fillet; tangents parallel, or no crossing,
 * `Unable to fillet curves.` (p325, p398, p470, p474). The arc is the part of
 * its circle facing where the tangents meet, which can be the long way round
 * (p389: 308°, whichever was picked first or drawn first and whichever way
 * either runs, p393–p396, p405–p412); each object is kept on the side it runs
 * on from the arc, tangent, a curve run on past its end to it (p446, p448):
 * a line, an ARC, an elliptical arc and an open spline trimmed or extended, a
 * CIRCLE, a closed ellipse and a closed spline left as they are (p450, p453,
 * p468). One that would keep nothing, `No valid fillet with radius` (p469).
 *
 * At radius 0 they meet where they cross — run on too (p237, p445), nearest
 * a line's pick, else both picks —, each kept on its picked side, an ARC and
 * an elliptical arc reached from the end its pick is nearer when the
 * crossing lies off it (p441–p445, p452, p455, p458, p461); no crossing,
 * nothing (p236, p471).
 *
 * The arc lies on the objects' layer, else the current one, and wears the
 * current lineweight, not the second's, nor the current colour (p472, p473,
 * p481). A spline's piece keeps its fit data, as BREAK's (p326, p441).
 */
export function filletCurveObjects(
  first: CurvePartner,
  pick1: Vec2,
  second: CurvePartner,
  pick2: Vec2,
  radius: number,
  current: {
    readonly layerId: LayerId
    readonly lineweight: Lineweight | typeof LINEWEIGHT_BYLAYER
  },
  arcId?: EntityId
): RoundFillet | CurveFilletRefusal {
  const bounds = entitiesBounds([first, second])
  const size = bounds ? V.distance(bounds.min, bounds.max) : 1
  const reach = 2 * size + 4 * radius + V.distance(pick1, pick2) + 1
  const one = reading(first, pick1, reach)
  const two = reading(second, pick2, reach)
  const [scanned, other] = one.curve ? [one, two] : [two, one]
  const curve = scanned.curve!

  if (radius <= 0) {
    const near = isLine(one)
      ? pick1
      : isLine(two)
        ? pick2
        : V.lerp(pick1, pick2, 0.5)
    const found = nearestRoot(
      scanned,
      (u) => other.distance(curve.point(u)),
      (u) => V.distance(curve.point(u), near)
    )
    if (!found) return "nothing"
    const corner = curve.point(found.t)
    const kept = [keptAt(one, corner), keptAt(two, corner)].filter(
      (entity): entity is Entity => entity !== null
    )
    return kept.length > 0
      ? { replaced: kept.map((entity) => entity.id), built: kept }
      : "nothing"
  }

  const meet = infiniteLineIntersection(
    one.at,
    V.add(one.at, one.along),
    two.at,
    V.add(two.at, two.along)
  )
  if (!meet) return "unable"
  // Each side is the one of its tangent at the pick the other was picked
  // on; a spline met on its growth, that growth's own (p448, p449). Of the
  // circles left, the one touching each curve nearest its pick along it, as
  // from the pick on (p446, p448, p453, p468: a closed spline's branch by
  // the pick, not another as near across); a line's, an ARC's or a CIRCLE's
  // pick counts for nothing, and of two as near the first round the curve
  // wins (p368: an ellipse picked on its axis, the ARC's pick nearer the
  // other).
  let best: { t: number; side: number; cost: number } | null = null
  for (const side of [1, -1]) {
    const offset = offsetFunctions(curve, side * radius)
    for (const otherSide of [1, -1]) {
      const found = nearestRoot(
        scanned,
        (u) => other.distance(offset.point(u)) - otherSide * radius,
        (u) => {
          const onOther = other.foot(offset.point(u))
          return sideAt(scanned, u, other.pick) === side &&
            sideAt(other, other.param(onOther), scanned.pick) === otherSide
            ? away(scanned, u) +
                (other.curve ? away(other, other.param(onOther)) : 0)
            : Infinity
        }
      )
      if (found && (!best || found.cost < best.cost)) best = { ...found, side }
    }
  }
  if (!best) return "unable"
  const center = offsetFunctions(curve, best.side * radius).point(best.t)
  const onScanned = curve.point(best.t)
  const onOther = other.foot(center)
  const [touch1, touch2] =
    scanned === one ? [onScanned, onOther] : [onOther, onScanned]

  const angle = (point: Vec2) =>
    normalizeAngle(Math.atan2(point.y - center.y, point.x - center.x))
  // The arc runs counter-clockwise: the object at its start comes into it
  // that way, the one at its end leaves it that way.
  const travel = (point: Vec2) => V.perpendicular(V.sub(point, center))
  const keptWith = (fromFirst: boolean) => {
    const kept1 = keptFromArc(
      one,
      touch1,
      fromFirst ? V.scale(travel(touch1), -1) : travel(touch1)
    )
    const kept2 = keptFromArc(
      two,
      touch2,
      fromFirst ? travel(touch2) : V.scale(travel(touch2), -1)
    )
    return kept1 === "noValid" || kept2 === "noValid"
      ? null
      : { fromFirst, kept: [kept1, kept2] }
  }
  const facing =
    normalizeAngle(angle(meet.point) - angle(touch1)) <=
    normalizeAngle(angle(touch2) - angle(touch1))
  // WHY the other way round where the facing one leaves a spline met on its
  // growth nothing: it keeps what it had (p448); a line, never (p469).
  const grown =
    onGrowth(one, one.param(touch1)) || onGrowth(two, two.param(touch2))
  const made = keptWith(facing) ?? (grown ? keptWith(!facing) : null)
  if (!made) return "noValid"
  const { fromFirst } = made
  const [from, to] = fromFirst ? [touch1, touch2] : [touch2, touch1]
  const placed = carryPlane(
    first,
    createArc(
      center,
      radius,
      angle(from),
      angle(to),
      first.layerId === second.layerId ? first.layerId : current.layerId,
      arcId
    )
  )
  const arc =
    current.lineweight === LINEWEIGHT_BYLAYER
      ? placed
      : (assignEntityLineweight(placed, current.lineweight) as ArcEntity)
  const kept = made.kept.filter((entity): entity is Entity => entity !== null)
  return { replaced: kept.map((entity) => entity.id), built: [...kept, arc] }
}

/**
 * An object as the fillet reads it: its point nearest the pick and its
 * direction there as it runs, its signed distance (positive on its left: in
 * a counter-clockwise circle), the point of it nearest a centre, and a
 * curve's own curve, run on (`curveRunOn`).
 */
interface Reading {
  readonly entity: CurvePartner
  readonly pick: Vec2
  readonly at: Vec2
  readonly along: Vec2
  distance(p: Vec2): number
  foot(p: Vec2): Vec2
  /** A curve's parameter at a point of it, and at its pick. */
  param(p: Vec2): number
  readonly picked: number
  readonly curve?: PlanarCurve
  /** An open spline's own parameters, inside its growths. */
  readonly drawn?: { readonly start: number; readonly end: number }
}

function reading(entity: CurvePartner, pick: Vec2, reach: number): Reading {
  if (entity.type === "line") {
    const along = V.sub(entity.end, entity.start)
    const unit = V.normalize(along)
    const foot = (p: Vec2) =>
      V.add(entity.start, V.scale(unit, V.dot(V.sub(p, entity.start), unit)))
    return {
      entity,
      pick,
      at: foot(pick),
      along,
      distance: (p) => V.cross(unit, V.sub(p, entity.start)),
      foot,
      param: () => 0,
      picked: 0,
    }
  }
  if (entity.type === "arc" || entity.type === "circle") {
    const { center, radius } = entity
    const foot = (p: Vec2) =>
      V.add(center, V.scale(V.normalize(V.sub(p, center)), radius))
    const at = foot(pick)
    return {
      entity,
      pick,
      at,
      along: V.perpendicular(V.sub(at, center)),
      distance: (p) => radius - V.distance(p, center),
      foot,
      param: () => 0,
      picked: 0,
    }
  }
  const run = curveRunOn(entity, reach)
  const curve = planarCurve(run)
  const param = (p: Vec2) => nearestParam(run, curve, p)
  const t = param(pick)
  return {
    entity,
    pick,
    at: curve.point(t),
    along: curve.first(t),
    distance: curveSignedDistance(run),
    foot: (p) => curve.point(param(p)),
    param,
    picked: t,
    curve,
    ...(entity.type === "spline" && !entity.closed
      ? { drawn: splineRun(entity) }
      : {}),
  }
}

function isLine(r: Reading): boolean {
  return r.entity.type === "line"
}

/**
 * The side of its tangent at the pick where `p` lies, 1 on its left; at `u`
 * on a spline's growth, the side of the growth's start.
 */
function sideAt(r: Reading, u: number, p: Vec2): number {
  const edge = !r.drawn
    ? null
    : u > r.drawn.end
      ? r.drawn.end
      : u < r.drawn.start
        ? r.drawn.start
        : null
  const at = edge === null ? r.at : r.curve!.point(edge)
  const along = edge === null ? r.along : r.curve!.first(edge)
  return V.cross(along, V.sub(p, at)) >= 0 ? 1 : -1
}

/** How far along a curve `u` lies from its pick, as a share of its run, round a closed one. */
function away(r: Reading, u: number): number {
  const curve = r.curve!
  const run = curve.end - curve.start
  const along = Math.abs(u - r.picked) / run
  return curve.closed ? Math.min(along, 1 - along) : along
}

/** Whether `u` lies on a spline's growth. */
function onGrowth(r: Reading, u: number): boolean {
  const hair = 1e-9 * Math.max(1, r.drawn ? r.drawn.end - r.drawn.start : 0)
  return !!r.drawn && (u > r.drawn.end + hair || u < r.drawn.start - hair)
}

/** Costs closer than this, in drawing units, are a tie. */
const TIE = 1e-9

/** Scan steps round a whole ellipse, and per control point of a spline. */
const ELLIPSE_SCAN = 720
const SPLINE_SCAN = 32

/**
 * The parameter of the curve where `f` crosses zero (`signChanges`, the one
 * root finder) that costs least, or null.
 */
function nearestRoot(
  r: Reading,
  f: (t: number) => number,
  cost: (t: number) => number
): { t: number; cost: number } | null {
  const curve = r.curve!
  const samples =
    r.entity.type === "spline"
      ? Math.max(256, SPLINE_SCAN * (curve.breaks.length + 4))
      : ELLIPSE_SCAN
  let best: { t: number; cost: number } | null = null
  for (const t of signChanges(
    f,
    curve.start,
    curve.end - curve.start,
    samples
  )) {
    const c = cost(t)
    if (c < (best?.cost ?? Infinity) - TIE) best = { t, cost: c }
  }
  return best
}

/**
 * The object kept from `point`, where the arc meets it, the way `away`
 * points: null for one left as it is, `noValid` for one that would keep
 * nothing.
 */
function keptFromArc(
  r: Reading,
  point: Vec2,
  away: Vec2
): Entity | null | "noValid" {
  const { entity } = r
  switch (entity.type) {
    case "line": {
      const ahead = (end: Vec2) => V.dot(V.sub(end, point), away)
      if (
        Math.max(ahead(entity.start), ahead(entity.end)) <=
        HAIR * V.length(away)
      ) {
        return "noValid"
      }
      return keptFrom(entity, point, away)
    }
    case "arc":
      return keptFrom(entity, point, away)
    case "circle":
      return null
    case "ellipse": {
      if (isFullEllipse(entity)) return null
      const u = r.param(point)
      return V.dot(away, r.curve!.first(u)) > 0
        ? ellipseFrom(entity, u)
        : ellipseTo(entity, u)
    }
    case "spline": {
      if (entity.closed) return null
      const u = r.param(point)
      return splineFrom(entity, u, V.dot(away, r.curve!.first(u)) > 0)
    }
  }
}

/** Below this, in drawing units, an end is where the arc meets it. */
const HAIR = 1e-9

/** The elliptical arc from `u` on to its end, its start moved back round to `u` when off it. */
function ellipseFrom(ellipse: EllipseEntity, u: number): EllipseEntity {
  const { start, sweep } = ellipseSweepParams(ellipse)
  const from = ellipseParamWithinSweep(ellipse, u)
    ? start + normalizeAngle(u - start)
    : start - normalizeAngle(start - u)
  return ellipseWithSpan(ellipse, from, start + sweep)
}

/** The elliptical arc from its start to `u`, its end moved on round to `u` when off it. */
function ellipseTo(ellipse: EllipseEntity, u: number): EllipseEntity {
  const { start, sweep } = ellipseSweepParams(ellipse)
  const to = ellipseParamWithinSweep(ellipse, u)
    ? start + normalizeAngle(u - start)
    : start + sweep + normalizeAngle(u - start - sweep)
  return ellipseWithSpan(ellipse, start, to)
}

/**
 * The open spline kept from `u` on its run-on parameter, toward its end
 * (`forward`) or its start: a piece of it, as BREAK's, or it grown to `u`
 * past an end; `noValid` where nothing of it is left.
 */
function splineFrom(
  spline: SplineEntity,
  u: number,
  forward: boolean
): SplineEntity | null | "noValid" {
  const { start, end } = splineRun(spline)
  const hair = 1e-9 * Math.max(1, end - start)
  if (u > end + hair)
    return forward ? "noValid" : splineGrown(spline, true, u - end)
  if (u < start - hair) {
    return forward ? splineGrown(spline, false, start - u) : "noValid"
  }
  if (forward) {
    if (u >= end - hair) return "noValid"
    return u <= start + hair ? null : splineBreakPiece(spline, u, end)
  }
  if (u <= start + hair) return "noValid"
  return u >= end - hair ? null : splineBreakPiece(spline, start, u)
}

/**
 * The object met at `corner` with no fillet, kept on its picked side: a line,
 * an ARC (`keptAtCorner`) and an elliptical arc reached from the end its pick
 * is nearer when the corner lies off it, a spline grown to it past an end;
 * null for one left as it is.
 */
function keptAt(r: Reading, corner: Vec2): Entity | null {
  const { entity, pick } = r
  switch (entity.type) {
    case "line":
      return keptFrom(entity, corner, V.sub(pick, corner))
    case "arc":
      return keptAtCorner(entity, corner, pick)
    case "circle":
      return null
    case "ellipse": {
      if (isFullEllipse(entity)) return null
      const { start, sweep } = ellipseSweepParams(entity)
      const u = r.param(corner)
      const atCorner = normalizeAngle(u - start)
      const atPick = normalizeAngle(r.picked - start)
      const keepsStart =
        atCorner <= sweep ? atPick < atCorner : atPick > sweep / 2
      return keepsStart ? ellipseTo(entity, u) : ellipseFrom(entity, u)
    }
    case "spline": {
      if (entity.closed) return null
      const u = r.param(corner)
      const kept = splineFrom(entity, u, r.picked > u)
      return kept === "noValid" ? null : kept
    }
  }
}
