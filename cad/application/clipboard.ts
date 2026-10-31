/**
 * The two halves of the clipboard that are about the *drawing* rather than
 * about the host: what a copy has to take with it, and how a paste lands in a
 * document that may already have tables of its own.
 */

import { Vec3, add3, sub3 } from "../geometry/Vec3"
import { axesToWorld } from "../geometry/ocs"
import { DocumentReader } from "../domain/Document"
import {
  anonymousBlockName,
  assignEntityLayer,
  BlockDefinition,
  BlockId,
  copyEntity,
  Entity,
  findBlockNamed,
  isAnonymousBlock,
  Similarity3,
  transformEntity,
  MAX_BLOCK_NESTING,
} from "../domain/entities"
import { DEFAULT_LAYER_ID, Layer, LayerId, nextLayerId } from "../domain/layers"
import { DimStyle } from "../domain/dimStyles"
import { TextStyle } from "../domain/textStyles"
import { Ucs, ucsAxes } from "../domain/ucs"
import { ClipboardFragment } from "../serialization/clipboardFile"
import { DrawingSnapshot } from "../serialization/drawingFile"

/**
 * The snapshot a copy writes: `entities` plus **only** the table entries they
 * reference, followed through block definitions. Copying the whole layer table
 * would drag every layer of the source drawing into the target.
 */
export function clipboardSnapshot(
  entities: readonly Entity[],
  document: DocumentReader
): DrawingSnapshot {
  const layers = new Map<LayerId, Layer>()
  const textStyles = new Map<string, TextStyle>()
  const dimStyles = new Map<string, DimStyle>()
  const blocks = new Map<string, BlockDefinition>()

  const visit = (list: readonly Entity[], depth: number): void => {
    const keepTextStyle = (id: string) => {
      const style = document.getTextStyle(id)
      if (style) textStyles.set(style.id, style)
    }
    for (const entity of list) {
      const layer = document.getLayer(entity.layerId)
      if (layer) layers.set(layer.id, layer)
      switch (entity.type) {
        case "text":
        case "mtext":
        case "attdef":
          keepTextStyle(entity.styleId)
          break
        case "dimension": {
          const style = document.getDimStyle(entity.styleId)
          if (style) dimStyles.set(style.id, style)
          break
        }
        case "insert": {
          for (const attribute of entity.attributes ?? []) {
            const attributeLayer = document.getLayer(attribute.layerId)
            if (attributeLayer) layers.set(attributeLayer.id, attributeLayer)
            keepTextStyle(attribute.styleId)
          }
          const block = document.getBlock(entity.blockId)
          if (!block || blocks.has(block.id) || depth >= MAX_BLOCK_NESTING) {
            break
          }
          blocks.set(block.id, block)
          visit(block.entities, depth + 1)
          break
        }
        case "line":
        case "circle":
        case "arc":
        case "ellipse":
        case "spline":
        case "polyline":
        case "polyline3d":
        case "hatch":
        case "region":
        case "solid3d":
          break
        default: {
          const unhandled: never = entity
          void unhandled
        }
      }
    }
  }
  visit(entities, 0)

  return {
    settings: document.getSettings(),
    layers: Array.from(layers.values()),
    currentLayerId: document.getCurrentLayerId(),
    textStyles: Array.from(textStyles.values()),
    currentTextStyleId: document.getCurrentTextStyleId(),
    dimStyles: Array.from(dimStyles.values()),
    currentDimStyleId: document.getCurrentDimStyleId(),
    blocks: Array.from(blocks.values()),
    entities,
  }
}

/**
 * `fragment` laid in `ucs` as INSERT lays a block there: its WCS coordinates
 * read as the UCS's, so a paste in a UCS turned 30° turns the objects with it
 * (desktop clipboard/d02). The result is in the frame `ucs` is given in;
 * block definitions are in their own coordinates and stay as they are.
 */
export function fragmentInUcs(
  fragment: ClipboardFragment,
  ucs: Ucs
): ClipboardFragment {
  const axes = ucsAxes(ucs)
  const level =
    axes.x.x === 1 &&
    axes.x.y === 0 &&
    axes.x.z === 0 &&
    axes.y.x === 0 &&
    axes.y.y === 1 &&
    axes.y.z === 0
  // The origin cancels out of where the objects land, from the base point:
  // only a turn changes them, and the fragment is then kept exact.
  if (level) return fragment
  const map: Similarity3 = { rotation: axes, scale: 1, translation: ucs.origin }
  return {
    basePoint: add3(axesToWorld(axes, fragment.basePoint), ucs.origin),
    drawing: {
      ...fragment.drawing,
      entities: fragment.drawing.entities.map((entity) =>
        transformEntity(entity, map)
      ),
    },
  }
}

/** Everything a paste adds to the document, resolved against what is there. */
export interface PastePlan {
  /** The objects, with fresh ids, translated, and on the resolved layers. */
  readonly entities: readonly Entity[]
  readonly layers: readonly Layer[]
  readonly textStyles: readonly TextStyle[]
  readonly dimStyles: readonly DimStyle[]
  readonly blocks: readonly BlockDefinition[]
}

/**
 * Works out what pasting `fragment` with its base point at `at` would add.
 *
 * A **name that already exists in the target wins**: the objects join the layer
 * or use the style and block definition that are already there, and only names
 * the drawing has never heard of are added (a block's in any case, p210).
 * That is AutoCAD's rule — pasting never redefines the drawing it lands in —
 * and it is also what makes a paste back into the drawing it was copied from
 * a plain duplicate. An anonymous
 * block (an array's) is no name at all: it lands as a fresh `*U<n>`, as COPY
 * makes a second array of its own (probe arrays/p410).
 */
export function planPaste(
  fragment: ClipboardFragment,
  document: DocumentReader,
  at: Vec3
): PastePlan {
  const delta = sub3(at, fragment.basePoint)
  const { layers, layerIds } = reconcileLayers(
    fragment.drawing.layers,
    document
  )
  const layerOf = (id: LayerId) => layerIds.get(id) ?? DEFAULT_LAYER_ID
  const renamed = blockRenames(fragment.drawing.blocks, document)
  const onLayer = (entity: Entity): Entity => {
    const placed = withBlockRenamed(
      assignEntityLayer(entity, layerOf(entity.layerId)),
      renamed
    )
    return placed.type === "insert" && placed.attributes
      ? {
          ...placed,
          attributes: placed.attributes.map((attribute) => ({
            ...attribute,
            layerId: layerOf(attribute.layerId),
          })),
        }
      : placed
  }

  return {
    // Fresh ids, or a paste into the drawing it came from would overwrite the
    // originals; `copyEntity` also does the translation and keeps the overrides.
    entities: fragment.drawing.entities.map((entity) =>
      onLayer(copyEntity(entity, delta))
    ),
    layers,
    // A style's name *is* its id, so an exact miss is the whole test — there
    // is nothing to remap, only entries to add.
    textStyles: fragment.drawing.textStyles.filter(
      (style) => !document.getTextStyle(style.id)
    ),
    dimStyles: fragment.drawing.dimStyles.filter(
      (style) => !document.getDimStyle(style.id)
    ),
    blocks: fragment.drawing.blocks
      .filter(
        (block) =>
          isAnonymousBlock(block.name) ||
          !findBlockNamed(document.getBlocks(), block.name)
      )
      .map((block) => {
        const name = renamed.get(block.id)
        return {
          ...block,
          ...(name ? { id: name, name } : {}),
          entities: block.entities.map(onLayer),
        }
      }),
  }
}

/**
 * The fragment's block ids the target knows otherwise: a fresh `*U<n>` for
 * each anonymous block, none the target has, and the target's own block for
 * a name it holds in another case, names being case-blind (p210).
 */
function blockRenames(
  blocks: readonly BlockDefinition[],
  document: DocumentReader
): Map<BlockId, BlockId> {
  const table = document.getBlocks()
  const taken = table.map((block) => ({ name: block.name }))
  const renamed = new Map<BlockId, BlockId>()
  for (const block of blocks) {
    if (isAnonymousBlock(block.name)) {
      const name = anonymousBlockName(taken)
      taken.push({ name })
      renamed.set(block.id, name)
      continue
    }
    const existing = findBlockNamed(table, block.name)
    if (existing && existing.id !== block.id) {
      renamed.set(block.id, existing.id)
    }
  }
  return renamed
}

function withBlockRenamed(
  entity: Entity,
  renamed: ReadonlyMap<BlockId, BlockId>
): Entity {
  const name = entity.type === "insert" ? renamed.get(entity.blockId) : null
  return name && entity.type === "insert"
    ? { ...entity, blockId: name }
    : entity
}

/**
 * Maps each incoming layer onto the one the target already has by that name,
 * or lists it to be added. Layer names, unlike style names, are not ids, so
 * this is the one table a paste has to remap.
 */
function reconcileLayers(
  source: readonly Layer[],
  document: DocumentReader
): { layers: Layer[]; layerIds: Map<LayerId, LayerId> } {
  const byName = new Map<string, Layer>()
  const taken = new Set<LayerId>()
  for (const layer of document.getLayers()) {
    byName.set(layer.name.toLowerCase(), layer)
    taken.add(layer.id)
  }

  const layers: Layer[] = []
  const layerIds = new Map<LayerId, LayerId>()
  for (const layer of source) {
    const existing = byName.get(layer.name.toLowerCase())
    if (existing) {
      layerIds.set(layer.id, existing.id)
      continue
    }
    // Only re-id when the incoming id is already spoken for by a differently
    // named layer, which two unrelated drawings can manage.
    const added = taken.has(layer.id) ? { ...layer, id: nextLayerId() } : layer
    layers.push(added)
    taken.add(added.id)
    byName.set(added.name.toLowerCase(), added)
    layerIds.set(layer.id, added.id)
  }
  return { layers, layerIds }
}
