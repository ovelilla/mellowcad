import { Vec2 } from "../../geometry/Vec2"
import { UpdateSettingsCommand } from "../commands/settingsCommands"
import { PointerInput, Tool, ToolContext, ToolQuestion } from "./Tool"

type ElevState =
  | { readonly phase: "elevation" }
  | { readonly phase: "thickness"; readonly elevation: number }

/**
 * AutoCAD's ELEV: the new default elevation, then the new default thickness,
 * each offering the current value. Both are saved in the drawing and change
 * as one undo step once the second is answered.
 */
export class ElevTool implements Tool {
  readonly id = "elev"

  private state: ElevState = { phase: "elevation" }
  private lastScreen: Vec2 | null = null
  /** The value the asked prompt offers, the current one. */
  private current = 0

  onActivate(ctx: ToolContext): void {
    ctx.setCursor("crosshair")
    this.state = { phase: "elevation" }
    this.ask(ctx)
  }

  onDeactivate(ctx: ToolContext): void {
    this.state = { phase: "elevation" }
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
    return {
      id:
        this.state.phase === "elevation"
          ? "elevDefaultElevation"
          : "elevDefaultThickness",
      enter: this.current,
    }
  }

  private ask(ctx: ToolContext): void {
    const settings = ctx.document.getSettings()
    const elevation = this.state.phase === "elevation"
    ctx.dynamicInput.open({
      fields: [
        {
          id: "value",
          prompt: elevation ? "elevDefaultElevation" : "elevDefaultThickness",
          kind: "distance",
        },
      ],
      commit: (values, commitCtx) => this.answer(values.value, commitCtx),
    })
    this.current = elevation ? settings.elevation : settings.thickness
    ctx.dynamicInput.setDefault("value", this.current)
    ctx.dynamicInput.setPosition(this.lastScreen ?? { x: 0, y: 0 })
    ctx.requestRender()
  }

  private answer(value: number, ctx: ToolContext): void {
    if (!Number.isFinite(value)) return
    if (this.state.phase === "elevation") {
      this.state = { phase: "thickness", elevation: value }
      this.ask(ctx)
      return
    }
    const settings = ctx.document.getSettings()
    const elevation = this.state.elevation
    if (elevation !== settings.elevation || value !== settings.thickness) {
      ctx.execute(new UpdateSettingsCommand({ elevation, thickness: value }))
    }
    ctx.endCommand()
  }
}
