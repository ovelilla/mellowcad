import { Vec3, add3, cross3, length3, scale3 } from "../geometry/Vec3"
import { Axes3, axesToWorld } from "../geometry/ocs"
import {
  Brep,
  BrepEdge,
  Wire,
  boxBrep,
  brepArea,
  brepIsolines,
  brepMapped,
  planarFace,
  pyramidBrep,
  roundBrep,
  sphereBrep,
  torusBrep,
  unsigned0,
  wedgeBrep,
} from "../geometry/solids"
import { arbitraryAxis, worldToAxes } from "../geometry/ocs"
import { createRegion } from "./regions"
import { createArc, createCircle, createLine } from "./entityFactories"
import { createEllipse } from "./ellipses"
import { nextEntityId } from "./entityIds"
import { DEFAULT_LAYER_ID, LayerId } from "./layers"
import { withElevation, withNormal } from "./elevation"
import { Ucs, worldDirectionToUcs, worldPointToUcs } from "./ucs"
import { normalizeAngle, normalizeDegrees } from "../geometry/primitives"
import {
  Entity,
  EntityId,
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
    case "cylinder":
    case "cone": {
      const { radius, height } = primitive
      const radiusY = primitive.radiusY ?? radius
      return roundBrep(
        primitive.position,
        primitive.normal,
        primitive.xAxis,
        radius,
        radiusY,
        height,
        primitive.kind === "cylinder"
          ? 1
          : primitive.topRadius / Math.max(radius, radiusY)
      )
    }
    case "sphere":
      return sphereBrep(
        primitive.position,
        primitive.normal,
        primitive.xAxis,
        primitive.radius
      )
    case "torus":
      return torusBrep(
        primitive.position,
        primitive.normal,
        primitive.xAxis,
        primitive.radius,
        primitive.tubeRadius
      )
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
    brep: brepMapped(solid.brep, point, direction, reflects, map.scale),
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
    case "cylinder":
    case "cone":
      return {
        ...primitive,
        ...placed,
        radius: primitive.radius * scale,
        ...(primitive.radiusY !== undefined
          ? { radiusY: primitive.radiusY * scale }
          : {}),
        ...(primitive.kind === "cone"
          ? { topRadius: primitive.topRadius * scale }
          : {}),
        height: primitive.height * scale,
      }
    case "sphere":
      return { ...primitive, ...placed, radius: primitive.radius * scale }
    case "torus":
      return {
        ...primitive,
        ...placed,
        radius: primitive.radius * scale,
        tubeRadius: primitive.tubeRadius * scale,
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
 * An edge's curve as the object it draws as, of the solid's id, in the plane
 * of its normal: a line, a circle or arc, an ellipse or elliptical arc; a
 * whole one when it starts and ends at one vertex. An apex draws nothing.
 */
function edgeEntity(solid: Solid3dEntity, edge: BrepEdge): Entity | null {
  const from = solid.brep.vertices[edge.start]
  const to = solid.brep.vertices[edge.end]
  const curve = edge.curve
  const { layerId, id } = solid
  if (curve.kind === "point") return null
  if (curve.kind === "line") {
    return dressed(solid, createLine(from, to, layerId, id))
  }
  const axes = arbitraryAxis(curve.normal)
  if (!axes) return null
  const c = worldToAxes(axes, curve.center)
  const center = { x: c.x, y: c.y }
  const whole = edge.start === edge.end
  const angle = (p: Vec3) => {
    const q = worldToAxes(axes, p)
    return normalizeAngle(Math.atan2(q.y - c.y, q.x - c.x))
  }
  let piece: Entity
  if (curve.kind === "circle") {
    piece = whole
      ? createCircle(center, curve.radius, layerId, id)
      : createArc(center, curve.radius, angle(from), angle(to), layerId, id)
  } else {
    const m = worldToAxes(axes, curve.majorAxis)
    const major = { x: m.x, y: m.y }
    const size = Math.hypot(major.x, major.y)
    const param = (p: Vec3) => {
      const q = worldToAxes(axes, p)
      const u = ((q.x - c.x) * major.x + (q.y - c.y) * major.y) / size
      const v = (-(q.x - c.x) * major.y + (q.y - c.y) * major.x) / size
      return normalizeAngle(Math.atan2(v / curve.ratio, u))
    }
    piece = createEllipse(center, major, curve.ratio, {
      layerId,
      id,
      ...(whole ? {} : { startParam: param(from), endParam: param(to) }),
    })
  }
  return dressed(solid, withNormal(withElevation(piece, c.z), curve.normal))
}

/**
 * Its edges as the objects they draw as, of its own id: what it is snapped
 * by and what a command taking "the edge picked" reads (solid/s01, s10,
 * e07). A cone's apex is none: {@link solidApexes}.
 */
export function solidEdgeEntities(solid: Solid3dEntity): Entity[] {
  return solid.brep.edges.flatMap((edge) => edgeEntity(solid, edge) ?? [])
}

/** A cone's apex, a vertex no edge runs to: an Endpoint (solid/s09, s10). */
export function solidApexes(solid: Solid3dEntity): Vec3[] {
  return solid.brep.edges
    .filter((edge) => edge.curve.kind === "point")
    .map((edge) => solid.brep.vertices[edge.start])
}

/**
 * A sphere's or a torus' centre, which Center finds from any isoline of it,
 * and only so: none with ISOLINES 0 (solid/s09, s10).
 */
export function solidCenters(solid: Solid3dEntity): Vec3[] {
  return solid.brep.faces.flatMap(({ surface }) =>
    surface.kind === "sphere" || surface.kind === "torus"
      ? [surface.center]
      : []
  )
}

/** An isoline as the object it draws as, of the solid's id, in the plane of its normal. */
function wireEntity(solid: Solid3dEntity, wire: Wire): Entity {
  const { layerId, id } = solid
  if (wire.kind === "line") {
    return dressed(solid, createLine(wire.start, wire.end, layerId, id))
  }
  const axes = arbitraryAxis(wire.normal)!
  const c = worldToAxes(axes, wire.center)
  const s = worldToAxes(axes, wire.start)
  const from = Math.atan2(s.y - c.y, s.x - c.x)
  const center = { x: c.x, y: c.y }
  const piece =
    Math.abs(wire.sweep) >= 2 * Math.PI
      ? createCircle(center, wire.radius, layerId, id)
      : createArc(
          center,
          wire.radius,
          normalizeAngle(from),
          normalizeAngle(from + wire.sweep),
          layerId,
          id
        )
  return dressed(solid, withNormal(withElevation(piece, c.z), wire.normal))
}

/**
 * What the solid draws as and is picked by in 2D Wireframe: its edges and
 * the isolines ISOLINES draws on its curved faces (solid/d04, d06), these
 * snapped by nothing but a sphere's or a torus' Center (s09, s10). A plane
 * has none (d01).
 */
export function solidWireEntities(
  solid: Solid3dEntity,
  isolines: number
): Entity[] {
  return [...solidEdgeEntities(solid), ...solidIsolineEntities(solid, isolines)]
}

/** Its isolines alone, as the objects they draw as. */
export function solidIsolineEntities(
  solid: Solid3dEntity,
  isolines: number
): Entity[] {
  return brepIsolines(solid.brep, isolines).map((wire) =>
    wireEntity(solid, wire)
  )
}

/**
 * Whether a face of it is curved, which AutoCAD's EXPLODE leaves as a
 * SURFACE object (solid/c11, k06), none here.
 */
export function solidHasCurvedFaces(solid: Solid3dEntity): boolean {
  return solid.brep.faces.some((face) => face.surface.kind !== "plane")
}

/**
 * The points STRETCH catches it by: its vertices (solid/t03, t05), a sphere's
 * or a torus' centre (t06).
 */
export function solidStretchPoints(solid: Solid3dEntity): readonly Vec3[] {
  return [...solid.brep.vertices, ...solidCenters(solid)]
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
