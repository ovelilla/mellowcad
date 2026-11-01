import { Vec3, scale3 } from "../geometry/Vec3"
import { arbitraryAxis } from "../geometry/ocs"
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
