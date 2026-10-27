import { Vec2, V } from "../../geometry/Vec2"
import { DEFAULT_DIM_STYLE, DimStyle, DimStyleId } from "../../domain/dimStyles"
import {
  createDimension,
  DimensionEntity,
  dimensionAxisAngle,
  entityElevation,
  readsInPlan,
  withElevation,
} from "../../domain/entities"
import { AddEntityCommand } from "../commands/entityCommands"
import { DynamicInputSession } from "../input/DynamicInput"
import {
  isCoordinateExpression,
  parseCoordinate,
} from "../input/coordinateInput"
import { entityScenePrimitive } from "../SceneBuilder"
import { ScenePrimitive } from "../../scene/types"
import { THEME } from "../../scene/theme"
import { rollover } from "./ghostLook"
import { lastDimension } from "./lastDimension"
import { lastObject } from "./objectSelection"
import type { PromptId } from "../../locales/types"
import {
  CommandOption,
  CommandOptionOutcome,
  PointerInput,
  QuestionInput,
  Tool,
  ToolContext,
} from "./Tool"
import { measurementOf } from "./DimensionTool"
import { withCurrentProperties } from "./currentProperties"
import { typedPick } from "./typedPick"
import { LayerId } from "../../domain/layers"
import { normalizeAngle } from "../../geometry/primitives"

/** Which end of the base dimension a chain grows from. */
export type DimensionChainMode = "baseline" | "continue"

/**
 * AutoCAD's DIMBASELINE and DIMCONTINUE, one class parameterised by which of
 * them it is — they run the identical prompt loop and differ only in which
 * extension line of the base dimension the next one starts from, and in whether
 * the dimension line steps outwards or stays put:
 *
 * - **DIMBASELINE** keeps the base's *first* extension line origin and offsets
 *   each new dimension line by DIMDLI, so the chain fans out from one datum.
 * - **DIMCONTINUE** takes the base's *second* extension line origin as the next
 *   first origin and reuses its dimension line, so the chain runs end to end.
 *
 * Neither creates a new kind of object: both emit ordinary rotated (linear)
 * dimensions measured along the base's axis, an aligned base's too (probe
 * dimensions/p240), with the base's style and layer (DIMCONTINUEMODE 1, p00),
 * placed automatically from the base.
 *
 * The prompt loop is AutoCAD's, as its 2027 console asks it (p202): with a
 * base already in hand `Specify second extension line origin or [Select/Undo]
 * <Select>:` over and over, each placed one saying `Dimension text =
 * 106.07`; Select, or Enter, asks `Select base dimension:` (DIMCONTINUE's
 * `Select continued dimension:`). With no base it opens at that prompt.
 * Escape ends the command, and so does Enter at the Select prompt — AutoCAD's
 * "press Enter twice, or press Esc".
 */
export class DimensionChainTool implements Tool {
  private state: ChainToolState = { phase: "select", hover: null }
  private lastScreen: Vec2 | null = null
  /**
   * The chain as it stood before each dimension this command run has placed, so
   * the Undo keyword can back one out. Its depth is also the edit count, which
   * `ctx.undo()` needs so it never pops an unrelated earlier command.
   */
  private history: Chain[] = []

  constructor(
    private readonly mode: DimensionChainMode,
    readonly id: string
  ) {}

  onActivate(ctx: ToolContext): void {
    ctx.setCursor("crosshair")
    ctx.selection.clear()
    this.history = []
    const base = lastDimension(ctx.document, (id) => ctx.madeThisSession(id))
    if (base) this.enterSecond(this.chainFrom(base, null, ctx), ctx)
    else this.enterSelect(ctx)
  }

  onDeactivate(ctx: ToolContext): void {
    this.state = { phase: "select", hover: null }
    this.history = []
    ctx.dynamicInput.close()
  }

  onPointerMove(input: PointerInput, ctx: ToolContext): void {
    this.lastScreen = input.screen
    if (this.state.phase === "select") {
      const hover = this.chainableAt(input.world, ctx)
      if (hover?.id !== this.state.hover?.id) {
        this.state = { ...this.state, hover: hover ?? null }
      }
    } else {
      this.state = { ...this.state, cursor: input.point }
    }
    ctx.dynamicInput.setPosition(input.screen)
    ctx.requestRender()
  }

  onPointerDown(input: PointerInput, ctx: ToolContext): void {
    if (input.button !== 0) return
    if (this.state.phase === "select") {
      this.pickAt(input.world, ctx)
    } else {
      this.place(this.state.chain, input.point, ctx)
    }
    ctx.requestRender()
  }

  question(): PromptId {
    if (this.state.phase === "second") return "secondExtensionOriginOr"
    return this.mode === "baseline"
      ? "selectBaseDimension"
      : "selectContinuedDimension"
  }

  /** As AutoCAD's console refuses the loop's answers (p226, p228). */
  takes(): QuestionInput {
    return this.state.phase === "second"
      ? { refusal: "invalidPointInput" }
      : "objectOrLast"
  }

  defaultOption(): string | null {
    return this.state.phase === "second" ? "Select" : null
  }

  commandOptions(): readonly CommandOption[] {
    // Undo is offered with nothing to undo too, as AutoCAD's prompt offers it.
    return this.state.phase === "second"
      ? [{ id: "Select" }, { id: "Undo" }]
      : [{ id: "Last", hidden: true, prompt: "selectObjects" }]
  }

  invokeOption(id: string, ctx: ToolContext): CommandOptionOutcome {
    if (this.state.phase === "select") {
      if (id !== "Last") return "unhandled"
      this.takeLast(ctx)
      return "continue"
    }
    switch (id) {
      case "Undo":
        this.undoLast(ctx)
        return "continue"
      case "Select":
        this.enterSelect(ctx)
        return "continue"
      default:
        return "unhandled"
    }
  }

  /**
   * A point typed at the Select prompt picks there, as a click does (probes
   * dimensions/p208, p227).
   */
  answerTyped(text: string, ctx: ToolContext): boolean {
    if (this.state.phase !== "select") return false
    const point = typedPick(text, ctx)
    if (!point) return false
    this.pickAt(point, ctx)
    ctx.requestRender()
    return true
  }

  getConstraintAnchor(): Vec2 | null {
    return this.state.phase === "second" ? this.state.chain.origin : null
  }

  wantsSnap(): boolean {
    // The second extension line origin is a point prompt; picking the base
    // dimension is not.
    return this.state.phase === "second"
  }

  buildOverlay(ctx: ToolContext): ScenePrimitive[] {
    if (this.state.phase === "select") {
      return this.state.hover ? rollover(ctx, this.state.hover) : []
    }
    const pending = this.pending(
      this.state.chain,
      this.state.cursor,
      ctx,
      CHAIN_PREVIEW_ID
    )
    if (!pending) return []
    return entityScenePrimitive(
      ctx.viewport,
      pending,
      { color: THEME.rubberBand, width: 1 },
      { dimStyle: this.styleOf(pending, ctx) }
    )
  }

  /**
   * The dimension the chain would place at `point`. Shared by the live preview
   * and by every commit path, so a typed coordinate lands exactly where the
   * rubber band showed it. Null when the point would measure nothing.
   */
  private pending(
    chain: Chain,
    point: Vec2,
    ctx: ToolContext,
    id?: string
  ): DimensionEntity | null {
    if (V.distance(chain.origin, point) < 1e-9) return null
    return withElevation(
      createDimension("linear", chain.origin, point, chain.linePoint, {
        rotation: chain.rotation,
        styleId: chain.styleId,
        layerId: chain.layerId,
        ...(id !== undefined ? { id } : {}),
      }),
      chain.elevation
    )
  }

  /** Places one link of the chain and re-asks, as AutoCAD's loop does. */
  private place(chain: Chain, point: Vec2, ctx: ToolContext): void {
    const dim = this.pending(chain, point, ctx)
    if (!dim) return
    this.history.push(chain)
    this.enterSecond(advance(chain, this.mode, dim), ctx)
    ctx.execute(new AddEntityCommand(withCurrentProperties(dim, ctx)))
    ctx.report(
      ctx.text.message("dimensionTextIs", { text: measurementOf(dim, ctx) })
    )
  }

  /**
   * Last at the Select prompt, answered as AutoCAD's console answers it
   * (p211, p237). With no pick to be nearer to, the console grows the chain
   * from the extension line nearer the WCS origin, whatever the UCS (p222,
   * p241): Last picks there. The frame is a rotation of the WCS, so that
   * origin is the frame's.
   */
  private takeLast(ctx: ToolContext): void {
    const last = lastObject(ctx)
    if (!last) ctx.report(ctx.text.message("noObjectSelected"))
    else if (last.type === "dimension" && isChainable(last)) {
      this.enterSecond(this.chainFrom(last, { x: 0, y: 0 }, ctx), ctx)
    } else ctx.report(ctx.text.message("associativeDimensionRequired"))
  }

  /**
   * A pick at the Select prompt: a dimension that cannot be chained is
   * refused in the words Last's is (probes dimensions/p401, p402), and the
   * prompt asks again.
   */
  private pickAt(world: Vec2, ctx: ToolContext): void {
    const hit = ctx.pick(world)
    if (hit?.type === "dimension" && isChainable(hit)) {
      // Explicitly selecting a base overrides the default end: the chain
      // grows from whichever extension line was picked closest.
      this.enterSecond(this.chainFrom(hit, world, ctx), ctx)
    } else if (hit?.type === "dimension") {
      ctx.report(ctx.text.message("associativeDimensionRequired"))
    } else ctx.report(ctx.text.message("noObjectSelected"))
  }

  /**
   * The Undo keyword: backs out the last dimension *this run* created, or
   * says there is none (probes dimensions/p213, p215).
   */
  private undoLast(ctx: ToolContext): void {
    const previous = this.history.pop()
    if (!previous) {
      ctx.report(ctx.text.message("commandCompletelyUndone"))
      return
    }
    this.enterSecond(previous, ctx)
    ctx.undo()
  }

  /**
   * Where a chain starting from `base` begins. `pickPoint` is the click that
   * selected it, if any: AutoCAD then starts from "the extension line of the
   * base dimension closest to the pick point" rather than from the end the
   * command defaults to.
   */
  private chainFrom(
    base: DimensionEntity,
    pickPoint: Vec2 | null,
    ctx: ToolContext
  ): Chain {
    const axis = dimensionAxisAngle(base)
    const normal = V.perpendicular({ x: Math.cos(axis), y: Math.sin(axis) })
    // The base's dimension line sits on one side of what it measures; a
    // baseline chain has to keep going that way or it would run back over the
    // geometry. A line straight through the origin has no side, so pick one.
    const side = V.dot(V.sub(base.linePoint, base.first), normal) < 0 ? -1 : 1
    // The current style's DIMDLI at the base's DIMSCALE (probes
    // dimensions/p233, p242–p244, p264).
    const current =
      ctx.document.getDimStyle(ctx.document.getCurrentDimStyleId()) ??
      DEFAULT_DIM_STYLE
    const scale = this.styleOf(base, ctx).scale
    const spacing = current.baselineSpacing * (scale > 0 ? scale : 1)
    const step = V.scale(normal, side * spacing)

    const origin =
      pickPoint !== null
        ? nearerOrigin(base, pickPoint)
        : this.mode === "baseline"
          ? base.first
          : base.second

    return {
      // An aligned base chains rotated dimensions at its axis, run from its
      // second origin to its first (p240's DXF 50 at 233.13° for 0,0→60,80).
      rotation:
        base.kind === "linear" ? base.rotation : normalizeAngle(axis + Math.PI),
      styleId: base.styleId,
      layerId: base.layerId,
      elevation: entityElevation(base),
      origin,
      linePoint:
        this.mode === "baseline" ? V.add(base.linePoint, step) : base.linePoint,
      step,
    }
  }

  private styleOf(dim: DimensionEntity, ctx: ToolContext): DimStyle {
    return ctx.document.getDimStyle(dim.styleId) ?? DEFAULT_DIM_STYLE
  }

  /** The dimension a pick at `world` would chain from: what the rollover shows. */
  private chainableAt(world: Vec2, ctx: ToolContext): DimensionEntity | null {
    const hit = ctx.pick(world)
    return hit?.type === "dimension" && isChainable(hit) ? hit : null
  }

  private enterSelect(ctx: ToolContext): void {
    this.state = { phase: "select", hover: null }
    // Keyword-only prompt: no field, so the canvas keeps focus and Enter here
    // reaches the runtime, which ends the command.
    ctx.dynamicInput.open({ fields: [], commit: () => {} })
  }

  private enterSecond(chain: Chain, ctx: ToolContext): void {
    this.state = { phase: "second", chain, cursor: chain.origin }
    const session: DynamicInputSession = {
      fields: [{ id: "point", kind: "coordinate" }],
      commit: () => {},
      commitRaw: (commitCtx) => {
        if (this.state.phase !== "second") return false
        const typed = commitCtx.dynamicInput.getText("point").trim()
        if (typed.length === 0) {
          // Enter accepts the <Select> default and asks for another base.
          this.enterSelect(commitCtx)
          return true
        }
        if (!isCoordinateExpression(typed)) return false
        // `@` is from LASTPOINT, which the chain's points leave at the
        // command before's (probes dimensions/p229–p231).
        const point = parseCoordinate(typed, {
          lastPoint: commitCtx.lastPoint,
          relativeByDefault: false,
          ucs: commitCtx.ucs,
          elevation: commitCtx.elevation,
        })
        if (!point) return false
        this.place(this.state.chain, point, commitCtx)
        return true
      },
    }
    ctx.dynamicInput.open(session)
    ctx.dynamicInput.setPosition(this.lastScreen ?? { x: 0, y: 0 })
  }
}

/** Preview frames reuse one id so drawing them never burns entity ids. */
const CHAIN_PREVIEW_ID = "__dimension_chain_preview__"

/**
 * The chain after `placed` has been added: a baseline keeps its datum and steps
 * the dimension line one DIMDLI further out, a continued chain hands its second
 * origin on and keeps the dimension lines lined up.
 */
function advance(
  chain: Chain,
  mode: DimensionChainMode,
  placed: DimensionEntity
): Chain {
  return mode === "baseline"
    ? { ...chain, linePoint: V.add(chain.linePoint, chain.step) }
    : { ...chain, origin: placed.second }
}

/** Whichever of the base's extension line origins the pick point is nearer. */
function nearerOrigin(base: DimensionEntity, pickPoint: Vec2): Vec2 {
  return V.distance(pickPoint, base.first) <= V.distance(pickPoint, base.second)
    ? base.first
    : base.second
}

/**
 * Whether a dimension can be chained from: linear and aligned ones can; a
 * radial one measures a circle and has no second datum.
 *
 * KNOWN GAP: AutoCAD also chains an angular dimension (p224, p236): it steps
 * the *radius* of its arc rather than offsetting a straight line, a placement
 * rule of its own not built yet. WHY refused with Last's words rather than
 * chained wrongly: an angular picked or Last is then said, as AutoCAD says a
 * radial one (p237, p401). One in a plane at an angle to the UCS's is not
 * chained either: the chain is drawn in the UCS's plane.
 */
function isChainable(dim: DimensionEntity): boolean {
  return (dim.kind === "linear" || dim.kind === "aligned") && readsInPlan(dim)
}

/** Everything the next link of the chain needs, carried between placements. */
interface Chain {
  /** Measurement direction of the rotated dimensions: the base's axis. */
  readonly rotation: number
  readonly styleId: DimStyleId
  /**
   * The base's layer, with its style: DIMCONTINUEMODE 1 ("Use the dimension
   * style and layer of the dimension that is being continued or used as a
   * baseline"). Colour, linetype and lineweight are a new object's, current.
   */
  readonly layerId: LayerId
  /** The base's plane: its origins are the chain's first ones. */
  readonly elevation: number
  /** First extension line origin of the next dimension. */
  readonly origin: Vec2
  /** Dimension line location of the next dimension. */
  readonly linePoint: Vec2
  /** DIMDLI offset a baseline chain adds after each placement. */
  readonly step: Vec2
}

type ChainToolState =
  /** Picking the dimension to chain from. */
  | { readonly phase: "select"; readonly hover: DimensionEntity | null }
  | {
      readonly phase: "second"
      readonly chain: Chain
      readonly cursor: Vec2
    }
