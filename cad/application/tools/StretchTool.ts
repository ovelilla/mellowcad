import { Vec2 } from "../../geometry/Vec2"
import { Vec3 } from "../../geometry/Vec3"
import {
  Entity,
  EntityId,
  stretchEntity,
  translateEntity,
} from "../../domain/entities"
import { UpdateEntitiesCommand } from "../commands/entityCommands"
import { ToolContext } from "./Tool"
import { PlacementTool } from "./PlacementTool"

/** An axis-aligned world rectangle dragged while selecting: the stretch frame. */
interface Frame {
  readonly min: Vec2
  readonly max: Vec2
}

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
 * distance/angle, dashed preview) comes from {@link PlacementTool}, so the
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

  protected announceSelection(ctx: ToolContext): void {
    ctx.report(ctx.text.message("stretchSelection"))
  }

  protected onSelectionAdded(
    ids: readonly EntityId[],
    box: { readonly start: Vec2; readonly current: Vec2 } | null
  ): void {
    if (!box) {
      for (const id of ids) this.whole.add(id)
      return
    }
    this.frames.push({
      min: {
        x: Math.min(box.start.x, box.current.x),
        y: Math.min(box.start.y, box.current.y),
      },
      max: {
        x: Math.max(box.start.x, box.current.x),
        y: Math.max(box.start.y, box.current.y),
      },
    })
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
    ctx.execute(
      new UpdateEntitiesCommand(
        originals.map((entity) => this.transformEntity(entity, delta))
      )
    )
  }

  private isFramed(point: Vec2): boolean {
    return this.frames.some(
      (frame) =>
        point.x >= frame.min.x &&
        point.x <= frame.max.x &&
        point.y >= frame.min.y &&
        point.y <= frame.max.y
    )
  }
}
