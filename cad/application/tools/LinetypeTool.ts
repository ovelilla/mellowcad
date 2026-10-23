import { Vec2 } from "../../geometry/Vec2"
import {
  DEFAULT_LINETYPE_ID,
  LINETYPE_BYLAYER,
  LINETYPES,
  LinetypeId,
} from "../../domain/linetypes"
import { matchesWildcard } from "../../shared/wildcard"
import type { PromptId } from "../../locales/types"
import { UpdateSettingsCommand } from "../commands/settingsCommands"
import {
  CommandOption,
  CommandOptionOutcome,
  PointerInput,
  Tool,
  ToolContext,
  ToolQuestion,
} from "./Tool"

/**
 * Set's ByLayer keyword, by the global word `_` selects: `_BYL` (properties/p229).
 * WHY not the table's `BYLAYER`: an id is its global word, and that one has
 * no abbreviation short of itself.
 */
const BY_LAYER = "BYLayer"

/**
 * The loaded linetypes as Set's `?` lists them: by name, case aside
 * (`CENTER`, `Continuous`, `DASHDOT`, properties/p217).
 */
const BY_NAME = [...LINETYPES].sort((a, b) =>
  a.id.toUpperCase() < b.id.toUpperCase() ? -1 : 1
)

/** The width AutoCAD's listing gives a quoted name before its description. */
const NAME_COLUMN = 17

/**
 * AutoCAD's -LINETYPE, which LINETYPE runs too (its Linetype Manager does not
 * exist here): `Current line type:  "ByLayer"`, then `Enter an option
 * [?/Create/Load/Set]:`, asked again after each answer until Enter. Set
 * (`Specify linetype name or [?] <ByLayer>:`) sets CELTYPE, the linetype new
 * objects take, saved in the drawing and undone with U: a linetype's name,
 * or ByLayer; its `?` lists the loaded linetypes, sorted by name. Every
 * linetype this build ships is loaded, so `?` at the first prompt — the
 * linetypes of a LIN file, acadiso.lin's, a metric drawing's (probe
 * line/p205) — lists the same ones but Continuous, which is no file's
 * (properties/p202). A name that is not one of them says it is not in
 * acad.lin, as 2027 says even in a metric drawing (table 20995, p213), and
 * asks for the option again.
 *
 * Not done: Create and Load (there is no LIN file to read or write), ByBlock,
 * the file `?` asks for and its paging (`Press ENTER to continue:`, p205).
 */
export class LinetypeTool implements Tool {
  readonly id = "linetype"

  private phase: "option" | "name" | "list" = "option"
  private lastScreen: Vec2 | null = null
  /** The linetype Enter keeps at Set, as the prompt offers it. */
  private current = ""

  onActivate(ctx: ToolContext): void {
    ctx.setCursor("crosshair")
    ctx.report(
      ctx.text.message("currentLinetype", { name: this.currentName(ctx) })
    )
    this.askOption(ctx)
  }

  onDeactivate(ctx: ToolContext): void {
    this.phase = "option"
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
    switch (this.phase) {
      case "option":
        return "enterAnOption"
      case "name":
        return { id: "linetypeName", enter: { name: this.current } }
      case "list":
        return { id: "linetypeListNames", enter: { name: "*" } }
    }
  }

  commandOptions(): readonly CommandOption[] {
    switch (this.phase) {
      case "option":
        return [{ id: "?" }, { id: "Set" }]
      case "name":
        return [{ id: "?" }]
      default:
        return []
    }
  }

  invokeOption(id: string, ctx: ToolContext): CommandOptionOutcome {
    if (this.phase === "option" && id === "Set") {
      this.askName(ctx)
      return "continue"
    }
    if (this.phase === "option" && id === "?") {
      this.listFile(ctx)
      this.askOption(ctx)
      return "continue"
    }
    if (this.phase === "name" && id === "?") {
      this.askList(ctx)
      return "continue"
    }
    return "unhandled"
  }

  /** `Enter an option [?/Set]:`, keywords alone; Enter ends the command. */
  private askOption(ctx: ToolContext): void {
    this.phase = "option"
    ctx.dynamicInput.open({ fields: [], commit: () => {} })
    this.place(ctx)
  }

  private askName(ctx: ToolContext): void {
    this.phase = "name"
    this.current = this.currentName(ctx)
    this.openText(ctx, (typed, commitCtx) => this.answerName(typed, commitCtx))
  }

  private askList(ctx: ToolContext): void {
    this.phase = "list"
    this.openText(ctx, (typed, commitCtx) => {
      this.listLoaded(typed === "" ? "*" : typed, commitCtx)
      this.askOption(commitCtx)
    })
  }

  private openText(
    ctx: ToolContext,
    answer: (typed: string, ctx: ToolContext) => void
  ): void {
    ctx.dynamicInput.open({
      fields: [{ id: "name", prompt: this.questionId(), kind: "text" }],
      commit: () => {},
      commitRaw: (commitCtx) => {
        answer(commitCtx.dynamicInput.getText("name").trim(), commitCtx)
        return true
      },
    })
    this.place(ctx)
  }

  private questionId(): PromptId {
    const asked = this.question()
    return typeof asked === "string" ? asked : asked.id
  }

  private answerName(typed: string, ctx: ToolContext): void {
    if (typed === "?") return this.askList(ctx)
    if (typed === "") return this.askOption(ctx)
    // The table's name `ByLayer` is taken whole in any language, beside the
    // keyword of the command language (Spanish `BYLAYER`, p224).
    const byLayer =
      typed.toUpperCase() === LINETYPE_BYLAYER.toUpperCase() ||
      ctx.text.resolveKeyword(typed, [BY_LAYER]) === BY_LAYER
    const linetype: LinetypeId | null = byLayer
      ? LINETYPE_BYLAYER
      : (LINETYPES.find(
          (entry) => entry.id.toUpperCase() === typed.toUpperCase()
        )?.id ?? null)
    if (linetype === null) {
      ctx.report(ctx.text.message("linetypeNotFound", { name: typed }))
      return this.askOption(ctx)
    }
    if (linetype !== ctx.document.getSettings().currentLinetype) {
      ctx.execute(new UpdateSettingsCommand({ currentLinetype: linetype }))
    }
    this.askOption(ctx)
  }

  /** Set's `?`: the loaded linetypes matching `patterns`, as AutoCAD lists them. */
  private listLoaded(patterns: string, ctx: ToolContext): void {
    const wanted = patterns.split(",").map((part) => part.trim())
    const matching = BY_NAME.filter((entry) =>
      wanted.some((pattern) => matchesWildcard(entry.id, pattern))
    )
    // WHY the blank line under the heading, which the console leaves out
    // (p214): the desktop's is unverified (PROPS-D27).
    const heading = [ctx.text.message("loadedLinetypes"), ""]
    // No match: the words follow the dashes on their line (p218).
    ctx.report(
      matching.length === 0
        ? [
            ...heading,
            ctx.text.message("linetypeColumns") +
              ctx.text.message("noMatchingLinetypes"),
          ].join("\n")
        : [
            ...heading,
            ctx.text.message("linetypeColumns"),
            ...this.rows(matching, ctx),
          ].join("\n")
    )
  }

  /**
   * The first prompt's `?`: acadiso.lin's linetypes, every one of them
   * loaded, in the file's order, which is by name for these (p202).
   */
  private listFile(ctx: ToolContext): void {
    ctx.report(
      [
        ctx.text.message("linetypesInFile", { file: "acadiso.lin" }),
        "",
        ctx.text.message("fileLinetypeColumns"),
        ...this.rows(
          BY_NAME.filter((entry) => entry.id !== DEFAULT_LINETYPE_ID),
          ctx
        ),
      ].join("\n")
    )
  }

  /**
   * `"Continuous"     Solid line`. WHY no description but Continuous's: the
   * others are acadiso.lin's, which is not shipped to quote them from.
   */
  private rows(
    entries: readonly (typeof LINETYPES)[number][],
    ctx: ToolContext
  ): string[] {
    return entries.map((entry) => {
      const name = `"${entry.id}"`
      return entry.id === DEFAULT_LINETYPE_ID
        ? name.padEnd(NAME_COLUMN) + ctx.text.message("solidLine")
        : name
    })
  }

  private currentName(ctx: ToolContext): string {
    const current = ctx.document.getSettings().currentLinetype
    return current === LINETYPE_BYLAYER
      ? ctx.text.message("linetypeByLayer")
      : current
  }

  private place(ctx: ToolContext): void {
    ctx.dynamicInput.setPosition(this.lastScreen ?? { x: 0, y: 0 })
    ctx.requestRender()
  }
}
