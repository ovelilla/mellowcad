import { CadDocument } from "../../domain/Document"
import {
  BlockDefinition,
  BlockId,
  Entity,
  EntityId,
} from "../../domain/entities"
import { Command } from "./Command"

/**
 * BLOCK, as one reversible step: the definition is added to the block table and
 * the objects it was made from are replaced by a reference to it — AutoCAD's
 * "Convert to Block", the mode its own task page tells you to pick.
 *
 * The definition is part of the same step because undoing BLOCK in AutoCAD
 * undoes the whole command, table entry included; only redefining a block
 * (which every existing reference follows) is kept, since a reference already
 * in the drawing would otherwise be left pointing at nothing.
 */
export class CreateBlockCommand implements Command {
  readonly label = "create-block"
  private removed: Entity[] = []
  private previousDefinition: BlockDefinition | undefined

  constructor(
    private readonly block: BlockDefinition,
    private readonly removedIds: readonly EntityId[],
    private readonly reference: Entity | null
  ) {}

  execute(doc: CadDocument): void {
    this.previousDefinition = doc.getBlock(this.block.id)
    this.removed = this.removedIds
      .map((id) => doc.get(id))
      .filter((entity): entity is Entity => entity !== undefined)
    doc.addBlock(this.block)
    doc.removeMany(this.removedIds)
    if (this.reference) doc.add(this.reference)
  }

  undo(doc: CadDocument): void {
    if (this.reference) doc.remove(this.reference.id)
    doc.addMany(this.removed)
    if (this.previousDefinition) doc.addBlock(this.previousDefinition)
    else doc.removeBlock(this.block.id)
  }
}

/**
 * PURGE for block definitions: drops the ones the drawing no longer references.
 * A definition holds geometry, so unlike a layer or a style this goes through
 * the history and comes back with one undo.
 */
export class PurgeBlocksCommand implements Command {
  readonly label = "purge-blocks"
  private removed: BlockDefinition[] = []

  constructor(private readonly ids: readonly BlockId[]) {}

  execute(doc: CadDocument): void {
    this.removed = this.ids
      .map((id) => doc.getBlock(id))
      .filter((block): block is BlockDefinition => block !== undefined)
    for (const id of this.ids) doc.removeBlock(id)
  }

  undo(doc: CadDocument): void {
    for (const block of this.removed) doc.addBlock(block)
  }
}
