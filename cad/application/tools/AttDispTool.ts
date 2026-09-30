import { AttributeDisplay } from "../../domain/entities"
import { SetAttributeDisplayCommand } from "../commands/settingsCommands"
import { CommandOption, CommandOptionOutcome, Tool, ToolContext } from "./Tool"

const DISPLAY_BY_KEYWORD: Readonly<Record<string, AttributeDisplay>> = {
  Normal: "normal",
  ON: "on",
  OFF: "off",
}

/**
 * AutoCAD's ATTDISP: `Enter attribute visibility setting [Normal/ON/OFF]`.
 * Normal shows each attribute as its Invisible mode says, ON shows them all and
 * OFF none; Enter keeps the current setting. The choice is ATTMODE, which the
 * drawing keeps.
 */
export class AttDispTool implements Tool {
  readonly id = "attdisp"

  onActivate(ctx: ToolContext): void {
    ctx.selection.clear()
    ctx.dynamicInput.open({ fields: [], commit: () => {} })
  }

  onDeactivate(ctx: ToolContext): void {
    ctx.dynamicInput.close()
  }

  commandOptions(): readonly CommandOption[] {
    return Object.keys(DISPLAY_BY_KEYWORD).map((id) => ({ id }))
  }

  invokeOption(id: string, ctx: ToolContext): CommandOptionOutcome {
    const display = DISPLAY_BY_KEYWORD[id]
    if (!display) return "unhandled"
    if (display !== ctx.document.getSettings().attributeDisplay) {
      ctx.execute(new SetAttributeDisplayCommand(display))
    }
    return "end"
  }

  wantsSnap(): boolean {
    return false
  }
}
