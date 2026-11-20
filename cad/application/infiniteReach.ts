import type { Vec2 } from "../geometry/Vec2"
import {
  BlockLookup,
  Bounds,
  Entity,
  entitiesBounds,
  infiniteLineReaching,
  isInfiniteLine,
} from "../domain/entities"

interface ScreenView {
  readonly width: number
  readonly height: number
  screenToWorld(p: Vec2): Vec2
}

/** The world rectangle the view shows, in plan; null for a view of no size. */
export function viewWorldBounds(view: ScreenView): Bounds | null {
  if (view.width <= 0 || view.height <= 0) return null
  const corners = [
    { x: 0, y: 0 },
    { x: view.width, y: 0 },
    { x: 0, y: view.height },
    { x: view.width, y: view.height },
  ].map((corner) => view.screenToWorld(corner))
  return {
    min: {
      x: Math.min(...corners.map((c) => c.x)),
      y: Math.min(...corners.map((c) => c.y)),
    },
    max: {
      x: Math.max(...corners.map((c) => c.x)),
      y: Math.max(...corners.map((c) => c.y)),
    },
  }
}

/**
 * A box holding every finite object of `entities` and the view: past it an
 * XLINE's or a RAY's stretch (`infiniteLineReaching`) meets nothing a command
 * cuts, bounds or snaps to, and no cursor.
 */
export function infiniteReachBox(
  entities: readonly Entity[],
  view: ScreenView | null,
  blocks?: BlockLookup
): Bounds {
  const boxes = [
    entitiesBounds(entities, blocks),
    view && viewWorldBounds(view),
    ...entities.flatMap((e) =>
      isInfiniteLine(e) ? [{ min: e.base, max: e.base }] : []
    ),
  ].filter((box): box is Bounds => !!box)
  if (boxes.length === 0) {
    return { min: { x: -1, y: -1 }, max: { x: 1, y: 1 } }
  }
  return {
    min: {
      x: Math.min(...boxes.map((b) => b.min.x)),
      y: Math.min(...boxes.map((b) => b.min.y)),
    },
    max: {
      x: Math.max(...boxes.map((b) => b.max.x)),
      y: Math.max(...boxes.map((b) => b.max.y)),
    },
  }
}

/**
 * `entities` with every XLINE and RAY as its stretch across `box`, a line of
 * its id; one standing upright on the plan is left out.
 */
export function withInfiniteSpans(
  entities: readonly Entity[],
  box: Bounds
): Entity[] {
  return entities.flatMap((entity) => {
    if (!isInfiniteLine(entity)) return [entity]
    const span = infiniteLineReaching(entity, box)
    return span ? [span] : []
  })
}
