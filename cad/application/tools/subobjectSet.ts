import { Vec3 } from "../../geometry/Vec3"
import { Entity, EntityId, Solid3dEntity } from "../../domain/entities"
import { SubobjectRef } from "../../domain/solidSubobjects"
import { solidsBySubobjects } from "../../domain/solidSubobjectEdits"
import { ToolContext } from "./Tool"

/**
 * The faces, edges and vertices a command's set holds (Ctrl+click,
 * SUbobject), where its `Select objects:` takes them: MOVE, COPY, ROTATE,
 * SCALE and ERASE's (solid-edits/p241–p264). A solid the set holds whole
 * takes no part of it apart.
 */
export function takenSubobjects(
  ctx: ToolContext,
  takes: boolean,
  wholes: ReadonlySet<EntityId>
): SubobjectRef[] {
  if (!takes) return []
  return ctx.selection.subobjects().filter((ref) => !wholes.has(ref.id))
}

/** A set's parts of solids and the solids they belong to, apart from its whole objects. */
export function partsOf(
  ctx: ToolContext,
  takes: boolean,
  originals: readonly { readonly id: EntityId }[]
): { refs: SubobjectRef[]; owners: Solid3dEntity[] } {
  const refs = takenSubobjects(
    ctx,
    takes,
    new Set(originals.map((entity) => entity.id))
  )
  return { refs, owners: subobjectOwners(ctx, refs) }
}

/** The solids `refs` are parts of, each once, as the drawing holds them. */
export function subobjectOwners(
  ctx: ToolContext,
  refs: readonly SubobjectRef[]
): Solid3dEntity[] {
  const seen = new Set<EntityId>()
  const out: Solid3dEntity[] = []
  for (const { id } of refs) {
    if (seen.has(id)) continue
    seen.add(id)
    const solid = ctx.document.get(id)
    if (solid?.type === "solid3d") out.push(solid)
  }
  return out
}

/**
 * The solids reshaped by their parts carried through `map`, those the kernel
 * cannot reshape so (AutoCAD splits faces into triangles there) left as
 * they were, by id.
 */
export function reshapedOwners(
  ctx: ToolContext,
  refs: readonly SubobjectRef[],
  map: (point: Vec3) => Vec3
): { changed: Solid3dEntity[]; failed: EntityId[] } {
  return solidsBySubobjects(refs, (id) => ctx.document.get(id), map)
}

/** How long a reshape may take before the drag reuses the last one a while, in ms. */
const SLOW_RESHAPE_MS = 20
/** How long the drag reuses a slow reshape before working one out again, in ms. */
const RESHAPE_REUSE_MS = 150

/**
 * The drag's ghosts of the solids whose parts move: each reshaped, or as it
 * is where it cannot be (what the commit leaves), so the preview is the
 * commit. A reshape that goes through the booleans (a face moved along its
 * normal beside a curved face: some 75 ms) is reused for a moment rather
 * than worked out again on every move of the cursor.
 */
export class PartGhosts {
  private last: { at: number; ghosts: Map<string, Entity> } | null = null

  reset(): void {
    this.last = null
  }

  of(
    ctx: ToolContext,
    refs: readonly SubobjectRef[],
    map: (point: Vec3) => Vec3
  ): Map<string, Entity> {
    if (refs.length === 0) return new Map()
    const now = Date.now()
    if (this.last && now - this.last.at < RESHAPE_REUSE_MS) {
      return this.last.ghosts
    }
    const { changed, failed } = reshapedOwners(ctx, refs, map)
    const ghosts = new Map<string, Entity>(changed.map((s) => [s.id, s]))
    for (const id of failed) {
      const solid = ctx.document.get(id)
      if (solid) ghosts.set(id, solid)
    }
    const took = Date.now() - now
    this.last = took > SLOW_RESHAPE_MS ? { at: Date.now(), ghosts } : null
    return ghosts
  }
}

/**
 * Says what could not be reshaped, as SOLIDEDIT says a face edit the kernel
 * refuses: AutoCAD would triangulate the faces round it instead (Missing).
 */
export function sayUnreshaped(
  failed: readonly EntityId[],
  ctx: ToolContext
): void {
  if (failed.length > 0) ctx.report(ctx.text.message("modelingError"), "error")
}
