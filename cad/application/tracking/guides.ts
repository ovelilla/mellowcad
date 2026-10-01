import { Ray } from "../../geometry/primitives"
import { WORLD_Z, withZ } from "../../geometry/Vec3"
import { ucsDirectionToWorld } from "../../domain/ucs"
import { DrawingAidState, TrackingGuide, TrackingPoint } from "./types"

/**
 * Pure helpers for object snap tracking: which guides an acquired point offers
 * under the current drawing aids. Intersection/projection math lives in the
 * geometry kernel.
 */

/**
 * The alignment guides a single acquired point offers under the given aids.
 * `alongZ` adds the UCS's Z through it, which a 3D view offers.
 */
export function guidesFor(
  point: TrackingPoint,
  aids: DrawingAidState,
  alongZ = false
): TrackingGuide[] {
  // Polar tracking widens the set of angles; otherwise OTRACK aligns
  // horizontally/vertically like Ortho.
  const step = aids.polar && aids.polarAngleStep > 0 ? aids.polarAngleStep : 90
  const guides: TrackingGuide[] = []
  // Guides are infinite lines, so half a turn covers every distinct axis.
  for (let deg = 0; deg < 180; deg += step) {
    const angle = (deg * Math.PI) / 180
    const dir = withZ(
      ucsDirectionToWorld(aids.ucs, {
        x: Math.cos(angle),
        y: Math.sin(angle),
      }),
      0
    )
    const kind: TrackingGuide["kind"] =
      deg % 180 === 0 ? "horizontal" : deg === 90 ? "vertical" : "polar"
    guides.push({ point, dir, angle, kind })
  }
  if (alongZ) {
    guides.push({ point, dir: WORLD_Z, angle: Math.PI / 2, kind: "z" })
  }
  return guides
}

/** Turns a guide of the plane into its infinite ray there. */
export function guideRay(guide: TrackingGuide): Ray {
  return { origin: guide.point.origin, dir: guide.dir }
}
