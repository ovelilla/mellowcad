import { Ray } from "../../geometry/primitives"
import { ucsDirectionToWorld } from "../../domain/ucs"
import { DrawingAidState, TrackingGuide, TrackingPoint } from "./types"

/**
 * Pure helpers for object snap tracking: which guides an acquired point offers
 * under the current drawing aids. Intersection/projection math lives in the
 * geometry kernel.
 */

/** The alignment guides a single acquired point offers under the given aids. */
export function guidesFor(
  point: TrackingPoint,
  aids: DrawingAidState
): TrackingGuide[] {
  // Polar tracking widens the set of angles; otherwise OTRACK aligns
  // horizontally/vertically like Ortho.
  const step = aids.polar && aids.polarAngleStep > 0 ? aids.polarAngleStep : 90
  const guides: TrackingGuide[] = []
  // Guides are infinite lines, so half a turn covers every distinct axis.
  for (let deg = 0; deg < 180; deg += step) {
    const angle = (deg * Math.PI) / 180
    const dir = ucsDirectionToWorld(aids.ucs, {
      x: Math.cos(angle),
      y: Math.sin(angle),
    })
    const kind: TrackingGuide["kind"] =
      deg % 180 === 0 ? "horizontal" : deg === 90 ? "vertical" : "polar"
    guides.push({ point, dir, angle, kind })
  }
  return guides
}

/** Turns a guide into its infinite ray. */
export function guideRay(guide: TrackingGuide): Ray {
  return { origin: guide.point.origin, dir: guide.dir }
}
