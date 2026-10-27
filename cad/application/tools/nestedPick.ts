import { Vec2 } from "../../geometry/Vec2"
import {
  distanceToEntity,
  Entity,
  insertGeometry,
  MAX_BLOCK_NESTING,
} from "../../domain/entities"
import { ToolContext } from "./Tool"

/**
 * The object a pick at `world` takes where the prompt reaches inside block
 * references, as DIMLINEAR's `Select object to dimension:` does (probe
 * dimensions/p148: a line in a reference scaled 2 measures 160): the
 * reference's innermost object nearest the pick, placed where the reference
 * shows it, its id the path of references to it (two references to one
 * block hold the same object). Anything else the pick takes is returned as is.
 */
export function pickNested(world: Vec2, ctx: ToolContext): Entity | null {
  let hit = ctx.pick(world)
  for (let depth = 0; depth < MAX_BLOCK_NESTING; depth++) {
    if (hit?.type !== "insert") return hit
    const parts = insertGeometry(hit, ctx.blocks(hit.blockId))
    let nearest: Entity | null = null
    let best = Infinity
    for (const part of parts) {
      const distance = distanceToEntity(part, world, ctx.blocks)
      if (distance < best) {
        best = distance
        nearest = part
      }
    }
    if (nearest === null) return hit
    hit = { ...nearest, id: `${hit.id}/${nearest.id}` }
  }
  return hit
}
