import { Vec2, V } from "../../geometry/Vec2"
import {
  closestPointOnArc,
  closestPointOnSegment,
} from "../../geometry/primitives"
import {
  Entity,
  LineEntity,
  PolylineEntity,
  carryOverrides,
  coplanar,
  createPolyline,
  polylineSegmentGeometries,
  readsInPlan,
} from "../../domain/entities"
import type { MessageId } from "../EngineText"
import type { Curve, CurveEnd } from "./curveFillets"
import { bulgeBetween, segmentsPair } from "./polylineCorners"
import { ToolContext } from "./Tool"

/** A segment of a polyline, picked as one of FILLET's two objects. */
export interface SegmentPick {
  readonly poly: PolylineEntity
  readonly index: number
}

/** What FILLET and CHAMFER take as each of their two objects. */
export type CornerObject = LineEntity | SegmentPick

export function isSegment(object: CornerObject): object is SegmentPick {
  return "poly" in object
}

/** What a pick of `object` highlights: the line, or its whole polyline. */
export function cornerEntity(object: CornerObject): Entity {
  return isSegment(object) ? object.poly : object
}

/** Whether the object is an arc segment of a polyline. */
export function isArcSegment(object: CornerObject): boolean {
  return isSegment(object) && curveOf(object).kind === "arc"
}

/** The object as the curve a corner is cut on: a line, or its segment. */
export function curveOf(object: CornerObject): Curve {
  return isSegment(object)
    ? polylineSegmentGeometries(object.poly)[object.index]
    : { kind: "line", a: object.start, b: object.end }
}

/**
 * The object a FILLET or CHAMFER pick at `world` takes: a line, or the
 * segment of a polyline nearest it, an arc segment too. With `first` already
 * taken, only what can make a corner with it: another line, or a segment of
 * another polyline, or a segment of the same polyline next to it or one
 * segment away.
 */
export function pickCornerObject(
  ctx: ToolContext,
  world: Vec2,
  first: CornerObject | null
): CornerObject | null {
  const hit = ctx.pick(world)
  if (hit?.type === "line") {
    return first === null || isSegment(first) || first.id !== hit.id
      ? hit
      : null
  }
  if (hit?.type !== "polyline") return null
  const index = nearestSegment(hit, world)
  if (index === null) return null
  if (first === null || !isSegment(first) || first.poly.id !== hit.id) {
    return { poly: hit, index }
  }
  return segmentsPair(hit, first.index, index) ? { poly: hit, index } : null
}

/**
 * Two objects FILLET and CHAMFER join into one polyline: a line and a
 * polyline's segment, in either order, or segments of two polylines.
 */
export interface CornerJoin {
  /** The polyline the join is: the one picked first, or the line's. */
  readonly segment: SegmentPick
  readonly segmentPick: Vec2
  /** The segment's two ends, as the polyline runs. */
  readonly a: Vec2
  readonly b: Vec2
  /** The line, or the other polyline's segment, joined to it. */
  readonly other: CornerObject
  readonly otherPick: Vec2
  readonly otherA: Vec2
  readonly otherB: Vec2
  readonly otherFirst: boolean
}

/**
 * The two objects as a join, or `null` for two lines or two segments of one
 * polyline. AutoCAD 2023's console keeps the polyline picked first: its
 * handle, layer, colour and direction.
 */
export function cornerJoin(
  first: CornerObject,
  pick1: Vec2,
  second: CornerObject,
  pick2: Vec2
): CornerJoin | null {
  if (!isSegment(first) && !isSegment(second)) return null
  if (isSegment(first) && isSegment(second) && first.poly.id === second.poly.id)
    return null
  const otherFirst = !isSegment(first)
  const segment = (otherFirst ? second : first) as SegmentPick
  const other = otherFirst ? first : second
  const { a, b } = segmentEnds(segment)
  const ends = isSegment(other)
    ? segmentEnds(other)
    : { a: other.start, b: other.end }
  return {
    segment,
    segmentPick: otherFirst ? pick2 : pick1,
    a,
    b,
    other,
    otherPick: otherFirst ? pick1 : pick2,
    otherA: ends.a,
    otherB: ends.b,
    otherFirst,
  }
}

/** The object of a join picked second, which the preview highlights. */
export function joinedSecond(join: CornerJoin): CornerObject {
  return join.otherFirst ? join.segment : join.other
}

/**
 * Why two objects cannot be joined, in AutoCAD's words, or `null`: they must
 * lie in one plane read level — `Line and polyline are non coplanar.`, and
 * for two polylines `Two entities are non coplanar.`
 */
export function joinRefusal({ segment, other }: CornerJoin): MessageId | null {
  // WHY level only: a polyline in a tilted plane keeps its points in its own
  // OCS, which the picks are not given in; AutoCAD joins them there too (a gap).
  const otherEntity = cornerEntity(other)
  return readsInPlan(segment.poly) &&
    readsInPlan(otherEntity) &&
    coplanar(otherEntity, segment.poly)
    ? null
    : isSegment(other)
      ? "twoEntitiesNonCoplanar"
      : "lineAndPolylineNonCoplanar"
}

/**
 * A corner cut between the two objects of a join: where each is cut — the
 * same point at a sharp corner — and the bulge from the segment's cut to the
 * other's (0 for a bevel).
 */
export interface JoinCut {
  readonly corner: Vec2
  /** Unit rays from the corner toward the other's and the segment's kept side. */
  readonly otherSide: Vec2
  readonly segmentSide: Vec2
  readonly onOther: Vec2
  readonly onSegment: Vec2
  readonly bulge: number
  /**
   * The end each keeps, where the rays cannot tell it: an arc segment's, kept
   * round its circle from the corner (FILLET's).
   */
  readonly keeps?: { readonly segment: CurveEnd; readonly other: CurveEnd }
}

/**
 * Whether each cut falls short of the far end of its line or straight
 * segment: CHAMFER's `Chamfer distance is too large` otherwise, even with
 * more of the polyline beyond (FILLET refuses no radius for its size).
 */
export function cutFits(join: CornerJoin, cut: JoinCut): boolean {
  const fits = (a: Vec2, b: Vec2, side: Vec2, at: Vec2) => {
    const along = (point: Vec2) => V.dot(V.sub(point, cut.corner), side)
    return along(at) < Math.max(along(a), along(b)) - 1e-9
  }
  return (
    fits(join.a, join.b, cut.segmentSide, cut.onSegment) &&
    fits(join.otherA, join.otherB, cut.otherSide, cut.onOther)
  )
}

/**
 * The polyline FILLET and CHAMFER make of a join, as AutoCAD 2023's console
 * makes it: each object keeps its run on its kept side up to the cut — a
 * line its kept end, a polyline from its first vertex, or from the segment's
 * end to its last —, and the polyline picked first (or the line's) keeps its
 * direction, the other's run reversed where it must be. What lies past either
 * segment on the other side is dropped, and a closed polyline opens there.
 * Nothing is refused for its size: a cut past a kept end doubles back to it
 * (a line at radius 60: `40,80` then `50,80`). An arc segment keeps what is
 * left of it on its circle, from the cut.
 */
export function joinAtCut(join: CornerJoin, cut: JoinCut): PolylineEntity {
  const { poly } = join.segment
  const own = keptRun(
    join.segment,
    cut.segmentSide,
    cut.corner,
    cut.onSegment,
    cut.keeps?.segment
  )
  const joined = keptRun(
    join.other,
    cut.otherSide,
    cut.corner,
    cut.onOther,
    cut.keeps?.other
  )
  const sharp = V.equals(cut.onSegment, cut.onOther)
  const points: Vec2[] = []
  const pointBulges: number[] = []
  const add = (point: Vec2, next: number) => {
    if (points.length > 0 && V.equals(points[points.length - 1], point)) {
      pointBulges[pointBulges.length - 1] = next
      return
    }
    points.push(point)
    pointBulges.push(next)
  }
  const [lead, leadCut, tail, tailCut, bulge] = own.forward
    ? [joined, cut.onOther, own, cut.onSegment, -cut.bulge]
    : [own, cut.onSegment, joined, cut.onOther, cut.bulge]
  for (let k = lead.points.length - 1; k >= 0; k--) {
    add(lead.points[k], k > 0 ? -lead.bulges[k - 1] : -lead.cutBulge)
  }
  add(leadCut, sharp ? tail.cutBulge : bulge)
  if (!sharp) add(tailCut, tail.cutBulge)
  tail.points.forEach((point, k) => add(point, tail.bulges[k] ?? 0))
  pointBulges[pointBulges.length - 1] = 0
  return carryOverrides(
    poly,
    createPolyline(points, false, poly.layerId, pointBulges, poly.id)
  )
}

/**
 * What an object keeps past its cut, going outward: from the cut to
 * `points[0]` by `cutBulge` (straight but on an arc segment), then from
 * `points[k]` to `points[k + 1]` by `bulges[k]`. `forward` when that is
 * the polyline's own direction.
 */
interface Run {
  readonly points: readonly Vec2[]
  readonly bulges: readonly number[]
  readonly cutBulge: number
  readonly forward: boolean
}

function keptRun(
  object: CornerObject,
  side: Vec2,
  corner: Vec2,
  cut: Vec2,
  keep?: CurveEnd
): Run {
  const along = (point: Vec2) => V.dot(V.sub(point, corner), side)
  if (!isSegment(object)) {
    const end = keep
      ? keep === "b"
        ? object.end
        : object.start
      : along(object.end) >= along(object.start)
        ? object.end
        : object.start
    return { points: [end], bulges: [], cutBulge: 0, forward: true }
  }
  const { poly, index } = object
  const vertices = poly.closed
    ? [...poly.vertices, poly.vertices[0]]
    : poly.vertices
  const bulge = (k: number) => poly.bulges?.[k] ?? 0
  const segment = curveOf(object)
  const forward = keep
    ? keep === "b"
    : along(vertices[index + 1]) >= along(vertices[index])
  if (forward) {
    const points = vertices.slice(index + 1)
    return {
      points,
      bulges: points.slice(1).map((_, k) => bulge(index + 1 + k)),
      cutBulge:
        segment.kind === "arc" ? bulgeBetween(segment, cut, segment.b) : 0,
      forward: true,
    }
  }
  const points = vertices.slice(0, index + 1).reverse()
  return {
    points,
    bulges: points.slice(1).map((_, k) => -bulge(index - 1 - k)),
    cutBulge:
      segment.kind === "arc" ? -bulgeBetween(segment, segment.a, cut) : 0,
    forward: false,
  }
}

function segmentEnds({ poly, index }: SegmentPick): { a: Vec2; b: Vec2 } {
  const { a, b } = polylineSegmentGeometries(poly)[index]
  return { a, b }
}

/** The segment of `poly` nearest `world`. */
function nearestSegment(poly: PolylineEntity, world: Vec2): number | null {
  let nearest: number | null = null
  let best = Infinity
  polylineSegmentGeometries(poly).forEach((segment, index) => {
    const distance =
      segment.kind === "line"
        ? closestPointOnSegment(segment.a, segment.b, world).distance
        : closestPointOnArc(
            segment.center,
            segment.radius,
            segment.startAngle,
            segment.endAngle,
            world
          ).distance
    if (distance < best) {
      best = distance
      nearest = index
    }
  })
  return nearest
}
