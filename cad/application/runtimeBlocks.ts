import { CadDocument } from "../domain/Document"
import { BlockId, entitiesBounds, purgeableBlocks } from "../domain/entities"
import { Scene } from "../scene/types"
import { CommandHistory } from "./commands/Command"
import { PurgeBlocksCommand } from "./commands/blockCommands"
import { previewCamera, previewScene } from "./drawingPreview"

/** Breathing room around a block thumbnail, in screen pixels. */
const PREVIEW_PADDING_PX = 6

/**
 * Removes the given block definitions, or every one, that the drawing leaves
 * unused (`purgeableBlocks`): PURGE's Blocks without its prompts, one undo step.
 * Returns how many were removed. No part of the editor calls it since the
 * Blocks palette lost its delete (AutoCAD's has none, BLOCKS-D91).
 */
export function purgeBlocks(
  document: CadDocument,
  history: CommandHistory,
  ids?: readonly BlockId[]
): number {
  const unused = purgeableBlocks(
    document.getBlocks(),
    document.getEntities(),
    (block) => ids === undefined || ids.includes(block.id)
  ).map((block) => block.id)
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
