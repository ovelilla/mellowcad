import { Vec2, V } from "../../geometry/Vec2"
import { Vec3 } from "../../geometry/Vec3"
import { Entity, scaleEntity, scaleEntityCopy } from "../../domain/entities"
import { parseNumber } from "../../domain/units"
import { DynamicInputSession } from "../input/DynamicInput"
import {
  isCoordinateExpression,
  parseCoordinate,
} from "../input/coordinateInput"
import { ScenePrimitive, StrokeStyle } from "../../scene/types"
import { entityScenePrimitive } from "../SceneBuilder"
import { THEME } from "../../scene/theme"
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
import { ObjectSelector, countPreselection } from "./objectSelection"
import type { PromptId } from "../../locales/types"

/**
 * AutoCAD's SCALE command: select a set of objects, pick a base point, then
 * resize the set uniformly about it.
 *
 * ```
 *   (empty selection)    Enter/Space      click / type       [Copy]  keeps original
 *  selecting ─────────────────────► base ──────────► factor ──────────► done
 *   click / box-drag adds objects       (dashed ghost scales live)  [Reference]
 *                                                                        │
 *                                          refP1 ─► newLength ─► [Points]┘
 * ```
 *
 * A typed factor multiplies directly; pointing uses the base → cursor distance
 * as the factor (AutoCAD's implicit unit reference), so the set grows as the
 * cursor moves away from the base and shrinks toward it. Two keywords match
 * AutoCAD: **Copy** leaves the originals in place and scales a fresh duplicate;
 * **Reference** scales by `new length / reference length`, letting you resize
 * so a measured length becomes a target length. Works on any selection — lines
 * and circles alike (a circle's radius scales too) — with object snap and typed
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
  /** The scale factor's `<default>`: the last one used, 1 at first; not saved. */
  private lastFactor = 1
  /** Reference's `<default>`s, the last ones given, 1 at first; not saved. */
  private lastReference = 1
  private lastNewLength = 1

  onActivate(ctx: ToolContext): void {
    ctx.setCursor("crosshair")
    // Pre-selected objects (the common path) skip straight to the base point,
    // matching AutoCAD; otherwise prompt to select the objects first.
    if (ctx.selection.isEmpty()) {
      this.state = { phase: "selecting" }
      this.selector.start()
    } else {
      countPreselection(ctx)
      this.state = { phase: "base" }
      this.openBaseInput(ctx)
    }
  }

  /**
   * WHY the factor shows no `<default>` though Enter takes the last one:
   * AutoCAD's 2026 prompt shows none. Reference's lengths show theirs, as
   * AutoCAD 2023's console does: `Specify new length or [Points] <1.0000>:`.
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
   * The factor is a distance from the base point, as AutoCAD reads it; the
   * reference length and Points' new length are measured by two points of
   * their own.
   */
  takes(): QuestionInput | null {
    switch (this.state.phase) {
      case "selecting":
        return this.selector.takes("objects")
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
        ctx.dynamicInput.setLive(
          "factor",
          distanceFrom(this.state.base, input.point)
        )
        ctx.dynamicInput.setPosition(input.screen)
        break
      }
      case "refP1":
        this.state = { ...this.state, current: input.point }
        ctx.dynamicInput.setPosition(input.screen)
        break
      case "newLength": {
        this.state = { ...this.state, current: input.point }
        if (this.state.points) break
        ctx.dynamicInput.setLive(
          "newLength",
          distanceFrom(this.state.base, input.point)
        )
        ctx.dynamicInput.setPosition(input.screen)
        break
      }
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
      case "factor": {
        const factor = this.resolveDirectFactor(
          this.state.base,
          input.point,
          ctx
        )
        this.commit(this.state, factor, ctx)
        return
      }
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

  buildOverlay(ctx: ToolContext): ScenePrimitive[] {
    if (this.state.phase === "selecting") return this.selector.buildOverlay(ctx)
    const { viewport } = ctx

    const out: ScenePrimitive[] = []
    const arm: StrokeStyle = { color: THEME.preview, width: 1, dash: [2, 3] }

    switch (this.state.phase) {
      case "factor": {
        const factor = this.resolveDirectFactor(
          this.state.base,
          this.state.current,
          ctx
        )
        pushGhost(
          out,
          viewport,
          this.state.originals,
          this.state.base,
          factor,
          ctx.blocks
        )
        pushArm(out, viewport, this.state.base, this.state.current, arm)
        break
      }
      case "refP1":
        pushArm(out, viewport, this.state.base, this.state.current, arm)
        break
      case "newLength": {
        if (this.state.points) break
        const factor =
          this.resolveNewLength(this.state.base, this.state.current, ctx) /
          this.state.reference
        pushGhost(
          out,
          viewport,
          this.state.originals,
          this.state.base,
          factor,
          ctx.blocks
        )
        pushArm(out, viewport, this.state.base, this.state.current, arm)
        break
      }
    }
    return out
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
    const originals = this.snapshotSelection(ctx)
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
    // Enter at Points' first point keeps nothing: AutoCAD 2023's console
    // scales by a length of its own there, which nothing here reproduces.
    if (this.state.phase === "newLength" && this.state.points && !typed) {
      return false
    }
    if (this.state.phase === "factor") {
      const factor = typed
        ? this.resolveDirectFactor(this.state.base, this.state.current, ctx)
        : this.lastFactor
      this.commit(this.state, factor, ctx)
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
    ctx.dynamicInput.setLive("reference", null)
    ctx.dynamicInput.setPosition(this.lastScreen ?? { x: 0, y: 0 })
  }

  /** A typed reference length skips the two-point measure and asks the new one. */
  private commitReference(ctx: ToolContext): boolean {
    if (this.state.phase !== "refP1") return false
    const typed = parseField(ctx, "reference")
    if (typed === null && ctx.dynamicInput.hasTypedText()) return false
    const reference = typed !== null && typed > 0 ? typed : this.lastReference
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
    ctx.dynamicInput.setLive("newLength", null)
    ctx.dynamicInput.setPosition(this.lastScreen ?? { x: 0, y: 0 })
  }

  /** Scales to `newLength / reference`, the new length kept as the default. */
  private commitNewLength(
    state: Extract<ScaleState, { phase: "newLength" }>,
    newLength: number,
    ctx: ToolContext
  ): void {
    if (newLength > 0) this.lastNewLength = newLength
    this.commit(state, newLength / state.reference, ctx)
  }

  /** Applies the scaling (in place, or as a fresh copy) and ends the command. */
  private commit(
    state: Extract<ScaleState, { phase: "factor" | "newLength" }>,
    factor: number,
    ctx: ToolContext
  ): void {
    // AutoCAD rejects a non-positive factor; treat it as a no-op that ends.
    if (Number.isFinite(factor) && factor > 0) {
      if (state.phase === "factor") this.lastFactor = factor
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
    }
    ctx.dynamicInput.close()
    ctx.endCommand()
  }

  private snapshotSelection(ctx: ToolContext): readonly Entity[] {
    return ctx.selection
      .toArray()
      .map((id) => ctx.document.get(id))
      .filter((entity): entity is Entity => entity !== undefined)
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
   * The direct-mode factor: a typed number hard-locks it, otherwise the base →
   * cursor distance drives it (AutoCAD's "specify on screen" behaviour, where a
   * unit distance means no change).
   */
  private resolveDirectFactor(
    base: Vec2,
    cursor: Vec2,
    ctx: ToolContext
  ): number {
    const typed = parseField(ctx, "factor")
    if (typed !== null) return typed
    return distanceFrom(base, cursor)
  }

  /**
   * Reference mode's new length: a typed value (hard-locked) or the base →
   * cursor distance.
   */
  private resolveNewLength(base: Vec2, cursor: Vec2, ctx: ToolContext): number {
    return parseField(ctx, "newLength") ?? distanceFrom(base, cursor)
  }
}

function pushGhost(
  out: ScenePrimitive[],
  viewport: ToolContext["viewport"],
  originals: readonly Entity[],
  base: Vec2,
  factor: number,
  blocks: ToolContext["blocks"]
): void {
  const safe = Number.isFinite(factor) && factor > 0 ? factor : 1
  const ghost: StrokeStyle = { color: THEME.preview, width: 1, dash: [6, 4] }
  for (const entity of originals) {
    out.push(
      ...entityScenePrimitive(
        viewport,
        scaleEntity(entity, base, safe),
        ghost,
        { blocks }
      )
    )
  }
}

function pushArm(
  out: ScenePrimitive[],
  viewport: ToolContext["viewport"],
  from: Vec2,
  to: Vec2,
  stroke: StrokeStyle
): void {
  out.push({
    kind: "segment",
    a: viewport.worldToScreen(from),
    b: viewport.worldToScreen(to),
    stroke,
  })
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
