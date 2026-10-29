import { Vec2, V } from "../../geometry/Vec2"
import { Entity } from "../../domain/entities"
import { ScenePrimitive } from "../../scene/types"
import { THEME } from "../../scene/theme"
import type { PromptId } from "../../locales/types"
import { EXTENTS_MARGIN_PX, entitiesViewBounds } from "../Viewport"
import {
  isCoordinateExpression,
  parseCoordinate,
} from "../input/coordinateInput"
import { ObjectSelector } from "./objectSelection"
import {
  CommandOption,
  CommandOptionOutcome,
  PointerInput,
  QuestionInput,
  Tool,
  ToolContext,
} from "./Tool"
import { DRAG_THRESHOLD_PX } from "../input/dragThreshold"

/**
 * ZOOM. Picking two corners frames that window (the command's default action),
 * a scale factor typed at its first prompt zooms by it, and the usual keywords
 * cover the rest of the navigation vocabulary:
 * `[All/Extents/Previous/Scale/Window/Object]`.
 *
 * WHY All behaves like Extents: AutoCAD's All frames the drawing limits when
 * the geometry fits inside them, and there is no LIMITS here — so the two
 * coincide, and a factor without its `X`, relative to the limits, is taken
 * at that view's scale (about the view's own centre, probe view/p158). Both
 * are kept because `Z A` and `Z E` are equally worn-in muscle memory.
 * Center, Dynamic and the real-time default are not implemented (the wheel
 * covers real-time zooming), so the first prompt offers no `<real time>`.
 */
type ZoomState =
  | { readonly phase: "main" }
  | { readonly phase: "first" }
  | {
      readonly phase: "opposite"
      readonly first: Vec2
      readonly firstScreen: Vec2 | null
      readonly cursor: Vec2
      /** Started at the first prompt, not by Window: a wrong corner stays. */
      readonly implied: boolean
    }
  | { readonly phase: "scale" }
  | { readonly phase: "object" }

/**
 * `2`, `2X` or `0.5x`: a factor, relative to the current view with its X.
 * `nXP` is `nX`, as model space takes it (probe view/p110); a sign is read
 * so that `-2` is refused as a factor (p106).
 */
const FACTOR = /^([+-]?(?:\d+(?:\.\d*)?|\.\d+))\s*(xp?)?$/i

export class ZoomTool implements Tool {
  readonly id = "zoom"
  readonly changesView = true

  private state: ZoomState = { phase: "main" }
  private lastScreen: Vec2 | null = null
  private readonly selector = new ObjectSelector({
    takes: () => "wholeObjects",
    done: (ctx) => {
      this.frameObjects(ctx)
      ctx.endCommand()
    },
  })

  onActivate(ctx: ToolContext): void {
    ctx.setCursor("crosshair")
    this.ask({ phase: "main" }, ctx)
  }

  onDeactivate(ctx: ToolContext): void {
    this.state = { phase: "main" }
    this.selector.start()
    ctx.dynamicInput.close()
  }

  question(): PromptId {
    switch (this.state.phase) {
      case "main":
        return "zoomCornerOr"
      case "first":
        return "specifyFirstCorner"
      case "opposite":
        return "specifyOppositeCorner"
      case "scale":
        return "zoomScaleFactor"
      case "object":
        return this.selector.question()
    }
  }

  /** A point at ZOOM's first prompt sets LASTPOINT; the corners after it do not. */
  setsLastPoint(): boolean | null {
    return this.state.phase === "main" ? true : null
  }

  /** As AutoCAD 2027's console refuses them (probes view/p104, p113, p117–p119, p151). */
  takes(): QuestionInput {
    switch (this.state.phase) {
      case "main":
        return { refusal: "requiresDistanceNumberXOrKeyword" }
      case "first":
      case "opposite":
        return { refusal: "invalidWindowSpecification" }
      case "scale":
        return { refusal: "requiresDistanceOrNumberX" }
      case "object":
        return this.selector.takes()
    }
  }

  /** Zoom picks a rectangle, never a geometric point: no snapping, no markers. */
  wantsSnap(): boolean {
    return this.state.phase === "object" && this.selector.wantsSnap()
  }

  onPointerMove(input: PointerInput, ctx: ToolContext): void {
    this.lastScreen = input.screen
    if (this.state.phase === "object") {
      this.selector.onPointerMove(input, ctx)
      return
    }
    if (this.state.phase === "opposite") {
      this.state = { ...this.state, cursor: input.world }
    }
    ctx.dynamicInput.setPosition(input.screen)
    ctx.requestRender()
  }

  onPointerDown(input: PointerInput, ctx: ToolContext): void {
    if (input.button !== 0) return
    switch (this.state.phase) {
      case "main":
      case "first":
        this.ask(
          {
            phase: "opposite",
            first: input.world,
            firstScreen: input.screen,
            cursor: input.world,
            implied: this.state.phase === "main",
          },
          ctx
        )
        return
      case "opposite":
        this.commitWindow(this.state.first, input.world, ctx)
        return
      case "object":
        this.selector.onPointerDown(input, ctx)
        return
    }
  }

  answerTyped(text: string, ctx: ToolContext): boolean {
    return this.state.phase === "object" && this.selector.answerTyped(text, ctx)
  }

  /** A press-drag frames the window on release, the way AutoCAD accepts both. */
  onPointerUp(input: PointerInput, ctx: ToolContext): void {
    if (this.state.phase === "object") {
      this.selector.onPointerUp(input, ctx)
      return
    }
    if (input.button !== 0 || this.state.phase !== "opposite") return
    const { firstScreen } = this.state
    if (
      firstScreen === null ||
      V.distance(input.screen, firstScreen) < DRAG_THRESHOLD_PX
    ) {
      return
    }
    this.commitWindow(this.state.first, input.world, ctx)
  }

  /** A window's corners take no Enter, as AutoCAD's refuse it. */
  cycleLasso(ctx: ToolContext): boolean {
    return this.selector.cycleLasso(ctx)
  }

  onEnter(ctx: ToolContext): boolean {
    switch (this.state.phase) {
      case "first":
      case "opposite":
        this.refuseWindow(ctx)
        return true
      case "object":
        return this.selector.onEnter(ctx)
      default:
        return false
    }
  }

  commandOptions(): readonly CommandOption[] {
    switch (this.state.phase) {
      case "main":
        return [
          { id: "All" },
          { id: "Extents" },
          { id: "Previous" },
          { id: "Scale" },
          { id: "Window" },
          { id: "Object" },
        ]
      case "object":
        return this.selector.commandOptions()
      default:
        return []
    }
  }

  invokeOption(id: string, ctx: ToolContext): CommandOptionOutcome {
    if (this.state.phase === "object") {
      return this.selector.invokeOption(id, ctx) ? "continue" : "unhandled"
    }
    if (this.state.phase !== "main") return "unhandled"
    switch (id) {
      case "All":
      case "Extents":
        // WHY silent with something drawn: 2027 regenerates only when the
        // view leaves what it last generated (p100, p108, p161), and nothing
        // is generated ahead here. With nothing drawn it frames the limits and
        // always regenerates (p136, p137), which a transparent ZOOM cannot
        // (line/p19, line/p209; with objects it zooms, line/p112).
        if (this.frame(ctx.document.getEntities(), ctx)) return "end"
        if (ctx.runsTransparently()) {
          ctx.report(ctx.text.message("requiresRegen"))
        } else {
          ctx.regenerate()
        }
        return "end"
      case "Previous":
        if (!ctx.viewport.restorePrevious()) {
          ctx.report(ctx.text.message("noPreviousView"))
        }
        return "end"
      case "Window":
        this.ask({ phase: "first" }, ctx)
        return "continue"
      case "Scale":
        this.state = { phase: "scale" }
        ctx.dynamicInput.open({
          fields: [{ id: "factor", prompt: "zoomScaleFactor", kind: "number" }],
          commit: (values, commitCtx) => {
            this.zoomBy(values.factor, false, commitCtx)
          },
          commitRaw: (commitCtx) => this.commitFactor("factor", commitCtx),
        })
        this.place(ctx)
        return "continue"
      case "Object":
        this.state = { phase: "object" }
        this.selector.start()
        // A set selected before ZOOM is counted and framed (probe view/p147).
        if (this.selector.preselect(ctx)) {
          this.frameObjects(ctx)
          return "end"
        }
        ctx.dynamicInput.close()
        return "continue"
      default:
        return "unhandled"
    }
  }

  buildOverlay(ctx: ToolContext): ScenePrimitive[] {
    if (this.state.phase === "object") return this.selector.buildOverlay(ctx)
    if (this.state.phase !== "opposite") return []
    const a = ctx.viewport.worldToScreen(this.state.first)
    const b = ctx.viewport.worldToScreen(this.state.cursor)
    // A solid white rectangle, as AutoCAD's (desktop view/d08-1).
    return [
      {
        kind: "rect",
        min: { x: Math.min(a.x, b.x), y: Math.min(a.y, b.y) },
        width: Math.abs(b.x - a.x),
        height: Math.abs(b.y - a.y),
        stroke: { color: THEME.rubberBand, width: 1 },
      },
    ]
  }

  /**
   * Asks the corner and factor prompts with a box, so a point or a factor
   * typed there answers them; a keyword typed in it still runs. A number at
   * a corner is a direct distance (probes view/p127–p130): Window's first
   * corner from LASTPOINT, the opposite one from the first, which the console
   * makes LASTPOINT while it asks (`@` too, p122).
   */
  private ask(state: ZoomState, ctx: ToolContext): void {
    this.state = state
    ctx.dynamicInput.open({
      fields: [{ id: "point", prompt: this.question(), kind: "coordinate" }],
      commit: () => {},
      commitRaw: (commitCtx) => this.commitTyped(commitCtx),
      directDistance:
        state.phase === "first"
          ? "lastPoint"
          : state.phase === "opposite"
            ? { ...state.first, z: ctx.elevation }
            : undefined,
    })
    this.place(ctx)
  }

  /** A point or, at the first prompt, a factor typed in the box. */
  private commitTyped(ctx: ToolContext): boolean {
    const state = this.state
    const text = ctx.dynamicInput.getText("point").trim()
    if (text === "") return false
    if (state.phase === "main" && FACTOR.test(text)) {
      return this.commitFactor("point", ctx)
    }
    const point = isCoordinateExpression(text)
      ? parseCoordinate(text, {
          lastPoint:
            state.phase === "opposite"
              ? { ...state.first, z: ctx.elevation }
              : ctx.lastPoint,
          relativeByDefault: false,
          ucs: ctx.ucs,
          elevation: ctx.elevation,
        })
      : null
    if (point === null) {
      if (state.phase === "main") return false
      this.refuseWindow(ctx)
      return true
    }
    const at = { x: point.x, y: point.y }
    if (state.phase === "opposite") {
      this.commitWindow(state.first, at, ctx)
    } else {
      this.ask(
        {
          phase: "opposite",
          first: at,
          firstScreen: null,
          cursor: at,
          implied: state.phase === "main",
        },
        ctx
      )
    }
    return true
  }

  /**
   * A wrong corner, or Enter there: `Invalid window specification.`, then
   * Window's first corner again, or the same corner when a pick or a point at
   * the first prompt started the window.
   */
  private refuseWindow(ctx: ToolContext): void {
    ctx.report(ctx.text.message("invalidWindowSpecification"))
    if (this.state.phase === "opposite" && this.state.implied) return
    this.ask({ phase: "first" }, ctx)
  }

  private commitWindow(first: Vec2, second: Vec2, ctx: ToolContext): void {
    // The window is upright on screen, so its extent is the view frame's.
    const a = ctx.viewport.worldToView(first)
    const b = ctx.viewport.worldToView(second)
    const min = { x: Math.min(a.x, b.x), y: Math.min(a.y, b.y) }
    const max = { x: Math.max(a.x, b.x), y: Math.max(a.y, b.y) }
    // A window of no size ends ZOOM (p120, p121); one of no width or no
    // height alone frames the other (p156, p157).
    if (max.x - min.x < 1e-9 && max.y - min.y < 1e-9) {
      ctx.report(ctx.text.message("invalid"), "error")
      ctx.endCommand()
      return
    }
    ctx.viewport.pushHistory()
    ctx.viewport.zoomToViewBounds(min, max)
    ctx.endCommand()
  }

  /**
   * A factor typed in field `id`: with its X, relative to the current view;
   * without, to ZOOM All's. False for anything else, which is refused.
   */
  private commitFactor(id: string, ctx: ToolContext): boolean {
    const match = FACTOR.exec(ctx.dynamicInput.getText(id).trim())
    if (match === null) return false
    this.zoomBy(Number(match[1]), match[2] !== undefined, ctx)
    return true
  }

  /**
   * Zooms by `factor` about the view's centre: from the current view or, not
   * `relative`, from ZOOM All's scale (p158; the current view's in an empty
   * drawing, which has no extents, p135). Zero or less is refused and asked
   * again, at the first prompt as at Scale's (p105, p106, p114, p116).
   */
  private zoomBy(factor: number, relative: boolean, ctx: ToolContext): void {
    if (!(factor > 0)) {
      ctx.report(ctx.text.message("positiveNonzero"), "error")
      return
    }
    const { viewport } = ctx
    const all = relative ? null : this.allScale(ctx)
    viewport.pushHistory()
    viewport.zoomAt(
      { x: viewport.width / 2, y: viewport.height / 2 },
      all === null ? factor : (all * factor) / viewport.scale
    )
    ctx.endCommand()
  }

  /** The scale ZOOM All frames the drawing at, or null with nothing drawn. */
  private allScale(ctx: ToolContext): number | null {
    const bounds = entitiesViewBounds(
      ctx.document.getEntities(),
      ctx.viewport,
      ctx.blocks
    )
    return bounds
      ? ctx.viewport.fitScale(bounds.min, bounds.max, EXTENTS_MARGIN_PX)
      : null
  }

  /**
   * Object's set framed. WHY refused transparently: Object always regenerates
   * (p139, p161), which a transparent ZOOM cannot, so 2027 says so and leaves
   * the view (p145).
   */
  private frameObjects(ctx: ToolContext): void {
    if (ctx.runsTransparently()) {
      ctx.report(ctx.text.message("requiresRegen"))
      return
    }
    this.frame(selectedEntities(ctx), ctx)
    ctx.regenerate()
  }

  /** Frames `entities` as the view shows them; false when there are none. */
  private frame(entities: readonly Entity[], ctx: ToolContext): boolean {
    const bounds = entitiesViewBounds(entities, ctx.viewport, ctx.blocks)
    if (!bounds) return false
    ctx.viewport.pushHistory()
    ctx.viewport.zoomToViewBounds(bounds.min, bounds.max, EXTENTS_MARGIN_PX)
    return true
  }

  private place(ctx: ToolContext): void {
    ctx.dynamicInput.setPosition(this.lastScreen ?? { x: 0, y: 0 })
    ctx.requestRender()
  }
}

function selectedEntities(ctx: ToolContext): Entity[] {
  return ctx.selection
    .toArray()
    .map((id) => ctx.document.get(id))
    .filter((entity): entity is Entity => entity !== undefined)
}
