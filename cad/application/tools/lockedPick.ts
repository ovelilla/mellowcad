import { Vec2 } from "../../geometry/Vec2"
import { screenDistanceToEntity } from "../viewPick"
import { ToolContext } from "./Tool"

/**
 * Whether an object on a locked layer is under the pick box at `screen`,
 * which `ctx.pick` passes over: AutoCAD's pick finds it to refuse it, in
 * each command's words (probes offset/p250, trim/p251, corners/p270).
 */
export function lockedObjectAt(screen: Vec2, ctx: ToolContext): boolean {
  const { document, viewport } = ctx
  const pixels = viewport.worldToScreenDistance(ctx.pickTolerance())
  return document
    .getEntities()
    .some(
      (entity) =>
        document.getLayer(entity.layerId)?.locked === true &&
        document.isEntityVisible(entity) &&
        screenDistanceToEntity(viewport, entity, screen, ctx.blocks) <= pixels
    )
}
