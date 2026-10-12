import { Vec3 } from "../geometry/Vec3"
import { ScenePrimitive } from "../scene/types"
import { THEME } from "../scene/theme"
import { DynamicField, DynamicInputSession } from "./input/DynamicInput"
import { measuresFromPoints } from "./promptRefusal"
import type { QuestionInput, Tool } from "./tools/Tool"
import { Viewport } from "./Viewport"

/**
 * The box's field a point answers as its value: a lone distance or angle,
 * which AutoCAD's distance and angle input measure from points, or a number
 * the question measures so (SCALE's factor). Null for anything else.
 */
export function measuredField(
  session: DynamicInputSession,
  input: QuestionInput | null
): DynamicField | null {
  if (session.fields.length !== 1) return null
  const [field] = session.fields
  if (
    field.kind === "distance" ||
    field.kind === "length" ||
    field.kind === "angle"
  ) {
    return field
  }
  return field.kind === "number" && measuresFromPoints(input) ? field : null
}

/**
 * What two points measure for `field`: the distance between them, in space as
 * AutoCAD's is (a diameter to `100,0,5` from the origin is 100.125), or the
 * angle of the line from the first, in the plane, 0 to 360.
 */
export function measuredValue(
  field: DynamicField,
  from: Vec3,
  to: Vec3
): number {
  const dx = to.x - from.x
  const dy = to.y - from.y
  if (field.kind !== "angle") return Math.hypot(dx, dy, to.z - from.z)
  const degrees = (Math.atan2(dy, dx) * 180) / Math.PI
  return degrees < 0 ? degrees + 360 : degrees
}

/**
 * The question the running command asks while the second of two points is
 * measured: AutoCAD's ` Specify second point:`, under the command's name,
 * with no keywords listed.
 */
export function secondPointQuestion(tool: Tool): Tool {
  return {
    id: tool.id,
    runningCommand: tool.runningCommand && (() => tool.runningCommand!()),
    systemVariable: tool.systemVariable && (() => tool.systemVariable!()),
    question: () => "secondPointOfDistance",
  }
}

/** The rubber band from the first point to the cursor. */
export function measureOverlay(
  viewport: Viewport,
  from: Vec3,
  to: Vec3
): ScenePrimitive[] {
  return [
    {
      kind: "segment",
      a: viewport.worldToScreen(from),
      b: viewport.worldToScreen(to),
      stroke: { color: THEME.rubberBand, width: 1 },
    },
  ]
}
