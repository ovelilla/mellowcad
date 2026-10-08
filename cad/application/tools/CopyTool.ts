import { Vec3 } from "../../geometry/Vec3"
import { Entity, copyEntity } from "../../domain/entities"
import { AddEntitiesCommand } from "../commands/entityCommands"
import { ToolContext } from "./Tool"
import { PlacementTool } from "./PlacementTool"
import type { PromptId } from "../../locales/types"

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

  protected continuesAfterPlace(): boolean {
    return true
  }

  protected secondPointQuestion(): PromptId {
    return "copySecondPointOr"
  }

  /** COPYMODE is always Multiple here: there is no mOde to change it. */
  protected announceBasePoint(ctx: ToolContext): void {
    ctx.report(ctx.text.message("copyModeMultiple"))
  }

  protected place(
    originals: readonly Entity[],
    delta: Vec3,
    ctx: ToolContext
  ): void {
    ctx.execute(
      new AddEntitiesCommand(
        originals.map((entity) => copyEntity(entity, delta))
      )
    )
  }
}
