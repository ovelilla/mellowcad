import { Brep } from "../geometry/solids"
import {
  SolidBooleanError,
  SolidOperation,
  brepBoolean,
} from "../geometry/solidBooleans"
import {
  CutPlane,
  brepFacesExtruded,
  brepFacesOffset,
  brepSection,
  brepSliced,
} from "../geometry/solidEdits"
import { EntityId, RegionEntity, Solid3dEntity } from "./entityTypes"
import { nextEntityId } from "./entityIds"
import { LayerId } from "./layers"
import { createRegion } from "./regions"
import { withElevation, withNormal } from "./elevation"

/**
 * What a boolean of solids leaves: the solid changed (keeping its id and
 * every property of its own, union/s07), the ids erased, whether the result
 * came to nothing — "Null solid created - deleted", the solids erased
 * (union/s02, s08) — and whether it could not be made, the solids then left
 * as they were.
 */
export interface SolidOutcome {
  readonly changed: readonly Solid3dEntity[]
  readonly erased: readonly EntityId[]
  readonly nullResult: boolean
  readonly failed: boolean
}

const NOTHING: SolidOutcome = {
  changed: [],
  erased: [],
  nullResult: false,
  failed: false,
}

/**
 * A combined solid keeps the first's object; what made it is gone: LIST
 * says History = None and no Solid type (union/k01, s07).
 */
export function solidEdited(first: Solid3dEntity, brep: Brep): Solid3dEntity {
  const { primitive, sweep, ...rest } = first
  void primitive
  void sweep
  return { ...rest, brep }
}

function folded(
  op: SolidOperation,
  start: Brep | null,
  others: readonly Brep[]
): Brep | null | "failed" {
  let brep = start
  for (const other of others) {
    if (!brep) {
      if (op === "union") brep = other
      continue
    }
    try {
      brep = brepBoolean(op, brep, other)
    } catch (error) {
      if (error instanceof SolidBooleanError) return "failed"
      throw error
    }
  }
  return brep
}

/**
 * UNION or INTERSECT of solids: all of them become the first (union/s04:
 * six solids, touching and apart, one solid of three shells), the others
 * erased. `null` with fewer than two — the caller's "At least 2 solids…"
 * when no plane of regions has two either (s05, s10).
 */
export function combineSolids(
  op: Exclude<SolidOperation, "subtract">,
  solids: readonly Solid3dEntity[]
): SolidOutcome | null {
  if (solids.length < 2) return null
  const [first, ...rest] = solids
  const brep = folded(
    op,
    first.brep,
    rest.map((s) => s.brep)
  )
  if (brep === "failed") return { ...NOTHING, failed: true }
  const erased = rest.map((s) => s.id)
  if (!brep) {
    return { ...NOTHING, erased: [first.id, ...erased], nullResult: true }
  }
  return { ...NOTHING, changed: [solidEdited(first, brep)], erased }
}

/**
 * SUBTRACT of solids: the first set's joined into its first (union/s03:
 * two boxes apart, one solid of two shells) and every solid of the second
 * set taken out of it and erased. Nothing to take, or nothing to take it
 * from, leaves them alone.
 */
export function subtractSolids(
  from: readonly Solid3dEntity[],
  subtract: readonly Solid3dEntity[]
): SolidOutcome {
  const bases = new Set(from.map((s) => s.id))
  const tools = subtract.filter((s) => !bases.has(s.id))
  if (from.length === 0 || tools.length === 0) return NOTHING
  const [first, ...rest] = from
  const joined = folded(
    "union",
    first.brep,
    rest.map((s) => s.brep)
  )
  if (joined === "failed") return { ...NOTHING, failed: true }
  const brep = folded(
    "subtract",
    joined,
    tools.map((s) => s.brep)
  )
  if (brep === "failed") return { ...NOTHING, failed: true }
  const erased = [...rest.map((s) => s.id), ...tools.map((s) => s.id)]
  if (!brep) {
    return { ...NOTHING, erased: [first.id, ...erased], nullResult: true }
  }
  return { ...NOTHING, changed: [solidEdited(first, brep)], erased }
}

/** Which side of a cut SLICE keeps: the one the plane's normal points to, the other, or both. */
export type SliceSide = "front" | "back" | "both"

/**
 * SLICE of a solid by a plane (slice/s01–s12): the side kept keeps its
 * object, with "both" the front one (the side the normal points to, s01,
 * s03, s05), the back one a new object of the same layer and properties
 * (s09); either loses what made it (`History = None`, no Solid type, s01).
 * "missed" where the plane leaves it whole on one side — on a face, along an
 * edge or past it (s07: `Slicing plane does not intersect the selected
 * solid.`), "failed" where the kernel cannot cut it.
 */
export function sliceSolid(
  solid: Solid3dEntity,
  plane: CutPlane,
  side: SliceSide
):
  | { changed: Solid3dEntity; added: Solid3dEntity | null }
  | "missed"
  | "failed" {
  let halves
  try {
    halves = brepSliced(solid.brep, plane)
  } catch (error) {
    if (error instanceof SolidBooleanError) return "failed"
    throw error
  }
  const { front, back } = halves
  if (!front || !back) return "missed"
  if (side === "front")
    return { changed: solidEdited(solid, front), added: null }
  if (side === "back") return { changed: solidEdited(solid, back), added: null }
  return {
    changed: solidEdited(solid, front),
    added: { ...solidEdited(solid, back), id: nextEntityId() },
  }
}

/**
 * SECTION of a solid: the region where the plane cuts it, of `layerId`, in
 * the plane's OCS (section/c01–c09), or null where it misses it or only
 * touches it on an edge. Throws `SolidBooleanError`.
 */
export function solidSection(
  solid: Solid3dEntity,
  plane: CutPlane,
  layerId: LayerId
): RegionEntity | null {
  const section = brepSection(solid.brep, plane)
  if (!section) return null
  return withNormal(
    withElevation(createRegion(section.faces, layerId), section.elevation),
    section.normal
  )
}

/**
 * PRESSPULL on faces of a solid (its help; desktop): extruded — each face's
 * prism added or taken out, its neighbours left — or, Ctrl held, offset, its
 * neighbours carried on (solidedit/e01–e03). The solid keeps its object and
 * loses what made it (LIST: `History = None`, no Solid type). Null where the
 * kernel cannot make it, or nothing would be left.
 */
export function pressPulledSolid(
  solid: Solid3dEntity,
  faces: readonly number[],
  distance: number,
  offset: boolean
): Solid3dEntity | null {
  try {
    const brep = offset
      ? brepFacesOffset(solid.brep, faces, distance)
      : brepFacesExtruded(solid.brep, faces, distance)
    return brep ? solidEdited(solid, brep) : null
  } catch (error) {
    if (error instanceof SolidBooleanError) return null
    throw error
  }
}
