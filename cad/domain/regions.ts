import { V, Vec2 } from "../geometry/Vec2"
import { normalizeAngle } from "../geometry/primitives"
import {
  bsplineDomain,
  bsplineReversed,
  bsplineSegment,
} from "../geometry/nurbs"
import {
  PlanarCurve,
  PlanarSimilarity,
  curveMapped,
  curveStart,
  similarityReflects,
} from "../geometry/planarCurves"
import {
  RegionFace,
  RegionLoop,
  facesArea,
  facesPerimeter,
  loopArea,
  loopReversed,
} from "../geometry/planarRegions"
import { carryPlane } from "./elevation"
import { createEllipse } from "./ellipses"
import { nextEntityId } from "./entityIds"
import { createArc, createCircle, createLine } from "./entityFactories"
import { DEFAULT_LAYER_ID, LayerId } from "./layers"
import { polylineSegmentGeometries } from "./polylines"
import { entityShape } from "./polylineFits"
import { createSpline, splineCurve } from "./splines"
import { Entity, EntityId, RegionEntity } from "./entityTypes"

export function createRegion(
  faces: readonly RegionFace[],
  layerId: LayerId = DEFAULT_LAYER_ID,
  id: EntityId = nextEntityId()
): RegionEntity {
  return { id, type: "region", layerId, faces }
}

/** The region's area, its holes taken out: LIST's, AREA's and the palette's Area. */
export function regionArea(region: RegionEntity): number {
  return facesArea(region.faces)
}

/** The length of every loop, holes included (region/b02's 111.4159). */
export function regionPerimeter(region: RegionEntity): number {
  return facesPerimeter(region.faces)
}

/**
 * The region carried through `map` in its plane, keeping its id. A
 * reflection would leave each outline clockwise: its loops are turned back
 * so the face stays on every edge's left.
 */
export function regionMapped(
  region: RegionEntity,
  map: PlanarSimilarity
): RegionEntity {
  const reflects = similarityReflects(map)
  return {
    ...region,
    faces: region.faces.map((face) => ({
      loops: face.loops.map((loop) => {
        const mapped = loop.map((edge) => curveMapped(edge, map))
        return reflects ? loopReversed(mapped) : mapped
      }),
    })),
  }
}

const IDENTITY = { xx: 1, xy: 0, yx: 0, yy: 1 }

export function shiftBy(delta: Vec2): PlanarSimilarity {
  return { linear: IDENTITY, translation: { x: delta.x, y: delta.y } }
}

export function turnAbout(pivot: Vec2, radians: number): PlanarSimilarity {
  const c = Math.cos(radians)
  const s = Math.sin(radians)
  return {
    linear: { xx: c, xy: -s, yx: s, yy: c },
    translation: {
      x: pivot.x - c * pivot.x + s * pivot.y,
      y: pivot.y - s * pivot.x - c * pivot.y,
    },
  }
}

export function scaleAbout(base: Vec2, factor: number): PlanarSimilarity {
  return {
    linear: { xx: factor, xy: 0, yx: 0, yy: factor },
    translation: { x: base.x * (1 - factor), y: base.y * (1 - factor) },
  }
}

export function reflectAcross(a: Vec2, b: Vec2): PlanarSimilarity {
  const d = V.normalize(V.sub(b, a))
  const xx = d.x * d.x - d.y * d.y
  const xy = 2 * d.x * d.y
  return {
    linear: { xx, xy, yx: xy, yy: -xx },
    translation: {
      x: a.x - (xx * a.x + xy * a.y),
      y: a.y - (xy * a.x - xx * a.y),
    },
  }
}

/** A whole turn, give or take what a sum of pieces loses. */
function isWholeTurn(sweep: number): boolean {
  return Math.abs(Math.abs(sweep) - Math.PI * 2) < 1e-9
}

/**
 * One edge as the object EXPLODE leaves of it, in the region's plane and
 * wearing its layer, colour, linetype and lineweight (region/p09, p11): a
 * line, an arc (counter-clockwise, as every arc is stored), a circle for a
 * whole turn, an ellipse or elliptical arc, a spline of the piece's own
 * control points. `id` is the object's.
 */
export function regionEdgeEntity(
  region: RegionEntity,
  edge: PlanarCurve,
  id: EntityId
): Entity {
  let piece: Entity
  switch (edge.kind) {
    case "line":
      piece = createLine(edge.start, edge.end, region.layerId, id)
      break
    case "arc": {
      if (isWholeTurn(edge.sweep)) {
        piece = createCircle(edge.center, edge.radius, region.layerId, id)
        break
      }
      const from =
        edge.sweep > 0 ? edge.startAngle : edge.startAngle + edge.sweep
      piece = createArc(
        edge.center,
        edge.radius,
        normalizeAngle(from),
        normalizeAngle(from + Math.abs(edge.sweep)),
        region.layerId,
        id
      )
      break
    }
    case "ellipse": {
      const from =
        edge.sweep > 0 ? edge.startParam : edge.startParam + edge.sweep
      piece = createEllipse(edge.center, edge.majorAxis, edge.ratio, {
        layerId: region.layerId,
        id,
        ...(isWholeTurn(edge.sweep)
          ? {}
          : {
              startParam: normalizeAngle(from),
              endParam: normalizeAngle(from + Math.abs(edge.sweep)),
            }),
      })
      break
    }
    case "spline": {
      const lo = Math.min(edge.from, edge.to)
      const hi = Math.max(edge.from, edge.to)
      const domain = bsplineDomain(edge.curve)
      let curve =
        lo <= domain.start && hi >= domain.end
          ? edge.curve
          : bsplineSegment(edge.curve, lo, hi)
      if (edge.to < edge.from) curve = bsplineReversed(curve)
      piece = createSpline("cv", curve.controlPoints, {
        degree: curve.degree,
        knotVector: curve.knots,
        ...(curve.weights ? { weights: curve.weights } : {}),
        layerId: region.layerId,
        id,
      })
      break
    }
  }
  const dressed = {
    ...piece,
    ...(region.color ? { color: region.color } : {}),
    ...(region.linetype ? { linetype: region.linetype } : {}),
    ...(region.lineweight !== undefined
      ? { lineweight: region.lineweight }
      : {}),
  } as Entity
  return carryPlane(region, dressed)
}

/**
 * What the region draws as, is picked, measured and snapped by: its edges as
 * objects of its own id, as a block reference is its block's objects.
 */
export function regionEdgeEntities(region: RegionEntity): Entity[] {
  return region.faces.flatMap((face) =>
    face.loops.flatMap((loop) =>
      loop.map((edge) => regionEdgeEntity(region, edge, region.id))
    )
  )
}

/**
 * Its edges as objects read in its own plane — at its elevation, without its
 * normal —, as a camera of that plane draws them and as its coordinates read.
 */
export function regionLevelEdgeEntities(region: RegionEntity): Entity[] {
  const { normal, ...level } = region
  void normal
  return regionEdgeEntities(level)
}

/**
 * The region's grips (region/s01–s03, d01), in its plane: every corner where
 * one edge runs into the next, and the centre of a loop that is one whole
 * circle or ellipse.
 */
export function regionGripPoints(region: RegionEntity): Vec2[] {
  const out: Vec2[] = []
  for (const face of region.faces) {
    for (const loop of face.loops) {
      const only = loop.length === 1 ? loop[0] : null
      if (only && (only.kind === "arc" || only.kind === "ellipse")) {
        out.push(only.center)
        continue
      }
      for (const edge of loop) out.push(curveStart(edge))
    }
  }
  return out
}

/**
 * The edges an object of a region's plane gives, in its own order, read as
 * it stores its points (its OCS), or `null` for one no region is made of. A
 * polyline's arcs keep the way their bulge turns; a 3D polyline is read by
 * the caller, which knows its plane.
 */
export function regionCurvesOf(entity: Entity): PlanarCurve[] | null {
  switch (entity.type) {
    case "line":
      return [{ kind: "line", start: entity.start, end: entity.end }]
    case "circle":
      return [
        {
          kind: "arc",
          center: entity.center,
          radius: entity.radius,
          startAngle: 0,
          sweep: Math.PI * 2,
        },
      ]
    case "arc": {
      const sweep = normalizeAngle(entity.endAngle - entity.startAngle)
      return [
        {
          kind: "arc",
          center: entity.center,
          radius: entity.radius,
          startAngle: entity.startAngle,
          sweep: sweep === 0 ? Math.PI * 2 : sweep,
        },
      ]
    }
    case "ellipse": {
      const { startParam, endParam } = entity
      const full = startParam === undefined || endParam === undefined
      return [
        {
          kind: "ellipse",
          center: entity.center,
          majorAxis: entity.majorAxis,
          ratio: entity.ratio,
          startParam: full ? 0 : startParam,
          sweep: full
            ? Math.PI * 2
            : normalizeAngle(endParam - startParam) || Math.PI * 2,
        },
      ]
    }
    case "polyline":
      return polylineSegmentGeometries(entityShape(entity)).map(
        (seg): PlanarCurve =>
          seg.kind === "line"
            ? { kind: "line", start: seg.a, end: seg.b }
            : {
                kind: "arc",
                center: seg.center,
                radius: seg.radius,
                startAngle: Math.atan2(
                  seg.a.y - seg.center.y,
                  seg.a.x - seg.center.x
                ),
                sweep: 4 * Math.atan(seg.bulge),
              }
      )
    case "spline": {
      const curve = splineCurve(entity)
      const flat = {
        ...curve,
        controlPoints: curve.controlPoints.map((p) => ({
          x: p.x,
          y: p.y,
          z: 0,
        })),
      }
      const domain = bsplineDomain(flat)
      return [
        { kind: "spline", curve: flat, from: domain.start, to: domain.end },
      ]
    }
    case "polyline3d":
    case "text":
    case "mtext":
    case "attdef":
    case "dimension":
    case "hatch":
    case "insert":
    case "region":
      return null
    default: {
      const unhandled: never = entity
      return unhandled
    }
  }
}

/** A face of one loop, turned counter-clockwise. */
export function faceOfLoop(loop: RegionLoop): RegionFace {
  return { loops: [loopArea(loop) < 0 ? loopReversed(loop) : loop] }
}
