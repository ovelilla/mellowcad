import { Vec3 } from "../../geometry/Vec3"
import { Entity, translateEntity } from "../../domain/entities"
import { UpdateEntitiesCommand } from "../commands/entityCommands"
import { ToolContext } from "./Tool"
import { PlacementTool, isZeroDisplacement } from "./PlacementTool"

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
    delta: Vec3,
    ctx: ToolContext
  ): void {
    // A move by nothing changes nothing; its run is still the step U names
    // (move/p195, p231).
    if (isZeroDisplacement(delta)) return
    ctx.execute(
      new UpdateEntitiesCommand(
        originals.map((entity) => translateEntity(entity, delta))
      )
    )
  }
}
