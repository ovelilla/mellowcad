import { Vec2 } from "../../geometry/Vec2"
import { UpdateSettingsCommand } from "../commands/settingsCommands"
import { PointerInput, Tool, ToolContext } from "./Tool"

/**
 * AutoCAD's LTSCALE: `Enter new linetype scale factor <1.0000>:`, offering the
 * current one. LTSCALE is saved in the drawing ("The linetype scale factor
 * cannot equal zero"); changing it regenerates the drawing. A factor that is
 * not above zero is not taken, and the prompt stays.
 */
export class LtScaleTool implements Tool {
  readonly id = "ltscale"

  private lastScreen: Vec2 | null = null

  onActivate(ctx: ToolContext): void {
    ctx.setCursor("crosshair")
    ctx.dynamicInput.open({
      fields: [{ id: "value", prompt: "ltscaleFactor", kind: "number" }],
      commit: (values, commitCtx) => this.answer(values.value, commitCtx),
    })
    ctx.dynamicInput.setLive("value", ctx.document.getSettings().ltScale)
    ctx.dynamicInput.setPosition(this.lastScreen ?? { x: 0, y: 0 })
    ctx.requestRender()
  }

  onDeactivate(ctx: ToolContext): void {
    ctx.dynamicInput.close()
  }

  onPointerMove(input: PointerInput, ctx: ToolContext): void {
    this.lastScreen = input.screen
    ctx.dynamicInput.setPosition(input.screen)
  }

  wantsSnap(): boolean {
    return false
  }

  private answer(value: number, ctx: ToolContext): void {
    if (!Number.isFinite(value) || value <= 0) return
    if (value !== ctx.document.getSettings().ltScale) {
      ctx.execute(new UpdateSettingsCommand({ ltScale: value }))
      ctx.report(ctx.text.message("regeneratingModel"))
    }
    ctx.endCommand()
  }
}
