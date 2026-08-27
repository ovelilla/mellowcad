import { Vec2 } from "../../geometry/Vec2"
import { DocumentReader } from "../../domain/Document"
import {
  EntityId,
  entityWithinRect,
  entityCrossesRect,
} from "../../domain/entities"
import { Viewport } from "../Viewport"
import { ScenePrimitive } from "../../scene/types"
import { THEME } from "../../scene/theme"

/**
 * AutoCAD's rectangular selection, shared by every tool that lets the user drag
 * a box (Select, Move, Copy, ...). Dragging left→right is a *window* (only
 * fully-enclosed objects match); right→left is a *crossing* window (objects the
 * box merely touches also match).
 */

/**
 * Crossing when the drag runs right→left. World and screen X share the same
 * ordering (the viewport only flips Y), so comparing world X is sufficient.
 */
export function isCrossingBox(start: Vec2, current: Vec2): boolean {
  return current.x < start.x
}

/** The ids of every entity the box from `start` to `current` selects. */
export function boxSelect(
  document: DocumentReader,
  start: Vec2,
  current: Vec2
): EntityId[] {
  const min = {
    x: Math.min(start.x, current.x),
    y: Math.min(start.y, current.y),
  }
  const max = {
    x: Math.max(start.x, current.x),
    y: Math.max(start.y, current.y),
  }
  const crossing = isCrossingBox(start, current)

  const hits: EntityId[] = []
  for (const entity of document.getEntities()) {
    // Objects on hidden or locked layers cannot be selected (AutoCAD rule) —
    // the same filter single-click picking applies in Document.pick.
    if (!document.isEntitySelectable(entity)) continue
    const matches = crossing
      ? entityWithinRect(entity, min, max) ||
        entityCrossesRect(entity, min, max)
      : entityWithinRect(entity, min, max)
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
  const crossing = isCrossingBox(start, current)

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
