import { Vec2 } from "../geometry/Vec2"
import { Vec3, add3, dot3, normalize3, scale3, sub3 } from "../geometry/Vec3"
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
  curveCentroid,
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
 * The profiles a sweep makes one solid of each: a region's faces one by one
 * (sweeps/p306, p332: a region UNION made of two rectangles extrudes and
 * revolves into two solids, the face of the rectangle drawn second first,
 * which is the first face UNION leaves here; any other order **unverified**),
 * any other profile whole.
 */
export function sweptFaces(profile: PlanarProfile): PlanarProfile[] {
  if (profile.faces.length <= 1) return [profile]
  return profile.faces.map((face) => ({ ...profile, faces: [face] }))
}

/**
 * Where EXTRUDE measures a height given by a point from, and LASTPOINT as its
 * height prompt opens: the traced BasePoint of AutoCAD's prompt, fitted to
 * 1e-15 over varied profiles (sweeps/p101–p107, extrude/x04, x09). A
 * polyline's is the mean of 20 points at arc lengths k·L/19 along it from
 * its start, k = 0…19, the start counted twice (so a rectangle drawn from
 * the other corner has another); a spline's, a circle's or an ellipse's the
 * mean of 19 points at parameters k/19 of its range, k = 0…18; a region's
 * its first face's area centroid, the face swept first ({@link sweptFaces};
 * p306: 25,5 of two squares, where the region's is 15,5). A 3D polyline
 * takes the polyline's rule (**unverified**: not probed), as does a
 * spline-fit polyline, measured along its curve (**unverified**). Null for
 * what no sweep takes.
 */
export function profileBase(entity: Entity): Vec3 | null {
  if (entity.type === "region") {
    const axes = arbitraryAxis(entityNormal(entity))
    const face = entity.faces[0]
    const first = face?.loops[0]?.[0]
    if (!axes || !first) return null
    const about = curveStart(first)
    const m = planarMoments([face], about)
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

/**
 * Where REVOLVE's angle prompt opens LASTPOINT (sweeps/p119–p125, p151): the
 * profile's perimeter centroid, each curve's centroid weighed by its length,
 * projected on the axis through `origin` along the unit `direction`. p151's L
 * is 375/70 up the axis, where its area's centroid and EXTRUDE's base are
 * not. A region weighs every loop of its first face, the one swept first, as
 * EXTRUDE's base does (**unverified**: p332's two faces lie level, so either
 * rule gives its 0,5,0).
 */
export function revolveBase(
  profile: PlanarProfile,
  origin: Vec3,
  direction: Vec3
): Vec3 {
  let length = 0
  let x = 0
  let y = 0
  for (const face of profile.faces.slice(0, 1)) {
    for (const loop of face.loops) {
      for (const curve of loop) {
        const l = curveLength(curve)
        const c = curveCentroid(curve)
        length += l
        x += l * c.x
        y += l * c.y
      }
    }
  }
  const centroid = axesToWorld(profile.axes, {
    x: length === 0 ? 0 : x / length,
    y: length === 0 ? 0 : y / length,
    z: profile.elevation,
  })
  const along = dot3(sub3(centroid, origin), direction)
  return add3(origin, scale3(direction, along))
}

/** The solid a sweep made, keeping what made it: a revolution's axis made unit here only (p327). */
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
        ? { ...sweep, axis: unsigned0(normalize3(sweep.axis) ?? sweep.axis) }
        : sweep,
  }
}

/**
 * The sweep through a similarity: lengths scale, and a revolution's axis is
 * carried as the vector it is — turned, reflected and scaled with the solid,
 * never made unit again (sweeps/p311: ROTATE 30 gives -0.5, 0.866, MIRROR
 * about y = 40 then -0.5, -0.866, SCALE 2 -1, -1.7321; p333: kept across
 * x = 0, turned to X across y = x, SCALE 0.5 makes it 0.5 long). Its angles
 * are kept, as LIST shows them.
 */
export function sweepMapped(
  sweep: SolidSweep,
  direction: (d: Vec3) => Vec3,
  scale: number
): SolidSweep {
  switch (sweep.kind) {
    case "extrusion":
      return { ...sweep, height: sweep.height * scale }
    case "revolve":
      return {
        ...sweep,
        axis: unsigned0(scale3(direction(sweep.axis), scale)),
      }
  }
}
