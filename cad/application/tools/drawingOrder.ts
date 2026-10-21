import { Entity } from "../../domain/entities"
import { ToolContext } from "./Tool"

/**
 * The set as the drawing orders it, whatever order it was picked in: COPY,
 * SCALE Copy, MIRROR and their kin append their copies so, and ERASE Last
 * takes the last one's (move/p201, p212, p223; transforms/p139, p213, p284).
 */
export function selectedInDrawingOrder(
  ctx: Pick<ToolContext, "selection" | "document">
): Entity[] {
  const ids = new Set(ctx.selection.toArray())
  return ctx.document.getEntities().filter((entity) => ids.has(entity.id))
}
