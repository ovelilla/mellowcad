import { Vec2 } from "../geometry/Vec2"
import { DEFAULT_LAYER_ID } from "./layers"
import {
  AttributeDisplay,
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
import {
  attributeDefinitionText,
  attributeShown,
  blockAttributeText,
} from "./attributes"

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
 *
 * Attribute definitions come back as definitions and the reference's own
 * attributes are left out: "Exploding a block that contains attributes deletes
 * the attribute values and redisplays the attribute definitions."
 */
export function insertGeometry(
  insert: InsertEntity,
  block: BlockDefinition | undefined,
  options: { readonly inheritLayer?: boolean } = {}
): Entity[] {
  if (!block) return []
  const inheritLayer = options.inheritLayer ?? true
  return block.entities.map((entity) =>
    placeInReference(entity, insert, block, inheritLayer)
  )
}

/** One object of `block`'s own coordinates, where `insert` puts it. */
function placeInReference(
  entity: Entity,
  insert: InsertEntity,
  block: BlockDefinition,
  inheritLayer: boolean
): Entity {
  let placed = translateEntity(entity, {
    x: -block.basePoint.x,
    y: -block.basePoint.y,
    z: -(block.baseElevation ?? 0),
  })
  if (insert.mirrored) {
    placed = mirrorEntity(placed, BLOCK_ORIGIN, BLOCK_MIRROR_AXIS)
  }
  if (insert.scale !== 1) {
    placed = scaleEntity(placed, BLOCK_ORIGIN, insert.scale)
  }
  if (insert.rotation !== 0) {
    placed = rotateEntity(placed, BLOCK_ORIGIN, insert.rotation)
  }
  placed = translateEntity(placed, {
    ...insert.position,
    z: insert.elevation ?? 0,
  })
  return inheritLayer && placed.layerId === DEFAULT_LAYER_ID
    ? assignEntityLayer(placed, insert.layerId)
    : placed
}

/**
 * What a reference shows, one grouping level deep: the block's objects, a
 * constant attribute as its value, and the reference's own attributes — the
 * invisible ones as ATTMODE decides. A definition that asks for a value draws
 * nothing, since the reference's attribute stands in its place.
 */
function insertDisplayGeometry(
  insert: InsertEntity,
  block: BlockDefinition | undefined,
  display: AttributeDisplay
): Entity[] {
  if (!block) return []
  const out: Entity[] = []
  for (const entity of block.entities) {
    if (entity.type !== "attdef") {
      out.push(placeInReference(entity, insert, block, true))
    } else if (
      entity.modes.constant &&
      attributeShown(entity.modes.invisible, display)
    ) {
      out.push(
        placeInReference(
          attributeDefinitionText(entity, entity.value),
          insert,
          block,
          true
        )
      )
    }
  }
  for (const [index, attribute] of (insert.attributes ?? []).entries()) {
    if (!attributeShown(attribute.invisible, display)) continue
    out.push(
      placeInReference(
        blockAttributeText(attribute, `${insert.id}:${index}`),
        insert,
        block,
        true
      )
    )
  }
  return out
}

/** The point each attribute a reference shows hangs off — its Insertion snap. */
export function insertAttributePoints(
  insert: InsertEntity,
  block: BlockDefinition | undefined,
  display: AttributeDisplay
): Vec2[] {
  if (!block) return []
  return (insert.attributes ?? [])
    .filter((attribute) => attributeShown(attribute.invisible, display))
    .map((attribute) => {
      const placed = placeInReference(
        blockAttributeText(attribute, insert.id),
        insert,
        block,
        true
      )
      return placed.type === "text" ? placed.position : insert.position
    })
}

/**
 * Everything a reference draws, with nested references expanded away — the list
 * rendering, hit-testing and bounds all work from.
 */
export function insertFlatGeometry(
  insert: InsertEntity,
  blocks: BlockLookup,
  display: AttributeDisplay = blocks.attributeDisplay ?? "normal",
  depth = 0
): Entity[] {
  if (depth >= MAX_BLOCK_NESTING) return []
  const out: Entity[] = []
  for (const entity of insertDisplayGeometry(
    insert,
    blocks(insert.blockId),
    display
  )) {
    if (entity.type === "insert") {
      out.push(...insertFlatGeometry(entity, blocks, display, depth + 1))
    } else {
      out.push(entity)
    }
  }
  return out
}
