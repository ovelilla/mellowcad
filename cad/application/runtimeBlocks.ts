import { CadDocument } from "../domain/Document"
import { BlockId, EntityId, entitiesBounds } from "../domain/entities"
import { Scene } from "../scene/types"
import { Viewport } from "./Viewport"
import { buildScene } from "./SceneBuilder"
import { CommandHistory } from "./commands/Command"
import { PurgeBlocksCommand } from "./commands/blockCommands"

/** Breathing room around a block thumbnail, in screen pixels. */
const PREVIEW_PADDING_PX = 6

const EMPTY_IDS: ReadonlySet<EntityId> = new Set()

/**
 * Removes block definitions the drawing no longer references — AutoCAD's
 * PURGE, which "removes unused items… from the drawing" and lists a
 * referenced block under the items you *cannot* purge. With no ids given,
 * every unused block goes. Returns how many were removed.
 */
export function purgeBlocks(
  document: CadDocument,
  history: CommandHistory,
  ids?: readonly BlockId[]
): number {
  const unused = (ids ?? document.getBlocks().map((b) => b.id)).filter(
    (id) => document.getBlock(id) && !document.blockInUse(id)
  )
  if (unused.length === 0) return 0
  history.execute(new PurgeBlocksCommand(unused))
  return unused.length
}

/**
 * A thumbnail of a block, framed in a `width`×`height` box: the same neutral
 * scene the drawing is built from, so a preview can never disagree with what
 * the block actually looks like. Null when the block is unknown or empty.
 */
export function buildBlockPreview(
  document: CadDocument,
  id: BlockId,
  width: number,
  height: number
): Scene | null {
  const block = document.getBlock(id)
  if (!block || block.entities.length === 0) return null
  const bounds = entitiesBounds(block.entities, document.blockLookup())
  if (!bounds) return null

  const camera = new Viewport()
  camera.setSize(width, height)
  camera.zoomToBounds(bounds.min, bounds.max, PREVIEW_PADDING_PX)
  return buildScene({
    camera,
    entities: block.entities,
    layers: document.getLayers(),
    dimStyles: document.getDimStyles(),
    blocks: document.blockLookup(),
    selectedIds: EMPTY_IDS,
    hiddenIds: EMPTY_IDS,
    gridVisible: false,
    gridSpacing: null,
    ltScale: document.getSettings().ltScale,
    // A thumbnail is a shape, not a plot: real lineweights would blot it out.
    lwDisplay: false,
    snap: null,
    acquiredTrackingPoints: [],
    tracking: null,
    parallelReferenceIds: EMPTY_IDS,
    toolOverlay: [],
    cursor: null,
    polar: null,
    fromBase: null,
    cyclingBadge: null,
    cyclingHighlight: null,
  })
}
