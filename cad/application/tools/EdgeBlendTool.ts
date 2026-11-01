import { Vec2 } from "../../geometry/Vec2"
import { Vec3, add3, dot3, normalize3, scale3, sub3 } from "../../geometry/Vec3"
import { edgeTrace } from "../../geometry/brepCurves"
import { faceNormal } from "../../geometry/brepQueries"
import {
  EdgeBlend,
  chamferBase,
  edgeLoops,
  tangentChain,
} from "../../geometry/solidBlends"
import { EntityId, Solid3dEntity } from "../../domain/entities"
import { blendedSolid } from "../../domain/solidModeling"
import { SubobjectRef, sameSubobject } from "../../domain/solidSubobjects"
import { solidEdgeEntity } from "../../domain/solids"
import { formatLength } from "../../domain/units"
import { UpdateEntitiesCommand } from "../commands/entityCommands"
import { evaluateExpression } from "../input/expression"
import {
  isCoordinateExpression,
  parseCoordinate,
} from "../input/coordinateInput"
import type { PromptId } from "../../locales/types"
import { ScenePrimitive } from "../../scene/types"
import { THEME } from "../../scene/theme"
import { entityScenePrimitive, selectionGlow } from "../SceneBuilder"
import { subobjectsAt } from "../subobjectPick"
import { setCommandSettings } from "./commandSettings"
import { pushGrip } from "./selectToolGrips"
import {
  CommandOption,
  CommandOptionOutcome,
  PointerInput,
  QuestionInput,
  Tool,
  ToolContext,
  ToolQuestion,
} from "./Tool"

type Pick = "edge" | "chain" | "loop"

/** Which size a prompt asks: the radius, or a chamfer's first or second distance. */
type Size = "radius" | "distance1" | "distance2"

type EdgeBlendState =
  | {
      readonly phase: "pick"
      readonly mode: Pick
      readonly hover: SubobjectRef | null
    }
  | {
      readonly phase: "loop"
      readonly loops: readonly (readonly number[])[]
      readonly at: number
      readonly id: EntityId
    }
  | {
      readonly phase: "size"
      readonly size: Size
      readonly after: "pick" | "accept"
      readonly mode: Pick
    }
  | {
      readonly phase: "expression"
      readonly size: Size
      readonly after: "pick" | "accept"
      readonly mode: Pick
    }
  | { readonly phase: "accept" }
  | { readonly phase: "grip"; readonly radius: number }

const PREVIEW_ID = "edgeblend-preview"

/**
 * AutoCAD's FILLETEDGE and CHAMFEREDGE (their help; filletedge/f01–f07,
 * chamferedge/c01–c07; desktop), one class in two modes. FILLETEDGE says
 * `Radius = 1.0000` (FILLETRAD3D, saved in the drawing) and asks `Select an
 * edge or [Chain/Loop/Radius]:` until Enter, a click taking the edge under
 * the cursor (Ctrl+Space the next there) and a typed point the edge drawn
 * through it; Chain takes the edges tangent to the one picked (`Select an
 * edge chain or [Edge/Radius]:`), Loop the loop of a face it bounds, its
 * later face's first, `Enter an option [Accept/Next] <Accept>:` offering the
 * other (f03). Enter reports `N edge(s) selected for fillet.`, then `Press
 * Enter to accept the fillet or [Radius]:` over the filleted solid with an
 * arrow grip whose drag sets the radius (desktop); Enter makes it. The radius
 * is asked `Enter fillet radius or [Expression] <1.0000>:`, at the accept
 * prompt `Specify Radius or [Expression] <…>:`, 0 or less `Radius too small.
 * *Invalid*`. CHAMFEREDGE likewise, from CHAMFERA and CHAMFERB (1 where they
 * are 0, c07): `Distance1 = 1.0000, Distance2 = 1.0000`, `Select an edge or
 * [Loop/Distance]:`, then `Select another edge on the same face or
 * [Loop/Distance]:` (`Edges must belong to one face.`), its first distance
 * along the face they share — a lone edge's later face (c06) —, Enter on
 * none `No edges to chamfer.`. A blend the kernel cannot make ends the
 * command with AutoCAD's modelling error, nothing changed and nothing saved
 * (c04). One undo step, named as the command (f07).
 */
export class EdgeBlendTool implements Tool {
  readonly id: "filletedge" | "chamferedge"

  private state: EdgeBlendState = { phase: "pick", mode: "edge", hover: null }
  private solid: EntityId | null = null
  private edges: number[] = []
  private radius = 1
  private distance1 = 1
  private distance2 = 1
  /** The solid as the blend would leave it, or why it cannot: built as the edges or the size change. */
  private preview: Solid3dEntity | "failed" | null = null
  private under: { list: SubobjectRef[]; at: number } = { list: [], at: 0 }
  private lastScreen: Vec2 | null = null

  constructor(private readonly kind: "fillet" | "chamfer") {
    this.id = kind === "fillet" ? "filletedge" : "chamferedge"
  }

  onActivate(ctx: ToolContext): void {
    ctx.setCursor("crosshair")
    ctx.selection.clear()
    const settings = ctx.document.getSettings()
    this.solid = null
    this.edges = []
    this.preview = null
    this.radius = settings.filletRadius3d
    // CHAMFERA and CHAMFERB, or 1 where they are 0 (c01, c07).
    this.distance1 = settings.chamferDistance1 || 1
    this.distance2 = settings.chamferDistance2 || 1
    ctx.report(
      this.kind === "fillet"
        ? ctx.text.message("filletEdgeRadius", {
            radius: formatLength(this.radius, settings),
          })
        : ctx.text.message("chamferEdgeDistances", {
            distance1: formatLength(this.distance1, settings),
            distance2: formatLength(this.distance2, settings),
          })
    )
    this.toPick("edge", ctx)
  }

  onDeactivate(ctx: ToolContext): void {
    this.state = { phase: "pick", mode: "edge", hover: null }
    this.solid = null
    this.edges = []
    this.preview = null
    ctx.dynamicInput.close()
  }

  question(): PromptId | ToolQuestion {
    const state = this.state
    const fillet = this.kind === "fillet"
    switch (state.phase) {
      case "pick":
        if (state.mode === "chain") return "filletEdgeChainOr"
        if (state.mode === "loop") {
          return fillet ? "filletEdgeLoopOr" : "chamferEdgeLoopOr"
        }
        if (fillet) return "filletEdgeSelectOr"
        return this.edges.length > 0
          ? "chamferEdgeAnotherOr"
          : "chamferEdgeSelectOr"
      case "loop":
        return "edgeLoopOption"
      case "size":
        return { id: this.sizePrompt(state), enter: this.sizeOf(state.size) }
      case "expression":
        return "enterExpression"
      case "accept":
        return fillet ? "filletEdgeAccept" : "chamferEdgeAccept"
      case "grip":
        return { id: "filletEdgeGripRadiusOr", enter: state.radius }
    }
  }

  private sizePrompt(state: { size: Size; after: string }): PromptId {
    if (state.size === "radius") {
      return state.after === "accept"
        ? "filletEdgeAcceptRadiusOr"
        : "filletEdgeRadiusOr"
    }
    return state.size === "distance1"
      ? "chamferEdgeDistance1Or"
      : "chamferEdgeDistance2Or"
  }

  private sizeOf(size: Size): number {
    return size === "radius"
      ? this.radius
      : size === "distance1"
        ? this.distance1
        : this.distance2
  }

  defaultOption(): string | null {
    return this.state.phase === "loop" ? "Accept" : null
  }

  /**
   * An edge's pick, refused with all but the last of its keywords, as the
   * console says (f01: `Expects a point or Chain/Loop`; c01: `… or Loop`).
   */
  takes(): QuestionInput | null {
    const state = this.state
    switch (state.phase) {
      case "pick": {
        const ids = this.options().map((o) => o.id)
        return {
          refusal: ["invalidSelection", "expectsPointOr"],
          keywords: { ids: ids.slice(0, -1) },
        }
      }
      case "loop":
      case "accept":
        return "keyword"
      case "size":
      case "grip":
        return {
          refusal: "requiresDistance",
          values: { points: "two", keyword: "yes" },
        }
      case "expression":
        return null
    }
  }

  private options(): CommandOption[] {
    const state = this.state
    const fillet = this.kind === "fillet"
    switch (state.phase) {
      case "pick":
        if (!fillet) {
          return state.mode === "loop"
            ? [{ id: "Edge" }, { id: "Distance" }]
            : [{ id: "Loop" }, { id: "Distance" }]
        }
        if (state.mode === "chain") return [{ id: "Edge" }, { id: "Radius" }]
        if (state.mode === "loop") {
          return [{ id: "Edge" }, { id: "Chain" }, { id: "Radius" }]
        }
        return [{ id: "Chain" }, { id: "Loop" }, { id: "Radius" }]
      case "loop":
        return [{ id: "Accept" }, { id: "Next" }]
      case "size":
        return [{ id: "Expression" }]
      case "accept":
        return [{ id: fillet ? "Radius" : "Distance" }]
      case "grip":
        return [{ id: "eXit" }]
      default:
        return []
    }
  }

  commandOptions(): readonly CommandOption[] {
    return this.options()
  }

  invokeOption(id: string, ctx: ToolContext): CommandOptionOutcome {
    const state = this.state
    switch (state.phase) {
      case "pick":
        if (id === "Edge" || id === "Chain" || id === "Loop") {
          this.toPick(
            id === "Edge" ? "edge" : id === "Chain" ? "chain" : "loop",
            ctx
          )
          return "continue"
        }
        if (id === "Radius" || id === "Distance") {
          this.askSize(
            id === "Radius" ? "radius" : "distance1",
            "pick",
            state.mode,
            ctx
          )
          return "continue"
        }
        return "unhandled"
      case "loop":
        if (id === "Accept") {
          this.takeLoop(state, ctx)
          return "continue"
        }
        if (id === "Next") {
          this.state = { ...state, at: (state.at + 1) % state.loops.length }
          this.openKeywords(ctx)
          return "continue"
        }
        return "unhandled"
      case "size":
        if (id !== "Expression") return "unhandled"
        this.state = { ...state, phase: "expression" }
        this.openExpression(ctx)
        return "continue"
      case "accept":
        if (id !== "Radius" && id !== "Distance") return "unhandled"
        this.askSize(
          id === "Radius" ? "radius" : "distance1",
          "accept",
          "edge",
          ctx
        )
        return "continue"
      case "grip":
        if (id !== "eXit") return "unhandled"
        this.toAccept(ctx)
        return "continue"
      default:
        return "unhandled"
    }
  }

  onEnter(ctx: ToolContext): boolean {
    const state = this.state
    switch (state.phase) {
      case "pick":
        return this.closePicks(ctx)
      case "loop":
        this.takeLoop(state, ctx)
        return true
      case "accept":
        this.commit(ctx)
        ctx.endCommand()
        return true
      case "grip":
        this.toAccept(ctx)
        return true
      default:
        return false
    }
  }

  /** WHY no snap: a size takes two points (`Requires numeric distance, two points, …`), which the runtime asks. */
  wantsSnap(): boolean {
    return false
  }

  hiddenEntityIds(): readonly EntityId[] {
    const showing = this.state.phase === "accept" || this.state.phase === "grip"
    return showing && this.solid && this.preview !== "failed" && this.preview
      ? [this.solid]
      : []
  }

  cycleSubobject(ctx: ToolContext): boolean {
    const state = this.state
    if (state.phase !== "pick" || !state.hover) return false
    const { list, at } = this.under
    if (list.length < 2) return false
    const next = (at + 1) % list.length
    this.under = { list, at: next }
    this.state = { ...state, hover: list[next] }
    ctx.requestRender()
    return true
  }

  onPointerMove(input: PointerInput, ctx: ToolContext): void {
    this.lastScreen = input.screen
    const state = this.state
    if (state.phase === "pick") {
      this.state = { ...state, hover: this.edgeUnder(input.screen, ctx) }
    } else if (state.phase === "grip") {
      const radius = this.gripRadius(input.screen, ctx)
      if (radius !== null) {
        this.state = { phase: "grip", radius }
        this.build(ctx, radius)
      }
    }
    ctx.dynamicInput.setPosition(input.screen)
    ctx.requestRender()
  }

  onPointerDown(input: PointerInput, ctx: ToolContext): void {
    if (input.button !== 0) return
    const state = this.state
    if (state.phase === "pick") {
      const edge = this.edgeUnder(input.screen, ctx)
      if (edge) this.takeEdge(edge, ctx)
      return
    }
    if (state.phase === "accept" && this.kind === "fillet") {
      const grip = this.grip(ctx)
      if (
        grip &&
        Math.hypot(grip.at.x - input.screen.x, grip.at.y - input.screen.y) <= 8
      ) {
        // Dragged, the grip asks the radius by the cursor (desktop:
        // `>>Specify radius or [eXit]:`).
        this.state = { phase: "grip", radius: this.radius }
        this.openSize(ctx)
      }
      return
    }
    if (state.phase === "grip") {
      const radius = this.gripRadius(input.screen, ctx)
      if (radius !== null) this.radius = radius
      this.toAccept(ctx)
    }
  }

  buildOverlay(ctx: ToolContext): ScenePrimitive[] {
    const out: ScenePrimitive[] = []
    const state = this.state
    const solid = this.solidOf(ctx)
    if (state.phase === "accept" || state.phase === "grip") {
      if (this.preview && this.preview !== "failed") {
        out.push(
          ...entityScenePrimitive(ctx.viewport, this.preview, {
            color: THEME.entity,
            width: 1,
          })
        )
      }
      const grip = this.grip(ctx)
      if (grip)
        pushGrip(out, grip.at, state.phase === "grip", "arrow", grip.along)
      return out
    }
    if (solid) {
      // The edges taken glow blue, the blend they make drawn over the solid
      // (desktop: its mesh while the edges are picked).
      for (const index of this.edges) {
        const edge = solidEdgeEntity(solid, index)
        if (edge) {
          out.push(
            ...selectionGlow(ctx.viewport, edge, {
              color: THEME.entity,
              width: 1,
            })
          )
        }
      }
      if (this.preview && this.preview !== "failed") {
        out.push(
          ...entityScenePrimitive(ctx.viewport, this.preview, {
            color: THEME.entityHover,
            width: 1,
          })
        )
      }
    }
    const lit =
      state.phase === "pick" && state.hover
        ? [state.hover]
        : state.phase === "loop"
          ? state.loops[state.at].map((index) => ({
              id: state.id,
              kind: "edge" as const,
              index,
            }))
          : []
    for (const ref of lit) {
      const owner = ctx.document.get(ref.id)
      if (owner?.type !== "solid3d") continue
      const edge = solidEdgeEntity(owner, ref.index)
      if (edge) {
        out.push(
          ...entityScenePrimitive(ctx.viewport, edge, {
            color: THEME.entityHover,
            width: 2,
          })
        )
      }
    }
    return out
  }

  private solidOf(ctx: ToolContext): Solid3dEntity | null {
    if (!this.solid) return null
    const entity = ctx.document.get(this.solid)
    return entity?.type === "solid3d" ? entity : null
  }

  /** The edge a click at `screen` takes: the first there, or the one Ctrl+Space walked to. */
  private edgeUnder(screen: Vec2, ctx: ToolContext): SubobjectRef | null {
    const solids = ctx.document
      .getEntities()
      .filter(
        (e): e is Solid3dEntity =>
          e.type === "solid3d" &&
          ctx.document.isEntityVisible(e) &&
          ctx.document.isEntityEditable(e)
      )
    const shaded = ctx.document.getSettings().visualStyle !== "2dWireframe"
    const list = subobjectsAt(solids, ctx.viewport, screen, shaded).filter(
      (r) => r.kind === "edge"
    )
    const same =
      list.length === this.under.list.length &&
      list.every((r, i) => sameSubobject(r, this.under.list[i]))
    this.under = { list, at: same ? this.under.at : 0 }
    return list[this.under.at] ?? null
  }

  private takeEdge(ref: SubobjectRef, ctx: ToolContext): void {
    const state = this.state
    if (state.phase !== "pick") return
    // WHY edges of the solid first taken only: the help's "edges on the same
    // solid body"; what AutoCAD says to another's is unverified.
    if (this.solid && ref.id !== this.solid) return
    const owner = ctx.document.get(ref.id)
    if (owner?.type !== "solid3d") return
    const brep = owner.brep
    if (state.mode === "loop") {
      const loops = edgeLoops(brep, ref.index)
      if (loops.length === 0) return
      this.state = { phase: "loop", loops, at: 0, id: ref.id }
      this.openKeywords(ctx)
      return
    }
    const taken =
      state.mode === "chain" ? tangentChain(brep, ref.index) : [ref.index]
    const edges = [
      ...this.edges,
      ...taken.filter((e) => !this.edges.includes(e)),
    ]
    if (this.kind === "chamfer" && chamferBase(brep, edges) === null) {
      ctx.report(ctx.text.message("edgesOneFace"), "error")
      return
    }
    this.solid = ref.id
    this.edges = edges
    this.build(ctx)
    // Its box asks as the prompt now does (`Select another edge on the same face`).
    this.openPick(ctx)
  }

  private takeLoop(
    state: Extract<EdgeBlendState, { phase: "loop" }>,
    ctx: ToolContext
  ): void {
    const owner = ctx.document.get(state.id)
    const loop = state.loops[state.at]
    this.state = { phase: "pick", mode: "loop", hover: null }
    if (owner?.type === "solid3d" && (!this.solid || this.solid === state.id)) {
      const edges = [
        ...this.edges,
        ...loop.filter((e) => !this.edges.includes(e)),
      ]
      if (this.kind === "chamfer" && chamferBase(owner.brep, edges) === null) {
        ctx.report(ctx.text.message("edgesOneFace"), "error")
      } else {
        this.solid = state.id
        this.edges = edges
        this.build(ctx)
      }
    }
    this.openPick(ctx)
  }

  /** The blend of the edges at the run's size, or at `radius` while the grip is dragged. */
  private build(ctx: ToolContext, radius = this.radius): void {
    const solid = this.solidOf(ctx)
    if (!solid || this.edges.length === 0) {
      this.preview = null
      return
    }
    const made = blendedSolid(solid, this.edges, this.blend(solid, radius))
    this.preview = made ? { ...made, id: PREVIEW_ID } : "failed"
  }

  private blend(solid: Solid3dEntity, radius = this.radius): EdgeBlend {
    if (this.kind === "fillet") return { kind: "fillet", radius }
    return {
      kind: "chamfer",
      base: chamferBase(solid.brep, this.edges) ?? -1,
      distance1: this.distance1,
      distance2: this.distance2,
    }
  }

  /** Enter after the edges: none ends it, else the blend is shown to accept or refused. */
  private closePicks(ctx: ToolContext): boolean {
    const fillet = this.kind === "fillet"
    if (fillet) {
      ctx.report(
        ctx.text.message("filletEdgesSelected", { count: this.edges.length })
      )
    }
    if (this.edges.length === 0) {
      ctx.report(
        ctx.text.message(fillet ? "noFilletComputed" : "noEdgesToChamfer")
      )
      ctx.dynamicInput.close()
      return false
    }
    this.build(ctx)
    if (this.preview === "failed" || !this.preview) {
      // WHY ACIS's error without its code for FILLETEDGE: ACIS rolls a ball
      // too wide for a face over the edge beyond (f05, f07), where this
      // kernel stops; its code for such a failure was never seen.
      ctx.report(
        ctx.text.message(fillet ? "filletEdgeFailed" : "chamferEdgeFailed"),
        "error"
      )
      ctx.dynamicInput.close()
      return false
    }
    this.toAccept(ctx)
    return true
  }

  private toAccept(ctx: ToolContext): void {
    this.state = { phase: "accept" }
    this.build(ctx)
    this.openKeywords(ctx)
  }

  /** The blend made, and the size it took saved in the drawing (FILLETRAD3D; CHAMFERA, CHAMFERB, c01). */
  private commit(ctx: ToolContext): void {
    const solid = this.solidOf(ctx)
    const made = this.preview
    ctx.dynamicInput.close()
    if (!solid || !made || made === "failed") return
    if (this.kind === "fillet") {
      setCommandSettings({ filletRadius3d: this.radius }, ctx)
    } else {
      setCommandSettings(
        { chamferDistance1: this.distance1, chamferDistance2: this.distance2 },
        ctx
      )
    }
    ctx.execute(new UpdateEntitiesCommand([{ ...made, id: solid.id }]))
  }

  private toPick(mode: Pick, ctx: ToolContext): void {
    this.state = { phase: "pick", mode, hover: null }
    this.openPick(ctx)
  }

  private askSize(
    size: Size,
    after: "pick" | "accept",
    mode: Pick,
    ctx: ToolContext
  ): void {
    this.state = { phase: "size", size, after, mode }
    this.openSize(ctx)
  }

  /** A size answered: 0 or less refused, a chamfer's first asking its second, then back where it was asked. */
  private takeSize(value: number, ctx: ToolContext): void {
    const state = this.state
    if (state.phase !== "size" && state.phase !== "expression") return
    if (!(value > 0)) {
      ctx.report(
        ctx.text.message(
          state.size === "radius" ? "radiusTooSmall" : "distanceTooSmall"
        ),
        "error"
      )
      this.state = { ...state, phase: "size" }
      this.openSize(ctx)
      return
    }
    if (state.size === "radius") this.radius = value
    else if (state.size === "distance1") this.distance1 = value
    else this.distance2 = value
    if (state.size === "distance1") {
      this.askSize("distance2", state.after, state.mode, ctx)
      return
    }
    if (state.after === "accept") {
      this.toAccept(ctx)
      return
    }
    this.build(ctx)
    this.toPick(state.mode, ctx)
  }

  /** The radius the grip's drag sets: along the fillet's bisector from the edge, as the cursor covers it on the screen. */
  private gripRadius(screen: Vec2, ctx: ToolContext): number | null {
    const frame = this.gripFrame(ctx)
    if (!frame) return null
    const { viewport } = ctx
    const s0 = viewport.worldToScreen(frame.edge)
    const s1 = viewport.worldToScreen(add3(frame.edge, frame.out))
    const dx = s1.x - s0.x
    const dy = s1.y - s0.y
    const run = dx * dx + dy * dy
    if (run <= 1e-9) return null
    const t = -((screen.x - s0.x) * dx + (screen.y - s0.y) * dy) / run
    const radius = t / frame.reach
    return radius > 0 ? radius : null
  }

  /**
   * The first edge's middle, the way out of the solid between its faces, and
   * how far in along it the fillet's middle lies per unit of radius.
   */
  private gripFrame(
    ctx: ToolContext
  ): { edge: Vec3; out: Vec3; reach: number } | null {
    const solid = this.solidOf(ctx)
    if (!solid || this.edges.length === 0) return null
    const { brep } = solid
    const e = brep.edges[this.edges[0]]
    const faces = brep.faces
      .map((f, i) => ({ f, i }))
      .filter(({ f }) =>
        f.loops.some((l) => l.some((c) => c.edge === this.edges[0]))
      )
    if (faces.length !== 2) return null
    const trace = edgeTrace(brep, e)
    const edge = trace.point((trace.t0 + trace.t1) / 2)
    const na = faceNormal(brep, faces[0].f, edge)
    const nb = faceNormal(brep, faces[1].f, edge)
    const out = normalize3(add3(na, nb))
    if (!out) return null
    const half = Math.acos(Math.max(-1, Math.min(1, dot3(na, nb)))) / 2
    // The ball's centre lies r / cos(half) in from the edge, its rim r nearer.
    const reach = 1 / Math.cos(half) - 1
    if (!(reach > 1e-9)) return null
    return { edge, out, reach }
  }

  /** The fillet's grip: an arrow at the middle of the first edge's fillet, pointing out (desktop). */
  private grip(ctx: ToolContext): { at: Vec2; along: Vec2 } | null {
    const frame = this.gripFrame(ctx)
    if (!frame) return null
    const radius = this.state.phase === "grip" ? this.state.radius : this.radius
    const at = sub3(frame.edge, scale3(frame.out, frame.reach * radius))
    const s = ctx.viewport.worldToScreen(at)
    const tip = ctx.viewport.worldToScreen(add3(at, frame.out))
    const along = { x: tip.x - s.x, y: tip.y - s.y }
    return { at: s, along }
  }

  private openPick(ctx: ToolContext): void {
    ctx.dynamicInput.open({
      fields: [
        {
          id: "point",
          prompt: this.question() as PromptId,
          kind: "coordinate",
        },
      ],
      commit: () => {},
      commitRaw: (commitCtx) => {
        if (!commitCtx.dynamicInput.hasTypedText()) {
          if (!this.closePicks(commitCtx)) commitCtx.endCommand()
          return true
        }
        const text = commitCtx.dynamicInput.getText("point").trim()
        if (!isCoordinateExpression(text)) return false
        const point = parseCoordinate(text, {
          lastPoint: commitCtx.lastPoint,
          relativeByDefault: false,
          ucs: commitCtx.ucs,
          elevation: commitCtx.elevation,
        })
        if (!point) return false
        // A typed point takes the edge drawn through it (f01: 5,0,10 in a
        // view off plan takes the top front edge, in plan the bottom one).
        const edge = this.edgeUnder(
          commitCtx.viewport.worldToScreen(point),
          commitCtx
        )
        if (edge) this.takeEdge(edge, commitCtx)
        return true
      },
      directDistance: "typed",
    })
    ctx.dynamicInput.setPosition(this.lastScreen ?? { x: 0, y: 0 })
    ctx.requestRender()
  }

  private openKeywords(ctx: ToolContext): void {
    ctx.dynamicInput.open({ fields: [], commit: () => {} })
    ctx.dynamicInput.setPosition(this.lastScreen ?? { x: 0, y: 0 })
    ctx.requestRender()
  }

  /** A size's box: a number typed is the size, Enter the default. */
  private openSize(ctx: ToolContext): void {
    const state = this.state
    const prompt = this.question()
    ctx.dynamicInput.open({
      fields: [
        {
          id: "value",
          prompt: typeof prompt === "string" ? prompt : prompt.id,
          kind: "distance",
        },
      ],
      commit: (values, commitCtx) => {
        if (!Number.isFinite(values.value)) return
        if (this.state.phase === "grip") {
          if (values.value > 0) this.radius = values.value
          else {
            commitCtx.report(commitCtx.text.message("radiusTooSmall"), "error")
            return
          }
          this.toAccept(commitCtx)
          return
        }
        this.takeSize(values.value, commitCtx)
      },
    })
    if (state.phase === "size") {
      ctx.dynamicInput.setDefault("value", this.sizeOf(state.size))
    } else if (state.phase === "grip") {
      ctx.dynamicInput.setDefault("value", state.radius)
    }
    ctx.dynamicInput.setPosition(this.lastScreen ?? { x: 0, y: 0 })
    ctx.requestRender()
  }

  private openExpression(ctx: ToolContext): void {
    ctx.dynamicInput.open({
      fields: [{ id: "expression", prompt: "enterExpression", kind: "text" }],
      commit: () => {},
      commitRaw: (commitCtx) => {
        const text = commitCtx.dynamicInput.getText("expression").trim()
        const value = evaluateExpression(text)
        if (value === null) {
          commitCtx.report(commitCtx.text.message("expressionSyntax"), "error")
          return true
        }
        this.takeSize(value, commitCtx)
        return true
      },
    })
    ctx.dynamicInput.setPosition(this.lastScreen ?? { x: 0, y: 0 })
    ctx.requestRender()
  }
}
