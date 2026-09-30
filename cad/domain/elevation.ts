import { Vec2 } from "../geometry/Vec2"
import { Vec3, zOf } from "../geometry/Vec3"
import {
  ArcEntity,
  CircleEntity,
  Entity,
  LineEntity,
  PolylineEntity,
} from "./entityTypes"

export type ThickEntity = LineEntity | CircleEntity | ArcEntity | PolylineEntity

type ZField = "elevation" | "deltaZ" | "thickness"

export function hasThickness(entity: Entity): entity is ThickEntity {
  return (
    entity.type === "line" ||
    entity.type === "circle" ||
    entity.type === "arc" ||
    entity.type === "polyline"
  )
}

export function entityElevation(entity: Entity): number {
  return entity.elevation ?? 0
}

export function entityThickness(entity: Entity): number {
  return hasThickness(entity) ? (entity.thickness ?? 0) : 0
}

export function lineStartZ(line: LineEntity): number {
  return line.elevation ?? 0
}

export function lineEndZ(line: LineEntity): number {
  return (line.elevation ?? 0) + (line.deltaZ ?? 0)
}

export function lineLength3d(line: LineEntity): number {
  return Math.hypot(
    line.end.x - line.start.x,
    line.end.y - line.start.y,
    line.deltaZ ?? 0
  )
}

/** A zero is not stored, so a flat drawing's objects and files stay as they were. */
function withField<T extends Entity>(
  entity: T,
  field: ZField,
  value: number
): T {
  if (value !== 0) return { ...entity, [field]: value }
  if (!(field in entity)) return entity
  const copy: Record<string, unknown> = { ...entity }
  delete copy[field]
  return copy as T
}

export function withElevation<T extends Entity>(entity: T, z: number): T {
  return withField(entity, "elevation", z)
}

export function withThickness<T extends ThickEntity>(
  entity: T,
  thickness: number
): T {
  return withField(entity, "thickness", thickness)
}

export function withDeltaZ(line: LineEntity, deltaZ: number): LineEntity {
  return withField(line, "deltaZ", deltaZ)
}

export function shiftEntityZ<T extends Entity>(entity: T, dz: number): T {
  return dz === 0 ? entity : withElevation(entity, entityElevation(entity) + dz)
}

/**
 * The Z half of a uniform 3D scale about a base at `baseZ`: the plane moves
 * away from the base and the rise and the extrusion grow with the factor.
 */
export function scaleEntityZ<T extends Entity>(
  entity: T,
  baseZ: number,
  factor: number
): T {
  let scaled = withElevation(
    entity,
    baseZ + (entityElevation(entity) - baseZ) * factor
  )
  if (scaled.type === "line") {
    scaled = withDeltaZ(scaled, (scaled.deltaZ ?? 0) * factor) as T
  }
  if (hasThickness(scaled)) {
    scaled = withThickness(scaled, (scaled.thickness ?? 0) * factor) as T
  }
  return scaled
}

/** Puts `target` where `source` lies: its plane, its rise and its extrusion. */
export function carryPlane<T extends Entity>(source: Entity, target: T): T {
  let placed = withElevation(target, entityElevation(source))
  if (placed.type === "line" && source.type === "line") {
    placed = withDeltaZ(placed, source.deltaZ ?? 0) as T
  }
  if (hasThickness(placed)) {
    placed = withThickness(placed, entityThickness(source)) as T
  }
  return placed
}

/**
 * A flat object drawn through points at different heights lies in the plane of
 * the first point that fixed it; the others are projected onto that plane.
 */
export function onPlaneOf<T extends Entity>(entity: T, first: Vec2 | Vec3): T {
  return withElevation(entity, zOf(first))
}

/**
 * The Z of the object under `point`, a point on it in plan: a line's is read
 * off the line through its ends (so past them too), any other lies flat.
 */
export function entityZAt(entity: Entity, point: Vec2): number {
  if (entity.type !== "line" || !entity.deltaZ) return entityElevation(entity)
  const dx = entity.end.x - entity.start.x
  const dy = entity.end.y - entity.start.y
  const lengthSq = dx * dx + dy * dy
  if (lengthSq === 0) return lineStartZ(entity)
  const t =
    ((point.x - entity.start.x) * dx + (point.y - entity.start.y) * dy) /
    lengthSq
  return lineStartZ(entity) + t * entity.deltaZ
}
