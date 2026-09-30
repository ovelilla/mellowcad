import { CadDocument } from "../../domain/Document"
import { AttributeDisplay } from "../../domain/entities"
import { DocumentSettings } from "../../domain/units"
import { Command } from "./Command"

/** UCS and UCSICON: settings saved in the drawing, and undone with it. */
export class UpdateSettingsCommand implements Command {
  readonly label = "update-settings"
  private previous: Partial<DocumentSettings> = {}

  constructor(private readonly patch: Partial<DocumentSettings>) {}

  execute(doc: CadDocument): void {
    const current = doc.getSettings()
    this.previous = Object.fromEntries(
      Object.keys(this.patch).map((key) => [
        key,
        current[key as keyof DocumentSettings],
      ])
    )
    doc.updateSettings(this.patch)
  }

  undo(doc: CadDocument): void {
    doc.updateSettings(this.previous)
  }
}

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
