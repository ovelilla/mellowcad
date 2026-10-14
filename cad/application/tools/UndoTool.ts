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

/** The largest number UNDO takes. */
const MAX_OPERATIONS = 32767

/**
 * AutoCAD's UNDO, as AutoCAD 2023's console answers it (acc/w1–w16,
 * x1–x15 of the hidden UCS words session): a number of operations (Enter
 * one) taken back as U takes back one, Mark and Back to it, BEgin (and the
 * older Group) and End, whose group U takes back whole. Back with no mark
 * asks before taking back everything. WHY no Auto or Control: Auto groups a
 * menu macro's commands, which a menu here never runs several of, and
 * Control (None, One, Combine, Layer) narrows an undo this app keeps whole;
 * neither is listed nor taken, and the settings line says the defaults.
 */
export class UndoTool implements Tool {
  readonly id = "undo"

  private phase: "count" | "everything" = "count"
  private lastScreen: Vec2 | null = null

  onActivate(ctx: ToolContext): void {
    ctx.setCursor("crosshair")
    ctx.report(ctx.text.message("undoSettings"))
    this.phase = "count"
    ctx.dynamicInput.open({
      fields: [{ id: "count", kind: "number" }],
      commit: (values, commitCtx) => this.answer(values.count, commitCtx),
    })
    ctx.dynamicInput.setDefault("count", 1)
    this.place(ctx)
  }

  onDeactivate(ctx: ToolContext): void {
    this.phase = "count"
    ctx.dynamicInput.close()
  }

  onPointerMove(input: PointerInput, ctx: ToolContext): void {
    this.lastScreen = input.screen
    ctx.dynamicInput.setPosition(input.screen)
  }

  wantsSnap(): boolean {
    return false
  }

  // WHY no colon after `<Y>`: AutoCAD's yes-or-no question here ends at its
  // default (`This will undo everything. OK? <Y>`, acc/w3).
  question(): ToolQuestion {
    return this.phase === "count"
      ? { id: "undoCount", enter: { count: 1 } }
      : { id: "undoEverything", enter: "undoYes", open: true }
  }

  takes(): QuestionInput {
    return this.phase === "count"
      ? {
          refusal: "requiresIntegerBetweenOrKeyword",
          values: { min: 1, max: MAX_OPERATIONS },
        }
      : { refusal: "yesOrNoPlease" }
  }

  commandOptions(): readonly CommandOption[] {
    if (this.phase === "everything") {
      return [
        { id: "Yes", hidden: true },
        { id: "No", hidden: true },
      ]
    }
    return [
      { id: "BEgin" },
      { id: "End" },
      { id: "Mark" },
      { id: "Back" },
      { id: "Group", hidden: true },
    ]
  }

  invokeOption(id: string, ctx: ToolContext): CommandOptionOutcome {
    const history = ctx.undoHistory
    if (this.phase === "everything") {
      if (id === "Yes") history.takeBack("mark")
      return id === "Yes" || id === "No" ? "end" : "unhandled"
    }
    switch (id) {
      case "BEgin":
      case "Group":
        history.begin()
        return "end"
      case "End":
        history.end()
        return "end"
      case "Mark":
        history.mark()
        return "end"
      case "Back":
        if (history.backStops()) {
          history.takeBack("mark")
          return "end"
        }
        this.phase = "everything"
        ctx.dynamicInput.open({ fields: [], commit: () => {} })
        this.place(ctx)
        return "continue"
      default:
        return "unhandled"
    }
  }

  /** Enter at the question takes everything back, as its `<Y>` says. */
  onEnter(ctx: ToolContext): boolean {
    if (this.phase !== "everything") return false
    ctx.undoHistory.takeBack("mark")
    ctx.endCommand()
    return true
  }

  private answer(count: number, ctx: ToolContext): void {
    if (!Number.isInteger(count) || count < 1 || count > MAX_OPERATIONS) {
      ctx.report(
        ctx.text.message("requiresIntegerBetweenOrKeyword", {
          min: 1,
          max: MAX_OPERATIONS,
        }),
        "error"
      )
      return
    }
    ctx.undoHistory.takeBack(count)
    ctx.endCommand()
  }

  private place(ctx: ToolContext): void {
    ctx.dynamicInput.setPosition(this.lastScreen ?? { x: 0, y: 0 })
    ctx.requestRender()
  }
}
