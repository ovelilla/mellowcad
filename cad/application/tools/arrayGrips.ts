import { Vec2, V } from "../../geometry/Vec2"
import type { ArrayParameters } from "../../domain/entities"
import {
  distanceAlongPath,
  polarAngleBetween,
  pointAlongPath,
} from "../../domain/arrays"
import {
  ArrayPlacement,
  arrayPointOf,
  placeArrayPoint,
  placeArrayVector,
  withGridCounts,
  withGridSpacing,
  withPathSpacing,
  withRingAngleBetween,
  withRingRadius,
  placedLength,
} from "../../domain/arrayEdits"
import { rotatePoint } from "../../domain/entityTransforms"
import { normalizeDegrees } from "../../geometry/primitives"
import type { DynamicField } from "../input/DynamicInput"

/**
 * What an array's grip edits (desktop arrays/d11, d14–d16, ARRAYS-D70–D74):
 * - `move` — a rectangular or path array's base square, a polar one's centre:
 *   moves the array.
 * - `columnSpacing`, `rowSpacing` — the arrow at the second column (row): the
 *   distance between them.
 * - `columnCount`, `rowCount` — the arrow at the last column (row): how many.
 * - `counts` — the square at the grid's far corner: both counts.
 * - `radius` — a polar array's base square: Stretch Radius.
 * - `angleBetween` — the arrow at a ring's second item.
 * - `itemSpacing` — the arrow a path array's spacing along its path.
 */
export type ArrayGripRole =
  | "move"
  | "columnSpacing"
  | "columnCount"
  | "rowSpacing"
  | "rowCount"
  | "counts"
  | "radius"
  | "angleBetween"
  | "itemSpacing"

/**
 * The box a hot array grip opens, at `Command:` and at the arrays' main
 * prompt alike: its count, spacing, radius or angle, as a number typed there
 * sets it (desktop arrays/d17: `Columns = 6`). The corner opens none: what one
 * number typed there would set is **unverified**; nor does a move grip.
 */
export const ARRAY_GRIP_FIELDS: Readonly<
  Record<
    Exclude<ArrayGripRole, "move">,
    Pick<DynamicField, "prompt" | "kind"> | null
  >
> = {
  columnSpacing: { prompt: "columnSpacing", kind: "distance" },
  columnCount: { prompt: "columns", kind: "number" },
  rowSpacing: { prompt: "rowSpacing", kind: "distance" },
  rowCount: { prompt: "rows", kind: "number" },
  counts: null,
  radius: { prompt: "radius", kind: "distance" },
  angleBetween: { prompt: "angle", kind: "angle" },
  itemSpacing: { prompt: "spacing", kind: "distance" },
}

export interface ArrayGrip {
  readonly role: ArrayGripRole
  /** In the reference's own coordinates, as its position. */
  readonly at: Vec2
  /** An arrow's heading, a unit vector in the same coordinates; none on a square. */
  readonly along?: Vec2
}

/**
 * An array's grips where the reference shows them (desktop arrays/d11):
 * rectangular — the base square, arrows at the second and last column and
 * row, a square at the far corner; polar — squares at the base point and the
 * centre, an arrow at the second item round the ring; path — the base square
 * at the path's start and, by Measure, an arrow the spacing along it. A count
 * arrow that would sit on the base (one column) is left out, the corner with
 * it (ARRAYS-D74, **unverified**), and so is the path's arrow by Divide (D74).
 */
export function arrayGrips(
  array: ArrayParameters,
  place: ArrayPlacement
): ArrayGrip[] {
  const at = (point: Vec2) => placeArrayPoint(place, point)
  const heading = (v: Vec2) => V.normalize(placeArrayVector(place, v))
  switch (array.kind) {
    case "rectangular": {
      const base = place.origin
      const across = V.perpendicular(array.axis)
      const column = V.scale(array.axis, array.colSpacing)
      const row = V.scale(across, array.rowSpacing)
      const lastColumn = V.scale(column, array.columns - 1)
      const lastRow = V.scale(row, array.rows - 1)
      const grips: ArrayGrip[] = [
        { role: "move", at: at(base) },
        {
          role: "columnSpacing",
          at: at(V.add(base, column)),
          along: heading(column),
        },
      ]
      if (array.columns > 1) {
        grips.push({
          role: "columnCount",
          at: at(V.add(base, lastColumn)),
          along: heading(column),
        })
      }
      grips.push({
        role: "rowSpacing",
        at: at(V.add(base, row)),
        along: heading(row),
      })
      if (array.rows > 1) {
        grips.push({
          role: "rowCount",
          at: at(V.add(base, lastRow)),
          along: heading(row),
        })
      }
      if (array.columns > 1 && array.rows > 1) {
        grips.push({
          role: "counts",
          at: at(V.add(V.add(base, lastColumn), lastRow)),
        })
      }
      return grips
    }
    case "polar": {
      const grips: ArrayGrip[] = [
        { role: "radius", at: at(array.basePoint) },
        { role: "move", at: at(array.center) },
      ]
      if (array.items > 1) {
        const step = ringStep(array)
        const second = rotatePoint(array.basePoint, array.center, step)
        const ray = V.sub(second, array.center)
        grips.push({
          role: "angleBetween",
          at: at(second),
          along: heading(
            step < 0 ? V.perpendicular(V.scale(ray, -1)) : V.perpendicular(ray)
          ),
        })
      }
      return grips
    }
    case "path": {
      const start = pointAlongPath(array.path, 0).point
      const grips: ArrayGrip[] = [{ role: "move", at: at(start) }]
      if (array.method === "measure") {
        const spot = pointAlongPath(array.path, array.spacing)
        grips.push({
          role: "itemSpacing",
          at: at(spot.point),
          along: heading({
            x: Math.cos(spot.direction),
            y: Math.sin(spot.direction),
          }),
        })
      }
      return grips
    }
  }
}

/** The signed turn, in radians, from one of a ring's items to the next. */
function ringStep(ring: Extract<ArrayParameters, { kind: "polar" }>): number {
  const between = (polarAngleBetween(ring) * Math.PI) / 180
  return ring.clockwise ? -between : between
}

/**
 * The parameters a grip dragged to `cursor` (in the reference's coordinates)
 * makes, null where the drag is refused and the grip stays hot (a count past
 * 32767, a ring past a turn, a spacing of 0: ARRAYS-D72). Measured in the
 * block's coordinates, so a turned, scaled or mirrored array drags as it
 * shows. `move` is no edit of the parameters: null.
 * - the count arrows: `floor(|d| / |s|) + 1`, d the cursor's projection on
 *   the axis from the base, the spacing taking d's sign (d14a–d14c, d14e,
 *   d14k); the corner both (d14g);
 * - the spacing arrows: the projection itself (d14i, d14j);
 * - the polar base: the radius, `|cursor − centre|` (d15a, d15d);
 * - the angle arrow: the angle at the centre from the base point to the
 *   cursor, in the ring's direction (d15c, d15e);
 * - the path arrow: the distance along the path to the cursor, the items as
 *   many as fit (d16b).
 */
export function dragArrayGrip(
  array: ArrayParameters,
  place: ArrayPlacement,
  role: ArrayGripRole,
  cursor: Vec2
): ArrayParameters | null {
  const c = arrayPointOf(place, cursor)
  switch (array.kind) {
    case "rectangular": {
      const from = V.sub(c, place.origin)
      const alongColumns = V.dot(from, array.axis)
      const alongRows = V.dot(from, V.perpendicular(array.axis))
      const count = (d: number, spacing: number) =>
        Math.floor(Math.abs(d) / Math.abs(spacing) + 1e-9) + 1
      const signed = (d: number, spacing: number) =>
        d < 0 ? -Math.abs(spacing) : d > 0 ? Math.abs(spacing) : spacing
      switch (role) {
        case "columnSpacing":
          return withGridSpacing(array, "column", alongColumns)
        case "rowSpacing":
          return withGridSpacing(array, "row", alongRows)
        case "columnCount":
          return withGridCounts(
            {
              ...array,
              colSpacing: signed(alongColumns, array.colSpacing),
            },
            count(alongColumns, array.colSpacing),
            array.rows
          )
        case "rowCount":
          return withGridCounts(
            { ...array, rowSpacing: signed(alongRows, array.rowSpacing) },
            array.columns,
            count(alongRows, array.rowSpacing)
          )
        case "counts":
          return withGridCounts(
            {
              ...array,
              colSpacing: signed(alongColumns, array.colSpacing),
              rowSpacing: signed(alongRows, array.rowSpacing),
            },
            count(alongColumns, array.colSpacing),
            count(alongRows, array.rowSpacing)
          )
        default:
          return null
      }
    }
    case "polar":
      if (role === "radius") {
        return withRingRadius(array, V.distance(c, array.center))
      }
      if (role === "angleBetween") {
        const angleOf = (p: Vec2) =>
          (Math.atan2(p.y - array.center.y, p.x - array.center.x) * 180) /
          Math.PI
        const turn = angleOf(c) - angleOf(array.basePoint)
        return withRingAngleBetween(
          array,
          normalizeDegrees(array.clockwise ? -turn : turn)
        )
      }
      return null
    case "path":
      return role === "itemSpacing"
        ? withPathSpacing(array, distanceAlongPath(array.path, c))
        : null
  }
}

/**
 * The parameters a value typed while a grip is hot makes, in the
 * reference's units: the count, the spacing, the radius or the angle
 * between (desktop arrays/d17 for a count; the others **unverified**,
 * ARRAYS-D72). The corner takes no typed value; null where refused.
 */
export function typedArrayGrip(
  array: ArrayParameters,
  place: ArrayPlacement,
  role: ArrayGripRole,
  value: number
): ArrayParameters | null {
  const length = value / placedLength(place, 1)
  switch (array.kind) {
    case "rectangular":
      switch (role) {
        case "columnCount":
          return withGridCounts(array, value, array.rows)
        case "rowCount":
          return withGridCounts(array, array.columns, value)
        case "columnSpacing":
          return withGridSpacing(array, "column", length)
        case "rowSpacing":
          return withGridSpacing(array, "row", length)
        default:
          return null
      }
    case "polar":
      if (role === "radius") return withRingRadius(array, length)
      if (role === "angleBetween") return withRingAngleBetween(array, value)
      return null
    case "path":
      return role === "itemSpacing" ? withPathSpacing(array, length) : null
  }
}

/** What a hot grip's box reads: the value it sets, in the reference's units. */
export function arrayGripValue(
  array: ArrayParameters,
  place: ArrayPlacement,
  role: ArrayGripRole
): number | null {
  switch (array.kind) {
    case "rectangular":
      switch (role) {
        case "columnCount":
          return array.columns
        case "rowCount":
          return array.rows
        case "columnSpacing":
          return placedLength(place, array.colSpacing)
        case "rowSpacing":
          return placedLength(place, array.rowSpacing)
        default:
          return null
      }
    case "polar":
      if (role === "radius") {
        return placedLength(place, V.distance(array.basePoint, array.center))
      }
      return role === "angleBetween" ? polarAngleBetween(array) : null
    case "path":
      return role === "itemSpacing" ? placedLength(place, array.spacing) : null
  }
}
