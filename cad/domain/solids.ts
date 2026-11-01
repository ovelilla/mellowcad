import { Vec3, add3, cross3, length3, scale3 } from "../geometry/Vec3"
import { Axes3, axesToWorld } from "../geometry/ocs"
import {
  Brep,
  boxBrep,
  pyramidBrep,
  wedgeBrep,
  brepArea,
  brepEdgeSegments,
  brepMapped,
  planarFace,
  unsigned0,
} from "../geometry/solids"
import { createRegion } from "./regions"
import { createLine } from "./entityFactories"
import { nextEntityId } from "./entityIds"
import { DEFAULT_LAYER_ID, LayerId } from "./layers"
import { withElevation, withNormal } from "./elevation"
import { Ucs, worldDirectionToUcs, worldPointToUcs } from "./ucs"
import { normalizeDegrees } from "../geometry/primitives"
import {
  Entity,
  EntityId,
  LineEntity,
  RegionEntity,
  Solid3dEntity,
  SolidPrimitive,
} from "./entityTypes"

/** The frame a primitive is made in: its X, the Y beside it, its normal. */
function primitiveFrame(primitive: SolidPrimitive): Axes3 {
  return {
    x: primitive.xAxis,
    y: cross3(primitive.normal, primitive.xAxis),
    z: primitive.normal,
  }
}

/** A point of the primitive's own frame, from its position. */
function framePoint(primitive: SolidPrimitive, p: Vec3): Vec3 {
  return add3(primitive.position, axesToWorld(primitiveFrame(primitive), p))
}

/** The solid a primitive describes, as the kernel's B-rep. */
export function primitiveBrep(primitive: SolidPrimitive): Brep {
  switch (primitive.kind) {
    case "box":
    case "wedge": {
      const { length, width, height } = primitive
      const corner = framePoint(primitive, {
        x: -length / 2,
        y: -width / 2,
        z: 0,
      })
      const { x, y, z } = primitiveFrame(primitive)
      return (primitive.kind === "box" ? boxBrep : wedgeBrep)(
        corner,
        scale3(x, length),
        scale3(y, width),
        scale3(z, height)
      )
    }
    case "pyramid": {
      const { sides, radius, topRadius, height } = primitive
      // The polygon's corners half a side either way of its X (solid/y01).
      const ring = (r: number, z: number) =>
        Array.from({ length: sides }, (_, k) => {
          const angle = (Math.PI * (2 * k + 1)) / sides
          return framePoint(primitive, {
            x: r * Math.cos(angle),
            y: r * Math.sin(angle),
            z,
          })
        })
      return pyramidBrep(
        ring(radius, 0),
        framePoint(primitive, { x: 0, y: 0, z: height }),
        topRadius > 0 ? ring(topRadius, height) : null
      )
    }
  }
}

/** The solid `primitive` describes, which it keeps as its history. */
export function createSolid(
  primitive: SolidPrimitive,
  layerId: LayerId = DEFAULT_LAYER_ID,
  id: EntityId = nextEntityId()
): Solid3dEntity {
  return {
    id,
    type: "solid3d",
    layerId,
    brep: primitiveBrep(primitive),
    primitive: {
      ...primitive,
      position: unsigned0(primitive.position),
      xAxis: unsigned0(primitive.xAxis),
      normal: unsigned0(primitive.normal),
    },
  }
}

/** A similarity of space: `rotation` (a reflection when left-handed), then `scale`, then `translation`. */
export interface SolidMap {
  readonly rotation: Axes3
  readonly scale: number
  readonly translation: Vec3
}

/**
 * The solid carried through `map`, keeping its id: its boundary and its
 * primitive. A primitive mirrored is still that primitive (solid/t01: a box's
 * Rotation 330 after a mirror across a level line; w06, y08), its axes
 * reflected, as the symmetry of each about its X allows.
 */
export function solidMapped(
  solid: Solid3dEntity,
  map: SolidMap
): Solid3dEntity {
  const { x, y, z } = map.rotation
  const reflects = length3(add3(cross3(x, y), scale3(z, -1))) > 1
  const direction = (d: Vec3) => axesToWorld(map.rotation, d)
  const point = (p: Vec3) =>
    add3(scale3(direction(p), map.scale), map.translation)
  const primitive = solid.primitive
  return {
    ...solid,
    brep: brepMapped(solid.brep, point, direction, reflects),
    ...(primitive
      ? { primitive: primitiveMapped(primitive, point, direction, map.scale) }
      : {}),
  }
}

function primitiveMapped(
  primitive: SolidPrimitive,
  point: (p: Vec3) => Vec3,
  direction: (d: Vec3) => Vec3,
  scale: number
): SolidPrimitive {
  const placed = {
    position: unsigned0(point(primitive.position)),
    xAxis: unsigned0(direction(primitive.xAxis)),
    normal: unsigned0(direction(primitive.normal)),
  }
  switch (primitive.kind) {
    case "box":
    case "wedge":
      return {
        ...primitive,
        ...placed,
        length: primitive.length * scale,
        width: primitive.width * scale,
        height: primitive.height * scale,
      }
    case "pyramid":
      return {
        ...primitive,
        ...placed,
        radius: primitive.radius * scale,
        topRadius: primitive.topRadius * scale,
        height: primitive.height * scale,
      }
  }
}

/** The solid's ByObject colour, linetype and lineweight on what is drawn or made of it. */
function dressed<T extends Entity>(solid: Solid3dEntity, piece: T): T {
  return {
    ...piece,
    ...(solid.color ? { color: solid.color } : {}),
    ...(solid.linetype ? { linetype: solid.linetype } : {}),
    ...(solid.lineweight !== undefined ? { lineweight: solid.lineweight } : {}),
  }
}

/**
 * What the solid draws as, is picked and snapped by in 2D Wireframe: its
 * edges, as lines of its own id from end to end at their heights. A plane
 * has no isolines (solid/d01: ISOLINES 4 and 16 draw a box alike).
 */
export function solidEdgeEntities(solid: Solid3dEntity): LineEntity[] {
  return brepEdgeSegments(solid.brep).map(([a, b]) =>
    dressed(solid, createLine(a, b, solid.layerId, solid.id))
  )
}

/** The points STRETCH catches it by: its vertices (solid/t03, t05). */
export function solidStretchPoints(solid: Solid3dEntity): readonly Vec3[] {
  return solid.brep.vertices
}

/**
 * EXPLODE's pieces: a region of each face, in the plane of its outward normal,
 * wearing the solid's layer and overrides (solid/p09).
 */
export function solidFaceRegions(solid: Solid3dEntity): RegionEntity[] {
  return solid.brep.faces.map((face) => {
    const flat = planarFace(solid.brep, face)
    const region = dressed(solid, createRegion([flat.face], solid.layerId))
    return withNormal(withElevation(region, flat.elevation), flat.axes.z)
  })
}

/** Its surface area: AREA's Object (solid/p01, `Area = 700.0000, Perimeter = 0.0000`). */
export function solidArea(solid: Solid3dEntity): number {
  return brepArea(solid.brep)
}

/** A primitive's placement as LIST and the palette read it in `ucs`. */
export interface PrimitiveInUcs {
  /** The centre of its base. */
  readonly position: Vec3
  /** Its normal, or null when it is the UCS's Z (LIST then leaves the line out, solid/p06). */
  readonly normal: Vec3 | null
  /** Degrees, its X's heading on the UCS's XY plane (solid/p13, t02, y07). */
  readonly rotation: number
}

export function primitiveInUcs(
  primitive: SolidPrimitive,
  ucs: Ucs
): PrimitiveInUcs {
  const normal = worldDirectionToUcs(ucs, primitive.normal)
  const along = worldDirectionToUcs(ucs, primitive.xAxis)
  const level =
    Math.abs(normal.x) <= TILT && Math.abs(normal.y) <= TILT && normal.z > 0
  return {
    position: worldPointToUcs(ucs, primitive.position),
    normal: level ? null : normal,
    rotation: normalizeDegrees((Math.atan2(along.y, along.x) * 180) / Math.PI),
  }
}

const TILT = 1e-10
