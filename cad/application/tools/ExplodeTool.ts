import {
  Entity,
  EntityId,
  carryOverrides,
  copyEntity,
  createArc,
  createLine,
  insertGeometry,
  isWidePolyline,
  mtextLineTexts,
  polylineSegmentGeometries,
} from "../../domain/entities"
import { ReplaceEntitiesCommand } from "../commands/entityCommands"
import type { MessageId } from "../EngineText"
import type { ObjectSelectorOptions } from "./objectSelection"
import { SelectionActionTool } from "./SelectionActionTool"
import { QuestionInput, ToolContext } from "./Tool"

/** What EXPLODE breaks up. */
const EXPLODED: ReadonlySet<Entity["type"]> = new Set([
  "polyline",
  "insert",
  "mtext",
])

/**
 * AutoCAD's EXPLODE. A polyline is replaced by an independent object per
 * segment — a line for a straight one, an arc for a bulged one (the closing
 * segment included when closed). A block reference is replaced by copies of the
 * objects that compose the block, removing **one grouping level at a time**: a
 * nested block comes back as a nested block, to be exploded again, and the
 * objects "revert to their original properties" rather than keeping the ones
 * the reference lent them. A multiline text becomes one single-line text per
 * line as drawn ("Multiline Text — Explodes into text objects"). A polyline's
 * widths are lost, its pieces following its centreline, and AutoCAD says so
 * for each wide one.
 *
 * Everything else is refused as `Select objects:` finds it, said under each
 * count (`1 was not able to be exploded.`, erase/p213–p219), and one undo
 * step reverts the whole explode.
 */
export class ExplodeTool extends SelectionActionTool {
  readonly id = "explode"
  readonly shortcut = "x"

  protected selectionInput(): QuestionInput {
    return "wholeObjects"
  }

  // WHY a spline passes: it is refused by name once the set is closed, each
  // one (spline/p319, p324).
  protected refusal(): ObjectSelectorOptions["refuse"] {
    return {
      rejects: (entity) =>
        !EXPLODED.has(entity.type) && entity.type !== "spline",
      message: "explodeRejected",
    }
  }

  protected noneFound(): MessageId {
    return "noneFound"
  }

  protected run(entities: readonly Entity[], ctx: ToolContext): void {
    const composite = entities.filter((e) => EXPLODED.has(e.type))
    for (const entity of entities) {
      if (entity.type === "spline") {
        ctx.report(ctx.text.message("explodeCannot", { name: "SPLINE" }))
      }
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
      if (isWidePolyline(entity)) {
        ctx.report(ctx.text.message("explodeLostWidth"))
      }
      for (const seg of polylineSegmentGeometries(entity)) {
        const piece =
          seg.kind === "line"
            ? createLine(seg.a, seg.b, entity.layerId)
            : createArc(
                seg.center,
                seg.radius,
                seg.startAngle,
                seg.endAngle,
                entity.layerId
              )
        pieces.push(carryOverrides(entity, piece))
      }
    }
    if (pieces.length === 0) return

    ctx.execute(new ReplaceEntitiesCommand(removedIds, pieces))
    // WHY the pieces as Previous, none selected: `ERASE _P` after it finds
    // them (erase/p236, p258).
    ctx.rememberSelection(pieces.map((piece) => piece.id))
  }
}
