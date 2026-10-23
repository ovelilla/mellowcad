import { Vec2 } from "../../geometry/Vec2"
import {
  LINEWEIGHT_BYLAYER,
  LINEWEIGHTS,
  Lineweight,
  lineweightLabel,
} from "../../domain/lineweights"
import { parseNumber } from "../../domain/units"
import { UpdateSettingsCommand } from "../commands/settingsCommands"
import type { PromptId } from "../../locales/types"
import {
  CommandOption,
  CommandOptionOutcome,
  PointerInput,
  QuestionInput,
  Tool,
  ToolContext,
} from "./Tool"
import { askValueOrWord } from "./valueWordPrompt"

const BY_LAYER = "BYLAYER"

/**
 * The `?` listing's columns, as AutoCAD 2027's console lays them out
 * (properties/p151): six lineweights a line, spaced in threes.
 */
const GAPS = [" ", "  ", "    ", " ", "  "]

/**
 * AutoCAD's -LWEIGHT, which LWEIGHT runs too (its Lineweight Settings dialog
 * does not exist here): it shows the current lineweight, then asks
 * `Enter default lineweight for new objects or [?]:` and sets CELWEIGHT, the
 * lineweight new objects take, saved in the drawing and undone with U. A
 * value in millimetres "that is not valid" is set to "the nearest valid
 * value", a negative one refused (properties/p146); `bylayer` is ByLayer; `?`
 * lists the valid ones and asks again; Enter keeps the current one.
 *
 * Its prompt is a real prompt that takes words (p154's trace), so its box is
 * a value's, not a text's: `askValueOrWord`, and `'ZOOM` runs there (p165).
 * The words are no `initget` keywords there but text the command reads
 * itself: `resolveKeyword`.
 *
 * Not done: ByBlock and Default (neither is modelled), inches.
 */
export class LweightTool implements Tool {
  readonly id = "lweight"

  private lastScreen: Vec2 | null = null

  onActivate(ctx: ToolContext): void {
    ctx.setCursor("crosshair")
    const value = this.lineweightWord(
      ctx.document.getSettings().currentLineweight,
      ctx
    )
    // WHY headed twice transparently: AutoCAD 2027's console writes it as
    // two prompts, `>>Current lineweight: >>BYLAYER` (properties/p154).
    if (ctx.runsTransparently()) {
      ctx.report(
        ctx.text.message("currentLineweight", {
          value: ctx.text.transparentPrompt(value),
        }),
        "prompt"
      )
    } else {
      ctx.report(ctx.text.message("currentLineweight", { value }))
    }
    this.ask(ctx)
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

  question(): PromptId {
    return "defaultLineweight"
  }

  takes(): QuestionInput {
    return { refusal: "lineweightRequired" }
  }

  commandOptions(): readonly CommandOption[] {
    return [{ id: "?" }]
  }

  invokeOption(id: string, ctx: ToolContext): CommandOptionOutcome {
    if (id !== "?") return "unhandled"
    ctx.report(listing(ctx))
    this.ask(ctx)
    return "continue"
  }

  private ask(ctx: ToolContext): void {
    askValueOrWord(
      ctx,
      {
        field: "lineweight",
        prompt: "defaultLineweight",
        shown: this.lineweightWord(
          ctx.document.getSettings().currentLineweight,
          ctx
        ),
        at: this.lastScreen,
      },
      (typed, answerCtx) => this.answer(typed, answerCtx)
    )
  }

  private answer(typed: string, ctx: ToolContext): void {
    if (typed === "") return ctx.endCommand()
    if (typed === "?") {
      ctx.report(listing(ctx))
      return this.ask(ctx)
    }
    const value = parseNumber(typed)
    if (value !== null && value < 0) {
      ctx.report(ctx.text.message("invalidLineweightNumber"), "error")
      return this.ask(ctx)
    }
    const lineweight =
      value !== null
        ? nearestLineweight(value)
        : ctx.text.resolveKeyword(typed, [BY_LAYER]) === BY_LAYER
          ? LINEWEIGHT_BYLAYER
          : null
    if (lineweight === null) {
      ctx.report(ctx.text.message("lineweightRequired"), "error")
      return this.ask(ctx)
    }
    if (value !== null && lineweight !== value) {
      ctx.report(
        ctx.text.message("lineweightRounded", {
          value: lineweightLabel(nearestLineweight(value)),
        })
      )
    }
    if (lineweight !== ctx.document.getSettings().currentLineweight) {
      ctx.execute(new UpdateSettingsCommand({ currentLineweight: lineweight }))
    }
    ctx.endCommand()
  }

  private lineweightWord(
    lineweight: Lineweight | typeof LINEWEIGHT_BYLAYER,
    ctx: ToolContext
  ): string {
    // WHY not the keyword's word: Spanish AutoCAD writes BYLAYER and None's
    // `Ninguno` here, not `PORCAPA` (properties/p140).
    if (lineweight === LINEWEIGHT_BYLAYER) {
      return ctx.text.message("lineweightByLayer")
    }
    return lineweight === 0
      ? ctx.text.message("lineweightNone")
      : lineweightLabel(lineweight)
  }
}

const TIE_TOLERANCE = 1e-9

/**
 * The valid lineweight nearest `value`, in millimetres; the thinner on a tie
 * (0.325 is 0.30, properties/p143), measured with a tolerance: in floating
 * point 0.35 is nearer 0.325 than 0.30 is.
 */
export function nearestLineweight(value: number): Lineweight {
  return LINEWEIGHTS.reduce((best, candidate) =>
    Math.abs(candidate - value) < Math.abs(best - value) - TIE_TOLERANCE
      ? candidate
      : best
  )
}

/**
 * The valid lineweights as `?` lists them, after ByLayer, written so in
 * Spanish too (properties/p151). WHY not ByBlock and Default, which AutoCAD's
 * listing names first: neither is modelled.
 */
function listing(ctx: ToolContext): string {
  const lines = [ctx.text.message("lineweightListByLayer")]
  for (let at = 0; at < LINEWEIGHTS.length; at += GAPS.length + 1) {
    const row = LINEWEIGHTS.slice(at, at + GAPS.length + 1).map(lineweightLabel)
    lines.push(
      row.map((label, i) => (i > 0 ? GAPS[i - 1] : "") + label).join("")
    )
  }
  return lines.join("\n")
}
