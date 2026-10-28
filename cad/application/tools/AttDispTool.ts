import { AttributeDisplay } from "../../domain/entities"
import { SetAttributeDisplayCommand } from "../commands/settingsCommands"
import {
  CommandOption,
  CommandOptionOutcome,
  Tool,
  ToolContext,
  ToolQuestion,
} from "./Tool"

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
  /** acad.cuix's `'_attdisp _n` / `_on` / `_off` (ID_AttdispNo/On/Of, p313). */
  readonly transparentMacro = true

  private current: AttributeDisplay = "normal"

  onActivate(ctx: ToolContext): void {
    this.current = ctx.document.getSettings().attributeDisplay
    ctx.selection.clear()
    ctx.dynamicInput.open({ fields: [], commit: () => {} })
  }

  /** AutoCAD declares its keywords `OFf Normal ON` (table 25908). */
  question(): ToolQuestion {
    return {
      id: "attributeVisibilitySetting",
      declared: ["OFF", "Normal", "ON"],
    }
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
    // AutoCAD 2027's console regenerates only when the setting changes
    // (probe blocks/p04), and its U writes `ATTDISP` alone (p337).
    if (display !== this.current) {
      ctx.execute(new SetAttributeDisplayCommand(display))
      ctx.regenerate("once")
    }
    return "end"
  }

  wantsSnap(): boolean {
    return false
  }
}
