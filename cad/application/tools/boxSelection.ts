import { Vec2 } from "../../geometry/Vec2"
import { DocumentReader } from "../../domain/Document"
import {
  BlockLookup,
  Entity,
  EntityId,
  entityWithinRect,
  entityCrossesRect,
} from "../../domain/entities"
import { Viewport, entityInView } from "../Viewport"
import { drawsTilted, entityScreenOutline } from "../viewOutline"
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
  if (!viewport.isPlan)
    return boxSelectOnScreen(document, start, current, viewport)
  const a = viewport.worldToView(start)
  const b = viewport.worldToView(current)
  const min = { x: Math.min(a.x, b.x), y: Math.min(a.y, b.y) }
  const max = { x: Math.max(a.x, b.x), y: Math.max(a.y, b.y) }
  const crossing = b.x < a.x
  const blocks = document.blockLookup()
  const onScreen = screenBox(viewport, start, current)

  const hits: EntityId[] = []
  for (const entity of document.getEntities()) {
    // Objects on hidden or locked layers cannot be selected (AutoCAD rule) —
    // the same filter single-click picking applies in Document.pick.
    if (!document.isEntitySelectable(entity)) continue
    if (drawsTilted(entity, blocks)) {
      if (onScreen(entity, blocks)) hits.push(entity.id)
      continue
    }
    const seen = entityInView(entity, viewport)
    const matches = crossing
      ? entityWithinRect(seen, min, max, blocks) ||
        entityCrossesRect(seen, min, max, blocks)
      : entityWithinRect(seen, min, max, blocks)
    if (matches) hits.push(entity.id)
  }
  return hits
}

/**
 * The box off the plan, where an object is drawn at its own heights: its
 * outline on screen (what the scene draws) is tested against the rectangle.
 * The corners are the pointer's points of the work plane, which map back to
 * where the box was dragged on screen.
 */
function boxSelectOnScreen(
  document: DocumentReader,
  start: Vec2,
  current: Vec2,
  viewport: Viewport
): EntityId[] {
  const blocks = document.blockLookup()
  const onScreen = screenBox(viewport, start, current)
  const hits: EntityId[] = []
  for (const entity of document.getEntities()) {
    if (!document.isEntitySelectable(entity)) continue
    if (onScreen(entity, blocks)) hits.push(entity.id)
  }
  return hits
}

/** Whether the box selects an object by what is drawn of it on screen. */
function screenBox(
  viewport: Viewport,
  start: Vec2,
  current: Vec2
): (entity: Entity, blocks: BlockLookup) => boolean {
  const a = viewport.worldToScreen(start)
  const b = viewport.worldToScreen(current)
  const min = { x: Math.min(a.x, b.x), y: Math.min(a.y, b.y) }
  const max = { x: Math.max(a.x, b.x), y: Math.max(a.y, b.y) }
  const crossing = b.x < a.x
  const inside = (p: Vec2) =>
    p.x >= min.x && p.x <= max.x && p.y >= min.y && p.y <= max.y
  return (entity, blocks) => {
    const outline = entityScreenOutline(viewport, entity, blocks)
    const points = outline.flat()
    if (points.length === 0) return false
    return crossing
      ? points.some(inside) ||
          outline.some((line) =>
            line.some(
              (p, i) => i > 0 && segmentMeetsRect(line[i - 1], p, min, max)
            )
          )
      : points.every(inside)
  }
}

/** Whether segment `a`–`b` crosses the rectangle (Liang–Barsky). */
function segmentMeetsRect(a: Vec2, b: Vec2, min: Vec2, max: Vec2): boolean {
  const dx = b.x - a.x
  const dy = b.y - a.y
  let t0 = 0
  let t1 = 1
  const edges: [number, number][] = [
    [-dx, a.x - min.x],
    [dx, max.x - a.x],
    [-dy, a.y - min.y],
    [dy, max.y - a.y],
  ]
  for (const [p, q] of edges) {
    if (p === 0) {
      if (q < 0) return false
      continue
    }
    const r = q / p
    if (p < 0) {
      if (r > t1) return false
      if (r > t0) t0 = r
    } else {
      if (r < t0) return false
      if (r < t1) t1 = r
    }
  }
  return t0 <= t1
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
