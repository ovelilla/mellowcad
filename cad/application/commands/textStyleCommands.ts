import { CadDocument } from "../../domain/Document"
import { TextStyle, TextStyleId } from "../../domain/textStyles"
import { Command } from "./Command"

/**
 * The text style table's edits, which AutoCAD's U takes back (text/p320,
 * desktop d07): each is worked out before it runs, so a redo puts back the
 * very same style.
 */
abstract class TextStyleTableCommand implements Command {
  abstract readonly label: string
  abstract execute(doc: CadDocument): void
  abstract undo(doc: CadDocument): void

  /** The style table is the same in every frame. */
  mapEntities(): Command {
    return this
  }
}

/** A new style, made current with it when `makeCurrent` (the dialog's New…). */
export class AddTextStyleCommand extends TextStyleTableCommand {
  readonly label = "add-text-style"
  private previousCurrent: TextStyleId | null = null

  constructor(
    private readonly style: TextStyle,
    private readonly makeCurrent: boolean
  ) {
    super()
  }

  execute(doc: CadDocument): void {
    this.previousCurrent = doc.getCurrentTextStyleId()
    doc.addTextStyle(this.style)
    if (this.makeCurrent) doc.setCurrentTextStyle(this.style.id)
  }

  undo(doc: CadDocument): void {
    if (this.previousCurrent !== null) {
      doc.setCurrentTextStyle(this.previousCurrent)
    }
    doc.removeTextStyle(this.style.id)
  }
}

/** A style's name or height, the whole style worked out before. */
export class UpdateTextStyleCommand extends TextStyleTableCommand {
  readonly label = "update-text-style"
  private previous: TextStyle | undefined

  constructor(private readonly next: TextStyle) {
    super()
  }

  execute(doc: CadDocument): void {
    this.previous = doc.getTextStyle(this.next.id)
    doc.updateTextStyle(this.next)
  }

  undo(doc: CadDocument): void {
    if (this.previous) doc.updateTextStyle(this.previous)
  }
}

/** A style deleted, which comes back where it stood in the table. */
export class RemoveTextStyleCommand extends TextStyleTableCommand {
  readonly label = "remove-text-style"
  private removed: {
    readonly style: TextStyle
    readonly index: number
  } | null = null

  constructor(private readonly id: TextStyleId) {
    super()
  }

  execute(doc: CadDocument): void {
    const styles = doc.getTextStyles()
    const index = styles.findIndex((style) => style.id === this.id)
    this.removed = doc.removeTextStyle(this.id)
      ? { style: styles[index], index }
      : null
  }

  undo(doc: CadDocument): void {
    if (this.removed) {
      doc.restoreTextStyle(this.removed.style, this.removed.index)
    }
  }
}

/** TEXTSTYLE, the style new text is written in. */
export class SetCurrentTextStyleCommand extends TextStyleTableCommand {
  readonly label = "set-current-text-style"
  private previous: TextStyleId | null = null

  constructor(private readonly id: TextStyleId) {
    super()
  }

  execute(doc: CadDocument): void {
    this.previous = doc.getCurrentTextStyleId()
    doc.setCurrentTextStyle(this.id)
  }

  undo(doc: CadDocument): void {
    if (this.previous !== null) doc.setCurrentTextStyle(this.previous)
  }
}
