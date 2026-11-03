import { Vec2 } from "../geometry/Vec2"
import { Vec3, scale3 } from "../geometry/Vec3"
import { planarMoments } from "../geometry/massProperties"
import {
  bsplineDomain,
  bsplineLength,
  bsplineParamAtLength,
  bsplinePoint,
} from "../geometry/nurbs"
import { arbitraryAxis, axesToWorld } from "../geometry/ocs"
import {
  PlanarCurve,
  curveLength,
  curvePoint,
  curveStart,
} from "../geometry/planarCurves"
import { loopSelfIntersects } from "../geometry/planarRegions"
import { Brep, unsigned0 } from "../geometry/solids"
import { PlanarProfile } from "../geometry/sweeps"
import { entityElevation, entityNormal } from "./elevation"
import { nextEntityId } from "./entityIds"
import { Entity, EntityId, Solid3dEntity, SolidSweep } from "./entityTypes"
import { DEFAULT_LAYER_ID, LayerId } from "./layers"
import { closedLoop } from "./regionModeling"
import { faceOfLoop } from "./regions"

/**
 * What EXTRUDE and REVOLVE can sweep of an object: a region's faces, or the
 * one closed loop a circle, an ellipse, a closed polyline or spline, or one
 * whose ends meet makes, in its plane. `"open"` is an object AutoCAD sweeps
 * into a surface (x02: a line's EXTRUDEDSURFACE), which this engine has no
 * object for; `"crosses"` a loop crossing itself (r04: `Cannot revolve a
 * self-intersecting curve.`); null one no sweep takes (x10: text, a solid).
 */
export function sweepProfile(
  entity: Entity
): PlanarProfile | "open" | "crosses" | null {
  if (entity.type === "region") {
    const axes = arbitraryAxis(entityNormal(entity))
    if (!axes) return null
    return { axes, elevation: entityElevation(entity), faces: entity.faces }
  }
  const loop = closedLoop(entity)
  if (loop === null || loop === "open") return loop
  if (loop.curves.length === 0) return null
  if (loopSelfIntersects(loop.curves)) return "crosses"
  const axes = arbitraryAxis(loop.normal)
  if (!axes) return null
  return {
    axes,
    elevation: loop.elevation,
    faces: [faceOfLoop(loop.curves)],
  }
}

/**
 * Where EXTRUDE measures a height given by a point from, and LASTPOINT as its
 * height prompt opens: the traced BasePoint of AutoCAD's prompt, fitted to
 * 1e-15 over varied profiles (sweeps/p101–p107, extrude/x04, x09). A
 * polyline's is the mean of 20 points at arc lengths k·L/19 along it from
 * its start, k = 0…19, the start counted twice (so a rectangle drawn from
 * the other corner has another); a spline's, a circle's or an ellipse's the
 * mean of 19 points at parameters k/19 of its range, k = 0…18; a region's
 * its area's centroid. A 3D polyline takes the polyline's rule
 * (**unverified**: not probed), as does a spline-fit polyline, measured
 * along its curve (**unverified**). Null for what no sweep takes.
 */
export function profileBase(entity: Entity): Vec3 | null {
  if (entity.type === "region") {
    const axes = arbitraryAxis(entityNormal(entity))
    const first = entity.faces[0]?.loops[0]?.[0]
    if (!axes || !first) return null
    const about = curveStart(first)
    const m = planarMoments(entity.faces, about)
    if (m.area === 0) return null
    return axesToWorld(axes, {
      x: about.x + m.u / m.area,
      y: about.y + m.v / m.area,
      z: entityElevation(entity),
    })
  }
  const loop = closedLoop(entity)
  if (loop === null || loop === "open" || loop.curves.length === 0) {
    return null
  }
  const axes = arbitraryAxis(loop.normal)
  if (!axes) return null
  const byLength = entity.type === "polyline" || entity.type === "polyline3d"
  const points = byLength
    ? pointsByLength(loop.curves, BASE_POINTS)
    : pointsByParameter(loop.curves, BASE_POINTS)
  const mean = points.reduce(
    (sum, p) => ({
      x: sum.x + p.x / points.length,
      y: sum.y + p.y / points.length,
    }),
    { x: 0, y: 0 }
  )
  return axesToWorld(axes, { ...mean, z: loop.elevation })
}

/** The steps round a profile its base is the mean over (p101–p107, x04). */
const BASE_POINTS = 19

/** The points at lengths k·L/n from the loop's start, k = 0…n: the start twice. */
function pointsByLength(curves: readonly PlanarCurve[], n: number): Vec2[] {
  const lengths = curves.map(curveLength)
  const total = lengths.reduce((a, b) => a + b, 0)
  const points: Vec2[] = []
  for (let k = 0; k <= n; k++) {
    let d = (total * k) / n
    let i = 0
    while (i < curves.length - 1 && d > lengths[i]) d -= lengths[i++]
    points.push(pointAlong(curves[i], Math.min(d, lengths[i]), lengths[i]))
  }
  return points
}

/** The point `d` along `c` from its start, `length` its whole length. */
function pointAlong(c: PlanarCurve, d: number, length: number): Vec2 {
  if (c.kind !== "spline") return curvePoint(c, length > 0 ? d / length : 0)
  const { start } = bsplineDomain(c.curve)
  const before = bsplineLength(c.curve, start, Math.min(c.from, c.to))
  const u = bsplineParamAtLength(
    c.curve,
    c.to >= c.from ? before + d : before + length - d
  )
  const p = bsplinePoint(c.curve, u)
  return { x: p.x, y: p.y }
}

/** The points at parameters k/n of the loop's range, k = 0…n−1. */
function pointsByParameter(curves: readonly PlanarCurve[], n: number): Vec2[] {
  const points: Vec2[] = []
  for (let k = 0; k < n; k++) {
    const t = (curves.length * k) / n
    const i = Math.min(Math.floor(t), curves.length - 1)
    points.push(curvePoint(curves[i], t - i))
  }
  return points
}

/** The solid a sweep made, keeping what made it. */
export function createSweptSolid(
  brep: Brep,
  sweep: SolidSweep,
  layerId: LayerId = DEFAULT_LAYER_ID,
  id: EntityId = nextEntityId()
): Solid3dEntity {
  return {
    id,
    type: "solid3d",
    layerId,
    brep,
    sweep:
      sweep.kind === "revolve"
        ? { ...sweep, axis: unsigned0(sweep.axis) }
        : sweep,
  }
}

/**
 * The sweep through a similarity: lengths scale, a revolution's axis turns
 * with the solid and, mirrored, turns the other way round it — its angle
 * kept, as the solid's sense is (**unverified**: no MIRROR probe of LIST's).
 */
export function sweepMapped(
  sweep: SolidSweep,
  direction: (d: Vec3) => Vec3,
  scale: number,
  reflects: boolean
): SolidSweep {
  switch (sweep.kind) {
    case "extrusion":
      return { ...sweep, height: sweep.height * scale }
    case "revolve": {
      const axis = direction(sweep.axis)
      return {
        ...sweep,
        axis: unsigned0(reflects ? scale3(axis, -1) : axis),
      }
    }
  }
}
