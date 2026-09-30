import { ThickEntity, withThickness } from "../../domain/entities"
import { ToolContext } from "./Tool"

/** THICKNESS as LINE, CIRCLE, ARC, PLINE and POLYGON give it; RECTANG and TEXT do not. */
export function withCurrentThickness<T extends ThickEntity>(
  entity: T,
  ctx: ToolContext
): T {
  return withThickness(entity, ctx.document.getSettings().thickness)
}
