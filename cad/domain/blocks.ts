import { Vec2, V } from "../geometry/Vec2"
import { Vec3 } from "../geometry/Vec3"
import { Linear2, applyLinear } from "../geometry/linear"
import {
  entityAxes,
  entityPointToWorld,
  isTilted,
  scaleEntityZ,
} from "./elevation"
import { DEFAULT_LAYER_ID } from "./layers"
import {
  AttributeDisplay,
  BlockDefinition,
  HatchEntity,
  BlockId,
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
  transformEntity,
} from "./entityTransforms"
import {
  attributeDefinitionText,
  attributeShown,
  blockAttributeText,
} from "./attributes"
import { arrayItems, arraySourceItem, placeArrayItem } from "./arrays"
import { framedPattern, insertLinear, linearEntity } from "./entityAffine"

/**
 * How deep block references may nest before the expansion gives up. AutoCAD
 * forbids a block from referencing itself; a hand-edited file can still say so,
 * and this is what keeps that from hanging the renderer.
 */
export const MAX_BLOCK_NESTING = 8

const BLOCK_ORIGIN: Vec2 = { x: 0, y: 0 }

/** A point on the +Y axis: reflecting across it negates X. */
const BLOCK_Y_AXIS: Vec2 = { x: 0, y: 1 }

/** A point on the +X axis: reflecting across it negates Y. */
const BLOCK_X_AXIS: Vec2 = { x: 1, y: 0 }

/**
 * Whether a block is anonymous, as an array's is (`*U2`, probe arrays/p400):
 * the drawing makes and names it, so no list a user reads shows it and no
 * name a user types reaches it; only -PURGE's wild cards do (blocks/p147).
 */
export function isAnonymousBlock(name: string): boolean {
  return name.startsWith("*")
}

/**
 * The block named `name`, whatever its case: a block's name is matched
 * case-blind and keeps the spelling it was defined with (probes blocks/p115,
 * p210), as every symbol table's name is.
 */
export function findBlockNamed(
  blocks: Iterable<BlockDefinition>,
  name: string
): BlockDefinition | undefined {
  const wanted = name.toUpperCase()
  for (const block of blocks) {
    if (block.name.toUpperCase() === wanted) return block
  }
  return undefined
}

/**
 * The blocks in use: placed by a reference among `entities`, or by one in the
 * definition of a block in use, at any depth. A block nested only in unused
 * ones is unused, so PURGE takes a whole chain in one run (probes blocks/p142,
 * p150). The one test of "in use": the block table and PURGE ask it alike.
 */
export function blocksInUse(
  entities: Iterable<Entity>,
  lookup: BlockLookup
): Set<BlockId> {
  const used = new Set<BlockId>()
  const pending: BlockId[] = []
  const reach = (entity: Entity) => {
    if (entity.type !== "insert" || used.has(entity.blockId)) return
    used.add(entity.blockId)
    pending.push(entity.blockId)
  }
  for (const entity of entities) reach(entity)
  for (let id = pending.pop(); id !== undefined; id = pending.pop()) {
    for (const entity of lookup(id)?.entities ?? []) reach(entity)
  }
  return used
}

/**
 * The blocks of the table `blocks` a purge of those `wanted` takes, in the
 * table's order: each one `entities` (a drawing's) leave unused, anonymous
 * ones included (probe blocks/p147), and that no definition the purge keeps
 * holds at any depth, so no reference left draws nothing (p150). A chain of
 * unused blocks all wanted goes in one run (p142).
 */
export function purgeableBlocks(
  blocks: readonly BlockDefinition[],
  entities: Iterable<Entity>,
  wanted: (block: BlockDefinition) => boolean = () => true
): BlockDefinition[] {
  const table = new Map(blocks.map((block) => [block.id, block]))
  const lookup = (id: BlockId) => table.get(id)
  const used = blocksInUse(entities, lookup)
  const asked = new Set(
    blocks
      .filter((block) => !used.has(block.id) && wanted(block))
      .map((block) => block.id)
  )
  const held = blocksInUse(
    blocks
      .filter((block) => !asked.has(block.id))
      .flatMap((block) => block.entities),
    lookup
  )
  return blocks.filter((block) => asked.has(block.id) && !held.has(block.id))
}

/** The lowest `*U<n>` no block in `blocks` is named. */
export function anonymousBlockName(blocks: Iterable<{ name: string }>): string {
  const taken = new Set<string>()
  for (const block of blocks) taken.add(block.name.toUpperCase())
  let n = 1
  while (taken.has(`*U${n}`)) n++
  return `*U${n}`
}

/**
 * The objects a reference places, in its block's coordinates: the block's
 * own, and on an array each item's after them, item by item, the source being
 * item 1 (probes arrays/p402, p415, p418: what EXPLODE gives, in that order).
 * WHY no cap on the items: EXPLODE must give every one, and AutoCAD takes
 * any count up to 32767 each way (probe arrays/p279); a huge array costs what
 * as many loose copies cost to draw and pick.
 */
function referencedObjects(
  insert: InsertEntity,
  block: BlockDefinition
): readonly Entity[] {
  if (!insert.array) return block.entities
  const first = arraySourceItem(insert.array)
  const out = first
    ? block.entities.map((entity) => placeArrayItem(entity, first))
    : [...block.entities]
  for (const item of arrayItems(insert.array)) {
    for (const entity of block.entities) out.push(placeArrayItem(entity, item))
  }
  return out
}

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
  return referencedObjects(insert, block).map((entity) =>
    placeInReference(entity, insert, block, inheritLayer, "exploded")
  )
}

/**
 * What a hatch's pattern does in a reference that reflects or stretches its
 * block: `"shown"`, it is drawn through the reference's map with the rest
 * (plots blocks/p230, p231: ANSI31's lines at 135° in one at X −1); `"exploded"`,
 * the hatch EXPLODE leaves keeps its own angle and lattice (p227, p228:
 * PatternAngle 0, its lines on the lattice through the origin).
 */
type PatternPlacement = "shown" | "exploded"

/** One object of `block`'s own coordinates, where `insert` puts it. */
function placeInReference(
  entity: Entity,
  insert: InsertEntity,
  block: BlockDefinition,
  inheritLayer: boolean,
  pattern: PatternPlacement
): Entity {
  let placed = translateEntity(entity, {
    x: -block.basePoint.x,
    y: -block.basePoint.y,
    z: -(block.baseElevation ?? 0),
  })
  const { scaleX, scaleY } = insert
  const scale = Math.abs(scaleX)
  const reflects = scaleX * scaleY < 0
  // WHY the similarity path whenever it applies: it keeps every uniform
  // reference to the bit (the landing's snapshots), and is the one that knows
  // MIRRTEXT's readable text.
  const linear =
    scale !== Math.abs(scaleY) || (reflects && placed.type === "hatch")
      ? linearInReference(placed, insert, pattern)
      : null
  placed = linear ?? similarInReference(placed, scaleX, scaleY, insert.rotation)
  placed = translateEntity(placed, {
    ...insert.position,
    z: insert.elevation ?? 0,
  })
  // Placed so far in the reference's own coordinates: its plane turns them
  // into the world's.
  if (insert.normal) {
    placed = transformEntity(placed, {
      rotation: entityAxes(insert),
      scale: 1,
      translation: { x: 0, y: 0, z: 0 },
    })
  }
  if (
    linear &&
    pattern === "exploded" &&
    placed.type === "hatch" &&
    entity.type === "hatch"
  ) {
    placed = keptPattern(placed, entity, scale)
  }
  return inheritLayer && placed.layerId === DEFAULT_LAYER_ID
    ? assignEntityLayer(placed, insert.layerId)
    : placed
}

/**
 * `entity` of the block, about its base point, through a reference whose map
 * is no similarity (or reflects a hatch): the affine map where the type has a
 * closed form, its Z at X's scale (the Z factor is |X|, probe blocks/p203).
 * Text, an MTEXT, an attribute and anything tilted are drawn at X's scale
 * instead, their point where the map puts it: a gap (INSERT's Missing).
 */
function linearInReference(
  entity: Entity,
  insert: InsertEntity,
  pattern: PatternPlacement
): Entity {
  const { scaleX, scaleY, rotation } = insert
  const scale = Math.abs(scaleX)
  const map = insertLinear(rotation, scaleX, scaleY)
  const mapped = isTilted(entity) ? null : linearEntity(entity, map, scale)
  if (mapped === null) return atScaleOfX(entity, insert, map)
  const placed = scaleEntityZ(mapped, 0, scale)
  return placed.type === "hatch" &&
    entity.type === "hatch" &&
    pattern === "shown"
    ? { ...placed, patternFrame: framedPattern(entity, map) }
    : placed
}

/**
 * The hatch EXPLODE leaves of `source`, a hatch of the block, from a
 * reference that reflects or stretches it: its loops placed, its pattern the
 * definition's own angle and origin, unmoved (probes blocks/p227, p228: the
 * lines on the lattice through the origin, wherever the reference stands).
 */
function keptPattern(
  placed: HatchEntity,
  source: HatchEntity,
  scale: number
): HatchEntity {
  return {
    ...placed,
    patternAngle: source.patternAngle,
    origin: source.origin,
    // WHY scaled: unverified, p227's reference being at X −1; the lattice
    // follows the size the reference draws at.
    patternScale: source.patternScale * scale,
  }
}

/**
 * `entity` reflected as the factors' signs say, scaled by X's size and turned
 * by `rotation`: a reference whose X and Y are one size.
 */
function similarInReference(
  entity: Entity,
  scaleX: number,
  scaleY: number,
  rotation: number
): Entity {
  let placed = entity
  if (scaleX * scaleY < 0) {
    // A hatch arrives here only tilted, which `linearEntity` does not map.
    placed = mirrorEntity(
      placed,
      BLOCK_ORIGIN,
      scaleX < 0 ? BLOCK_Y_AXIS : BLOCK_X_AXIS,
      "patternReflected"
    )
  }
  const scale = Math.abs(scaleX)
  if (scale !== 1) placed = scaleEntity(placed, BLOCK_ORIGIN, scale)
  // Both negative is a half turn (probe blocks/p205: Scale −2).
  const turn = rotation + (scaleX < 0 && scaleY < 0 ? Math.PI : 0)
  return turn !== 0 ? rotateEntity(placed, BLOCK_ORIGIN, turn) : placed
}

/**
 * `entity` placed at X's size, reflected as the reference reflects, and
 * moved so its anchor lands where the affine `map` puts it.
 */
function atScaleOfX(
  entity: Entity,
  insert: InsertEntity,
  map: Linear2
): Entity {
  const { scaleX, scaleY, rotation } = insert
  const placed = similarInReference(
    entity,
    scaleX,
    Math.sign(scaleY) * Math.abs(scaleX),
    rotation
  )
  const anchor = textAnchor(entity)
  const moved = textAnchor(placed)
  if (!anchor || !moved) return placed
  return translateEntity(placed, V.sub(applyLinear(map, anchor), moved))
}

/** The point a text-like object hangs off, which the affine map places. */
function textAnchor(entity: Entity): Vec2 | null {
  return entity.type === "text" ||
    entity.type === "mtext" ||
    entity.type === "attdef"
    ? entity.position
    : null
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
  for (const entity of referencedObjects(insert, block)) {
    if (entity.type !== "attdef") {
      out.push(placeInReference(entity, insert, block, true, "shown"))
    } else if (
      entity.modes.constant &&
      attributeShown(entity.modes.invisible, display)
    ) {
      out.push(
        placeInReference(
          attributeDefinitionText(entity, entity.value),
          insert,
          block,
          true,
          "shown"
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
        true,
        "shown"
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
): Vec3[] {
  if (!block) return []
  return (insert.attributes ?? [])
    .filter((attribute) => attributeShown(attribute.invisible, display))
    .map((attribute) => {
      const placed = placeInReference(
        blockAttributeText(attribute, insert.id),
        insert,
        block,
        true,
        "shown"
      )
      return placed.type === "text"
        ? entityPointToWorld(placed, placed.position)
        : entityPointToWorld(insert, insert.position)
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
