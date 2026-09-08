import { Vec2, V } from "../../geometry/Vec2"
import { normalizeDegrees } from "../../geometry/primitives"
import {
  Entity,
  EntityId,
  rotateEntity,
  rotateEntityCopy,
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
  KeyInput,
  PointerInput,
  Tool,
  ToolContext,
} from "./Tool"

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

/** Screen-pixel movement past which a press-drag becomes a box selection. */
const DRAG_THRESHOLD_PX = 4

type RotateState =
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
  readonly label = "Rotate"
  readonly shortcut = "r"

  private state: RotateState = { phase: "selecting" }
  private lastScreen: Vec2 | null = null

  onActivate(ctx: ToolContext): void {
    ctx.setCursor("crosshair")
    // Pre-selected objects (the common path) skip straight to the base point,
    // matching AutoCAD; otherwise prompt to select the objects first.
    if (ctx.selection.isEmpty()) {
      this.state = { phase: "selecting" }
    } else {
      this.state = { phase: "pivot" }
      this.openPivotInput(ctx)
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
      case "pivot":
        ctx.dynamicInput.setPosition(input.screen)
        break
      case "angle": {
        this.state = { ...this.state, current: input.point }
        ctx.dynamicInput.setLive("angle", bearing(this.state.base, input.point))
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
          bearing(this.state.base, input.point)
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
        const reference = bearing(this.state.p1, input.point) ?? 0
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
        this.state.currentWorld
      )
      this.applyPick(hits, this.state.subtract, ctx)
      this.state = { phase: "selecting" }
      ctx.requestRender()
    }
  }

  onKeyDown(input: KeyInput, ctx: ToolContext): void {
    // Space confirms the selection set (AutoCAD treats Space like Enter). Enter
    // itself is routed through onEnter by the runtime.
    if (input.key === " ") this.confirmSelection(ctx)
  }

  onEnter(ctx: ToolContext): boolean {
    return this.confirmSelection(ctx)
  }

  commandOptions(): readonly CommandOption[] {
    if (this.state.phase === "angle") {
      const options: CommandOption[] = []
      if (!this.state.copy) options.push({ key: "C", label: "Copy" })
      options.push({ key: "R", label: "Reference" })
      return options
    }
    if (this.state.phase === "newAngle" && !this.state.copy) {
      return [{ key: "C", label: "Copy" }]
    }
    return []
  }

  invokeOption(key: string, ctx: ToolContext): CommandOptionOutcome {
    const k = key.toLowerCase()
    if (
      k === "c" &&
      (this.state.phase === "angle" || this.state.phase === "newAngle")
    ) {
      this.state = { ...this.state, copy: true }
      ctx.requestRender()
      return "continue"
    }
    if (k === "r" && this.state.phase === "angle") {
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
      this.state.phase === "newAngle"
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
    this.state = { phase: "pivot" }
    this.openPivotInput(ctx)
    ctx.requestRender()
    return true
  }

  private openPivotInput(ctx: ToolContext): void {
    const session: DynamicInputSession = {
      fields: [{ id: "base", label: "Base point", kind: "coordinate" }],
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
      lastPoint: null,
      relativeByDefault: false,
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
      ctx.dynamicInput.close()
      return
    }
    this.state = { phase: "angle", base, originals, copy: false, current: base }
    this.openAngleInput(ctx, "angle", "Rotation angle")
  }

  private openAngleInput(
    ctx: ToolContext,
    fieldId: string,
    label: string
  ): void {
    const session: DynamicInputSession = {
      fields: [{ id: fieldId, label, kind: "angle" }],
      commit: (_values, commitCtx) => this.commitAngle(commitCtx),
      commitRaw: (commitCtx) => this.commitAngle(commitCtx),
    }
    ctx.dynamicInput.open(session)
    ctx.dynamicInput.setLive(fieldId, null)
    ctx.dynamicInput.setPosition(this.lastScreen ?? { x: 0, y: 0 })
  }

  /** Handles the rotation angle confirmed from the dynamic input (Enter). */
  private commitAngle(ctx: ToolContext): boolean {
    if (this.state.phase === "angle") {
      const rotation = this.resolveDirectRotation(
        this.state.base,
        this.state.current,
        ctx
      )
      this.commit(this.state, rotation, ctx)
      return true
    }
    if (this.state.phase === "newAngle") {
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
      fields: [{ id: "reference", label: "Reference angle", kind: "angle" }],
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
    const reference = parseField(ctx, "reference") ?? 0
    this.enterNewAngle(reference, ctx)
    return true
  }

  private openReferenceSecondInput(ctx: ToolContext): void {
    const session: DynamicInputSession = {
      fields: [{ id: "second", label: "Second point", kind: "coordinate" }],
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
    })
    if (!p2) return false
    const reference = bearing(this.state.p1, p2) ?? 0
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
    this.openAngleInput(ctx, "newAngle", "New angle")
  }

  /** Applies the rotation (in place, or as a fresh copy) and ends the command. */
  private commit(
    state: Extract<RotateState, { phase: "angle" | "newAngle" }>,
    rotationDeg: number,
    ctx: ToolContext
  ): void {
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
        lastPoint: null,
        relativeByDefault: false,
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
    return bearing(base, cursor) ?? 0
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
    const newAngle = typed ?? bearing(base, cursor) ?? reference
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

/** Bearing of `from → to` in degrees, CCW from +X, or `null` when coincident. */
function bearing(from: Vec2, to: Vec2): number | null {
  const dir = V.sub(to, from)
  if (V.length(dir) < 1e-9) return null
  return normalizeDegrees((Math.atan2(dir.y, dir.x) * 180) / Math.PI)
}

/** Folds an angle in degrees into the `(-180, 180]` range for near-zero tests. */
function normalizeSigned(deg: number): number {
  let d = deg % 360
  if (d > 180) d -= 360
  if (d <= -180) d += 360
  return d
}
