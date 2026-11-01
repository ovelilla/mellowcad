import { Brep } from "../geometry/solids"
import {
  SolidBooleanError,
  SolidOperation,
  brepBoolean,
} from "../geometry/solidBooleans"
import { EntityId, Solid3dEntity } from "./entityTypes"

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
function resulting(first: Solid3dEntity, brep: Brep): Solid3dEntity {
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
  return { ...NOTHING, changed: [resulting(first, brep)], erased }
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
  return { ...NOTHING, changed: [resulting(first, brep)], erased }
}
