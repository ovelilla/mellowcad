import { Vec2, V } from "../../geometry/Vec2"
import {
  circleCircleIntersection,
  closestPointOnArc,
  closestPointOnInfiniteLine,
  closestPointOnSegment,
  infiniteLineIntersection,
  lineCircleIntersectionParams,
  normalizeAngle,
  offsetSegment,
} from "../../geometry/primitives"
import {
  createArc,
  createCircle,
  createLine,
  carryOverrides,
  createPolyline,
  polylineSegmentGeometries,
  polylineSegments,
  readsInPlan,
  Entity,
  PolylineEntity,
  PolylineWidth,
} from "../../domain/entities"
import {
  AddEntityCommand,
  ReplaceEntitiesCommand,
} from "../commands/entityCommands"
import { DynamicInputSession } from "../input/DynamicInput"
import type { PromptId } from "../../locales/types"
import { ScenePrimitive, StrokeStyle } from "../../scene/types"
import { THEME } from "../../scene/theme"
import { arcScenePrimitive, entityScenePrimitive } from "../SceneBuilder"
import {
  CommandOption,
  CommandOptionOutcome,
  PointerInput,
  Tool,
  ToolContext,
  ToolQuestion,
  type QuestionInput,
} from "./Tool"

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
 * Both loop until Exit (Enter) or Escape; Undo takes back the last copy.
 *
 * Lines offset to a parallel line; circles and arcs to a concentric one. Erase
 * and Layer are AutoCAD's own sub-prompts at the distance prompt, reported in
 * `Current settings:` when the command starts; Multiple belongs to the side
 * prompt and keeps stepping copies out from the same object. Nothing is
 * mutated directly: each copy is an {@link AddEntityCommand} (or a
 * {@link ReplaceEntitiesCommand} when Erase replaces the source), so every step
 * is individually undoable.
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
      /** The object being offset (evolves to the last copy in Multiple mode). */
      readonly source: Entity
      /** The originally-picked object (the one Erase removes). */
      readonly original: Entity
      /** Whether the original has already been erased (Erase, once). */
      readonly erasedOriginal: boolean
      readonly multiple: boolean
      readonly cursor: Vec2
    }
  /** Through mode: object chosen; awaiting the point the copy passes through. */
  | {
      readonly phase: "throughPoint"
      readonly source: Entity
      /** Whether the source has already been erased (Erase, once). */
      readonly erasedOriginal: boolean
      readonly multiple: boolean
      readonly cursor: Vec2
    }

/** What one copy changed, for Undo to put back. */
interface OffsetStep {
  /** The original the copy was made from, and its source before the copy. */
  readonly original: Entity
  readonly source: Entity
  readonly erasedOriginal: boolean
}

export class OffsetTool implements Tool {
  readonly id = "offset"
  readonly shortcut = "o"

  private state: OffsetToolState = { phase: "distance" }
  /** Last known screen position, used to place dynamic input on open. */
  private lastScreen: Vec2 | null = null
  /** The copies made since the command started, newest last (Undo). */
  private steps: OffsetStep[] = []

  /**
   * Erase source and Layer, which the next OFFSET reports in its `Current
   * settings:` as it was left, for the session.
   */
  private erase = false
  private offsetLayer: "source" | "current" = "source"
  /**
   * AutoCAD's OFFSETDIST, the distance prompt's `<default>`: the last distance,
   * or Through while negative (initially -1, and not saved).
   */
  private offsetDist = -1

  onActivate(ctx: ToolContext): void {
    ctx.setCursor("crosshair")
    ctx.selection.clear()
    this.steps = []
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
    this.steps = []
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

  /** One object picked, then a point on its side. */
  takes(): QuestionInput | null {
    switch (this.state.phase) {
      case "select":
        return "object"
      case "side":
        return "point"
      default:
        return null
    }
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
        this.state = { ...this.state, cursor: input.world }
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
      case "select": {
        const hit = this.pickSource(input, ctx)
        if (!hit) return
        this.state =
          this.state.distance === null
            ? {
                phase: "throughPoint",
                source: hit,
                erasedOriginal: false,
                multiple: false,
                cursor: input.point,
              }
            : {
                phase: "side",
                distance: this.state.distance,
                source: hit,
                original: hit,
                erasedOriginal: false,
                multiple: false,
                cursor: input.world,
              }
        ctx.requestRender()
        return
      }
      case "side":
        this.placeOffset(this.state, input.world, ctx)
        return
      case "throughPoint":
        this.placeThrough(this.state, input.point, ctx)
        return
      case "erase":
      case "layer":
        return
    }
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
        return this.state.multiple
          ? [{ id: "Exit" }, { id: "Undo" }]
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
      if (id === "Exit") return "end"
      if (id === "Undo") {
        this.undoStep(ctx)
        return "continue"
      }
    }
    if (
      (phase === "side" || phase === "throughPoint") &&
      id === "Multiple" &&
      !this.state.multiple
    ) {
      this.state = { ...this.state, multiple: true }
      ctx.requestRender()
      return "continue"
    }
    return "unhandled"
  }

  wantsSnap(): boolean {
    // The through-point is a point, often an exact one; the distance's two
    // points are the runtime's to measure, and object and side picking are
    // proximity/side decisions.
    return this.state.phase === "throughPoint"
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
            createPolyline(
              geom.vertices,
              geom.closed,
              "0",
              geom.bulges,
              OFFSET_PREVIEW_ID,
              geom.widths
            ),
            stroke
          )
      }
    }
    // Highlights an entity's outline, or nothing when it has no offset geometry
    // (e.g. a polyline, whose offset is a later phase).
    const highlight = (
      entity: Entity,
      color: string,
      width: number
    ): ScenePrimitive[] => {
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

    if (this.state.phase === "side") {
      const { source, distance, cursor } = this.state
      // Keep the chosen source emphasised while the side is picked, plus a live
      // preview of the copy about to be created.
      const prims = highlight(source, THEME.selected, 2)
      const offset = computeOffset(source, distance, cursor)
      if (offset) prims.push(...draw(offset, THEME.rubberBand, 1))
      return prims
    }

    if (this.state.phase === "throughPoint") {
      const { source, cursor } = this.state
      const prims = highlight(source, THEME.selected, 2)
      const offset = computeThrough(source, cursor)
      if (offset) prims.push(...draw(offset, THEME.rubberBand, 1))
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

  private backToDistance(ctx: ToolContext): void {
    this.state = { phase: "distance" }
    this.openDistanceInput(ctx)
    ctx.requestRender()
  }

  /** Fixes the offset distance and advances to selecting the object. */
  private setDistance(distance: number, ctx: ToolContext): void {
    if (this.state.phase !== "distance") return
    if (!(distance > 0)) return
    this.offsetDist = distance
    this.state = { phase: "select", distance, hover: null }
    this.openKeywordPrompt(ctx)
  }

  /** Switches to Through mode: pick an object, then a point to pass through. */
  private enterThrough(ctx: ToolContext): void {
    this.offsetDist = -1
    this.state = { phase: "select", distance: null, hover: null }
    this.openKeywordPrompt(ctx)
  }

  /** Back to `Select object to offset`, in the mode the command is in. */
  private selectNext(ctx: ToolContext): void {
    const distance = this.state.phase === "side" ? this.state.distance : null
    this.state = { phase: "select", distance, hover: null }
    ctx.requestRender()
  }

  /**
   * Creates the parallel copy on the side `side`. In Multiple mode it keeps
   * stepping out from the last copy (each further by the distance); otherwise it
   * loops back to selecting the next object — AutoCAD's continuous OFFSET.
   */
  private placeOffset(
    state: Extract<OffsetToolState, { phase: "side" }>,
    side: Vec2,
    ctx: ToolContext
  ): void {
    const offset = computeOffset(state.source, state.distance, side)
    if (!offset) return // degenerate (e.g. the cursor is on the line); wait
    const erasedOriginal = this.emitCopy(
      state.original,
      state.source,
      offset,
      state.erasedOriginal,
      ctx
    )
    if (state.multiple) {
      // Step out from the copy just made, keeping the command in this object.
      const source = carryOverrides(
        state.source,
        offsetToEntity(offset, this.copyLayer(state.source, ctx))
      )
      this.state = { ...state, source, erasedOriginal, cursor: side }
    } else {
      this.state = { phase: "select", distance: state.distance, hover: null }
    }
    ctx.requestRender()
  }

  /**
   * Creates the copy passing through `point`. In Multiple mode it keeps making
   * copies of the same source through further points; otherwise it loops back to
   * selecting the next object — AutoCAD's continuous OFFSET Through.
   */
  private placeThrough(
    state: Extract<OffsetToolState, { phase: "throughPoint" }>,
    point: Vec2,
    ctx: ToolContext
  ): void {
    const offset = computeThrough(state.source, point)
    if (!offset) return // degenerate (the point lies on the object); wait
    const erasedOriginal = this.emitCopy(
      state.source,
      state.source,
      offset,
      state.erasedOriginal,
      ctx
    )
    this.state = state.multiple
      ? { ...state, erasedOriginal, cursor: point }
      : { phase: "select", distance: null, hover: null }
    ctx.requestRender()
  }

  /**
   * Undo takes back the last copy and asks the same question again; in
   * Multiple mode the next copy steps out from the one before it again.
   */
  private undoStep(ctx: ToolContext): void {
    const step = this.steps.pop()
    if (!step) return
    ctx.undo()
    const state = this.state
    if (
      (state.phase === "side" && state.original.id === step.original.id) ||
      (state.phase === "throughPoint" && state.source.id === step.source.id)
    ) {
      this.state =
        state.phase === "side"
          ? {
              ...state,
              source: step.source,
              erasedOriginal: step.erasedOriginal,
            }
          : { ...state, erasedOriginal: step.erasedOriginal }
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
   * The object a click would offset: OFFSET works in the UCS's XY plane, so
   * one at an angle to it never highlights.
   */
  private pickSource(input: PointerInput, ctx: ToolContext): Entity | null {
    const hit = ctx.pick(input.world)
    return hit && readsInPlan(hit) ? hit : null
  }

  /**
   * Executes the copy for `geom`. With Erase on and the original not yet gone,
   * the copy *replaces* the original in one undoable step; otherwise it is added
   * alongside. Returns whether the original has now been erased.
   */
  private emitCopy(
    original: Entity,
    source: Entity,
    geom: OffsetGeom,
    erasedOriginal: boolean,
    ctx: ToolContext
  ): boolean {
    const copy = carryOverrides(
      source,
      offsetToEntity(geom, this.copyLayer(source, ctx))
    )
    this.steps.push({ original, source, erasedOriginal })
    if (this.erase && !erasedOriginal) {
      ctx.execute(new ReplaceEntitiesCommand([original.id], [copy]))
      return true
    }
    ctx.execute(new AddEntityCommand(copy))
    return erasedOriginal
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
      return null // text has no parallel copy
    case "ellipse":
    case "spline":
      // The parallel curve of an ellipse is not an ellipse — AutoCAD offsets
      // one into a spline, and offsetting a spline is not built — so neither
      // even highlights as a source.
      return null
    case "dimension":
    case "hatch":
    case "insert":
      return null
  }
}

/**
 * The offset copy of `source` at `distance`, on the side of `side`. Lines get a
 * parallel segment; circles and arcs a concentric one whose radius grows when
 * the side is outside the original and shrinks when inside — `null` when the
 * result is degenerate (a line of zero length or a non-positive radius).
 */
function computeOffset(
  source: Entity,
  distance: number,
  side: Vec2
): OffsetGeom | null {
  switch (source.type) {
    case "line": {
      const o = offsetSegment(source.start, source.end, distance, side)
      return o ? { kind: "line", a: o.a, b: o.b } : null
    }
    case "circle": {
      const radius = concentricRadius(
        source.center,
        source.radius,
        distance,
        side
      )
      return radius ? { kind: "circle", center: source.center, radius } : null
    }
    case "arc": {
      const radius = concentricRadius(
        source.center,
        source.radius,
        distance,
        side
      )
      return radius
        ? {
            kind: "arc",
            center: source.center,
            radius,
            startAngle: source.startAngle,
            endAngle: source.endAngle,
          }
        : null
    }
    case "polyline":
      return offsetPolyline(source, distance, side)
    case "ellipse":
    case "spline":
    case "text":
    case "mtext":
    case "attdef":
    case "dimension":
    case "hatch":
    case "insert":
      return null
  }
}

/**
 * The offset copy of `source` passing through `point` — AutoCAD's Through. For
 * a line, the parallel line that contains the point (shifted by the point's
 * offset from its perpendicular foot); for a circle/arc, the concentric one
 * whose radius is the point's distance to the centre. `null` when degenerate
 * (the point lies on the line, or the radius would be zero).
 */
function computeThrough(source: Entity, point: Vec2): OffsetGeom | null {
  switch (source.type) {
    case "line": {
      const foot = closestPointOnInfiniteLine(
        source.start,
        source.end,
        point
      ).point
      const delta = V.sub(point, foot)
      if (V.length(delta) < 1e-9) return null // the point lies on the line
      return {
        kind: "line",
        a: V.add(source.start, delta),
        b: V.add(source.end, delta),
      }
    }
    case "circle": {
      const radius = V.distance(source.center, point)
      return radius > 1e-9
        ? { kind: "circle", center: source.center, radius }
        : null
    }
    case "arc": {
      const radius = V.distance(source.center, point)
      return radius > 1e-9
        ? {
            kind: "arc",
            center: source.center,
            radius,
            startAngle: source.startAngle,
            endAngle: source.endAngle,
          }
        : null
    }
    case "polyline": {
      // The offset distance is the point's perpendicular distance to the
      // nearest segment; the point itself decides the side, so the parallel
      // runs through it.
      let best = Infinity
      for (const seg of polylineSegmentGeometries(source)) {
        const d =
          seg.kind === "line"
            ? closestPointOnSegment(seg.a, seg.b, point).distance
            : closestPointOnArc(
                seg.center,
                seg.radius,
                seg.startAngle,
                seg.endAngle,
                point
              ).distance
        if (d < best) best = d
      }
      return best > 1e-9 ? offsetPolyline(source, best, point) : null
    }
    case "ellipse":
    case "spline":
    case "text":
    case "mtext":
    case "attdef":
    case "dimension":
    case "hatch":
    case "insert":
      return null
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

function offsetToEntity(geom: OffsetGeom, layerId: string): Entity {
  switch (geom.kind) {
    case "line":
      return createLine(geom.a, geom.b, layerId)
    case "circle":
      return createCircle(geom.center, geom.radius, layerId)
    case "arc":
      return createArc(
        geom.center,
        geom.radius,
        geom.startAngle,
        geom.endAngle,
        layerId
      )
    case "polyline":
      return createPolyline(
        geom.vertices,
        geom.closed,
        layerId,
        geom.bulges,
        undefined,
        geom.widths
      )
  }
}

const OFFSET_PREVIEW_ID = "__offset_preview__"

/**
 * The parallel copy of a polyline at `distance`, on the side of the `side`
 * point. Straight segments shift by their perpendicular; arc (bulge) segments
 * become concentric arcs whose radius grows or shrinks depending on which way
 * the offset goes. Consecutive offset segments are re-joined at their
 * intersection so corners stay sharp (AutoCAD's default OFFSETGAPTYPE = extend);
 * line↔line joins are line intersections, and any join involving an arc is a
 * line↔circle or circle↔circle intersection. A single global side sign keeps the
 * offset consistently inside or outside the whole chain. Returns `null` for a
 * degenerate result (a zero-length segment or a non-positive arc radius).
 */
function offsetPolyline(
  poly: PolylineEntity,
  distance: number,
  side: Vec2
): OffsetGeom | null {
  const geoms = polylineSegmentGeometries(poly)
  if (geoms.length === 0) return null

  const sign = offsetSideSign(polylineSegments(poly), side)
  const signedLeftOffset = sign * distance

  const offsetSegs: (OffsetSeg | null)[] = geoms.map((g) => {
    if (g.kind === "line") {
      const s = shiftedSegment(g.a, g.b, signedLeftOffset)
      return s ? { kind: "line", a: s.a, b: s.b } : null
    }
    // A concentric arc: shifting toward the centre shrinks the radius, away
    // grows it. The centre is on the left of travel for a CCW arc (bulge > 0),
    // on the right for CW, which sets the sign of the radius change.
    const newRadius = g.radius - Math.sign(g.bulge) * signedLeftOffset
    if (newRadius < 1e-9) return null
    const radial = (p: Vec2): Vec2 =>
      V.add(g.center, V.scale(V.sub(p, g.center), newRadius / g.radius))
    return {
      kind: "arc",
      center: g.center,
      radius: newRadius,
      a: radial(g.a),
      b: radial(g.b),
      bulge: g.bulge,
    }
  })
  if (offsetSegs.some((s) => s === null)) return null
  const segs = offsetSegs as OffsetSeg[]
  const m = segs.length

  const vertices: Vec2[] = []
  if (poly.closed) {
    for (let j = 0; j < m; j++) {
      vertices.push(joinOffsetSegments(segs[(j - 1 + m) % m], segs[j]))
    }
  } else {
    vertices.push(segs[0].a)
    for (let j = 1; j < m; j++) {
      vertices.push(joinOffsetSegments(segs[j - 1], segs[j]))
    }
    vertices.push(segs[m - 1].b)
  }

  // Each arc segment's bulge is recomputed from its (corner-adjusted) endpoints
  // so the retained curvature stays exact; straight segments contribute 0.
  const bulges: number[] = []
  for (let j = 0; j < m; j++) {
    const seg = segs[j]
    if (seg.kind === "line") {
      bulges.push(0)
      continue
    }
    const start = vertices[j]
    const end = vertices[poly.closed ? (j + 1) % m : j + 1]
    bulges.push(arcBulgeFromEndpoints(seg.center, start, end, seg.bulge))
  }

  // Each segment keeps its widths (acc/w9).
  return {
    kind: "polyline",
    vertices,
    closed: poly.closed,
    bulges,
    widths: poly.widths,
  }
}

/** An offset segment before its corners are re-joined. */
type OffsetSeg =
  | { readonly kind: "line"; readonly a: Vec2; readonly b: Vec2 }
  | {
      readonly kind: "arc"
      readonly center: Vec2
      readonly radius: number
      readonly a: Vec2
      readonly b: Vec2
      readonly bulge: number
    }

/** The corner joining two consecutive offset segments, picking (for curves) the
 * intersection nearest the naive corner between them. */
function joinOffsetSegments(prev: OffsetSeg, cur: OffsetSeg): Vec2 {
  const ref = V.scale(V.add(prev.b, cur.a), 0.5)
  if (prev.kind === "line" && cur.kind === "line") {
    const x = infiniteLineIntersection(prev.a, prev.b, cur.a, cur.b)
    return x ? x.point : cur.a
  }
  if (prev.kind === "line" && cur.kind === "arc") {
    return (
      nearestPoint(
        lineCirclePoints(prev.a, prev.b, cur.center, cur.radius),
        ref
      ) ?? cur.a
    )
  }
  if (prev.kind === "arc" && cur.kind === "line") {
    return (
      nearestPoint(
        lineCirclePoints(cur.a, cur.b, prev.center, prev.radius),
        ref
      ) ?? cur.a
    )
  }
  if (prev.kind === "arc" && cur.kind === "arc") {
    return (
      nearestPoint(
        circleCircleIntersection(
          prev.center,
          prev.radius,
          cur.center,
          cur.radius
        ),
        ref
      ) ?? cur.a
    )
  }
  return cur.a
}

/** Points where the infinite line through `a`/`b` meets a circle. */
function lineCirclePoints(
  a: Vec2,
  b: Vec2,
  center: Vec2,
  radius: number
): Vec2[] {
  const dir = V.sub(b, a)
  return lineCircleIntersectionParams(a, b, center, radius).map((t) =>
    V.add(a, V.scale(dir, t))
  )
}

/** The point in `points` nearest `ref`, or `null` when there are none. */
function nearestPoint(points: readonly Vec2[], ref: Vec2): Vec2 | null {
  let best: Vec2 | null = null
  let bestDist = Infinity
  for (const p of points) {
    const d = V.distance(p, ref)
    if (d < bestDist) {
      bestDist = d
      best = p
    }
  }
  return best
}

/** The bulge of a concentric arc between two endpoints on its circle, keeping
 * the original rotational direction (sign). */
function arcBulgeFromEndpoints(
  center: Vec2,
  start: Vec2,
  end: Vec2,
  originalBulge: number
): number {
  const angStart = Math.atan2(start.y - center.y, start.x - center.x)
  const angEnd = Math.atan2(end.y - center.y, end.x - center.x)
  const included =
    originalBulge >= 0
      ? normalizeAngle(angEnd - angStart)
      : normalizeAngle(angStart - angEnd)
  const magnitude = Math.tan(included / 4)
  return originalBulge >= 0 ? magnitude : -magnitude
}

type ShiftedSegment = { readonly a: Vec2; readonly b: Vec2; readonly dir: Vec2 }

/** A segment moved by `offset` along its left normal, keeping its direction. */
function shiftedSegment(
  a: Vec2,
  b: Vec2,
  offset: number
): ShiftedSegment | null {
  const dir = V.sub(b, a)
  const len = V.length(dir)
  if (len < 1e-9) return null
  const unit = V.scale(dir, 1 / len)
  const normal = { x: -unit.y, y: unit.x } // left of the travel direction
  const shift = V.scale(normal, offset)
  return { a: V.add(a, shift), b: V.add(b, shift), dir: unit }
}

/**
 * +1 when the `side` point lies to the left of the segment nearest it, -1 to
 * the right — the global sign that sends the whole offset to that side.
 */
function offsetSideSign(segs: readonly [Vec2, Vec2][], side: Vec2): number {
  let best = Infinity
  let nearest = segs[0]
  for (const seg of segs) {
    const d = closestPointOnSegment(seg[0], seg[1], side).distance
    if (d < best) {
      best = d
      nearest = seg
    }
  }
  const dir = V.sub(nearest[1], nearest[0])
  const left = { x: -dir.y, y: dir.x }
  return V.dot(left, V.sub(side, nearest[0])) >= 0 ? 1 : -1
}
