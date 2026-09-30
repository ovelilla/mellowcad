import { Vec2, V } from "../../geometry/Vec2"
import { Vec3, sub3, withZOf } from "../../geometry/Vec3"
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
import { KeyInput, PointerInput, Tool, ToolContext } from "./Tool"
import { directionFromUcsHeading, headingInUcs } from "./ucsHeading"

/**
 * Shared machinery for AutoCAD's displacement-modify commands (MOVE, COPY):
 * select a set of objects, pick a base point, then place the set at one or more
 * destinations defined by a base → second-point displacement.
 *
 * ```
 *   (empty selection)     Enter/Space           click / type       (COPY loops)
 *  selecting ──────────────────────► basePoint ──────────► secondPoint ──► done
 *   click / box-drag adds objects                (dashed ghost drags the set)
 *   └── (skipped when objects are already selected on activation)
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

  onActivate(ctx: ToolContext): void {
    ctx.setCursor("crosshair")
    // Pre-selected objects (the common path) skip straight to the base point,
    // matching AutoCAD; otherwise prompt to select the objects first.
    if (ctx.selection.isEmpty()) {
      this.state = { phase: "selecting" }
    } else {
      this.state = { phase: "basePoint" }
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
      case "basePoint":
        ctx.dynamicInput.setPosition(input.screen)
        break
      case "secondPoint": {
        this.state = { ...this.state, current: input.point }
        const offset = V.sub(input.point, this.state.base)
        const length = V.length(offset)
        // Feed the live distance and heading; the cursor angle already reflects
        // Ortho/Polar, so typing a length alone still follows the aid.
        ctx.dynamicInput.setLive("distance", length)
        ctx.dynamicInput.setLive(
          "angle",
          length > 1e-9 ? headingInUcs(ctx.ucs, offset) : null
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

  onKeyDown(input: KeyInput, ctx: ToolContext): void {
    // Space confirms the selection set (AutoCAD treats Space like Enter). Enter
    // itself is routed through onEnter by the runtime.
    if (input.key === " ") this.confirmSelection(ctx)
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
    for (const id of ids) {
      if (subtract) ctx.selection.remove(id)
      else ctx.selection.add(id)
    }
    if (!subtract && ids.length > 0) this.onSelectionAdded(ids, box)
  }

  /** Confirms the picked set and advances to the base point; ends if empty. */
  private confirmSelection(ctx: ToolContext): boolean {
    if (this.state.phase !== "selecting") return false
    if (ctx.selection.isEmpty()) return false // nothing selected: let Enter exit
    this.state = { phase: "basePoint" }
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

  /** Places the base point from a typed coordinate (absolute). */
  private commitBaseCoordinate(ctx: ToolContext): boolean {
    if (this.state.phase !== "basePoint") return false
    const text = ctx.dynamicInput.getText("base").trim()
    if (!isCoordinateExpression(text)) return false
    const base = parseCoordinate(text, {
      lastPoint: null,
      relativeByDefault: false,
      ucs: ctx.ucs,
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
   * value places at that displacement; an empty Enter accepts the default,
   * which ends the command — for a continuous command (COPY) that means no
   * further copy, for a single one (MOVE) it places at the live cursor.
   */
  private commitSecondPoint(ctx: ToolContext): boolean {
    if (this.state.phase !== "secondPoint") return false
    const hasTyped =
      ctx.dynamicInput.getText("distance").trim() !== "" ||
      ctx.dynamicInput.getText("angle").trim() !== ""
    if (!hasTyped && this.continuesAfterPlace()) {
      // Empty Enter in Multiple mode (COPY): accept <Exit>.
      ctx.dynamicInput.close()
      ctx.endCommand()
      return true
    }
    const dest = this.resolveSecond(this.state.base, this.state.current, ctx)
    this.placeAt(this.state.base, dest, this.state.originals, ctx)
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
    if (delta.x !== 0 || delta.y !== 0 || delta.z !== 0) {
      this.place(originals, delta, ctx)
    }

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

  /** Honours a coordinate typed for the base point (always absolute). */
  private resolveBase(rawPoint: Vec3, ctx: ToolContext): Vec3 {
    const text = ctx.dynamicInput.getText("base").trim()
    if (isCoordinateExpression(text)) {
      const point = parseCoordinate(text, {
        lastPoint: null,
        relativeByDefault: false,
        ucs: ctx.ucs,
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
      })
      return point ?? rawCursor
    }

    const typedDist = parseField(ctx, "distance")
    const typedAngle = parseField(ctx, "angle")
    if (typedDist === null && typedAngle === null) return rawCursor

    const offset = V.sub(rawCursor, base)
    const cursorDist = V.length(offset)
    const cursorAngle = cursorDist > 1e-9 ? headingInUcs(ctx.ucs, offset) : null

    const distance = typedDist ?? cursorDist
    const angle = typedAngle ?? cursorAngle
    // No heading yet (cursor on the base and nothing typed): no displacement.
    if (angle === null) return rawCursor

    return withZOf(
      V.add(base, V.scale(directionFromUcsHeading(ctx.ucs, angle), distance)),
      base
    )
  }
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
