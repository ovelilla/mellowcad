import { Vec2 } from "../../geometry/Vec2"
import { Vec3, add3, planar, scale3, sub3 } from "../../geometry/Vec3"
import { arbitraryAxis, worldToAxes } from "../../geometry/ocs"
import { closestPointOnInfiniteLine } from "../../geometry/primitives"
import {
  Entity,
  LineEntity,
  coplanar,
  entityFromOcs,
  entityInOcs,
  lineEndZ,
  lineStartZ,
  linesPlaneNormal,
} from "../../domain/entities"
import { CameraTransform } from "../../scene/types"

/** Where a line was picked: the cursor on the work plane and on the screen. */
export interface LinePick {
  readonly world: Vec2
  readonly screen: Vec2
}

/**
 * Two lines as FILLET and CHAMFER work on them: in a plane read level. That
 * is their own when they share a level one, and otherwise the OCS of the
 * tilted plane they share, where AutoCAD rounds or bevels them too; `back`
 * returns what is built there to the frame the lines came from.
 */
export interface LineCorner {
  readonly line1: LineEntity
  readonly pick1: Vec2
  readonly line2: LineEntity
  readonly pick2: Vec2
  back(entity: Entity): Entity
}

/** The corner two lines make, or `null` when they share no plane. */
export function lineCorner(
  line1: LineEntity,
  pick1: LinePick,
  line2: LineEntity,
  pick2: LinePick,
  view: CameraTransform
): LineCorner | null {
  if (coplanar(line1, line2)) {
    return {
      line1,
      pick1: pick1.world,
      line2,
      pick2: pick2.world,
      back: (entity) => entity,
    }
  }
  const normal = linesPlaneNormal(line1, line2)
  const axes = normal && arbitraryAxis(normal)
  if (!normal || !axes) return null
  const inPlane = (line: LineEntity, pick: LinePick) =>
    planar(worldToAxes(axes, alongOnScreen(line, pick.screen, view)))
  return {
    line1: entityInOcs(line1, normal) as LineEntity,
    pick1: inPlane(line1, pick1),
    line2: entityInOcs(line2, normal) as LineEntity,
    pick2: inPlane(line2, pick2),
    back: (entity) => entityFromOcs(entity, normal),
  }
}

/** The point of `line` drawn nearest `screen`: a pick along it, with its Z. */
export function alongOnScreen(
  line: LineEntity,
  screen: Vec2,
  view: CameraTransform
): Vec3 {
  const start: Vec3 = { ...line.start, z: lineStartZ(line) }
  const end: Vec3 = { ...line.end, z: lineEndZ(line) }
  const { t } = closestPointOnInfiniteLine(
    view.worldToScreen(start),
    view.worldToScreen(end),
    screen
  )
  return add3(start, scale3(sub3(end, start), Number.isFinite(t) ? t : 0))
}
