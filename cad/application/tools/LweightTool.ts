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
  Tool,
  ToolContext,
} from "./Tool"

const BY_LAYER = "BYLAYER"

/**
 * The `?` listing's columns, as AutoCAD 2023's console lays them out: six
 * lineweights a line, spaced in threes.
 */
const GAPS = [" ", "  ", "    ", " ", "  "]

/**
 * AutoCAD's -LWEIGHT, which LWEIGHT runs too (its Lineweight Settings dialog
 * does not exist here): it shows the current lineweight, then asks
 * `Enter default lineweight for new objects or [?]:` and sets CELWEIGHT, the
 * lineweight new objects take, saved in the drawing and undone with U. A
 * value in millimetres "that is not valid" is set to "the nearest valid
 * value"; `bylayer` is ByLayer; `?` lists the valid ones and asks again; Enter
 * keeps the current one.
 *
 * Not done: ByBlock and Default (neither is modelled), inches.
 */
export class LweightTool implements Tool {
  readonly id = "lweight"

  private lastScreen: Vec2 | null = null

  onActivate(ctx: ToolContext): void {
    ctx.setCursor("crosshair")
    ctx.report(
      ctx.text.message("currentLineweight", {
        value: this.lineweightWord(
          ctx.document.getSettings().currentLineweight,
          ctx
        ),
      })
    )
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
    ctx.dynamicInput.open({
      fields: [{ id: "lineweight", prompt: "defaultLineweight", kind: "text" }],
      commit: () => {},
      commitRaw: (commitCtx) => {
        this.answer(
          commitCtx.dynamicInput.getText("lineweight").trim(),
          commitCtx
        )
        return true
      },
    })
    ctx.dynamicInput.setLiveText(
      "lineweight",
      this.lineweightWord(ctx.document.getSettings().currentLineweight, ctx)
    )
    ctx.dynamicInput.setPosition(this.lastScreen ?? { x: 0, y: 0 })
    ctx.requestRender()
  }

  private answer(typed: string, ctx: ToolContext): void {
    if (typed === "") return ctx.endCommand()
    if (typed === "?") {
      ctx.report(listing(ctx))
      return this.ask(ctx)
    }
    const value = parseNumber(typed)
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
    return lineweight === LINEWEIGHT_BYLAYER
      ? ctx.text.keywordList([BY_LAYER]).toUpperCase()
      : lineweightLabel(lineweight)
  }
}

/** The valid lineweight nearest `value`, in millimetres; the thinner on a tie. */
export function nearestLineweight(value: number): Lineweight {
  return LINEWEIGHTS.reduce((best, candidate) =>
    Math.abs(candidate - value) < Math.abs(best - value) ? candidate : best
  )
}

/**
 * The valid lineweights as `?` lists them, after ByLayer. WHY not ByBlock
 * and Default, which AutoCAD's listing names first: neither is modelled.
 */
function listing(ctx: ToolContext): string {
  const lines = [ctx.text.message("linetypeByLayer")]
  for (let at = 0; at < LINEWEIGHTS.length; at += GAPS.length + 1) {
    const row = LINEWEIGHTS.slice(at, at + GAPS.length + 1).map(lineweightLabel)
    lines.push(
      row.map((label, i) => (i > 0 ? GAPS[i - 1] : "") + label).join("")
    )
  }
  return lines.join("\n")
}
