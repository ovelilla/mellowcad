import { AttributeDisplay } from "../../domain/entities"
import { SetAttributeDisplayCommand } from "../commands/settingsCommands"
import type { PromptId } from "../../locales/types"
import { CommandOption, CommandOptionOutcome, Tool, ToolContext } from "./Tool"

const DISPLAY_BY_KEYWORD: Readonly<Record<string, AttributeDisplay>> = {
  Normal: "normal",
  ON: "on",
  OFF: "off",
}

/**
 * AutoCAD's ATTDISP: `Enter attribute visibility setting [Normal/ON/OFF]`.
 * Normal shows each attribute as its Invisible mode says, ON shows them all and
 * OFF none; Enter keeps the current setting, which the prompt offers. The
 * choice is ATTMODE, which the drawing keeps.
 */
export class AttDispTool implements Tool {
  readonly id = "attdisp"

  private current: AttributeDisplay = "normal"

  onActivate(ctx: ToolContext): void {
    this.current = ctx.document.getSettings().attributeDisplay
    ctx.selection.clear()
    ctx.dynamicInput.open({ fields: [], commit: () => {} })
  }

  question(): PromptId {
    return "attributeVisibilitySetting"
  }

  defaultOption(): string | null {
    return (
      Object.keys(DISPLAY_BY_KEYWORD).find(
        (id) => DISPLAY_BY_KEYWORD[id] === this.current
      ) ?? null
    )
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
    // AutoCAD 2023's console regenerates only when the setting changes.
    if (display !== this.current) {
      ctx.execute(new SetAttributeDisplayCommand(display))
      ctx.regenerate()
    }
    return "end"
  }

  wantsSnap(): boolean {
    return false
  }
}
