import type { PromptId } from "../../locales/types"
import { CommandOption, CommandOptionOutcome, Tool, ToolContext } from "./Tool"

/**
 * AutoCAD's NAVVCUBE: `Enter an option [ON/OFF/Settings] <ON>:`. It sets
 * NAVVCUBEDISPLAY, saved in the drawing, as 3 or 0 — there are no visual
 * styles for its 1 and 2. Settings opens the ViewCube Settings dialog, which
 * is not built, so it is not offered. No command undoes it: it is presentation.
 */
export class NavVCubeTool implements Tool {
  readonly id = "navvcube"

  private shown = true

  onActivate(ctx: ToolContext): void {
    this.shown = ctx.document.getSettings().viewCube.visible
    ctx.selection.clear()
    ctx.dynamicInput.open({ fields: [], commit: () => {} })
  }

  onDeactivate(ctx: ToolContext): void {
    ctx.dynamicInput.close()
  }

  question(): PromptId {
    return "enterAnOption"
  }

  commandOptions(): readonly CommandOption[] {
    return [{ id: "ON" }, { id: "OFF" }]
  }

  defaultOption(): string {
    return this.shown ? "ON" : "OFF"
  }

  invokeOption(id: string, ctx: ToolContext): CommandOptionOutcome {
    if (id !== "ON" && id !== "OFF") return "unhandled"
    ctx.setViewCubeVisible(id === "ON")
    return "end"
  }

  wantsSnap(): boolean {
    return false
  }
}
