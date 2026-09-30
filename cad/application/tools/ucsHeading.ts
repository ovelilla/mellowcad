import { Vec2 } from "../../geometry/Vec2"
import { normalizeDegrees } from "../../geometry/primitives"
import { Ucs, ucsDirectionToWorld, worldDirectionToUcs } from "../../domain/ucs"

/**
 * The heading a dynamic-input angle field shows for a world direction: degrees
 * CCW from the UCS X axis, in `[0, 360)`. Only for absolute angles — a
 * rotation or an included angle is the same in every UCS.
 */
export function headingInUcs(ucs: Ucs, direction: Vec2): number {
  const local = worldDirectionToUcs(ucs, direction)
  return normalizeDegrees((Math.atan2(local.y, local.x) * 180) / Math.PI)
}

/** The world unit direction of a heading typed in degrees from the UCS X axis. */
export function directionFromUcsHeading(ucs: Ucs, degrees: number): Vec2 {
  const rad = (degrees * Math.PI) / 180
  return ucsDirectionToWorld(ucs, { x: Math.cos(rad), y: Math.sin(rad) })
}
