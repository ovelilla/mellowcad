import type { PromptId } from "../../locales/types"
import { CommandOption, CommandOptionOutcome, Tool, ToolContext } from "./Tool"

/**
 * AutoCAD's NAVVCUBE: `Enter an option [ON/OFF/Settings] <ON>:`. It sets
 * NAVVCUBEDISPLAY, saved in the drawing: 3 on, and off 1 under 2D Wireframe
 * (view/p262), which clears only its visual style's bit — with no visual
 * styles here, the cube is shown or not. Settings opens the ViewCube
 * Settings dialog, which is not built, so it is not offered. Its run is a
 * step U names, which puts nothing back: AutoCAD's U restores the setting
 * (move/p238), not built.
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
