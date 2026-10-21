import { Vec2, V } from "../../geometry/Vec2"
import { Vec3, sub3 } from "../../geometry/Vec3"
import { Entity, EntityId, translateEntity } from "../../domain/entities"
import { parseNumber } from "../../domain/units"
import { DynamicInputSession } from "../input/DynamicInput"
import {
  isCoordinateExpression,
  parseCoordinate,
} from "../input/coordinateInput"
import { ScenePrimitive } from "../../scene/types"
import { entityScenePrimitive } from "../SceneBuilder"
import { THEME } from "../../scene/theme"
import {
  CommandOption,
  CommandOptionOutcome,
  PointerInput,
  QuestionInput,
  Tool,
  ToolContext,
  ToolQuestion,
} from "./Tool"
import type { PromptId } from "../../locales/types"
import { acuteHeading, headingInUcs } from "./ucsHeading"
import { ObjectSelector } from "./objectSelection"
import { pointAlongCursor, showRise } from "./directDistance"

/**
 * Shared machinery for AutoCAD's displacement-modify commands (MOVE, COPY,
 * STRETCH): select a set of objects, pick a base point, then place the set at
 * one or more destinations defined by a base → second-point displacement.
 *
 * ```
 *   (empty selection)     Enter/Space           click / type       (COPY loops)
 *  selecting ──────────────────────► basePoint ──────────► secondPoint ──► done
 *   click / box-drag adds objects        │          (the set drags as itself)
 *   └── (skipped when objects are        │ Displacement, or Enter
 *        already selected on activation) └──► displacement ──────────────► done
 * ```
 *
 * Works on any selection — lines and circles alike — from an arbitrary base
 * point, with object snap, Ortho/Polar and typed distance/angle/coordinate
 * entry. Subclasses supply what a placement *does* ({@link place}) and whether
 * the command keeps running for more placements ({@link continuesAfterPlace},
 * `true` for COPY's Multiple mode, `false` for MOVE); every other protected
 * method is an optional hook, which its own JSDoc describes.
 */

type PlacementState =
  /** No pre-selection: `Select objects:` builds the set. */
  | { readonly phase: "selecting" }
  /** Objects chosen; awaiting the base point of the displacement. */
  | { readonly phase: "basePoint" }
  /**
   * The base point's Displacement: a point, read as the vector from the UCS
   * origin (in the frame) to it.
   */
  | { readonly phase: "displacement"; readonly origin: Vec3 }
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
  private readonly selector = new ObjectSelector({
    takes: () => this.selectionInput(),
    done: (ctx) => this.confirmSelection(ctx),
    onAdded: (ids, frame) => this.onSelectionAdded(ids, frame),
  })
  private lastScreen: Vec2 | null = null
  /**
   * The placements made from the current base point, each one entry in the
   * history: COPY's Enter is `<Exit>` after one, and its Undo takes back the
   * last.
   */
  private placed = 0
  /**
   * The last Displacement given, the next one's `<default>`: per drawing, not
   * saved (rectang/p315), and each command's own (p314).
   */
  private lastDisplacement: Vec3 = { x: 0, y: 0, z: 0 }

  onNewDrawing(): void {
    this.lastDisplacement = { x: 0, y: 0, z: 0 }
  }

  /**
   * Applies one placement of `originals` displaced by `delta` (undoable), a
   * zero one too: a copy by nothing is a copy (move/p147, p228).
   */
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
   * crossing frame. Used for the drag's preview, so what drags is what commits.
   */
  protected transformEntity(entity: Entity, delta: Vec3): Entity {
    return translateEntity(entity, delta)
  }

  /**
   * Called as objects join the set: `frame` is the outline of the window or
   * crossing polygon that took them, or null (a pick, a fence, Last…).
   * STRETCH uses it to remember which frames were given.
   */
  protected onSelectionAdded(
    ids: readonly EntityId[],
    frame: readonly Vec2[] | null
  ): void {
    void ids
    void frame
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
    this.selector.start()
    if (!this.selector.preselect(ctx)) {
      this.state = { phase: "selecting" }
      this.announceSelection(ctx)
    } else {
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
        return this.selector.question()
      case "basePoint":
        return "specifyBasePointOr"
      case "displacement":
        return { id: "specifyDisplacement", enter: this.lastDisplacement }
      case "secondPoint":
        return this.placed > 0
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
  takes(): QuestionInput | null {
    if (this.state.phase === "selecting") return this.selector.takes()
    // WHY: COPY's first second point is Array's prompt, a keyword prompt with
    // no keyword built here; its refusal is that one, MOVE's a point's
    // (move/p154–p158).
    if (this.firstCopyPoint()) return { refusal: "pointOrKeywordRequired" }
    return null
  }

  /** COPY's second point while nothing is placed from its base. */
  private firstCopyPoint(): boolean {
    return (
      this.state.phase === "secondPoint" &&
      this.placed === 0 &&
      this.continuesAfterPlace()
    )
  }

  /**
   * COPY's points keep LASTPOINT at the base point — `@` at the next copy is
   * from the base again (move/p172, p173) —, where MOVE's second point sets
   * it.
   */
  setsLastPoint(): boolean | null {
    return this.state.phase === "secondPoint" && this.continuesAfterPlace()
      ? false
      : null
  }

  /** What `Select objects:` takes here, as its refusal lists the modes. */
  protected selectionInput(): QuestionInput {
    return "objects"
  }

  commandOptions(): readonly CommandOption[] {
    if (this.state.phase === "selecting") return this.selector.commandOptions()
    if (this.state.phase === "basePoint") return [{ id: "Displacement" }]
    if (this.state.phase === "secondPoint" && this.placed > 0) {
      return [{ id: "Exit" }, { id: "Undo" }]
    }
    return []
  }

  defaultOption(): string | null {
    if (this.state.phase === "basePoint") return "Displacement"
    if (this.state.phase === "secondPoint" && this.placed > 0) {
      return "Exit"
    }
    return null
  }

  invokeOption(id: string, ctx: ToolContext): CommandOptionOutcome {
    if (this.state.phase === "selecting") {
      return this.selector.invokeOption(id, ctx) ? "continue" : "unhandled"
    }
    switch (id) {
      case "Displacement":
        if (this.state.phase !== "basePoint") return "unhandled"
        this.askDisplacement(ctx)
        return "continue"
      case "Exit":
        return this.state.phase === "secondPoint" && this.placed > 0
          ? "end"
          : "unhandled"
      case "Undo":
        return this.undoPlacement(ctx) ? "continue" : "unhandled"
      default:
        return "unhandled"
    }
  }

  /**
   * COPY's Undo: the last copy is taken back, and its prompt asked again;
   * the last of all is said (move/p158, p199).
   */
  private undoPlacement(ctx: ToolContext): boolean {
    if (this.state.phase !== "secondPoint" || this.placed === 0) return false
    this.placed -= 1
    ctx.undo()
    if (this.placed === 0) {
      ctx.report(ctx.text.message("commandCompletelyUndone"))
    }
    ctx.dynamicInput.clearTexts()
    ctx.requestRender()
    return true
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
      case "selecting":
        this.selector.onPointerDown(input, ctx)
        return
      case "basePoint": {
        const base = this.resolveBase(input.point, ctx)
        this.enterSecondPoint(base, ctx, input.screen)
        return
      }
      case "secondPoint": {
        const dest = this.resolveSecond(this.state.base, input.point, ctx)
        this.placeAtPoint(this.state.base, dest, this.state.originals, ctx)
        return
      }
      case "displacement":
        this.displaceBy(sub3(input.point, this.state.origin), ctx)
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
   * The base point at the second point; the UCS origin at the Displacement,
   * where the trace's UseBasePoint is 0,0,0 (move/p135): a number runs from
   * it towards the cursor and `<a` holds a heading from it (p138, p139).
   */
  getConstraintAnchor(): Vec3 | null {
    switch (this.state.phase) {
      case "secondPoint":
        return this.state.base
      case "displacement":
        return this.state.origin
      default:
        return null
    }
  }

  wantsSnap(): boolean {
    // Picking objects (click or box) needs no snap; every point does.
    return this.state.phase === "selecting" ? this.selector.wantsSnap() : true
  }

  /**
   * MOVE's (and STRETCH's) originals fade where they were while the set
   * drags; COPY's keep the selection's glow (desktop move/d01, d11).
   */
  fadedEntityIds(): readonly EntityId[] {
    if (this.state.phase !== "secondPoint" || this.continuesAfterPlace()) {
      return []
    }
    return this.state.originals.map((entity) => entity.id)
  }

  buildOverlay(ctx: ToolContext): ScenePrimitive[] {
    if (this.state.phase === "selecting") return this.selector.buildOverlay(ctx)
    if (this.state.phase !== "secondPoint") return []
    const { viewport } = ctx
    const { base, originals, current } = this.state
    const dest = this.resolveSecond(base, current, ctx)
    const delta = sub3(dest, base)

    // The set drawn as itself at the cursor, solid in each object's colour,
    // and an amber dashed line from the base point (desktop move/d01, d11).
    const out: ScenePrimitive[] = []
    for (const entity of originals) {
      const color = ctx.document.resolveEntityColor(entity)
      out.push(
        ...entityScenePrimitive(
          viewport,
          this.transformEntity(entity, delta),
          { color, width: 1 },
          { blocks: ctx.blocks }
        )
      )
    }
    out.push({
      kind: "segment",
      a: viewport.worldToScreen(base),
      b: viewport.worldToScreen(dest),
      stroke: { color: THEME.dashedRubberBand, width: 1, dash: [2, 3] },
    })
    return out
  }

  /** Goes on from the set `Select objects:` closed to the base point. */
  private confirmSelection(ctx: ToolContext): void {
    this.state = { phase: "basePoint" }
    this.announceBasePoint(ctx)
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
      lastPoint: ctx.lastPoint,
      relativeByDefault: false,
      ucs: ctx.ucs,
      elevation: ctx.elevation,
    })
    if (!base) return false
    this.enterSecondPoint(base, ctx, this.lastScreen ?? undefined)
    return true
  }

  private enterSecondPoint(base: Vec3, ctx: ToolContext, screen?: Vec2): void {
    const originals = selectedInDrawingOrder(ctx)
    if (originals.length === 0) {
      // The selection vanished (e.g. undo elsewhere): fall back to picking.
      this.state = { phase: "selecting" }
      this.selector.start()
      ctx.dynamicInput.close()
      return
    }

    this.state = { phase: "secondPoint", base, originals, current: base }
    this.placed = 0
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
   * relative X,Y,Z displacement"), which ends COPY too, as the Displacement
   * does (move/p151, p159, p234); or `<Exit>` once COPY has placed a copy
   * (p172).
   */
  private commitSecondPoint(ctx: ToolContext): boolean {
    if (this.state.phase !== "secondPoint") return false
    const { base, originals } = this.state
    if (!ctx.dynamicInput.hasTypedText()) {
      if (this.placed === 0) this.place(originals, base, ctx)
      ctx.dynamicInput.close()
      ctx.endCommand()
      return true
    }
    // What reads as no point is refused, never placed at the cursor.
    if (!readsTypedPoint(base, ctx)) return false
    const dest = this.resolveSecond(base, this.state.current, ctx)
    this.placeAtPoint(base, dest, originals, ctx)
    return true
  }

  /**
   * Places at a second point given, which MOVE's makes LASTPOINT however it
   * was given: a number or the tooltip's fields leave the runtime nothing to
   * read once the command has ended (move/p170). Enter's
   * `<use first point as displacement>` keeps it at the base (p150), COPY's
   * points too (p172).
   */
  private placeAtPoint(
    base: Vec3,
    dest: Vec3,
    originals: readonly Entity[],
    ctx: ToolContext
  ): void {
    if (!this.continuesAfterPlace()) ctx.setLastPoint(dest)
    this.placeAt(base, dest, originals, ctx)
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
    this.placed += 1
    this.place(originals, sub3(dest, base), ctx)

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
   * the vector from the UCS origin to it, then the command ends, as COPY's
   * does too. It puts LASTPOINT at that origin as it opens, so `@10,5` is
   * 10,5 and Enter leaves it there (move/p109, p119, p135, p137, p149).
   */
  private askDisplacement(ctx: ToolContext): void {
    const origin = ctx.ucs.origin
    this.state = { phase: "displacement", origin }
    ctx.setLastPoint(origin)
    ctx.dynamicInput.open({
      fields: [{ id: "displacement", kind: "coordinate" }],
      commit: () => {},
      commitRaw: (commitCtx) => this.commitDisplacement(commitCtx),
    })
    if (this.lastScreen) ctx.dynamicInput.setPosition(this.lastScreen)
    ctx.requestRender()
  }

  /** A coordinate typed at the Displacement, or Enter's `<default>`. */
  private commitDisplacement(ctx: ToolContext): boolean {
    if (this.state.phase !== "displacement") return false
    const { origin } = this.state
    const text = ctx.dynamicInput.getText("displacement").trim()
    if (text === "") {
      this.displaceBy(this.lastDisplacement, ctx)
      return true
    }
    if (!isCoordinateExpression(text)) return false
    const point = parseCoordinate(text, {
      lastPoint: origin,
      relativeByDefault: true,
      ucs: ctx.ucs,
      elevation: ctx.elevation,
    })
    if (!point) return false
    this.displaceBy(sub3(point, origin), ctx)
    return true
  }

  /** Places the set once by the Displacement's `delta`, then ends. */
  private displaceBy(delta: Vec3, ctx: ToolContext): void {
    this.lastDisplacement = delta
    this.place(selectedInDrawingOrder(ctx), delta, ctx)
    ctx.dynamicInput.close()
    ctx.endCommand()
  }

  /** Honours a coordinate typed for the base point (always absolute). */
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

/**
 * The set as the drawing orders it, whatever order it was picked in: COPY
 * appends its copies so, and ERASE Last takes the last one's (move/p201,
 * p212, p223).
 */
function selectedInDrawingOrder(ctx: ToolContext): Entity[] {
  const ids = new Set(ctx.selection.toArray())
  return ctx.document.getEntities().filter((entity) => ids.has(entity.id))
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

/** Whether a placement's displacement is none at all. */
export function isZeroDisplacement(delta: Vec3): boolean {
  return delta.x === 0 && delta.y === 0 && delta.z === 0
}
