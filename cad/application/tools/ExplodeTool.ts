import {
  Entity,
  EntityId,
  createArc,
  createLine,
  polylineSegmentGeometries,
} from "../../domain/entities"
import { ReplaceEntitiesCommand } from "../commands/entityCommands"
import { SelectionActionTool } from "./SelectionActionTool"
import { ToolContext } from "./Tool"

/**
 * AutoCAD's EXPLODE for polylines: each selected polyline is replaced by an
 * independent object per segment — a line for a straight segment, an arc for a
 * bulged one (the closing segment included when closed). Only polylines are
 * composite here, so other entity types are left untouched. One undo step
 * reverts the whole explode.
 */
export class ExplodeTool extends SelectionActionTool {
  readonly id = "explode"
  readonly label = "Explode"
  readonly shortcut = "x"

  protected run(entities: readonly Entity[], ctx: ToolContext): void {
    const polylines = entities.filter((e) => e.type === "polyline")
    // AutoCAD accepts any object at the prompt and then says what it could not
    // do, rather than silently ignoring the picks.
    const rejected = entities.length - polylines.length
    if (rejected > 0) {
      ctx.report(
        rejected === 1
          ? "1 was not able to be exploded."
          : `${rejected} were not able to be exploded.`
      )
    }
    if (polylines.length === 0) return

    const removedIds: EntityId[] = []
    const pieces: Entity[] = []
    for (const poly of polylines) {
      if (poly.type !== "polyline") continue
      removedIds.push(poly.id)
      for (const seg of polylineSegmentGeometries(poly)) {
        if (seg.kind === "line") {
          pieces.push(createLine(seg.a, seg.b, poly.layerId))
        } else {
          pieces.push(
            createArc(
              seg.center,
              seg.radius,
              seg.startAngle,
              seg.endAngle,
              poly.layerId
            )
          )
        }
      }
    }
    if (pieces.length === 0) return

    ctx.execute(new ReplaceEntitiesCommand(removedIds, pieces))
    // Leave the resulting segments selected, so grips/edits can follow.
    ctx.selection.set(pieces.map((piece) => piece.id))
  }
}
