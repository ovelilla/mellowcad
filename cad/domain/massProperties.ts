import { Vec2 } from "../geometry/Vec2"
import { Vec3, cross3, dot3, length3, scale3 } from "../geometry/Vec3"
import { Axes3, arbitraryAxis, axesToWorld } from "../geometry/ocs"
import {
  Moments,
  RegionInertia,
  SolidInertia,
  brepMoments,
  centroidOf,
  momentsSum,
  regionInertia,
  regionMoments,
  solidInertia,
} from "../geometry/massProperties"
import {
  MODEL_TOLERANCE,
  curveStart,
  curveTessellation,
} from "../geometry/planarCurves"
import {
  Box3,
  boxOfPoints,
  brepBox,
  ellipticalArcExtremes,
} from "../geometry/solids"
import { entityElevation, entityNormal } from "./elevation"
import { regionArea, regionPerimeter } from "./regions"
import { Entity, RegionEntity, Solid3dEntity } from "./entityTypes"

/**
 * MASSPROP's report of a set (solid/m01–m10, region/p01, b02), every point
 * read in the axes the objects are given in — the current UCS's, its origin
 * the moments' — with a density of 1: the regions first, then the solids,
 * each summed as one body, overlaps counted twice (m05).
 */
export interface MassReport {
  /** Regions left out for lying in another plane than the set's first's (m09). */
  readonly ignoredRegions: number
  readonly regions: RegionMass | null
  readonly solids: SolidMass | null
}

/**
 * The regions' area and perimeter, their box and centroid in space, and, in
 * the XY plane itself (at its Z 0), their moments there (m07: a region off
 * it, even level at Z 7, reports no more).
 */
export interface RegionMass {
  readonly area: number
  readonly perimeter: number
  readonly box: Box3
  readonly centroid: Vec3
  readonly inertia: RegionInertia | null
}

export interface SolidMass {
  readonly volume: number
  readonly box: Box3
  readonly inertia: SolidInertia
}

/** Null when the set holds neither a solid nor a region: `No solids or regions selected.` */
export function massReport(entities: readonly Entity[]): MassReport | null {
  const regions = entities.filter(
    (entity): entity is RegionEntity => entity.type === "region"
  )
  const solids = entities.filter(
    (entity): entity is Solid3dEntity => entity.type === "solid3d"
  )
  if (regions.length === 0 && solids.length === 0) return null
  const [first] = regions
  const kept = first ? regions.filter((r) => samePlane(r, first)) : []
  return {
    ignoredRegions: regions.length - kept.length,
    regions: kept.length > 0 ? regionsMass(kept) : null,
    solids: solids.length > 0 ? solidsMass(solids) : null,
  }
}

function solidsMass(solids: readonly Solid3dEntity[]): SolidMass {
  const moments = momentsSum(solids.map((solid) => brepMoments(solid.brep)))!
  return {
    volume: moments.measure,
    box: boxOfPoints(
      solids.flatMap((solid) => {
        const box = brepBox(solid.brep)
        return box ? [box.min, box.max] : []
      })
    )!,
    inertia: solidInertia(moments),
  }
}

/** The plane a region lies in: its frame and how far along its normal. */
function planeOf(region: RegionEntity): { axes: Axes3; elevation: number } {
  const normal = entityNormal(region)
  return { axes: arbitraryAxis(normal)!, elevation: entityElevation(region) }
}

/** A size the regions' coordinates are measured against, for the tolerance. */
function sizeOf(region: RegionEntity): number {
  const { elevation } = planeOf(region)
  let size = Math.max(1, Math.abs(elevation))
  for (const face of region.faces) {
    for (const loop of face.loops) {
      for (const curve of loop) {
        const p = curveStart(curve)
        size = Math.max(size, Math.abs(p.x), Math.abs(p.y))
      }
    }
  }
  return size
}

/** Whether two regions lie in one plane, either facing. */
function samePlane(a: RegionEntity, b: RegionEntity): boolean {
  const na = entityNormal(a)
  const nb = entityNormal(b)
  if (length3(cross3(na, nb)) > MODEL_TOLERANCE) return false
  const facing = dot3(na, nb) > 0 ? 1 : -1
  const tolerance = MODEL_TOLERANCE * Math.max(sizeOf(a), sizeOf(b))
  return Math.abs(entityElevation(a) - facing * entityElevation(b)) <= tolerance
}

/** Whether the region lies in the XY plane, at Z 0 (solid/m07). */
function inXyPlane(region: RegionEntity): boolean {
  const n = entityNormal(region)
  return (
    Math.abs(n.x) <= MODEL_TOLERANCE &&
    Math.abs(n.y) <= MODEL_TOLERANCE &&
    Math.abs(entityElevation(region)) <= MODEL_TOLERANCE * sizeOf(region)
  )
}

function regionsMass(regions: readonly RegionEntity[]): RegionMass {
  const moments = momentsSum(
    regions.map((region) => {
      const { axes, elevation } = planeOf(region)
      const about = anyPoint(region)
      return regionMoments(region.faces, axes, elevation, about)
    })
  ) as Moments
  return {
    area: regions.reduce((sum, region) => sum + regionArea(region), 0),
    perimeter: regions.reduce(
      (sum, region) => sum + regionPerimeter(region),
      0
    ),
    box: boxOfPoints(regions.flatMap(regionBoxPoints))!,
    centroid: centroidOf(moments),
    inertia: inXyPlane(regions[0]) ? regionInertia(moments) : null,
  }
}

/** A point of the region's plane near it, which its moments are taken about. */
function anyPoint(region: RegionEntity): Vec2 {
  const curve = region.faces[0]?.loops[0]?.[0]
  return curve ? curveStart(curve) : { x: 0, y: 0 }
}

/**
 * The points that bound the region in space: its edges' ends and where its
 * arcs turn; a spline's points along it, as close as the double allows.
 */
function regionBoxPoints(region: RegionEntity): Vec3[] {
  const { axes, elevation } = planeOf(region)
  const at = (p: Vec2) => axesToWorld(axes, { x: p.x, y: p.y, z: elevation })
  const way = (v: Vec2) => axesToWorld(axes, { x: v.x, y: v.y, z: 0 })
  const points: Vec3[] = []
  for (const face of region.faces) {
    for (const loop of face.loops) {
      for (const c of loop) {
        switch (c.kind) {
          case "line":
            points.push(at(c.start), at(c.end))
            break
          case "arc":
            points.push(
              ...ellipticalArcExtremes(
                at(c.center),
                scale3(axes.x, c.radius),
                scale3(axes.y, c.radius),
                c.startAngle,
                c.sweep
              )
            )
            break
          case "ellipse":
            points.push(
              ...ellipticalArcExtremes(
                at(c.center),
                way(c.majorAxis),
                way({
                  x: -c.majorAxis.y * c.ratio,
                  y: c.majorAxis.x * c.ratio,
                }),
                c.startParam,
                c.sweep
              )
            )
            break
          case "spline":
            points.push(
              ...curveTessellation(c, SPLINE_BOX_TOLERANCE).points.map(at)
            )
        }
      }
    }
  }
  return points
}

/** How far a spline's points may stray from it in its box: well under LUPREC's 8 places. */
const SPLINE_BOX_TOLERANCE = 1e-9
