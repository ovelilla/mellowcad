import { Vec2 } from "../../geometry/Vec2"
import { assignDimStyle, DimensionEntity, Entity } from "../../domain/entities"
import {
  DEFAULT_DIM_STYLE,
  DimStyle,
  dimStyleVariables,
} from "../../domain/dimStyles"
import { newStyleIdentity, styleNamed } from "../../domain/styleNames"
import { matchesWildcard } from "../../shared/wildcard"
import type { PromptId } from "../../locales/types"
import { ScenePrimitive } from "../../scene/types"
import {
  AddDimStyleCommand,
  SetCurrentDimStyleCommand,
  UpdateDimStyleCommand,
} from "../commands/dimStyleCommands"
import { UpdateEntitiesCommand } from "../commands/entityCommands"
import { rollover } from "./ghostLook"
import { lastObject, ObjectSelector } from "./objectSelection"
import {
  CommandOption,
  CommandOptionOutcome,
  PointerInput,
  QuestionInput,
  Tool,
  ToolContext,
  ToolQuestion,
} from "./Tool"
import { typedPick } from "./typedPick"

/** What a style name or a picked dimension is asked for. */
type NameFor = "restore" | "variables"

type DimStyleState =
  | { readonly phase: "option" }
  | { readonly phase: "save" }
  /** `That name is already in use, redefine it? <N>:`. */
  | { readonly phase: "redefine"; readonly style: DimStyle }
  | { readonly phase: "name"; readonly purpose: NameFor }
  /** `Select dimension:`, Enter's answer at the name. */
  | {
      readonly phase: "dimension"
      readonly purpose: NameFor
      readonly hover: DimensionEntity | null
    }
  /** `?`'s `Enter dimension style(s) to list <*>:`, and where it goes back to. */
  | { readonly phase: "list"; readonly back: "save" | NameFor | null }
  /** Apply's `Select objects:`, by {@link ObjectSelector}. */
  | { readonly phase: "apply" }

const OPTIONS = ["Save", "Restore", "STatus", "Variables", "Apply", "?"]

/**
 * AutoCAD's -DIMSTYLE (es -ACOESTIL), as its 2027 console asks it (probes
 * dimensions/p04–p11, p16): `Current dimension style: ISO-25   Annotative:
 * No`, then `Enter a dimension style option [...] <Restore>:`, answered once.
 *
 * - Save names a new style holding the current style's settings, made
 *   current; a name in use, any case, asks `That name is already in use,
 *   redefine it? <N>:`, whose No asks the name again (p08) and whose Yes
 *   gives that style the current settings and makes it current (p06 on the
 *   current style's own name; on another, unverified).
 * - Restore makes a named style current, or a picked dimension's at Enter's
 *   `Select dimension:` (p16), and says the current style; an unknown name
 *   says `Unknown dimension style.` (p04, p11).
 * - STatus and Variables list the variables modelled, in AutoCAD's columns
 *   (p06, p07); `?` lists the named styles (p07).
 * - Apply puts the selected dimensions on the current style (p16).
 *
 * The run is one undo step, which U names `-DIMSTYLE` (p05).
 *
 * WHY no ANnotative in the list: annotative scaling does not exist here, so
 * the option it opens would be inert (DIMS-D7, D8); it is refused, as a word
 * the prompt does not take. Not done: dimension overrides (`Current dimension
 * overrides:`, DIMS-D9).
 */
export class DimStyleTool implements Tool {
  readonly id = "dashdimstyle"

  private state: DimStyleState = { phase: "option" }
  private lastScreen: Vec2 | null = null
  private readonly selector = new ObjectSelector({
    done: (ctx) => this.apply(ctx),
  })

  onActivate(ctx: ToolContext): void {
    ctx.setCursor("crosshair")
    this.sayCurrent(ctx)
    this.askOption(ctx)
  }

  onDeactivate(ctx: ToolContext): void {
    this.state = { phase: "option" }
    this.selector.start()
    ctx.dynamicInput.close()
  }

  question(): PromptId | ToolQuestion {
    const state = this.state
    switch (state.phase) {
      case "option":
        return "dimStyleOption"
      case "save":
        return { id: "dimStyleSaveName", takesSpaces: true }
      case "redefine":
        return { id: "dimStyleRedefine", enter: { name: "N" } }
      // WHY `[?]` in the words: its default comes after it, `[?] or <select
      // dimension>`, which a prompt's keyword list cannot place.
      case "name":
        return {
          id: "dimStyleName",
          enter: "dimStyleSelectDimension",
          takesSpaces: true,
        }
      case "dimension":
        return "selectDimension"
      case "list":
        return {
          id: "dimStylesToList",
          enter: { name: "*" },
          takesSpaces: true,
        }
      case "apply":
        return this.selector.question()
    }
  }

  takes(): QuestionInput | null {
    switch (this.state.phase) {
      case "dimension":
        return "objectOrLast"
      case "apply":
        return this.selector.takes()
      default:
        return null
    }
  }

  defaultOption(): string | null {
    return this.state.phase === "option" ? "Restore" : null
  }

  commandOptions(): readonly CommandOption[] {
    switch (this.state.phase) {
      case "option":
        return OPTIONS.map((id) => ({ id }))
      case "save":
        return [{ id: "?" }]
      // A yes-or-no question lists no keywords.
      case "redefine":
        return [
          { id: "Yes", hidden: true },
          { id: "No", hidden: true },
        ]
      case "dimension":
        return [{ id: "Last", hidden: true, prompt: "selectObjects" }]
      case "apply":
        return this.selector.commandOptions()
      default:
        return []
    }
  }

  invokeOption(id: string, ctx: ToolContext): CommandOptionOutcome {
    const state = this.state
    switch (state.phase) {
      case "option":
        return this.choose(id, ctx)
      case "save":
        if (id !== "?") return "unhandled"
        this.askList("save", ctx)
        return "continue"
      case "redefine":
        if (id === "No") {
          this.askSave(ctx)
          return "continue"
        }
        if (id !== "Yes") return "unhandled"
        this.redefine(state.style, ctx)
        return "end"
      case "dimension":
        if (id !== "Last") return "unhandled"
        return this.takeDimension(lastObject(ctx) ?? null, state.purpose, ctx)
          ? "end"
          : "continue"
      case "apply":
        return this.selector.invokeOption(id, ctx) ? "continue" : "unhandled"
      default:
        return "unhandled"
    }
  }

  onEnter(ctx: ToolContext): boolean {
    switch (this.state.phase) {
      case "option":
        this.askName("restore", ctx)
        return true
      // Enter keeps the `<N>`.
      case "redefine":
        this.askSave(ctx)
        return true
      case "apply":
        return this.selector.onEnter(ctx)
      default:
        return false
    }
  }

  wantsSnap(): boolean {
    return this.state.phase === "apply" && this.selector.wantsSnap()
  }

  onPointerMove(input: PointerInput, ctx: ToolContext): void {
    this.lastScreen = input.screen
    const state = this.state
    if (state.phase === "apply") this.selector.onPointerMove(input, ctx)
    if (state.phase === "dimension") {
      const hit = ctx.pick(input.world)
      const hover = hit?.type === "dimension" ? hit : null
      if (hover?.id !== state.hover?.id) this.state = { ...state, hover }
    }
    ctx.dynamicInput.setPosition(input.screen)
    ctx.requestRender()
  }

  onPointerDown(input: PointerInput, ctx: ToolContext): void {
    const state = this.state
    if (state.phase === "apply") {
      this.selector.onPointerDown(input, ctx)
      return
    }
    if (state.phase === "dimension" && input.button === 0) {
      this.pickDimension(input.world, state.purpose, ctx)
    }
  }

  onPointerUp(input: PointerInput, ctx: ToolContext): void {
    if (this.state.phase === "apply") this.selector.onPointerUp(input, ctx)
  }

  cycleLasso(ctx: ToolContext): boolean {
    return this.state.phase === "apply" && this.selector.cycleLasso(ctx)
  }

  /** A point typed at `Select dimension:` picks there, as DIMSPACE's base. */
  answerTyped(text: string, ctx: ToolContext): boolean {
    const state = this.state
    if (state.phase === "apply") return this.selector.answerTyped(text, ctx)
    if (state.phase !== "dimension") return false
    const point = typedPick(text, ctx)
    if (!point) return false
    this.pickDimension(point, state.purpose, ctx)
    return true
  }

  buildOverlay(ctx: ToolContext): ScenePrimitive[] {
    const state = this.state
    if (state.phase === "apply") return this.selector.buildOverlay(ctx)
    if (state.phase === "dimension" && state.hover) {
      return rollover(ctx, state.hover)
    }
    return []
  }

  private choose(id: string, ctx: ToolContext): CommandOptionOutcome {
    switch (id) {
      case "Save":
        this.askSave(ctx)
        return "continue"
      case "Restore":
        this.askName("restore", ctx)
        return "continue"
      case "Variables":
        this.askName("variables", ctx)
        return "continue"
      case "STatus":
        this.listStatus(ctx)
        return "end"
      case "Apply":
        this.state = { phase: "apply" }
        ctx.selection.clear()
        this.selector.start()
        ctx.dynamicInput.close()
        this.place(ctx)
        return "continue"
      case "?":
        this.askList(null, ctx)
        return "continue"
      default:
        return "unhandled"
    }
  }

  private askOption(ctx: ToolContext): void {
    this.state = { phase: "option" }
    ctx.dynamicInput.open({ fields: [], commit: () => {} })
    this.place(ctx)
  }

  private askSave(ctx: ToolContext): void {
    this.state = { phase: "save" }
    this.openText("dimStyleSaveName", ctx, (typed, commitCtx) => {
      if (typed === "?") return this.askList("save", commitCtx)
      // Enter is no name (unverified: the console's answer to it was not
      // probed): the command ends, as a name prompt's Enter does here.
      if (typed === "") return commitCtx.endCommand()
      this.save(typed, commitCtx)
    })
  }

  private askName(purpose: NameFor, ctx: ToolContext): void {
    this.state = { phase: "name", purpose }
    this.openText("dimStyleName", ctx, (typed, commitCtx) => {
      if (typed === "?") return this.askList(purpose, commitCtx)
      if (typed === "") return this.askDimension(purpose, commitCtx)
      const style = styleNamed(commitCtx.document.getDimStyles(), typed)
      if (!style) {
        commitCtx.report(commitCtx.text.message("unknownDimStyle"))
        this.sayCurrent(commitCtx)
        return commitCtx.endCommand()
      }
      this.useStyle(style, purpose, commitCtx)
      commitCtx.endCommand()
    })
  }

  private askDimension(purpose: NameFor, ctx: ToolContext): void {
    this.state = { phase: "dimension", purpose, hover: null }
    ctx.dynamicInput.close()
    this.place(ctx)
  }

  /**
   * `?`'s list prompt; its listing ends the command at the option prompt
   * (p07) and, from a name prompt, asks that again (unverified).
   */
  private askList(back: "save" | NameFor | null, ctx: ToolContext): void {
    this.state = { phase: "list", back }
    this.openText("dimStylesToList", ctx, (typed, commitCtx) => {
      this.listNames(typed === "" ? "*" : typed, commitCtx)
      if (back === null) commitCtx.endCommand()
      else if (back === "save") this.askSave(commitCtx)
      else this.askName(back, commitCtx)
    })
  }

  private openText(
    prompt: PromptId,
    ctx: ToolContext,
    answer: (typed: string, ctx: ToolContext) => void
  ): void {
    ctx.dynamicInput.open({
      fields: [{ id: "name", prompt, kind: "text" }],
      commit: () => {},
      commitRaw: (commitCtx) => {
        answer(commitCtx.dynamicInput.getText("name").trim(), commitCtx)
        return true
      },
    })
    this.place(ctx)
  }

  /** Save's name: a new style, or the redefinition asked of one in use (p08). */
  private save(name: string, ctx: ToolContext): void {
    const styles = ctx.document.getDimStyles()
    const taken = styleNamed(styles, name)
    if (taken) {
      this.state = { phase: "redefine", style: taken }
      ctx.dynamicInput.open({ fields: [], commit: () => {} })
      this.place(ctx)
      return
    }
    const style: DimStyle = {
      ...this.currentStyle(ctx),
      ...newStyleIdentity(name, styles),
    }
    ctx.execute(new AddDimStyleCommand(style, true))
    ctx.endCommand()
  }

  /** Yes: `style` takes the current settings, and is current. */
  private redefine(style: DimStyle, ctx: ToolContext): void {
    const next: DimStyle = {
      ...this.currentStyle(ctx),
      id: style.id,
      name: style.name,
    }
    ctx.execute(new UpdateDimStyleCommand(next))
    if (ctx.document.getCurrentDimStyleId() !== style.id) {
      ctx.execute(new SetCurrentDimStyleCommand(style.id))
    }
  }

  private pickDimension(world: Vec2, purpose: NameFor, ctx: ToolContext): void {
    const hit = ctx.pick(world)
    if (hit && this.takeDimension(hit, purpose, ctx)) ctx.endCommand()
  }

  /**
   * The object found at `Select dimension:`, whose style is used; anything
   * else is said and asked again. Returns whether it was taken.
   */
  private takeDimension(
    entity: Entity | null,
    purpose: NameFor,
    ctx: ToolContext
  ): boolean {
    const style =
      entity?.type === "dimension"
        ? ctx.document.getDimStyle(entity.styleId)
        : undefined
    if (style) {
      this.useStyle(style, purpose, ctx)
      return true
    }
    ctx.report(
      ctx.text.message(
        entity === null ? "noObjectSelected" : "selectedObjectNotDimension"
      )
    )
    ctx.requestRender()
    return false
  }

  /** Restore makes it current and says so (p11, p16); Variables lists it (p07). */
  private useStyle(style: DimStyle, purpose: NameFor, ctx: ToolContext): void {
    if (purpose === "variables") {
      ctx.report(this.variableLines(style, ctx).join("\n"))
    } else {
      if (style.id !== ctx.document.getCurrentDimStyleId()) {
        ctx.execute(new SetCurrentDimStyleCommand(style.id))
      }
      this.sayCurrent(ctx)
    }
  }

  /** STatus: DIMSTYLE's line, then the current style's variables (p06). */
  private listStatus(ctx: ToolContext): void {
    const style = this.currentStyle(ctx)
    ctx.report(
      [
        ctx.text.dimVariableListing("DIMSTYLE", style.name),
        ...this.variableLines(style, ctx),
      ].join("\n")
    )
  }

  private variableLines(style: DimStyle, ctx: ToolContext): string[] {
    return dimStyleVariables(style).map((variable) =>
      ctx.text.dimVariableListing(variable.name, variable.value)
    )
  }

  /**
   * `?`: the styles matching `patterns`, in the table's order (p07). WHY the
   * blank line under the heading, which the console leaves out: the table's
   * string has it (AcDimRes 5297), as -LINETYPE's listing keeps its own.
   */
  private listNames(patterns: string, ctx: ToolContext): void {
    const wanted = patterns.split(",")
    const matching = ctx.document
      .getDimStyles()
      .filter((style) =>
        wanted.some((pattern) => matchesWildcard(style.name, pattern))
      )
    ctx.report(
      [
        ctx.text.message("namedDimStyles"),
        "",
        ...(matching.length === 0
          ? [ctx.text.message("noMatchingDimStyles")]
          : matching.map((style) => `  ${style.name}`)),
      ].join("\n")
    )
  }

  /** Apply: the selected dimensions take the current style, one edit (p16). */
  private apply(ctx: ToolContext): void {
    const current = ctx.document.getCurrentDimStyleId()
    const changed = ctx.selection
      .toArray()
      .map((id) => ctx.document.get(id))
      .filter(
        (entity): entity is DimensionEntity =>
          entity?.type === "dimension" && entity.styleId !== current
      )
      .map((entity) => assignDimStyle(entity, current))
    if (changed.length > 0) ctx.execute(new UpdateEntitiesCommand(changed))
    ctx.endCommand()
  }

  private sayCurrent(ctx: ToolContext): void {
    ctx.report(
      ctx.text.message("currentDimStyle", { name: this.currentStyle(ctx).name })
    )
  }

  private currentStyle(ctx: ToolContext): DimStyle {
    return (
      ctx.document.getDimStyle(ctx.document.getCurrentDimStyleId()) ??
      DEFAULT_DIM_STYLE
    )
  }

  private place(ctx: ToolContext): void {
    ctx.dynamicInput.setPosition(this.lastScreen ?? { x: 0, y: 0 })
    ctx.requestRender()
  }
}
