import { Vec2 } from "../../geometry/Vec2"
import { Vec3 } from "../../geometry/Vec3"
import { ScenePrimitive } from "../../scene/types"
import { ObjectSelector } from "./objectSelection"
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

/** An array command ARRAY hands its set to, which goes on from there. */
export interface ArrayKindTool extends Tool {
  takeSet(ctx: ToolContext): void
}

/** ARRAY's types, by keyword, and the command each hands its set to. */
const KINDS = {
  Rectangular: "ARRAYRECT",
  PAth: "ARRAYPATH",
  POlar: "ARRAYPOLAR",
} as const

type Kind = keyof typeof KINDS

/**
 * AutoCAD's ARRAY, as its 2027 console asks it (probes arrays/p100, p101,
 * p103, p104, p204): `Select objects:` (a preselection counted), then `Enter
 * array type [Rectangular/PAth/POlar] <Rectangular>:`, Enter taking
 * Rectangular, and the set handed to ARRAYRECT, ARRAYPATH or ARRAYPOLAR, which
 * go on from their `Type = …` line without asking for objects again. The run
 * stays ARRAY's: one undo step, ARRAY at the prompt, Enter repeating it.
 *
 * WHY one tool that holds the three and forwards to the chosen one, rather
 * than starting it: a second tool would end ARRAY's run, making two undo
 * steps, and drop the set.
 */
export class ArrayCommandTool implements Tool {
  readonly id = "arraycommand"

  private phase: "selecting" | "type" = "selecting"
  /** The array command the set was handed to, once the type is given. */
  private chosen: { readonly kind: Kind; readonly tool: ArrayKindTool } | null =
    null
  private readonly selector = new ObjectSelector({
    takes: () => "wholeObjects",
    done: (ctx) => this.askType(ctx),
  })

  constructor(private readonly kinds: Readonly<Record<Kind, ArrayKindTool>>) {}

  handedTo(): string | null {
    return this.chosen === null ? null : KINDS[this.chosen.kind]
  }

  onActivate(ctx: ToolContext): void {
    ctx.setCursor("crosshair")
    this.chosen = null
    this.phase = "selecting"
    this.selector.start()
    if (this.selector.preselect(ctx)) this.askType(ctx)
  }

  onDeactivate(ctx: ToolContext): void {
    this.chosen?.tool.onDeactivate?.(ctx)
    this.chosen = null
    this.phase = "selecting"
    this.selector.start()
    ctx.dynamicInput.close()
  }

  question(): PromptId | ToolQuestion | null {
    if (this.chosen) return this.chosen.tool.question?.() ?? null
    return this.phase === "type" ? "enterArrayType" : this.selector.question()
  }

  takes(): QuestionInput | null {
    if (this.chosen) return this.chosen.tool.takes?.() ?? null
    return this.phase === "type" ? null : this.selector.takes()
  }

  setsLastPoint(): boolean | null {
    return this.chosen?.tool.setsLastPoint?.() ?? null
  }

  takesSnapOverride(): boolean {
    return this.chosen?.tool.takesSnapOverride?.() ?? false
  }

  commandOptions(): readonly CommandOption[] {
    if (this.chosen) return this.chosen.tool.commandOptions?.() ?? []
    if (this.phase === "selecting") return this.selector.commandOptions()
    return (Object.keys(KINDS) as Kind[]).map((id) => ({ id }))
  }

  defaultOption(): string | null {
    if (this.chosen) return this.chosen.tool.defaultOption?.() ?? null
    return this.phase === "type" ? "Rectangular" : null
  }

  invokeOption(id: string, ctx: ToolContext): CommandOptionOutcome {
    if (this.chosen) {
      return this.chosen.tool.invokeOption?.(id, ctx) ?? "unhandled"
    }
    if (this.phase === "selecting") {
      return this.selector.invokeOption(id, ctx) ? "continue" : "unhandled"
    }
    if (!(id in KINDS)) return "unhandled"
    this.handTo(id as Kind, ctx)
    return "continue"
  }

  onPointerMove(input: PointerInput, ctx: ToolContext): void {
    if (this.chosen) this.chosen.tool.onPointerMove?.(input, ctx)
    else if (this.phase === "selecting") this.selector.onPointerMove(input, ctx)
    else ctx.dynamicInput.setPosition(input.screen)
    ctx.requestRender()
  }

  onPointerDown(input: PointerInput, ctx: ToolContext): void {
    if (this.chosen) this.chosen.tool.onPointerDown?.(input, ctx)
    else if (this.phase === "selecting") this.selector.onPointerDown(input, ctx)
  }

  onPointerUp(input: PointerInput, ctx: ToolContext): void {
    if (this.chosen) this.chosen.tool.onPointerUp?.(input, ctx)
    else if (this.phase === "selecting") this.selector.onPointerUp(input, ctx)
  }

  answerTyped(text: string, ctx: ToolContext): boolean {
    if (this.chosen) return this.chosen.tool.answerTyped?.(text, ctx) ?? false
    return this.phase === "selecting" && this.selector.answerTyped(text, ctx)
  }

  onAskAgain(ctx: ToolContext): void {
    this.chosen?.tool.onAskAgain?.(ctx)
  }

  cycleLasso(ctx: ToolContext): boolean {
    if (this.chosen) return this.chosen.tool.cycleLasso?.(ctx) ?? false
    return this.phase === "selecting" && this.selector.cycleLasso(ctx)
  }

  onEnter(ctx: ToolContext): boolean {
    if (this.chosen) return this.chosen.tool.onEnter?.(ctx) ?? false
    if (this.phase === "selecting") return this.selector.onEnter(ctx)
    this.handTo("Rectangular", ctx)
    return true
  }

  wantsSnap(): boolean {
    if (this.chosen) return this.chosen.tool.wantsSnap?.() ?? false
    return this.phase === "selecting" && this.selector.wantsSnap()
  }

  getConstraintAnchor(): Vec2 | Vec3 | null {
    return this.chosen?.tool.getConstraintAnchor?.() ?? null
  }

  buildOverlay(ctx: ToolContext): ScenePrimitive[] {
    if (this.chosen) return this.chosen.tool.buildOverlay?.(ctx) ?? []
    return this.phase === "selecting" ? this.selector.buildOverlay(ctx) : []
  }

  /** The type question, a keyword's, the focus left on the drawing. */
  private askType(ctx: ToolContext): void {
    this.phase = "type"
    ctx.dynamicInput.open({ fields: [], commit: () => {} })
    ctx.requestRender()
  }

  private handTo(kind: Kind, ctx: ToolContext): void {
    const tool = this.kinds[kind]
    this.chosen = { kind, tool }
    tool.takeSet(ctx)
    ctx.requestRender()
  }
}
