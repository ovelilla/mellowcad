import { Vec2, V } from "../../geometry/Vec2"
import { Vec3, WORLD_Z, dot3, planar, withZ, zOf } from "../../geometry/Vec3"
import { arbitraryAxis, worldToAxes } from "../../geometry/ocs"
import {
  angleWithinSweep,
  closestPointOnInfiniteLine,
  offsetSegment,
} from "../../geometry/primitives"
import {
  createArc,
  createCircle,
  createLine,
  carryOverrides,
  createPolyline,
  entityElevation,
  entityNormal,
  withNormal,
  withThickness,
  Entity,
  PolylineWidth,
} from "../../domain/entities"
import {
  offsetPolyline,
  polylineThroughDistance,
  type OffsetPolylineShape,
} from "../../domain/polylineOffset"
import {
  AddEntitiesCommand,
  RemoveEntitiesCommand,
  ReplaceEntitiesCommand,
} from "../commands/entityCommands"
import { DynamicInputSession } from "../input/DynamicInput"
import {
  isCoordinateExpression,
  parseCoordinate,
} from "../input/coordinateInput"
import type { MessageId } from "../EngineText"
import type { Viewport } from "../Viewport"
import type { PromptId } from "../../locales/types"
import { ScenePrimitive, StrokeStyle } from "../../scene/types"
import { drawnColor, THEME } from "../../scene/theme"
import { arcScenePrimitive, entityScenePrimitive } from "../SceneBuilder"
import {
  CommandOption,
  CommandOptionOutcome,
  type HeldVariables,
  PointerInput,
  Tool,
  ToolContext,
  ToolQuestion,
  type QuestionInput,
} from "./Tool"
import { lockedObjectAt } from "./lockedPick"
import { typedPick } from "./typedPick"

/**
 * The offset tool creates equidistant parallel copies — AutoCAD's OFFSET,
 * modelled as an explicit state machine:
 *
 * ```
 *            [E] / [L] sub-prompt, then back
 *          ┌──────────────┐
 *          ▼              │      click object          click side
 *  distance ──type / two clicks──► select ───────────────► side ──────────┐
 *     │                              ▲   ([M] keeps stepping out: Multiple) │
 *     │                              └──────────────────────────────────────┘
 *     └──[T] / Enter at <Through>──► select ──► through point ──► select …
 * ```
 *
 * In *distance* mode you set a distance (typed or as a two-point span) and then
 * repeatedly pick an object and the side to offset towards. In *through* mode
 * (AutoCAD's Through option) you pick an object and then a point the copy must
 * pass through — the distance is whatever makes the copy land on that point.
 * One object selected before the command is the first one, its side or
 * through point asked as soon as the distance is set. Both loop until Exit
 * (Enter) or Escape; Undo takes back the last copy and asks for the object.
 *
 * Lines offset to a parallel line; circles and arcs to a concentric one;
 * polylines as `offsetPolyline` makes them, perhaps several. Erase and Layer
 * are AutoCAD's own sub-prompts at the distance prompt, reported in `Current
 * settings:` when the command starts; Multiple belongs to the side prompt and
 * keeps stepping copies out from the same object. Nothing is mutated
 * directly: each point's copies are one {@link AddEntitiesCommand} (or a
 * {@link ReplaceEntitiesCommand} when Erase replaces the source), so every
 * step is individually undoable.
 */

/** A resolved offset copy (no id/layer yet), used for preview and commit. */
type OffsetGeom =
  | { readonly kind: "line"; readonly a: Vec2; readonly b: Vec2 }
  | { readonly kind: "circle"; readonly center: Vec2; readonly radius: number }
  | {
      readonly kind: "arc"
      readonly center: Vec2
      readonly radius: number
      readonly startAngle: number
      readonly endAngle: number
    }
  | {
      readonly kind: "polyline"
      readonly vertices: readonly Vec2[]
      readonly closed: boolean
      readonly bulges?: readonly number[]
      readonly widths?: readonly PolylineWidth[]
    }

type OffsetToolState =
  /**
   * Awaiting the offset distance: a typed value, or two points the runtime
   * measures.
   */
  | { readonly phase: "distance" }
  /** The Erase or Layer sub-prompt of the distance prompt. */
  | { readonly phase: "erase" }
  | { readonly phase: "layer" }
  /**
   * Awaiting the object to offset (hover-highlighted); `distance` is null in
   * Through mode.
   */
  | {
      readonly phase: "select"
      readonly distance: number | null
      /** The object under the cursor, drawn highlighted as a preview. */
      readonly hover: Entity | null
    }
  /** Object chosen; awaiting the side to offset towards (cursor drives it). */
  | {
      readonly phase: "side"
      readonly distance: number
      /**
       * The object being offset: in Multiple the last copy, the first piece
       * of a polyline that fell apart (unprobed).
       */
      readonly source: Entity
      /** The originally-picked object (the one Erase removes). */
      readonly original: Entity
      /** Copies made in Multiple, whose original Erase removes on leaving it. */
      readonly erasePending: boolean
      readonly multiple: boolean
      readonly cursor: Vec3
    }
  /** Through mode: object chosen; awaiting the point the copy passes through. */
  | {
      readonly phase: "throughPoint"
      readonly source: Entity
      /** Copies made in Multiple, whose source Erase removes on leaving it. */
      readonly erasePending: boolean
      readonly multiple: boolean
      readonly cursor: Vec3
    }

export class OffsetTool implements Tool {
  readonly id = "offset"
  readonly shortcut = "o"

  private state: OffsetToolState = { phase: "distance" }
  /** Last known screen position, used to place dynamic input on open. */
  private lastScreen: Vec2 | null = null
  /**
   * Where the history stood before each copy step since the command started,
   * for Undo to take back the last (with the erase that left its object).
   */
  private marks: number[] = []
  /**
   * The one object selected before the command, offset once the distance is
   * set (probes offset/p165, p251, p290).
   */
  private preselected: Entity | null = null

  /**
   * Erase source and Layer, which the next OFFSET reports in its `Current
   * settings:` as it was left: program-wide, so for the session here, NEW and
   * OPEN leaving them (rectang/p310).
   */
  private erase = false
  private offsetLayer: "source" | "current" = "source"
  /**
   * AutoCAD's OFFSETDIST, the distance prompt's `<default>`: the last distance,
   * or Through while negative; -1 in each drawing opened, not saved
   * (rectang/p310).
   */
  private offsetDist = -1

  onNewDrawing(): void {
    this.offsetDist = -1
  }

  heldVariables(): Partial<HeldVariables> {
    return {
      OFFSETDIST: {
        read: () => this.offsetDist,
        write: (distance) => {
          this.offsetDist = distance
        },
      },
    }
  }

  onActivate(ctx: ToolContext): void {
    ctx.setCursor("crosshair")
    this.preselected = this.preselectedSource(ctx)
    // Cleared at once, one object or several (probes offset/p165, p167).
    ctx.selection.clear()
    this.marks = []
    // OFFSETGAPTYPE is always 0 here: corners are extended to meet.
    ctx.report(
      ctx.text.message("offsetSettings", {
        erase: this.erase ? "yes" : "no",
        layer: this.offsetLayer,
      })
    )
    this.state = { phase: "distance" }
    this.openDistanceInput(ctx)
  }

  onDeactivate(ctx: ToolContext): void {
    this.state = { phase: "distance" }
    this.marks = []
    this.preselected = null
    ctx.dynamicInput.close()
  }

  question(): PromptId | ToolQuestion {
    switch (this.state.phase) {
      case "distance":
        return this.offsetDist < 0
          ? "specifyOffsetDistanceOr"
          : { id: "specifyOffsetDistanceOr", enter: this.offsetDist }
      case "erase":
        return "eraseSourceObjectAfterOffsetting"
      case "layer":
        return "enterLayerOptionForOffsetObjects"
      case "select":
        return "selectObjectToOffsetOr"
      case "side":
        return this.state.multiple
          ? { id: "specifyPointOnSideToOffsetOr", enter: "nextObject" }
          : "specifyPointOnSideToOffsetOr"
      case "throughPoint":
        return this.state.multiple
          ? { id: "specifyThroughPointOr", enter: "nextObject" }
          : "specifyThroughPointOr"
    }
  }

  /**
   * One object picked, whose refusal names Exit alone, as AutoCAD's does
   * (`Expects a point or Exit`, probe offset/p245); the side and through
   * points are their boxes' coordinates.
   */
  takes(): QuestionInput | null {
    return this.state.phase === "select"
      ? {
          refusal: ["invalidSelection", "expectsPointOr"],
          keywords: { ids: ["Exit"] },
        }
      : null
  }

  defaultOption(): string | null {
    switch (this.state.phase) {
      case "distance":
        return this.offsetDist < 0 ? "Through" : null
      case "erase":
        return this.erase ? "Yes" : "No"
      case "layer":
        return this.offsetLayer === "current" ? "Current" : "Source"
      case "select":
        return "Exit"
      case "side":
      case "throughPoint":
        return this.state.multiple ? null : "Exit"
    }
  }

  onPointerMove(input: PointerInput, ctx: ToolContext): void {
    this.lastScreen = input.screen
    ctx.dynamicInput.setPosition(input.screen)

    switch (this.state.phase) {
      case "side":
        this.state = { ...this.state, cursor: input.point }
        break
      case "select":
        // Preview which object a click would offset (AutoCAD rollover highlight).
        this.state = { ...this.state, hover: this.pickSource(input, ctx) }
        break
      case "throughPoint":
        this.state = { ...this.state, cursor: input.point }
        break
      case "erase":
      case "layer":
        break
    }

    ctx.requestRender()
  }

  onPointerDown(input: PointerInput, ctx: ToolContext): void {
    if (input.button !== 0) return

    switch (this.state.phase) {
      case "select":
        this.pickObject(input, ctx)
        return
      case "side":
      case "throughPoint":
        this.placePoint(input.point, ctx)
        return
      case "erase":
      case "layer":
        return
    }
  }

  /**
   * A point typed at `Select object to offset` picks there, as a click
   * does, a number its direct distance (probes offset/p240, p241, p297,
   * p298); the selection modes stay refused (p245).
   */
  answerTyped(text: string, ctx: ToolContext): boolean {
    if (this.state.phase !== "select") return false
    const point = typedPick(text, ctx)
    if (!point) return false
    this.pickObject(
      {
        screen: ctx.viewport.worldToScreen(point),
        world: point,
        point,
        snap: null,
        tracking: null,
        button: 0,
        shiftKey: false,
        ctrlKey: false,
        altKey: false,
      },
      ctx
    )
    return true
  }

  /**
   * Enter keeps the sub-prompt's setting, and in Multiple mode goes on to the
   * `<next object>`; anywhere else it is Exit, which ends the command.
   */
  onEnter(ctx: ToolContext): boolean {
    switch (this.state.phase) {
      case "erase":
      case "layer":
        this.backToDistance(ctx)
        return true
      case "side":
      case "throughPoint":
        if (!this.state.multiple) return false
        this.selectNext(ctx)
        return true
      case "distance":
      case "select":
        return false
    }
  }

  commandOptions(): readonly CommandOption[] {
    switch (this.state.phase) {
      case "distance":
        // `Thru` is AutoCAD's unlisted second word for Through.
        return [
          { id: "Through" },
          { id: "Erase" },
          { id: "Layer" },
          { id: "Thru", hidden: true },
        ]
      case "erase":
        return [{ id: "Yes" }, { id: "No" }]
      case "layer":
        return [{ id: "Current" }, { id: "Source" }]
      case "select":
        return [{ id: "Exit" }, { id: "Undo" }]
      case "side":
      case "throughPoint":
        // Multiple again in Multiple is taken in silence: its initget still
        // declares it (probes offset/p131, p137).
        return this.state.multiple
          ? [{ id: "Exit" }, { id: "Undo" }, { id: "Multiple", hidden: true }]
          : [{ id: "Exit" }, { id: "Multiple" }, { id: "Undo" }]
    }
  }

  invokeOption(id: string, ctx: ToolContext): CommandOptionOutcome {
    const phase = this.state.phase
    if (phase === "distance") {
      if (id === "Through" || id === "Thru") {
        this.enterThrough(ctx)
        return "continue"
      }
      if (id === "Erase" || id === "Layer") {
        this.state = { phase: id === "Erase" ? "erase" : "layer" }
        this.openKeywordPrompt(ctx)
        return "continue"
      }
    }
    if (phase === "erase" && (id === "Yes" || id === "No")) {
      this.erase = id === "Yes"
      this.backToDistance(ctx)
      return "continue"
    }
    if (phase === "layer" && (id === "Current" || id === "Source")) {
      this.offsetLayer = id === "Current" ? "current" : "source"
      this.backToDistance(ctx)
      return "continue"
    }
    if (phase === "select" || phase === "side" || phase === "throughPoint") {
      if (id === "Exit") {
        this.eraseLeftObject(this.state, ctx)
        return "end"
      }
      if (id === "Undo") {
        this.undoStep(ctx)
        return "continue"
      }
    }
    if ((phase === "side" || phase === "throughPoint") && id === "Multiple") {
      this.state = { ...this.state, multiple: true }
      ctx.requestRender()
      return "continue"
    }
    return "unhandled"
  }

  wantsSnap(): boolean {
    // The distance's two points are the runtime's to measure.
    return this.state.phase === "side" || this.state.phase === "throughPoint"
  }

  /**
   * Perpendicular and Tangent at the side and through points measure from
   * the object's pick, LASTPOINT (probes offset/p263, p285).
   */
  snapsFromLastPoint(): boolean {
    return this.wantsSnap()
  }

  buildOverlay(ctx: ToolContext): ScenePrimitive[] {
    const { viewport } = ctx
    const draw = (
      geom: OffsetGeom,
      color: string,
      width: number
    ): ScenePrimitive[] => {
      const stroke: StrokeStyle = { color, width }
      switch (geom.kind) {
        case "line":
          return [
            {
              kind: "segment",
              a: viewport.worldToScreen(geom.a),
              b: viewport.worldToScreen(geom.b),
              stroke,
            },
          ]
        case "circle":
          return [
            {
              kind: "circle",
              center: viewport.worldToScreen(geom.center),
              radius: viewport.worldToScreenDistance(geom.radius),
              stroke,
            },
          ]
        case "arc":
          return [
            arcScenePrimitive(
              viewport,
              geom.center,
              geom.radius,
              geom.startAngle,
              geom.endAngle,
              stroke
            ),
          ]
        case "polyline":
          return entityScenePrimitive(
            viewport,
            offsetToEntity(geom, "0", OFFSET_PREVIEW_ID),
            stroke
          )
      }
    }
    // Highlights an entity's outline, or nothing for one OFFSET refuses; one
    // off the plan through its own plane.
    const highlight = (
      entity: Entity,
      color: string,
      width: number
    ): ScenePrimitive[] => {
      if (offsetKind(entity) !== "offsets") return []
      if (isOffPlan(entity, viewport)) {
        return entityScenePrimitive(viewport, entity, { color, width })
      }
      const geom = entityAsGeom(entity)
      return geom ? draw(geom, color, width) : []
    }

    if (this.state.phase === "select") {
      // Highlight the object a click would offset, so selection is never a
      // guess — AutoCAD's selection-preview rollover.
      return this.state.hover
        ? highlight(this.state.hover, THEME.entityHover, 2)
        : []
    }

    if (this.state.phase === "side" || this.state.phase === "throughPoint") {
      const { source, cursor } = this.state
      // The picked source selected, and the copies the point would make drawn
      // as themselves, solid in the source's colour, as a transform drags its
      // set (desktop offset/d01-5, d02, d03; move/d01).
      const prims = highlight(source, THEME.selected, 2)
      const offset = this.resolve(this.state, cursor, ctx)
      if (!isRefusal(offset)) {
        const stroke = {
          color: drawnColor(ctx.document.resolveEntityColor(source)),
          width: 1,
        }
        for (const copy of this.copiesOf(
          source,
          offset,
          ctx,
          OFFSET_PREVIEW_ID
        )) {
          prims.push(
            ...entityScenePrimitive(viewport, copy, stroke, {
              blocks: ctx.blocks,
            })
          )
        }
      }
      return prims
    }

    return []
  }

  private openDistanceInput(ctx: ToolContext): void {
    const session: DynamicInputSession = {
      fields: [{ id: "distance", prompt: "offsetDistance", kind: "distance" }],
      commit: (values, commitCtx) =>
        this.setDistance(values.distance, commitCtx),
      // Enter with nothing typed, even with a two-point base placed: the default.
      commitRaw: (commitCtx) => {
        if (this.state.phase !== "distance") return false
        if (commitCtx.dynamicInput.hasTypedText()) return false
        if (this.offsetDist < 0) this.enterThrough(commitCtx)
        else this.setDistance(this.offsetDist, commitCtx)
        return true
      },
    }
    ctx.dynamicInput.open(session)
    if (this.offsetDist >= 0) {
      ctx.dynamicInput.setDefault("distance", this.offsetDist)
    }
    if (this.lastScreen) ctx.dynamicInput.setPosition(this.lastScreen)
  }

  /** A prompt answered by a pick or a keyword, its keywords on the tooltip. */
  private openKeywordPrompt(ctx: ToolContext): void {
    ctx.dynamicInput.open({ fields: [], commit: () => {} })
    if (this.lastScreen) ctx.dynamicInput.setPosition(this.lastScreen)
    ctx.requestRender()
  }

  /**
   * The side or through point: picked, or typed as any point is — `@` from
   * the object's pick, polar, a number its direct distance, an object snap,
   * FROM — which the runtime reads (probes offset/p253–p276).
   */
  private openPointInput(ctx: ToolContext): void {
    ctx.dynamicInput.open({
      fields: [{ id: "point", kind: "coordinate" }],
      commit: () => {},
      commitRaw: (commitCtx) => this.commitTypedPoint(commitCtx),
    })
    if (this.lastScreen) ctx.dynamicInput.setPosition(this.lastScreen)
    ctx.requestRender()
  }

  private commitTypedPoint(ctx: ToolContext): boolean {
    const text = ctx.dynamicInput.getText("point").trim()
    if (!isCoordinateExpression(text)) return false
    const point = parseCoordinate(text, {
      lastPoint: ctx.lastPoint,
      relativeByDefault: false,
      ucs: ctx.ucs,
      elevation: ctx.elevation,
    })
    if (!point) return false
    this.placePoint(point, ctx)
    return true
  }

  /** The side or through point, clicked or typed: one path for both. */
  private placePoint(point: Vec3, ctx: ToolContext): void {
    if (this.state.phase === "side") this.placeOffset(this.state, point, ctx)
    else if (this.state.phase === "throughPoint") {
      this.placeThrough(this.state, point, ctx)
    }
  }

  /**
   * The object picked, clicked or typed, which puts LASTPOINT there, hit or
   * miss (probes offset/p240, p241). An object on a locked layer is said
   * and asked again (p250), and so is one OFFSET has no copy of (p201–p205).
   */
  private pickObject(input: PointerInput, ctx: ToolContext): void {
    if (this.state.phase !== "select") return
    ctx.setLastPoint(input.world)
    const hit = this.pickSource(input, ctx)
    if (!hit) {
      if (lockedObjectAt(input.screen, ctx)) {
        ctx.report(ctx.text.message("objectOnLockedLayer"), "error")
      }
      return
    }
    if (offsetKind(hit) === "refused") {
      ctx.report(ctx.text.message("cannotOffsetObject"), "error")
      return
    }
    if (edgeOn(hit, ctx.viewport)) {
      // probes offset/p207, p234: in the UCS or not, said at the pick.
      ctx.report(ctx.text.message("cannotOffsetAtViewDirection"), "error")
      return
    }
    this.takeSource(hit, this.state.distance, input.point, ctx)
  }

  /**
   * The side point next, or the through point with no distance: after a
   * pick, or at once for the object selected before the command.
   */
  private takeSource(
    source: Entity,
    distance: number | null,
    cursor: Vec3,
    ctx: ToolContext
  ): void {
    this.state =
      distance === null
        ? {
            phase: "throughPoint",
            source,
            erasePending: false,
            multiple: false,
            cursor,
          }
        : {
            phase: "side",
            distance,
            source,
            original: source,
            erasePending: false,
            multiple: false,
            cursor,
          }
    this.openPointInput(ctx)
  }

  /**
   * The object selected before the command, if it is one and OFFSET takes it;
   * none for several (probes offset/p165, p167). LASTPOINT stays where it was:
   * nothing picked it.
   */
  private preselectedSource(ctx: ToolContext): Entity | null {
    const ids = ctx.selection.toArray()
    if (ids.length !== 1) return null
    const entity = ctx.document.get(ids[0])
    if (
      !entity ||
      offsetKind(entity) !== "offsets" ||
      edgeOn(entity, ctx.viewport)
    ) {
      return null
    }
    return ctx.document.getLayer(entity.layerId)?.locked ? null : entity
  }

  /**
   * After the distance or Through: the object selected before the command,
   * else `Select object to offset`.
   */
  private toFirstObject(distance: number | null, ctx: ToolContext): void {
    const source = this.preselected
    this.preselected = null
    if (source) {
      const cursor = this.lastScreen
        ? withZ(ctx.viewport.screenToWorld(this.lastScreen), ctx.elevation)
        : ctx.lastPoint
      this.takeSource(source, distance, cursor, ctx)
      return
    }
    this.state = { phase: "select", distance, hover: null }
    this.openKeywordPrompt(ctx)
  }

  private backToDistance(ctx: ToolContext): void {
    this.state = { phase: "distance" }
    this.openDistanceInput(ctx)
    ctx.requestRender()
  }

  /** Fixes the offset distance and advances to selecting the object. */
  private setDistance(distance: number, ctx: ToolContext): void {
    if (this.state.phase !== "distance") return
    if (!(distance > 0)) {
      // probes offset/p113, p114: said, and the distance asked again.
      ctx.report(ctx.text.message("positiveNonzero"), "error")
      return
    }
    this.offsetDist = distance
    this.toFirstObject(distance, ctx)
  }

  /** Switches to Through mode: pick an object, then a point to pass through. */
  private enterThrough(ctx: ToolContext): void {
    this.offsetDist = -1
    this.toFirstObject(null, ctx)
  }

  /**
   * Back to `Select object to offset`, in the mode the command is in, leaving
   * the object (Erase's pending erase done) unless Undo took its copy back.
   */
  private selectNext(ctx: ToolContext, leaving = true): void {
    const left = this.state
    const distance =
      left.phase === "side" || left.phase === "select" ? left.distance : null
    this.state = { phase: "select", distance, hover: null }
    this.openKeywordPrompt(ctx)
    if (leaving) this.eraseLeftObject(left, ctx)
  }

  /**
   * Erase with Multiple erases the object as it is left, its copies made: at
   * `<next object>`, Exit or a refused point (probes offset/p216, p224 append
   * the copies, then erase the source). Undo leaves it, and so does Escape
   * (both unverified).
   */
  private eraseLeftObject(left: OffsetToolState, ctx: ToolContext): void {
    if (left.phase !== "side" && left.phase !== "throughPoint") return
    if (!left.erasePending) return
    const original = left.phase === "side" ? left.original : left.source
    ctx.execute(new RemoveEntitiesCommand([original.id]))
  }

  /**
   * Creates the parallel copies on the side `side`. In Multiple mode it keeps
   * stepping out from the last copy (each further by the distance); otherwise it
   * loops back to selecting the next object — AutoCAD's continuous OFFSET. A
   * side that leaves nothing is said, then the next object (probes
   * offset/p174–p176).
   */
  private placeOffset(
    state: Extract<OffsetToolState, { phase: "side" }>,
    side: Vec3,
    ctx: ToolContext
  ): void {
    const offset = this.resolve(state, side, ctx)
    if (isRefusal(offset)) {
      ctx.report(ctx.text.message(offset.message), "error")
      this.selectNext(ctx)
      return
    }
    const copies = this.copiesOf(state.source, offset, ctx)
    if (state.multiple) {
      // Step out from the copy just made, keeping the command in this object.
      this.state = {
        ...state,
        source: copies[0],
        erasePending: this.erase,
        cursor: side,
      }
      this.emit(state.original, copies, false, ctx)
      ctx.requestRender()
    } else {
      this.selectNext(ctx)
      this.emit(state.original, copies, this.erase, ctx)
    }
  }

  /**
   * Creates the copies passing through `point`. In Multiple mode it keeps
   * making copies of the same source through further points; otherwise it
   * loops back to selecting the next object — AutoCAD's continuous OFFSET
   * Through.
   */
  private placeThrough(
    state: Extract<OffsetToolState, { phase: "throughPoint" }>,
    point: Vec3,
    ctx: ToolContext
  ): void {
    const offset = this.resolve(state, point, ctx)
    if (isRefusal(offset)) {
      // Said, then the next object, Multiple or not (probes offset/p277,
      // p295, p296).
      ctx.report(ctx.text.message(offset.message), "error")
      this.selectNext(ctx)
      return
    }
    const copies = this.copiesOf(state.source, offset, ctx)
    if (state.multiple) {
      this.state = { ...state, erasePending: this.erase, cursor: point }
      this.emit(state.source, copies, false, ctx)
      ctx.requestRender()
    } else {
      this.selectNext(ctx)
      this.emit(state.source, copies, this.erase, ctx)
    }
  }

  /**
   * Undo takes back the last copy, from whichever object, and asks for the
   * object in the run's mode, out of Multiple; with no copy left it says so
   * (probes offset/p125, p132, p138, p157, p158, p166).
   */
  private undoStep(ctx: ToolContext): void {
    const mark = this.marks.pop()
    this.selectNext(ctx, false)
    if (mark === undefined) {
      ctx.report(ctx.text.message("commandCompletelyUndoneShort"))
    } else {
      ctx.undoTo(mark)
    }
    ctx.requestRender()
  }

  /** The layer a copy of `source` is created on (Layer option: Source/Current). */
  private copyLayer(source: Entity, ctx: ToolContext): string {
    return this.offsetLayer === "current"
      ? ctx.document.getCurrentLayerId()
      : source.layerId
  }

  /**
   * The copies a side or through point makes, the one resolver of the preview
   * and the commit: in the object's own plane, the point taken there along
   * the view (probes offset/p235, p237, p239).
   */
  private resolve(
    state: Extract<OffsetToolState, { phase: "side" | "throughPoint" }>,
    point: Vec3,
    ctx: ToolContext
  ): OffsetResult {
    const { flat, into } = offsetPlane(state.source, ctx.viewport)
    return state.phase === "side"
      ? computeOffset(flat, state.distance, into(point))
      : computeThrough(flat, into(point))
  }

  /** The object a click would offset or refuse; an ellipse or a spline is never taken. */
  private pickSource(input: PointerInput, ctx: ToolContext): Entity | null {
    const hit = ctx.pick(input.world)
    return hit && offsetKind(hit) !== "notPicked" ? hit : null
  }

  /**
   * The copies of `source` the geometry makes, wearing what it wears; the
   * preview passes its fixed `id`.
   */
  private copiesOf(
    source: Entity,
    geoms: readonly OffsetGeom[],
    ctx: ToolContext,
    id?: string
  ): Entity[] {
    const layer = this.copyLayer(source, ctx)
    return geoms.map((geom) => {
      const copy = carryOverrides(source, offsetToEntity(geom, layer, id))
      // WHY: AutoCAD's copy of a circle or an arc has no thickness, its
      // elevation, colour, linetype and lineweight kept; a line's and a
      // polyline's keep theirs (probes offset/p219, p232, p233; p218, p225).
      return copy.type === "circle" || copy.type === "arc"
        ? withThickness(copy, 0)
        : copy
    })
  }

  /**
   * One point's copies as one step, for Undo: with `erase`, replacing
   * `original` (probe offset/p159).
   */
  private emit(
    original: Entity,
    copies: readonly Entity[],
    erase: boolean,
    ctx: ToolContext
  ): void {
    this.marks.push(ctx.historyDepth())
    ctx.execute(
      erase
        ? new ReplaceEntitiesCommand([original.id], copies)
        : new AddEntitiesCommand(copies)
    )
  }
}

/** The bare shape of an entity, for drawing highlights without an offset. */
function entityAsGeom(entity: Entity): OffsetGeom | null {
  switch (entity.type) {
    case "line":
      return { kind: "line", a: entity.start, b: entity.end }
    case "circle":
      return { kind: "circle", center: entity.center, radius: entity.radius }
    case "arc":
      return {
        kind: "arc",
        center: entity.center,
        radius: entity.radius,
        startAngle: entity.startAngle,
        endAngle: entity.endAngle,
      }
    case "polyline":
      return {
        kind: "polyline",
        vertices: entity.vertices,
        closed: entity.closed,
        bulges: entity.bulges,
        widths: entity.widths,
      }
    case "text":
    case "mtext":
    case "attdef":
    case "ellipse":
    case "spline":
    case "polyline3d":
    case "dimension":
    case "hatch":
    case "insert":
      return null
  }
}

/**
 * What OFFSET does with a picked object: offsets it; refuses it with `Cannot
 * offset that object.` (TEXT, MTEXT, INSERT, DIMENSION, HATCH: probes
 * offset/p201–p205); or never takes it. AutoCAD offsets an ellipse or a
 * spline into a spline (p196–p198), which is not built: a refusal there would
 * be false, so neither is even picked (OFFSET-D11). A 3D polyline the
 * console takes and passes over in silence, the prompt asked again
 * (3dpoly/p09): not picked either.
 */
function offsetKind(entity: Entity): "offsets" | "refused" | "notPicked" {
  switch (entity.type) {
    case "line":
    case "circle":
    case "arc":
    case "polyline":
      return "offsets"
    case "text":
    case "mtext":
    case "attdef":
    case "dimension":
    case "hatch":
    case "insert":
      return "refused"
    case "ellipse":
    case "spline":
    case "polyline3d":
      return "notPicked"
  }
}

/** A side or through point AutoCAD refuses, in its words. */
interface Refusal {
  readonly kind: "refused"
  readonly message: MessageId
}

/** The copies a point makes, one or more (a polyline can fall apart), or its refusal. */
type OffsetResult = readonly OffsetGeom[] | Refusal

/** On the object: on a line, its extension or a circle's rim (21221). */
const ON_OBJECT: Refusal = { kind: "refused", message: "invalidThroughPoint" }

/** Nothing left at that distance, or no copy of that point (21222). */
const CANNOT_OFFSET: Refusal = {
  kind: "refused",
  message: "cannotOffsetObject",
}

function isRefusal(result: OffsetResult): result is Refusal {
  return "kind" in result
}

/**
 * The offset copy of `source` at `distance`, on the side of `side`. Lines get a
 * parallel segment; circles and arcs a concentric one whose radius grows when
 * the side is outside the original and shrinks when inside, refused when that
 * takes it to its centre or past (probes offset/p174–p176); a polyline what
 * {@link offsetPolyline} makes of it.
 */
function computeOffset(
  source: Entity,
  distance: number,
  side: Vec2
): OffsetResult {
  switch (source.type) {
    case "line": {
      const o = offsetSegment(source.start, source.end, distance, side)
      return o ? [{ kind: "line", a: o.a, b: o.b }] : CANNOT_OFFSET
    }
    case "circle": {
      const radius = concentricRadius(
        source.center,
        source.radius,
        distance,
        side
      )
      return radius
        ? [{ kind: "circle", center: source.center, radius }]
        : CANNOT_OFFSET
    }
    case "arc": {
      const radius = concentricRadius(
        source.center,
        source.radius,
        distance,
        side
      )
      return radius
        ? [
            {
              kind: "arc",
              center: source.center,
              radius,
              startAngle: source.startAngle,
              endAngle: source.endAngle,
            },
          ]
        : CANNOT_OFFSET
    }
    case "polyline":
      return polylineCopies(offsetPolyline(source, distance, side))
    case "ellipse":
    case "spline":
    case "polyline3d":
    case "text":
    case "mtext":
    case "attdef":
    case "dimension":
    case "hatch":
    case "insert":
      return CANNOT_OFFSET
  }
}

function polylineCopies(shapes: readonly OffsetPolylineShape[]): OffsetResult {
  if (shapes.length === 0) return CANNOT_OFFSET
  return shapes.map((shape) => ({ kind: "polyline", ...shape }))
}

/**
 * The offset copy of `source` passing through `point` — AutoCAD's Through. For
 * a line, the parallel line that contains the point (shifted by the point's
 * offset from its perpendicular foot); for a circle/arc, the concentric one
 * whose radius is the point's distance to the centre; for a polyline, the one
 * at the point's distance from it, its open ends drawn on (probes offset/p211,
 * p212). Refused for a point on the object; at the centre, a radius of zero,
 * and outside an arc's span, `Cannot offset that object.` (probes
 * offset/p209, p273, p277, p278, p295, p296).
 */
function computeThrough(source: Entity, point: Vec2): OffsetResult {
  switch (source.type) {
    case "line": {
      const foot = closestPointOnInfiniteLine(
        source.start,
        source.end,
        point
      ).point
      const delta = V.sub(point, foot)
      if (V.length(delta) < 1e-9) return ON_OBJECT
      return [
        {
          kind: "line",
          a: V.add(source.start, delta),
          b: V.add(source.end, delta),
        },
      ]
    }
    case "circle":
    case "arc": {
      const radius = V.distance(source.center, point)
      if (radius < 1e-9) return CANNOT_OFFSET
      if (
        source.type === "arc" &&
        !angleWithinSweep(
          source.startAngle,
          source.endAngle,
          Math.atan2(point.y - source.center.y, point.x - source.center.x)
        )
      ) {
        return CANNOT_OFFSET
      }
      if (Math.abs(radius - source.radius) < 1e-9 * source.radius) {
        return ON_OBJECT
      }
      return source.type === "circle"
        ? [{ kind: "circle", center: source.center, radius }]
        : [
            {
              kind: "arc",
              center: source.center,
              radius,
              startAngle: source.startAngle,
              endAngle: source.endAngle,
            },
          ]
    }
    case "polyline": {
      const distance = polylineThroughDistance(source, point)
      return distance > 1e-9
        ? polylineCopies(offsetPolyline(source, distance, point))
        : ON_OBJECT
    }
    case "ellipse":
    case "spline":
    case "polyline3d":
    case "text":
    case "mtext":
    case "attdef":
    case "dimension":
    case "hatch":
    case "insert":
      return CANNOT_OFFSET
  }
}

/** The offset radius (outward when the side is outside the circle, inward when
 * inside), or `null` when it would collapse to zero or negative. */
function concentricRadius(
  center: Vec2,
  radius: number,
  distance: number,
  side: Vec2
): number | null {
  const outward = V.distance(side, center) >= radius
  const next = radius + (outward ? distance : -distance)
  return next > 1e-9 ? next : null
}

function offsetToEntity(
  geom: OffsetGeom,
  layerId: string,
  id?: string
): Entity {
  switch (geom.kind) {
    case "line":
      return createLine(geom.a, geom.b, layerId, id)
    case "circle":
      return createCircle(geom.center, geom.radius, layerId, id)
    case "arc":
      return createArc(
        geom.center,
        geom.radius,
        geom.startAngle,
        geom.endAngle,
        layerId,
        id
      )
    case "polyline":
      return createPolyline(
        geom.vertices,
        geom.closed,
        layerId,
        geom.bulges,
        id,
        geom.widths
      )
  }
}

/** Whether `entity` lies off the plan: in a plane of its own the view does not look straight at. */
function isOffPlan(entity: Entity, viewport: Viewport): boolean {
  return entity.type !== "line" && (!viewport.isPlan || !!entity.normal)
}

/**
 * Whether the view looks along the plane of a circle, an arc or a polyline:
 * no side of it can be pointed at.
 */
function edgeOn(entity: Entity, viewport: Viewport): boolean {
  return (
    offsetKind(entity) === "offsets" &&
    entity.type !== "line" &&
    Math.abs(dot3(entityNormal(entity), viewport.direction)) < 1e-9
  )
}

/**
 * The plane an object is offset in: its own, where it lies level (`flat`,
 * its stored points), and a side or through point taken there along the line
 * of sight (`into`). AutoCAD offsets an object tilted to the UCS in its plane
 * and keeps its normal (probes offset/p235, p239), and one seen in an
 * isometric view too (p237); a copy built on `flat` goes back through
 * `carryOverrides`, which puts it in the source's plane. A line is offset in
 * the UCS's XY plane.
 */
function offsetPlane(
  source: Entity,
  viewport: Viewport
): { flat: Entity; into: (point: Vec2 | Vec3) => Vec2 | Vec3 } {
  if (!isOffPlan(source, viewport)) return { flat: source, into: (p) => p }
  const normal = entityNormal(source)
  const axes = arbitraryAxis(normal)
  const elevation = entityElevation(source)
  const direction = viewport.direction
  const into = (point: Vec2 | Vec3): Vec2 => {
    const p: Vec3 = { x: point.x, y: point.y, z: zOf(point) }
    const t = (elevation - dot3(p, normal)) / dot3(direction, normal)
    const onPlane: Vec3 = {
      x: p.x + direction.x * t,
      y: p.y + direction.y * t,
      z: p.z + direction.z * t,
    }
    return axes ? planar(worldToAxes(axes, onPlane)) : planar(onPlane)
  }
  return { flat: withNormal(source, WORLD_Z), into }
}

const OFFSET_PREVIEW_ID = "__offset_preview__"
