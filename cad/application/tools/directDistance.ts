import { V } from "../../geometry/Vec2"
import { Vec3, withZOf } from "../../geometry/Vec3"
import type { ToolContext } from "./Tool"
import {
  directionFromUcsHeading,
  headingInUcs,
  headingOnCursorSide,
} from "./ucsHeading"

/** Below this a cursor is on the base point in plan, straight above or below it. */
const PLUMB = 1e-9

/** What was typed into the length and angle fields; `null` for a field left to the cursor. */
export interface TypedDistance {
  readonly distance: number | null
  readonly angle: number | null
}

/**
 * AutoCAD's direct distance entry: a typed length is "measured along the path
 * from the last point to the current location of the cursor". With the cursor
 * straight above or below `base` (on the `+Z` / `-Z` guide, or a point snapped
 * there) that path is the UCS's Z; otherwise it is the cursor's heading in the
 * plane, keeping the base's Z (`@dist<angle`). A typed angle always wins, and
 * lies in the plane, read on the cursor's side as the field shows it acute
 * (`headingOnCursorSide`). `null` when the cursor gives no direction.
 */
export function pointAlongCursor(
  ctx: Pick<ToolContext, "ucs">,
  base: Vec3,
  cursor: Vec3,
  typed: TypedDistance
): Vec3 | null {
  if (typed.angle === null) {
    const rise = riseAlongCursor(base, cursor, typed.distance)
    if (rise) return rise
  }
  const offset = V.sub(cursor, base)
  const planDistance = V.length(offset)
  const heading = planDistance > PLUMB ? headingInUcs(ctx.ucs, offset) : null
  const angle =
    typed.angle === null ? heading : headingOnCursorSide(typed.angle, heading)
  if (angle === null) return null
  return withZOf(
    V.add(
      base,
      V.scale(
        directionFromUcsHeading(ctx.ucs, angle),
        typed.distance ?? planDistance
      )
    ),
    base
  )
}

/**
 * The point `distance` up or down the UCS's Z from `base`, on the cursor's
 * side, when the cursor is straight above or below it (its own height for a
 * `null` distance); else `null`.
 */
export function riseAlongCursor(
  base: Vec3,
  cursor: Vec3,
  distance: number | null
): Vec3 | null {
  if (V.length(V.sub(cursor, base)) > PLUMB) return null
  const rise = cursor.z - base.z
  if (!(Math.abs(rise) > PLUMB)) return null
  return {
    x: base.x,
    y: base.y,
    z: base.z + Math.sign(rise) * (distance ?? Math.abs(rise)),
  }
}

/**
 * Feeds the length and angle fields while the cursor is on the Z guide: its
 * height above or below `base` and `+Z` / `-Z`, which is no angle a field can
 * hold. Returns false, setting nothing, anywhere else, where the tool shows
 * its heading as before.
 */
export function showRise(
  ctx: Pick<ToolContext, "dynamicInput" | "text">,
  base: Vec3,
  cursor: Vec3,
  lengthField = "distance",
  angleField = "angle"
): boolean {
  const rise = riseAlongCursor(base, cursor, null)
  if (!rise) return false
  ctx.dynamicInput.setLive(lengthField, Math.abs(rise.z - base.z))
  ctx.dynamicInput.setLiveText(
    angleField,
    ctx.text.feedback(rise.z > base.z ? "zPositive" : "zNegative")
  )
  return true
}
