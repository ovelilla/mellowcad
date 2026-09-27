import { Vec2 } from "../../geometry/Vec2"
import { Entity, translateEntity } from "../../domain/entities"
import { UpdateEntitiesCommand } from "../commands/entityCommands"
import { ToolContext } from "./Tool"
import { PlacementTool } from "./PlacementTool"

/**
 * AutoCAD's MOVE command: translate the selected objects once by a base →
 * second-point displacement, then end. The originals themselves move (as a
 * single undoable {@link UpdateEntitiesCommand}); see {@link PlacementTool} for
 * the shared select → base → destination flow.
 */
export class MoveTool extends PlacementTool {
  readonly id = "move"
  readonly shortcut = "m"

  protected continuesAfterPlace(): boolean {
    return false
  }

  protected place(
    originals: readonly Entity[],
    delta: Vec2,
    ctx: ToolContext
  ): void {
    ctx.execute(
      new UpdateEntitiesCommand(
        originals.map((entity) => translateEntity(entity, delta))
      )
    )
  }
}
