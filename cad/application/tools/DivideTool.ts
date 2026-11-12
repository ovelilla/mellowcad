import { Vec2, V } from "../../geometry/Vec2"
import {
  BlockDefinition,
  CurveWalk,
  Entity,
  createInsert,
  createPoint,
  curveWalk,
  divideDistances,
  findBlockNamed,
  MAX_DIVISIONS,
  measureDistances,
  withElevation,
} from "../../domain/entities"
import { parseNumber } from "../../domain/units"
import type { PromptId } from "../../locales/types"
import type { MessageId } from "../EngineText"
import type { ScenePrimitive } from "../../scene/types"
import { AddEntitiesCommand } from "../commands/entityCommands"
import { withCurrentProperties } from "./currentProperties"
import { rollover } from "./ghostLook"
import { ucsTurn } from "./PointTool"
import {
  CommandOption,
  CommandOptionOutcome,
  PointerInput,
  QuestionInput,
  Tool,
  ToolContext,
  ToolQuestion,
} from "./Tool"
import { typedPick } from "./typedPick"

/** DIVIDE splits by a count, MEASURE steps by a length. */
export type DivideMode = "divide" | "measure"

type DivideState =
  | { readonly phase: "pick"; readonly hover: Entity | null }
  | {
      readonly phase: "amount"
      readonly walk: CurveWalk
      /** Whether MEASURE runs from the curve's end, the one nearer the pick. */
      readonly backwards: boolean
      /** Set once Block named one: its count or length prompt then lists no keyword. */
      readonly block: {
        readonly block: BlockDefinition
        readonly align: boolean
      } | null
    }
  | {
      readonly phase: "blockName" | "align"
      readonly walk: CurveWalk
      readonly backwards: boolean
      readonly block: BlockDefinition | null
    }

/**
 * AutoCAD's DIVIDE and MEASURE (divide/p01–p14): `Select object to divide:`
 * takes one line, arc, circle, ellipse, polyline, 3D polyline or spline,
 * says `Cannot divide that object.` of anything else and ends, as a pick on
 * nothing ends it (`*Invalid*`); then the count, 2 to 32767, or the length,
 * positive, or Block: a block's name, `Align block with object? [Yes/No]
 * <Y>:` and the count or length again. It adds point objects (or references
 * of the block, its attributes left out) on the curve and makes them the
 * Previous set. MEASURE starts at the end nearer the pick (a circle at its
 * angle 0, counter-clockwise; a closed curve at its start, backwards when
 * the pick lies past its middle) and leaves `Object isn't that long.` or
 * `Object is too long.` when no point or too many would be made.
 */
export class DivideTool implements Tool {
  private state: DivideState = { phase: "pick", hover: null }
  private lastScreen: Vec2 | null = null

  constructor(
    readonly mode: DivideMode,
    readonly id: string
  ) {}

  onActivate(ctx: ToolContext): void {
    ctx.setCursor("pickbox")
    this.state = { phase: "pick", hover: null }
    // A preselection is dropped: the prompt picks one object of its own.
    ctx.selection.clear()
    ctx.dynamicInput.open({ fields: [], commit: () => {} })
  }

  onDeactivate(ctx: ToolContext): void {
    ctx.dynamicInput.close()
  }

  onPointerMove(input: PointerInput, ctx: ToolContext): void {
    this.lastScreen = input.screen
    if (this.state.phase === "pick") {
      const hover = ctx.pick(input.world)
      if (hover?.id !== this.state.hover?.id) {
        this.state = { phase: "pick", hover }
        ctx.requestRender()
      }
    }
    ctx.dynamicInput.setPosition(input.screen)
  }

  onPointerDown(input: PointerInput, ctx: ToolContext): void {
    if (input.button !== 0 || this.state.phase !== "pick") return
    this.pickAt(input.world, ctx)
  }

  wantsSnap(): boolean {
    return false
  }

  question(): PromptId | ToolQuestion {
    const measuring = this.mode === "measure"
    switch (this.state.phase) {
      case "pick":
        return measuring ? "selectObjectToMeasure" : "selectObjectToDivide"
      case "amount":
        return this.amountPrompt()
      case "blockName":
        return "blockToInsert"
      case "align":
        return { id: "alignBlockWithObject", enter: "undoYes" }
    }
  }

  /** As AutoCAD 2027's console refuses them (divide/p06, p10, p13). */
  takes(): QuestionInput | null {
    switch (this.state.phase) {
      case "pick":
        return "singleObject"
      case "amount":
        return this.mode === "measure"
          ? "distance"
          : {
              refusal: this.state.block
                ? "requiresIntegerBetween"
                : "requiresIntegerBetweenOrKeyword",
              values: { min: 2, max: MAX_DIVISIONS },
            }
      case "blockName":
        return null
      case "align":
        return "keyword"
    }
  }

  /** A point typed at the object prompt picks there (divide/p01). */
  answerTyped(text: string, ctx: ToolContext): boolean {
    if (this.state.phase !== "pick") return false
    const point = typedPick(text, ctx)
    if (!point) return false
    this.pickAt(point, ctx)
    return true
  }

  commandOptions(): readonly CommandOption[] {
    switch (this.state.phase) {
      case "amount":
        return this.state.block ? [] : [{ id: "Block" }]
      case "align":
        return [{ id: "Yes" }, { id: "No" }]
      default:
        return []
    }
  }

  defaultOption(): string | null {
    return this.state.phase === "align" ? "Yes" : null
  }

  invokeOption(id: string, ctx: ToolContext): CommandOptionOutcome {
    const state = this.state
    if (state.phase === "amount" && !state.block && id === "Block") {
      this.state = { ...state, phase: "blockName", block: null }
      this.openName(ctx)
      return "continue"
    }
    if (
      state.phase === "align" &&
      state.block &&
      (id === "Yes" || id === "No")
    ) {
      this.state = {
        phase: "amount",
        walk: state.walk,
        backwards: state.backwards,
        block: { block: state.block, align: id === "Yes" },
      }
      this.openAmount(ctx)
      return "continue"
    }
    return "unhandled"
  }

  /**
   * Enter at the alignment is its `<Y>`; at the count, the length or the
   * name it is refused and asked again (divide/p05, p06, p13).
   */
  onEnter(ctx: ToolContext): boolean {
    switch (this.state.phase) {
      case "pick":
        return false
      case "align":
        this.invokeOption("Yes", ctx)
        return true
      case "blockName":
        ctx.report(ctx.text.message("blockNameNotValid"), "error")
        return true
      case "amount":
        ctx.report(this.amountRefusal(ctx), "error")
        return true
    }
  }

  buildOverlay(ctx: ToolContext): ScenePrimitive[] {
    return this.state.phase === "pick" && this.state.hover
      ? rollover(ctx, this.state.hover)
      : []
  }

  private pickAt(world: Vec2, ctx: ToolContext): void {
    const hit = ctx.pick(world)
    if (!hit) {
      // A pick on nothing ends the command (divide/p07).
      ctx.report(ctx.text.message("invalid"), "error")
      ctx.endCommand()
      return
    }
    // A circle from the UCS's X: SNAPANG, where AutoCAD starts it, is not
    // modelled, and is 0 there (divide/p04).
    const walk = curveWalk(hit, ucsTurn(ctx.ucs))
    if (!walk) {
      const refusal: MessageId =
        this.mode === "measure" ? "cannotMeasureObject" : "cannotDivideObject"
      ctx.report(ctx.text.message(refusal), "error")
      ctx.report(ctx.text.message("invalid"), "error")
      ctx.endCommand()
      return
    }
    this.state = {
      phase: "amount",
      walk,
      backwards: measuresBackwards(hit, walk, world),
      block: null,
    }
    this.openAmount(ctx)
  }

  private openAmount(ctx: ToolContext): void {
    const measuring = this.mode === "measure"
    ctx.dynamicInput.open({
      fields: [
        {
          id: "value",
          prompt: this.amountPrompt(),
          kind: measuring ? "distance" : "number",
        },
      ],
      // A number the box reads is checked here too: DIVIDE's count must be
      // written as an integer (`1.5` refused, p10).
      commit: (_values, commitCtx) => {
        if (this.answerAmount(commitCtx)) return
        commitCtx.report(this.amountRefusal(commitCtx), "error")
        this.openAmount(commitCtx)
      },
      commitRaw: (commitCtx) => this.answerAmount(commitCtx),
    })
    ctx.dynamicInput.setPosition(this.lastScreen ?? { x: 0, y: 0 })
  }

  /** The words `takes()` refuses the count or the length in. */
  private amountRefusal(ctx: ToolContext): string {
    if (this.mode === "measure") {
      return ctx.text.message("requiresDistance", {
        points: "two",
        keyword:
          this.state.phase === "amount" && this.state.block ? "no" : "yes",
      })
    }
    return ctx.text.message(
      this.state.phase === "amount" && this.state.block
        ? "requiresIntegerBetween"
        : "requiresIntegerBetweenOrKeyword",
      { min: 2, max: MAX_DIVISIONS }
    )
  }

  private amountPrompt(): PromptId {
    const plain = this.state.phase === "amount" && this.state.block !== null
    if (this.mode === "measure")
      return plain ? "measureLength" : "measureLengthOr"
    return plain ? "divideCount" : "divideCountOr"
  }

  private answerAmount(ctx: ToolContext): boolean {
    if (this.state.phase !== "amount") return false
    const text = ctx.dynamicInput.getText("value").trim()
    if (this.mode === "divide") {
      // Enter, a fraction or a word: refused in the prompt's words (p06, p10).
      if (!/^[-+]?\d+$/.test(text)) return false
      const count = Number(text)
      if (count < 2 || count > MAX_DIVISIONS) return false
      this.place(divideDistances(this.state.walk, count), ctx)
      return true
    }
    const length = text === "" ? null : parseNumber(text)
    if (length === null || !Number.isFinite(length)) return false
    if (length <= 0) {
      ctx.report(ctx.text.message("positiveNonzero"), "error")
      return true
    }
    const distances = measureDistances(
      this.state.walk,
      length,
      this.state.backwards
    )
    if (distances === "tooShort" || distances === "tooMany") {
      ctx.report(
        ctx.text.message(
          distances === "tooShort" ? "objectNotThatLong" : "objectTooLong"
        ),
        "error"
      )
      ctx.endCommand()
      return true
    }
    this.place(distances, ctx)
    return true
  }

  private openName(ctx: ToolContext): void {
    ctx.dynamicInput.open({
      fields: [{ id: "name", prompt: "blockToInsert", kind: "text" }],
      commit: () => {},
      commitRaw: (commitCtx) => {
        const state = this.state
        if (state.phase !== "blockName") return false
        const name = commitCtx.dynamicInput.getText("name").trim()
        if (name === "") {
          commitCtx.report(commitCtx.text.message("blockNameNotValid"), "error")
          return true
        }
        const block = findBlockNamed(commitCtx.document.getBlocks(), name)
        if (!block) {
          commitCtx.report(
            commitCtx.text.message("cannotFindBlock", { name }),
            "error"
          )
          return true
        }
        this.state = { ...state, phase: "align", block }
        commitCtx.dynamicInput.open({ fields: [], commit: () => {} })
        return true
      },
    })
    ctx.dynamicInput.setPosition(this.lastScreen ?? { x: 0, y: 0 })
  }

  /** The points or references at `distances` along the curve, one command, the Previous set. */
  private place(distances: readonly number[], ctx: ToolContext): void {
    if (this.state.phase !== "amount") return
    const { walk, block } = this.state
    const layerId = ctx.document.getCurrentLayerId()
    // WHY as POINT turns DXF 50 (divide/p14: −30° in UCS Z 30).
    const angle = -ucsTurn(ctx.ucs)
    const made = distances.map((distance) => {
      const { point, direction } = walk.at(distance)
      if (!block) {
        // No THICKNESS: DIVIDE's points have none (divide/p14).
        return withCurrentProperties(createPoint(point, layerId, angle), ctx)
      }
      return withCurrentProperties(
        withElevation(
          createInsert(block.block.id, point, {
            layerId,
            // Aligned, along the curve's own way, whichever end MEASURE ran
            // from (divide/p09, p12); else the UCS's X.
            rotation: block.align ? direction : ucsTurn(ctx.ucs),
          }),
          point.z
        ),
        ctx
      )
    })
    if (made.length > 0) ctx.execute(new AddEntitiesCommand(made))
    // After: the runtime drops from the Previous set what the drawing lacks.
    ctx.rememberSelection(made.map((entity) => entity.id))
    ctx.endCommand()
  }
}

/**
 * Whether MEASURE runs from the curve's end: an open one's when the pick is
 * nearer it than the start (divide/p02, p03, p12); a closed one's, backwards
 * round, when the pick lies past its middle (an ellipse picked half round,
 * a closed spline, divide/p11); never a circle's (p02).
 */
function measuresBackwards(
  entity: Entity,
  walk: CurveWalk,
  pick: Vec2
): boolean {
  if (entity.type === "circle") return false
  if (walk.closed) return walk.along(pick) >= walk.length / 2
  const start = walk.at(0).point
  const end = walk.at(walk.length).point
  return V.distance(pick, end) < V.distance(pick, start)
}
