import { Vec2 } from "../../geometry/Vec2"
import { infiniteLineIntersection } from "../../geometry/primitives"
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
 * box merely touches also match). The selection modes' fence and polygons are
 * here too.
 */

/** Which objects a test of the drawing looks at. */
export type ObjectFilter = (entity: Entity) => boolean

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
  // Objects on hidden or locked layers cannot be selected (AutoCAD rule) —
  // the same filter single-click picking applies in Document.pick.
  return objectsInWindow(
    document,
    start,
    current,
    viewport,
    isCrossingBox(viewport, start, current),
    (entity) => document.isEntitySelectable(entity)
  )
}

/** Whether a box dragged from `start` to `current` is a crossing (right→left). */
export function isCrossingBox(
  viewport: Viewport,
  start: Vec2,
  current: Vec2
): boolean {
  return viewport.worldToScreen(current).x < viewport.worldToScreen(start).x
}

/**
 * The objects `include` admits that a window from `start` to `current` takes:
 * those wholly inside it, or with `crossing` those it touches too.
 */
export function objectsInWindow(
  document: DocumentReader,
  start: Vec2,
  current: Vec2,
  viewport: Viewport,
  crossing: boolean,
  include: ObjectFilter
): EntityId[] {
  const blocks = document.blockLookup()
  const onScreen = screenBox(viewport, start, current, crossing)
  if (!viewport.isPlan) {
    return document
      .getEntities()
      .filter((entity) => include(entity) && onScreen(entity, blocks))
      .map((entity) => entity.id)
  }
  const a = viewport.worldToView(start)
  const b = viewport.worldToView(current)
  const min = { x: Math.min(a.x, b.x), y: Math.min(a.y, b.y) }
  const max = { x: Math.max(a.x, b.x), y: Math.max(a.y, b.y) }

  const hits: EntityId[] = []
  for (const entity of document.getEntities()) {
    if (!include(entity)) continue
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
 * Whether the box selects an object by what is drawn of it on screen — off
 * the plan, where an object is drawn at its own heights, and for an object
 * tilted to the view. The corners are the pointer's points of the work
 * plane, which map back to where the box was dragged on screen.
 */
function screenBox(
  viewport: Viewport,
  start: Vec2,
  current: Vec2,
  crossing: boolean
): (entity: Entity, blocks: BlockLookup) => boolean {
  const a = viewport.worldToScreen(start)
  const b = viewport.worldToScreen(current)
  const min = { x: Math.min(a.x, b.x), y: Math.min(a.y, b.y) }
  const max = { x: Math.max(a.x, b.x), y: Math.max(a.y, b.y) }
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

/**
 * The objects `include` admits whose outline on screen meets the fence, the
 * open line through `points`.
 */
export function objectsOnFence(
  document: DocumentReader,
  points: readonly Vec2[],
  viewport: Viewport,
  include: ObjectFilter
): EntityId[] {
  const fence = points.map((point) => viewport.worldToScreen(point))
  const blocks = document.blockLookup()
  return document
    .getEntities()
    .filter(
      (entity) =>
        include(entity) &&
        entityScreenOutline(viewport, entity, blocks).some((line) =>
          linesMeet(line, fence)
        )
    )
    .map((entity) => entity.id)
}

/**
 * The objects `include` admits that the polygon through `points` takes, by
 * their outline on screen: wholly inside it (WPolygon), or with `crossing`
 * inside it or crossing its edges (CPolygon).
 */
export function objectsInPolygon(
  document: DocumentReader,
  points: readonly Vec2[],
  viewport: Viewport,
  crossing: boolean,
  include: ObjectFilter
): EntityId[] {
  const polygon = points.map((point) => viewport.worldToScreen(point))
  const edges = [...polygon, polygon[0]]
  const blocks = document.blockLookup()
  const hits: EntityId[] = []
  for (const entity of document.getEntities()) {
    if (!include(entity)) continue
    const outline = entityScreenOutline(viewport, entity, blocks)
    const vertices = outline.flat()
    if (vertices.length === 0) continue
    const meets = outline.some((line) => linesMeet(line, edges))
    const takes = crossing
      ? meets || vertices.some((p) => insidePolygon(p, polygon))
      : !meets && vertices.every((p) => insidePolygon(p, polygon))
    if (takes) hits.push(entity.id)
  }
  return hits
}

/**
 * Whether the line through `line` meets the closed polygon through
 * `polygon`, crossing its edges or inside it: what a crossing window or
 * CPolygon takes of it. Both on screen.
 */
export function meetsPolygon(
  line: readonly Vec2[],
  polygon: readonly Vec2[]
): boolean {
  return (
    linesMeet(line, [...polygon, polygon[0]]) ||
    line.some((p) => insidePolygon(p, polygon))
  )
}

/**
 * Where the fence through `fence` first meets one of `lines`, going along
 * it, or null. Both on screen.
 */
export function fenceCrossing(
  lines: readonly (readonly Vec2[])[],
  fence: readonly Vec2[]
): Vec2 | null {
  for (let j = 1; j < fence.length; j++) {
    let first: { point: Vec2; t: number } | null = null
    for (const line of lines) {
      for (let i = 1; i < line.length; i++) {
        const x = infiniteLineIntersection(
          fence[j - 1],
          fence[j],
          line[i - 1],
          line[i]
        )
        if (!x || x.t < 0 || x.t > 1 || x.u < 0 || x.u > 1) continue
        if (!first || x.t < first.t) first = x
      }
    }
    if (first) return first.point
  }
  return null
}

/**
 * Whether the edge `a`–`b` crosses one of the polygon's edges through
 * `points` that it does not share a vertex with: AutoCAD refuses a polygon
 * point whose edges would (`polygon segments cannot intersect`).
 */
export function crossesPolygonEdges(
  points: readonly Vec2[],
  a: Vec2,
  b: Vec2
): boolean {
  const shared = (p: Vec2) => samePoint(p, a) || samePoint(p, b)
  for (let i = 1; i < points.length; i++) {
    const p = points[i - 1]
    const q = points[i]
    if (shared(p) || shared(q)) continue
    if (segmentsMeet(p, q, a, b)) return true
  }
  return false
}

function samePoint(a: Vec2, b: Vec2): boolean {
  return a.x === b.x && a.y === b.y
}

/** Whether two polylines meet anywhere. */
function linesMeet(a: readonly Vec2[], b: readonly Vec2[]): boolean {
  for (let i = 1; i < a.length; i++) {
    for (let j = 1; j < b.length; j++) {
      if (segmentsMeet(a[i - 1], a[i], b[j - 1], b[j])) return true
    }
  }
  return false
}

function segmentsMeet(a: Vec2, b: Vec2, c: Vec2, d: Vec2): boolean {
  const side = (o: Vec2, p: Vec2, q: Vec2) =>
    Math.sign((p.x - o.x) * (q.y - o.y) - (p.y - o.y) * (q.x - o.x))
  const d1 = side(c, d, a)
  const d2 = side(c, d, b)
  const d3 = side(a, b, c)
  const d4 = side(a, b, d)
  if (d1 * d2 < 0 && d3 * d4 < 0) return true
  const within = (o: Vec2, p: Vec2, q: Vec2) =>
    Math.min(o.x, p.x) <= q.x &&
    q.x <= Math.max(o.x, p.x) &&
    Math.min(o.y, p.y) <= q.y &&
    q.y <= Math.max(o.y, p.y)
  return (
    (d1 === 0 && within(c, d, a)) ||
    (d2 === 0 && within(c, d, b)) ||
    (d3 === 0 && within(a, b, c)) ||
    (d4 === 0 && within(a, b, d))
  )
}

/** Even-odd test of `p` against the closed polygon through `points`. */
function insidePolygon(p: Vec2, points: readonly Vec2[]): boolean {
  let inside = false
  for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
    const a = points[i]
    const b = points[j]
    if (
      a.y > p.y !== b.y > p.y &&
      p.x < ((b.x - a.x) * (p.y - a.y)) / (b.y - a.y) + a.x
    ) {
      inside = !inside
    }
  }
  return inside
}

/**
 * The in-progress selection rectangle: solid blue window / dashed green
 * crossing — by the direction it is dragged in, unless a mode fixes it.
 */
export function buildSelectionBoxOverlay(
  viewport: Viewport,
  start: Vec2,
  current: Vec2,
  crossing = isCrossingBox(viewport, start, current)
): ScenePrimitive[] {
  const a = viewport.worldToScreen(start)
  const b = viewport.worldToScreen(current)
  const min = { x: Math.min(a.x, b.x), y: Math.min(a.y, b.y) }
  const width = Math.abs(a.x - b.x)
  const height = Math.abs(a.y - b.y)

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

/** A WPolygon or CPolygon being drawn, in the window's or the crossing's colours. */
export function buildSelectionPolygonOverlay(
  viewport: Viewport,
  points: readonly Vec2[],
  crossing: boolean
): ScenePrimitive[] {
  return [
    {
      kind: "path",
      points: points.map((point) => viewport.worldToScreen(point)),
      closed: true,
      fill: crossing ? THEME.selectionCrossingFill : THEME.selectionWindowFill,
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

/** A fence being drawn: the dashed line it selects across. */
export function buildFenceOverlay(
  viewport: Viewport,
  points: readonly Vec2[]
): ScenePrimitive[] {
  return [
    {
      kind: "path",
      points: points.map((point) => viewport.worldToScreen(point)),
      stroke: { color: THEME.selectionCrossingStroke, width: 1, dash: [6, 4] },
    },
  ]
}
