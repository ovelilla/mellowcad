import { Vec2, V } from "../../geometry/Vec2"
import { Vec3 } from "../../geometry/Vec3"
import {
  Entity,
  EntityId,
  scaleEntity,
  scaleEntityCopy,
} from "../../domain/entities"
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
import { boxSelect, buildSelectionBoxOverlay } from "./boxSelection"
import {
  CommandOption,
  CommandOptionOutcome,
  PointerInput,
  Tool,
  ToolContext,
} from "./Tool"

/**
 * AutoCAD's SCALE command: select a set of objects, pick a base point, then
 * resize the set uniformly about it.
 *
 * ```
 *   (empty selection)    Enter/Space      click / type       [Copy]  keeps original
 *  selecting ─────────────────────► base ──────────► factor ──────────► done
 *   click / box-drag adds objects       (dashed ghost scales live)  [Reference]
 *                                                                        │
 *                                              refP1 ─► refP2 ─► newLength┘
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

/** Screen-pixel movement past which a press-drag becomes a box selection. */
const DRAG_THRESHOLD_PX = 4

type ScaleState =
  /** No pre-selection: build the set by clicking or box-dragging. */
  | { readonly phase: "selecting" }
  /** Mouse down while selecting: still a click until it drags far enough. */
  | {
      readonly phase: "pressed"
      readonly startWorld: Vec2
      readonly startScreen: Vec2
      readonly currentWorld: Vec2
      readonly subtract: boolean
    }
  /** Dragging a selection box (window left→right / crossing right→left). */
  | {
      readonly phase: "boxing"
      readonly startWorld: Vec2
      readonly currentWorld: Vec2
      readonly subtract: boolean
    }
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
  /** Reference mode: measuring the first point of the reference length. */
  | {
      readonly phase: "refP1"
      readonly base: Vec3
      readonly originals: readonly Entity[]
      readonly copy: boolean
      readonly current: Vec2
    }
  /** Reference mode: measuring the second point of the reference length. */
  | {
      readonly phase: "refP2"
      readonly base: Vec3
      readonly originals: readonly Entity[]
      readonly copy: boolean
      readonly p1: Vec2
      readonly current: Vec2
    }
  /** Reference mode: the set scales to the new length. */
  | {
      readonly phase: "newLength"
      readonly base: Vec3
      readonly originals: readonly Entity[]
      readonly copy: boolean
      /** Reference length the new length is divided by for the factor. */
      readonly reference: number
      readonly current: Vec2
    }

export class ScaleTool implements Tool {
  readonly id = "scale"

  private state: ScaleState = { phase: "selecting" }
  private lastScreen: Vec2 | null = null
  /** The scale factor's `<default>`: the last one used, 1 at first; not saved. */
  private lastFactor = 1

  onActivate(ctx: ToolContext): void {
    ctx.setCursor("crosshair")
    // Pre-selected objects (the common path) skip straight to the base point,
    // matching AutoCAD; otherwise prompt to select the objects first.
    if (ctx.selection.isEmpty()) {
      this.state = { phase: "selecting" }
    } else {
      this.state = { phase: "base" }
      this.openBaseInput(ctx)
    }
  }

  onDeactivate(ctx: ToolContext): void {
    this.state = { phase: "selecting" }
    ctx.dynamicInput.close()
  }

  onPointerMove(input: PointerInput, ctx: ToolContext): void {
    this.lastScreen = input.screen

    switch (this.state.phase) {
      case "pressed": {
        const moved = Math.hypot(
          input.screen.x - this.state.startScreen.x,
          input.screen.y - this.state.startScreen.y
        )
        if (moved >= DRAG_THRESHOLD_PX) {
          this.state = {
            phase: "boxing",
            startWorld: this.state.startWorld,
            currentWorld: input.world,
            subtract: this.state.subtract,
          }
        } else {
          this.state = { ...this.state, currentWorld: input.world }
        }
        break
      }
      case "boxing":
        this.state = { ...this.state, currentWorld: input.world }
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
      case "refP2":
        this.state = { ...this.state, current: input.point }
        ctx.dynamicInput.setPosition(input.screen)
        break
      case "newLength": {
        this.state = { ...this.state, current: input.point }
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
      case "selecting": {
        this.state = {
          phase: "pressed",
          startWorld: input.world,
          startScreen: input.screen,
          currentWorld: input.world,
          subtract: input.shiftKey,
        }
        return
      }
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
      case "refP1": {
        this.state = { ...this.state, phase: "refP2", p1: input.point }
        this.openReferenceSecondInput(ctx)
        return
      }
      case "refP2": {
        const reference = distanceFrom(this.state.p1, input.point)
        this.enterNewLength(reference, ctx)
        return
      }
      case "newLength": {
        const factor = this.resolveNewFactor(
          this.state.base,
          input.point,
          this.state.reference,
          ctx
        )
        this.commit(this.state, factor, ctx)
        return
      }
    }
  }

  onPointerUp(input: PointerInput, ctx: ToolContext): void {
    if (input.button !== 0) return

    // AutoCAD's "Select objects" prompt, additive across picks and boxes.
    if (this.state.phase === "pressed") {
      const hit = ctx.pick(input.world)
      if (hit) this.applyPick([hit.id], this.state.subtract, ctx)
      this.state = { phase: "selecting" }
      ctx.requestRender()
      return
    }
    if (this.state.phase === "boxing") {
      const hits = boxSelect(
        ctx.document,
        this.state.startWorld,
        this.state.currentWorld,
        ctx.viewport
      )
      this.applyPick(hits, this.state.subtract, ctx)
      this.state = { phase: "selecting" }
      ctx.requestRender()
    }
  }

  onEnter(ctx: ToolContext): boolean {
    return this.confirmSelection(ctx)
  }

  commandOptions(): readonly CommandOption[] {
    if (this.state.phase === "factor") {
      const options: CommandOption[] = []
      if (!this.state.copy) options.push({ id: "Copy" })
      options.push({ id: "Reference" })
      return options
    }
    if (this.state.phase === "newLength" && !this.state.copy) {
      return [{ id: "Copy" }]
    }
    return []
  }

  invokeOption(id: string, ctx: ToolContext): CommandOptionOutcome {
    if (
      id === "Copy" &&
      (this.state.phase === "factor" || this.state.phase === "newLength")
    ) {
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
    return "unhandled"
  }

  getConstraintAnchor(): Vec2 | null {
    // Snap/tracking reference the base while measuring the factor; the reference
    // length is measured from its first point.
    switch (this.state.phase) {
      case "factor":
      case "newLength":
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
      this.state.phase === "base" ||
      this.state.phase === "factor" ||
      this.state.phase === "refP1" ||
      this.state.phase === "refP2" ||
      this.state.phase === "newLength"
    )
  }

  buildOverlay(ctx: ToolContext): ScenePrimitive[] {
    const { viewport } = ctx

    if (this.state.phase === "boxing") {
      return buildSelectionBoxOverlay(
        viewport,
        this.state.startWorld,
        this.state.currentWorld
      )
    }

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
      case "refP2":
        pushArm(out, viewport, this.state.p1, this.state.current, {
          color: THEME.selected,
          width: 1,
          dash: [6, 4],
        })
        break
      case "newLength": {
        const factor = this.resolveNewFactor(
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
          factor,
          ctx.blocks
        )
        pushArm(out, viewport, this.state.base, this.state.current, arm)
        break
      }
    }
    return out
  }

  private applyPick(
    ids: readonly EntityId[],
    subtract: boolean,
    ctx: ToolContext
  ): void {
    for (const id of ids) {
      if (subtract) ctx.selection.remove(id)
      else ctx.selection.add(id)
    }
  }

  private confirmSelection(ctx: ToolContext): boolean {
    if (this.state.phase !== "selecting") return false
    if (ctx.selection.isEmpty()) return false // nothing selected: let Enter exit
    this.state = { phase: "base" }
    this.openBaseInput(ctx)
    ctx.requestRender()
    return true
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
      lastPoint: null,
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
    if (this.state.phase === "factor") {
      const factor = typed
        ? this.resolveDirectFactor(this.state.base, this.state.current, ctx)
        : this.lastFactor
      this.commit(this.state, factor, ctx)
      return true
    }
    if (this.state.phase === "newLength" && typed) {
      const factor = this.resolveNewFactor(
        this.state.base,
        this.state.current,
        this.state.reference,
        ctx
      )
      this.commit(this.state, factor, ctx)
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
    const reference = typed !== null && typed > 0 ? typed : 1
    this.enterNewLength(reference, ctx)
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

  /** A typed second point completes the two-point reference length. */
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
    this.enterNewLength(distanceFrom(this.state.p1, p2), ctx)
    return true
  }

  private enterNewLength(reference: number, ctx: ToolContext): void {
    if (this.state.phase !== "refP1" && this.state.phase !== "refP2") return
    this.state = {
      phase: "newLength",
      base: this.state.base,
      originals: this.state.originals,
      copy: this.state.copy,
      reference,
      current: this.state.current,
    }
    const session: DynamicInputSession = {
      fields: [{ id: "newLength", prompt: "newLength", kind: "distance" }],
      commit: (_values, commitCtx) => this.commitFactor(commitCtx),
      commitRaw: (commitCtx) => this.commitFactor(commitCtx),
    }
    ctx.dynamicInput.open(session)
    ctx.dynamicInput.setLive("newLength", null)
    ctx.dynamicInput.setPosition(this.lastScreen ?? { x: 0, y: 0 })
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
        lastPoint: null,
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
   * Reference-mode factor: `new length / reference length`, where the new length
   * is a typed value (hard-locked) or the base → cursor distance.
   */
  private resolveNewFactor(
    base: Vec2,
    cursor: Vec2,
    reference: number,
    ctx: ToolContext
  ): number {
    if (reference <= 0) return 1
    const typed = parseField(ctx, "newLength")
    const newLength = typed ?? distanceFrom(base, cursor)
    return newLength / reference
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
