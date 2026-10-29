import { CadDocument } from "../../domain/Document"
import { AttributeDisplay } from "../../domain/entities"
import { DocumentSettings } from "../../domain/units"
import type { Vec3 } from "../../geometry/Vec3"
import { Command } from "./Command"

/**
 * Where LASTPOINT goes when U takes a UCS change back and when REDO makes it
 * again — the runtime keeps LASTPOINT, so the change only says.
 */
export interface UcsChangeLastPoint {
  readonly undone: Vec3
  readonly redone: Vec3
}

/** UCS, UCSICON and ELEV: settings saved in the drawing, and undone with it. */
export class UpdateSettingsCommand implements Command {
  readonly label = "update-settings"
  private previous: Partial<DocumentSettings> = {}

  constructor(
    private readonly patch: Partial<DocumentSettings>,
    readonly lastPoint?: UcsChangeLastPoint | undefined
  ) {}

  /**
   * Its UCS is the WCS's: only the commands that work in the WCS (UCS, -VIEW)
   * change the UCS.
   */
  mapEntities(): Command {
    return this
  }

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

  mapEntities(): Command {
    return this
  }

  execute(doc: CadDocument): void {
    this.previous = doc.getSettings().attributeDisplay
    doc.setAttributeDisplay(this.next)
  }

  undo(doc: CadDocument): void {
    doc.setAttributeDisplay(this.previous)
  }
}

/**
 * A value kept by the program rather than the drawing (TEXTEDITMODE, a
 * profile's: text/p246), set inside a run so that U puts it back as it does
 * a drawing's (text/p249). It brings nothing into the drawing, and NEW and
 * OPEN leave it as it is.
 */
export class SessionSettingCommand<T> implements Command {
  readonly label = "session-setting"

  constructor(
    private readonly set: (value: T) => void,
    private readonly before: T,
    private readonly after: T
  ) {}

  mapEntities(): Command {
    return this
  }

  execute(): void {
    this.set(this.after)
  }

  undo(): void {
    this.set(this.before)
  }
}
