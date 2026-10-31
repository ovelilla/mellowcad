import { Vec2, V } from "../geometry/Vec2"
import type {
  ArrayParameters,
  BlockDefinition,
  InsertEntity,
  PathLayout,
  PolarArray,
  RectangularArray,
} from "./entityTypes"
import {
  MAX_ARRAY_COUNT,
  isFullTurn,
  pathArrayMaximum,
  pathDivideStep,
} from "./arrays"
import { rotatePoint } from "./entityTransforms"

const ORIGIN: Vec2 = { x: 0, y: 0 }

type Rectangular = RectangularArray & { readonly kind: "rectangular" }
type Polar = PolarArray & { readonly kind: "polar" }
type Path = Extract<ArrayParameters, { kind: "path" }>

/**
 * How a reference lays its block's coordinates, where an array's parameters
 * are (ARRAYS-D8), into its own: the block's base point onto `position`,
 * scaled on X and Y and turned about it, as `insertGeometry` places objects.
 */
export interface ArrayPlacement {
  /** The block's base point. */
  readonly origin: Vec2
  readonly position: Vec2
  readonly rotation: number
  readonly scaleX: number
  readonly scaleY: number
}

/** A reference's placement of its block (the block missing, its base point taken as the position's). */
export function arrayPlacement(
  insert: InsertEntity,
  block: BlockDefinition | undefined
): ArrayPlacement {
  return {
    origin: block?.basePoint ?? insert.position,
    position: insert.position,
    rotation: insert.rotation,
    scaleX: insert.scaleX,
    scaleY: insert.scaleY,
  }
}

/** A length of the block's, in the reference's units: at X's scale. */
export function placedLength(place: ArrayPlacement, length: number): number {
  return length * Math.abs(place.scaleX)
}

/** A direction of the block's, in the reference's coordinates (its length scaled). */
export function placeArrayVector(place: ArrayPlacement, v: Vec2): Vec2 {
  return rotatePoint(
    { x: v.x * place.scaleX, y: v.y * place.scaleY },
    ORIGIN,
    place.rotation
  )
}

/** A point of the block's, where the reference puts it. */
export function placeArrayPoint(place: ArrayPlacement, point: Vec2): Vec2 {
  return V.add(
    place.position,
    placeArrayVector(place, V.sub(point, place.origin))
  )
}

/** A point of the reference's coordinates, in its block's. */
export function arrayPointOf(place: ArrayPlacement, point: Vec2): Vec2 {
  const v = rotatePoint(V.sub(point, place.position), ORIGIN, -place.rotation)
  return V.add(place.origin, { x: v.x / place.scaleX, y: v.y / place.scaleY })
}

/** Whether `n` is a count an array takes: an integer from 1 to 32767 (probe arrays/p279). */
export function isArrayCount(n: number): boolean {
  return Number.isInteger(n) && n >= 1 && n <= MAX_ARRAY_COUNT
}

/** The grid with these counts, null for one an array refuses. */
export function withGridCounts(
  grid: Rectangular,
  columns: number,
  rows: number
): Rectangular | null {
  return isArrayCount(columns) && isArrayCount(rows)
    ? { ...grid, columns, rows }
    : null
}

/** The grid with this many levels, null for a count an array refuses. */
export function withGridLevels(
  grid: Rectangular,
  levels: number
): Rectangular | null {
  return isArrayCount(levels) ? { ...grid, levels } : null
}

/**
 * The grid with a distance between columns, rows or levels, which refuses 0
 * (ARRAYS-D11; the levels' as ARRAYRECT's, p431).
 */
export function withGridSpacing(
  grid: Rectangular,
  along: "column" | "row" | "level",
  spacing: number
): Rectangular | null {
  if (!Number.isFinite(spacing) || spacing === 0) return null
  switch (along) {
    case "column":
      return { ...grid, colSpacing: spacing }
    case "row":
      return { ...grid, rowSpacing: spacing }
    case "level":
      return { ...grid, levelSpacing: spacing }
  }
}

const FULL_TURN = 360

/** The ring with `items` items, its fill kept (desktop arrays/d20c: 8 over 360 are 45 apart). */
export function withRingItems(ring: Polar, items: number): Polar | null {
  return isArrayCount(items) ? { ...ring, items } : null
}

/**
 * The ring with `degrees` between items: the fill that many steps, a whole
 * turn once they reach it, refused past it (desktop arrays/d15c, d15e, d20d;
 * ARRAYPOLAR's Angle between likewise, p267–p271).
 */
export function withRingAngleBetween(
  ring: Polar,
  degrees: number
): Polar | null {
  if (!(degrees > 0)) return null
  const span = degrees * Math.max(ring.items - 1, 1)
  if (span > FULL_TURN + 1e-9) return null
  return { ...ring, fill: isFullTurn(span) ? FULL_TURN : span }
}

/** The ring filling `degrees`, its count kept (desktop arrays/d20e: 180 over 6 is 36 apart). */
export function withRingFill(ring: Polar, degrees: number): Polar | null {
  return degrees > 0 && degrees <= FULL_TURN + 1e-9
    ? { ...ring, fill: Math.min(degrees, FULL_TURN) }
    : null
}

/**
 * The ring at `radius`: the base point along its own ray from the centre,
 * never turned, the source following it (desktop arrays/d15a, d15d, d20f;
 * ARRAYS-D73). Back where the source stands, nothing records it.
 */
export function withRingRadius(ring: Polar, radius: number): Polar | null {
  const ray = V.sub(ring.basePoint, ring.center)
  const length = V.length(ray)
  if (!(radius > 0) || !Number.isFinite(radius) || length < 1e-12) return null
  const basePoint = V.add(ring.center, V.scale(ray, radius / length))
  const { sourceBase, ...rest } = ring
  const anchor = sourceBase ?? ring.basePoint
  return V.distance(basePoint, anchor) < 1e-12
    ? { ...rest, basePoint: anchor }
    : { ...rest, basePoint, sourceBase: anchor }
}

/**
 * The path array `spacing` apart, with as many items as fit (desktop
 * arrays/d16b: 10.08 on an 80 path is 8; d20h: 10 is 9); refused when they
 * would be more than an array takes.
 */
export function withPathSpacing(array: Path, spacing: number): Path | null {
  if (!(spacing > 0) || !Number.isFinite(spacing)) return null
  const items = pathArrayMaximum(array.path, spacing)
  return isArrayCount(items) ? { ...array, spacing, items } : null
}

/**
 * The path array with `items` items; by Measure at most as many as fit, as
 * ARRAYPATH takes a count over the maximum (probe arrays/p373; the palette's
 * own edit, d20g, **unverified**).
 */
export function withPathItems(array: Path, items: number): Path | null {
  if (!isArrayCount(items)) return null
  return {
    ...array,
    items:
      array.method === "measure"
        ? Math.min(items, pathArrayMaximum(array.path, array.spacing))
        : items,
  }
}

/** The path array by `method`, Measure going on from Divide's spacing (probe arrays/p334). */
export function withPathMethod(
  array: Path,
  method: PathLayout["method"]
): Path {
  if (method === array.method) return array
  return method === "measure"
    ? { ...array, method, spacing: pathDivideStep(array.path, array.items) }
    : { ...array, method }
}

/** How many items a path array shows: by Measure no more than fit. */
export function pathArrayCount(array: Path): number {
  return array.method === "measure"
    ? Math.min(array.items, pathArrayMaximum(array.path, array.spacing))
    : array.items
}

/** The distance between a path array's items: Measure's, or Divide's even share. */
export function pathArraySpacing(array: Path): number {
  return array.method === "measure"
    ? array.spacing
    : pathDivideStep(array.path, array.items)
}
