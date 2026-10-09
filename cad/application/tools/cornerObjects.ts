import { Vec2 } from "../../geometry/Vec2"
import {
  closestPointOnArc,
  closestPointOnSegment,
} from "../../geometry/primitives"
import {
  Entity,
  LineEntity,
  PolylineEntity,
  polylineSegmentGeometries,
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
 * make a corner with it: another line, or a segment of the same polyline next
 * to it or one segment away. An arc segment, a line with a segment or segments
 * of two polylines are not taken (here they never highlight).
 */
export function pickCornerObject(
  ctx: ToolContext,
  world: Vec2,
  first: CornerObject | null
): CornerObject | null {
  const hit = ctx.pick(world)
  if (hit?.type === "line") {
    return first === null || (!isSegment(first) && first.id !== hit.id)
      ? hit
      : null
  }
  if (hit?.type !== "polyline") return null
  const index = nearestStraightSegment(hit, world)
  if (index === null || first === null) {
    return index === null ? null : { poly: hit, index }
  }
  return isSegment(first) &&
    first.poly.id === hit.id &&
    segmentsPair(hit, first.index, index)
    ? { poly: hit, index }
    : null
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
