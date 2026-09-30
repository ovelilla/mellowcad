import { CadDocument } from "../../domain/Document"
import { AttributeDisplay } from "../../domain/entities"
import { Command } from "./Command"

/** ATTDISP: sets ATTMODE, which is saved in the drawing and undone with it. */
export class SetAttributeDisplayCommand implements Command {
  readonly label = "set-attribute-display"
  private previous: AttributeDisplay = "normal"

  constructor(private readonly next: AttributeDisplay) {}

  execute(doc: CadDocument): void {
    this.previous = doc.getSettings().attributeDisplay
    doc.setAttributeDisplay(this.next)
  }

  undo(doc: CadDocument): void {
    doc.setAttributeDisplay(this.previous)
  }
}
