import { Entity } from "../../domain/entities"
import { RemoveEntitiesCommand } from "../commands/entityCommands"
import { SelectionActionTool } from "./SelectionActionTool"
import { ToolContext } from "./Tool"

/**
 * AutoCAD's ERASE: with objects already selected it erases them at once;
 * otherwise it asks for them, as the ribbon's Erase button does, and erases
 * the set on Enter. One undo step brings the whole set back.
 */
export class EraseTool extends SelectionActionTool {
  readonly id = "erase"
  readonly shortcut = "e"

  protected run(entities: readonly Entity[], ctx: ToolContext): void {
    ctx.execute(new RemoveEntitiesCommand(entities.map((entity) => entity.id)))
    ctx.selection.clear()
    ctx.report(ctx.text.message("erased", { count: entities.length }))
  }
}
