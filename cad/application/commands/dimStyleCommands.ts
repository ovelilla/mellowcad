import { CadDocument } from "../../domain/Document"
import { DimStyle, DimStyleId } from "../../domain/dimStyles"
import { Command } from "./Command"

/**
 * The dimension style table's edits, which AutoCAD's U takes back (p05,
 * desktop d05), as the text style table's: each is worked out before it
 * runs, so a redo puts back the very same style.
 */
abstract class DimStyleTableCommand implements Command {
  abstract readonly label: string
  abstract execute(doc: CadDocument): void
  abstract undo(doc: CadDocument): void

  /** The style table is the same in every frame. */
  mapEntities(): Command {
    return this
  }
}

/** A new style, made current with it when `makeCurrent`. */
export class AddDimStyleCommand extends DimStyleTableCommand {
  readonly label = "add-dim-style"
  private previousCurrent: DimStyleId | null = null

  constructor(
    private readonly style: DimStyle,
    private readonly makeCurrent: boolean
  ) {
    super()
  }

  execute(doc: CadDocument): void {
    this.previousCurrent = doc.getCurrentDimStyleId()
    doc.addDimStyle(this.style)
    if (this.makeCurrent) doc.setCurrentDimStyle(this.style.id)
  }

  undo(doc: CadDocument): void {
    if (this.previousCurrent !== null) {
      doc.setCurrentDimStyle(this.previousCurrent)
    }
    doc.removeDimStyle(this.style.id)
  }
}

/** A style's name or variables, the whole style worked out before. */
export class UpdateDimStyleCommand extends DimStyleTableCommand {
  readonly label = "update-dim-style"
  private previous: DimStyle | undefined

  constructor(private readonly next: DimStyle) {
    super()
  }

  execute(doc: CadDocument): void {
    this.previous = doc.getDimStyle(this.next.id)
    doc.updateDimStyle(this.next)
  }

  undo(doc: CadDocument): void {
    if (this.previous) doc.updateDimStyle(this.previous)
  }
}

/** A style deleted, which comes back where it stood in the table. */
export class RemoveDimStyleCommand extends DimStyleTableCommand {
  readonly label = "remove-dim-style"
  private removed: {
    readonly style: DimStyle
    readonly index: number
  } | null = null

  constructor(private readonly id: DimStyleId) {
    super()
  }

  execute(doc: CadDocument): void {
    const styles = doc.getDimStyles()
    const index = styles.findIndex((style) => style.id === this.id)
    this.removed = doc.removeDimStyle(this.id)
      ? { style: styles[index], index }
      : null
  }

  undo(doc: CadDocument): void {
    if (this.removed) {
      doc.restoreDimStyle(this.removed.style, this.removed.index)
    }
  }
}

/** DIMSTYLE, the style new dimensions are drawn in. */
export class SetCurrentDimStyleCommand extends DimStyleTableCommand {
  readonly label = "set-current-dim-style"
  private previous: DimStyleId | null = null

  constructor(private readonly id: DimStyleId) {
    super()
  }

  execute(doc: CadDocument): void {
    this.previous = doc.getCurrentDimStyleId()
    doc.setCurrentDimStyle(this.id)
  }

  undo(doc: CadDocument): void {
    if (this.previous !== null) doc.setCurrentDimStyle(this.previous)
  }
}
