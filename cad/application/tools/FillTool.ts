import { UpdateSettingsCommand } from "../commands/settingsCommands"
import type { PromptId } from "../../locales/types"
import { CommandOption, CommandOptionOutcome, Tool, ToolContext } from "./Tool"

/**
 * AutoCAD's FILL: `Enter mode [ON/OFF] <ON>:`, the current FILLMODE offered,
 * which the drawing keeps and U takes back. Its table declares `ON OFf 1 0`
 * (25955): typed, `1` is ON and `0` OFF, as AutoCAD 2027's console takes
 * them (properties/p168, p169). WHY the drawing shows it at once: AutoCAD fills or outlines
 * what it already drew only at the next regeneration, and nothing here keeps
 * a regenerated display apart from the drawing.
 */
export class FillTool implements Tool {
  readonly id = "fill"

  private filled = true

  onActivate(ctx: ToolContext): void {
    this.filled = ctx.document.getSettings().fillMode
    ctx.selection.clear()
    ctx.dynamicInput.open({ fields: [], commit: () => {} })
  }

  onDeactivate(ctx: ToolContext): void {
    ctx.dynamicInput.close()
  }

  question(): PromptId {
    return "fillMode"
  }

  commandOptions(): readonly CommandOption[] {
    return [
      { id: "ON" },
      { id: "OFF" },
      { id: "1", hidden: true },
      { id: "0", hidden: true },
    ]
  }

  defaultOption(): string {
    return this.filled ? "ON" : "OFF"
  }

  invokeOption(id: string, ctx: ToolContext): CommandOptionOutcome {
    if (!["ON", "OFF", "1", "0"].includes(id)) return "unhandled"
    const fillMode = id === "ON" || id === "1"
    if (fillMode !== this.filled) {
      ctx.execute(new UpdateSettingsCommand({ fillMode }))
    }
    return "end"
  }

  wantsSnap(): boolean {
    return false
  }
}
