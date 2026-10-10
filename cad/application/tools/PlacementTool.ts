import { Vec2, V } from "../../geometry/Vec2"
import { Vec3, add3, sub3 } from "../../geometry/Vec3"
import { Entity, EntityId, translateEntity } from "../../domain/entities"
import { parseNumber } from "../../domain/units"
import { DynamicInputSession } from "../input/DynamicInput"
import {
  isCoordinateExpression,
  parseCoordinate,
} from "../input/coordinateInput"
import { ScenePrimitive, StrokeStyle } from "../../scene/types"
import { entityScenePrimitive } from "../SceneBuilder"
import { THEME } from "../../scene/theme"
import { boxSelect, buildSelectionBoxOverlay } from "./boxSelection"
import {
  CommandOption,
  CommandOptionOutcome,
  PointerInput,
  Tool,
  ToolContext,
  ToolQuestion,
} from "./Tool"
import type { PromptId } from "../../locales/types"
import { acuteHeading, headingInUcs } from "./ucsHeading"
import { countPreselection, pickObjects } from "./objectSelection"
import { pointAlongCursor, showRise } from "./directDistance"

/**
 * Shared machinery for AutoCAD's displacement-modify commands (MOVE, COPY):
 * select a set of objects, pick a base point, then place the set at one or more
 * destinations defined by a base → second-point displacement.
 *
 * ```
 *   (empty selection)     Enter/Space           click / type       (COPY loops)
 *  selecting ──────────────────────► basePoint ──────────► secondPoint ──► done
 *   click / box-drag adds objects        │       (dashed ghost drags the set)
 *   └── (skipped when objects are        │ Displacement, or Enter
 *        already selected on activation) └──► displacement ──────────────► done
 * ```
 *
 * Works on any selection — lines and circles alike — from an arbitrary base
 * point, with object snap, Ortho/Polar and typed distance/angle/coordinate
 * entry. Subclasses supply what a placement *does* ({@link place}) and whether
 * the command keeps running for more placements ({@link continuesAfterPlace},
 * `true` for COPY's Multiple mode, `false` for MOVE).
 */

/** Screen-pixel movement past which a press-drag becomes a box selection. */
const DRAG_THRESHOLD_PX = 4

type PlacementState =
  /** No pre-selection: build the set by clicking or box-dragging. */
  | { readonly phase: "selecting" }
  /** Mouse down while selecting: still a click until it drags far enough. */
  | {
      readonly phase: "pressed"
      readonly startWorld: Vec2
      readonly startScreen: Vec2
      readonly currentWorld: Vec2
      /** Shift held at press removes the box result instead of adding it. */
      readonly subtract: boolean
    }
  /** Dragging a selection box (window left→right / crossing right→left). */
  | {
      readonly phase: "boxing"
      readonly startWorld: Vec2
      readonly currentWorld: Vec2
      readonly subtract: boolean
    }
  /** Objects chosen; awaiting the base point of the displacement. */
  | { readonly phase: "basePoint" }
  /** The base point's Displacement: the displacement typed as a point. */
  | { readonly phase: "displacement" }
  /** Base placed; the set drags to the second point (cursor-driven). */
  | {
      readonly phase: "secondPoint"
      readonly base: Vec3
      /** Snapshot of the objects being placed, taken when the base was set. */
      readonly originals: readonly Entity[]
      /** Live resolved cursor point (snap/Ortho applied, before hard-locks). */
      readonly current: Vec3
    }

export abstract class PlacementTool implements Tool {
  abstract readonly id: string

  private state: PlacementState = { phase: "selecting" }
  private lastScreen: Vec2 | null = null
  /**
   * Whether each placement from the current base point added objects (one at
   * the same point adds none): COPY's Enter is `<Exit>` after one, and its
   * Undo takes back the last.
   */
  private placements: boolean[] = []
  /** The last Displacement given, the next one's `<default>`, for the session. */
  private lastDisplacement: Vec3 = { x: 0, y: 0, z: 0 }

  /** Applies one placement of `originals` displaced by `delta` (undoable). */
  protected abstract place(
    originals: readonly Entity[],
    delta: Vec3,
    ctx: ToolContext
  ): void

  /**
   * Whether the command keeps prompting for more destinations after a
   * placement (AutoCAD COPY's default Multiple mode) or ends after one (MOVE).
   */
  protected abstract continuesAfterPlace(): boolean

  /**
   * How one object follows the displacement. Whole-object translation by
   * default; STRETCH overrides it to move only the points caught by its
   * crossing frame. Used for the dashed preview, so what drags is what commits.
   */
  protected transformEntity(entity: Entity, delta: Vec3): Entity {
    return translateEntity(entity, delta)
  }

  /**
   * Called as objects join the set: `box` is the drag that picked them, or null
   * for a single click. STRETCH uses it to remember which frames were dragged.
   */
  protected onSelectionAdded(
    ids: readonly EntityId[],
    box: { readonly start: Vec2; readonly current: Vec2 } | null
  ): void {
    void ids
    void box
  }

  /**
   * Called as the base point is asked, after the objects: what the command
   * reports there (COPY's `Current settings`).
   */
  protected announceBasePoint(ctx: ToolContext): void {
    void ctx
  }

  /**
   * Called as the objects are asked for with nothing selected: what the
   * command reports first (STRETCH's crossing-window note).
   */
  protected announceSelection(ctx: ToolContext): void {
    void ctx
  }

  onActivate(ctx: ToolContext): void {
    ctx.setCursor("crosshair")
    // Pre-selected objects (the common path) skip straight to the base point,
    // matching AutoCAD, which counts them first; otherwise prompt to select
    // the objects first.
    if (ctx.selection.isEmpty()) {
      this.state = { phase: "selecting" }
      this.announceSelection(ctx)
    } else {
      countPreselection(ctx)
      this.state = { phase: "basePoint" }
      this.announceBasePoint(ctx)
      this.openBaseInput(ctx)
    }
  }

  /** The second point's question, which COPY words apart in Spanish. */
  protected secondPointQuestion(): PromptId {
    return "specifySecondPointOr"
  }

  question(): PromptId | ToolQuestion {
    switch (this.state.phase) {
      case "selecting":
      case "pressed":
      case "boxing":
        return "selectObjects"
      case "basePoint":
        return "specifyBasePointOr"
      case "displacement":
        return { id: "specifyDisplacement", enter: this.lastDisplacement }
      case "secondPoint":
        return this.placements.length > 0
          ? this.secondPointQuestion()
          : {
              id: this.secondPointQuestion(),
              enter: "useFirstPointAsDisplacement",
            }
    }
  }

  /**
   * `[Displacement] <Displacement>` at the base point, and COPY's
   * `[Exit/Undo] <Exit>` once a copy is placed. COPY's mOde and Array are
   * not offered.
   */
  commandOptions(): readonly CommandOption[] {
    if (this.state.phase === "basePoint") return [{ id: "Displacement" }]
    if (this.state.phase === "secondPoint" && this.placements.length > 0) {
      return [{ id: "Exit" }, { id: "Undo" }]
    }
    return []
  }

  defaultOption(): string | null {
    if (this.state.phase === "basePoint") return "Displacement"
    if (this.state.phase === "secondPoint" && this.placements.length > 0) {
      return "Exit"
    }
    return null
  }

  invokeOption(id: string, ctx: ToolContext): CommandOptionOutcome {
    switch (id) {
      case "Displacement":
        if (this.state.phase !== "basePoint") return "unhandled"
        this.askDisplacement(ctx)
        return "continue"
      case "Exit":
        return this.state.phase === "secondPoint" && this.placements.length > 0
          ? "end"
          : "unhandled"
      case "Undo":
        return this.undoPlacement(ctx) ? "continue" : "unhandled"
      default:
        return "unhandled"
    }
  }

  /** COPY's Undo: the last copy is taken back, and its prompt asked again. */
  private undoPlacement(ctx: ToolContext): boolean {
    if (this.state.phase !== "secondPoint" || this.placements.length === 0) {
      return false
    }
    const added = this.placements.pop()
    if (added) ctx.undo()
    ctx.dynamicInput.clearTexts()
    ctx.requestRender()
    return true
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
      case "basePoint":
        ctx.dynamicInput.setPosition(input.screen)
        break
      case "secondPoint": {
        this.state = { ...this.state, current: input.point }
        const offset = V.sub(input.point, this.state.base)
        const length = V.length(offset)
        // Feed the live distance and heading; the cursor angle already reflects
        // Ortho/Polar, so typing a length alone still follows the aid.
        if (!showRise(ctx, this.state.base, input.point)) {
          ctx.dynamicInput.setLive("distance", length)
          ctx.dynamicInput.setLive(
            "angle",
            length > 1e-9 ? acuteHeading(headingInUcs(ctx.ucs, offset)) : null
          )
        }
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
        // Begin a pick or a box drag; which one is decided on release.
        this.state = {
          phase: "pressed",
          startWorld: input.world,
          startScreen: input.screen,
          currentWorld: input.world,
          subtract: input.shiftKey,
        }
        return
      }
      case "basePoint": {
        const base = this.resolveBase(input.point, ctx)
        this.enterSecondPoint(base, ctx, input.screen)
        return
      }
      case "secondPoint": {
        const dest = this.resolveSecond(this.state.base, input.point, ctx)
        this.placeAt(this.state.base, dest, this.state.originals, ctx)
        return
      }
    }
  }

  onPointerUp(input: PointerInput, ctx: ToolContext): void {
    if (input.button !== 0) return

    // AutoCAD's "Select objects" prompt, additive across picks and boxes: a
    // plain click picks the object under the cursor, a drag runs a window/
    // crossing box; shift removes instead of adds. Selected objects render
    // highlighted, so the set is always visible.
    if (this.state.phase === "pressed") {
      const hit = ctx.pick(input.world)
      if (hit) this.applyPick([hit.id], this.state.subtract, ctx, null)
      // WHY nothing written for a miss: AutoCAD starts a window there
      // ("Specify opposite corner:"), which a click cannot finish here.
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
      this.applyPick(hits, this.state.subtract, ctx, {
        start: this.state.startWorld,
        current: this.state.currentWorld,
      })
      this.state = { phase: "selecting" }
      ctx.requestRender()
    }
  }

  onEnter(ctx: ToolContext): boolean {
    return this.confirmSelection(ctx)
  }

  getConstraintAnchor(): Vec2 | null {
    // Ortho/Polar lock the displacement relative to the base point.
    return this.state.phase === "secondPoint" ? this.state.base : null
  }

  wantsSnap(): boolean {
    // Object snaps help place the base and second points precisely; picking
    // objects (click or box) does not need them.
    return (
      this.state.phase === "basePoint" || this.state.phase === "secondPoint"
    )
  }

  buildOverlay(ctx: ToolContext): ScenePrimitive[] {
    if (this.state.phase === "boxing") {
      return buildSelectionBoxOverlay(
        ctx.viewport,
        this.state.startWorld,
        this.state.currentWorld
      )
    }
    if (this.state.phase !== "secondPoint") return []
    const { viewport } = ctx
    const { base, originals, current } = this.state
    const dest = this.resolveSecond(base, current, ctx)
    const delta = sub3(dest, base)

    const ghost: StrokeStyle = { color: THEME.preview, width: 1, dash: [6, 4] }
    const out: ScenePrimitive[] = []
    for (const entity of originals) {
      out.push(
        ...entityScenePrimitive(
          viewport,
          this.transformEntity(entity, delta),
          ghost,
          { blocks: ctx.blocks }
        )
      )
    }
    // The displacement vector from base to destination.
    out.push({
      kind: "segment",
      a: viewport.worldToScreen(base),
      b: viewport.worldToScreen(dest),
      stroke: { color: THEME.preview, width: 1, dash: [2, 3] },
    })
    return out
  }

  /** Adds (or, with shift held, removes) picked ids while building the set. */
  private applyPick(
    ids: readonly EntityId[],
    subtract: boolean,
    ctx: ToolContext,
    box: { readonly start: Vec2; readonly current: Vec2 } | null
  ): void {
    pickObjects(ids, subtract, box !== null, ctx)
    if (!subtract && ids.length > 0) this.onSelectionAdded(ids, box)
  }

  /** Confirms the picked set and advances to the base point; ends if empty. */
  private confirmSelection(ctx: ToolContext): boolean {
    if (this.state.phase !== "selecting") return false
    if (ctx.selection.isEmpty()) return false // nothing selected: let Enter exit
    this.state = { phase: "basePoint" }
    this.announceBasePoint(ctx)
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

  /**
   * Places the base point from a typed coordinate (absolute); Enter takes the
   * `<Displacement>` default.
   */
  private commitBaseCoordinate(ctx: ToolContext): boolean {
    if (this.state.phase !== "basePoint") return false
    const text = ctx.dynamicInput.getText("base").trim()
    if (text === "") {
      this.askDisplacement(ctx)
      return true
    }
    if (!isCoordinateExpression(text)) return false
    const base = parseCoordinate(text, {
      lastPoint: null,
      relativeByDefault: false,
      ucs: ctx.ucs,
      elevation: ctx.elevation,
    })
    if (!base) return false
    this.enterSecondPoint(base, ctx, this.lastScreen ?? undefined)
    return true
  }

  private enterSecondPoint(base: Vec3, ctx: ToolContext, screen?: Vec2): void {
    const originals = ctx.selection
      .toArray()
      .map((id) => ctx.document.get(id))
      .filter((entity): entity is Entity => entity !== undefined)
    if (originals.length === 0) {
      // The selection vanished (e.g. undo elsewhere): fall back to picking.
      this.state = { phase: "selecting" }
      ctx.dynamicInput.close()
      return
    }

    this.state = { phase: "secondPoint", base, originals, current: base }
    this.placements = []
    this.openSecondPointInput(ctx, screen ?? this.lastScreen ?? base)
  }

  private openSecondPointInput(ctx: ToolContext, screen: Vec2): void {
    const session: DynamicInputSession = {
      fields: [
        { id: "distance", prompt: "distance", kind: "distance" },
        { id: "angle", prompt: "angle", kind: "angle" },
      ],
      commit: (_values, commitCtx) => {
        this.commitSecondPoint(commitCtx)
      },
      commitRaw: (commitCtx) => this.commitSecondPoint(commitCtx),
    }
    ctx.dynamicInput.open(session)
    ctx.dynamicInput.setLive("distance", 0)
    ctx.dynamicInput.setLive("angle", null)
    ctx.dynamicInput.setPosition(screen)
  }

  /**
   * Handles a second point confirmed from the dynamic input (Enter). A typed
   * value places at that displacement; an empty Enter accepts the default:
   * `<use first point as displacement>` ("the first point is interpreted as a
   * relative X,Y,Z displacement"), or `<Exit>` once COPY has placed a copy.
   */
  private commitSecondPoint(ctx: ToolContext): boolean {
    if (this.state.phase !== "secondPoint") return false
    const { base, originals } = this.state
    if (!ctx.dynamicInput.hasTypedText()) {
      if (this.placements.length > 0) {
        ctx.dynamicInput.close()
        ctx.endCommand()
        return true
      }
      this.placeAt(base, add3(base, base), originals, ctx)
      return true
    }
    // What reads as no point is refused, never placed at the cursor.
    if (!readsTypedPoint(base, ctx)) return false
    const dest = this.resolveSecond(base, this.state.current, ctx)
    this.placeAt(base, dest, originals, ctx)
    return true
  }

  /**
   * Places the set at `dest`, then either keeps prompting for the next
   * destination (Multiple mode) or ends the command.
   */
  private placeAt(
    base: Vec3,
    dest: Vec3,
    originals: readonly Entity[],
    ctx: ToolContext
  ): void {
    const delta = sub3(dest, base)
    const moves = delta.x !== 0 || delta.y !== 0 || delta.z !== 0
    this.placements.push(moves)
    if (moves) this.place(originals, delta, ctx)

    if (this.continuesAfterPlace()) {
      // Keep the base and selection; reset the typed values for the next copy,
      // all measured from the same base point (AutoCAD COPY Multiple).
      ctx.dynamicInput.clearTexts()
      ctx.dynamicInput.setLive("distance", 0)
      ctx.dynamicInput.setLive("angle", null)
      ctx.requestRender()
    } else {
      ctx.dynamicInput.close()
      ctx.endCommand()
    }
  }

  /**
   * The base point's Displacement: "Specify displacement", a point read as
   * the vector the objects go by, then the command ends, as COPY's does too.
   */
  private askDisplacement(ctx: ToolContext): void {
    this.state = { phase: "displacement" }
    ctx.dynamicInput.open({
      fields: [{ id: "displacement", kind: "coordinate" }],
      commit: () => {},
      commitRaw: (commitCtx) => this.commitDisplacement(commitCtx),
    })
    if (this.lastScreen) ctx.dynamicInput.setPosition(this.lastScreen)
    ctx.requestRender()
  }

  private commitDisplacement(ctx: ToolContext): boolean {
    if (this.state.phase !== "displacement") return false
    const text = ctx.dynamicInput.getText("displacement").trim()
    let delta = this.lastDisplacement
    if (text !== "") {
      if (!isCoordinateExpression(text)) return false
      const read = (typed: string) =>
        parseCoordinate(typed, {
          lastPoint: null,
          relativeByDefault: false,
          ucs: ctx.ucs,
          elevation: ctx.elevation,
        })
      // A vector, not a place: what the point is from the origin, in the UCS.
      const point = read(text.replace(/^[@#]/, ""))
      const origin = read("0,0")
      if (!point || !origin) return false
      delta = sub3(point, origin)
    }
    this.lastDisplacement = delta
    const originals = ctx.selection
      .toArray()
      .map((entityId) => ctx.document.get(entityId))
      .filter((entity): entity is Entity => entity !== undefined)
    if (delta.x !== 0 || delta.y !== 0 || delta.z !== 0) {
      this.place(originals, delta, ctx)
    }
    ctx.dynamicInput.close()
    ctx.endCommand()
    return true
  }

  /** Honours a coordinate typed for the base point (always absolute). */
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
   * Computes the effective destination, honouring hard-locked typed input: a
   * coordinate (relative to the base by default) places the point directly; a
   * typed distance and/or angle override the cursor for that component (a typed
   * length follows the cursor heading, a typed angle locks the direction).
   * Otherwise the cursor drives it.
   */
  private resolveSecond(base: Vec3, rawCursor: Vec3, ctx: ToolContext): Vec3 {
    const coordText = ctx.dynamicInput.getText("distance").trim()
    if (isCoordinateExpression(coordText)) {
      const point = parseCoordinate(coordText, {
        lastPoint: base,
        relativeByDefault: true,
        ucs: ctx.ucs,
        elevation: ctx.elevation,
      })
      return point ?? rawCursor
    }

    const typedDist = parseField(ctx, "distance")
    const typedAngle = parseField(ctx, "angle")
    if (typedDist === null && typedAngle === null) return rawCursor

    // No heading yet (cursor on the base and nothing typed): no displacement.
    return (
      pointAlongCursor(ctx, base, rawCursor, {
        distance: typedDist,
        angle: typedAngle,
      }) ?? rawCursor
    )
  }
}

/** Whether the second point's typed text reads as one: a coordinate, a length, an angle. */
function readsTypedPoint(base: Vec3, ctx: ToolContext): boolean {
  const coordText = ctx.dynamicInput.getText("distance").trim()
  if (isCoordinateExpression(coordText)) {
    return (
      parseCoordinate(coordText, {
        lastPoint: base,
        relativeByDefault: true,
        ucs: ctx.ucs,
        elevation: ctx.elevation,
      }) !== null
    )
  }
  return ["distance", "angle"].every(
    (id) =>
      ctx.dynamicInput.getText(id).trim() === "" || parseField(ctx, id) !== null
  )
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
