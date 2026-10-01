import { CadDocument } from "../../domain/Document"
import { Entity } from "../../domain/entities"
import { PastePlan } from "../clipboard"
import { Command } from "./Command"

/**
 * PASTECLIP as one reversible step. Pasted objects bring the layer, styles and
 * block definitions they need with them, so undoing has to take those back out
 * too — the same reason BLOCK carries its table entry through the history.
 *
 * The plan is worked out once, before the command runs, so a redo re-adds the
 * very same ids rather than minting new ones.
 */
export class PasteCommand implements Command {
  readonly label = "paste"

  constructor(private readonly plan: PastePlan) {}

  /** Block definitions are in the block's own coordinates, which no frame changes. */
  mapEntities(map: (entity: Entity) => Entity): Command {
    return new PasteCommand({
      ...this.plan,
      entities: this.plan.entities.map(map),
    })
  }

  execute(doc: CadDocument): void {
    for (const layer of this.plan.layers) doc.addLayer(layer)
    for (const style of this.plan.textStyles) doc.addTextStyle(style)
    for (const style of this.plan.dimStyles) doc.addDimStyle(style)
    for (const block of this.plan.blocks) doc.addBlock(block)
    doc.addMany(this.plan.entities)
  }

  undo(doc: CadDocument): void {
    // Reverse order: every one of these tables refuses to drop an entry that is
    // still in use, so the geometry has to go first.
    doc.removeMany(this.plan.entities.map((entity) => entity.id))
    for (const block of this.plan.blocks) doc.removeBlock(block.id)
    for (const style of this.plan.dimStyles) doc.removeDimStyle(style.id)
    for (const style of this.plan.textStyles) doc.removeTextStyle(style.id)
    for (const layer of this.plan.layers) doc.removeLayer(layer.id)
  }
}
