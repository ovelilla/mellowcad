import { Vec2, V } from "../geometry/Vec2"
import { DEFAULT_LAYER_ID } from "./layers"
import {
  BlockDefinition,
  BlockLookup,
  InsertEntity,
  Entity,
} from "./entityTypes"
import { assignEntityLayer } from "./entityOverrides"
import {
  translateEntity,
  rotateEntity,
  scaleEntity,
  mirrorEntity,
} from "./entityTransforms"

/**
 * How deep block references may nest before the expansion gives up. AutoCAD
 * forbids a block from referencing itself; a hand-edited file can still say so,
 * and this is what keeps that from hanging the renderer.
 */
export const MAX_BLOCK_NESTING = 8

const BLOCK_ORIGIN: Vec2 = { x: 0, y: 0 }

/** The +Y axis through the origin: reflecting across it negates X. */
const BLOCK_MIRROR_AXIS: Vec2 = { x: 0, y: 1 }

/**
 * The definition's entities placed in the drawing by one reference — a single
 * grouping level, which is what EXPLODE removes ("Removes one grouping level at
 * a time"), so a nested block comes back as a nested block.
 *
 * Objects drawn **on layer 0 inherit the reference's layer**: "if you want
 * objects in a block to inherit properties from the current layer, create them
 * on layer 0 with ByLayer properties". Anything on another layer, or carrying
 * its own override, keeps what it had. That inheritance is how a reference is
 * *displayed*, so EXPLODE turns it off (`inheritLayer: false`): the objects
 * "revert to their original properties", back onto layer 0.
 */
export function insertGeometry(
  insert: InsertEntity,
  block: BlockDefinition | undefined,
  options: { readonly inheritLayer?: boolean } = {}
): Entity[] {
  if (!block) return []
  const inheritLayer = options.inheritLayer ?? true
  return block.entities.map((entity) => {
    let placed = translateEntity(entity, V.scale(block.basePoint, -1))
    if (insert.mirrored) {
      placed = mirrorEntity(placed, BLOCK_ORIGIN, BLOCK_MIRROR_AXIS)
    }
    if (insert.scale !== 1) {
      placed = scaleEntity(placed, BLOCK_ORIGIN, insert.scale)
    }
    if (insert.rotation !== 0) {
      placed = rotateEntity(placed, BLOCK_ORIGIN, insert.rotation)
    }
    placed = translateEntity(placed, insert.position)
    return inheritLayer && placed.layerId === DEFAULT_LAYER_ID
      ? assignEntityLayer(placed, insert.layerId)
      : placed
  })
}

/**
 * Everything a reference draws, with nested references expanded away — the list
 * rendering, hit-testing and bounds all work from.
 */
export function insertFlatGeometry(
  insert: InsertEntity,
  blocks: BlockLookup,
  depth = 0
): Entity[] {
  if (depth >= MAX_BLOCK_NESTING) return []
  const out: Entity[] = []
  for (const entity of insertGeometry(insert, blocks(insert.blockId))) {
    if (entity.type === "insert") {
      out.push(...insertFlatGeometry(entity, blocks, depth + 1))
    } else {
      out.push(entity)
    }
  }
  return out
}
