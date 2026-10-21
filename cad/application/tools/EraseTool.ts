import { Entity } from "../../domain/entities"
import { RemoveEntitiesCommand } from "../commands/entityCommands"
import { SelectionActionTool } from "./SelectionActionTool"
import { ToolContext } from "./Tool"

/**
 * AutoCAD's ERASE: with objects already selected it erases them at once;
 * otherwise it asks for them, as the ribbon's Erase button does, and erases
 * the set on Enter. One undo step brings the whole set back. It says nothing
 * once the set closes (probes erase/p00, p01, p03); the catalog keeps its
 * `erased`, unused, as removing a key is a major version.
 */
export class EraseTool extends SelectionActionTool {
  readonly id = "erase"
  readonly shortcut = "e"
  protected readonly fadesSet = true

  protected run(entities: readonly Entity[], ctx: ToolContext): void {
    ctx.execute(new RemoveEntitiesCommand(entities.map((entity) => entity.id)))
    ctx.selection.clear()
  }
}
