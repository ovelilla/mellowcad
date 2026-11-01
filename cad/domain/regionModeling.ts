import { Vec2, V } from "../geometry/Vec2"
import {
  Vec3,
  WORLD_Z,
  cross3,
  dot3,
  length3,
  normalize3,
  sub3,
} from "../geometry/Vec3"
import { arbitraryAxis, worldToAxes } from "../geometry/ocs"
import {
  MODEL_TOLERANCE,
  PlanarCurve,
  curveEnd,
  curveLength,
  curveStart,
} from "../geometry/planarCurves"
import {
  RegionFace,
  RegionOperation,
  loopSelfIntersects,
  loopsFromCurves,
  regionBoolean,
} from "../geometry/planarRegions"
import {
  entityElevation,
  entityNormal,
  facesAlong,
  isLevel,
  lineEndZ,
  lineStartZ,
  splineOnItsPlane,
} from "./elevation"
import { entityInOcs, turnedOver } from "./entityTransforms"
import { Entity, EntityId, RegionEntity } from "./entityTypes"
import { entityShape } from "./polylineFits"
import { faceOfLoop, regionCurvesOf } from "./regions"

/** A region REGION makes: one face, in the plane of its normal at its elevation. */
export interface ExtractedRegion {
  readonly face: RegionFace
  readonly normal: Vec3
  readonly elevation: number
}

/**
 * What REGION makes of a set of objects, and the counts it reports in the
 * order it reports them (region/p01–p15): the objects it cannot use, the
 * loops found, those crossing themselves, the regions made. `consumed` are
 * the objects whose every edge went into a region made, which DELOBJ 3 (its
 * initial value) erases; the others stay (p04's tail).
 */
export interface RegionExtraction {
  readonly regions: readonly ExtractedRegion[]
  readonly rejectedObjects: number
  readonly loopsExtracted: number
  readonly selfIntersecting: number
  /** The open objects lie in no one plane: none of them is used (p06, p15). */
  readonly openNotCoplanar: boolean
  readonly consumed: readonly EntityId[]
}

/** Below this, relative to the drawing's size, a point lies on a plane. */
const PLANE_TOLERANCE = 1e-9

/**
 * REGION: each closed object a loop of its own — a circle, an ellipse, a
 * closed polyline, spline or 3D polyline, or one whose ends meet (p12) —,
 * and the open ones (lines, arcs, elliptical arcs, open polylines and
 * splines) chained end to end in their one plane (`loopsFromCurves`). A
 * loop that crosses itself is rejected; an object of another kind (a region,
 * a hatch, text) or degenerate is too, counted before anything else.
 */
export function extractRegions(entities: readonly Entity[]): RegionExtraction {
  const regions: ExtractedRegion[] = []
  const consumed: EntityId[] = []
  let rejectedObjects = 0
  let loopsExtracted = 0
  let selfIntersecting = 0
  const open: Entity[] = []
  const take = (
    loop: readonly PlanarCurve[],
    plane: { normal: Vec3; elevation: number },
    ids: readonly EntityId[]
  ) => {
    loopsExtracted += 1
    if (loopSelfIntersects(loop)) {
      selfIntersecting += 1
      return
    }
    regions.push({ face: faceOfLoop(loop), ...plane })
    consumed.push(...ids)
  }
  for (const entity of entities) {
    const planar = closedLoop(entity)
    if (planar === "open") {
      open.push(entity)
      continue
    }
    if (planar === null) {
      rejectedObjects += 1
      continue
    }
    take(planar.curves, planar, [entity.id])
  }
  let openNotCoplanar = false
  if (open.length > 0) {
    const plane = commonPlane(open)
    if (plane === null) {
      openNotCoplanar = true
    } else {
      const curves: PlanarCurve[] = []
      const owners: EntityId[] = []
      for (const entity of open) {
        for (const curve of curvesInPlane(entity, plane)) {
          if (curveLength(curve) <= MODEL_TOLERANCE) continue
          curves.push(curve)
          owners.push(entity.id)
        }
      }
      const found = loopsFromCurves(curves)
      for (const [i, loop] of (found?.loops ?? []).entries()) {
        const ids = [...new Set(found!.sources[i].map((k) => owners[k]))]
        take(loop, plane, ids)
      }
    }
  }
  return {
    regions,
    rejectedObjects,
    loopsExtracted,
    selfIntersecting,
    openNotCoplanar,
    consumed: [...new Set(consumed)],
  }
}

export type ClosedLoop = {
  readonly curves: PlanarCurve[]
  readonly normal: Vec3
  readonly elevation: number
}

/**
 * The loop a closed object is in its own plane, `"open"` for an object
 * whose ends do not meet, `null` for one REGION rejects.
 */
export function closedLoop(drawn: Entity): ClosedLoop | "open" | null {
  const entity = entityShape(drawn)
  switch (entity.type) {
    case "line":
    case "arc":
      return "open"
    case "polyline3d": {
      const points = entity.vertices
      if (points.length < 2) return null
      const ends =
        entity.closed ||
        V.distance(points[0], points[points.length - 1]) <= MODEL_TOLERANCE
      if (!ends) return "open"
      const normal = newellNormal(points)
      if (!normal) return null
      const axes = arbitraryAxis(normal)
      if (!axes) return null
      const local = points.map((p) => worldToAxes(axes, p))
      const size = Math.max(1, ...points.map((p) => length3(p)))
      const elevation = local[0].z
      if (local.some((p) => Math.abs(p.z - elevation) > PLANE_TOLERANCE * size))
        return null
      const ring = entity.closed ? [...local, local[0]] : local
      const curves: PlanarCurve[] = []
      for (let i = 0; i + 1 < ring.length; i++) {
        if (V.distance(ring[i], ring[i + 1]) <= MODEL_TOLERANCE) continue
        curves.push({
          kind: "line",
          start: flat(ring[i]),
          end: flat(ring[i + 1]),
        })
      }
      return { curves, normal, elevation }
    }
    case "spline": {
      const placed = isLevel(entity) ? entity : splineOnItsPlane(entity)
      const curves = regionCurvesOf(placed)
      if (!curves || !isLevel(placed))
        return closesItself(curves) ? null : "open"
      if (!closesItself(curves) && !placed.closed) return "open"
      return {
        curves,
        normal: entityNormal(placed),
        elevation: entityElevation(placed),
      }
    }
    case "circle":
    case "ellipse":
    case "polyline": {
      const curves = regionCurvesOf(entity)
      if (!curves || curves.length === 0) return null
      if (curves.every((c) => curveLength(c) <= MODEL_TOLERANCE)) return null
      if (!closesItself(curves)) return "open"
      return {
        curves: curves.filter((c) => curveLength(c) > MODEL_TOLERANCE),
        normal: entityNormal(entity),
        elevation: entityElevation(entity),
      }
    }
    case "text":
    case "mtext":
    case "attdef":
    case "dimension":
    case "hatch":
    case "insert":
    case "region":
    case "solid3d":
      return null
    default: {
      const unhandled: never = entity
      return unhandled
    }
  }
}

function flat(p: Vec2): Vec2 {
  return { x: p.x, y: p.y }
}

function closesItself(curves: readonly PlanarCurve[] | null): boolean {
  if (!curves || curves.length === 0) return false
  return (
    V.distance(curveStart(curves[0]), curveEnd(curves[curves.length - 1])) <=
    MODEL_TOLERANCE
  )
}

/** The unit normal of a polygon of points in space (Newell's), facing up where it can. */
function newellNormal(points: readonly Vec3[]): Vec3 | null {
  let n: Vec3 = { x: 0, y: 0, z: 0 }
  for (let i = 0; i < points.length; i++) {
    const a = points[i]
    const b = points[(i + 1) % points.length]
    n = {
      x: n.x + (a.y - b.y) * (a.z + b.z),
      y: n.y + (a.z - b.z) * (a.x + b.x),
      z: n.z + (a.x - b.x) * (a.y + b.y),
    }
  }
  const unit = normalize3(n)
  if (!unit) return null
  return unit.z < 0 ? { x: -unit.x, y: -unit.y, z: -unit.z } : unit
}

/** Where an open object lies in space: its ends' world points, or its plane. */
function worldEnds(entity: Entity): Vec3[] {
  if (entity.type === "line") {
    return [
      { ...entity.start, z: lineStartZ(entity) },
      { ...entity.end, z: lineEndZ(entity) },
    ]
  }
  if (entity.type === "polyline3d") return [...entity.vertices]
  return []
}

/**
 * The one plane every open object lies in: the plane of the first that has
 * one, else the lines'; `null` when they share none — "Open objects must be
 * coplanar." (p06, p15).
 */
function commonPlane(
  open: readonly Entity[]
): { normal: Vec3; elevation: number } | null {
  const planed = open.find((e) => e.type !== "line" && e.type !== "polyline3d")
  let normal: Vec3 | null = null
  let elevation = 0
  if (planed) {
    const placed =
      planed.type === "spline" && !isLevel(planed)
        ? splineOnItsPlane(planed)
        : planed
    if (!isLevel(placed)) return null
    normal = entityNormal(placed)
    elevation = entityElevation(placed)
  } else {
    const points = open.flatMap(worldEnds)
    normal = pointsPlaneNormal(points)
    if (!normal) return null
    elevation = dot3(points[0], normal)
  }
  const size = Math.max(1, ...open.flatMap(worldEnds).map((p) => length3(p)))
  const onPlane = (p: Vec3) =>
    Math.abs(dot3(p, normal!) - elevation) <= PLANE_TOLERANCE * size
  for (const entity of open) {
    if (entity.type === "line" || entity.type === "polyline3d") {
      if (!worldEnds(entity).every(onPlane)) return null
      continue
    }
    const placed =
      entity.type === "spline" && !isLevel(entity)
        ? splineOnItsPlane(entity)
        : entity
    if (!isLevel(placed)) return null
    const along = facesAlong(placed, normal)
    const against = facesAlong(placed, {
      x: -normal.x,
      y: -normal.y,
      z: -normal.z,
    })
    if (!along && !against) return null
    const height = along ? entityElevation(placed) : -entityElevation(placed)
    if (Math.abs(height - elevation) > PLANE_TOLERANCE * size) return null
  }
  return { normal, elevation }
}

/**
 * The plane of points in space, facing up where it can: +Z when they all lie
 * on one line or one point, which no loop can come of anyway.
 */
function pointsPlaneNormal(points: readonly Vec3[]): Vec3 | null {
  if (points.length < 3) return WORLD_Z
  const a = points[0]
  let far = points[1]
  for (const p of points) {
    if (length3(sub3(p, a)) > length3(sub3(far, a))) far = p
  }
  const d = sub3(far, a)
  let best: Vec3 | null = null
  let bestLength = 0
  for (const p of points) {
    const n = cross3(d, sub3(p, a))
    if (length3(n) > bestLength) {
      bestLength = length3(n)
      best = n
    }
  }
  const size = Math.max(1, length3(d))
  if (!best || bestLength <= 1e-12 * size * size) return WORLD_Z
  const unit = normalize3(best)
  if (!unit) return WORLD_Z
  return unit.z < 0 ? { x: -unit.x, y: -unit.y, z: -unit.z } : unit
}

/** An open object's edges read in the plane's own coordinates. */
function curvesInPlane(entity: Entity, plane: { normal: Vec3 }): PlanarCurve[] {
  const axes = arbitraryAxis(plane.normal)
  if (entity.type === "polyline3d") {
    const local = entityShape(entity).vertices.map((p) =>
      axes ? worldToAxes(axes, p) : p
    )
    const curves: PlanarCurve[] = []
    for (let i = 0; i + 1 < local.length; i++) {
      curves.push({
        kind: "line",
        start: flat(local[i]),
        end: flat(local[i + 1]),
      })
    }
    return curves
  }
  const placed =
    entity.type === "spline" && !isLevel(entity)
      ? splineOnItsPlane(entity)
      : entity
  let level = entityInOcs(placed, plane.normal)
  if ((level.normal?.z ?? 1) < 0) level = turnedOver(level)
  return regionCurvesOf(level) ?? []
}

/** Regions grouped by the plane they lie in, each read in its group's first's coordinates. */
interface PlaneGroup {
  readonly first: RegionEntity
  readonly members: {
    readonly region: RegionEntity
    readonly faces: readonly RegionFace[]
  }[]
}

/** `region`'s faces in `reference`'s plane coordinates, or null when it lies in another plane. */
function facesIn(
  region: RegionEntity,
  reference: RegionEntity
): readonly RegionFace[] | null {
  if (region === reference) return region.faces
  const normal = entityNormal(reference)
  let level = entityInOcs(region, normal)
  if ((level.normal?.z ?? 1) < 0) level = turnedOver(level)
  if (level.type !== "region" || !facesAlong(level, WORLD_Z)) return null
  const size = Math.max(1, Math.abs(entityElevation(reference)))
  if (
    Math.abs(entityElevation(level) - entityElevation(reference)) >
    PLANE_TOLERANCE * size * 1e3
  )
    return null
  return level.faces
}

function planeGroups(regions: readonly RegionEntity[]): PlaneGroup[] {
  const groups: PlaneGroup[] = []
  for (const region of regions) {
    let placed = false
    for (const group of groups) {
      const faces = facesIn(region, group.first)
      if (faces) {
        group.members.push({ region, faces })
        placed = true
        break
      }
    }
    if (!placed)
      groups.push({ first: region, members: [{ region, faces: region.faces }] })
  }
  return groups
}

/**
 * What a boolean leaves: the regions changed (each keeping its id) and the
 * ids erased, and how many results came to nothing — AutoCAD's "Null region
 * created - deleted", once each (region/b05, b06).
 */
export interface BooleanOutcome {
  readonly changed: readonly RegionEntity[]
  readonly erased: readonly EntityId[]
  readonly nullResults: number
}

/**
 * UNION or INTERSECT of regions, plane by plane: the regions of one plane
 * become the first of them (b01, b08), the others erased; a plane with one
 * region is left alone. `null` when no plane holds two — "At least 2 solids,
 * surfaces, or coplanar regions must be selected." (b07).
 */
export function combineRegions(
  op: Exclude<RegionOperation, "subtract">,
  regions: readonly RegionEntity[]
): BooleanOutcome | null {
  const groups = planeGroups(regions).filter((g) => g.members.length > 1)
  if (groups.length === 0) return null
  const changed: RegionEntity[] = []
  const erased: EntityId[] = []
  let nullResults = 0
  for (const group of groups) {
    let faces: readonly RegionFace[] = group.members[0].faces
    for (const member of group.members.slice(1)) {
      faces = regionBoolean(op, faces, member.faces)
    }
    for (const member of group.members.slice(1)) erased.push(member.region.id)
    if (faces.length === 0) {
      nullResults += 1
      erased.push(group.first.id)
    } else {
      changed.push({ ...group.first, faces })
    }
  }
  return { changed, erased, nullResults }
}

/**
 * SUBTRACT: in each plane holding some of `from`, those regions joined into
 * the first and every region of `subtract` in that plane taken out of it and
 * erased, whether it overlapped or not (b05, b10). A region of `subtract` in a
 * plane `from` has none of is left as it was (b10's circle at Z 5), and so is
 * a plane of `from` with nothing to subtract (**unverified**).
 */
export function subtractRegions(
  from: readonly RegionEntity[],
  subtract: readonly RegionEntity[]
): BooleanOutcome {
  const bases = new Set(from.map((r) => r.id))
  const tools = subtract.filter((r) => !bases.has(r.id))
  const changed: RegionEntity[] = []
  const erased: EntityId[] = []
  let nullResults = 0
  for (const group of planeGroups(from)) {
    const taken = tools
      .map((tool) => ({ tool, faces: facesIn(tool, group.first) }))
      .filter(
        (t): t is { tool: RegionEntity; faces: readonly RegionFace[] } =>
          t.faces !== null
      )
    if (taken.length === 0) continue
    let faces: readonly RegionFace[] = group.members[0].faces
    for (const member of group.members.slice(1)) {
      faces = regionBoolean("union", faces, member.faces)
      erased.push(member.region.id)
    }
    for (const { tool, faces: cut } of taken) {
      faces = regionBoolean("subtract", faces, cut)
      erased.push(tool.id)
    }
    if (faces.length === 0) {
      nullResults += 1
      erased.push(group.first.id)
    } else {
      changed.push({ ...group.first, faces })
    }
  }
  return { changed, erased: [...new Set(erased)], nullResults }
}
