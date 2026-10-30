import { Vec2 } from "../geometry/Vec2"
import {
  Vec3,
  WORLD_Z,
  cross3,
  dot3,
  length3,
  normalize3,
  sub3,
  zOf,
} from "../geometry/Vec3"
import { Axes3, arbitraryAxis, axesToWorld, worldToAxes } from "../geometry/ocs"
import {
  ArcEntity,
  CircleEntity,
  Entity,
  LineEntity,
  PolylineEntity,
  SplineEntity,
} from "./entityTypes"
import { closestPointOnPolyline3d, isLevelPolyline3d } from "./polylines3d"
import { isLevelSpline, splineZAt } from "./splines"

export type ThickEntity = LineEntity | CircleEntity | ArcEntity | PolylineEntity

type ZField = "elevation" | "deltaZ" | "thickness"

/** Below this the components of a normal off Z count as none: it is +Z. */
const NORMAL_TOLERANCE = 1e-12

const WORLD_AXES: Axes3 = {
  x: { x: 1, y: 0, z: 0 },
  y: { x: 0, y: 1, z: 0 },
  z: WORLD_Z,
}

/** The object's normal (DXF 210), +Z unless it says otherwise. */
export function entityNormal(entity: Entity): Vec3 {
  return entity.normal ?? WORLD_Z
}

/**
 * Whether the object's normal is not +Z: its points then are not world X and
 * Y, and the plan does not draw it as they read.
 */
export function isTilted(entity: Entity): boolean {
  return entity.normal !== undefined
}

/**
 * `entity` with `normal` (made unit). +Z is not stored, so a flat drawing's
 * objects and files stay as they were.
 */
export function withNormal<T extends Entity>(entity: T, normal: Vec3): T {
  // A normal already of unit length is kept to the bit, so saving a loaded
  // drawing writes the same bytes; `+ 0` turns a -0, which a file cannot
  // hold, into 0.
  const unit =
    Math.abs(length3(normal) - 1) <= NORMAL_TOLERANCE
      ? { x: normal.x + 0, y: normal.y + 0, z: normal.z + 0 }
      : normalize3(normal)
  const upright =
    !unit ||
    (Math.abs(unit.x) <= NORMAL_TOLERANCE &&
      Math.abs(unit.y) <= NORMAL_TOLERANCE &&
      unit.z > 0)
  if (!upright) return { ...entity, normal: unit }
  if (!("normal" in entity)) return entity
  const copy: Record<string, unknown> = { ...entity }
  delete copy.normal
  return copy as T
}

/** The object coordinate system of the object's plane (the WCS for +Z). */
export function entityAxes(entity: Entity): Axes3 {
  return entity.normal
    ? (arbitraryAxis(entity.normal) ?? WORLD_AXES)
    : WORLD_AXES
}

/** The axes the object's points are in, when they are not the WCS's; a line's never are. */
export function planeAxes(entity: Entity): Axes3 | undefined {
  return entity.type !== "line" && entity.type !== "polyline3d" && entity.normal
    ? entityAxes(entity)
    : undefined
}

/**
 * Whether the object reads in plan: a line always does (its points are the
 * WCS's, and the 2.5D tools project it), anything else when its plane is
 * level. The tools with flat geometry — TRIM, OFFSET, HATCH, the dimensions —
 * act on these alone.
 */
export function readsInPlan(entity: Entity): boolean {
  return planeAxes(entity) === undefined
}

/**
 * A point of the object, given as it stores its points, in the WCS: in the
 * plan of its plane, at its height there (a line's are world points already).
 * A spline's point that carries its Z — any point of its curve — is at that Z.
 */
export function entityPointToWorld(entity: Entity, point: Vec2): Vec3 {
  const z =
    entity.type === "spline" && "z" in point
      ? zOf(point)
      : entityZAt(entity, point)
  if (
    entity.type === "line" ||
    entity.type === "polyline3d" ||
    !entity.normal
  ) {
    return { x: point.x, y: point.y, z }
  }
  return axesToWorld(entityAxes(entity), { x: point.x, y: point.y, z })
}

/** A world point in the object's own coordinates: the plan of its plane, and the height. */
export function worldToEntity(entity: Entity, point: Vec2 | Vec3): Vec3 {
  if (
    entity.type === "line" ||
    entity.type === "polyline3d" ||
    !entity.normal
  ) {
    return { x: point.x, y: point.y, z: zOf(point) }
  }
  return worldToAxes(entityAxes(entity), point)
}

/** Whether two objects' planes face the same way. */
export function sameNormal(a: Entity, b: Entity): boolean {
  return facesAlong(a, entityNormal(b))
}

/** Whether the object's plane faces along the unit vector `normal`. */
export function facesAlong(entity: Entity, normal: Vec3): boolean {
  return dot3(entityNormal(entity), normal) >= 1 - NORMAL_TOLERANCE
}

export function hasThickness(entity: Entity): entity is ThickEntity {
  return (
    entity.type === "line" ||
    entity.type === "circle" ||
    entity.type === "arc" ||
    entity.type === "polyline"
  )
}

/** The Z of its plane; a line's, a 3D polyline's and a spline's, the Z of their start. */
export function entityElevation(entity: Entity): number {
  if (entity.type === "polyline3d") return entity.vertices[0]?.z ?? 0
  if (entity.type === "spline") return entity.points[0]?.z ?? 0
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

/** A spline's points hold their Z: they rise or fall together, its start to `z`. */
export function withElevation<T extends Entity>(entity: T, z: number): T {
  if (entity.type === "spline") {
    return shiftEntityZ(entity, z - entityElevation(entity))
  }
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
  if (dz === 0) return entity
  if (entity.type === "polyline3d") {
    return {
      ...entity,
      vertices: entity.vertices.map((v) => ({ ...v, z: v.z + dz })),
    }
  }
  if (entity.type === "spline") {
    return {
      ...entity,
      points: entity.points.map((p) => ({ ...p, z: p.z + dz })),
    }
  }
  return withElevation(entity, entityElevation(entity) + dz)
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
  if (entity.type === "polyline3d") {
    return {
      ...entity,
      vertices: entity.vertices.map((v) => ({
        ...v,
        z: baseZ + (v.z - baseZ) * factor,
      })),
    }
  }
  if (entity.type === "spline") {
    return scaleSplineZ(entity, baseZ, factor) as T
  }
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

/** A tangent's Z grows with the factor as its X and Y did (`mapSplinePoints`). */
function scaleSplineZ(
  spline: SplineEntity,
  baseZ: number,
  factor: number
): SplineEntity {
  const tangent = (v: Vec3 | undefined) => v && { ...v, z: v.z * factor }
  const startTangent = tangent(spline.startTangent)
  const endTangent = tangent(spline.endTangent)
  return {
    ...spline,
    points: spline.points.map((p) => ({
      ...p,
      z: baseZ + (p.z - baseZ) * factor,
    })),
    ...(startTangent ? { startTangent } : {}),
    ...(endTangent ? { endTangent } : {}),
  }
}

/**
 * Puts `target` where `source` lies: its plane, its rise and its extrusion. A
 * line built out of the points of a planar object with a normal of its own
 * reads them in that object's OCS, and is laid out in the WCS, as a line's
 * points always are.
 */
export function carryPlane<T extends Entity>(source: Entity, target: T): T {
  // A 3D polyline has no plane to give, nor one to take: its points hold their Z.
  if (source.type === "polyline3d" || target.type === "polyline3d") {
    return target
  }
  // A line's normal only extrudes it: what is built off its WCS points lies flat.
  const normal =
    source.type === "line" && target.type !== "line"
      ? WORLD_Z
      : entityNormal(source)
  let placed = withNormal(
    withElevation(target, entityElevation(source)),
    normal
  )
  if (placed.type === "line" && source.type === "line") {
    placed = withDeltaZ(placed, source.deltaZ ?? 0) as T
  } else if (placed.type === "line") {
    const axes = planeAxes(source)
    if (axes) {
      const z = entityElevation(source)
      const start = axesToWorld(axes, { ...placed.start, z })
      const end = axesToWorld(axes, { ...placed.end, z })
      placed = withLineZ(
        {
          ...placed,
          start: { x: start.x, y: start.y },
          end: { x: end.x, y: end.y },
        },
        start.z,
        end.z
      ) as T
    }
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
 * off the line through its ends (so past them too), a 3D polyline's off its
 * segment nearest there, a spline's off its curve, any other lies flat.
 */
export function entityZAt(entity: Entity, point: Vec2): number {
  if (entity.type === "polyline3d") {
    return closestPointOnPolyline3d(entity, point).z
  }
  if (entity.type === "spline") return splineZAt(entity, point)
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

export function withLineZ(
  line: LineEntity,
  startZ: number,
  endZ: number
): LineEntity {
  return withDeltaZ(withElevation(line, startZ), endZ - startZ)
}

/**
 * `piece`, cut from `source` or grown out of it along its own run (TRIM,
 * EXTEND, BREAK), with a line's ends at the Z the source has there rather than
 * the source's whole rise.
 */
export function alongSource<T extends Entity>(source: Entity, piece: T): T {
  if (piece.type !== "line" || source.type !== "line") return piece
  return withLineZ(
    piece,
    entityZAt(source, piece.start),
    entityZAt(source, piece.end)
  ) as T
}

const PLANE_TOLERANCE = 1e-9

/** Whether the object lies in one plane parallel to the XY plane: a line must not rise. */
export function isLevel(entity: Entity): boolean {
  if (entity.type === "polyline3d") return isLevelPolyline3d(entity)
  if (entity.type === "spline") return isLevelSpline(entity)
  return (
    entity.type !== "line" || Math.abs(entity.deltaZ ?? 0) <= PLANE_TOLERANCE
  )
}

/**
 * Whether two objects share a plane: AutoCAD's "Lines are non coplanar" test,
 * whose cause it gives as "one or more of the line vertices is not at the
 * same elevation as the other vertices". The same normal and elevation, and
 * no line rising off it.
 */
export function coplanar(a: Entity, b: Entity): boolean {
  return (
    isLevel(a) &&
    isLevel(b) &&
    sameNormal(a, b) &&
    Math.abs(entityElevation(a) - entityElevation(b)) <= PLANE_TOLERANCE
  )
}

/**
 * Whether two objects lie in one plane that does not read in plan, the plane
 * of the one that is no line: its normal, at its elevation along it (its
 * OCS's Z), a line's two ends on it.
 */
export function sharesTiltedPlane(a: Entity, b: Entity): boolean {
  const plane = [a, b].find((entity) => !readsInPlan(entity))
  if (!plane) return false
  const normal = entityNormal(plane)
  const height = entityElevation(plane)
  const on = (point: Vec3) =>
    Math.abs(dot3(point, normal) - height) <=
    PLANE_TOLERANCE * Math.max(1, length3(point))
  const lies = (entity: Entity) =>
    entity.type === "line"
      ? on({ ...entity.start, z: lineStartZ(entity) }) &&
        on({ ...entity.end, z: lineEndZ(entity) })
      : entity.type === "polyline3d"
        ? entity.vertices.every(on)
        : isLevel(entity) &&
          facesAlong(entity, normal) &&
          Math.abs(entityElevation(entity) - height) <= PLANE_TOLERANCE
  return lies(a) && lies(b)
}

/**
 * The plane two lines share when it is not a level one {@link coplanar}
 * covers: its unit normal, facing up where it can. Two parallel lines share
 * one too. `null` when they share no plane — AutoCAD's "Lines are
 * non coplanar" — or lie on one line.
 */
export function linesPlaneNormal(a: LineEntity, b: LineEntity): Vec3 | null {
  const a0: Vec3 = { ...a.start, z: lineStartZ(a) }
  const a1: Vec3 = { ...a.end, z: lineEndZ(a) }
  const b0: Vec3 = { ...b.start, z: lineStartZ(b) }
  const b1: Vec3 = { ...b.end, z: lineEndZ(b) }
  const da = sub3(a1, a0)
  const db = sub3(b1, b0)
  const across = sub3(b0, a0)
  const size = Math.max(length3(da), length3(db), length3(across), 1)
  let normal = cross3(da, db)
  if (length3(normal) <= 1e-12 * size * size) normal = cross3(da, across)
  if (length3(normal) <= 1e-12 * size * size) return null
  const unit = normalize3(normal)
  if (!unit) return null
  const off = (point: Vec3) => Math.abs(dot3(sub3(point, a0), unit))
  if (off(b0) > PLANE_TOLERANCE * size || off(b1) > PLANE_TOLERANCE * size) {
    return null
  }
  return unit.z < 0 ? { x: -unit.x, y: -unit.y, z: -unit.z } : unit
}

/**
 * The spline kept in the plane its points and tangents lie in, as AutoCAD
 * keeps one (DXF 210, flag 8): that plane's normal, facing the side its own
 * did, and every point at one Z in its object coordinates (spline/p223,
 * spline3d/s09, s11). On a line, the plane holding it upright, its normal Z ×
 * the line's direction (s07, s08). One that lies in no plane, or already in
 * its own, is kept as it is. Keeps the id.
 */
export function splineOnItsPlane(spline: SplineEntity): SplineEntity {
  if (isLevelSpline(spline)) return spline
  const { points } = spline
  const tangents = [spline.startTangent, spline.endTangent].filter(
    (v): v is Vec3 => v !== undefined
  )
  const origin = points[0]
  const size = Math.max(1, ...points.map((p) => length3(sub3(p, origin))))
  const offsets = points.map((p) => sub3(p, origin))
  const far = offsets.reduce((a, b) => (length3(b) > length3(a) ? b : a))
  const along = normalize3(far)
  if (!along) return spline
  const across = [...offsets, ...tangents].reduce(
    (best, v) => {
      const off = length3(cross3(v, along)) / Math.max(1, length3(v) / size)
      return off > best.off ? { v, off } : best
    },
    { v: along, off: 0 }
  )
  let normal =
    across.off <= SPLINE_PLANE_TOLERANCE * size
      ? normalize3(cross3(WORLD_Z, along))
      : normalize3(cross3(along, across.v))
  if (!normal) return spline
  const lies = (v: Vec3, scale: number) =>
    Math.abs(dot3(v, normal!)) <= SPLINE_PLANE_TOLERANCE * scale
  if (
    !offsets.every((v) => lies(v, size)) ||
    !tangents.every((v) => lies(v, Math.max(1, length3(v))))
  ) {
    return spline
  }
  if (normal.z < 0) normal = { x: -normal.x, y: -normal.y, z: -normal.z }
  const from = entityAxes(spline)
  const placed = withNormal(spline, axesToWorld(from, normal))
  const to = entityAxes(placed)
  const read = (v: Vec3) => worldToAxes(to, axesToWorld(from, v))
  const z = read(origin).z
  const level = (v: Vec3 | undefined, height: number) =>
    v && { ...read(v), z: height }
  const startTangent = level(spline.startTangent, 0)
  const endTangent = level(spline.endTangent, 0)
  return {
    ...placed,
    points: points.map((p) => level(p, z)!),
    ...(startTangent ? { startTangent } : {}),
    ...(endTangent ? { endTangent } : {}),
  }
}

/** How far off a plane, in units of the spline's size, its points may lie and still be in it. */
const SPLINE_PLANE_TOLERANCE = 1e-10
