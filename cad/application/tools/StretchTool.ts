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
import type { AddedBy } from "./objectSelection"

/**
 * AutoCAD's STRETCH: drag a crossing window over *part* of the drawing, then
 * give a base → second-point displacement. Endpoints and vertices caught by the
 * frame follow the displacement while the rest stay anchored, so the geometry
 * bends instead of moving — the everyday way to lengthen a wall, widen an
 * opening or drag a corner of a shape without redrawing it.
 *
 * Each object is stretched as it was first added to the set (transforms/
 * p262–p270, p279; `1 found (1 duplicate)` changes nothing):
 *
 * - by a **crossing frame** (a crossing window, CPolygon, a crossing lasso):
 *   what that frame encloses moves, by `stretchEntity` — an arc by its ends,
 *   a circle by its centre;
 * - by a **pick**, Window, WPolygon or Fence: it moves whole, like MOVE;
 * - by **Last or ALL** (p268): it neither stretches nor moves; Previous
 *   alike, **unverified**.
 *
 * A preselection moves whole, **unverified** (p289 shows noun-verb STRETCH,
 * not its geometry). Everything else (select → base → destination,
 * snapping, Ortho/Polar, typed distance/angle, the drag's preview) comes from
 * {@link PlacementTool}, so the preview shows the bent result before
 * committing; its Displacement reads from LASTPOINT
 * ({@link displacementFromLastPoint}).
 */
export class StretchTool extends PlacementTool {
  readonly id = "stretch"

  /** How each object of the set was first added. */
  private added = new Map<EntityId, AddedBy>()

  onActivate(ctx: ToolContext): void {
    this.added.clear()
    super.onActivate(ctx)
  }

  onDeactivate(ctx: ToolContext): void {
    this.added.clear()
    super.onDeactivate(ctx)
  }

  protected continuesAfterPlace(): boolean {
    return false
  }

  protected displacementFromLastPoint(): boolean {
    return true
  }

  /** STRETCH's selection takes no group, as AutoCAD's lists its modes. */
  protected selectionInput(): QuestionInput {
    return "crossingObjects"
  }

  protected announceSelection(ctx: ToolContext): void {
    ctx.report(ctx.text.message("stretchSelection"))
  }

  /**
   * Only what joins the set reaches here, so an object removed and found
   * again is added anew.
   */
  protected onSelectionAdded(ids: readonly EntityId[], added: AddedBy): void {
    for (const id of ids) this.added.set(id, added)
  }

  protected transformEntity(entity: Entity, delta: Vec3): Entity {
    const added = this.added.get(entity.id) ?? WHOLE
    switch (added.by) {
      case "pick":
        return translateEntity(entity, delta)
      case "name":
        return entity
      case "frame":
        return stretchEntity(entity, delta, (point) =>
          withinFrame(point, added.frame)
        )
    }
  }

  protected place(
    originals: readonly Entity[],
    delta: Vec3,
    ctx: ToolContext
  ): void {
    // By nothing, nothing changes, as MOVE, the run still the step U names
    // (MOVE-D3 holds: transforms/p249–p253).
    if (isZeroDisplacement(delta)) return
    ctx.execute(
      new UpdateEntitiesCommand(
        originals.map((entity) => this.transformEntity(entity, delta))
      )
    )
  }
}

/** A preselected object: moved whole. */
const WHOLE: AddedBy = { by: "pick" }

/** Whether `point` lies in the frame or on its edge. */
function withinFrame(point: Vec2, frame: readonly Vec2[]): boolean {
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
