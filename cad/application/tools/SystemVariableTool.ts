import { Vec2 } from "../../geometry/Vec2"
import type { DocumentSettings } from "../../domain/units"
import { UpdateSettingsCommand } from "../commands/settingsCommands"
import {
  PointerInput,
  QuestionInput,
  Tool,
  ToolContext,
  ToolQuestion,
} from "./Tool"

/**
 * A system variable saved in the drawing, typed as a command (AUPREC) or with
 * an apostrophe ('UCSICON, which typed bare is the command), as AutoCAD 2023's
 * console asks it: `Enter new value for AUPREC <0>:`, a whole number from 0
 * to its largest. Anything else is refused in the console's words, `Requires
 * an integer between 0 and 8.`, and the prompt stays. Its prompt is headed by
 * its name, the same in every language.
 */
export abstract class SystemVariableTool implements Tool {
  abstract readonly id: string
  /** The variable's name. */
  protected abstract readonly variable: string
  /** The largest value it takes. */
  protected abstract readonly max: number

  private lastScreen: Vec2 | null = null
  /** The value Enter keeps, as the prompt offers it. */
  private current = 0

  /** The value the drawing holds. */
  protected abstract read(settings: DocumentSettings): number

  /** The settings that hold `value`. */
  protected abstract settingsFor(
    value: number,
    settings: DocumentSettings
  ): Partial<DocumentSettings>

  systemVariable(): string {
    return this.variable
  }

  onActivate(ctx: ToolContext): void {
    ctx.setCursor("crosshair")
    this.current = this.read(ctx.document.getSettings())
    ctx.dynamicInput.open({
      fields: [{ id: "value", kind: "number" }],
      commit: (values, commitCtx) => this.answer(values.value, commitCtx),
    })
    ctx.dynamicInput.setDefault("value", this.current)
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
    return {
      id: "enterNewValueFor",
      values: { name: this.variable },
      enter: { count: this.current },
    }
  }

  takes(): QuestionInput {
    return {
      refusal: "requiresIntegerBetween",
      values: { min: 0, max: this.max },
    }
  }

  private answer(value: number, ctx: ToolContext): void {
    if (!Number.isInteger(value) || value < 0 || value > this.max) {
      ctx.report(
        ctx.text.message("requiresIntegerBetween", { min: 0, max: this.max }),
        "error"
      )
      return
    }
    if (value !== this.current) {
      const settings = ctx.document.getSettings()
      ctx.execute(new UpdateSettingsCommand(this.settingsFor(value, settings)))
    }
    ctx.endCommand()
  }
}
