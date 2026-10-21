import { Vec2 } from "../../geometry/Vec2"
import { Vec3 } from "../../geometry/Vec3"
import {
  Entity,
  EntityId,
  stretchEntity,
  translateEntity,
} from "../../domain/entities"
import { UpdateEntitiesCommand } from "../commands/entityCommands"
import { QuestionInput, ToolContext } from "./Tool"
import { PlacementTool, isZeroDisplacement } from "./PlacementTool"

/** A window or crossing polygon given while selecting: a stretch frame. */
type Frame = readonly Vec2[]

/**
 * AutoCAD's STRETCH: drag a crossing window over *part* of the drawing, then
 * give a base → second-point displacement. Endpoints and vertices caught by the
 * frame follow the displacement while the rest stay anchored, so the geometry
 * bends instead of moving — the everyday way to lengthen a wall, widen an
 * opening or drag a corner of a shape without redrawing it.
 *
 * The frames dragged during selection *are* the deformation: what they enclose
 * moves. Two rules, both AutoCAD's:
 *
 * - objects picked with a plain **click** (or already selected before the
 *   command started) have no frame, so they move whole, like MOVE;
 * - **circles and arcs** never deform — they move when their centre is framed.
 *
 * Everything else (select → base → destination, snapping, Ortho/Polar, typed
 * distance/angle, the drag's preview) comes from {@link PlacementTool}, so the
 * preview shows the bent result before committing.
 */
export class StretchTool extends PlacementTool {
  readonly id = "stretch"

  /** The dragged selection boxes; a point inside any of them is stretched. */
  private frames: Frame[] = []
  /** Objects picked without a frame (single clicks): these move whole. */
  private whole = new Set<EntityId>()

  onActivate(ctx: ToolContext): void {
    this.frames = []
    this.whole.clear()
    super.onActivate(ctx)
  }

  onDeactivate(ctx: ToolContext): void {
    this.frames = []
    this.whole.clear()
    super.onDeactivate(ctx)
  }

  protected continuesAfterPlace(): boolean {
    return false
  }

  /** STRETCH's selection takes no group, as AutoCAD's lists its modes. */
  protected selectionInput(): QuestionInput {
    return "crossingObjects"
  }

  protected announceSelection(ctx: ToolContext): void {
    ctx.report(ctx.text.message("stretchSelection"))
  }

  protected onSelectionAdded(
    ids: readonly EntityId[],
    frame: readonly Vec2[] | null
  ): void {
    if (!frame) {
      for (const id of ids) this.whole.add(id)
      return
    }
    this.frames.push(frame)
  }

  protected transformEntity(entity: Entity, delta: Vec3): Entity {
    // No frame was dragged (pre-selected or clicked objects): plain move.
    if (this.frames.length === 0 || this.whole.has(entity.id)) {
      return translateEntity(entity, delta)
    }
    return stretchEntity(entity, delta, (point) => this.isFramed(point))
  }

  protected place(
    originals: readonly Entity[],
    delta: Vec3,
    ctx: ToolContext
  ): void {
    // By nothing, nothing changes, as MOVE (until the Transforms review
    // probes STRETCH's own).
    if (isZeroDisplacement(delta)) return
    ctx.execute(
      new UpdateEntitiesCommand(
        originals.map((entity) => this.transformEntity(entity, delta))
      )
    )
  }

  private isFramed(point: Vec2): boolean {
    return this.frames.some((frame) => withinFrame(point, frame))
  }
}

/** Whether `point` lies in the frame or on its edge. */
function withinFrame(point: Vec2, frame: Frame): boolean {
  let inside = false
  for (let i = 0, j = frame.length - 1; i < frame.length; j = i++) {
    const a = frame[i]
    const b = frame[j]
    const cross = (b.x - a.x) * (point.y - a.y) - (b.y - a.y) * (point.x - a.x)
    const onEdge =
      Math.abs(cross) < 1e-9 &&
      Math.min(a.x, b.x) <= point.x &&
      point.x <= Math.max(a.x, b.x) &&
      Math.min(a.y, b.y) <= point.y &&
      point.y <= Math.max(a.y, b.y)
    if (onEdge) return true
    if (
      a.y > point.y !== b.y > point.y &&
      point.x < ((b.x - a.x) * (point.y - a.y)) / (b.y - a.y) + a.x
    ) {
      inside = !inside
    }
  }
  return inside
}
