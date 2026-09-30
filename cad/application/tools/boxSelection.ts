import { Vec2 } from "../../geometry/Vec2"
import { DocumentReader } from "../../domain/Document"
import {
  EntityId,
  entityWithinRect,
  entityCrossesRect,
} from "../../domain/entities"
import { Viewport, entityInView } from "../Viewport"
import { ScenePrimitive } from "../../scene/types"
import { THEME } from "../../scene/theme"

/**
 * AutoCAD's rectangular selection, shared by every tool that lets the user drag
 * a box (Select, Move, Copy, ...). Dragging left→right is a *window* (only
 * fully-enclosed objects match); right→left is a *crossing* window (objects the
 * box merely touches also match).
 */

/**
 * The ids of every entity the box from `start` to `current` selects. The box is
 * upright on screen, so each object is tested in the view frame — whose X also
 * tells a crossing (dragged right→left) from a window.
 */
export function boxSelect(
  document: DocumentReader,
  start: Vec2,
  current: Vec2,
  viewport: Viewport
): EntityId[] {
  const a = viewport.worldToView(start)
  const b = viewport.worldToView(current)
  const min = { x: Math.min(a.x, b.x), y: Math.min(a.y, b.y) }
  const max = { x: Math.max(a.x, b.x), y: Math.max(a.y, b.y) }
  const crossing = b.x < a.x
  const blocks = document.blockLookup()

  const hits: EntityId[] = []
  for (const entity of document.getEntities()) {
    // Objects on hidden or locked layers cannot be selected (AutoCAD rule) —
    // the same filter single-click picking applies in Document.pick.
    if (!document.isEntitySelectable(entity)) continue
    const seen = entityInView(entity, viewport)
    const matches = crossing
      ? entityWithinRect(seen, min, max, blocks) ||
        entityCrossesRect(seen, min, max, blocks)
      : entityWithinRect(seen, min, max, blocks)
    if (matches) hits.push(entity.id)
  }
  return hits
}

/** The in-progress selection rectangle: solid blue window / dashed green crossing. */
export function buildSelectionBoxOverlay(
  viewport: Viewport,
  start: Vec2,
  current: Vec2
): ScenePrimitive[] {
  const a = viewport.worldToScreen(start)
  const b = viewport.worldToScreen(current)
  const min = { x: Math.min(a.x, b.x), y: Math.min(a.y, b.y) }
  const width = Math.abs(a.x - b.x)
  const height = Math.abs(a.y - b.y)
  const crossing = b.x < a.x

  return [
    {
      kind: "rect",
      min,
      width,
      height,
      fill: crossing ? THEME.selectionCrossingFill : THEME.selectionWindowFill,
    },
    {
      kind: "rect",
      // Half-pixel offset keeps the 1px outline crisp on the device grid.
      min: { x: min.x + 0.5, y: min.y + 0.5 },
      width,
      height,
      stroke: {
        color: crossing
          ? THEME.selectionCrossingStroke
          : THEME.selectionWindowStroke,
        width: 1,
        dash: crossing ? [6, 4] : undefined,
      },
    },
  ]
}
