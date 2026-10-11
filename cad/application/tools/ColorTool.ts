import { Vec2 } from "../../geometry/Vec2"
import {
  COLOR_BYLAYER,
  EntityColor,
  STANDARD_COLORS,
} from "../../domain/colors"
import { UpdateSettingsCommand } from "../commands/settingsCommands"
import type { PromptId } from "../../locales/types"
import {
  CommandOption,
  CommandOptionOutcome,
  PointerInput,
  Tool,
  ToolContext,
  ToolQuestion,
} from "./Tool"

/** The words -COLOR reads as a colour: ByLayer and the first seven index colours, by name. */
const BY_LAYER = "BYLAYER"
const NAMES: readonly string[] = STANDARD_COLORS.map((color) =>
  color.id.toUpperCase()
)

/**
 * AutoCAD's -COLOR, which COLOR runs too (its Select Color dialog does not
 * exist here): `Enter default object color [Truecolor/COlorbook] <BYLAYER>:`
 * sets CECOLOR, the colour new objects take, saved in the drawing and undone
 * with U. It takes the number (1–7) or the name of an index colour, or
 * `bylayer`; Truecolor asks three values from 0 to 255 separated by commas.
 * Enter keeps the current colour.
 *
 * Not done: the index colours 8–255 (their RGB values are not in the help),
 * ByBlock (not modelled), Colorbook. Anything else asks again.
 */
export class ColorTool implements Tool {
  readonly id = "color"

  private phase: "color" | "trueColor" = "color"
  private lastScreen: Vec2 | null = null
  /** The colour Enter keeps, as the prompt offers it. */
  private current = ""

  onActivate(ctx: ToolContext): void {
    ctx.setCursor("crosshair")
    this.askColor(ctx)
  }

  onDeactivate(ctx: ToolContext): void {
    this.phase = "color"
    ctx.dynamicInput.close()
  }

  onPointerMove(input: PointerInput, ctx: ToolContext): void {
    this.lastScreen = input.screen
    ctx.dynamicInput.setPosition(input.screen)
  }

  wantsSnap(): boolean {
    return false
  }

  question(): PromptId | ToolQuestion {
    return this.phase === "color"
      ? { id: "defaultObjectColor", enter: { name: this.current } }
      : "trueColor"
  }

  commandOptions(): readonly CommandOption[] {
    return this.phase === "color" ? [{ id: "Truecolor" }] : []
  }

  invokeOption(id: string, ctx: ToolContext): CommandOptionOutcome {
    if (this.phase !== "color" || id !== "Truecolor") return "unhandled"
    this.askTrueColor(ctx)
    return "continue"
  }

  private askColor(ctx: ToolContext): void {
    this.phase = "color"
    this.current = this.colorWord(ctx)
    ctx.dynamicInput.open({
      fields: [{ id: "color", prompt: "defaultObjectColor", kind: "text" }],
      commit: () => {},
      commitRaw: (commitCtx) => this.answerColor(commitCtx),
    })
    ctx.dynamicInput.setLiveText("color", this.colorWord(ctx))
    ctx.dynamicInput.setPosition(this.lastScreen ?? { x: 0, y: 0 })
    ctx.requestRender()
  }

  private askTrueColor(ctx: ToolContext): void {
    this.phase = "trueColor"
    ctx.dynamicInput.open({
      fields: [{ id: "rgb", prompt: "trueColor", kind: "text" }],
      commit: () => {},
      commitRaw: (commitCtx) => {
        const color = parseRgb(commitCtx.dynamicInput.getText("rgb"))
        if (color) {
          this.finish(color, commitCtx)
          return true
        }
        commitCtx.report(commitCtx.text.message("invalidTrueColor"), "error")
        this.askTrueColor(commitCtx)
        return true
      },
    })
    ctx.dynamicInput.setPosition(this.lastScreen ?? { x: 0, y: 0 })
    ctx.requestRender()
  }

  private answerColor(ctx: ToolContext): boolean {
    const typed = ctx.dynamicInput.getText("color").trim()
    if (typed === "") {
      ctx.endCommand()
      return true
    }
    const index = /^\d+$/.test(typed) ? Number(typed) : null
    if (index !== null) {
      const standard = STANDARD_COLORS[index - 1]
      if (standard) this.finish(standard.value, ctx)
      else {
        // WHY nothing said for 8 to 255: AutoCAD takes them, and only their
        // RGB values are missing here.
        if (index < 1 || index > 255) {
          ctx.report(ctx.text.message("invalidColorNumber"), "error")
        }
        this.askColor(ctx)
      }
      return true
    }
    const word = ctx.text.resolveKeyword(typed, [
      "Truecolor",
      BY_LAYER,
      ...NAMES,
    ])
    if (word === "Truecolor") this.askTrueColor(ctx)
    else if (word === BY_LAYER) this.finish(COLOR_BYLAYER, ctx)
    else if (word !== null) {
      this.finish(STANDARD_COLORS[NAMES.indexOf(word)].value, ctx)
    } else {
      ctx.report(ctx.text.message("colorRequired"), "error")
      this.askColor(ctx)
    }
    return true
  }

  private finish(
    color: EntityColor | typeof COLOR_BYLAYER,
    ctx: ToolContext
  ): void {
    if (color !== ctx.document.getSettings().currentColor) {
      ctx.execute(new UpdateSettingsCommand({ currentColor: color }))
    }
    ctx.endCommand()
  }

  /**
   * The current colour as AutoCAD's console offers it: `BYLAYER`, an index
   * colour by number and name, `1 (red)`, or `R,G,B`.
   */
  private colorWord(ctx: ToolContext): string {
    const current = ctx.document.getSettings().currentColor
    if (current === COLOR_BYLAYER) {
      return ctx.text.keyword(BY_LAYER).toUpperCase()
    }
    const index = STANDARD_COLORS.findIndex((color) => color.value === current)
    if (index >= 0) {
      return `${index + 1} (${ctx.text.keyword(NAMES[index]).toLowerCase()})`
    }
    return rgbOf(current).join(",")
  }
}

/** `210,155,95` → `#d29b5f`; null unless three integers from 0 to 255. */
function parseRgb(text: string): EntityColor | null {
  const parts = text.split(",").map((part) => part.trim())
  if (parts.length !== 3 || !parts.every((part) => /^\d{1,3}$/.test(part))) {
    return null
  }
  const values = parts.map(Number)
  if (values.some((value) => value > 255)) return null
  return `#${values.map((value) => value.toString(16).padStart(2, "0")).join("")}`
}

function rgbOf(color: EntityColor): number[] {
  return [1, 3, 5].map((at) => parseInt(color.slice(at, at + 2), 16))
}
