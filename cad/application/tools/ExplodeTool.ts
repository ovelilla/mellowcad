import {
  Entity,
  EntityId,
  carryOverrides,
  copyEntity,
  createArc,
  createLine,
  hatchGeometry,
  insertGeometry,
  isWidePolyline,
  mtextLineTexts,
  nextEntityId,
  polylineSegmentGeometries,
  polyline3dSegments,
  polylineCurve,
} from "../../domain/entities"
import {
  hatchPatternLines,
  isSolidHatchPattern,
} from "../../domain/hatchPatterns"
import { DEFAULT_LINETYPE_ID } from "../../domain/linetypes"
import { createRegion, regionEdgeEntity } from "../../domain/regions"
import { solidFaceRegions, solidHasCurvedFaces } from "../../domain/solids"
import { ReplaceEntitiesCommand } from "../commands/entityCommands"
import type { MessageId } from "../EngineText"
import type { ObjectSelectorOptions } from "./objectSelection"
import { SelectionActionTool } from "./SelectionActionTool"
import { QuestionInput, ToolContext } from "./Tool"

/** What EXPLODE breaks up. */
const EXPLODED: ReadonlySet<Entity["type"]> = new Set([
  "polyline",
  "polyline3d",
  "insert",
  "mtext",
  "hatch",
  "region",
  "solid3d",
])

/**
 * The name EXPLODE gives an object it passes at `Select objects:` and then
 * cannot explode, said once the set is closed, or `null`.
 */
function cannotExplode(entity: Entity): string | null {
  switch (entity.type) {
    case "spline":
      return "SPLINE"
    case "ellipse":
      return "ELLIPSE"
    case "hatch":
      // WHY a pattern this build does not ship is named too: its lines cannot
      // be made, and keeping the hatch beats erasing it.
      return isSolidHatchPattern(entity.patternId) ||
        hatchPatternLines(entity.patternId).length === 0
        ? "HATCH"
        : null
    default:
      return null
  }
}

/**
 * AutoCAD's EXPLODE. A polyline is replaced by an independent object per
 * segment — a line for a straight one, an arc for a bulged one (the closing
 * segment included when closed); a 3D polyline a line per segment, each at
 * its vertices' Z. A block reference is replaced by copies of the
 * objects that compose the block, removing **one grouping level at a time**: a
 * nested block comes back as a nested block, to be exploded again, and the
 * objects "revert to their original properties" rather than keeping the ones
 * the reference lent them. A multiline text becomes one Left single-line text
 * per line as drawn. A pattern hatch becomes its pattern's lines clipped to
 * its boundary. A region of one face becomes its edges, lines, arcs, circles,
 * ellipses and splines; one of several faces a region per face
 * (region/p09, b02, b04); a 3D solid a region of each face, facing out
 * (solid/p09). A polyline's widths are lost, its pieces following its
 * centreline, and AutoCAD says so for each wide one.
 *
 * A spline, an ellipse and a solid hatch pass the count and are named once the
 * set is closed (`Cannot explode ELLIPSE`); everything else is refused as
 * `Select objects:` finds it, said under each count (`1 was not able to be
 * exploded.`, erase/p213–p219; pieces/p261). One undo step reverts the whole
 * explode.
 */
export class ExplodeTool extends SelectionActionTool {
  readonly id = "explode"
  readonly shortcut = "x"

  protected selectionInput(): QuestionInput {
    return "wholeObjects"
  }

  // WHY a spline and an ellipse pass: they are refused by name once the set
  // is closed, each one (spline/p319, p324; pieces/p261, p265). WHY a
  // dimension is refused, though AutoCAD 2027 explodes it into lines, SOLIDs
  // for its arrowheads and an MTEXT (pieces/p258): there is no SOLID object
  // here to make them.
  // WHY a solid with a curved face is refused, though AutoCAD 2027 explodes
  // it into regions and a SURFACE of each curved face (solid/c11, k06):
  // there is no surface object here to make them.
  protected refusal(): ObjectSelectorOptions["refuse"] {
    return {
      rejects: (entity) =>
        (!EXPLODED.has(entity.type) &&
          entity.type !== "spline" &&
          entity.type !== "ellipse") ||
        (entity.type === "solid3d" && solidHasCurvedFaces(entity)),
      message: "explodeRejected",
    }
  }

  protected noneFound(): MessageId {
    return "noneFound"
  }

  protected run(entities: readonly Entity[], ctx: ToolContext): void {
    for (const entity of entities) {
      const name = cannotExplode(entity)
      if (name) ctx.report(ctx.text.message("explodeCannot", { name }))
    }
    const composite = entities.filter(
      (e) => EXPLODED.has(e.type) && cannotExplode(e) === null
    )
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
      if (entity.type === "hatch") {
        const { lines } = hatchGeometry(entity)
        if (lines.length === 0) continue
        removedIds.push(entity.id)
        for (const [a, b] of lines) {
          // WHY Continuous set on each, whatever the hatch's: AutoCAD's
          // pattern lines carry it (pieces/p259, p263).
          pieces.push({
            ...carryOverrides(entity, createLine(a, b, entity.layerId)),
            linetype: DEFAULT_LINETYPE_ID,
          })
        }
        continue
      }
      if (entity.type === "mtext") {
        removedIds.push(entity.id)
        for (const line of mtextLineTexts(entity)) {
          pieces.push(carryOverrides(entity, line))
        }
        continue
      }
      if (entity.type === "region") {
        removedIds.push(entity.id)
        if (entity.faces.length > 1) {
          for (const face of entity.faces) {
            pieces.push(
              carryOverrides(entity, createRegion([face], entity.layerId))
            )
          }
          continue
        }
        for (const loop of entity.faces[0]?.loops ?? []) {
          for (const edge of loop) {
            pieces.push(regionEdgeEntity(entity, edge, nextEntityId()))
          }
        }
        continue
      }
      if (entity.type === "solid3d") {
        // A region of each face (solid/p09).
        removedIds.push(entity.id)
        pieces.push(...solidFaceRegions(entity))
        continue
      }
      if (entity.type === "polyline3d") {
        // A line per segment, each end at its vertex's Z (3dpoly/p11).
        const segments = polyline3dSegments(entity)
        if (segments.length === 0) continue
        removedIds.push(entity.id)
        for (const [a, b] of segments) {
          pieces.push(carryOverrides(entity, createLine(a, b, entity.layerId)))
        }
        continue
      }
      if (entity.type !== "polyline") continue
      removedIds.push(entity.id)
      // A fitted one goes into the lines and arcs of its curve (pedit/p173, p174).
      if (isWidePolyline(polylineCurve(entity))) {
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
