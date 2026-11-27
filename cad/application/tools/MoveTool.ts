import { Vec3 } from "../../geometry/Vec3"
import { Entity, translateEntity } from "../../domain/entities"
import { UpdateEntitiesCommand } from "../commands/entityCommands"
import { ToolContext } from "./Tool"
import { PlacementTool, isZeroDisplacement } from "./PlacementTool"
import { reshapedOwners, sayUnreshaped } from "./subobjectSet"

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
    // A solid's faces, edges and vertices move with the faces round them
    // carried on to meet them (solid-edits/p244, p245, p262).
    const { changed, failed } = reshapedOwners(
      ctx,
      this.subobjectsOf(originals, ctx),
      (p) => ({ x: p.x + delta.x, y: p.y + delta.y, z: p.z + delta.z })
    )
    sayUnreshaped(failed, ctx)
    ctx.execute(
      new UpdateEntitiesCommand([
        ...originals.map((entity) => translateEntity(entity, delta)),
        ...changed,
      ])
    )
  }
}
