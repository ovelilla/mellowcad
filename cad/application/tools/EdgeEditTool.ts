import { Vec2, V } from "../../geometry/Vec2"
import type { Vec3 } from "../../geometry/Vec3"
import {
  angleWithinSweep,
  circleCircleIntersection,
  infiniteLineIntersection,
  lineCircleIntersectionParams,
  normalizeAngle,
  polarPoint,
  segmentArcIntersection,
  segmentCircleIntersection,
} from "../../geometry/primitives"
import {
  ArcEntity,
  CircleEntity,
  EllipseEntity,
  Entity,
  EntityId,
  LineEntity,
  PolylineEntity,
  PolylineWidth,
  PolylineSegmentGeometry,
  SplineEntity,
  arcSweepAngle,
  createArc,
  createCircle,
  createEllipse,
  createLine,
  carryPiece,
  createPolyline,
  distanceToEntity,
  entitiesBounds,
  ellipseCut,
  ellipseParamAt,
  ellipseSweepParams,
  isFullEllipse,
  fractionAlongSegment,
  nearestPolylineSegment,
  polylineParamAt,
  polylineSegmentGeometries,
  polylineSegments,
  polylineSpan,
  readsInPlan,
} from "../../domain/entities"
import { LayerId } from "../../domain/layers"
import {
  RemoveEntitiesCommand,
  ReplaceEntitiesCommand,
  UpdateEntityCommand,
} from "../commands/entityCommands"
import { ScenePrimitive, StrokeStyle } from "../../scene/types"
import { THEME } from "../../scene/theme"
import { arcScenePrimitive, entityScenePrimitive } from "../SceneBuilder"
import type { PromptId } from "../../locales/types"
import type { MessageId } from "../EngineText"
import {
  CommandOption,
  CommandOptionOutcome,
  PointerInput,
  Tool,
  ToolContext,
  type QuestionInput,
  type ToolQuestion,
} from "./Tool"
import {
  crossingParams,
  curveCrossings,
  ellipseImplicit,
  ellipseParamOf,
  implicitEdges,
  parametricCurve,
} from "./curveCrossings"
import { typedPick } from "./typedPick"
import { ObjectSelector } from "./objectSelection"
import {
  buildFenceOverlay,
  buildSelectionBoxOverlay,
  fenceCrossings,
} from "./boxSelection"
import { entityScreenOutline } from "../viewOutline"
import type { Viewport } from "../Viewport"
import {
  isCoordinateExpression,
  parseCoordinate,
} from "../input/coordinateInput"

/**
 * TRIM and EXTEND share one interaction and most of their geometry, so they are
 * built on this common base — AutoCAD likewise treats them as a single command
 * pair where **Shift toggles** from one to the other on the fly.
 *
 * The mode is TRIMEXTENDMODE and EDGEMODE (`TrimExtendMode`, one object TRIM
 * and EXTEND share). In Quick mode *every* other object is an edge; Standard
 * mode's are the ones cuTting edges / Boundary edges chose (`edges`), asked
 * with `edgeSelector`, and an edge's pieces stay edges (`keepEdges`). Edge's
 * Extend runs the edges on (`prolonged`) in Standard mode alone. A polyline
 * that is an edge is one of its own too: its picked segment is cut at its
 * vertices and where it crosses itself (`ownEdges`), never at the next
 * crossing round the chain; one that is not is trimmed along it, past its
 * vertices, to the nearest edge (`planTrimPolylinePath`).
 *
 * A pick on nothing starts AutoCAD's two-point crossing fence, Fence one of
 * any points, and Crossing's window is a closed fence round its outline
 * (`clockwiseOutline`): `editAcross` takes each place one meets an object as
 * a pick there, one Undo step. eRase asks its set with an `ObjectSelector` of
 * whole objects (`eraser`), whose `done` erases it as one step of the
 * command's. You hover the object to edit (which previews the result) and
 * click:
 *
 * - **Trim**: the clicked portion of the object is removed up to its nearest
 *   intersections. A line portion between two crossings splits it in two; a
 *   portion running off an end just shortens it. A **circle** trimmed between
 *   two crossings becomes the complementary **arc**; an **arc** trims like a
 *   line but along its sweep.
 *   An object no edge cuts is deleted instead, as Quick mode's is.
 * - **Extend**: a line or arc grows from the endpoint nearest the click, along
 *   its own direction/sweep, until it reaches the closest boundary. (Circles
 *   are closed, so they cannot be extended.)
 *
 * The command loops until Escape/Enter, so successive clicks trim more pieces
 * or extend to further boundaries — exactly like AutoCAD. Lines, circles,
 * arcs, polylines, ellipses and splines all serve as edges/boundaries for
 * one another.
 */

type EdgeEditMode = "trim" | "extend"

/** A bare piece of geometry (no id/layer), used for previews and results. */
type EditGeom =
  | { readonly kind: "line"; readonly start: Vec2; readonly end: Vec2 }
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
  | {
      readonly kind: "ellipse"
      readonly center: Vec2
      readonly majorAxis: Vec2
      readonly ratio: number
      readonly startParam: number
      readonly endParam: number
    }

/** A resolved edit ready to preview and commit against the hovered object. */
type EdgeEditPlan =
  | {
      readonly kind: "trim"
      readonly targetId: EntityId
      readonly layerId: LayerId
      /** The piece(s) that remain — one when shortened, two when split. */
      readonly replacements: readonly EditGeom[]
      /** The stretch being cut away, drawn as a deletion preview. */
      readonly removed: EditGeom
    }
  | {
      readonly kind: "extend"
      readonly targetId: EntityId
      readonly layerId: LayerId
      readonly result: EditGeom
      /** The stretch being appended, drawn as an addition preview. */
      readonly added: EditGeom
    }
  /** Quick mode's trim of an object no edge cuts: it is deleted. */
  | { readonly kind: "erase"; readonly target: Entity }
  /** A pick TRIM refuses, in the console's words. */
  | { readonly kind: "refuse"; readonly message: MessageId }

/**
 * A fence: the one a pick on nothing starts, AutoCAD's "pick two empty
 * locations", which its second point closes (probes trim/p241, p297, p404),
 * or Fence's, typed, whose points Enter ends (p289–p293).
 */
interface EdgeEditFence {
  readonly points: readonly Vec2[]
  readonly cursor: Vec2 | null
  readonly typed: boolean
}

/**
 * AutoCAD's TRIMEXTENDMODE and EDGEMODE, shared by TRIM and EXTEND of one
 * runtime: Standard or Quick, and whether Standard's edges run on. WHY for the
 * session: AutoCAD keeps them in the registry, across sessions; here they last
 * as long as the runtime, as UNDO's Combine and Layer do.
 */
export interface TrimExtendMode {
  standard: boolean
  edgeExtend: boolean
}

/**
 * An edit Undo takes back, everything since the history stood at `depth`
 * (a transparent 'LTSCALE with it, probe trim/p164), with the edge mode an
 * Edge choice before it changed, which goes back with it (p137).
 */
interface EditStep {
  readonly depth: number
  readonly edgeExtend?: boolean
}

export abstract class EdgeEditTool implements Tool {
  abstract readonly id: string
  abstract readonly shortcut?: string

  /** The action performed without Shift; Shift performs the other one. */
  protected abstract readonly defaultMode: EdgeEditMode

  private preview: EdgeEditPlan | null = null
  /**
   * What Undo takes back since the command started, newest last: the edits
   * alone, so a refusal, a fence or a window that changes nothing goes back
   * with the edit before it (probes trim/p381, p388).
   */
  private steps: EditStep[] = []
  /**
   * Whether Undo is listed: since the start, or since U said all was undone,
   * the object prompt had an answer — a pick, hit, missed or refused, a
   * fence, a window's first corner, a mode or Edge answer, Enter there
   * included, Quick's first Enter (p100, p107, p161, p241, p301, p383);
   * before it Undo is refused in the prompt's words (p114).
   */
  private answered = false
  /**
   * Whether Quick's Enter at the object prompt ends the command. Until an
   * object is picked or missed, a fence or window drawn, edges chosen or U
   * taken, the first is taken as an answer, not a mode's or a refused one
   * (p100, p107, p117, p152, p158, p246, p284, p290).
   */
  private enterSpent = false
  /** The edge mode an Edge choice changed, which no step has taken yet. */
  private edgeBefore: boolean | null = null
  private lastInput: PointerInput | null = null
  private fence: EdgeEditFence | null = null
  /** Crossing's window, its first corner once given (probes trim/p301–p307). */
  private window: {
    readonly start: Vec2 | null
    readonly cursor: Vec2 | null
  } | null = null
  /**
   * What the command asks besides its object: eRase's set (probes
   * trim/p111, p112, p153), cuTting edges' (Boundary edges') or mOde's
   * option (p107, p119, p136, p152), Edge's (p109, p125, p135).
   */
  private asking: "erase" | "edges" | "mode" | "edge" | null = null
  /** Whether the edges are asked as the command starts, which offers mOde. */
  private starting = false
  /** Whether mOde was asked at the edges' prompt, which it goes back to. */
  private modeFromEdges = false
  /** The edges, by id, the pieces of one with them; null for every object. */
  private edges: Set<EntityId> | null = null
  private selection: ToolContext["selection"] | null = null
  private readonly eraser = new ObjectSelector({
    takes: () => "wholeObjects",
    question: () =>
      (this.selection?.isEmpty() ?? true)
        ? "selectObjectsToEraseOrExit"
        : "selectObjectsToErase",
    done: (ctx) => this.eraseSet(ctx),
  })
  private readonly edgeSelector = new ObjectSelector({
    takes: () => "wholeObjects",
    done: (ctx) => this.takeEdges(ctx),
  })

  constructor(
    private readonly mode: TrimExtendMode = {
      standard: false,
      edgeExtend: false,
    }
  ) {}

  onActivate(ctx: ToolContext): void {
    ctx.setCursor("crosshair")
    this.selection = ctx.selection
    this.preview = null
    this.fence = null
    this.window = null
    this.asking = null
    this.edges = null
    this.steps = []
    this.edgeBefore = null
    this.answered = false
    this.enterSpent = false
    // PROJMODE 1 is fixed here.
    this.reportSettings(ctx)
    if (ctx.selection.isEmpty()) {
      if (this.mode.standard) this.askEdges(true, ctx)
      return
    }
    // The objects selected before the command are its only edges, counted
    // after the edges' words, Standard's prompt skipped and nothing left
    // selected (probes trim/p141–p144).
    this.reportEdgesPrompt(ctx)
    this.edgeSelector.start()
    if (this.edgeSelector.preselect(ctx)) {
      this.edges = new Set(ctx.selection.toArray())
      this.enterSpent = true
    } else if (this.mode.standard) {
      this.askEdges(true, ctx, false)
    }
    ctx.selection.clear()
  }

  /**
   * WHY no Project: it is not built, so the prompt lists what is; Fence is
   * unlisted in Quick mode, as in AutoCAD.
   */
  question(): PromptId | ToolQuestion {
    if (this.asking === "edge") return "enterImpliedEdgeExtensionMode"
    if (this.asking === "mode") {
      return this.defaultMode === "trim"
        ? "enterTrimModeOption"
        : "enterExtendModeOption"
    }
    const selector = this.selector()
    if (selector) {
      const asked = selector.question()
      // `Select objects or [mOde] <select all>:` while the set is empty.
      return this.asking === "edges" &&
        asked === "selectObjects" &&
        (this.selection?.isEmpty() ?? true)
        ? { id: "selectObjectsOr", enter: "selectAll" }
        : asked
    }
    return this.fence || this.window ? this.boxPrompt() : this.objectQuestion()
  }

  /** mOde's `<Quick>`: the current mode, which Enter keeps. */
  defaultOption(): string | null {
    if (this.asking === "edge") {
      return this.mode.edgeExtend ? "Extend" : "Noextend"
    }
    if (this.asking !== "mode") return null
    return this.mode.standard ? "Standard" : "Quick"
  }

  /**
   * WHY these words: the console's second line names the words the prompt
   * declares but its last — Fence first, Project after mOde, Undo once
   * listed — of those built here (`Expects a point or Fence/cuTting
   * edges/Crossing/mOde`, EXTEND's `…/Crossing/mOde`: probes trim/p105,
   * p113, p135), and at Crossing's first corner every word declared but
   * Undo (`Fence/cuTting/Crossing/…`, p301, p302).
   */
  takes(): QuestionInput {
    if (this.asking === "mode" || this.asking === "edge") return "keyword"
    const selector = this.selector()
    if (selector) return selector.takes()
    if (this.fence) return { refusal: "invalidResponse" }
    if (this.window?.start) return { refusal: "invalidWindowSpecification" }
    const refusal = ["invalidSelection", "expectsPointOr"] as const
    if (this.window) {
      return {
        refusal,
        keywords: { ids: ["Fence", ...this.unfenced()], declared: true },
      }
    }
    const declared = [
      "Fence",
      ...this.unfenced().flatMap((id) =>
        id === "mOde" ? [id, "Project"] : [id]
      ),
      ...(this.answered ? ["Undo"] : []),
    ]
    const ids = declared.slice(0, -1).filter((id) => id !== "Project")
    return { refusal, keywords: { ids } }
  }

  /**
   * WHY: Crossing's first corner becomes LASTPOINT, its opposite one and a
   * fence's points do not (probes trim/p292, p299, p301).
   */
  setsLastPoint(): boolean | null {
    if (this.asking) return null
    if (this.window) return this.window.start === null
    return this.fence ? false : null
  }

  /**
   * WHY Crossing's first corner takes the prompt's words unlisted, Undo once
   * the object prompt lists it (probes trim/p301, p307).
   */
  commandOptions(): readonly CommandOption[] {
    if (this.asking === "mode") return [{ id: "Quick" }, { id: "Standard" }]
    if (this.asking === "edge") return [{ id: "Extend" }, { id: "Noextend" }]
    const selector = this.selector()
    if (selector) {
      // WHY mOde only as the command starts, listed while the set is empty
      // and refused once it is not (probes trim/p119, p152, p283–p285).
      if (this.asking !== "edges" || !this.starting || selector.inMode()) {
        return selector.commandOptions()
      }
      const mode: CommandOption =
        (this.selection?.isEmpty() ?? true)
          ? { id: "mOde" }
          : { id: "mOde", hidden: true }
      return [mode, ...selector.commandOptions()]
    }
    if (this.fence) {
      return !this.fence.typed || this.fence.points.length > 0
        ? [{ id: "Undo" }]
        : []
    }
    if (this.window) {
      if (this.window.start) return []
      return ["Fence", ...this.unfenced(), ...this.undoWord()].map((id) => ({
        id,
        hidden: true,
      }))
    }
    return [
      ...this.listed(),
      ...(this.mode.standard ? [] : [{ id: "Fence", hidden: true } as const]),
    ]
  }

  invokeOption(id: string, ctx: ToolContext): CommandOptionOutcome {
    if (this.asking === "mode") return this.chooseMode(id, ctx)
    if (this.asking === "edge") {
      if (id !== "Extend" && id !== "Noextend") return "unhandled"
      this.edgeBefore ??= this.mode.edgeExtend
      this.mode.edgeExtend = id === "Extend"
      this.asking = null
      this.answered = true
      ctx.requestRender()
      return "continue"
    }
    const selector = this.selector()
    if (selector) {
      if (id === "mOde" && this.asking === "edges") {
        // `*Invalid*` alone once the set holds something (p283, p389).
        if (!(this.selection?.isEmpty() ?? true)) {
          ctx.report(ctx.text.message("invalid"), "error")
          return "continue"
        }
        this.asking = "mode"
        this.modeFromEdges = true
        return "continue"
      }
      return selector.invokeOption(id, ctx) ? "continue" : "unhandled"
    }
    const fence = this.fence
    if (fence) {
      if (id !== "Undo") return "unhandled"
      // WHY the first point kept: the console asks again (probe trim/p297);
      // Fence's own drops its last point (p289).
      if (fence.typed) {
        this.fence = { ...fence, points: fence.points.slice(0, -1) }
        this.openFenceInput(ctx)
        ctx.requestRender()
      }
      return "continue"
    }
    if (this.window?.start) return "unhandled"
    switch (id) {
      case "Fence":
        this.window = null
        this.fence = { points: [], cursor: null, typed: true }
        this.preview = null
        this.openFenceInput(ctx)
        break
      case "Crossing":
        this.window = { start: null, cursor: null }
        this.preview = null
        this.openWindowInput(ctx)
        break
      case "eRase":
        if (!this.words().includes(id)) return "unhandled"
        this.window = null
        this.preview = null
        this.asking = "erase"
        ctx.dynamicInput.close()
        ctx.selection.clear()
        this.eraser.start()
        break
      case "cuTting":
      case "Boundary":
        if (!this.words().includes(id)) return "unhandled"
        this.window = null
        this.preview = null
        ctx.dynamicInput.close()
        // WHY the settings again: the console says them first (probe
        // trim/p152).
        this.reportSettings(ctx)
        this.askEdges(false, ctx)
        break
      case "mOde":
        this.window = null
        this.preview = null
        ctx.dynamicInput.close()
        this.asking = "mode"
        this.modeFromEdges = false
        break
      case "Edge":
        if (!this.words().includes(id)) return "unhandled"
        this.window = null
        this.preview = null
        ctx.dynamicInput.close()
        this.asking = "edge"
        break
      case "Undo":
        this.undoEdit(ctx)
        break
      default:
        return "unhandled"
    }
    ctx.requestRender()
    return "continue"
  }

  onDeactivate(ctx: ToolContext): void {
    this.preview = null
    this.lastInput = null
    if (this.fence || this.window || this.asking) ctx.dynamicInput.close()
    if (this.selector()) ctx.selection.clear()
    this.fence = null
    this.window = null
    this.asking = null
    this.edges = null
    this.selection = null
  }

  onPointerMove(input: PointerInput, ctx: ToolContext): void {
    if (this.asking) {
      this.selector()?.onPointerMove(input, ctx)
      return
    }
    if (this.fence || this.window) {
      if (this.fence) this.fence = { ...this.fence, cursor: input.point }
      if (this.window) this.window = { ...this.window, cursor: input.point }
      ctx.dynamicInput.setPosition(input.screen)
      ctx.requestRender()
      return
    }
    this.lastInput = snappedPick(input)
    this.preview = this.planFor(this.lastInput, ctx)
    ctx.requestRender()
  }

  /**
   * A point typed at the prompt picks there (probes trim/p240–p247), and on
   * nothing starts the fence, or Standard's window, as a click does (p248,
   * p308).
   */
  answerTyped(text: string, ctx: ToolContext): boolean {
    if (this.asking) return this.selector()?.answerTyped(text, ctx) ?? false
    if (this.fence || this.window) return false
    const point = typedPick(text, ctx)
    if (!point) return false
    this.onPointerDown(
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

  onPointerDown(input: PointerInput, ctx: ToolContext): void {
    if (this.asking) {
      this.selector()?.onPointerDown(input, ctx)
      ctx.requestRender()
      return
    }
    if (input.button !== 0) return
    if (this.fence) {
      this.fencePoint(input.point, ctx)
      return
    }
    if (this.window) {
      this.cornerPoint(input.point, ctx)
      return
    }
    // An override's point is the pick, and LASTPOINT (probe trim/p259).
    if (input.snap) ctx.setLastPoint(input.point)
    const pick = snappedPick(input)
    this.lastInput = pick
    this.answered = true
    this.enterSpent = true
    const plan = this.planFor(pick, ctx)
    if (!plan) {
      if (ctx.pick(pick.world)) this.refuseExtend(pick, ctx)
      else {
        // WHY said, then the fence: a locked object is no pick, and the
        // console says why (probe trim/p251).
        if (this.lockedAt(pick.world, ctx)) {
          ctx.report(ctx.text.message("onLockedLayer", { count: 1 }))
        }
        if (this.mode.standard) this.startWindow(pick.point, ctx)
        else this.startFence(pick.point, ctx)
      }
      ctx.requestRender()
      return
    }
    if (plan.kind === "refuse") {
      ctx.report(ctx.text.message(plan.message), "error")
      ctx.requestRender()
      return
    }
    this.pushStep(ctx)
    this.commit(plan, ctx)
    // Loop like AutoCAD: recompute the preview against the now-updated drawing
    // so a follow-up click continues trimming/extending from the same spot.
    this.preview = this.planFor(pick, ctx)
    ctx.requestRender()
  }

  onPointerUp(input: PointerInput, ctx: ToolContext): void {
    this.selector()?.onPointerUp(input, ctx)
  }

  cycleLasso(ctx: ToolContext): boolean {
    return this.selector()?.cycleLasso(ctx) ?? false
  }

  /**
   * Enter: Fence's ends it, whatever its points (probes trim/p290, p291),
   * and a window's opposite corner refuses it (p301); at the prompt it ends
   * the command, but Quick's first (`enterSpent`, p100, p118), as at
   * Crossing's first corner (p302), at a pick on nothing's fence and at
   * eRase's with nothing in its set (p111); at the edges' it takes every
   * object (p119), and at mOde's and Edge's it keeps the mode (p107, p161).
   */
  onEnter(ctx: ToolContext): boolean {
    if (this.asking === "edge") {
      this.asking = null
      this.answered = true
      return true
    }
    if (this.asking === "mode") {
      this.chooseMode(null, ctx)
      return true
    }
    if (
      this.asking === "edges" &&
      !this.edgeSelector.inMode() &&
      (this.selection?.isEmpty() ?? true)
    ) {
      this.asking = null
      this.edges = null
      this.enterSpent = true
      ctx.requestRender()
      return true
    }
    const selector = this.selector()
    if (selector) return selector.onEnter(ctx)
    if (this.fence?.typed) {
      this.editAcross(this.fence.points, false, ctx)
      return true
    }
    if (this.window?.start) {
      this.refuseCorner(ctx)
      return true
    }
    if (this.fence || this.window || this.mode.standard || this.enterSpent) {
      return false
    }
    this.enterSpent = true
    this.answered = true
    ctx.requestRender()
    return true
  }

  /**
   * WHY at the object prompt: a typed or chosen object snap picks there
   * (probes trim/p259–p263), its Perpendicular from LASTPOINT (p263); the
   * running snaps stay off ({@link wantsSnap}).
   */
  takesSnapOverride(): boolean {
    return this.asking === null && this.fence === null && this.window === null
  }

  snapsFromLastPoint(): boolean {
    return this.takesSnapOverride()
  }

  wantsSnap(): boolean {
    if (this.asking) return this.selector()?.wantsSnap() ?? false
    // Trim/Extend pick objects by proximity, not precise points — running snaps
    // would only clutter the hover, exactly as in AutoCAD. A fence's point and
    // a window's corner are points.
    return this.fence !== null || this.window !== null
  }

  buildOverlay(ctx: ToolContext): ScenePrimitive[] {
    if (this.asking) return this.selector()?.buildOverlay(ctx) ?? []
    if (this.fence) {
      const { points, cursor } = this.fence
      const through = cursor ? [...points, cursor] : points
      return through.length > 1 ? buildFenceOverlay(ctx.viewport, through) : []
    }
    if (this.window) {
      const { start, cursor } = this.window
      return start && cursor
        ? buildSelectionBoxOverlay(ctx.viewport, start, cursor, true)
        : []
    }
    const plan = this.preview
    if (!plan || plan.kind === "refuse") return []
    const { viewport } = ctx
    if (plan.kind === "erase") {
      return entityScenePrimitive(viewport, plan.target, {
        color: THEME.gripHot,
        width: 1.5,
        dash: [6, 4],
      })
    }
    const prim = (
      g: EditGeom,
      color: string,
      width: number,
      dash?: readonly number[]
    ): ScenePrimitive[] => {
      const stroke: StrokeStyle = { color, width, dash }
      if (g.kind === "line") {
        return [
          {
            kind: "segment",
            a: viewport.worldToScreen(g.start),
            b: viewport.worldToScreen(g.end),
            stroke,
          },
        ]
      }
      if (g.kind === "polyline" || g.kind === "ellipse") {
        // A reused id keeps preview frames from burning fresh entity ids.
        return entityScenePrimitive(
          viewport,
          geomToEntity(g, plan.layerId, plan.targetId),
          stroke
        )
      }
      return [
        arcScenePrimitive(
          viewport,
          g.center,
          g.radius,
          g.startAngle,
          g.endAngle,
          stroke
        ),
      ]
    }

    if (plan.kind === "trim") {
      return [
        ...plan.replacements.flatMap((g) => prim(g, THEME.entityHover, 2)),
        ...prim(plan.removed, THEME.gripHot, 1.5, [6, 4]),
      ]
    }
    return prim(plan.added, THEME.selected, 1.5, [6, 4])
  }

  /** A fence's or a window's point prompt. */
  private boxPrompt(): PromptId {
    if (this.fence) {
      return this.fence.points.length === 0
        ? "specifyFirstFencePoint"
        : "specifyNextFencePointOr"
    }
    return this.window?.start ? "specifyOppositeCorner" : "specifyFirstCorner"
  }

  private objectQuestion(): PromptId {
    return this.defaultMode === "trim"
      ? "selectObjectToTrimOrShiftSelectToExtendOr"
      : "selectObjectToExtendOrShiftSelectToTrimOr"
  }

  /**
   * The words of the object prompt built here, in AutoCAD's order: Fence
   * listed in Standard mode only.
   */
  private words(): readonly string[] {
    const fence = this.mode.standard ? ["Fence"] : []
    const edge = this.mode.standard ? ["Edge"] : []
    return this.defaultMode === "trim"
      ? ["cuTting", ...fence, "Crossing", "mOde", ...edge, "eRase"]
      : ["Boundary", ...fence, "Crossing", "mOde", ...edge]
  }

  private unfenced(): readonly string[] {
    return this.words().filter((id) => id !== "Fence")
  }

  private selector(): ObjectSelector | null {
    if (this.asking === "erase") return this.eraser
    return this.asking === "edges" ? this.edgeSelector : null
  }

  private reportSettings(ctx: ToolContext): void {
    ctx.report(
      ctx.text.message("trimExtendSettings", {
        mode: this.mode.standard ? "standard" : "quick",
        // WHY None in Quick mode: its edges never run on (probe trim/p146).
        edge: this.mode.standard && this.mode.edgeExtend ? "extend" : "none",
      })
    )
  }

  /** `Select cutting edges ...` (`Select boundary edges ...`) and the set. */
  private askEdges(starting: boolean, ctx: ToolContext, said = true): void {
    if (said) this.reportEdgesPrompt(ctx)
    this.asking = "edges"
    this.starting = starting
    ctx.selection.clear()
    this.edgeSelector.start()
  }

  private reportEdgesPrompt(ctx: ToolContext): void {
    ctx.report(
      ctx.text.message(
        this.defaultMode === "trim"
          ? "selectCuttingEdges"
          : "selectBoundaryEdges"
      )
    )
  }

  private takeEdges(ctx: ToolContext): void {
    this.edges = new Set(ctx.selection.toArray())
    ctx.selection.clear()
    this.asking = null
    this.enterSpent = true
    ctx.requestRender()
  }

  /**
   * mOde's answer, or Enter keeping it: the object prompt again, listing
   * Undo, or the edges' prompt it was asked at while Standard, which lists
   * nothing more (probes trim/p107, p136, p284).
   */
  private chooseMode(
    id: string | null,
    ctx: ToolContext
  ): CommandOptionOutcome {
    if (id !== null && id !== "Quick" && id !== "Standard") return "unhandled"
    if (id !== null) this.mode.standard = id === "Standard"
    if (!this.modeFromEdges) this.answered = true
    this.asking = this.modeFromEdges && this.mode.standard ? "edges" : null
    ctx.requestRender()
    return "continue"
  }

  private isEdge(id: EntityId): boolean {
    return this.edges === null || this.edges.has(id)
  }

  /** An edge's pieces are edges too (probe trim/p288). */
  private keepEdges(id: EntityId, added: readonly Entity[]): void {
    if (!this.edges?.has(id)) return
    for (const entity of added) this.edges.add(entity.id)
  }

  /** The words the object prompt lists. */
  private listed(): CommandOption[] {
    return [...this.words(), ...this.undoWord()].map((id) => ({ id }))
  }

  private undoWord(): readonly string[] {
    return this.answered ? ["Undo"] : []
  }

  /**
   * Undo takes back the last edit of this command and what followed it, a
   * transparent command too (probes trim/p115, p164); with none left it says
   * the command completely undone, the edge mode back and the trim mode kept,
   * and is listed no more (p135, p136, p381, p388). It spends Quick's first
   * Enter (p116, p158).
   */
  private undoEdit(ctx: ToolContext): void {
    // WHY the Edge choice after the edit too: the console's U takes both
    // back (p138).
    if (this.edgeBefore !== null) this.mode.edgeExtend = this.edgeBefore
    this.edgeBefore = null
    const step = this.steps.pop()
    if (step) ctx.undoTo(step.depth)
    if (step?.edgeExtend !== undefined) this.mode.edgeExtend = step.edgeExtend
    this.enterSpent = true
    if (this.steps.length === 0) {
      this.answered = false
      ctx.report(ctx.text.message("commandCompletelyUndone"))
    }
    if (!this.window) {
      this.preview = this.lastInput && this.planFor(this.lastInput, ctx)
    }
  }

  /**
   * eRase's set, erased as one Undo step of the command's, which asks its
   * object again (probes trim/p112, p153).
   */
  private eraseSet(ctx: ToolContext): void {
    this.pushStep(ctx)
    ctx.execute(new RemoveEntitiesCommand(ctx.selection.toArray()))
    ctx.selection.clear()
    this.asking = null
    ctx.requestRender()
  }

  /** An edit about to be executed, as Undo's step, the Edge choice joined. */
  private pushStep(ctx: ToolContext): void {
    const depth = ctx.historyDepth()
    const edge = this.edgeBefore
    this.steps.push(edge === null ? { depth } : { depth, edgeExtend: edge })
    this.edgeBefore = null
    this.answered = true
    this.enterSpent = true
  }

  /**
   * An object EXTEND reaches no edge with, said in the console's words: a
   * line whose other end would reach one `No edge in that direction.`
   * (probe trim/p143), else its type's (`extendRefusal`; p195, p204, p210).
   */
  private refuseExtend(input: PointerInput, ctx: ToolContext): void {
    const hit = this.pickFor(input, ctx)
    if (!hit || this.modeFor(input) !== "extend") return
    const message = extendRefusal(hit)
    if (!message) return
    const otherEnd =
      hit.type === "line" &&
      planExtendLine(
        hit,
        pointOnLine(hit, 1 - paramOnLine(hit, input.world)),
        this.boundsFor(hit, this.drawing(ctx))
      ) !== null
    ctx.report(
      ctx.text.message(otherEnd ? "noEdgeInThatDirection" : message),
      "error"
    )
  }

  /**
   * Standard mode's crossing window, a pick on nothing its first corner
   * (probes trim/p308, p309, p382).
   */
  private startWindow(start: Vec2, ctx: ToolContext): void {
    this.window = { start: null, cursor: null }
    this.preview = null
    this.cornerPoint(start, ctx)
  }

  private startFence(start: Vec2, ctx: ToolContext): void {
    this.fence = { points: [start], cursor: start, typed: false }
    this.preview = null
    this.openFenceInput(ctx)
    ctx.requestRender()
  }

  /** A fence's point: a pick on nothing's second closes it. */
  private fencePoint(point: Vec2, ctx: ToolContext): void {
    const fence = this.fence
    if (!fence) return
    const last = fence.points.at(-1)
    if (last && last.x === point.x && last.y === point.y) {
      ctx.report(ctx.text.message("polygonSegmentZeroLength"))
      return
    }
    const points = [...fence.points, point]
    if (!fence.typed) {
      this.editAcross(points, false, ctx)
      return
    }
    this.fence = { ...fence, points }
    this.openFenceInput(ctx)
    ctx.requestRender()
  }

  /**
   * The fence's point box: `@` and a number from the point before (probes
   * trim/p293, p299), the first's from LASTPOINT.
   */
  private openFenceInput(ctx: ToolContext): void {
    const last = this.fence?.points.at(-1)
    const from = last ? { ...last, z: ctx.elevation } : null
    ctx.dynamicInput.open({
      fields: [{ id: "point", prompt: this.boxPrompt(), kind: "coordinate" }],
      commit: () => {},
      commitRaw: (commitCtx) => {
        const point = typedPoint(commitCtx, from)
        if (!point) return false
        this.fencePoint(point, commitCtx)
        return true
      },
      directDistance: from ?? "lastPoint",
    })
  }

  /**
   * Crossing's corner box. Anything but a point at the opposite corner is
   * refused as AutoCAD refuses it there; at the first, as the prompt's
   * answer, whose words it takes.
   */
  private openWindowInput(ctx: ToolContext): void {
    const start = this.window?.start
    const from = start ? { ...start, z: ctx.elevation } : null
    ctx.dynamicInput.open({
      fields: [{ id: "point", prompt: this.boxPrompt(), kind: "coordinate" }],
      commit: () => {},
      commitRaw: (commitCtx) => {
        const point = typedPoint(commitCtx, from)
        if (point) this.cornerPoint(point, commitCtx)
        else if (
          !start ||
          commitCtx.dynamicInput.getText("point").trim() === ""
        )
          return false
        else this.refuseCorner(commitCtx)
        return true
      },
      directDistance: from ?? "lastPoint",
    })
  }

  private cornerPoint(point: Vec2, ctx: ToolContext): void {
    const start = this.window?.start
    if (!start) {
      // WHY before the prompt said again: it lists Undo (probe trim/p301).
      this.answered = true
      this.enterSpent = true
      this.window = { start: point, cursor: point }
      this.reportObjectPrompt(ctx)
      this.openWindowInput(ctx)
      ctx.requestRender()
      return
    }
    this.editAcross(clockwiseOutline(ctx.viewport, start, point), true, ctx)
  }

  /**
   * A wrong opposite corner: `Invalid window specification.`, and the
   * corner asked again after the object prompt, on its line.
   */
  private refuseCorner(ctx: ToolContext): void {
    ctx.report(ctx.text.message("invalidWindowSpecification"))
    this.reportObjectPrompt(ctx)
    this.openWindowInput(ctx)
  }

  /**
   * WHY the object prompt again: AutoCAD asks the opposite corner on it,
   * `…or [Crossing]: Specify opposite corner:` (probe trim/p301).
   */
  private reportObjectPrompt(ctx: ToolContext): void {
    ctx.report(
      ctx.text.prompt(
        this.objectQuestion(),
        this.listed().map((option) => option.id)
      ),
      "prompt"
    )
  }

  /**
   * A fence's edit, or Crossing's — its window's outline, walked clockwise
   * from its first corner as AutoCAD follows it, an object inside it left
   * alone (probes trim/p304–p306). At each place it meets an object, in its
   * order, the object as it now is is trimmed or extended as if picked
   * there, against the drawing as it now is (p294): EXTEND takes an object
   * at its first only and says `No edge in that direction.` at the next
   * (p295, p300), and an object refused is left alone at the rest. One Undo
   * step, and none where it changes nothing, Undo listed all the same
   * (p290, p303, p380, p381).
   */
  private editAcross(
    points: readonly Vec2[],
    window: boolean,
    ctx: ToolContext
  ): void {
    this.fence = null
    this.window = null
    this.answered = true
    this.enterSpent = true
    ctx.dynamicInput.close()
    const view = ctx.viewport
    const originals = this.drawing(ctx)
    const crossings = fenceCrossings(
      originals.map((entity) => entityScreenOutline(view, entity, ctx.blocks)),
      points.map((point) => view.worldToScreen(point))
    )
    if (window && crossings.length === 0) {
      ctx.report(ctx.text.message("noObjectsCrossedByCrossingWindow"))
      ctx.requestRender()
      return
    }
    let drawing = originals
    const pieces = new Map<EntityId, readonly EntityId[]>()
    const left = new Set<EntityId>()
    const near = view.screenToWorldDistance(2)
    for (const crossing of crossings) {
      const source = originals[crossing.outline].id
      if (left.has(source)) continue
      if (this.defaultMode === "extend" && pieces.has(source)) {
        ctx.report(ctx.text.message("noEdgeInThatDirection"), "error")
        left.add(source)
        continue
      }
      const at = view.screenToWorld(crossing.point)
      const target = nearestOf(
        drawing,
        pieces.get(source) ?? [source],
        at,
        near
      )
      if (!target) continue
      const plan = this.planOn(target, at, this.defaultMode, drawing)
      if (!plan || plan.kind === "refuse") {
        const message =
          plan?.kind === "refuse"
            ? plan.message
            : this.defaultMode === "extend"
              ? extendRefusal(target)
              : null
        if (message) ctx.report(ctx.text.message(message), "error")
        left.add(source)
        continue
      }
      const { id, added } = this.piecesOf(plan, target)
      this.keepEdges(id, added)
      drawing = [...drawing.filter((entity) => entity.id !== id), ...added]
      pieces.set(source, [
        ...(pieces.get(source) ?? [source]).filter((piece) => piece !== id),
        ...added.map((entity) => entity.id),
      ])
    }
    const ids = [...pieces.keys()]
    const kept = new Set([...pieces.values()].flat())
    if (ids.length > 0) {
      this.pushStep(ctx)
      ctx.execute(
        new ReplaceEntitiesCommand(
          ids,
          drawing.filter((entity) => kept.has(entity.id))
        )
      )
    }
    ctx.requestRender()
  }

  private modeFor(input: PointerInput): EdgeEditMode {
    if (!input.shiftKey) return this.defaultMode
    return this.defaultMode === "trim" ? "extend" : "trim"
  }

  /**
   * TRIM and EXTEND work in the UCS's XY plane: an object at an angle to it
   * is neither cut nor a boundary (AutoCAD would project some; PROJMODE).
   */
  private drawing(ctx: ToolContext): Entity[] {
    return ctx.document
      .getEntities()
      .filter((e) => ctx.document.isEntityVisible(e) && readsInPlan(e))
  }

  /** Whether an object on a locked layer lies under the pick box at `world`. */
  private lockedAt(world: Vec2, ctx: ToolContext): boolean {
    const { document } = ctx
    const tolerance = ctx.pickTolerance()
    return document
      .getEntities()
      .some(
        (entity) =>
          document.getLayer(entity.layerId)?.locked === true &&
          document.isEntityVisible(entity) &&
          distanceToEntity(entity, world, ctx.blocks) <= tolerance
      )
  }

  private pickFor(input: PointerInput, ctx: ToolContext): Entity | null {
    const hit = ctx.pick(input.world)
    return hit && readsInPlan(hit) ? hit : null
  }

  private planFor(input: PointerInput, ctx: ToolContext): EdgeEditPlan | null {
    const hit = this.pickFor(input, ctx)
    if (!hit) return null
    return this.planOn(hit, input.world, this.modeFor(input), this.drawing(ctx))
  }

  /** The edit of `hit` picked at `click`, the edges of `drawing` edges. */
  private planOn(
    hit: Entity,
    click: Vec2,
    mode: EdgeEditMode,
    drawing: readonly Entity[]
  ): EdgeEditPlan | null {
    const others = this.boundsFor(hit, drawing)
    if (mode === "extend") return planExtend(hit, click, others)
    const plan = planTrim(hit, click, others, this.isEdge(hit.id))
    if (plan || !TRIMMED.has(hit.type)) return plan
    // "In Quick mode, selecting an object that doesn't cross a boundary
    // deletes the object instead" — of those trimmed here; Standard says so
    // (probes trim/p383, p388).
    return this.mode.standard
      ? { kind: "refuse", message: "doesNotIntersectCuttingEdge" }
      : { kind: "erase", target: hit }
  }

  /**
   * What cuts or bounds `hit`: the edges of `drawing`, run on under Edge's
   * Extend.
   */
  private boundsFor(hit: Entity, drawing: readonly Entity[]): Entity[] {
    const edges = drawing.filter((e) => e.id !== hit.id && this.isEdge(e.id))
    return this.mode.standard && this.mode.edgeExtend
      ? edges.flatMap((edge) => prolonged(edge, reachOf(drawing)))
      : edges
  }

  private commit(
    plan: Exclude<EdgeEditPlan, { kind: "refuse" }>,
    ctx: ToolContext
  ): void {
    const target =
      plan.kind === "erase" ? plan.target : ctx.document.get(plan.targetId)
    if (!target) return
    const pieces = this.piecesOf(plan, target)
    this.keepEdges(pieces.id, pieces.added)
    if (pieces.added.length === 0) {
      ctx.execute(new RemoveEntitiesCommand([pieces.id]))
    } else if (pieces.added.length === 1) {
      ctx.execute(new UpdateEntityCommand(pieces.added[0]))
    } else {
      ctx.execute(new ReplaceEntitiesCommand([pieces.id], pieces.added))
    }
  }

  /** The object `target` an edit takes, and what it leaves in its place. */
  private piecesOf(
    plan: Exclude<EdgeEditPlan, { kind: "refuse" }>,
    target: Entity
  ): { readonly id: EntityId; readonly added: readonly Entity[] } {
    if (plan.kind === "erase") return { id: target.id, added: [] }
    const geoms = plan.kind === "extend" ? [plan.result] : plan.replacements
    // A mid-object cut splits it in two: the piece from its start, listed
    // first, is the object kept (its handle), the other a new one, which
    // Last then finds — AutoCAD 2023's console (acc/hd1–hd7, hd20).
    return {
      id: target.id,
      added: geoms.map((g, i) =>
        carryPiece(
          target,
          geomToEntity(g, plan.layerId, i === 0 ? target.id : undefined)
        )
      ),
    }
  }
}

/** A pick where an object snap override found its point: there. */
function snappedPick(input: PointerInput): PointerInput {
  return input.snap ? { ...input, world: input.point } : input
}

/**
 * EDGEMODE's Extend: an edge as it would run on — a line both ways, an arc
 * and an elliptical arc round their whole curve, an open polyline on from
 * its ends along its end segments (AutoCAD 2023's console, acc/eg1, eg5,
 * eg7, eh2–eh5; an arc end segment round its circle, **unverified**) —,
 * `reach` past its ends.
 */
function prolonged(edge: Entity, reach: number): Entity[] {
  const ray = (from: Vec2, away: Vec2): Entity[] =>
    V.length(away) === 0
      ? []
      : [
          createLine(
            from,
            V.add(from, V.scale(V.normalize(away), reach)),
            edge.layerId,
            edge.id
          ),
        ]
  switch (edge.type) {
    case "line": {
      const along = V.normalize(V.sub(edge.end, edge.start))
      return [
        createLine(
          V.sub(edge.start, V.scale(along, reach)),
          V.add(edge.end, V.scale(along, reach)),
          edge.layerId,
          edge.id
        ),
      ]
    }
    case "arc":
      return [createCircle(edge.center, edge.radius, edge.layerId, edge.id)]
    case "ellipse":
      return [
        createEllipse(edge.center, edge.majorAxis, edge.ratio, {
          layerId: edge.layerId,
          id: edge.id,
        }),
      ]
    case "polyline": {
      const segments = polylineSegmentGeometries(edge)
      const first = segments[0]
      const last = segments.at(-1)
      if (edge.closed || !first || !last) return [edge]
      const end = (g: PolylineSegmentGeometry, start: boolean): Entity[] =>
        g.kind === "arc"
          ? [createCircle(g.center, g.radius, edge.layerId, edge.id)]
          : start
            ? ray(g.a, V.sub(g.a, g.b))
            : ray(g.b, V.sub(g.b, g.a))
      return [edge, ...end(first, true), ...end(last, false)]
    }
    case "circle":
    case "spline":
    case "text":
    case "mtext":
    case "attdef":
    case "dimension":
    case "hatch":
    case "insert":
      return [edge]
    default: {
      const unhandled: never = edge
      return unhandled
    }
  }
}

/** How far past the drawing an edge runs on: across all of it. */
function reachOf(drawing: readonly Entity[]): number {
  const bounds = entitiesBounds(drawing)
  return bounds ? V.distance(bounds.min, bounds.max) + 1 : 1
}

/** A point typed in a fence's or a window's box, from `from` or LASTPOINT. */
function typedPoint(ctx: ToolContext, from: Vec3 | null): Vec2 | null {
  const text = ctx.dynamicInput.getText("point").trim()
  const point = isCoordinateExpression(text)
    ? parseCoordinate(text, {
        lastPoint: from ?? ctx.lastPoint,
        relativeByDefault: false,
        ucs: ctx.ucs,
        elevation: ctx.elevation,
      })
    : null
  return point && { x: point.x, y: point.y }
}

/**
 * The window from `start` to `end` as a closed fence, clockwise on screen
 * from `start`: "TRIM follows the rectangular crossing window boundary
 * clockwise from the first point" (AutoCAD's help).
 */
function clockwiseOutline(view: Viewport, start: Vec2, end: Vec2): Vec2[] {
  const a = view.worldToScreen(start)
  const c = view.worldToScreen(end)
  // Screen Y grows downwards: along the top rightwards, down the right side.
  const across = (c.x - a.x) * (c.y - a.y) > 0
  const corners = across
    ? [a, { x: c.x, y: a.y }, c, { x: a.x, y: c.y }, a]
    : [a, { x: a.x, y: c.y }, c, { x: c.x, y: a.y }, a]
  return corners.map((p) => view.screenToWorld(p))
}

/** Of the objects `ids` in `drawing`, the one nearest `at` within `near`. */
function nearestOf(
  drawing: readonly Entity[],
  ids: readonly EntityId[],
  at: Vec2,
  near: number
): Entity | null {
  let nearest: Entity | null = null
  let distance = near
  for (const entity of drawing) {
    if (!ids.includes(entity.id)) continue
    const d = distanceToEntity(entity, at)
    if (d <= distance) {
      nearest = entity
      distance = d
    }
  }
  return nearest
}

/** What `planTrim` cuts, and so what Quick mode deletes when nothing cuts it. */
const TRIMMED: ReadonlySet<Entity["type"]> = new Set([
  "line",
  "circle",
  "arc",
  "polyline",
  "ellipse",
])

const PARAM_EPS = 1e-6
const ANGLE_EPS = 1e-6
const TWO_PI = Math.PI * 2

function geomToEntity(g: EditGeom, layerId: LayerId, id?: EntityId): Entity {
  switch (g.kind) {
    case "line":
      return createLine(g.start, g.end, layerId, id)
    case "arc":
      return createArc(
        g.center,
        g.radius,
        g.startAngle,
        g.endAngle,
        layerId,
        id
      )
    case "polyline":
      return createPolyline(
        g.vertices,
        g.closed,
        layerId,
        g.bulges,
        id,
        g.widths
      )
    case "ellipse":
      return createEllipse(g.center, g.majorAxis, g.ratio, {
        startParam: g.startParam,
        endParam: g.endParam,
        layerId,
        id,
      })
  }
}

/** `own`: whether `target` is an edge, which cuts a polyline at its own vertices. */
function planTrim(
  target: Entity,
  click: Vec2,
  others: readonly Entity[],
  own: boolean
): EdgeEditPlan | null {
  switch (target.type) {
    case "line":
      return planTrimLine(target, click, others)
    case "circle":
      return planTrimCircle(target, click, others)
    case "arc":
      return planTrimArc(target, click, others)
    case "polyline":
      return own
        ? planTrimPolyline(target, click, others)
        : planTrimPolylinePath(target, click, others)
    case "ellipse":
      return planTrimEllipse(target, click, others)
    case "spline":
      return planTrimSpline(target, others)
    case "text":
    case "mtext":
    case "attdef":
      return null // annotation, not an outline to cut
    case "dimension":
    case "hatch":
    case "insert":
      return null
  }
}

/**
 * Why EXTEND leaves `target` as it is, in the console's words: a line or an
 * arc `Path does not intersect with the bounding edge.`, an open polyline's
 * end `Object does not intersect an edge.`, a closed polyline and a circle
 * `Cannot EXTEND this object.`, a dimension the path's; an elliptical arc as
 * an open polyline's end, a whole ellipse and a closed spline as a closed
 * polyline. `null` where the console extends what is not built here (an
 * open spline) or was not asked.
 */
function extendRefusal(target: Entity): MessageId | null {
  switch (target.type) {
    case "line":
    case "arc":
      return "pathDoesNotIntersectBoundingEdge"
    case "polyline":
      return target.closed ? "cannotExtendObject" : "objectDoesNotIntersectEdge"
    case "circle":
      return "cannotExtendObject"
    case "ellipse":
      return isFullEllipse(target)
        ? "cannotExtendObject"
        : "objectDoesNotIntersectEdge"
    case "spline":
      return target.closed ? "cannotExtendObject" : null
    case "dimension":
      return "pathDoesNotIntersectBoundingEdge"
    case "text":
    case "mtext":
    case "attdef":
    case "hatch":
    case "insert":
      return null
    default: {
      const unhandled: never = target
      return unhandled
    }
  }
}

function planExtend(
  target: Entity,
  click: Vec2,
  others: readonly Entity[]
): EdgeEditPlan | null {
  switch (target.type) {
    case "line":
      return planExtendLine(target, click, others)
    case "arc":
      return planExtendArc(target, click, others)
    case "circle":
      return null // a closed circle has no endpoint to extend
    case "polyline":
      return planExtendPolyline(target, click, others)
    case "ellipse":
      return planExtendEllipse(target, click, others)
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

// --- Line target ------------------------------------------------------------

function paramOnLine(line: LineEntity, p: Vec2): number {
  const dir = V.sub(line.end, line.start)
  const lenSq = V.lengthSq(dir)
  if (lenSq === 0) return 0
  return V.dot(V.sub(p, line.start), dir) / lenSq
}

function pointOnLine(line: LineEntity, t: number): Vec2 {
  return V.add(line.start, V.scale(V.sub(line.end, line.start), t))
}

/**
 * Parameters (0..1 along the line) where `line` is genuinely crossed *within*
 * its own extent by another entity — the trim breakpoints.
 */
function trimCrossParams(
  line: LineEntity,
  others: readonly Entity[]
): number[] {
  const out: number[] = []
  for (const o of others) {
    if (o.type === "line") {
      const x = infiniteLineIntersection(line.start, line.end, o.start, o.end)
      if (
        x &&
        x.t > PARAM_EPS &&
        x.t < 1 - PARAM_EPS &&
        x.u >= -PARAM_EPS &&
        x.u <= 1 + PARAM_EPS
      ) {
        out.push(x.t)
      }
    } else if (o.type === "circle") {
      for (const p of segmentCircleIntersection(
        line.start,
        line.end,
        o.center,
        o.radius
      )) {
        const t = paramOnLine(line, p)
        if (t > PARAM_EPS && t < 1 - PARAM_EPS) out.push(t)
      }
    } else if (o.type === "arc") {
      for (const p of segmentArcIntersection(
        line.start,
        line.end,
        o.center,
        o.radius,
        o.startAngle,
        o.endAngle
      )) {
        const t = paramOnLine(line, p)
        if (t > PARAM_EPS && t < 1 - PARAM_EPS) out.push(t)
      }
    } else if (o.type === "polyline") {
      for (const [a, b] of polylineSegments(o)) {
        const x = infiniteLineIntersection(line.start, line.end, a, b)
        if (
          x &&
          x.t > PARAM_EPS &&
          x.t < 1 - PARAM_EPS &&
          x.u >= -PARAM_EPS &&
          x.u <= 1 + PARAM_EPS
        ) {
          out.push(x.t)
        }
      }
    } else if (o.type === "ellipse" || o.type === "spline") {
      for (const t of lineCurveParams(line, o)) {
        if (t > PARAM_EPS && t < 1 - PARAM_EPS) out.push(t)
      }
    }
  }
  return dedupeSorted(out)
}

/**
 * Parameters along the infinite line through `line` where an ellipse or a
 * spline crosses it, within the curve's extent.
 */
function lineCurveParams(
  line: LineEntity,
  curve: EllipseEntity | SplineEntity
): number[] {
  const d = V.sub(line.end, line.start)
  if (V.lengthSq(d) === 0) return []
  return curveCrossings(curve, (p) => V.cross(d, V.sub(p, line.start))).map(
    (p) => paramOnLine(line, p)
  )
}

/**
 * Parameters (t along the *infinite* line, unbounded) where `line`, extended,
 * meets another entity *within that entity's extent* — the extend boundaries.
 */
function extendCrossParams(
  line: LineEntity,
  others: readonly Entity[]
): number[] {
  const out: number[] = []
  for (const o of others) {
    if (o.type === "line") {
      const x = infiniteLineIntersection(line.start, line.end, o.start, o.end)
      if (x && x.u >= -PARAM_EPS && x.u <= 1 + PARAM_EPS) out.push(x.t)
    } else if (o.type === "circle") {
      for (const t of lineCircleIntersectionParams(
        line.start,
        line.end,
        o.center,
        o.radius
      )) {
        out.push(t)
      }
    } else if (o.type === "arc") {
      for (const t of lineCircleIntersectionParams(
        line.start,
        line.end,
        o.center,
        o.radius
      )) {
        const p = pointOnLine(line, t)
        const angle = Math.atan2(p.y - o.center.y, p.x - o.center.x)
        if (angleWithinSweep(o.startAngle, o.endAngle, angle)) out.push(t)
      }
    } else if (o.type === "polyline") {
      for (const [a, b] of polylineSegments(o)) {
        const x = infiniteLineIntersection(line.start, line.end, a, b)
        if (x && x.u >= -PARAM_EPS && x.u <= 1 + PARAM_EPS) out.push(x.t)
      }
    } else if (o.type === "ellipse" || o.type === "spline") {
      out.push(...lineCurveParams(line, o))
    }
  }
  return out
}

function planTrimLine(
  line: LineEntity,
  click: Vec2,
  others: readonly Entity[]
): EdgeEditPlan | null {
  const tc = Math.max(0, Math.min(1, paramOnLine(line, click)))
  // WHY a crossing at the pick bounds nothing: Intersection's point picks
  // there, and the console cuts back to the crossings either side of it
  // (probe trim/p261).
  const crossings = trimCrossParams(line, others).filter(
    (t) => Math.abs(t - tc) > PARAM_EPS
  )
  if (crossings.length === 0) return null

  const bounds = [0, ...crossings, 1]
  let i = 0
  while (i < bounds.length - 1 && !(tc >= bounds[i] && tc <= bounds[i + 1])) i++
  const ta = bounds[i]
  const tb = bounds[i + 1]
  if (ta === 0 && tb === 1) return null // no crossing brackets the click

  const pa = pointOnLine(line, ta)
  const pb = pointOnLine(line, tb)
  const base = {
    kind: "trim" as const,
    targetId: line.id,
    layerId: line.layerId,
  }

  if (ta === 0) {
    return {
      ...base,
      replacements: [{ kind: "line", start: pb, end: line.end }],
      removed: { kind: "line", start: line.start, end: pb },
    }
  }
  if (tb === 1) {
    return {
      ...base,
      replacements: [{ kind: "line", start: line.start, end: pa }],
      removed: { kind: "line", start: pa, end: line.end },
    }
  }
  return {
    ...base,
    replacements: [
      { kind: "line", start: line.start, end: pa },
      { kind: "line", start: pb, end: line.end },
    ],
    removed: { kind: "line", start: pa, end: pb },
  }
}

function planExtendLine(
  line: LineEntity,
  click: Vec2,
  others: readonly Entity[]
): EdgeEditPlan | null {
  const crossings = extendCrossParams(line, others)
  if (crossings.length === 0) return null

  const base = {
    kind: "extend" as const,
    targetId: line.id,
    layerId: line.layerId,
  }
  // The half you click on decides which endpoint grows.
  if (paramOnLine(line, click) < 0.5) {
    const candidates = crossings.filter((t) => t < -PARAM_EPS)
    if (candidates.length === 0) return null
    const t = Math.max(...candidates) // nearest boundary past the start
    const p = pointOnLine(line, t)
    return {
      ...base,
      result: { kind: "line", start: p, end: line.end },
      added: { kind: "line", start: line.start, end: p },
    }
  }
  const candidates = crossings.filter((t) => t > 1 + PARAM_EPS)
  if (candidates.length === 0) return null
  const t = Math.min(...candidates) // nearest boundary past the end
  const p = pointOnLine(line, t)
  return {
    ...base,
    result: { kind: "line", start: line.start, end: p },
    added: { kind: "line", start: line.end, end: p },
  }
}

// --- Circle / arc targets ---------------------------------------------------

/**
 * Intersection points between a target circle and an edge entity, respecting
 * the edge's own extent (segment for lines, sweep for arcs).
 */
function circleEdgeCrossPoints(
  center: Vec2,
  radius: number,
  o: Entity
): Vec2[] {
  switch (o.type) {
    case "line":
      return segmentCircleIntersection(o.start, o.end, center, radius)
    case "circle":
      return circleCircleIntersection(center, radius, o.center, o.radius)
    case "arc":
      return circleCircleIntersection(
        center,
        radius,
        o.center,
        o.radius
      ).filter((p) =>
        angleWithinSweep(
          o.startAngle,
          o.endAngle,
          Math.atan2(p.y - o.center.y, p.x - o.center.x)
        )
      )
    case "polyline": {
      const points: Vec2[] = []
      for (const [a, b] of polylineSegments(o)) {
        points.push(...segmentCircleIntersection(a, b, center, radius))
      }
      return points
    }
    case "ellipse":
    case "spline":
      return curveCrossings(o, (p) => V.distance(p, center) - radius)
    case "text":
    case "mtext":
    case "attdef":
    case "dimension":
    case "hatch":
    case "insert":
      return []
  }
}

function angleAt(center: Vec2, p: Vec2): number {
  return normalizeAngle(Math.atan2(p.y - center.y, p.x - center.x))
}

/**
 * Normalised, deduped angles (radians, `[0, 2π)`) where visible entities cross
 * the circle of `center`/`radius`.
 */
function circleCrossAngles(
  center: Vec2,
  radius: number,
  others: readonly Entity[]
): number[] {
  const angles: number[] = []
  for (const o of others) {
    for (const p of circleEdgeCrossPoints(center, radius, o)) {
      angles.push(angleAt(center, p))
    }
  }
  return dedupeAngles(angles)
}

function planTrimCircle(
  circle: CircleEntity,
  click: Vec2,
  others: readonly Entity[]
): EdgeEditPlan | null {
  const angles = circleCrossAngles(circle.center, circle.radius, others)
  if (angles.length === 0) return null
  // AutoCAD 2023's console (acc/o1): cut once, a circle is left as it is.
  if (angles.length === 1) {
    return { kind: "refuse", message: "circleMustIntersectTwice" }
  }

  const clickAngle = angleAt(circle.center, click)
  // Find the CCW segment [θa, θb] the click falls in; the last→first segment
  // wraps across 0/2π and is the default when the click is in that gap.
  let thetaA = angles[angles.length - 1]
  let thetaB = angles[0]
  for (let i = 0; i < angles.length - 1; i++) {
    if (
      clickAngle >= angles[i] - ANGLE_EPS &&
      clickAngle <= angles[i + 1] + ANGLE_EPS
    ) {
      thetaA = angles[i]
      thetaB = angles[i + 1]
      break
    }
  }

  const arc = (startAngle: number, endAngle: number): EditGeom => ({
    kind: "arc",
    center: circle.center,
    radius: circle.radius,
    startAngle,
    endAngle,
  })
  // Removing the clicked arc [θa, θb] leaves the complementary arc [θb, θa].
  return {
    kind: "trim",
    targetId: circle.id,
    layerId: circle.layerId,
    replacements: [arc(thetaB, thetaA)],
    removed: arc(thetaA, thetaB),
  }
}

function planTrimArc(
  arc: ArcEntity,
  click: Vec2,
  others: readonly Entity[]
): EdgeEditPlan | null {
  const sweep = arcSweepAngle(arc)
  const offsets = dedupeSorted(
    circleCrossAngles(arc.center, arc.radius, others)
      .map((a) => normalizeAngle(a - arc.startAngle))
      .filter((o) => o > ANGLE_EPS && o < sweep - ANGLE_EPS)
  )
  if (offsets.length === 0) return null

  const clickOffset = Math.max(
    0,
    Math.min(sweep, normalizeAngle(angleAt(arc.center, click) - arc.startAngle))
  )
  const bounds = [0, ...offsets, sweep]
  let i = 0
  while (
    i < bounds.length - 1 &&
    !(clickOffset >= bounds[i] && clickOffset <= bounds[i + 1])
  ) {
    i++
  }
  const oa = bounds[i]
  const ob = bounds[i + 1]
  if (oa === 0 && ob === sweep) return null

  const thetaA = arc.startAngle + oa
  const thetaB = arc.startAngle + ob
  const piece = (startAngle: number, endAngle: number): EditGeom => ({
    kind: "arc",
    center: arc.center,
    radius: arc.radius,
    startAngle,
    endAngle,
  })
  const base = {
    kind: "trim" as const,
    targetId: arc.id,
    layerId: arc.layerId,
  }

  if (oa === 0) {
    return {
      ...base,
      replacements: [piece(thetaB, arc.endAngle)],
      removed: piece(arc.startAngle, thetaB),
    }
  }
  if (ob === sweep) {
    return {
      ...base,
      replacements: [piece(arc.startAngle, thetaA)],
      removed: piece(thetaA, arc.endAngle),
    }
  }
  return {
    ...base,
    replacements: [piece(arc.startAngle, thetaA), piece(thetaB, arc.endAngle)],
    removed: piece(thetaA, thetaB),
  }
}

function planExtendArc(
  arc: ArcEntity,
  click: Vec2,
  others: readonly Entity[]
): EdgeEditPlan | null {
  const sweep = arcSweepAngle(arc)
  // Candidate boundaries lie on the circle but *outside* the current sweep.
  const outside = circleCrossAngles(arc.center, arc.radius, others).filter(
    (a) => {
      const off = normalizeAngle(a - arc.startAngle)
      return off > sweep + ANGLE_EPS && off < TWO_PI - ANGLE_EPS
    }
  )
  if (outside.length === 0) return null

  const startPt = polarPoint(arc.center, arc.radius, arc.startAngle)
  const endPt = polarPoint(arc.center, arc.radius, arc.endAngle)
  const extendEnd = V.distance(click, endPt) <= V.distance(click, startPt)

  const piece = (startAngle: number, endAngle: number): EditGeom => ({
    kind: "arc",
    center: arc.center,
    radius: arc.radius,
    startAngle,
    endAngle,
  })
  const base = {
    kind: "extend" as const,
    targetId: arc.id,
    layerId: arc.layerId,
  }

  if (extendEnd) {
    // Grow CCW past the end angle to the nearest boundary.
    const best = nearestAngle(outside, (a) => normalizeAngle(a - arc.endAngle))
    if (best === null) return null
    return {
      ...base,
      result: piece(arc.startAngle, best),
      added: piece(arc.endAngle, best),
    }
  }
  // Grow CW past the start angle to the nearest boundary.
  const best = nearestAngle(outside, (a) => normalizeAngle(arc.startAngle - a))
  if (best === null) return null
  return {
    ...base,
    result: piece(best, arc.endAngle),
    added: piece(best, arc.startAngle),
  }
}

// --- Ellipse targets --------------------------------------------------------

/**
 * Parameters (normalised, deduped) where the edges cross the whole ellipse
 * of `ellipse`, each within its own extent: round the ellipse, the sign
 * changes of each edge's implicit function — but along a spline edge,
 * which has none, those of the ellipse's own.
 */
function ellipseCrossParams(
  ellipse: EllipseEntity,
  others: readonly Entity[]
): number[] {
  const whole = createEllipse(
    ellipse.center,
    ellipse.majorAxis,
    ellipse.ratio,
    {
      id: ellipse.id,
    }
  )
  const round = parametricCurve(whole)
  const own = ellipseImplicit(whole).f
  const params: number[] = []
  for (const o of others) {
    if (o.type === "spline") {
      for (const p of curveCrossings(o, own)) {
        params.push(ellipseParamOf(ellipse, p))
      }
      continue
    }
    for (const edge of implicitEdges(o)) {
      params.push(...crossingParams(round, edge))
    }
  }
  return dedupeAngles(params.map(normalizeAngle))
}

function ellipsePiece(
  ellipse: EllipseEntity,
  startParam: number,
  endParam: number
): EditGeom {
  return {
    kind: "ellipse",
    center: ellipse.center,
    majorAxis: ellipse.majorAxis,
    ratio: ellipse.ratio,
    startParam,
    endParam,
  }
}

/**
 * Trims an ellipse as a circle (two crossings bound the removed piece, the
 * rest is left as an elliptical arc) and an elliptical arc as an arc, in the
 * ellipse's parameter. Cut once, a whole ellipse is refused, as AutoCAD 2023's
 * console refuses it (acc/o4).
 */
function planTrimEllipse(
  ellipse: EllipseEntity,
  click: Vec2,
  others: readonly Entity[]
): EdgeEditPlan | null {
  const crossings = ellipseCrossParams(ellipse, others)
  const { start, sweep } = ellipseSweepParams(ellipse)
  const base = {
    kind: "trim" as const,
    targetId: ellipse.id,
    layerId: ellipse.layerId,
  }
  const clickOffset = ellipseParamAt(ellipse, click)
  const cut = (from: number, to: number): EdgeEditPlan => {
    const { kept, removed } = ellipseCut(ellipse, from, to)
    return {
      ...base,
      replacements: kept.map((piece) =>
        ellipsePiece(ellipse, piece.startParam, piece.endParam)
      ),
      removed: ellipsePiece(ellipse, removed.startParam, removed.endParam),
    }
  }

  if (isFullEllipse(ellipse)) {
    if (crossings.length === 0) return null
    if (crossings.length === 1) {
      return { kind: "refuse", message: "curveMustIntersectTwice" }
    }
    let ta = crossings[crossings.length - 1]
    let tb = crossings[0]
    for (let i = 0; i < crossings.length - 1; i++) {
      if (clickOffset >= crossings[i] && clickOffset <= crossings[i + 1]) {
        ta = crossings[i]
        tb = crossings[i + 1]
        break
      }
    }
    return cut(ta, ta + normalizeAngle(tb - ta))
  }

  const offsets = dedupeSorted(
    crossings
      .map((t) => normalizeAngle(t - start))
      .filter((o) => o > ANGLE_EPS && o < sweep - ANGLE_EPS)
  )
  if (offsets.length === 0) return null
  const bounds = [0, ...offsets, sweep]
  let i = 0
  while (
    i < bounds.length - 1 &&
    !(clickOffset >= bounds[i] && clickOffset <= bounds[i + 1])
  ) {
    i++
  }
  return cut(bounds[i], bounds[i + 1])
}

/**
 * Extends an elliptical arc round its ellipse to the nearest edge past the
 * end that grows: the one the pick lies nearer in the ellipse's parameter, as
 * AutoCAD 2023's console decides it (acc/m1–m4) — not along the curve, nor in
 * a straight line.
 */
function planExtendEllipse(
  ellipse: EllipseEntity,
  click: Vec2,
  others: readonly Entity[]
): EdgeEditPlan | null {
  if (isFullEllipse(ellipse)) return null
  const { start, sweep } = ellipseSweepParams(ellipse)
  const end = start + sweep
  const outside = ellipseCrossParams(ellipse, others).filter((t) => {
    const off = normalizeAngle(t - start)
    return off > sweep + ANGLE_EPS && off < TWO_PI - ANGLE_EPS
  })
  if (outside.length === 0) return null
  const base = {
    kind: "extend" as const,
    targetId: ellipse.id,
    layerId: ellipse.layerId,
  }
  if (ellipseParamAt(ellipse, click) < sweep / 2) {
    const best = nearestAngle(outside, (t) => normalizeAngle(start - t))
    if (best === null) return null
    return {
      ...base,
      result: ellipsePiece(ellipse, best, end),
      added: ellipsePiece(ellipse, best, start),
    }
  }
  const best = nearestAngle(outside, (t) => normalizeAngle(t - end))
  if (best === null) return null
  return {
    ...base,
    result: ellipsePiece(ellipse, start, best),
    added: ellipsePiece(ellipse, end, best),
  }
}

// --- Spline target ----------------------------------------------------------

/**
 * A spline is only deleted or refused here: trimmed, AutoCAD 2023's console
 * leaves its piece on control points and knots of its own (acc/t2, p12),
 * which a spline here — fit points or control vertices on uniform knots —
 * cannot hold, so a spline an edge cuts stays as it is.
 */
function planTrimSpline(
  spline: SplineEntity,
  others: readonly Entity[]
): EdgeEditPlan | null {
  const curve = parametricCurve(spline)
  const params: number[] = []
  for (const o of others) {
    for (const edge of implicitEdges(o)) {
      params.push(...crossingParams(curve, edge))
    }
  }
  const crossings = dedupeSorted(params).length
  if (crossings === 0) return { kind: "erase", target: spline }
  // acc/o3: cut once, a closed one is refused as a whole ellipse is.
  if (spline.closed && crossings === 1) {
    return { kind: "refuse", message: "curveMustIntersectTwice" }
  }
  return null
}

// --- Polyline target --------------------------------------------------------

/** Index of the polyline segment nearest the click (matches `polylineSegmentGeometries`). */
/**
 * The polyline's other segments, which cut the picked one as any edge does:
 * Quick mode makes every object an edge, the polyline too, so AutoCAD 2023's
 * console trims a segment back to its own vertices and to where the polyline
 * crosses itself (acc/tp1, tq1, tq5, tr4), and deletes only a polyline of one
 * segment nothing crosses (tr1).
 */
function ownEdges(poly: PolylineEntity, si: number): Entity[] {
  return polylineSegmentGeometries(poly).flatMap((g, j): Entity[] => {
    if (j === si) return []
    return g.kind === "line"
      ? [createLine(g.a, g.b, poly.layerId, poly.id)]
      : [
          createArc(
            g.center,
            g.radius,
            g.startAngle,
            g.endAngle,
            poly.layerId,
            poly.id
          ),
        ]
  })
}

/**
 * Trims the clicked segment of a polyline (arc segments are handled by
 * {@link planTrimPolylineArc}) between its vertices and the crossings on it.
 * A cut that reaches a free end of the chain merely shortens it (one polyline
 * survives); a mid-chain cut breaks it in two; trimming any segment of a
 * closed polyline opens it into a single chain, from the cut's far end round
 * to its near one. Other segments (including arc bulges) are preserved.
 */
function planTrimPolyline(
  poly: PolylineEntity,
  click: Vec2,
  others: readonly Entity[]
): EdgeEditPlan | null {
  const si = nearestPolylineSegment(poly, click)
  const segments = polylineSegments(poly)
  const [a, b] = segments[si]
  const geom = polylineSegmentGeometries(poly)[si]
  if (geom.kind === "arc")
    return planTrimPolylineArc(poly, si, geom, click, others)

  const line = createLine(a, b)
  const crossings = trimCrossParams(line, [...others, ...ownEdges(poly, si)])

  const tc = Math.max(0, Math.min(1, paramOnLine(line, click)))
  const bounds = [0, ...crossings, 1]
  let i = 0
  while (i < bounds.length - 1 && !(tc >= bounds[i] && tc <= bounds[i + 1])) i++
  const ta = bounds[i]
  const tb = bounds[i + 1]

  const replacements = trimPolylinePieces(poly, si, ta, tb)
  if (replacements.length === 0) return null

  return {
    kind: "trim",
    targetId: poly.id,
    layerId: poly.layerId,
    replacements,
    removed: {
      kind: "line",
      start: pointOnLine(line, ta),
      end: pointOnLine(line, tb),
    },
  }
}

type ArcSegment = Extract<PolylineSegmentGeometry, { kind: "arc" }>

/** An arc `EditGeom` between two segment fractions, in the CCW arc convention. */
function subArcGeom(
  center: Vec2,
  radius: number,
  angA: number,
  phi: number,
  f1: number,
  f2: number
): EditGeom {
  const a1 = angA + f1 * phi
  const a2 = angA + f2 * phi
  return phi >= 0
    ? { kind: "arc", center, radius, startAngle: a1, endAngle: a2 }
    : { kind: "arc", center, radius, startAngle: a2, endAngle: a1 }
}

/**
 * Fractions along an arc segment (0 at its start vertex, 1 at its end) where
 * other visible entities cross it — the trim breakpoints in sweep space.
 */
function arcSegmentCrossFractions(
  seg: ArcSegment,
  others: readonly Entity[]
): number[] {
  const phi = 4 * Math.atan(seg.bulge)
  const angA = Math.atan2(seg.a.y - seg.center.y, seg.a.x - seg.center.x)
  const absPhi = Math.abs(phi)
  const sign = Math.sign(phi)
  const out: number[] = []
  for (const o of others) {
    for (const p of circleEdgeCrossPoints(seg.center, seg.radius, o)) {
      const angP = Math.atan2(p.y - seg.center.y, p.x - seg.center.x)
      const f = normalizeAngle((angP - angA) * sign) / absPhi
      if (f > PARAM_EPS && f < 1 - PARAM_EPS) out.push(f)
    }
  }
  return dedupeSorted(out)
}

/**
 * Trims the clicked *arc* segment of a polyline. Mirrors the straight case but
 * in the arc's sweep: the clicked sub-arc is removed and the surviving pieces
 * keep proportional bulges so the retained curvature is exact.
 */
function planTrimPolylineArc(
  poly: PolylineEntity,
  si: number,
  seg: ArcSegment,
  click: Vec2,
  others: readonly Entity[]
): EdgeEditPlan | null {
  const fractions = arcSegmentCrossFractions(seg, [
    ...others,
    ...ownEdges(poly, si),
  ])

  const phi = 4 * Math.atan(seg.bulge)
  const angA = Math.atan2(seg.a.y - seg.center.y, seg.a.x - seg.center.x)
  const absPhi = Math.abs(phi)
  const sign = Math.sign(phi)
  const angClick = Math.atan2(click.y - seg.center.y, click.x - seg.center.x)
  const fc = Math.max(
    0,
    Math.min(1, normalizeAngle((angClick - angA) * sign) / absPhi)
  )

  const bounds = [0, ...fractions, 1]
  let i = 0
  while (i < bounds.length - 1 && !(fc >= bounds[i] && fc <= bounds[i + 1])) i++
  const fa = bounds[i]
  const fb = bounds[i + 1]

  const replacements = trimPolylinePieces(poly, si, fa, fb)
  if (replacements.length === 0) return null

  return {
    kind: "trim",
    targetId: poly.id,
    layerId: poly.layerId,
    replacements,
    removed: subArcGeom(seg.center, seg.radius, angA, phi, fa, fb),
  }
}

/**
 * The polyline piece(s) left after removing the interval `[ta, tb]` of
 * segment `si` (fractions along it, an arc's by its sweep), every other
 * segment's bulge carried into what survives (`polylineSpan`, BREAK's cut
 * too). A cut that reaches a free end merely shortens the chain; a mid-chain
 * cut breaks it in two; a closed polyline opens into one chain, from the
 * cut's far end round to its near one. A bare stub at a free end is dropped.
 */
/**
 * A polyline that is no edge, its own vertices none: its pick is trimmed
 * along it, past its vertices, back to the nearest edges' crossings round a
 * closed one (AutoCAD 2023's console, acc/sn5, sn11); cut once, a closed
 * one is refused as a closed spline is (**unverified**).
 */
function planTrimPolylinePath(
  poly: PolylineEntity,
  click: Vec2,
  others: readonly Entity[]
): EdgeEditPlan | null {
  const count = polylineSegments(poly).length
  const crossings = polylineSegmentGeometries(poly).flatMap((g, j) =>
    (g.kind === "arc"
      ? arcSegmentCrossFractions(g, others)
      : trimCrossParams(createLine(g.a, g.b), others)
    ).map((f) => j + f)
  )
  if (crossings.length === 0) return null
  const closed = poly.closed
  if (closed && crossings.length === 1) {
    return { kind: "refuse", message: "curveMustIntersectTwice" }
  }
  const at = polylineParamAt(poly, click)
  const below = crossings.filter((t) => t < at)
  const above = crossings.filter((t) => t > at)
  let from =
    below.at(-1) ?? (closed ? crossings[crossings.length - 1] - count : 0)
  let to = above[0] ?? (closed ? crossings[0] + count : count)
  if (to > count) {
    from -= count
    to -= count
  }
  const shift = from < 0 ? count : 0
  return {
    kind: "trim",
    targetId: poly.id,
    layerId: poly.layerId,
    replacements: trimPolylinePieces(poly, 0, from, to),
    removed: {
      kind: "polyline",
      ...polylineSpan(poly, from + shift, to + shift),
      closed: false,
    },
  }
}

function trimPolylinePieces(
  poly: PolylineEntity,
  si: number,
  ta: number,
  tb: number
): EditGeom[] {
  const count = polylineSegments(poly).length
  const piece = (from: number, to: number): EditGeom[] =>
    to - from > PARAM_EPS
      ? [{ kind: "polyline", ...polylineSpan(poly, from, to), closed: false }]
      : []
  if (poly.closed) {
    return piece(si + tb, si + ta + count)
  }
  return [...piece(0, si + ta), ...piece(si + tb, count)]
}

/**
 * Extends a free end of an open polyline: its end segment grows along its
 * own direction/sweep until it meets the nearest boundary, moving the chain's
 * endpoint vertex (arc segments are handled by {@link planExtendPolylineArc}).
 * The end is the one the pick lies nearer in the polyline's parameter — its
 * segment's index plus how far along it —, as AutoCAD 2023's console grows
 * it from any segment: from the first half of the segments the start, so an
 * end segment's own end. Closed polylines have no free end.
 */
function planExtendPolyline(
  poly: PolylineEntity,
  click: Vec2,
  others: readonly Entity[]
): EdgeEditPlan | null {
  if (poly.closed) return null
  const v = poly.vertices
  const n = v.length
  const segments = polylineSegmentGeometries(poly)
  const si = nearestPolylineSegment(poly, click)
  const growStart = si + fractionAlongSegment(segments[si], click) < (n - 1) / 2
  const end = growStart ? 0 : n - 2
  const geom = segments[end]
  if (geom.kind === "arc") {
    return planExtendPolylineArc(poly, end, geom, others, growStart)
  }

  if (growStart) {
    const seg = createLine(v[0], v[1])
    const t = nearestExtendParam(seg, others, "before")
    if (t === null) return null
    const np = pointOnLine(seg, t)
    return {
      kind: "extend",
      targetId: poly.id,
      layerId: poly.layerId,
      result: extendedPolyline(poly, 0, np),
      added: { kind: "line", start: v[0], end: np },
    }
  }
  const seg = createLine(v[n - 2], v[n - 1])
  const t = nearestExtendParam(seg, others, "after")
  if (t === null) return null
  const np = pointOnLine(seg, t)
  return {
    kind: "extend",
    targetId: poly.id,
    layerId: poly.layerId,
    result: extendedPolyline(poly, n - 1, np),
    added: { kind: "line", start: v[n - 1], end: np },
  }
}

/**
 * Extends a free end of an open polyline whose end segment is an *arc*: the arc
 * grows along its own sweep, past the free endpoint (the start's when
 * `growStart`), to the nearest boundary on its circle. The end segment's
 * bulge is enlarged to match the new sweep.
 */
function planExtendPolylineArc(
  poly: PolylineEntity,
  si: number,
  seg: ArcSegment,
  others: readonly Entity[],
  growStart: boolean
): EdgeEditPlan | null {
  const phi = 4 * Math.atan(seg.bulge)
  const angA = Math.atan2(seg.a.y - seg.center.y, seg.a.x - seg.center.x)
  const absPhi = Math.abs(phi)
  const sign = Math.sign(phi)
  const fFull = (2 * Math.PI) / absPhi

  // Circle crossings that lie in the gap past the sweep are the boundaries.
  const outside: number[] = []
  for (const o of others) {
    for (const p of circleEdgeCrossPoints(seg.center, seg.radius, o)) {
      const angP = Math.atan2(p.y - seg.center.y, p.x - seg.center.x)
      const f = normalizeAngle((angP - angA) * sign) / absPhi
      if (f > 1 + PARAM_EPS && f < fFull - PARAM_EPS) outside.push(f)
    }
  }
  if (outside.length === 0) return null

  const n = poly.vertices.length
  const base = {
    kind: "extend" as const,
    targetId: poly.id,
    layerId: poly.layerId,
  }

  if (growStart) {
    // Grow past the start vertex: the boundary just *before* it is the largest
    // gap fraction, taken as a negative fraction (`fMax - fFull`).
    const fMax = Math.max(...outside)
    const fNeg = fMax - fFull
    const np = polarPoint(seg.center, seg.radius, angA + fMax * phi)
    const newBulge = Math.tan(((1 - fNeg) * phi) / 4)
    return {
      ...base,
      result: extendedPolyline(poly, 0, np, { index: 0, value: newBulge }),
      added: subArcGeom(seg.center, seg.radius, angA, phi, fNeg, 0),
    }
  }
  // Grow past the end vertex: the nearest gap fraction beyond 1.
  const fMin = Math.min(...outside)
  const np = polarPoint(seg.center, seg.radius, angA + fMin * phi)
  const newBulge = Math.tan((fMin * phi) / 4)
  return {
    ...base,
    result: extendedPolyline(poly, n - 1, np, {
      index: n - 2,
      value: newBulge,
    }),
    added: subArcGeom(seg.center, seg.radius, angA, phi, 1, fMin),
  }
}

/** Nearest extend boundary param past the start (`before`, t<0) or end (`after`, t>1). */
function nearestExtendParam(
  line: LineEntity,
  others: readonly Entity[],
  side: "before" | "after"
): number | null {
  const crossings = extendCrossParams(line, others)
  if (side === "before") {
    const candidates = crossings.filter((t) => t < -PARAM_EPS)
    return candidates.length ? Math.max(...candidates) : null
  }
  const candidates = crossings.filter((t) => t > 1 + PARAM_EPS)
  return candidates.length ? Math.min(...candidates) : null
}

/** The polyline with its endpoint vertex `index` moved to `point`; an optional
 * `bulgeOverride` resets one segment's curvature (used when an arc end grows). */
function extendedPolyline(
  poly: PolylineEntity,
  index: number,
  point: Vec2,
  bulgeOverride?: { index: number; value: number }
): EditGeom {
  const vertices = poly.vertices.map((vtx, i) =>
    i === index ? { x: point.x, y: point.y } : { x: vtx.x, y: vtx.y }
  )
  let bulges = poly.bulges ? poly.bulges.slice() : undefined
  if (bulgeOverride) {
    if (!bulges) bulges = new Array(poly.vertices.length - 1).fill(0)
    bulges[bulgeOverride.index] = bulgeOverride.value
  }
  // The segment grown keeps its widths, tapering over its new length
  // (acc/w18).
  return {
    kind: "polyline",
    vertices,
    closed: false,
    bulges,
    widths: poly.widths,
  }
}

/** The angle in `angles` with the smallest positive `gap`, or `null`. */
function nearestAngle(
  angles: readonly number[],
  gap: (a: number) => number
): number | null {
  let best: number | null = null
  let bestGap = Infinity
  for (const a of angles) {
    const g = gap(a)
    if (g > ANGLE_EPS && g < bestGap) {
      bestGap = g
      best = a
    }
  }
  return best
}

function dedupeSorted(values: number[]): number[] {
  const sorted = [...values].sort((a, b) => a - b)
  const out: number[] = []
  for (const v of sorted) {
    if (out.length === 0 || Math.abs(v - out[out.length - 1]) > PARAM_EPS) {
      out.push(v)
    }
  }
  return out
}

function dedupeAngles(values: number[]): number[] {
  const sorted = [...values].sort((a, b) => a - b)
  const out: number[] = []
  for (const v of sorted) {
    if (out.length === 0 || Math.abs(v - out[out.length - 1]) > ANGLE_EPS) {
      out.push(v)
    }
  }
  // Merge a value near 2π with its near-0 twin (same physical direction).
  if (
    out.length > 1 &&
    Math.abs(out[out.length - 1] - (out[0] + TWO_PI)) < ANGLE_EPS
  ) {
    out.pop()
  }
  return out
}
