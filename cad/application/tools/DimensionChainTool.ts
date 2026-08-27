import { Vec2, V } from "../../geometry/Vec2"
import {
  DEFAULT_DIM_STYLE,
  DimStyle,
  DimStyleId,
  scaledDimStyle,
} from "../../domain/dimStyles"
import {
  createDimension,
  DimensionEntity,
  dimensionAxisAngle,
  DimensionKind,
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
import { lastDimension } from "./lastDimension"
import {
  CommandOption,
  CommandOptionOutcome,
  PointerInput,
  Tool,
  ToolContext,
} from "./Tool"

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
 * Neither creates a new kind of object: both emit ordinary linear or aligned
 * dimensions, inheriting the base's kind, direction and style (AutoCAD's
 * DIMCONTINUEMODE 0 default), placed automatically from the base.
 *
 * The prompt loop is AutoCAD's: with a base already in hand it asks for a
 * second extension line origin over and over, offering `[Undo/Select]` with
 * `Select` as the Enter default; with no base it opens at the Select prompt.
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
    readonly id: string,
    readonly label: string
  ) {}

  onActivate(ctx: ToolContext): void {
    ctx.setCursor("crosshair")
    ctx.selection.clear()
    this.history = []
    const base = lastDimension(ctx.document)
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
      const hover = this.pickDimension(input, ctx)
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
      const base = this.pickDimension(input, ctx)
      // Explicitly selecting a base overrides the default end: the chain grows
      // from whichever extension line was picked closest.
      if (base) this.enterSecond(this.chainFrom(base, input.world, ctx), ctx)
    } else {
      this.place(this.state.chain, input.point, ctx)
    }
    ctx.requestRender()
  }

  commandOptions(): readonly CommandOption[] {
    if (this.state.phase !== "second") return []
    const options: CommandOption[] = []
    if (this.history.length > 0) options.push({ key: "U", label: "Undo" })
    options.push({ key: "S", label: "Select" })
    return options
  }

  invokeOption(key: string, ctx: ToolContext): CommandOptionOutcome {
    if (this.state.phase !== "second") return "unhandled"
    switch (key.toLowerCase()) {
      case "u":
        this.undoLast(ctx)
        return "continue"
      case "s":
        this.enterSelect(ctx)
        return "continue"
      default:
        return "unhandled"
    }
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
      return this.state.hover
        ? entityScenePrimitive(
            ctx.viewport,
            this.state.hover,
            { color: THEME.selected, width: 2 },
            this.styleOf(this.state.hover, ctx)
          )
        : []
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
      this.styleOf(pending, ctx)
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
    return createDimension(chain.kind, chain.origin, point, chain.linePoint, {
      rotation: chain.rotation,
      styleId: chain.styleId,
      layerId: ctx.document.getCurrentLayerId(),
      ...(id !== undefined ? { id } : {}),
    })
  }

  /** Places one link of the chain and re-asks, as AutoCAD's loop does. */
  private place(chain: Chain, point: Vec2, ctx: ToolContext): void {
    const dim = this.pending(chain, point, ctx)
    if (!dim) return
    this.history.push(chain)
    this.enterSecond(advance(chain, this.mode, dim), ctx)
    ctx.execute(new AddEntityCommand(dim))
  }

  /** The Undo keyword: backs out the last dimension *this run* created. */
  private undoLast(ctx: ToolContext): void {
    const previous = this.history.pop()
    if (!previous) return
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
    const spacing = scaledDimStyle(this.styleOf(base, ctx)).baselineSpacing
    const step = V.scale(normal, side * spacing)

    const origin =
      pickPoint !== null
        ? nearerOrigin(base, pickPoint)
        : this.mode === "baseline"
          ? base.first
          : base.second

    return {
      kind: base.kind,
      rotation: base.rotation,
      styleId: base.styleId,
      origin,
      linePoint:
        this.mode === "baseline" ? V.add(base.linePoint, step) : base.linePoint,
      step,
    }
  }

  private styleOf(dim: DimensionEntity, ctx: ToolContext): DimStyle {
    return ctx.document.getDimStyle(dim.styleId) ?? DEFAULT_DIM_STYLE
  }

  private pickDimension(
    input: PointerInput,
    ctx: ToolContext
  ): DimensionEntity | null {
    const hit = ctx.pick(input.world)
    // Only a linear or aligned dimension has extension line origins to chain
    // from; a radial one measures a circle and has no second datum.
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
      fields: [
        {
          id: "point",
          label: "Specify a second extension line origin",
          kind: "coordinate",
        },
      ],
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
        const point = parseCoordinate(typed, {
          lastPoint: this.state.chain.origin,
          relativeByDefault: true,
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
 * Whether a dimension can be chained from: linear and aligned ones can.
 *
 * KNOWN GAP: AutoCAD's DIMBASELINE also "creates a linear, angular, or ordinate
 * dimension". Chaining an angular one steps the *radius* of its arc rather than
 * offsetting a straight line perpendicularly, so it is a different placement
 * rule and separate work; angular dimensions are left out until it exists
 * rather than chained wrongly.
 */
function isChainable(dim: DimensionEntity): boolean {
  return dim.kind === "linear" || dim.kind === "aligned"
}

/** Everything the next link of the chain needs, carried between placements. */
interface Chain {
  readonly kind: DimensionKind
  /** Measurement direction inherited from the base (`linear` dimensions only). */
  readonly rotation: number
  readonly styleId: DimStyleId
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
