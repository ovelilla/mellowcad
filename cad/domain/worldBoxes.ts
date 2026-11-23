import { Vec3, add3, scale3 } from "../geometry/Vec3"
import { Box3, boxOfPoints, brepBox } from "../geometry/solids"
import { BlockLookup, Entity } from "./entityTypes"
import { entityBounds } from "./entityQueries"
import { entityInOcs, rotateEntity } from "./entityTransforms"
import {
  entityAxes,
  entityElevation,
  entityNormal,
  entityThickness,
  lineEndZ,
  lineStartZ,
} from "./elevation"
import { insertFlatGeometry } from "./blocks"
import { splinePolyline } from "./splines"
import { polygonMeshGrid } from "./polygonMeshes"
import { isInfiniteLine } from "./infiniteLines"
import { entityShape } from "./polylineFits"

/**
 * The box an object fills in space, along the world's axes: what EXTMIN and
 * EXTMAX hold (dxf/x058). Not `entityBounds`, which reads an object in its own
 * plane: a circle of normal −Z centred at 100,0 is at −100,0 there. `null`
 * for an XLINE or a RAY, which have no extents.
 */
export function entityWorldBox(
  entity: Entity,
  blocks?: BlockLookup
): Box3 | null {
  switch (entity.type) {
    case "xline":
    case "ray":
      return null
    case "solid3d":
      return brepBox(entity.brep)
    case "insert": {
      // What it shows, each piece in its own plane (a block may hold a
      // solid, or a circle facing down).
      const nested = blocks ? insertFlatGeometry(entity, blocks) : []
      const position = { ...entity.position, z: entityElevation(entity) }
      return (
        entitiesWorldBox(nested, blocks) ??
        boxOfPoints([entity.normal ? planeToWorld(entity, position) : position])
      )
    }
    case "line": {
      const ends: Vec3[] = [
        { ...entity.start, z: lineStartZ(entity) },
        { ...entity.end, z: lineEndZ(entity) },
      ]
      const rise = scale3(entityNormal(entity), entityThickness(entity))
      return boxOfPoints([...ends, ...ends.map((p) => add3(p, rise))])
    }
    case "polyline3d":
      // A fitted one's curve, not its frame.
      return boxOfPoints(entityShape(entity).vertices)
    case "face3d":
      return boxOfPoints(entity.corners)
    case "polygonMesh":
      return boxOfPoints(polygonMeshGrid(entity).points)
    case "spline":
      // One with no plane of its own may leave every plane: its curve's Z.
      if (!entity.normal) return boxOfPoints(splinePolyline(entity))
      return planarBox(entity, blocks)
    default:
      return planarBox(entity, blocks)
  }
}

/** The box of several objects in space, or `null` when none has extents. */
export function entitiesWorldBox(
  entities: Iterable<Entity>,
  blocks?: BlockLookup
): Box3 | null {
  let box: Box3 | null = null
  for (const entity of entities) {
    if (isInfiniteLine(entity)) continue
    const one = entityWorldBox(entity, blocks)
    if (!one) continue
    box = box
      ? {
          min: {
            x: Math.min(box.min.x, one.min.x),
            y: Math.min(box.min.y, one.min.y),
            z: Math.min(box.min.z, one.min.z),
          },
          max: {
            x: Math.max(box.max.x, one.max.x),
            y: Math.max(box.max.y, one.max.y),
            z: Math.max(box.max.z, one.max.z),
          },
        }
      : one
  }
  return box
}

function planeToWorld(entity: Entity, point: Vec3): Vec3 {
  const axes = entityAxes(entity)
  return add3(
    add3(scale3(axes.x, point.x), scale3(axes.y, point.y)),
    scale3(axes.z, point.z)
  )
}

/**
 * An object lying in its plane, measured along each world axis. A world
 * coordinate of a point of the plane is `a·u + b·v + n·h` (`u`, `v` its plan,
 * `h` its height there), so its extremes over the object are those of the
 * plan along the direction (a, b), plus the height's part: read off the plan
 * bounds where that direction is an axis of the plan, which keeps a level
 * object's box its `entityBounds` to the bit, and off the plan turned onto it
 * otherwise.
 */
function planarBox(entity: Entity, blocks?: BlockLookup): Box3 {
  const axes = entityAxes(entity)
  const flat = entity.normal ? entityInOcs(entity, entity.normal) : entity
  const plan = entityBounds(flat, blocks)
  const low = entityElevation(entity)
  const high = low + entityThickness(entity)
  const span = (k: "x" | "y" | "z"): [number, number] => {
    const [from, to] = planSpan(flat, plan, axes.x[k], axes.y[k], blocks)
    const n = axes.z[k]
    // `+ 0`: a −0, which a file cannot hold, as 0.
    return [
      from + Math.min(n * low, n * high) + 0,
      to + Math.max(n * low, n * high) + 0,
    ]
  }
  const [minX, maxX] = span("x")
  const [minY, maxY] = span("y")
  const [minZ, maxZ] = span("z")
  return {
    min: { x: minX, y: minY, z: minZ },
    max: { x: maxX, y: maxY, z: maxZ },
  }
}

/** The least and greatest `a·u + b·v` over the object's plan. */
function planSpan(
  flat: Entity,
  plan: ReturnType<typeof entityBounds>,
  a: number,
  b: number,
  blocks?: BlockLookup
): [number, number] {
  if (a === 0 && b === 0) return [0, 0]
  if (b === 0) {
    return a > 0
      ? [a * plan.min.x, a * plan.max.x]
      : [a * plan.max.x, a * plan.min.x]
  }
  if (a === 0) {
    return b > 0
      ? [b * plan.min.y, b * plan.max.y]
      : [b * plan.max.y, b * plan.min.y]
  }
  const turned = entityBounds(
    rotateEntity(flat, { x: 0, y: 0 }, -Math.atan2(b, a)),
    blocks
  )
  const length = Math.hypot(a, b)
  return [length * turned.min.x, length * turned.max.x]
}
