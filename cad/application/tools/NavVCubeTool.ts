import { CommandOption, CommandOptionOutcome, Tool, ToolContext } from "./Tool"

/**
 * AutoCAD's NAVVCUBE: `Enter an option [ON/OFF/Properties] <ON>:`. It sets
 * NAVVCUBEDISPLAY, saved in the drawing, as 3 or 0 — there are no visual
 * styles for its 1 and 2. Properties opens the ViewCube Settings dialog,
 * which is not built. No command undoes it: it is presentation.
 */
export class NavVCubeTool implements Tool {
  readonly id = "navvcube"

  onActivate(ctx: ToolContext): void {
    ctx.selection.clear()
    ctx.dynamicInput.open({ fields: [], commit: () => {} })
  }

  onDeactivate(ctx: ToolContext): void {
    ctx.dynamicInput.close()
  }

  commandOptions(): readonly CommandOption[] {
    return [{ id: "ON" }, { id: "OFF" }]
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
