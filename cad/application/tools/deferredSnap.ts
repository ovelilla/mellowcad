import { Vec2, V } from "../../geometry/Vec2"
import { Vec3, withZ } from "../../geometry/Vec3"
import {
  closestPointOnInfiniteLine,
  tangentLinesOfCircles,
  tangentPointsFromPoint,
} from "../../geometry/primitives"
import {
  ArcEntity,
  CircleEntity,
  Entity,
  LineEntity,
  entityElevation,
} from "../../domain/entities"
import { SnapType } from "../snapping/types"

/**
 * A Tangent or Perpendicular object snap given where there is no point yet to
 * measure from — LINE's first point. AutoCAD defers it ("Deferred Tangent")
 * until the other end is known, and with two of them draws the line that
 * touches both.
 */
export interface DeferredPick {
  readonly kind: SnapType.Tangent | SnapType.Perpendicular
  readonly entity: LineEntity | CircleEntity | ArcEntity
  /** Where the object was picked: of the answers, the one nearest it. */
  readonly pick: Vec2
}

/**
 * The deferred pick an override and a picked object make, or null: a Tangent
 * needs a circle or an arc, a Perpendicular a line too; each in the plan (a
 * rising line or a tilted curve is not taken).
 */
export function deferredPick(
  kind: SnapType | "none" | null,
  entity: Entity | null,
  pick: Vec2
): DeferredPick | null {
  if (kind !== SnapType.Tangent && kind !== SnapType.Perpendicular) return null
  if (!entity || !defersOn(kind, entity)) return null
  return { kind, entity, pick }
}

/** Whether {@link deferredPick} takes `entity` for a `kind` override. */
export function defersOn(
  kind: SnapType.Tangent | SnapType.Perpendicular,
  entity: Entity | null
): entity is LineEntity | CircleEntity | ArcEntity {
  if (!entity) return false
  if (entity.type === "circle" || entity.type === "arc") {
    return !entity.normal || entity.normal.z >= 1 - 1e-9
  }
  return (
    entity.type === "line" &&
    kind === SnapType.Perpendicular &&
    Math.abs(entity.deltaZ ?? 0) <= 1e-9 &&
    V.distance(entity.start, entity.end) >= 1e-12
  )
}

/**
 * The deferred point once the line's other end is `other`: the tangent point
 * seen from it, or the foot of the perpendicular from it — of two, the one
 * nearer the pick. Null when there is none (a point inside the circle).
 */
export function deferredFrom(deferred: DeferredPick, other: Vec2): Vec3 | null {
  const { kind, entity, pick } = deferred
  if (entity.type === "line") {
    const foot = closestPointOnInfiniteLine(entity.start, entity.end, other)
    return on(entity, foot.point)
  }
  const { center, radius } = entity
  if (kind === SnapType.Tangent) {
    return on(
      entity,
      nearest(tangentPointsFromPoint(other, center, radius), pick)
    )
  }
  const radial = V.sub(other, center)
  const length = V.length(radial)
  if (length < 1e-12) return null
  const dir = V.scale(radial, radius / length)
  return on(entity, nearest([V.add(center, dir), V.sub(center, dir)], pick))
}

/**
 * The line two deferred picks make, as its two ends: tangent to two circles
 * (of the four, the one touching nearest both picks), or tangent to a circle
 * and perpendicular to a line. Null for a pair with no such line, which is
 * then read as a pick at the second point.
 */
export function deferredPair(
  first: DeferredPick,
  second: DeferredPick
): [Vec3, Vec3] | null {
  const a = first.entity
  const b = second.entity
  if (
    first.kind === SnapType.Tangent &&
    second.kind === SnapType.Tangent &&
    a.type !== "line" &&
    b.type !== "line"
  ) {
    let best: [Vec2, Vec2] | null = null
    let bestScore = Infinity
    for (const pair of tangentLinesOfCircles(
      a.center,
      a.radius,
      b.center,
      b.radius
    )) {
      const score =
        V.distance(pair[0], first.pick) + V.distance(pair[1], second.pick)
      if (score < bestScore) {
        best = pair
        bestScore = score
      }
    }
    return best && [on(a, best[0]), on(b, best[1])]
  }
  if (
    first.kind === SnapType.Tangent &&
    b.type === "line" &&
    a.type !== "line"
  ) {
    const ends = tangentPerpendicular(first, b)
    return ends && [on(a, ends[0]), on(b, ends[1])]
  }
  if (
    second.kind === SnapType.Tangent &&
    a.type === "line" &&
    b.type !== "line"
  ) {
    const ends = tangentPerpendicular(second, a)
    return ends && [on(a, ends[1]), on(b, ends[0])]
  }
  return null
}

/**
 * The line tangent to the deferred circle and perpendicular to `line`: it
 * touches where the radius runs along the line, and meets the line square.
 */
function tangentPerpendicular(
  tangent: DeferredPick,
  line: LineEntity
): [Vec2, Vec2] | null {
  if (tangent.entity.type === "line") return null
  const { center, radius } = tangent.entity
  const along = V.normalize(V.sub(line.end, line.start))
  const touch = nearest(
    [
      V.add(center, V.scale(along, radius)),
      V.sub(center, V.scale(along, radius)),
    ],
    tangent.pick
  )
  if (!touch) return null
  return [touch, closestPointOnInfiniteLine(line.start, line.end, touch).point]
}

function nearest(points: readonly Vec2[], to: Vec2): Vec2 | null {
  let best: Vec2 | null = null
  for (const point of points) {
    if (!best || V.distance(point, to) < V.distance(best, to)) best = point
  }
  return best
}

function on(entity: Entity, point: Vec2): Vec3
function on(entity: Entity, point: Vec2 | null): Vec3 | null
function on(entity: Entity, point: Vec2 | null): Vec3 | null {
  return point && withZ(point, entityElevation(entity))
}
