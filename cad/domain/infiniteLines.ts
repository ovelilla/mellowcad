import { Vec2, V } from "../geometry/Vec2"
import { Vec3 } from "../geometry/Vec3"
import type { ClosestResult } from "../geometry/primitives"
import type {
  Bounds,
  Entity,
  LineEntity,
  RayEntity,
  XlineEntity,
} from "./entityTypes"
import { lineEndZ, lineStartZ, withDeltaZ, withElevation } from "./elevation"

/** An XLINE or a RAY: a line through a base point along a unit direction. */
export type InfiniteLineEntity = XlineEntity | RayEntity

export function isInfiniteLine(entity: Entity): entity is InfiniteLineEntity {
  return entity.type === "xline" || entity.type === "ray"
}

/** Its base point (DXF 10), in the WCS. */
export function infiniteBase(entity: InfiniteLineEntity): Vec3 {
  return { x: entity.base.x, y: entity.base.y, z: entity.elevation ?? 0 }
}

/** Its unit direction (DXF 11), in the WCS. */
export function infiniteDirection(entity: InfiniteLineEntity): Vec3 {
  return {
    x: entity.direction.x,
    y: entity.direction.y,
    z: entity.directionZ ?? 0,
  }
}

/** The point at `t` along it, `t` being a distance along its direction from the base. */
export function infinitePointAt(entity: InfiniteLineEntity, t: number): Vec3 {
  const base = infiniteBase(entity)
  const d = infiniteDirection(entity)
  return { x: base.x + t * d.x, y: base.y + t * d.y, z: base.z + t * d.z }
}

/**
 * Its stretch from `t0` to `t1` (distances along it from the base) as a line
 * of its id, layer and overrides: what drawing, picking, snapping and the
 * edits that cut it read in place of a run with no end.
 */
export function infiniteLineSpan(
  entity: InfiniteLineEntity,
  t0: number,
  t1: number
): LineEntity {
  const { base, direction, directionZ, type, elevation, ...rest } = entity
  void base
  void direction
  void directionZ
  void type
  void elevation
  const a = infinitePointAt(entity, t0)
  const b = infinitePointAt(entity, t1)
  const line: LineEntity = {
    ...rest,
    type: "line",
    start: { x: a.x, y: a.y },
    end: { x: b.x, y: b.y },
  }
  return withDeltaZ(withElevation(line, a.z), b.z - a.z)
}

/**
 * An object of `source`'s type, id and properties lying along `line`, based
 * at its start and running towards its end: how a transform made for lines
 * moves one (an affine map takes a line to a line), its direction measured
 * again, so a SCALE leaves it a unit vector. Null where the line has no
 * length.
 */
export function infiniteLineAlong<T extends InfiniteLineEntity>(
  source: T,
  line: LineEntity
): T | null {
  const startZ = lineStartZ(line)
  const d = {
    x: line.end.x - line.start.x,
    y: line.end.y - line.start.y,
    z: lineEndZ(line) - startZ,
  }
  const length = Math.hypot(d.x, d.y, d.z)
  if (!(length > 0)) return null
  return withInfinitePlacement(
    source,
    { x: line.start.x, y: line.start.y, z: startZ },
    { x: d.x / length, y: d.y / length, z: d.z / length }
  )
}

/** `entity` based at `base` along the unit `direction`, nothing else changed. */
export function withInfinitePlacement<T extends InfiniteLineEntity>(
  entity: T,
  base: Vec3,
  direction: Vec3
): T {
  const { directionZ, ...rest } = entity
  void directionZ
  const placed = {
    ...rest,
    base: { x: base.x, y: base.y },
    direction: { x: direction.x + 0, y: direction.y + 0 },
    ...(direction.z !== 0 ? { directionZ: direction.z } : {}),
  } as T
  return withElevation(placed, base.z)
}

/**
 * The distance along it, from the base, of the point of it nearest `point`
 * in plan (a RAY's held at its start). One standing upright on the plan is
 * there only at its base.
 */
export function infiniteParamNearest(
  entity: InfiniteLineEntity,
  point: Vec2
): number {
  const d = entity.direction
  const lengthSq = V.lengthSq(d)
  if (lengthSq === 0) return 0
  const t = V.dot(V.sub(point, entity.base), d) / lengthSq
  return entity.type === "ray" ? Math.max(0, t) : t
}

/** The point of it nearest `point`, read in plan. */
export function closestOnInfiniteLine(
  entity: InfiniteLineEntity,
  point: Vec2
): ClosestResult {
  const t = infiniteParamNearest(entity, point)
  const at = V.add(entity.base, V.scale(entity.direction, t))
  return { point: at, distance: V.distance(at, point), t }
}

/**
 * What it spans in plan: an XLINE all of it, but along an axis it runs
 * square to; a RAY from its start on the side it heads.
 */
export function infiniteLineBounds(entity: InfiniteLineEntity): Bounds {
  const span = (from: number, along: number): [number, number] => {
    if (along === 0) return [from, from]
    if (entity.type === "xline") return [-Infinity, Infinity]
    return along > 0 ? [from, Infinity] : [-Infinity, from]
  }
  const [minX, maxX] = span(entity.base.x, entity.direction.x)
  const [minY, maxY] = span(entity.base.y, entity.direction.y)
  return { min: { x: minX, y: minY }, max: { x: maxX, y: maxY } }
}

/**
 * The run of `t` (distances from the base) that lies inside the rectangle
 * `min`..`max` in plan, or null where none does: the stretch of it a view or
 * a box sees.
 */
export function infiniteLineClip(
  entity: InfiniteLineEntity,
  min: Vec2,
  max: Vec2
): readonly [number, number] | null {
  let t0 = entity.type === "ray" ? 0 : -Infinity
  let t1 = Infinity
  const p = entity.base
  const d = entity.direction
  for (const [from, along, lo, hi] of [
    [p.x, d.x, min.x, max.x],
    [p.y, d.y, min.y, max.y],
  ] as const) {
    if (Math.abs(along) < 1e-15) {
      if (from < lo || from > hi) return null
      continue
    }
    let a = (lo - from) / along
    let b = (hi - from) / along
    if (a > b) [a, b] = [b, a]
    t0 = Math.max(t0, a)
    t1 = Math.min(t1, b)
    if (t0 > t1) return null
  }
  if (!Number.isFinite(t0) || !Number.isFinite(t1)) {
    // Upright on the plan: there only at its base.
    return t0 <= 0 && t1 >= 0 ? [0, 0] : null
  }
  return [t0, t1]
}

/**
 * Its stretch across `box` and as far again past it on each side, as a line
 * of its id (`infiniteLineSpan`): a box holding every finite object a command
 * reads, and the view, leaves nothing past those ends for it to meet. A
 * RAY's starts at its base. Null for one standing upright on the plan.
 */
export function infiniteLineReaching(
  entity: InfiniteLineEntity,
  box: Bounds
): LineEntity | null {
  const lengthSq = V.lengthSq(entity.direction)
  if (!(lengthSq > 0)) return null
  const params = [
    box.min,
    box.max,
    { x: box.min.x, y: box.max.y },
    { x: box.max.x, y: box.min.y },
  ].map((p) => V.dot(V.sub(p, entity.base), entity.direction) / lengthSq)
  const low = Math.min(0, ...params)
  const high = Math.max(0, ...params)
  // As far again as the box is across, whichever way it runs.
  const pad = Math.max(high - low, V.distance(box.min, box.max)) + 1
  return infiniteLineSpan(
    entity,
    entity.type === "ray" ? 0 : low - pad,
    high + pad
  )
}

/**
 * What `piece`, a stretch of `span` (`infiniteLineReaching(source, …)`), is
 * as an object: an end at one of the span's far ends runs on, so a piece
 * running on both ways is the XLINE, one way a RAY from its other end, and
 * none a LINE (xline/i01, i02: TRIM and BREAK leave an XLINE rays, a RAY a
 * line). It keeps the piece's id and properties.
 */
export function infinitePieceOf(
  source: InfiniteLineEntity,
  span: LineEntity,
  piece: LineEntity
): Entity {
  const far = (p: Vec2, end: Vec2) =>
    V.distance(p, end) <= 1e-9 * Math.max(1, V.distance(span.start, span.end))
  const runsBack = source.type === "xline" && far(piece.start, span.start)
  const runsOn = far(piece.end, span.end)
  if (!runsBack && !runsOn) return piece
  const { type, start, end, deltaZ, ...rest } = piece
  void type
  void deltaZ
  const startZ = lineStartZ(piece)
  const endZ = lineEndZ(piece)
  if (runsBack && runsOn) {
    return withInfinitePlacement(
      { ...rest, type: "xline", base: start, direction: start },
      infiniteBase(source),
      infiniteDirection(source)
    )
  }
  const from = runsOn ? { ...start, z: startZ } : { ...end, z: endZ }
  const to = runsOn ? { ...end, z: endZ } : { ...start, z: startZ }
  const d = { x: to.x - from.x, y: to.y - from.y, z: to.z - from.z }
  const length = Math.hypot(d.x, d.y, d.z)
  return withInfinitePlacement(
    { ...rest, type: "ray", base: from, direction: from },
    from,
    { x: d.x / length, y: d.y / length, z: d.z / length }
  )
}
