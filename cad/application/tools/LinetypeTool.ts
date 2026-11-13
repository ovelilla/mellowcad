import { Vec2 } from "../../geometry/Vec2"
import {
  DEFAULT_LINETYPE_ID,
  LINETYPE_BYLAYER,
  Linetype,
  LinetypeId,
  sameLinetypeName,
} from "../../domain/linetypes"
import { matchesWildcard } from "../../shared/wildcard"
import type { PromptId } from "../../locales/types"
import { LinetypeTableCommand, withLoaded } from "../commands/linetypeCommands"
import { UpdateSettingsCommand } from "../commands/settingsCommands"
import {
  ACADISO_FILE,
  acadisoFile,
  fileLinetype,
  linetypeFile,
} from "./linetypeFiles"
import {
  CommandOption,
  CommandOptionOutcome,
  PointerInput,
  QuestionInput,
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
 * AutoCAD's listing pads a quoted name to 15 and writes two spaces after it,
 * so a long one (`"ACAD_ISO02W100"`) pushes its description on (line/p205).
 */
const NAME_COLUMN = 15

type Phase =
  | { readonly kind: "option" }
  | { readonly kind: "name" }
  | { readonly kind: "list" }
  | { readonly kind: "listFile" }
  | { readonly kind: "loadNames" }
  | { readonly kind: "loadFile"; readonly names: string }
  /** `Linetype "X" is already loaded.  Reload it? <Y>`, asked of `found[index]`. */
  | {
      readonly kind: "reload"
      readonly found: readonly Linetype[]
      readonly index: number
      readonly loaded: readonly Linetype[]
    }

const YES_OR_NO: readonly CommandOption[] = [
  { id: "Yes", hidden: true },
  { id: "No", hidden: true },
]

/**
 * AutoCAD's -LINETYPE, which LINETYPE runs too (its Linetype Manager does not
 * exist here): `Current line type:  "ByLayer"`, then `Enter an option
 * [?/Create/Load/Set]:`, asked again after each answer until Enter.
 *
 * - `?` asks the file to list (`<acadiso.lin>`, the metric drawing's) and
 *   lists its linetypes with their descriptions, in the file's order
 *   (line/p205).
 * - Load asks the linetypes to load (names, `,`-separated, wildcards) and the
 *   file to search (`<acadiso.lin>`, then the one last searched, ltype/p08),
 *   and loads each match in the file's order, `Linetype "X" loaded.`; one
 *   already loaded is asked `Reload it? <Y>` (ltype/p01). No match, or a file
 *   it cannot find, is said (ltype/p02, p08).
 * - Set (`Specify linetype name or [?] <ByLayer>:`) sets CELTYPE, the
 *   linetype new objects take, saved in the drawing: a loaded linetype's
 *   name, or ByLayer; one not loaded that acadiso.lin has is loaded first,
 *   saying nothing (ltype/p03); any other says it is not in acad.lin, as 2027
 *   says even in a metric drawing (table 20995, p213). Its `?` lists the
 *   loaded linetypes, sorted by name.
 *
 * The whole run is one undo step. Not done: Create (there is no LIN file to
 * write), ByBlock, the listing's pages (`Press ENTER to continue:`, p205).
 * WHY every language reads the English acadiso.lin, where a Spanish AutoCAD
 * reads its own (`TRAZOS`): the six every drawing holds are English in every
 * language here (`LINETYPES`), and a linetype's name is drawing data.
 */
export class LinetypeTool implements Tool {
  readonly id = "linetype"

  private phase: Phase = { kind: "option" }
  private lastScreen: Vec2 | null = null
  /** The linetype Enter keeps at Set, as the prompt offers it. */
  private current = ""
  /** The file Load searched last, which it offers next (ltype/p08): kept for the session. */
  private searched = ACADISO_FILE

  onActivate(ctx: ToolContext): void {
    ctx.setCursor("crosshair")
    ctx.report(
      ctx.text.message("currentLinetype", { name: this.currentName(ctx) })
    )
    this.askOption(ctx)
  }

  onDeactivate(ctx: ToolContext): void {
    this.phase = { kind: "option" }
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
    const phase = this.phase
    switch (phase.kind) {
      case "option":
        return "enterAnOption"
      case "name":
        return {
          id: "linetypeName",
          enter: { name: this.current },
          takesSpaces: true,
        }
      case "list":
        return {
          id: "linetypeListNames",
          enter: { name: "*" },
          takesSpaces: true,
        }
      case "listFile":
        return {
          id: "linetypeFileToList",
          enter: { name: ACADISO_FILE },
          takesSpaces: true,
        }
      case "loadNames":
        return { id: "linetypesToLoad", takesSpaces: true }
      case "loadFile":
        return {
          id: "linetypeFileToSearch",
          enter: { name: this.searched },
          takesSpaces: true,
        }
      case "reload":
        return {
          id: "reloadLinetype",
          enter: "undoYes",
          values: { name: phase.found[phase.index].name },
        }
    }
  }

  takes(): QuestionInput | null {
    return this.phase.kind === "reload" ? { refusal: "yesOrNoPlease" } : null
  }

  commandOptions(): readonly CommandOption[] {
    switch (this.phase.kind) {
      case "option":
        return [{ id: "?" }, { id: "Load" }, { id: "Set" }]
      case "name":
        return [{ id: "?" }]
      case "reload":
        return YES_OR_NO
      default:
        return []
    }
  }

  invokeOption(id: string, ctx: ToolContext): CommandOptionOutcome {
    const phase = this.phase
    if (phase.kind === "option" && id === "Set") {
      this.askName(ctx)
      return "continue"
    }
    if (phase.kind === "option" && id === "Load") {
      this.ask({ kind: "loadNames" }, ctx, (typed, commitCtx) =>
        typed === ""
          ? this.askOption(commitCtx)
          : this.askLoadFile(typed, commitCtx)
      )
      return "continue"
    }
    if (phase.kind === "option" && id === "?") {
      this.ask({ kind: "listFile" }, ctx, (typed, commitCtx) => {
        this.listFile(typed === "" ? ACADISO_FILE : typed, commitCtx)
        this.askOption(commitCtx)
      })
      return "continue"
    }
    if (phase.kind === "name" && id === "?") {
      this.askList(ctx)
      return "continue"
    }
    if (phase.kind === "reload" && (id === "Yes" || id === "No")) {
      this.answerReload(id === "Yes", ctx)
      return "continue"
    }
    return "unhandled"
  }

  /** Enter keeps Reload's Yes. */
  onEnter(ctx: ToolContext): boolean {
    if (this.phase.kind !== "reload") return false
    this.answerReload(true, ctx)
    return true
  }

  /** `Enter an option [?/Load/Set]:`, keywords alone; Enter ends the command. */
  private askOption(ctx: ToolContext): void {
    this.phase = { kind: "option" }
    ctx.dynamicInput.open({ fields: [], commit: () => {} })
    this.place(ctx)
  }

  private askName(ctx: ToolContext): void {
    this.current = this.currentName(ctx)
    this.ask({ kind: "name" }, ctx, (typed, commitCtx) =>
      this.answerName(typed, commitCtx)
    )
  }

  private askList(ctx: ToolContext): void {
    this.ask({ kind: "list" }, ctx, (typed, commitCtx) => {
      this.listLoaded(typed === "" ? "*" : typed, commitCtx)
      this.askOption(commitCtx)
    })
  }

  private askLoadFile(names: string, ctx: ToolContext): void {
    this.ask({ kind: "loadFile", names }, ctx, (typed, commitCtx) =>
      this.load(names, typed === "" ? this.searched : typed, commitCtx)
    )
  }

  private ask(
    phase: Phase,
    ctx: ToolContext,
    answer: (typed: string, ctx: ToolContext) => void
  ): void {
    this.phase = phase
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
    let linetype: LinetypeId | null = byLayer
      ? LINETYPE_BYLAYER
      : (ctx.document.getLinetype(typed)?.name ?? null)
    if (linetype === null) {
      const found = fileLinetype(acadisoFile(), typed)
      if (!found) {
        ctx.report(ctx.text.message("linetypeNotFound", { name: typed }))
        return this.askOption(ctx)
      }
      ctx.execute(
        new LinetypeTableCommand(
          withLoaded(
            ctx.document.getLinetypes(),
            [found],
            ctx.document.getTextStyles()
          )
        )
      )
      linetype = found.name
    }
    if (linetype !== ctx.document.getSettings().currentLinetype) {
      ctx.execute(new UpdateSettingsCommand({ currentLinetype: linetype }))
    }
    this.askOption(ctx)
  }

  /**
   * Load: the file's linetypes `names` matches, in the file's order (`DASH*`
   * loads DASHDOT before DASHED, ltype/p08), the new ones loaded at once and
   * each one already loaded asked about in turn.
   */
  private load(names: string, typedFile: string, ctx: ToolContext): void {
    const { name, file } = linetypeFile(typedFile)
    if (!file) {
      ctx.report(ctx.text.message("cantFindFile", { file: name }))
      return this.askOption(ctx)
    }
    this.searched = file.name
    const patterns = names
      .split(",")
      .map((pattern) => pattern.trim())
      .filter((pattern) => pattern !== "")
    const found = file.linetypes.filter((linetype) =>
      patterns.some((pattern) => matchesWildcard(linetype.name, pattern))
    )
    if (found.length === 0) {
      ctx.report(ctx.text.message("noLinetypesInFile", { file: file.name }))
      return this.askOption(ctx)
    }
    this.loadFrom(found, 0, [], ctx)
  }

  /** Loads `found` from `index` on, asking before a reload; `loaded` are those already done. */
  private loadFrom(
    found: readonly Linetype[],
    index: number,
    loaded: readonly Linetype[],
    ctx: ToolContext
  ): void {
    let next = index
    let done = loaded
    while (next < found.length) {
      const linetype = found[next]
      if (ctx.document.getLinetype(linetype.name)) {
        this.phase = { kind: "reload", found, index: next, loaded: done }
        ctx.dynamicInput.open({ fields: [], commit: () => {} })
        this.place(ctx)
        return
      }
      this.loadOne(linetype, "linetypeLoaded", ctx)
      done = [...done, linetype]
      next += 1
    }
    this.askOption(ctx)
  }

  private answerReload(reload: boolean, ctx: ToolContext): void {
    const phase = this.phase
    if (phase.kind !== "reload") return
    const linetype = phase.found[phase.index]
    if (reload) this.loadOne(linetype, "linetypeReloaded", ctx)
    this.loadFrom(phase.found, phase.index + 1, phase.loaded, ctx)
  }

  private loadOne(
    linetype: Linetype,
    said: "linetypeLoaded" | "linetypeReloaded",
    ctx: ToolContext
  ): void {
    ctx.execute(
      new LinetypeTableCommand(
        withLoaded(
          ctx.document.getLinetypes(),
          [linetype],
          ctx.document.getTextStyles()
        )
      )
    )
    ctx.report(ctx.text.message(said, { name: linetype.name }))
  }

  /** Set's `?`: the loaded linetypes matching `patterns`, as AutoCAD lists them. */
  private listLoaded(patterns: string, ctx: ToolContext): void {
    const wanted = patterns.split(",").map((part) => part.trim())
    const matching = [...ctx.document.getLinetypes()]
      .sort((a, b) => (a.name.toUpperCase() < b.name.toUpperCase() ? -1 : 1))
      .filter((entry) =>
        wanted.some((pattern) => matchesWildcard(entry.name, pattern))
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

  /** The first prompt's `?`: the file's linetypes, in its order (line/p205). */
  private listFile(typedFile: string, ctx: ToolContext): void {
    const { name, file } = linetypeFile(typedFile)
    if (!file) {
      ctx.report(ctx.text.message("cantFindFile", { file: name }))
      return
    }
    ctx.report(
      [
        ctx.text.message("linetypesInFile", { file: file.name }),
        "",
        ctx.text.message("fileLinetypeColumns"),
        ...this.rows(file.linetypes, ctx),
      ].join("\n")
    )
  }

  /**
   * `"DASHED"         Dashed __ __ …`. WHY Continuous's in the command
   * language: AutoCAD's own drawing names it so (es `Línea continua`).
   */
  private rows(entries: readonly Linetype[], ctx: ToolContext): string[] {
    return entries.map((entry) => {
      const description = sameLinetypeName(entry.name, DEFAULT_LINETYPE_ID)
        ? ctx.text.message("solidLine")
        : entry.description
      const name = `"${entry.name}"`.padEnd(NAME_COLUMN)
      return description === "" ? name.trimEnd() : `${name}  ${description}`
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
