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
import { segmentsPair } from "./polylineCorners"
import { ToolContext } from "./Tool"

/** A straight segment of a polyline, picked as one of FILLET's two objects. */
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

/**
 * The object a FILLET or CHAMFER pick at `world` takes: a line, or the straight
 * segment of a polyline nearest it. With `first` already taken, only what can
 * make a corner with it: another line or a polyline's segment with a line, or
 * a segment of the same polyline next to it or one segment away. An arc
 * segment and segments of two polylines are not taken (here they never
 * highlight).
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
  const index = nearestStraightSegment(hit, world)
  if (index === null || first === null || !isSegment(first)) {
    return index === null ? null : { poly: hit, index }
  }
  return first.poly.id === hit.id && segmentsPair(hit, first.index, index)
    ? { poly: hit, index }
    : null
}

/** A line and a polyline's segment picked as the two objects, in either order. */
export interface LineAndSegment {
  readonly line: LineEntity
  readonly linePick: Vec2
  readonly segment: SegmentPick
  readonly segmentPick: Vec2
  /** The straight segment's two ends, as the polyline runs. */
  readonly a: Vec2
  readonly b: Vec2
  readonly lineFirst: boolean
}

/** The two objects as a line and a segment, or `null` unless one is each. */
export function lineAndSegment(
  first: CornerObject,
  pick1: Vec2,
  second: CornerObject,
  pick2: Vec2
): LineAndSegment | null {
  if (isSegment(first) === isSegment(second)) return null
  const lineFirst = !isSegment(first)
  const segment = (lineFirst ? second : first) as SegmentPick
  const geometry = polylineSegmentGeometries(segment.poly)[segment.index]
  return {
    line: (lineFirst ? first : second) as LineEntity,
    linePick: lineFirst ? pick1 : pick2,
    segment,
    segmentPick: lineFirst ? pick2 : pick1,
    a: geometry.a,
    b: geometry.b,
    lineFirst,
  }
}

/**
 * Whether a line and a polyline lie in one plane read level, as a join needs;
 * else AutoCAD's `Line and polyline are non coplanar.`
 */
export function joinable({ line, segment }: LineAndSegment): boolean {
  // WHY level only: a polyline in a tilted plane keeps its points in its own
  // OCS, which a line is not given in; AutoCAD joins them there too (a gap).
  return readsInPlan(segment.poly) && coplanar(line, segment.poly)
}

/**
 * A corner cut between a line and a polyline's straight segment: where each
 * is cut — the same point at a sharp corner — and the bulge from the
 * segment's cut to the line's (0 for a bevel).
 */
export interface LineSegmentCut {
  readonly corner: Vec2
  /** Unit rays from the corner toward the line's and the segment's kept side. */
  readonly lineSide: Vec2
  readonly segmentSide: Vec2
  readonly onLine: Vec2
  readonly onSegment: Vec2
  readonly bulge: number
}

/**
 * The polyline FILLET and CHAMFER make of a line and a segment of a polyline,
 * as AutoCAD 2023's console joins them: the polyline keeps its run on the
 * segment's kept side up to the cut — from its first vertex, or from the
 * segment's end to its last — and goes on through the arc or bevel to the
 * line's kept end, which starts it when the run is the later one. What lies
 * past the segment on the other side is dropped, and a closed polyline opens
 * there. Nothing is refused for its size: a cut past the line's kept end
 * doubles back to it (radius 60 there: `40,80` then `50,80`).
 */
export function joinLineToSegment(
  line: LineEntity,
  { poly, index }: SegmentPick,
  cut: LineSegmentCut
): PolylineEntity {
  const { corner, lineSide, segmentSide, onLine, onSegment, bulge } = cut
  const vertices = poly.closed
    ? [...poly.vertices, poly.vertices[0]]
    : poly.vertices
  const bulges = vertices.map((_, k) => poly.bulges?.[k] ?? 0)
  const along = (point: Vec2, side: Vec2) => V.dot(V.sub(point, corner), side)
  const lineEnd =
    along(line.end, lineSide) >= along(line.start, lineSide)
      ? line.end
      : line.start
  const towardEnd =
    along(vertices[index + 1], segmentSide) >=
    along(vertices[index], segmentSide)
  const sharp = V.equals(onSegment, onLine)
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
  if (towardEnd) {
    add(lineEnd, 0)
    if (!sharp) add(onLine, -bulge)
    add(onSegment, 0)
    for (let k = index + 1; k < vertices.length; k++)
      add(vertices[k], bulges[k])
  } else {
    for (let k = 0; k <= index; k++) add(vertices[k], k < index ? bulges[k] : 0)
    add(onSegment, sharp ? 0 : bulge)
    if (!sharp) add(onLine, 0)
    add(lineEnd, 0)
  }
  pointBulges[pointBulges.length - 1] = 0
  return carryOverrides(
    poly,
    createPolyline(points, false, poly.layerId, pointBulges, poly.id)
  )
}

/** The segment of `poly` nearest `world`, or `null` when it is an arc. */
function nearestStraightSegment(
  poly: PolylineEntity,
  world: Vec2
): number | null {
  let nearest: number | null = null
  let best = Infinity
  let straight = false
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
      straight = segment.kind === "line"
    }
  })
  return straight ? nearest : null
}
