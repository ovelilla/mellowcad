import { Vec3 } from "../../geometry/Vec3"
import {
  isCoordinateExpression,
  parseCoordinate,
} from "../input/coordinateInput"
import { ToolContext } from "./Tool"

/**
 * A point typed where a command picks an object (FILLET's and CHAMFER's
 * object prompts, TRIM's and EXTEND's), which AutoCAD 2023's console takes
 * as a pick there: read as a first point is, `@` from LASTPOINT, which it
 * then becomes. Null for what is no coordinate, which the prompt refuses.
 */
export function typedPick(text: string, ctx: ToolContext): Vec3 | null {
  if (!isCoordinateExpression(text)) return null
  const point = parseCoordinate(text, {
    lastPoint: ctx.lastPoint,
    relativeByDefault: false,
    ucs: ctx.ucs,
    elevation: ctx.elevation,
  })
  if (point) ctx.setLastPoint(point)
  return point
}
