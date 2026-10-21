import { DocumentSettings } from "../../domain/units"
import { UpdateSettingsCommand } from "../commands/settingsCommands"
import { ToolContext } from "./Tool"

/**
 * Sets what AutoCAD saves in the drawing from inside a command's run
 * (FILLETRAD, CHAMFERA, TEXTSIZE…), so the command's undo step holds it and
 * U puts it back (rectang/p317); a value already there executes nothing.
 */
export function setCommandSettings(
  patch: Partial<DocumentSettings>,
  ctx: ToolContext
): void {
  const settings = ctx.document.getSettings()
  const changed = Object.fromEntries(
    Object.entries(patch).filter(
      ([key, value]) => settings[key as keyof DocumentSettings] !== value
    )
  )
  if (Object.keys(changed).length === 0) return
  ctx.execute(new UpdateSettingsCommand(changed))
}
