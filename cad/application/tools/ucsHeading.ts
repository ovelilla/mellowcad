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

/**
 * A heading as the dynamic-input angle field shows it while a direction is
 * being given: "dimension input displays only acute angles: all angles are
 * displayed as 180 degrees or less", the cursor's side telling the rest.
 */
export function acuteHeading(heading: number): number {
  const degrees = normalizeDegrees(heading)
  return degrees > 180 ? 360 - degrees : degrees
}

/**
 * The heading an angle typed into that field gives: "Angles specified when
 * creating new objects rely on the cursor location to determine the positive
 * angle direction", so with the cursor below the X axis it is measured
 * clockwise. `cursorHeading` is the cursor's own, `null` when it gives none.
 */
export function headingOnCursorSide(
  typed: number,
  cursorHeading: number | null
): number {
  const below = cursorHeading !== null && normalizeDegrees(cursorHeading) > 180
  return below ? 360 - typed : typed
}
