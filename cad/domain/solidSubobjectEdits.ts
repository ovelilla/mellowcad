import { Vec3 } from "../geometry/Vec3"
import { SolidBooleanError } from "../geometry/solidBooleans"
import { brepSubobjectsMapped } from "../geometry/subobjectEdits"
import { Entity, EntityId, Solid3dEntity } from "./entityTypes"
import { solidEdited } from "./solidModeling"
import { SubobjectRef } from "./solidSubobjects"

/**
 * The solids whose faces, edges or vertices `refs` name, each reshaped by
 * `map` (MOVE's translation, ROTATE's turn, SCALE's factor) as AutoCAD
 * reshapes it (`brepSubobjectsMapped`), keeping its object and losing what
 * made it: a box whose face moved is no box any more (solid-edits/p264: its
 * LIST drops `Box`). A solid the set holds whole is left to the caller; one
 * the kernel cannot reshape so is `failed`, as it was.
 */
export function solidsBySubobjects(
  refs: readonly SubobjectRef[],
  get: (id: EntityId) => Entity | undefined,
  map: (point: Vec3) => Vec3,
  wholes: ReadonlySet<EntityId> = new Set()
): { changed: Solid3dEntity[]; failed: EntityId[] } {
  const bySolid = new Map<EntityId, SubobjectRef[]>()
  for (const ref of refs) {
    if (wholes.has(ref.id)) continue
    const list = bySolid.get(ref.id) ?? []
    list.push(ref)
    bySolid.set(ref.id, list)
  }
  const changed: Solid3dEntity[] = []
  const failed: EntityId[] = []
  for (const [id, subs] of bySolid) {
    const solid = get(id)
    if (solid?.type !== "solid3d") continue
    try {
      changed.push(
        solidEdited(solid, brepSubobjectsMapped(solid.brep, subs, map))
      )
    } catch (error) {
      if (!(error instanceof SolidBooleanError)) throw error
      failed.push(id)
    }
  }
  return { changed, failed }
}

/**
 * ERASE of a solid's faces, edges or vertices: the solid stays as it is but
 * for what made it (solid-edits/p241: `1 found`, the box still 1000; p264:
 * its LIST no longer says `Box`).
 */
export function solidsErasedBySubobjects(
  refs: readonly SubobjectRef[],
  get: (id: EntityId) => Entity | undefined
): Solid3dEntity[] {
  const out = new Map<EntityId, Solid3dEntity>()
  for (const { id } of refs) {
    const solid = get(id)
    if (solid?.type !== "solid3d" || out.has(id)) continue
    if (solid.primitive === undefined && solid.sweep === undefined) continue
    out.set(id, solidEdited(solid, solid.brep))
  }
  return [...out.values()]
}
