import { Vec3 } from "../../geometry/Vec3"
import { parseNumber } from "../../domain/units"
import {
  isCoordinateExpression,
  parseCoordinate,
} from "../input/coordinateInput"
import { ToolContext } from "./Tool"

/**
 * A point typed where a command picks objects (`Select objects:`, FILLET's
 * and CHAMFER's object prompts, TRIM's and EXTEND's), which AutoCAD 2027's
 * console takes as a pick there: read as a first point is — `@` from
 * LASTPOINT, a polar point, `*` in the WCS, a number its direct distance
 * from LASTPOINT towards the cursor —, and then LASTPOINT itself, hit or
 * miss (probes trim/p240–p248, offset/p240, p241, p297, p298). Null for
 * what is no point, which the prompt refuses.
 */
export function typedPick(text: string, ctx: ToolContext): Vec3 | null {
  const distance = isCoordinateExpression(text) ? null : parseNumber(text)
  const point =
    distance !== null
      ? ctx.pointAtDistance(distance)
      : isCoordinateExpression(text)
        ? parseCoordinate(text, {
            lastPoint: ctx.lastPoint,
            relativeByDefault: false,
            ucs: ctx.ucs,
            elevation: ctx.elevation,
          })
        : null
  if (point) ctx.setLastPoint(point)
  return point
}
