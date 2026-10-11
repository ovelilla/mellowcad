import { Vec2 } from "../../geometry/Vec2"
import { UpdateSettingsCommand } from "../commands/settingsCommands"
import { PointerInput, Tool, ToolContext, ToolQuestion } from "./Tool"

/**
 * AutoCAD's LTSCALE: `Enter new linetype scale factor <1.0000>:`, offering the
 * current one. LTSCALE is saved in the drawing ("The linetype scale factor
 * cannot equal zero"); changing it regenerates the drawing. A factor that is
 * not above zero is refused, `Value must be positive and nonzero.`, and the
 * prompt stays.
 */
export class LtScaleTool implements Tool {
  readonly id = "ltscale"

  private lastScreen: Vec2 | null = null
  /** The scale Enter keeps, as the prompt offers it. */
  private current = 1

  onActivate(ctx: ToolContext): void {
    ctx.setCursor("crosshair")
    this.current = ctx.document.getSettings().ltScale
    ctx.dynamicInput.open({
      fields: [{ id: "value", prompt: "ltscaleFactor", kind: "number" }],
      commit: (values, commitCtx) => this.answer(values.value, commitCtx),
    })
    ctx.dynamicInput.setDefault("value", ctx.document.getSettings().ltScale)
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

  question(): ToolQuestion {
    return { id: "ltscaleFactor", enter: this.current }
  }

  private answer(value: number, ctx: ToolContext): void {
    if (!Number.isFinite(value)) return
    if (value <= 0) {
      ctx.report(ctx.text.message("positiveNonzero"), "error")
      return
    }
    if (value !== ctx.document.getSettings().ltScale) {
      ctx.execute(new UpdateSettingsCommand({ ltScale: value }))
      ctx.report(ctx.text.message("regeneratingModel"))
    }
    ctx.endCommand()
  }
}
