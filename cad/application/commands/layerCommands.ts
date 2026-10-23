import { CadDocument } from "../../domain/Document"
import { Layer, LayerId } from "../../domain/layers"
import { Command } from "./Command"

/**
 * The layer table's edits, which AutoCAD's U takes back (p301–p308): each is
 * worked out before it runs, so a redo puts back the very same layer.
 */
abstract class LayerTableCommand implements Command {
  abstract readonly label: string
  abstract execute(doc: CadDocument): void
  abstract undo(doc: CadDocument): void

  /** The layer table is the same in every frame. */
  mapEntities(): Command {
    return this
  }
}

/** A new layer, made current with it when `makeCurrent` (-LAYER's Make). */
export class AddLayerCommand extends LayerTableCommand {
  readonly label = "add-layer"
  private previousCurrent: LayerId | null = null

  constructor(
    private readonly layer: Layer,
    private readonly makeCurrent: boolean
  ) {
    super()
  }

  execute(doc: CadDocument): void {
    this.previousCurrent = doc.getCurrentLayerId()
    doc.addLayer(this.layer)
    if (this.makeCurrent) doc.setCurrentLayer(this.layer.id)
  }

  undo(doc: CadDocument): void {
    if (this.previousCurrent !== null) doc.setCurrentLayer(this.previousCurrent)
    doc.removeLayer(this.layer.id)
  }
}

/** A layer's name, colour, linetype, lineweight, On or Lock. */
export class UpdateLayerCommand extends LayerTableCommand {
  readonly label = "update-layer"
  private previous: Layer | undefined

  constructor(
    private readonly id: LayerId,
    private readonly patch: Partial<Omit<Layer, "id">>
  ) {
    super()
  }

  execute(doc: CadDocument): void {
    this.previous = doc.getLayer(this.id)
    if (this.previous) doc.updateLayer({ ...this.previous, ...this.patch })
  }

  undo(doc: CadDocument): void {
    if (this.previous) doc.updateLayer(this.previous)
  }
}

/** A layer deleted, which comes back where it stood in the table. */
export class RemoveLayerCommand extends LayerTableCommand {
  readonly label = "remove-layer"
  private removed: { readonly layer: Layer; readonly index: number } | null =
    null

  constructor(private readonly id: LayerId) {
    super()
  }

  execute(doc: CadDocument): void {
    const layers = doc.getLayers()
    const index = layers.findIndex((layer) => layer.id === this.id)
    this.removed = doc.removeLayer(this.id)
      ? { layer: layers[index], index }
      : null
  }

  undo(doc: CadDocument): void {
    if (this.removed) doc.restoreLayer(this.removed.layer, this.removed.index)
  }
}

/** CLAYER, the layer new objects are drawn on. */
export class SetCurrentLayerCommand extends LayerTableCommand {
  readonly label = "set-current-layer"
  private previous: LayerId | null = null

  constructor(private readonly id: LayerId) {
    super()
  }

  execute(doc: CadDocument): void {
    this.previous = doc.getCurrentLayerId()
    doc.setCurrentLayer(this.id)
  }

  undo(doc: CadDocument): void {
    if (this.previous !== null) doc.setCurrentLayer(this.previous)
  }
}
