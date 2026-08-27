import { Vec2 } from "../../geometry/Vec2"
import { Entity, copyEntity } from "../../domain/entities"
import { AddEntitiesCommand } from "../commands/entityCommands"
import { ToolContext } from "./Tool"
import { PlacementTool } from "./PlacementTool"

/**
 * AutoCAD's COPY command: duplicate the selected objects at a base →
 * second-point displacement, keeping the originals. It runs in AutoCAD's
 * default Multiple mode — the base point stays fixed and each destination drops
 * another copy — until Escape or an empty Enter. Each drop is a fresh set of
 * entities added as one undoable {@link AddEntitiesCommand}; see
 * {@link PlacementTool} for the shared select → base → destination flow.
 */
export class CopyTool extends PlacementTool {
  readonly id = "copy"
  readonly label = "Copy"

  protected continuesAfterPlace(): boolean {
    return true
  }

  protected place(
    originals: readonly Entity[],
    delta: Vec2,
    ctx: ToolContext
  ): void {
    ctx.execute(
      new AddEntitiesCommand(
        originals.map((entity) => copyEntity(entity, delta))
      )
    )
  }
}
