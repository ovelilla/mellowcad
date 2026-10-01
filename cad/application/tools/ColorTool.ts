import { Vec2 } from "../../geometry/Vec2"
import {
  COLOR_BYLAYER,
  EntityColor,
  STANDARD_COLORS,
} from "../../domain/colors"
import { UpdateSettingsCommand } from "../commands/settingsCommands"
import {
  CommandOption,
  CommandOptionOutcome,
  PointerInput,
  Tool,
  ToolContext,
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
        if (color) this.finish(color, commitCtx)
        else this.askTrueColor(commitCtx)
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
      else this.askColor(ctx)
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
    } else this.askColor(ctx)
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

  /** The current colour as the prompt offers it: `BYLAYER`, `RED`, or `R,G,B`. */
  private colorWord(ctx: ToolContext): string {
    const current = ctx.document.getSettings().currentColor
    if (current === COLOR_BYLAYER) return ctx.text.keywordList([BY_LAYER])
    const index = STANDARD_COLORS.findIndex((color) => color.value === current)
    if (index >= 0) return ctx.text.keywordList([NAMES[index]])
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
