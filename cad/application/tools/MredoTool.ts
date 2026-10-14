import { Vec2 } from "../../geometry/Vec2"
import {
  CommandOption,
  CommandOptionOutcome,
  PointerInput,
  QuestionInput,
  Tool,
  ToolContext,
  ToolQuestion,
} from "./Tool"

/** The largest number MREDO takes. */
const MAX_ACTIONS = 32767

/**
 * AutoCAD's MREDO, as AutoCAD 2023's console answers it (acc/m1–m18,
 * n1–n30): a number of the steps the undos took back done again, All of
 * them, or Last, the last undo's whole. Enter is one, though the prompt
 * shows no default.
 */
export class MredoTool implements Tool {
  readonly id = "mredo"

  private lastScreen: Vec2 | null = null

  /** With UNDO Control None it asks nothing (acc/k2). */
  onActivate(ctx: ToolContext): void {
    if (ctx.undoHistory.settings().control === "none") {
      ctx.report(ctx.text.message("redoDisabled", { command: "mredo" }))
      ctx.endCommand()
      return
    }
    ctx.setCursor("crosshair")
    ctx.dynamicInput.open({
      fields: [{ id: "count", kind: "number" }],
      commit: (values, commitCtx) => this.answer(values.count, commitCtx),
    })
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
    return { id: "mredoCount" }
  }

  takes(): QuestionInput {
    return {
      refusal: "requiresIntegerBetweenOrKeyword",
      values: { min: 1, max: MAX_ACTIONS },
    }
  }

  commandOptions(): readonly CommandOption[] {
    return [{ id: "All" }, { id: "Last" }]
  }

  invokeOption(id: string, ctx: ToolContext): CommandOptionOutcome {
    if (id !== "All" && id !== "Last") return "unhandled"
    ctx.undoHistory.redo(id === "All" ? "all" : "last")
    return "end"
  }

  onEnter(ctx: ToolContext): boolean {
    ctx.undoHistory.redo(1)
    ctx.endCommand()
    return true
  }

  private answer(count: number, ctx: ToolContext): void {
    if (!Number.isInteger(count) || count < 1 || count > MAX_ACTIONS) {
      ctx.report(
        ctx.text.message("requiresIntegerBetweenOrKeyword", {
          min: 1,
          max: MAX_ACTIONS,
        }),
        "error"
      )
      return
    }
    ctx.undoHistory.redo(count)
    ctx.endCommand()
  }
}
