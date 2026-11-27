import { Entity } from "../../domain/entities"
import { SubobjectRef } from "../../domain/solidSubobjects"
import { solidsErasedBySubobjects } from "../../domain/solidSubobjectEdits"
import {
  RemoveEntitiesCommand,
  UpdateEntitiesCommand,
} from "../commands/entityCommands"
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

  protected takesParts(): boolean {
    return true
  }

  /**
   * A solid's face, edge or vertex erased leaves the solid as it is but for
   * what made it: `1 found`, the box still 1000 and no longer a Box in its
   * LIST (solid-edits/p241, p264).
   */
  protected run(
    entities: readonly Entity[],
    ctx: ToolContext,
    parts: readonly SubobjectRef[] = []
  ): void {
    if (entities.length > 0) {
      ctx.execute(
        new RemoveEntitiesCommand(entities.map((entity) => entity.id))
      )
    }
    const unmade = solidsErasedBySubobjects(parts, (id) => ctx.document.get(id))
    if (unmade.length > 0) ctx.execute(new UpdateEntitiesCommand(unmade))
    ctx.selection.clear()
  }
}
