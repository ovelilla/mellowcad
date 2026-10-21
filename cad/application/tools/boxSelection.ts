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
import { entityScenePrimitive } from "../SceneBuilder"

/**
 * AutoCAD's window selection, shared by every tool that selects (Select, Move,
 * Copy, ...): drawn left→right it is a *window* (only fully-enclosed objects
 * match), right→left a *crossing* (objects it merely touches also match). The
 * lasso a press and drag draws, and the selection modes' fence and polygons,
 * are here too.
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
  const fence = new ScreenPath(
    points.map((point) => viewport.worldToScreen(point)),
    false
  )
  const blocks = document.blockLookup()
  return document
    .getEntities()
    .filter(
      (entity) =>
        include(entity) &&
        fence.meets(entityScreenOutline(viewport, entity, blocks))
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
  const polygon = new ScreenPath(
    points.map((point) => viewport.worldToScreen(point)),
    true
  )
  const blocks = document.blockLookup()
  const hits: EntityId[] = []
  for (const entity of document.getEntities()) {
    if (!include(entity)) continue
    const outline = entityScreenOutline(viewport, entity, blocks)
    const vertices = outline.flat()
    if (vertices.length === 0) continue
    const takes = crossing
      ? polygon.meets(outline) || vertices.some((p) => polygon.encloses(p))
      : vertices.every((p) => polygon.encloses(p)) && !polygon.meets(outline)
    if (takes) hits.push(entity.id)
  }
  return hits
}

/**
 * A fence's or a polygon's edges on the screen, filed in a grid of cells so
 * that what meets them, or lies inside, is asked of the few edges near it:
 * a lasso's path has hundreds, asked of every object at each move.
 */
class ScreenPath {
  private readonly edges: readonly (readonly [Vec2, Vec2])[]
  private readonly min: Vec2
  private readonly max: Vec2
  private readonly cell: number
  private readonly columns: number
  /** The edges through each cell, row by row. */
  private readonly cells: number[][]
  /** The edges each row's band of Y reaches, for {@link encloses}. */
  private readonly rows: number[][]
  /** Marks the edges a {@link meets} has tested, against testing one twice. */
  private readonly seen: number[]
  private visit = 0

  constructor(points: readonly Vec2[], closed: boolean) {
    const ends = closed ? [...points, points[0]] : points
    this.edges = ends.slice(1).map((b, i) => [ends[i], b] as const)
    this.min = {
      x: Math.min(...points.map((p) => p.x)),
      y: Math.min(...points.map((p) => p.y)),
    }
    this.max = {
      x: Math.max(...points.map((p) => p.x)),
      y: Math.max(...points.map((p) => p.y)),
    }
    const size = Math.max(this.max.x - this.min.x, this.max.y - this.min.y)
    this.cell = Math.max(4, size / GRID_CELLS)
    this.columns = this.column(this.max.x) + 1
    const rowCount = this.row(this.max.y) + 1
    this.cells = Array.from({ length: this.columns * rowCount }, () => [])
    this.rows = Array.from({ length: rowCount }, () => [])
    this.seen = this.edges.map(() => 0)
    this.edges.forEach(([a, b], edge) => {
      const [c0, c1] = [this.column(a.x), this.column(b.x)].sort(
        (m, n) => m - n
      )
      const [r0, r1] = [this.row(a.y), this.row(b.y)].sort((m, n) => m - n)
      for (let r = r0; r <= r1; r++) {
        this.rows[r].push(edge)
        for (let c = c0; c <= c1; c++)
          this.cells[r * this.columns + c].push(edge)
      }
    })
  }

  /** Whether one of the lines meets an edge. */
  meets(lines: readonly (readonly Vec2[])[]): boolean {
    return lines.some((line) =>
      line.some((b, i) => i > 0 && this.meetsSegment(line[i - 1], b))
    )
  }

  /** Even-odd: whether `p` lies inside the closed path. */
  encloses(p: Vec2): boolean {
    if (!this.within(p.x, p.y, p.x, p.y)) return false
    let inside = false
    for (const edge of this.rows[this.row(p.y)]) {
      const [a, b] = this.edges[edge]
      if (
        a.y > p.y !== b.y > p.y &&
        p.x < ((b.x - a.x) * (p.y - a.y)) / (b.y - a.y) + a.x
      ) {
        inside = !inside
      }
    }
    return inside
  }

  private meetsSegment(a: Vec2, b: Vec2): boolean {
    const x0 = Math.min(a.x, b.x)
    const x1 = Math.max(a.x, b.x)
    const y0 = Math.min(a.y, b.y)
    const y1 = Math.max(a.y, b.y)
    if (!this.within(x0, y0, x1, y1)) return false
    const visit = ++this.visit
    const [c0, c1] = [this.column(x0), this.column(x1)]
    for (let r = this.row(y0); r <= this.row(y1); r++) {
      for (let c = c0; c <= c1; c++) {
        for (const edge of this.cells[r * this.columns + c]) {
          if (this.seen[edge] === visit) continue
          this.seen[edge] = visit
          const [p, q] = this.edges[edge]
          if (segmentsMeet(a, b, p, q)) return true
        }
      }
    }
    return false
  }

  private within(x0: number, y0: number, x1: number, y1: number): boolean {
    return (
      x1 >= this.min.x &&
      x0 <= this.max.x &&
      y1 >= this.min.y &&
      y0 <= this.max.y
    )
  }

  /** The cell's column at `x`, clamped to the grid. */
  private column(x: number): number {
    const at = Math.floor((x - this.min.x) / this.cell)
    return Math.min(
      Math.max(at, 0),
      Math.floor((this.max.x - this.min.x) / this.cell)
    )
  }

  private row(y: number): number {
    const at = Math.floor((y - this.min.y) / this.cell)
    return Math.min(
      Math.max(at, 0),
      Math.floor((this.max.y - this.min.y) / this.cell)
    )
  }
}

/** Cells along a {@link ScreenPath}'s longer side. */
const GRID_CELLS = 64

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
  return fenceCrossings([lines], fence)[0]?.point ?? null
}

/**
 * Every place the fence through `fence` meets one of `outlines` (each an
 * object's lines), in the order the fence goes, each place of an outline
 * once (where two of its lines meet, or the fence comes back). Both on
 * screen.
 */
export function fenceCrossings(
  outlines: readonly (readonly (readonly Vec2[])[])[],
  fence: readonly Vec2[]
): { readonly outline: number; readonly point: Vec2 }[] {
  const crossings: { readonly outline: number; readonly point: Vec2 }[] = []
  for (let j = 1; j < fence.length; j++) {
    const along: { outline: number; point: Vec2; t: number }[] = []
    outlines.forEach((lines, outline) => {
      for (const line of lines) {
        for (let i = 1; i < line.length; i++) {
          const x = infiniteLineIntersection(
            fence[j - 1],
            fence[j],
            line[i - 1],
            line[i]
          )
          if (!x || x.t < 0 || x.t > 1 || x.u < 0 || x.u > 1) continue
          along.push({ outline, point: x.point, t: x.t })
        }
      }
    })
    along.sort((a, b) => a.t - b.t)
    for (const { outline, point } of along) {
      const twice = crossings.some(
        (c) =>
          c.outline === outline &&
          Math.hypot(c.point.x - point.x, c.point.y - point.y) < 1e-6
      )
      if (!twice) crossings.push({ outline, point })
    }
  }
  return crossings
}

/**
 * Whether the edge `a`–`b` crosses one of the polygon's edges through
 * `points` that it does not share a vertex with: AutoCAD refuses a polygon
 * point whose edge would, and Enter while the closing edge would (`polygon
 * segments cannot intersect`).
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

/** What a lasso takes, which Space cycles while its button is held. */
export type LassoMode = "window" | "crossing" | "fence"

/**
 * A lasso under way: the path dragged from the press, its last point the
 * cursor's, the earlier ones kept every {@link LASSO_STEP_PX} pixels.
 */
export interface Lasso {
  readonly mode: LassoMode
  readonly path: readonly Vec2[]
}

/** Screen pixels between the points a lasso keeps of the dragged path. */
const LASSO_STEP_PX = 3

/**
 * The lasso a drag from `start` begins as it reaches `current`: a window
 * rightwards, a crossing leftwards. WHY on its first stretch: AutoCAD says the
 * mode as the drag starts, and keeps a crossing whose release lands right of
 * its press (desktop erase/d04, d09-4).
 */
export function startLasso(
  viewport: Viewport,
  start: Vec2,
  current: Vec2
): Lasso {
  return {
    mode: isCrossingBox(viewport, start, current) ? "crossing" : "window",
    path: [start, current],
  }
}

/** The lasso with the cursor moved to `point`. */
export function extendLasso(
  viewport: Viewport,
  lasso: Lasso,
  point: Vec2
): Lasso {
  const kept = lasso.path.slice(0, -1)
  const tail = lasso.path[lasso.path.length - 1]
  const a = viewport.worldToScreen(kept[kept.length - 1])
  const b = viewport.worldToScreen(tail)
  const far = Math.hypot(b.x - a.x, b.y - a.y) >= LASSO_STEP_PX
  return { ...lasso, path: [...kept, ...(far ? [tail] : []), point] }
}

/**
 * Space's next mode: Window → Fence → Crossing → Window (desktop erase/d04;
 * the help's "cycle between the Window, Crossing, and Fence").
 */
export function nextLassoMode(mode: LassoMode): LassoMode {
  return mode === "window" ? "fence" : mode === "fence" ? "crossing" : "window"
}

/**
 * The objects `include` admits that a lasso takes, as WPolygon, CPolygon or
 * Fence would along its path. A path that crosses itself is taken as drawn:
 * the lasso refuses none (desktop erase/d04).
 */
export function lassoSelect(
  document: DocumentReader,
  lasso: Lasso,
  viewport: Viewport,
  include: ObjectFilter
): EntityId[] {
  return lasso.mode === "fence"
    ? objectsOnFence(document, lasso.path, viewport, include)
    : objectsInPolygon(
        document,
        lasso.path,
        viewport,
        lasso.mode === "crossing",
        include
      )
}

/** A lasso being dragged: the window's or the crossing's region, or a fence. */
export function buildLassoOverlay(
  viewport: Viewport,
  lasso: Lasso
): ScenePrimitive[] {
  return lasso.mode === "fence"
    ? buildFenceOverlay(viewport, lasso.path)
    : buildSelectionPolygonOverlay(
        viewport,
        lasso.path,
        lasso.mode === "crossing"
      )
}

/**
 * What a window, a crossing or a lasso under way would take, drawn as the
 * hover is (SELECTIONPREVIEW 3, desktop erase/d02-1, d03-1, d05-1).
 */
export function buildSelectionPreview(
  viewport: Viewport,
  document: DocumentReader,
  ids: readonly EntityId[]
): ScenePrimitive[] {
  const blocks = document.blockLookup()
  return ids.flatMap((id) => {
    const entity = document.get(id)
    return entity
      ? entityScenePrimitive(
          viewport,
          entity,
          { color: THEME.entityHover, width: 2 },
          {
            blocks,
            dimStyle:
              entity.type === "dimension"
                ? document.getDimStyle(entity.styleId)
                : undefined,
          }
        )
      : []
  })
}
