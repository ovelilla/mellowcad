import { Vec2, V } from "../../geometry/Vec2"
import { Entity } from "../../domain/entities"
import { ScenePrimitive } from "../../scene/types"
import { THEME } from "../../scene/theme"
import type { PromptId } from "../../locales/types"
import { entitiesViewBounds } from "../Viewport"
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

/**
 * ZOOM. Picking two corners frames that window (the command's default action),
 * a scale factor typed at its first prompt zooms by it, and the usual keywords
 * cover the rest of the navigation vocabulary:
 * `[All/Extents/Previous/Scale/Window/Object]`.
 *
 * WHY All behaves like Extents: AutoCAD's All frames the drawing limits when
 * the geometry fits inside them, and there is no LIMITS here — so the two
 * coincide, and a factor without its `X`, relative to the limits, is relative
 * to that view. Both are kept because `Z A` and `Z E` are equally worn-in
 * muscle memory. Center, Dynamic and the real-time default are not
 * implemented (the wheel covers real-time zooming), so the first prompt
 * offers no `<real time>`.
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

/** Pixels the press must travel for a drag to count as the whole window. */
const DRAG_THRESHOLD_PX = 4

/** Screen margin left around the framed geometry, as in `zoomToFit`. */
const PADDING_PX = 40

/** `2`, `2X` or `0.5x`: a factor, relative to the current view with its X. */
const FACTOR = /^(\d+(?:\.\d*)?|\.\d+)\s*(x?)$/i

export class ZoomTool implements Tool {
  readonly id = "zoom"
  readonly changesView = true

  private state: ZoomState = { phase: "main" }
  private lastScreen: Vec2 | null = null
  private readonly selector = new ObjectSelector({
    takes: () => "wholeObjects",
    done: (ctx) => {
      this.frame(selectedEntities(ctx), ctx)
      regenerated(ctx)
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

  /** As AutoCAD 2023's console refuses ZOOM's answers. */
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
        this.frame(ctx.document.getEntities(), ctx)
        regenerated(ctx)
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
          commit: (values, commitCtx) =>
            this.zoomBy(values.factor, false, commitCtx),
          commitRaw: (commitCtx) => this.commitFactor("factor", commitCtx),
        })
        this.place(ctx)
        return "continue"
      case "Object":
        // A pre-selected set is what the user already pointed at, so honour it
        // instead of asking again.
        if (this.frame(selectedEntities(ctx), ctx)) {
          regenerated(ctx)
          return "end"
        }
        this.state = { phase: "object" }
        this.selector.start()
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
    return [
      {
        kind: "rect",
        min: { x: Math.min(a.x, b.x), y: Math.min(a.y, b.y) },
        width: Math.abs(b.x - a.x),
        height: Math.abs(b.y - a.y),
        stroke: { color: THEME.preview, width: 1, dash: [6, 4] },
      },
    ]
  }

  /**
   * Asks the corner and factor prompts with a box, so a point or a factor
   * typed there answers them; a keyword typed in it still runs.
   */
  private ask(state: ZoomState, ctx: ToolContext): void {
    this.state = state
    ctx.dynamicInput.open({
      fields: [{ id: "point", prompt: this.question(), kind: "coordinate" }],
      commit: () => {},
      commitRaw: (commitCtx) => this.commitTyped(commitCtx),
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
          lastPoint: ctx.lastPoint,
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
    // A stray click (an empty window) would zoom to an absurd scale; keep
    // prompting instead, as AutoCAD does.
    if (max.x - min.x < 1e-9 || max.y - min.y < 1e-9) {
      this.ask({ phase: "main" }, ctx)
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
    return match !== null && this.zoomBy(Number(match[1]), match[2] !== "", ctx)
  }

  /** Zooms by `factor`, from the current view or, not `relative`, ZOOM All's. */
  private zoomBy(factor: number, relative: boolean, ctx: ToolContext): boolean {
    if (!(factor > 0)) return false
    const center = {
      x: ctx.viewport.width / 2,
      y: ctx.viewport.height / 2,
    }
    if (relative || !this.frame(ctx.document.getEntities(), ctx)) {
      ctx.viewport.pushHistory()
    }
    ctx.viewport.zoomAt(center, factor)
    ctx.endCommand()
    return true
  }

  /** Frames `entities` as the view shows them; false when there are none. */
  private frame(entities: readonly Entity[], ctx: ToolContext): boolean {
    const bounds = entitiesViewBounds(entities, ctx.viewport, ctx.blocks)
    if (!bounds) return false
    ctx.viewport.pushHistory()
    ctx.viewport.zoomToViewBounds(bounds.min, bounds.max, PADDING_PX)
    return true
  }

  private place(ctx: ToolContext): void {
    ctx.dynamicInput.setPosition(this.lastScreen ?? { x: 0, y: 0 })
    ctx.requestRender()
  }
}

/**
 * `Regenerating model.` after Extents, All and Object. WHY not transparently:
 * AutoCAD 2023's console regenerates only when the zoom leaves what it last
 * generated, and a transparent ZOOM, which cannot regenerate, then refuses
 * (`** Requires a regen, cannot be transparent.`), zooming without a word
 * when it needs none. Nothing is generated ahead here, so a transparent zoom
 * never needs a regeneration, and says nothing.
 */
function regenerated(ctx: ToolContext): void {
  if (ctx.runsTransparently()) return
  ctx.regenerate()
}

function selectedEntities(ctx: ToolContext): Entity[] {
  return ctx.selection
    .toArray()
    .map((id) => ctx.document.get(id))
    .filter((entity): entity is Entity => entity !== undefined)
}
