import { Vec2, V } from "../geometry/Vec2"
import { Vec3 } from "../geometry/Vec3"
import { polarPoint } from "../geometry/primitives"
import type {
  ArrayParameters,
  ArrayPath,
  ArrayPathPiece,
  Bounds,
  Entity,
  PathLayout,
  PolarArray,
  RectangularArray,
} from "./entityTypes"
import {
  copyEntity,
  rotateEntity,
  rotateEntityCopy,
  rotatePoint,
  translateEntity,
} from "./entityTransforms"
import { polylineSegmentGeometries } from "./polylines"
import { Ucs, ucsDirectionToWorld, worldDirectionToUcs } from "./ucs"

export type { ArrayPath, PathLayout, PolarArray, RectangularArray }

/**
 * The largest count the arrays' prompts take: AutoCAD asks every one of them
 * as a 16-bit integer (probe arrays/p279: `Requires an integer between 1 and
 * 32767, or option keyword.`; ARRAYRECT's and ARRAYPATH's counts are the same
 * integer prompt, p111, p331).
 */
export const MAX_ARRAY_COUNT = 32767

/**
 * Where one item of an array goes: the source moved by `move`, then turned
 * `turn` radians about `pivot`. The layouts below give every item but the
 * first, which is the source where it stands.
 */
export interface ArrayItem {
  readonly move: Vec2 | Vec3
  readonly pivot: Vec2
  readonly turn: number
}

/** `entity` placed as `item`, its id kept: what a preview draws. */
export function placeArrayItem(entity: Entity, item: ArrayItem): Entity {
  const moved = translateEntity(entity, item.move)
  return item.turn === 0 ? moved : rotateEntity(moved, item.pivot, item.turn)
}

/** `entity` placed as `item`, a new object: what a commit adds. */
export function arrayItemCopy(entity: Entity, item: ArrayItem): Entity {
  return item.turn === 0
    ? copyEntity(entity, item.move)
    : rotateEntityCopy(
        translateEntity(entity, item.move),
        item.pivot,
        item.turn
      )
}

/**
 * The set's extents box (`entitiesBounds`), its sides measured along the
 * UCS's axes: what the arrays' default spacings are one and a half times
 * (probes arrays/p165, p310: a circle of radius 2 under `_UCS _Z 30` is
 * 4 (cos 30° + sin 30°) across).
 */
export function arraySourceSize(
  box: Bounds | null,
  ucs: Ucs
): { width: number; height: number } {
  if (box === null) return { width: 0, height: 0 }
  const sides = [
    { x: box.max.x - box.min.x, y: 0 },
    { x: 0, y: box.max.y - box.min.y },
  ].map((side) => worldDirectionToUcs(ucs, side))
  return {
    width: Math.abs(sides[0].x) + Math.abs(sides[1].x),
    height: Math.abs(sides[0].y) + Math.abs(sides[1].y),
  }
}

/** The columns' direction a rectangular array laid out in `ucs` takes: its X axis. */
export function arrayAxis(ucs: Ucs): Vec2 {
  const { x, y } = ucsDirectionToWorld(ucs, { x: 1, y: 0 })
  return { x, y }
}

/** The grid's items, column by column, the source's cell (0, 0) left out. */
export function rectangularArrayItems(
  grid: RectangularArray,
  limit = Infinity
): ArrayItem[] {
  const { x: c, y: s } = grid.axis
  const out: ArrayItem[] = []
  for (let i = 0; i < grid.columns && out.length < limit; i++) {
    for (let j = 0; j < grid.rows && out.length < limit; j++) {
      if (i === 0 && j === 0) continue
      const along = i * grid.colSpacing
      const across = j * grid.rowSpacing
      const move = {
        x: along * c - across * s,
        y: along * s + across * c,
        z: j * grid.rowElevation,
      }
      out.push({ move, pivot: { x: 0, y: 0 }, turn: 0 })
    }
  }
  return out
}

const FULL_TURN = 360

/** Whether a fill is a whole turn, where the closing item would land on the first. */
export function isFullTurn(fill: number): boolean {
  return fill > FULL_TURN - 1e-9
}

/** The angle between items: a whole turn shared by the count, any other fill by the steps. */
export function polarAngleBetween(
  ring: Pick<PolarArray, "items" | "fill">
): number {
  if (ring.items <= 1) return 0
  return isFullTurn(ring.fill)
    ? ring.fill / ring.items
    : ring.fill / (ring.items - 1)
}

/**
 * The ring's items after the source: each turned about the centre, or, not
 * rotated, moved as the base point turns about it. A ring whose radius was
 * stretched moves every item, the source's too, by how far its base point
 * went (ARRAYS-D73: `arraySourceItem` places the source).
 */
export function polarArrayItems(
  ring: PolarArray,
  limit = Infinity
): ArrayItem[] {
  const between = polarAngleBetween(ring)
  const step = ((ring.clockwise ? -between : between) * Math.PI) / 180
  const anchor = ring.sourceBase ?? ring.basePoint
  const shift = V.sub(ring.basePoint, anchor)
  const out: ArrayItem[] = []
  for (let k = 1; k < ring.items && out.length < limit; k++) {
    const turn = k * step
    if (ring.rotate) {
      out.push({ move: shift, pivot: ring.center, turn })
    } else {
      const moved = rotatePoint(ring.basePoint, ring.center, turn)
      out.push({ move: V.sub(moved, anchor), pivot: moved, turn: 0 })
    }
  }
  return out
}

/**
 * Where the source itself goes, item 1: null where it stands in the block,
 * as it does in every array but a ring whose radius was stretched (ARRAYS-D73).
 */
export function arraySourceItem(array: ArrayParameters): ArrayItem | null {
  if (array.kind !== "polar" || !array.sourceBase) return null
  const move = V.sub(array.basePoint, array.sourceBase)
  return V.length(move) === 0 ? null : { move, pivot: array.basePoint, turn: 0 }
}

const PATH_EPS = 1e-9

/** The path its pieces make, run in their order; null when they have no length. */
export function arrayPathOfPieces(
  pieces: readonly ArrayPathPiece[],
  closed: boolean
): ArrayPath | null {
  const length = pieces.reduce((sum, piece) => sum + pieceLength(piece), 0)
  return pieces.length > 0 && length >= PATH_EPS
    ? { pieces, length, closed }
    : null
}

/**
 * The path a line, an arc, a circle or a polyline makes, null for any other
 * object or one of no length. An open one starts at the end nearer `near`
 * (the pick, typed, snapped or a mode's last point: probes arrays/p300,
 * p303, p342, p343, p376–p378), else at its own start; a circle at its
 * angle 0, counter-clockwise, wherever it is picked (p301, p315). WHY a
 * closed polyline from its first vertex, its own way round: as the circle,
 * **unverified**.
 */
export function arrayPathOf(
  entity: Entity,
  near: Vec2 | null = null
): ArrayPath | null {
  const pieces = pathPieces(entity)
  if (pieces === null) return null
  const length = pieces.reduce((sum, piece) => sum + pieceLength(piece), 0)
  if (length < PATH_EPS) return null
  const closed =
    entity.type === "circle" || (entity.type === "polyline" && entity.closed)
  const first = pieces[0]
  const last = pieces[pieces.length - 1]
  const reversed =
    !closed &&
    near !== null &&
    V.distance(near, pieceEnd(last)) < V.distance(near, pieceStart(first))
  return {
    pieces: reversed ? pieces.map(reversePiece).reverse() : pieces,
    length,
    closed,
  }
}

function pathPieces(entity: Entity): ArrayPathPiece[] | null {
  switch (entity.type) {
    case "line":
      return [{ kind: "line", a: entity.start, b: entity.end }]
    case "circle":
      return [
        {
          kind: "arc",
          center: entity.center,
          radius: entity.radius,
          start: 0,
          sweep: Math.PI * 2,
        },
      ]
    case "arc": {
      let sweep = (entity.endAngle - entity.startAngle) % (Math.PI * 2)
      if (sweep <= PATH_EPS) sweep += Math.PI * 2
      return [
        {
          kind: "arc",
          center: entity.center,
          radius: entity.radius,
          start: entity.startAngle,
          sweep,
        },
      ]
    }
    case "polyline":
      return polylineSegmentGeometries(entity)
        .map((segment): ArrayPathPiece => {
          if (segment.kind === "line") {
            return { kind: "line", a: segment.a, b: segment.b }
          }
          const { a, center } = segment
          return {
            kind: "arc",
            center,
            radius: segment.radius,
            start: Math.atan2(a.y - center.y, a.x - center.x),
            sweep: 4 * Math.atan(segment.bulge),
          }
        })
        .filter((piece) => pieceLength(piece) > PATH_EPS)
    default:
      return null
  }
}

function pieceLength(piece: ArrayPathPiece): number {
  return piece.kind === "line"
    ? V.distance(piece.a, piece.b)
    : piece.radius * Math.abs(piece.sweep)
}

function pieceStart(piece: ArrayPathPiece): Vec2 {
  return piece.kind === "line"
    ? piece.a
    : polarPoint(piece.center, piece.radius, piece.start)
}

function pieceEnd(piece: ArrayPathPiece): Vec2 {
  return piece.kind === "line"
    ? piece.b
    : polarPoint(piece.center, piece.radius, piece.start + piece.sweep)
}

function reversePiece(piece: ArrayPathPiece): ArrayPathPiece {
  return piece.kind === "line"
    ? { kind: "line", a: piece.b, b: piece.a }
    : { ...piece, start: piece.start + piece.sweep, sweep: -piece.sweep }
}

/**
 * The point `distance` along the path and the direction it runs there, in
 * radians; at a vertex the piece it starts.
 */
export function pointAlongPath(
  path: ArrayPath,
  distance: number
): { point: Vec2; direction: number } {
  let rest = Math.min(Math.max(distance, 0), path.length)
  for (let i = 0; i < path.pieces.length; i++) {
    const piece = path.pieces[i]
    const length = pieceLength(piece)
    if (rest >= length && i < path.pieces.length - 1) {
      rest -= length
      continue
    }
    const t = Math.min(rest / length, 1)
    if (piece.kind === "line") {
      const along = V.sub(piece.b, piece.a)
      return {
        point: V.add(piece.a, V.scale(along, t)),
        direction: Math.atan2(along.y, along.x),
      }
    }
    const angle = piece.start + t * piece.sweep
    return {
      point: polarPoint(piece.center, piece.radius, angle),
      direction: angle + Math.sign(piece.sweep) * (Math.PI / 2),
    }
  }
  return { point: { x: 0, y: 0 }, direction: 0 }
}

/** How far along the path its point nearest `point` is. */
export function distanceAlongPath(path: ArrayPath, point: Vec2): number {
  let best = Infinity
  let along = 0
  let walked = 0
  for (const piece of path.pieces) {
    const length = pieceLength(piece)
    let t: number
    if (piece.kind === "line") {
      const ab = V.sub(piece.b, piece.a)
      const span = V.lengthSq(ab)
      t = span > 0 ? V.dot(V.sub(point, piece.a), ab) / span : 0
    } else {
      // The angle from the piece's start, in its sweep's sense, as a part of it.
      const angle = Math.atan2(
        point.y - piece.center.y,
        point.x - piece.center.x
      )
      const turn = Math.PI * 2
      const from = (Math.sign(piece.sweep) * (angle - piece.start)) % turn
      const swept = from < 0 ? from + turn : from
      const sweep = Math.abs(piece.sweep)
      // Past the sweep, the nearer end: the gap to the start is what is left of the turn.
      t = swept <= sweep ? swept / sweep : swept - sweep < turn - swept ? 1 : 0
    }
    t = Math.min(Math.max(t, 0), 1)
    const at = pointAlongPath(path, walked + t * length).point
    const distance = V.distance(at, point)
    if (distance < best - 1e-12) {
      best = distance
      along = walked + t * length
    }
    walked += length
  }
  return along
}

/**
 * How many items fit `spacing` apart (AutoCAD's `Maximum items`): one more
 * than the steps on an open path, the steps on a closed one, whose last
 * would land on the first (probes arrays/p06, p301, p333).
 */
export function pathArrayMaximum(path: ArrayPath, spacing: number): number {
  if (!(spacing > 0)) return 1
  const fit = Math.floor((path.length + 1e-6) / spacing)
  return Math.max(1, path.closed ? fit : fit + 1)
}

/** Divide's step: the path shared evenly, its ends both items when open (p306, p374). */
export function pathDivideStep(path: ArrayPath, items: number): number {
  if (items <= 1) return path.length
  return path.closed ? path.length / items : path.length / (items - 1)
}

/**
 * The items after the source along the path: item k is the source moved by
 * P(s_k) − P(0) and, aligned, turned about P(s_k) by how far the path's
 * direction has turned there, so the source keeps its place beside the path
 * and the rest follow it (probes arrays/p06, p302–p305, p308); Measure's
 * count is at most the maximum (p373).
 */
export function pathArrayItems(
  path: ArrayPath,
  layout: PathLayout,
  limit = Infinity
): ArrayItem[] {
  const divide = layout.method === "divide"
  const step = divide ? pathDivideStep(path, layout.items) : layout.spacing
  const count = divide
    ? layout.items
    : Math.min(layout.items, pathArrayMaximum(path, layout.spacing))
  const origin = pointAlongPath(path, 0)
  const out: ArrayItem[] = []
  for (let k = 1; k < count && out.length < limit; k++) {
    const at = pointAlongPath(path, k * step)
    out.push({
      move: V.sub(at.point, origin.point),
      pivot: at.point,
      turn: layout.align ? at.direction - origin.direction : 0,
    })
  }
  return out
}

/** The items after the source an array's parameters derive, in its block's coordinates. */
export function arrayItems(
  array: ArrayParameters,
  limit = Infinity
): ArrayItem[] {
  switch (array.kind) {
    case "rectangular":
      return rectangularArrayItems(array, limit)
    case "polar":
      return polarArrayItems(array, limit)
    case "path":
      return pathArrayItems(array.path, array, limit)
  }
}
