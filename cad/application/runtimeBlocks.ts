import { CadDocument } from "../domain/Document"
import { BlockId, entitiesBounds } from "../domain/entities"
import { Scene } from "../scene/types"
import { CommandHistory } from "./commands/Command"
import { PurgeBlocksCommand } from "./commands/blockCommands"
import { previewCamera, previewScene } from "./drawingPreview"

/** Breathing room around a block thumbnail, in screen pixels. */
const PREVIEW_PADDING_PX = 6

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
  const camera = previewCamera(bounds, width, height, PREVIEW_PADDING_PX)
  return previewScene(document, camera, block.entities, false)
}
