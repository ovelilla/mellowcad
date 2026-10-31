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
  QuestionInput,
  Tool,
  ToolContext,
  ToolQuestion,
} from "./Tool"
import { askValueOrWord } from "./valueWordPrompt"

/** The words -COLOR reads as a colour: ByLayer and the first seven index colours, by name. */
const BY_LAYER = "BYLAYER"
const BY_BLOCK = "BYBLOCK"
const NAMES: readonly string[] = STANDARD_COLORS.map((color) =>
  color.id.toUpperCase()
)

/**
 * Table 26289's words, which the prompt declares and leaves out of its list,
 * hidden and in its order so that a letter answers the one AutoCAD's does:
 * Spanish `C` is porCapa, not COlorverdadero (properties/p113c), and `BY`
 * asks `BYBlock or BYLayer?` (p139t). ByBlock is not modelled: refused.
 */
const HIDDEN: readonly CommandOption[] = [...NAMES, BY_BLOCK, BY_LAYER].map(
  (id) => ({ id, hidden: true })
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
 *
 * Its prompt is an integer prompt that takes words (properties/p113c's
 * trace), so its box is a value's, not a text's: `askValueOrWord`.
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

  takes(): QuestionInput | null {
    return this.phase === "color" ? { refusal: "colorRequired" } : null
  }

  commandOptions(): readonly CommandOption[] {
    return this.phase === "color" ? [{ id: "Truecolor" }, ...HIDDEN] : []
  }

  invokeOption(id: string, ctx: ToolContext): CommandOptionOutcome {
    if (this.phase !== "color") return "unhandled"
    if (id === "Truecolor") this.askTrueColor(ctx)
    else if (id === BY_LAYER) this.finish(COLOR_BYLAYER, ctx)
    else if (NAMES.includes(id)) {
      this.finish(STANDARD_COLORS[NAMES.indexOf(id)].value, ctx)
    } else return "unhandled"
    return "continue"
  }

  private askColor(ctx: ToolContext): void {
    this.phase = "color"
    this.current = this.colorWord(ctx)
    askValueOrWord(
      ctx,
      {
        field: "color",
        prompt: "defaultObjectColor",
        shown: this.current,
        at: this.lastScreen,
      },
      (typed, answerCtx) => this.answerColor(typed, answerCtx)
    )
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

  private answerColor(typed: string, ctx: ToolContext): void {
    if (typed === "") return ctx.endCommand()
    // A signed integer is a colour number, as AutoCAD's integer prompt reads
    // it: −1 is refused as one (p106).
    if (/^[-+]?\d+$/.test(typed)) {
      const index = Number(typed)
      const standard = STANDARD_COLORS[index - 1]
      if (standard) return this.finish(standard.value, ctx)
      // WHY nothing said for 8 to 255: AutoCAD takes them, and only their
      // RGB values are missing here.
      if (index < 1 || index > 255) {
        ctx.report(ctx.text.message("invalidColorNumber"), "error")
      }
      return this.askColor(ctx)
    }
    // Spanish AutoCAD takes the standard names whole in English too, bare:
    // `RED`, `BYLAYER` (p107b, p113b). Every other word is a hidden option.
    const english = typed.toUpperCase()
    if (english === BY_LAYER) return this.finish(COLOR_BYLAYER, ctx)
    if (NAMES.includes(english)) {
      return this.finish(STANDARD_COLORS[NAMES.indexOf(english)].value, ctx)
    }
    ctx.report(ctx.text.message("colorRequired"), "error")
    this.askColor(ctx)
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
    return colorWord(current, ctx)
  }
}

/**
 * A colour as the console writes it, -COLOR's default and LIST's `Color:`
 * (inquiry/p401): an index colour by number and name, `1 (red)`, or `R,G,B`.
 */
export function colorWord(color: EntityColor, ctx: ToolContext): string {
  const index = STANDARD_COLORS.findIndex((entry) => entry.value === color)
  if (index >= 0) {
    const name = ctx.text.commandKeyword("COLOR", NAMES[index])
    return `${index + 1} (${name.toLowerCase()})`
  }
  return rgbOf(color).join(",")
}

/**
 * `210,155,95` → `#d29b5f`; null unless three integers from 0 to 255. No
 * space between them: AutoCAD's Space is the prompt's Enter (p139s).
 */
function parseRgb(text: string): EntityColor | null {
  const parts = text.trim().split(",")
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
