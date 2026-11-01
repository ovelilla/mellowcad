import { Vec2 } from "../../geometry/Vec2"
import { Entity, entityDrawOrder } from "../../domain/entities"
import { screenDistanceToEntity } from "../viewPick"
import { ToolContext } from "./Tool"

/**
 * Whether an object on a locked layer is under the pick box at `screen`,
 * which `ctx.pick` passes over: AutoCAD's pick finds it to refuse it, in
 * each command's words (probes offset/p250, trim/p251, corners/p270). Given
 * `over`, what `ctx.pick` took there, only a locked object a pick would take
 * before it counts: a single object's pick tests the newest object under the
 * box, locked or not (pieces/p105, p124).
 */
export function lockedObjectAt(
  screen: Vec2,
  ctx: ToolContext,
  over: Entity | null = null
): boolean {
  const { document, viewport } = ctx
  const pixels = viewport.worldToScreenDistance(ctx.pickTolerance())
  const entities = document.getEntities()
  const below = over ? entities.findIndex((e) => e.id === over.id) : -1
  return entities.some(
    (entity, i) =>
      document.getLayer(entity.layerId)?.locked === true &&
      document.isEntityVisible(entity) &&
      (over === null ||
        (entityDrawOrder(entity) - entityDrawOrder(over) || i - below) > 0) &&
      screenDistanceToEntity(
        viewport,
        entity,
        screen,
        ctx.blocks,
        document.getSettings().isolines
      ) <= pixels
  )
}
