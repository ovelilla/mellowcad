import { Vec2 } from "../../geometry/Vec2"
import { normalizeAngle } from "../../geometry/primitives"
import { EntityId, HatchEntity } from "../../domain/entities"
import {
  HATCH_PATTERNS,
  HatchPatternId,
  SOLID_HATCH_PATTERN_ID,
  isSolidHatchPattern,
  resolveHatchPatternId,
} from "../../domain/hatchPatterns"
import { hatchWithPatternSettings } from "../../domain/hatchPatternEdits"
import type { PromptId } from "../../locales/types"
import type { ScenePrimitive } from "../../scene/types"
import { UpdateEntitiesCommand } from "../commands/entityCommands"
import { ObjectSelector } from "./objectSelection"
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

type Phase = "select" | "option" | "pattern" | "scale" | "angle"

/** What Properties has been given so far, applied to the set as it ends. */
interface Changes {
  pattern?: HatchPatternId
  scale?: number
  angle?: number
}

/**
 * The options listed: DIsassociate and Properties of AutoCAD's fourteen
 * (tables 25501, 57409), and CAncel, which its initget declares and leaves
 * out (Close Hatch Editor's `^R^C^C_-HATCHEDIT _CA`, MM_1932). WHY no Style,
 * DRaw order, ADd and Remove boundaries, recreate Boundary, ASsociate,
 * separate Hatches, Origin, ANnotative, hatch COlor, LAyer and Transparency,
 * nor the hidden boundarY, SPace and MAtch: none is built here
 * (docs/coverage/draw.md, -HATCHEDIT).
 */
const OPTIONS: readonly CommandOption[] = [
  { id: "DIsassociate" },
  { id: "Properties" },
  { id: "CAncel", hidden: true },
]

/** What the pattern's scale and angle refuse a word with (hatchedit/p09). */
const SCALE_TAKES: QuestionInput = { refusal: "requiresDistanceOrNumberX" }
const ANGLE_TAKES: QuestionInput = {
  refusal: "requiresAngle",
  values: { points: "two", keyword: "no" },
}

/**
 * HPLASTPATTERN's initial value (probe hatchedit/p16), which the Hatch
 * Editor's Type › Pattern sets again.
 */
const INITIAL_LAST_PATTERN: HatchPatternId = "ANSI31"

/**
 * AutoCAD's -HATCHEDIT (probes hatchedit/p01–p16, en and es, traced).
 * `Select hatch objects:` takes a set by every selection mode, a preselection
 * counted after the echo (p07); as the set closes, what is no hatch is said
 * once, `Selected object must be a hatch object.`, counted, `n objects
 * removed from selection set.` (`1 objects` too), and dropped, the prompt
 * asked again when no hatch is left (p03, p14); Enter on an empty set ends the
 * command in silence (p04). Then `Enter hatch option […] <Properties>:`:
 *
 * - **Properties** (Enter): the pattern's name, scale and angle as -HATCH's
 *   Properties asks them, each offering the set's value or `varies` where
 *   its hatches differ (the pattern's `<varies>` with no colon after it,
 *   table 23404), Enter keeping each hatch's own (p03, p11, p12); a solid
 *   fill asks nothing more (p02). The set changes as the angle is answered,
 *   one step U names `-HATCHEDIT` (p01); HPNAME, HPSCALE and HPANG are left
 *   (p01). The pattern is read again as the palette's Scale and Angle read it
 *   (`hatchWithPatternSettings`).
 * - **DIsassociate** ends the command: a hatch here is never associative, and
 *   AutoCAD's DIsassociate on a non-associative one does nothing more (p13).
 * - **CAncel**, unlisted, ends it leaving the set as it was (p05, p07).
 *
 * A hatch on a locked layer is counted and left out (p15). Transparent
 * (`'-HATCHEDIT` at LINE's prompt, p06).
 */
export class HatchEditTool implements Tool {
  readonly id = "hatchedit"

  private phase: Phase = "select"
  private set: EntityId[] = []
  private changes: Changes = {}
  private lastScreen: Vec2 | null = null
  /**
   * The set's hatches as its prompts read them, and the word for where they
   * differ: the questions are asked with no context.
   */
  private shown: HatchEntity[] = []
  /**
   * HPLASTPATTERN: the last pattern -HATCHEDIT gave, a solid fill not among
   * them (p16), for the session.
   */
  private lastPattern: HatchPatternId = INITIAL_LAST_PATTERN
  private readonly selector = new ObjectSelector({
    // Its refusal lists every mode, SUbobject and Object too (p14).
    takes: () => "objects",
    question: () => "selectHatchObjects",
    done: (ctx) => this.closeSet(ctx),
  })

  /** HPLASTPATTERN, which the Hatch Editor's Type › Pattern brings back. */
  lastPatternUsed(): HatchPatternId {
    return this.lastPattern
  }

  onActivate(ctx: ToolContext): void {
    ctx.setCursor("default")
    this.phase = "select"
    this.set = []
    this.changes = {}
    this.selector.start()
    if (this.selector.preselect(ctx)) this.closeSet(ctx)
  }

  onDeactivate(ctx: ToolContext): void {
    this.phase = "select"
    this.set = []
    this.changes = {}
    this.selector.start()
    ctx.dynamicInput.close()
  }

  defaultOption(): string | null {
    return this.phase === "option" && this.set.length === 1
      ? "Properties"
      : null
  }

  question(): PromptId | ToolQuestion {
    switch (this.phase) {
      case "select":
        return this.selector.question()
      case "option":
        // Several hatches are asked with a list of their own (table 57409,
        // 25501 for one: p03, p11), whose words some languages list apart
        // (pt-BR's in English, Italian's `Dissocia`); its default is the
        // keyword's word all the same (pt-BR `<Propriedades>`, p03 pt-BR).
        return this.set.length > 1
          ? { id: "enterHatchOptionSet", enter: "hatchOptionSetDefault" }
          : "enterHatchOption"
      // The set's `varies` is worded apart from CHPROP's (Czech's scale and
      // angle `<různé >`, its name `<různé>`: tables 57236, 42883, 23404).
      case "pattern": {
        const shown = this.common((hatch) => hatch.patternId)
        return shown === null
          ? {
              id: "enterPatternNameOrVaries",
              enter: "hatchPatternVaries",
            }
          : { id: "enterPatternNameOr", enter: { name: shown } }
      }
      case "scale": {
        const shown = this.common(patternScale)
        // `<%.4f>` whatever LUPREC, as -HATCH's (table 25481).
        return shown === null
          ? { id: "patternScaleVaries", enter: "hatchValueVaries" }
          : { id: "patternScale", enter: { name: shown.toFixed(4) } }
      }
      case "angle": {
        const shown = this.common(patternAngle)
        return shown === null
          ? { id: "patternAngleVaries", enter: "hatchValueVaries" }
          : { id: "patternAngle", enter: { angle: (shown * 180) / Math.PI } }
      }
    }
  }

  takes(): QuestionInput | null {
    switch (this.phase) {
      case "select":
        return this.selector.takes()
      case "pattern":
        return { refusal: "hatchPatternUnknown" }
      case "scale":
        return SCALE_TAKES
      case "angle":
        return ANGLE_TAKES
      default:
        return null
    }
  }

  commandOptions(): readonly CommandOption[] {
    switch (this.phase) {
      case "select":
        return this.selector.commandOptions()
      case "option":
        return OPTIONS
      case "pattern":
        // As -HATCH lists it: User defined and Gradient are not built.
        return [{ id: "?" }, { id: "Solid" }]
      default:
        return []
    }
  }

  invokeOption(id: string, ctx: ToolContext): CommandOptionOutcome {
    switch (this.phase) {
      case "select":
        return this.selector.invokeOption(id, ctx) ? "continue" : "unhandled"
      case "option":
        if (id === "Properties") {
          this.askPattern(ctx)
          return "continue"
        }
        // Nothing to disassociate (p13), nothing to change (p05).
        if (id === "DIsassociate" || id === "CAncel") return "end"
        return "unhandled"
      case "pattern":
        if (id === "?") {
          this.listPatterns(ctx)
          return "continue"
        }
        if (id === "Solid") {
          this.changes.pattern = SOLID_HATCH_PATTERN_ID
          this.apply(ctx)
          return "end"
        }
        return "unhandled"
      default:
        return "unhandled"
    }
  }

  onEnter(ctx: ToolContext): boolean {
    if (this.phase === "select") {
      if (!this.selector.onEnter(ctx)) ctx.endCommand()
      ctx.requestRender()
      return true
    }
    if (this.phase !== "option") return false
    this.askPattern(ctx)
    return true
  }

  answerTyped(text: string, ctx: ToolContext): boolean {
    return this.phase === "select" && this.selector.answerTyped(text, ctx)
  }

  wantsSnap(): boolean {
    return this.phase === "select" && this.selector.wantsSnap()
  }

  cycleLasso(ctx: ToolContext): boolean {
    return this.phase === "select" && this.selector.cycleLasso(ctx)
  }

  onPointerDown(input: PointerInput, ctx: ToolContext): void {
    if (this.phase !== "select") return
    this.selector.onPointerDown(input, ctx)
    ctx.requestRender()
  }

  onPointerMove(input: PointerInput, ctx: ToolContext): void {
    this.lastScreen = input.screen
    if (this.phase === "select") this.selector.onPointerMove(input, ctx)
    else ctx.dynamicInput.setPosition(input.screen)
  }

  onPointerUp(input: PointerInput, ctx: ToolContext): void {
    if (this.phase === "select") this.selector.onPointerUp(input, ctx)
  }

  buildOverlay(ctx: ToolContext): ScenePrimitive[] {
    return this.phase === "select" ? this.selector.buildOverlay(ctx) : []
  }

  /**
   * The set closed: what is no hatch said and dropped, then the options, or
   * `Select hatch objects:` again when no hatch is left (p03, p14).
   */
  private closeSet(ctx: ToolContext): void {
    const ids = ctx.selection.toArray()
    const hatches = ids.filter((id) => ctx.document.get(id)?.type === "hatch")
    const removed = ids.length - hatches.length
    if (removed > 0) {
      ctx.report(ctx.text.message("hatchObjectRequired"))
      ctx.report(ctx.text.message("hatchObjectsRemoved", { count: removed }))
      ctx.selection.set(hatches)
    }
    if (hatches.length === 0) {
      this.selector.start()
      this.phase = "select"
      ctx.requestRender()
      return
    }
    this.set = hatches
    this.phase = "option"
    // The keywords alone: the canvas keeps focus, so Enter reaches onEnter.
    ctx.dynamicInput.open({ fields: [], commit: () => {} })
    this.place(ctx)
  }

  /**
   * The pattern's name: a value's box, so `?` and Solid are read as keywords
   * and a transparent command typed there runs, as at -HATCH's.
   */
  private askPattern(ctx: ToolContext): void {
    this.phase = "pattern"
    this.shown = this.hatches(ctx)
    askValueOrWord(
      ctx,
      {
        field: "pattern",
        prompt: "patternName",
        shown: "",
        at: this.lastScreen,
      },
      (typed, answerCtx) => this.answerPattern(typed, answerCtx)
    )
  }

  /**
   * A name in any case, `_` before it or not; one this build does not have
   * is refused and asked again (p09). Enter keeps each hatch's own; a set
   * left all solid asks nothing more (p02).
   */
  private answerPattern(typed: string, ctx: ToolContext): void {
    if (typed.length > 0) {
      const id = resolveHatchPatternId(
        typed.startsWith("_") ? typed.slice(1) : typed
      )
      if (id === null) {
        ctx.report(ctx.text.message("hatchPatternUnknown"), "error")
        this.askPattern(ctx)
        return
      }
      this.changes.pattern = id
    }
    const solid =
      this.changes.pattern !== undefined
        ? isSolidHatchPattern(this.changes.pattern)
        : this.hatches(ctx).every((hatch) =>
            isSolidHatchPattern(hatch.patternId)
          )
    if (solid) {
      this.apply(ctx)
      ctx.endCommand()
      return
    }
    this.askScale(ctx)
  }

  /**
   * `?`: the listing, then the name asked again (where AutoCAD's pages of
   * `Enter pattern(s) to list <*>:` lead is **unverified**, p08).
   */
  private listPatterns(ctx: ToolContext): void {
    ctx.report(
      HATCH_PATTERNS.map((p) => ctx.text.hatchPatternListing(p.id)).join("\n")
    )
    this.askPattern(ctx)
  }

  /** Zero and below refused in the console's words (p09). */
  private askScale(ctx: ToolContext): void {
    this.phase = "scale"
    ctx.dynamicInput.open({
      fields: [{ id: "scale", prompt: "patternScale", kind: "distance" }],
      commit: (values, commitCtx) => {
        if (!(values.scale > 0)) {
          commitCtx.report(commitCtx.text.message("positiveNonzero"), "error")
          return
        }
        this.changes.scale = values.scale
        this.askAngle(commitCtx)
      },
      commitRaw: (commitCtx) => {
        if (commitCtx.dynamicInput.hasTypedText()) return false
        this.askAngle(commitCtx)
        return true
      },
    })
    this.place(ctx)
  }

  /** The angle answered, or Enter, changes the set and ends the command. */
  private askAngle(ctx: ToolContext): void {
    this.phase = "angle"
    ctx.dynamicInput.open({
      fields: [{ id: "angle", prompt: "patternAngle", kind: "angle" }],
      commit: (values, commitCtx) => {
        this.changes.angle = normalizeAngle((values.angle * Math.PI) / 180)
        this.apply(commitCtx)
        commitCtx.endCommand()
      },
      commitRaw: (commitCtx) => {
        if (commitCtx.dynamicInput.hasTypedText()) return false
        this.apply(commitCtx)
        commitCtx.endCommand()
        return true
      },
    })
    this.place(ctx)
  }

  /** What Properties was given, on every hatch of the set at once. */
  private apply(ctx: ToolContext): void {
    const { pattern, scale, angle } = this.changes
    if (pattern !== undefined && !isSolidHatchPattern(pattern)) {
      this.lastPattern = pattern
    }
    if (pattern === undefined && scale === undefined && angle === undefined) {
      return
    }
    const changed = this.hatches(ctx).map((hatch) => {
      const patterned =
        pattern === undefined ? hatch : withPattern(hatch, pattern)
      return scale === undefined && angle === undefined
        ? patterned
        : hatchWithPatternSettings(patterned, { scale, angle })
    })
    if (changed.length > 0) ctx.execute(new UpdateEntitiesCommand(changed))
  }

  private hatches(ctx: ToolContext): HatchEntity[] {
    return this.set
      .map((id) => ctx.document.get(id))
      .filter((entity): entity is HatchEntity => entity?.type === "hatch")
  }

  /** The set's one value of `read`, or null where its hatches differ. */
  private common<T>(read: (hatch: HatchEntity) => T): T | null {
    const values = this.setValues(read)
    return values.every((value) => value === values[0]) ? values[0] : null
  }

  private setValues<T>(read: (hatch: HatchEntity) => T): T[] {
    return this.shown.map(read)
  }

  private place(ctx: ToolContext): void {
    this.shown = this.hatches(ctx)
    ctx.dynamicInput.setPosition(this.lastScreen ?? { x: 0, y: 0 })
    ctx.requestRender()
  }
}

function patternScale(hatch: HatchEntity): number {
  return hatch.patternScale
}

function patternAngle(hatch: HatchEntity): number {
  return hatch.patternAngle
}

/**
 * `hatch` given pattern `id` of the registry: its own lines, type and
 * gradient dropped, as AutoCAD's Properties makes it that pattern.
 */
function withPattern(hatch: HatchEntity, id: HatchPatternId): HatchEntity {
  const { patternType, patternLines, gradient, ...rest } = hatch
  void patternType
  void patternLines
  void gradient
  return { ...rest, patternId: id }
}
