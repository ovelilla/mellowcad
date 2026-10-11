import { Vec2 } from "../../geometry/Vec2"
import { UpdateSettingsCommand } from "../commands/settingsCommands"
import {
  PointerInput,
  QuestionInput,
  Tool,
  ToolContext,
  ToolQuestion,
} from "./Tool"

/** AUPREC's range: "0 to 8 decimal places". */
const MAX_PLACES = 8

/**
 * AutoCAD's AUPREC system variable typed as a command, as its 2023 console
 * asks it: `Enter new value for AUPREC <0>:`, the decimal places every angle
 * is written with — a prompt's `<90>`, DIST's `Angle in XY Plane = 45` —
 * apart from lengths' (LUPREC). Saved in the drawing; anything but a whole
 * number from 0 to 8 is refused, `Requires an integer between 0 and 8.`, and
 * the prompt stays.
 */
export class AuPrecTool implements Tool {
  readonly id = "auprec"

  private lastScreen: Vec2 | null = null
  /** The places Enter keeps, as the prompt offers them. */
  private current = 0

  onActivate(ctx: ToolContext): void {
    ctx.setCursor("crosshair")
    this.current = ctx.document.getSettings().anglePrecision
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
      values: { name: "AUPREC" },
      enter: { count: this.current },
    }
  }

  takes(): QuestionInput {
    return {
      refusal: "requiresIntegerBetween",
      values: { min: 0, max: MAX_PLACES },
    }
  }

  private answer(value: number, ctx: ToolContext): void {
    if (!Number.isInteger(value) || value < 0 || value > MAX_PLACES) {
      ctx.report(
        ctx.text.message("requiresIntegerBetween", { min: 0, max: MAX_PLACES }),
        "error"
      )
      return
    }
    if (value !== this.current) {
      ctx.execute(new UpdateSettingsCommand({ anglePrecision: value }))
    }
    ctx.endCommand()
  }
}
