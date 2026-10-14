import { Vec2 } from "../../geometry/Vec2"
import { UndoSettings } from "../commands/Command"
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

/** Control's keywords that set it. */
const CONTROLS = { All: "all", None: "none", One: "one" } as const

function isControl(id: string): id is keyof typeof CONTROLS {
  return Object.hasOwn(CONTROLS, id)
}

type Phase =
  "count" | "one" | "everything" | "control" | "combine" | "layer" | "auto"

/**
 * AutoCAD's UNDO, as AutoCAD 2023's console answers it (acc/w1–w16,
 * x1–x15 of the hidden UCS words session, k1–k16 and h1–h44 of the -PAN
 * session): a number of operations (Enter one) taken back as U takes back
 * one, Mark and Back to it, BEgin (and the older Group) and End, whose group
 * U takes back whole. Back with no mark asks before taking back everything.
 * Control keeps every step, the last one (One, whose prompt offers Control
 * alone) or none (None, where UNDO asks Control at once), and sets Combine
 * and Layer; Auto is asked and said in the settings line. WHY Auto changes
 * nothing else: it makes one step of a menu macro's commands, and no menu
 * here runs more than one. WHY Layer changes nothing else: what it joins is
 * the Layer Properties Manager's changes, which the console cannot show
 * (LAYER hangs it).
 */
export class UndoTool implements Tool {
  readonly id = "undo"

  private phase: Phase = "count"
  /** Auto as the command found it, which Auto's prompt offers. */
  private auto = true
  private lastScreen: Vec2 | null = null

  onActivate(ctx: ToolContext): void {
    ctx.setCursor("crosshair")
    const settings = ctx.undoHistory.settings()
    ctx.report(ctx.text.message("undoSettings", settingsValues(settings)))
    this.auto = settings.auto
    if (settings.control === "none") this.ask("control", ctx)
    else this.ask(settings.control === "one" ? "one" : "count", ctx)
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
  // default (`This will undo everything. OK? <Y>`, acc/w3). Auto's default
  // is the setting's own word (`<On>`), not the keyword listed (`ON`).
  question(): ToolQuestion {
    switch (this.phase) {
      case "count":
        return { id: "undoCount", enter: { count: 1 } }
      case "one":
        return { id: "enterAnOption", enter: { count: 1 } }
      case "everything":
        return { id: "undoEverything", enter: "undoYes", open: true }
      case "control":
        return { id: "undoControl" }
      case "combine":
        return { id: "undoCombine" }
      case "layer":
        return { id: "undoLayer" }
      case "auto":
        return { id: "undoAuto", enter: this.auto ? "undoOn" : "undoOff" }
    }
  }

  /** The keyword `<All>` and `<Yes>` name, whatever the setting (acc/k8). */
  defaultOption(): string | null {
    if (this.phase === "control") return "All"
    return this.phase === "combine" || this.phase === "layer" ? "Yes" : null
  }

  takes(): QuestionInput | null {
    switch (this.phase) {
      case "count":
        return {
          refusal: "requiresIntegerBetweenOrKeyword",
          values: { min: 1, max: MAX_OPERATIONS },
        }
      case "one":
        return {
          refusal: "requiresIntegerValueOrKeyword",
          values: { value: 1 },
        }
      case "everything":
      case "combine":
      case "layer":
        return { refusal: "yesOrNoPlease" }
      default:
        return null
    }
  }

  commandOptions(): readonly CommandOption[] {
    switch (this.phase) {
      case "count":
        return [
          { id: "Auto" },
          { id: "Control" },
          { id: "BEgin" },
          { id: "End" },
          { id: "Mark" },
          { id: "Back" },
          { id: "Group", hidden: true },
        ]
      case "one":
        return [{ id: "Control" }]
      case "everything":
        return [
          { id: "Yes", hidden: true },
          { id: "No", hidden: true },
        ]
      case "control":
        return [
          { id: "All" },
          { id: "None" },
          { id: "One" },
          { id: "Combine" },
          { id: "Layer" },
        ]
      case "combine":
      case "layer":
        return [{ id: "Yes" }, { id: "No" }]
      case "auto":
        return [{ id: "ON" }, { id: "OFF" }]
    }
  }

  invokeOption(id: string, ctx: ToolContext): CommandOptionOutcome {
    const history = ctx.undoHistory
    switch (this.phase) {
      case "everything":
        if (id === "Yes") history.takeBack("mark")
        return id === "Yes" || id === "No" ? "end" : "unhandled"
      case "control":
        if (id === "Combine" || id === "Layer") {
          this.ask(id === "Combine" ? "combine" : "layer", ctx)
          return "continue"
        }
        if (!isControl(id)) return "unhandled"
        history.configure({ control: CONTROLS[id] })
        return "end"
      case "combine":
      case "layer":
        if (id !== "Yes" && id !== "No") return "unhandled"
        history.configure(joins(this.phase, id === "Yes"))
        return "end"
      case "auto":
        if (id !== "ON" && id !== "OFF") return "unhandled"
        history.configure({ auto: id === "ON" })
        return "end"
    }
    if (id === "Control") {
      this.ask("control", ctx)
      return "continue"
    }
    if (this.phase === "one") return "unhandled"
    switch (id) {
      case "Auto":
        this.ask("auto", ctx)
        return "continue"
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
        this.ask("everything", ctx)
        return "continue"
      default:
        return "unhandled"
    }
  }

  /**
   * Enter takes everything back at Back's question, as its `<Y>` says, sets
   * All at Control's and Yes at Combine's and Layer's.
   */
  onEnter(ctx: ToolContext): boolean {
    const history = ctx.undoHistory
    switch (this.phase) {
      case "everything":
        history.takeBack("mark")
        break
      case "control":
        history.configure({ control: "all" })
        break
      case "combine":
      case "layer":
        history.configure(joins(this.phase, true))
        break
      default:
        return false
    }
    ctx.endCommand()
    return true
  }

  private ask(phase: Phase, ctx: ToolContext): void {
    this.phase = phase
    if (phase === "count" || phase === "one") {
      ctx.dynamicInput.open({
        fields: [{ id: "count", kind: "number" }],
        commit: (values, commitCtx) => this.answer(values.count, commitCtx),
      })
      ctx.dynamicInput.setDefault("count", 1)
    } else ctx.dynamicInput.open({ fields: [], commit: () => {} })
    ctx.dynamicInput.setPosition(this.lastScreen ?? { x: 0, y: 0 })
    ctx.requestRender()
  }

  private answer(count: number, ctx: ToolContext): void {
    const max = this.phase === "one" ? 1 : MAX_OPERATIONS
    if (!Number.isInteger(count) || count < 1 || count > max) {
      ctx.report(
        this.phase === "one"
          ? ctx.text.message("requiresIntegerValueOrKeyword", { value: 1 })
          : ctx.text.message("requiresIntegerBetweenOrKeyword", {
              min: 1,
              max,
            }),
        "error"
      )
      return
    }
    ctx.undoHistory.takeBack(count)
    ctx.endCommand()
  }
}

/** Combine or Layer set `on`. */
function joins(phase: "combine" | "layer", on: boolean): Partial<UndoSettings> {
  return phase === "combine" ? { combine: on } : { layer: on }
}

/** The settings line's words for each setting. */
function settingsValues(settings: UndoSettings) {
  return {
    auto: settings.auto ? "on" : "off",
    control: settings.control,
    combine: settings.combine ? "yes" : "no",
    layer: settings.layer ? "yes" : "no",
  }
}
