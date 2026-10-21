import { Vec2, V } from "../../geometry/Vec2"
import { headingInUcs } from "./ucsHeading"
import { Entity, rotateEntity, rotateEntityCopy } from "../../domain/entities"
import { formatAngle, parseNumber } from "../../domain/units"
import { DynamicInputSession } from "../input/DynamicInput"
import type { PromptId } from "../../locales/types"
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
import { ObjectSelector } from "./objectSelection"

/**
 * AutoCAD's ROTATE command: select a set of objects, pick a base point (the
 * pivot), then spin the set about it.
 *
 * ```
 *   (empty selection)    Enter/Space      click / type       [Copy]  keeps original
 *  selecting ─────────────────────► pivot ──────────► angle ──────────► done
 *   click / box-drag adds objects       (dashed ghost spins live)   [Reference]
 *                                                                        │
 *                                              refP1 ─► refP2 ─► newAngle┘
 * ```
 *
 * The rotation angle is measured counter-clockwise from the +X axis (AutoCAD's
 * default reference of 0°), so pointing east rotates by 0 and pointing north by
 * 90. Two keywords match AutoCAD: **Copy** leaves the originals in place and
 * rotates a fresh duplicate; **Reference** rotates from a measured reference
 * direction to a new one (`rotation = new − reference`). Works on any selection
 * — lines and circles alike (a circle only moves its centre) — with object
 * snap, Ortho/Polar locking the arm, and typed angle or coordinate entry.
 */

type RotateState =
  /** No pre-selection: `Select objects:` builds the set. */
  | { readonly phase: "selecting" }
  /** Objects chosen; awaiting the base point (pivot) of the rotation. */
  | { readonly phase: "pivot" }
  /** Base placed; the set spins to the rotation angle (cursor-driven). */
  | {
      readonly phase: "angle"
      readonly base: Vec2
      readonly originals: readonly Entity[]
      /** Reference mode Copy keeps the originals in place. */
      readonly copy: boolean
      readonly current: Vec2
    }
  /** Reference mode: measuring the first point of the reference direction. */
  | {
      readonly phase: "refP1"
      readonly base: Vec2
      readonly originals: readonly Entity[]
      readonly copy: boolean
      readonly current: Vec2
    }
  /** Reference mode: measuring the second point of the reference direction. */
  | {
      readonly phase: "refP2"
      readonly base: Vec2
      readonly originals: readonly Entity[]
      readonly copy: boolean
      readonly p1: Vec2
      readonly current: Vec2
    }
  /** Reference mode: the set spins to the new absolute angle. */
  | {
      readonly phase: "newAngle"
      readonly base: Vec2
      readonly originals: readonly Entity[]
      readonly copy: boolean
      /** Reference angle (degrees) the new angle is measured against. */
      readonly reference: number
      readonly current: Vec2
    }

export class RotateTool implements Tool {
  readonly id = "rotate"
  readonly shortcut = "r"

  private state: RotateState = { phase: "selecting" }
  private readonly selector = new ObjectSelector({
    done: (ctx) => this.confirmSelection(ctx),
  })
  private lastScreen: Vec2 | null = null
  /**
   * The rotation angle's `<default>`: AutoCAD "knows the last rotation angle
   * and offers it as default", per drawing and not saved; 0 at first
   * (rectang/p314).
   */
  private lastAngle = 0

  onNewDrawing(): void {
    this.lastAngle = 0
  }

  onActivate(ctx: ToolContext): void {
    ctx.setCursor("crosshair")
    // ANGDIR and ANGBASE are fixed here: counterclockwise from east.
    ctx.report(
      ctx.text.message("rotateSettings", {
        angbase: formatAngle(0, ctx.document.getSettings()),
      })
    )
    // Pre-selected objects (the common path) skip straight to the base point,
    // matching AutoCAD; otherwise prompt to select the objects first.
    this.selector.start()
    if (!this.selector.preselect(ctx)) {
      this.state = { phase: "selecting" }
    } else {
      this.state = { phase: "pivot" }
      this.openPivotInput(ctx)
    }
  }

  /**
   * WHY the new angle names no `[Points]` and no `<default>`: neither is
   * offered here.
   */
  question(): PromptId | ToolQuestion {
    switch (this.state.phase) {
      case "selecting":
        return this.selector.question()
      case "pivot":
        return "specifyBasePoint"
      case "angle":
        return {
          id: "specifyRotationAngleOr",
          enter: { angle: this.lastAngle },
        }
      case "refP1":
        return { id: "specifyTheReferenceAngle", enter: { angle: 0 } }
      case "refP2":
        return "specifySecondPoint"
      case "newAngle":
        return "specifyTheNewAngle"
    }
  }

  /** The reference angle is measured by two points of its own. */
  takes(): QuestionInput | null {
    if (this.state.phase === "selecting") return this.selector.takes()
    return this.state.phase === "refP1"
      ? { refusal: "requiresAngle", values: { points: "two", keyword: "no" } }
      : null
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
      case "pivot":
        ctx.dynamicInput.setPosition(input.screen)
        break
      case "angle": {
        this.state = { ...this.state, current: input.point }
        ctx.dynamicInput.setLive(
          "angle",
          bearing(this.state.base, input.point, ctx)
        )
        ctx.dynamicInput.setPosition(input.screen)
        break
      }
      case "refP1":
        this.state = { ...this.state, current: input.point }
        ctx.dynamicInput.setPosition(input.screen)
        break
      case "refP2":
        this.state = { ...this.state, current: input.point }
        ctx.dynamicInput.setPosition(input.screen)
        break
      case "newAngle": {
        this.state = { ...this.state, current: input.point }
        ctx.dynamicInput.setLive(
          "newAngle",
          bearing(this.state.base, input.point, ctx)
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
      case "pivot": {
        const base = this.resolvePivot(input.point, ctx)
        this.enterAngle(base, ctx)
        return
      }
      case "angle": {
        const rotation = this.resolveDirectRotation(
          this.state.base,
          input.point,
          ctx
        )
        this.commit(this.state, rotation, ctx)
        return
      }
      case "refP1": {
        this.state = { ...this.state, phase: "refP2", p1: input.point }
        this.openReferenceSecondInput(ctx)
        return
      }
      case "refP2": {
        const reference = bearing(this.state.p1, input.point, ctx) ?? 0
        this.enterNewAngle(reference, ctx)
        return
      }
      case "newAngle": {
        const rotation = this.resolveNewRotation(
          this.state.base,
          input.point,
          this.state.reference,
          ctx
        )
        this.commit(this.state, rotation, ctx)
        return
      }
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
   * `[Copy/Reference]` at the rotation angle, as AutoCAD keeps listing them
   * once Copy is chosen; the new angle offers neither.
   */
  commandOptions(): readonly CommandOption[] {
    if (this.state.phase === "selecting") return this.selector.commandOptions()
    return this.state.phase === "angle"
      ? [{ id: "Copy" }, { id: "Reference" }]
      : []
  }

  invokeOption(id: string, ctx: ToolContext): CommandOptionOutcome {
    if (this.state.phase === "selecting") {
      return this.selector.invokeOption(id, ctx) ? "continue" : "unhandled"
    }
    if (id === "Copy" && this.state.phase === "angle") {
      // A second Copy says it again, as AutoCAD's console does.
      ctx.report(ctx.text.message("rotatingCopy"))
      this.state = { ...this.state, copy: true }
      ctx.requestRender()
      return "continue"
    }
    if (id === "Reference" && this.state.phase === "angle") {
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
    return "unhandled"
  }

  getConstraintAnchor(): Vec2 | null {
    // Ortho/Polar lock the arm: from the pivot while setting the rotation, from
    // the first reference point while measuring the reference direction.
    switch (this.state.phase) {
      case "angle":
      case "newAngle":
        return this.state.base
      case "refP2":
        return this.state.p1
      default:
        return null
    }
  }

  wantsSnap(): boolean {
    // Object snaps help place every point precisely; picking objects (click or
    // box) in the selecting phase does not need them.
    return (
      this.state.phase === "pivot" ||
      this.state.phase === "angle" ||
      this.state.phase === "refP1" ||
      this.state.phase === "refP2" ||
      this.state.phase === "newAngle" ||
      (this.state.phase === "selecting" && this.selector.wantsSnap())
    )
  }

  buildOverlay(ctx: ToolContext): ScenePrimitive[] {
    if (this.state.phase === "selecting") return this.selector.buildOverlay(ctx)
    const { viewport } = ctx

    const out: ScenePrimitive[] = []
    const arm: StrokeStyle = { color: THEME.preview, width: 1, dash: [2, 3] }

    switch (this.state.phase) {
      case "angle": {
        const rotation = this.resolveDirectRotation(
          this.state.base,
          this.state.current,
          ctx
        )
        pushGhost(
          out,
          viewport,
          this.state.originals,
          this.state.base,
          rotation,
          ctx.blocks
        )
        pushArm(out, viewport, this.state.base, this.state.current, arm)
        break
      }
      case "refP1":
        pushArm(out, viewport, this.state.base, this.state.current, arm)
        break
      case "refP2":
        pushArm(out, viewport, this.state.p1, this.state.current, {
          color: THEME.selected,
          width: 1,
          dash: [6, 4],
        })
        break
      case "newAngle": {
        const rotation = this.resolveNewRotation(
          this.state.base,
          this.state.current,
          this.state.reference,
          ctx
        )
        pushGhost(
          out,
          viewport,
          this.state.originals,
          this.state.base,
          rotation,
          ctx.blocks
        )
        pushArm(out, viewport, this.state.base, this.state.current, arm)
        break
      }
    }
    return out
  }

  private confirmSelection(ctx: ToolContext): void {
    this.state = { phase: "pivot" }
    this.openPivotInput(ctx)
    ctx.requestRender()
  }

  private openPivotInput(ctx: ToolContext): void {
    const session: DynamicInputSession = {
      fields: [{ id: "base", prompt: "basePoint", kind: "coordinate" }],
      commit: () => {},
      commitRaw: (commitCtx) => this.commitPivotCoordinate(commitCtx),
    }
    ctx.dynamicInput.open(session)
    if (this.lastScreen) ctx.dynamicInput.setPosition(this.lastScreen)
  }

  private commitPivotCoordinate(ctx: ToolContext): boolean {
    if (this.state.phase !== "pivot") return false
    const text = ctx.dynamicInput.getText("base").trim()
    if (!isCoordinateExpression(text)) return false
    const base = parseCoordinate(text, {
      lastPoint: ctx.lastPoint,
      relativeByDefault: false,
      ucs: ctx.ucs,
      elevation: ctx.elevation,
    })
    if (!base) return false
    this.enterAngle(base, ctx)
    return true
  }

  private enterAngle(base: Vec2, ctx: ToolContext): void {
    const originals = this.snapshotSelection(ctx)
    if (originals.length === 0) {
      // The selection vanished (e.g. undo elsewhere): fall back to picking.
      this.state = { phase: "selecting" }
      this.selector.start()
      ctx.dynamicInput.close()
      return
    }
    this.state = { phase: "angle", base, originals, copy: false, current: base }
    this.openAngleInput(ctx, "angle", "rotationAngle")
  }

  private openAngleInput(
    ctx: ToolContext,
    fieldId: string,
    prompt: PromptId
  ): void {
    const session: DynamicInputSession = {
      fields: [{ id: fieldId, prompt, kind: "angle" }],
      commit: (_values, commitCtx) => this.commitAngle(commitCtx),
      commitRaw: (commitCtx) => this.commitAngle(commitCtx),
    }
    ctx.dynamicInput.open(session)
    ctx.dynamicInput.setLive(fieldId, null)
    ctx.dynamicInput.setPosition(this.lastScreen ?? { x: 0, y: 0 })
  }

  /** Handles the rotation angle confirmed from the dynamic input (Enter). */
  private commitAngle(ctx: ToolContext): boolean {
    const typed = ctx.dynamicInput.hasTypedText()
    // A typed answer that is no angle is refused, never read off the cursor.
    const field = this.state.phase === "newAngle" ? "newAngle" : "angle"
    if (typed && parseField(ctx, field) === null) return false
    if (this.state.phase === "angle") {
      const rotation = typed
        ? this.resolveDirectRotation(this.state.base, this.state.current, ctx)
        : this.lastAngle
      this.commit(this.state, rotation, ctx)
      return true
    }
    if (this.state.phase === "newAngle" && typed) {
      const rotation = this.resolveNewRotation(
        this.state.base,
        this.state.current,
        this.state.reference,
        ctx
      )
      this.commit(this.state, rotation, ctx)
      return true
    }
    return false
  }

  private openReferenceInput(ctx: ToolContext): void {
    const session: DynamicInputSession = {
      fields: [{ id: "reference", prompt: "referenceAngle", kind: "angle" }],
      commit: (_values, commitCtx) => this.commitReference(commitCtx),
      commitRaw: (commitCtx) => this.commitReference(commitCtx),
    }
    ctx.dynamicInput.open(session)
    ctx.dynamicInput.setLive("reference", null)
    ctx.dynamicInput.setPosition(this.lastScreen ?? { x: 0, y: 0 })
  }

  /** A typed reference angle skips the two-point measure and asks the new one. */
  private commitReference(ctx: ToolContext): boolean {
    if (this.state.phase !== "refP1") return false
    const reference = parseField(ctx, "reference")
    if (reference === null && ctx.dynamicInput.hasTypedText()) return false
    this.enterNewAngle(reference ?? 0, ctx)
    return true
  }

  private openReferenceSecondInput(ctx: ToolContext): void {
    const session: DynamicInputSession = {
      fields: [{ id: "second", prompt: "secondPoint", kind: "coordinate" }],
      commit: () => {},
      commitRaw: (commitCtx) => this.commitReferenceSecond(commitCtx),
    }
    ctx.dynamicInput.open(session)
    ctx.dynamicInput.setPosition(this.lastScreen ?? { x: 0, y: 0 })
  }

  /** A typed second point completes the two-point reference direction. */
  private commitReferenceSecond(ctx: ToolContext): boolean {
    if (this.state.phase !== "refP2") return false
    const text = ctx.dynamicInput.getText("second").trim()
    if (!isCoordinateExpression(text)) return false
    const p2 = parseCoordinate(text, {
      lastPoint: this.state.p1,
      relativeByDefault: true,
      ucs: ctx.ucs,
      elevation: ctx.elevation,
    })
    if (!p2) return false
    const reference = bearing(this.state.p1, p2, ctx) ?? 0
    this.enterNewAngle(reference, ctx)
    return true
  }

  private enterNewAngle(reference: number, ctx: ToolContext): void {
    if (this.state.phase !== "refP1" && this.state.phase !== "refP2") return
    this.state = {
      phase: "newAngle",
      base: this.state.base,
      originals: this.state.originals,
      copy: this.state.copy,
      reference,
      current: this.state.current,
    }
    this.openAngleInput(ctx, "newAngle", "newAngle")
  }

  /** Applies the rotation (in place, or as a fresh copy) and ends the command. */
  private commit(
    state: Extract<RotateState, { phase: "angle" | "newAngle" }>,
    rotationDeg: number,
    ctx: ToolContext
  ): void {
    if (state.phase === "angle") this.lastAngle = rotationDeg
    const rad = (rotationDeg * Math.PI) / 180
    if (state.copy) {
      ctx.execute(
        new AddEntitiesCommand(
          state.originals.map((e) => rotateEntityCopy(e, state.base, rad))
        )
      )
    } else if (Math.abs(normalizeSigned(rotationDeg)) > 1e-9) {
      ctx.execute(
        new UpdateEntitiesCommand(
          state.originals.map((e) => rotateEntity(e, state.base, rad))
        )
      )
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

  private resolvePivot(rawPoint: Vec2, ctx: ToolContext): Vec2 {
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
   * The direct-mode rotation in degrees: a typed angle hard-locks it, otherwise
   * the base → cursor bearing drives it (0° = no rotation, matching AutoCAD's
   * default reference of 0).
   */
  private resolveDirectRotation(
    base: Vec2,
    cursor: Vec2,
    ctx: ToolContext
  ): number {
    const typed = parseField(ctx, "angle")
    if (typed !== null) return typed
    return bearing(base, cursor, ctx) ?? 0
  }

  /**
   * Reference-mode rotation in degrees: `new − reference`, where the new angle
   * is a typed absolute angle (hard-locked) or the base → cursor bearing.
   */
  private resolveNewRotation(
    base: Vec2,
    cursor: Vec2,
    reference: number,
    ctx: ToolContext
  ): number {
    const typed = parseField(ctx, "newAngle")
    const newAngle = typed ?? bearing(base, cursor, ctx) ?? reference
    return newAngle - reference
  }
}

function pushGhost(
  out: ScenePrimitive[],
  viewport: ToolContext["viewport"],
  originals: readonly Entity[],
  base: Vec2,
  rotationDeg: number,
  blocks: ToolContext["blocks"]
): void {
  const rad = (rotationDeg * Math.PI) / 180
  const ghost: StrokeStyle = { color: THEME.preview, width: 1, dash: [6, 4] }
  for (const entity of originals) {
    out.push(
      ...entityScenePrimitive(
        viewport,
        rotateEntity(entity, base, rad),
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

/** Bearing of `from → to` in degrees from the UCS X axis, or `null` when coincident. */
function bearing(from: Vec2, to: Vec2, ctx: ToolContext): number | null {
  const dir = V.sub(to, from)
  if (V.length(dir) < 1e-9) return null
  return headingInUcs(ctx.ucs, dir)
}

/** Folds an angle in degrees into the `(-180, 180]` range for near-zero tests. */
function normalizeSigned(deg: number): number {
  let d = deg % 360
  if (d > 180) d -= 360
  if (d <= -180) d += 360
  return d
}
