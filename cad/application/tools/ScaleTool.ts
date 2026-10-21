import { Vec2, V } from "../../geometry/Vec2"
import { Vec3 } from "../../geometry/Vec3"
import {
  Entity,
  EntityId,
  entitiesBounds,
  scaleEntity,
  scaleEntityCopy,
} from "../../domain/entities"
import { parseNumber } from "../../domain/units"
import { DynamicInputSession } from "../input/DynamicInput"
import {
  isCoordinateExpression,
  parseCoordinate,
} from "../input/coordinateInput"
import { ScenePrimitive } from "../../scene/types"
import {
  AddEntitiesCommand,
  UpdateEntitiesCommand,
} from "../commands/entityCommands"
import {
  CommandOption,
  CommandOptionOutcome,
  PointerInput,
  Tool,
  ToolContext,
  ToolQuestion,
  type QuestionInput,
} from "./Tool"
import { ObjectSelector } from "./objectSelection"
import { selectedInDrawingOrder } from "./drawingOrder"
import { transformDrag } from "./transformDrag"
import type { PromptId } from "../../locales/types"

/**
 * AutoCAD's SCALE command: select a set of objects, pick a base point, then
 * resize the set uniformly about it.
 *
 * ```
 *   (empty selection)    Enter/Space      click / type       [Copy]  keeps original
 *  selecting ─────────────────────► base ──────────► factor ──────────► done
 *   click / box-drag adds objects       (the set scales as itself)  [Reference]
 *                                                                        │
 *                                          refP1 ─► newLength ─► [Points]┘
 * ```
 *
 * A typed factor multiplies directly. A point, picked or typed, scales by its
 * distance from the base over half the largest side of the set's extents (1
 * when they have no size): a point that far from the base leaves the set as it
 * is, nearer shrinks it, farther grows it (probe transforms/p219, desktop d06,
 * d07). Two keywords match AutoCAD: **Copy** leaves the originals in place and
 * scales a fresh duplicate; **Reference** scales by `new length / reference
 * length`, whose lengths a point measures directly, letting you resize so a
 * measured length becomes a target length. Works on any selection — lines and
 * circles alike (a circle's radius scales too) — with object snap and typed
 * factor, length or coordinate entry.
 */

type ScaleState =
  /** No pre-selection: `Select objects:` builds the set. */
  | { readonly phase: "selecting" }
  /** Objects chosen; awaiting the base point of the scaling. */
  | { readonly phase: "base" }
  /** Base placed; the set scales to the factor (cursor-driven). */
  | {
      readonly phase: "factor"
      /** Its Z too: the set scales in 3D about it. */
      readonly base: Vec3
      readonly originals: readonly Entity[]
      /** What a point's distance from the base is divided by: {@link factorUnit}. */
      readonly unit: number
      /** Reference mode Copy keeps the originals in place. */
      readonly copy: boolean
      readonly current: Vec2
    }
  /** Reference mode: the reference length, typed or two points the runtime measures. */
  | {
      readonly phase: "refP1"
      readonly base: Vec3
      readonly originals: readonly Entity[]
      readonly copy: boolean
      readonly current: Vec2
    }
  /**
   * Reference mode: the set scales to the new length, measured from the base
   * point, or by two points of its own once Points is chosen.
   */
  | {
      readonly phase: "newLength"
      readonly base: Vec3
      readonly originals: readonly Entity[]
      readonly copy: boolean
      /** Reference length the new length is divided by for the factor. */
      readonly reference: number
      readonly current: Vec2
      readonly points: boolean
    }

export class ScaleTool implements Tool {
  readonly id = "scale"

  private state: ScaleState = { phase: "selecting" }
  private readonly selector = new ObjectSelector({
    done: (ctx) => this.confirmSelection(ctx),
  })
  private lastScreen: Vec2 | null = null
  /**
   * The scale factor's `<default>`: the last one used, 1 in each drawing
   * opened; not saved (rectang/p315).
   */
  private lastFactor = 1
  /** Reference's `<default>`s, the last ones given, 1 at first; not saved. */
  private lastReference = 1
  private lastNewLength = 1

  onNewDrawing(): void {
    this.lastFactor = 1
    this.lastReference = 1
    this.lastNewLength = 1
  }

  onActivate(ctx: ToolContext): void {
    ctx.setCursor("crosshair")
    // Pre-selected objects (the common path) skip straight to the base point,
    // matching AutoCAD; otherwise prompt to select the objects first.
    this.selector.start()
    if (!this.selector.preselect(ctx)) {
      this.state = { phase: "selecting" }
    } else {
      this.state = { phase: "base" }
      this.openBaseInput(ctx)
    }
  }

  /**
   * WHY the factor shows no `<default>` though Enter takes the last one:
   * AutoCAD's prompt shows none (probes transforms/p160, p165). Reference's
   * lengths show theirs: `Specify new length or [Points] <1.0000>:` (p172,
   * p187).
   */
  question(): PromptId | ToolQuestion {
    switch (this.state.phase) {
      case "selecting":
        return this.selector.question()
      case "base":
        return "specifyBasePoint"
      case "factor":
        return "specifyScaleFactorOr"
      case "refP1":
        return { id: "specifyReferenceLength", enter: this.lastReference }
      case "newLength":
        return this.state.points
          ? "specifyFirstPoint"
          : { id: "specifyNewLengthOr", enter: this.lastNewLength }
    }
  }

  /**
   * The factor takes a point, which the tool reads itself (over the set's
   * extents); the reference length and Points' new length are measured by two
   * points of their own.
   */
  takes(): QuestionInput | null {
    switch (this.state.phase) {
      case "selecting":
        return this.selector.takes()
      case "factor":
        return "distance"
      case "newLength":
      case "refP1":
        return this.state.phase === "refP1" || this.state.points
          ? {
              refusal: "requiresDistance",
              values: { points: "two", keyword: "no" },
            }
          : null
      default:
        return null
    }
  }

  onDeactivate(ctx: ToolContext): void {
    this.state = { phase: "selecting" }
    this.selector.start()
    ctx.dynamicInput.close()
  }

  onPointerMove(input: PointerInput, ctx: ToolContext): void {
    this.lastScreen = input.screen

    switch (this.state.phase) {
      case "selecting":
        this.selector.onPointerMove(input, ctx)
        break
      case "base":
        ctx.dynamicInput.setPosition(input.screen)
        break
      case "factor": {
        this.state = { ...this.state, current: input.point }
        ctx.dynamicInput.setLive("factor", pointFactor(this.state, input.point))
        ctx.dynamicInput.setPosition(input.screen)
        break
      }
      case "refP1":
      case "newLength":
        this.state = { ...this.state, current: input.point }
        ctx.dynamicInput.setPosition(input.screen)
        break
    }

    ctx.requestRender()
  }

  onPointerDown(input: PointerInput, ctx: ToolContext): void {
    if (input.button !== 0) return

    switch (this.state.phase) {
      case "selecting":
        this.selector.onPointerDown(input, ctx)
        return
      case "base": {
        const base = this.resolveBase(input.point, ctx)
        this.enterFactor(base, ctx)
        return
      }
      case "factor":
        this.scaleBy(
          this.state,
          this.resolveDirectFactor(this.state, input.point, ctx),
          ctx
        )
        return
      case "newLength":
        this.commitNewLength(
          this.state,
          this.resolveNewLength(this.state.base, input.point, ctx),
          ctx
        )
        return
    }
  }

  answerTyped(text: string, ctx: ToolContext): boolean {
    return (
      this.state.phase === "selecting" && this.selector.answerTyped(text, ctx)
    )
  }

  onPointerUp(input: PointerInput, ctx: ToolContext): void {
    if (this.state.phase === "selecting") this.selector.onPointerUp(input, ctx)
  }

  cycleLasso(ctx: ToolContext): boolean {
    return this.selector.cycleLasso(ctx)
  }

  onEnter(ctx: ToolContext): boolean {
    return this.state.phase === "selecting" && this.selector.onEnter(ctx)
  }

  /**
   * `[Copy/Reference]` at the factor, as AutoCAD keeps listing them once
   * Copy is chosen; `[Points]` at the new length.
   */
  commandOptions(): readonly CommandOption[] {
    if (this.state.phase === "selecting") return this.selector.commandOptions()
    if (this.state.phase === "newLength" && !this.state.points) {
      return [{ id: "Points" }]
    }
    return this.state.phase === "factor"
      ? [{ id: "Copy" }, { id: "Reference" }]
      : []
  }

  invokeOption(id: string, ctx: ToolContext): CommandOptionOutcome {
    if (this.state.phase === "selecting") {
      return this.selector.invokeOption(id, ctx) ? "continue" : "unhandled"
    }
    if (id === "Copy" && this.state.phase === "factor") {
      // A second Copy says it again, as AutoCAD's console does.
      ctx.report(ctx.text.message("scalingCopy"))
      this.state = { ...this.state, copy: true }
      ctx.requestRender()
      return "continue"
    }
    if (id === "Reference" && this.state.phase === "factor") {
      this.state = {
        phase: "refP1",
        base: this.state.base,
        originals: this.state.originals,
        copy: this.state.copy,
        current: this.state.current,
      }
      this.openReferenceInput(ctx)
      ctx.requestRender()
      return "continue"
    }
    if (id === "Points" && this.state.phase === "newLength") {
      this.state = { ...this.state, points: true }
      this.openNewLengthInput(ctx)
      ctx.requestRender()
      return "continue"
    }
    return "unhandled"
  }

  getConstraintAnchor(): Vec2 | null {
    // Snap/tracking reference the base while measuring the factor; the reference
    // length is measured from its first point.
    switch (this.state.phase) {
      case "factor":
        return this.state.base
      case "newLength":
        return this.state.points ? null : this.state.base
      default:
        return null
    }
  }

  wantsSnap(): boolean {
    // Object snaps help place every point precisely; picking objects (click or
    // box) in the selecting phase does not need them, and the reference
    // length's two points are the runtime's to measure.
    return (
      this.state.phase === "base" ||
      this.state.phase === "factor" ||
      (this.state.phase === "newLength" && !this.state.points) ||
      (this.state.phase === "selecting" && this.selector.wantsSnap())
    )
  }

  /**
   * The originals fade where they were while the set drags scaled, but not
   * under Copy, as ROTATE's (desktop transforms/d06, d08-3; d03).
   */
  fadedEntityIds(): readonly EntityId[] {
    const state = this.dragged()
    return state && !state.copy
      ? state.originals.map((entity) => entity.id)
      : []
  }

  /** The base point given, the set no longer glows (desktop transforms/d08-1). */
  selectionGlows(): boolean {
    return this.state.phase === "selecting" || this.state.phase === "base"
  }

  buildOverlay(ctx: ToolContext): ScenePrimitive[] {
    if (this.state.phase === "selecting") return this.selector.buildOverlay(ctx)
    const state = this.dragged()
    if (state === null) return []
    const { base, originals, current } = state
    const factor =
      state.phase === "factor"
        ? this.resolveDirectFactor(state, current, ctx)
        : this.resolveNewLength(base, current, ctx) / state.reference
    const safe = Number.isFinite(factor) && factor > 0 ? factor : 1
    return transformDrag(
      ctx,
      originals,
      (entity) => scaleEntity(entity, base, safe),
      base,
      current
    )
  }

  /** The state while the set drags scaled: the factor and the new length. */
  private dragged(): Extract<
    ScaleState,
    { phase: "factor" | "newLength" }
  > | null {
    const { state } = this
    return state.phase === "factor" ||
      (state.phase === "newLength" && !state.points)
      ? state
      : null
  }

  private confirmSelection(ctx: ToolContext): void {
    this.state = { phase: "base" }
    this.openBaseInput(ctx)
    ctx.requestRender()
  }

  private openBaseInput(ctx: ToolContext): void {
    const session: DynamicInputSession = {
      fields: [{ id: "base", prompt: "basePoint", kind: "coordinate" }],
      commit: () => {},
      commitRaw: (commitCtx) => this.commitBaseCoordinate(commitCtx),
    }
    ctx.dynamicInput.open(session)
    if (this.lastScreen) ctx.dynamicInput.setPosition(this.lastScreen)
  }

  private commitBaseCoordinate(ctx: ToolContext): boolean {
    if (this.state.phase !== "base") return false
    const text = ctx.dynamicInput.getText("base").trim()
    if (!isCoordinateExpression(text)) return false
    const base = parseCoordinate(text, {
      lastPoint: ctx.lastPoint,
      relativeByDefault: false,
      ucs: ctx.ucs,
      elevation: ctx.elevation,
    })
    if (!base) return false
    this.enterFactor(base, ctx)
    return true
  }

  private enterFactor(base: Vec3, ctx: ToolContext): void {
    const originals = selectedInDrawingOrder(ctx)
    if (originals.length === 0) {
      // The selection vanished (e.g. undo elsewhere): fall back to picking.
      this.state = { phase: "selecting" }
      this.selector.start()
      ctx.dynamicInput.close()
      return
    }
    this.state = {
      phase: "factor",
      base,
      originals,
      unit: factorUnit(originals, ctx.blocks),
      copy: false,
      current: base,
    }
    this.openFactorInput(ctx)
  }

  private openFactorInput(ctx: ToolContext): void {
    const session: DynamicInputSession = {
      fields: [{ id: "factor", prompt: "scaleFactor", kind: "number" }],
      commit: (_values, commitCtx) => this.commitFactor(commitCtx),
      commitRaw: (commitCtx) => this.commitFactor(commitCtx),
    }
    ctx.dynamicInput.open(session)
    ctx.dynamicInput.setLive("factor", null)
    ctx.dynamicInput.setPosition(this.lastScreen ?? { x: 0, y: 0 })
  }

  /** Handles the scale factor confirmed from the dynamic input (Enter). */
  private commitFactor(ctx: ToolContext): boolean {
    const typed = ctx.dynamicInput.hasTypedText()
    // A typed answer that is no number is refused, never read off the cursor.
    const field = this.state.phase === "newLength" ? "newLength" : "factor"
    if (typed && parseField(ctx, field) === null) return false
    // Enter at Points' first point keeps nothing: AutoCAD's console scales by
    // its cursor's reading there, which nothing here reproduces (p183).
    if (this.state.phase === "newLength" && this.state.points && !typed) {
      return false
    }
    if (this.state.phase === "factor") {
      const factor = typed
        ? this.resolveDirectFactor(this.state, this.state.current, ctx)
        : this.lastFactor
      this.scaleBy(this.state, factor, ctx)
      return true
    }
    if (this.state.phase === "newLength") {
      this.commitNewLength(
        this.state,
        typed
          ? this.resolveNewLength(this.state.base, this.state.current, ctx)
          : this.lastNewLength,
        ctx
      )
      return true
    }
    return false
  }

  private openReferenceInput(ctx: ToolContext): void {
    const session: DynamicInputSession = {
      fields: [
        { id: "reference", prompt: "referenceLength", kind: "distance" },
      ],
      commit: (_values, commitCtx) => this.commitReference(commitCtx),
      commitRaw: (commitCtx) => this.commitReference(commitCtx),
    }
    ctx.dynamicInput.open(session)
    // Its default, as the new length's (desktop transforms/d08-1).
    ctx.dynamicInput.setDefault("reference", this.lastReference)
    ctx.dynamicInput.setPosition(this.lastScreen ?? { x: 0, y: 0 })
  }

  /**
   * The reference length, typed or measured by the runtime's two points, or
   * Enter's default, asks the new one; 0 and negatives are refused and asked
   * again (probes transforms/p174, p175).
   */
  private commitReference(ctx: ToolContext): boolean {
    if (this.state.phase !== "refP1") return false
    const typed = parseField(ctx, "reference")
    if (typed === null && ctx.dynamicInput.hasTypedText()) return false
    const reference = typed ?? this.lastReference
    if (!(reference > 0)) {
      ctx.report(ctx.text.message("positiveNonzero"), "error")
      return true
    }
    this.lastReference = reference
    this.enterNewLength(reference, ctx)
    return true
  }

  private enterNewLength(reference: number, ctx: ToolContext): void {
    if (this.state.phase !== "refP1") return
    this.state = {
      phase: "newLength",
      base: this.state.base,
      originals: this.state.originals,
      copy: this.state.copy,
      reference,
      current: this.state.current,
      points: false,
    }
    this.openNewLengthInput(ctx)
  }

  private openNewLengthInput(ctx: ToolContext): void {
    const session: DynamicInputSession = {
      fields: [{ id: "newLength", prompt: "newLength", kind: "distance" }],
      commit: (_values, commitCtx) => this.commitFactor(commitCtx),
      commitRaw: (commitCtx) => this.commitFactor(commitCtx),
    }
    ctx.dynamicInput.open(session)
    // The new length's field holds its default, not the dragged distance;
    // Points' points hold nothing (desktop transforms/d08-3).
    if (this.state.phase === "newLength" && this.state.points) {
      ctx.dynamicInput.setLive("newLength", null)
    } else {
      ctx.dynamicInput.setDefault("newLength", this.lastNewLength)
    }
    ctx.dynamicInput.setPosition(this.lastScreen ?? { x: 0, y: 0 })
  }

  /**
   * Scales to `newLength / reference`, the new length kept as the default; 0
   * and negatives are refused and asked again (probes transforms/p178, p179).
   */
  private commitNewLength(
    state: Extract<ScaleState, { phase: "newLength" }>,
    newLength: number,
    ctx: ToolContext
  ): void {
    if (!(newLength > 0)) {
      ctx.report(ctx.text.message("positiveNonzero"), "error")
      return
    }
    this.lastNewLength = newLength
    this.commit(state, newLength / state.reference, ctx)
  }

  /**
   * The factor's answer: 0, a negative or a point on the base is refused and
   * asked again (probes transforms/p167, p168, p193).
   */
  private scaleBy(
    state: Extract<ScaleState, { phase: "factor" }>,
    factor: number,
    ctx: ToolContext
  ): void {
    if (!(factor > 0)) {
      ctx.report(ctx.text.message("positiveNonzero"), "error")
      return
    }
    this.commit(state, factor, ctx)
  }

  /**
   * Applies the scaling (in place, or as a fresh copy) and ends the command;
   * the factor, however reached, is the next one's `<default>` (p188).
   */
  private commit(
    state: Extract<ScaleState, { phase: "factor" | "newLength" }>,
    factor: number,
    ctx: ToolContext
  ): void {
    this.lastFactor = factor
    if (state.copy) {
      ctx.execute(
        new AddEntitiesCommand(
          state.originals.map((e) => scaleEntityCopy(e, state.base, factor))
        )
      )
    } else if (Math.abs(factor - 1) > 1e-9) {
      ctx.execute(
        new UpdateEntitiesCommand(
          state.originals.map((e) => scaleEntity(e, state.base, factor))
        )
      )
    }
    ctx.dynamicInput.close()
    ctx.endCommand()
  }

  private resolveBase(rawPoint: Vec3, ctx: ToolContext): Vec3 {
    const text = ctx.dynamicInput.getText("base").trim()
    if (isCoordinateExpression(text)) {
      const point = parseCoordinate(text, {
        lastPoint: ctx.lastPoint,
        relativeByDefault: false,
        ucs: ctx.ucs,
        elevation: ctx.elevation,
      })
      if (point) return point
    }
    return rawPoint
  }

  /**
   * The factor a click, a typed point and the drag share: a typed number
   * hard-locks it, otherwise the point's {@link pointFactor}.
   */
  private resolveDirectFactor(
    state: Extract<ScaleState, { phase: "factor" }>,
    cursor: Vec2,
    ctx: ToolContext
  ): number {
    return parseField(ctx, "factor") ?? pointFactor(state, cursor)
  }

  /**
   * Reference mode's new length: a typed value (hard-locked) or the base →
   * cursor distance.
   */
  private resolveNewLength(base: Vec2, cursor: Vec2, ctx: ToolContext): number {
    return parseField(ctx, "newLength") ?? distanceFrom(base, cursor)
  }
}

/**
 * Half the largest side of the set's extents in the UCS, which a point at the
 * factor is measured against, or 1 when they have no size (a POINT): not the
 * diagonal, the base or the view (probe transforms/p219).
 */
function factorUnit(
  originals: readonly Entity[],
  blocks: ToolContext["blocks"]
): number {
  const bounds = entitiesBounds(originals, blocks)
  if (bounds === null) return 1
  const side = Math.max(
    bounds.max.x - bounds.min.x,
    bounds.max.y - bounds.min.y
  )
  return side > 0 ? side / 2 : 1
}

function pointFactor(
  state: Extract<ScaleState, { phase: "factor" }>,
  point: Vec2
): number {
  return distanceFrom(state.base, point) / state.unit
}

/**
 * Reads a dynamic-input field as a finite number, or `null` when empty or not a
 * valid number (a non-null result means the field is hard-locked to that value).
 */
function parseField(ctx: ToolContext, id: string): number | null {
  const text = ctx.dynamicInput.getText(id).trim()
  if (text === "") return null
  const value = parseNumber(text)
  return value !== null && Number.isFinite(value) ? value : null
}

/** Distance between two world points. */
function distanceFrom(from: Vec2, to: Vec2): number {
  return V.length(V.sub(to, from))
}
