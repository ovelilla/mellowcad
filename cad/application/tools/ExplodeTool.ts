import {
  Entity,
  EntityId,
  carryOverrides,
  copyEntity,
  createArc,
  createLine,
  insertGeometry,
  mtextLineTexts,
  polylineSegmentGeometries,
} from "../../domain/entities"
import { ReplaceEntitiesCommand } from "../commands/entityCommands"
import { SelectionActionTool } from "./SelectionActionTool"
import { ToolContext } from "./Tool"

/**
 * AutoCAD's EXPLODE. A polyline is replaced by an independent object per
 * segment — a line for a straight one, an arc for a bulged one (the closing
 * segment included when closed). A block reference is replaced by copies of the
 * objects that compose the block, removing **one grouping level at a time**: a
 * nested block comes back as a nested block, to be exploded again, and the
 * objects "revert to their original properties" rather than keeping the ones
 * the reference lent them. A multiline text becomes one single-line text per
 * line as drawn ("Multiline Text — Explodes into text objects").
 *
 * Everything else is left untouched and reported, and one undo step reverts the
 * whole explode.
 */
export class ExplodeTool extends SelectionActionTool {
  readonly id = "explode"
  readonly shortcut = "x"

  protected run(entities: readonly Entity[], ctx: ToolContext): void {
    const composite = entities.filter(
      (e) => e.type === "polyline" || e.type === "insert" || e.type === "mtext"
    )
    // AutoCAD accepts any object at the prompt and then says what it could not
    // do, rather than silently ignoring the picks.
    const rejected = entities.length - composite.length
    if (rejected > 0) {
      ctx.report(ctx.text.message("explodeRejected", { count: rejected }))
    }
    if (composite.length === 0) return

    const removedIds: EntityId[] = []
    const pieces: Entity[] = []
    for (const entity of composite) {
      if (entity.type === "insert") {
        // The objects "revert to their original properties", so the layer a
        // layer-0 object was merely *displayed* on does not come with it.
        const parts = insertGeometry(entity, ctx.blocks(entity.blockId), {
          inheritLayer: false,
        })
        if (parts.length === 0) continue
        removedIds.push(entity.id)
        // The definition's objects keep their ids inside the block, so each
        // piece is copied to mint one of its own.
        for (const part of parts) pieces.push(copyEntity(part, { x: 0, y: 0 }))
        continue
      }
      if (entity.type === "mtext") {
        removedIds.push(entity.id)
        for (const line of mtextLineTexts(entity)) {
          pieces.push(carryOverrides(entity, line))
        }
        continue
      }
      if (entity.type !== "polyline") continue
      removedIds.push(entity.id)
      for (const seg of polylineSegmentGeometries(entity)) {
        if (seg.kind === "line") {
          pieces.push(createLine(seg.a, seg.b, entity.layerId))
        } else {
          pieces.push(
            createArc(
              seg.center,
              seg.radius,
              seg.startAngle,
              seg.endAngle,
              entity.layerId
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
