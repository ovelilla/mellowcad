import { Vec2, V } from "../../geometry/Vec2"
import { chamferLines } from "../../geometry/primitives"
import {
  createLine,
  carryOverrides,
  carryPlane,
  Entity,
  EntityId,
  LineEntity,
  PolylineEntity,
} from "../../domain/entities"
import {
  ReplaceEntitiesCommand,
  UpdateEntityCommand,
} from "../commands/entityCommands"
import { DynamicInputSession } from "../input/DynamicInput"
import { formatLength } from "../../domain/units"
import type { PromptId } from "../../locales/types"
import type { MessageId } from "../EngineText"
import { ScenePrimitive, StrokeStyle } from "../../scene/types"
import { THEME } from "../../scene/theme"
import { entityScenePrimitive } from "../SceneBuilder"
import { LineCorner, LinePick, lineCorner } from "./lineCorner"
import {
  CornerCut,
  PolylineCorner,
  cutBetweenSegments,
  SegmentsRefusal,
  cutPolylineCorners,
  reportSkipped,
} from "./polylineCorners"
import {
  CornerObject,
  LineAndSegment,
  LineSegmentCut,
  SegmentPick,
  cornerEntity,
  isSegment,
  joinLineToSegment,
  joinable,
  lineAndSegment,
  pickCornerObject,
} from "./cornerObjects"
import {
  CommandOption,
  CommandOptionOutcome,
  KeyInput,
  PointerInput,
  Tool,
  ToolContext,
  ToolQuestion,
  type QuestionInput,
} from "./Tool"

/**
 * AutoCAD's CHAMFER: bevel the corner between two lines, cutting each of them
 * at a set distance from their intersection and joining the cuts with a
 * straight segment. The sibling of FILLET — same flow, straight cut instead of
 * an arc.
 *
 * ```
 *        [D] Distance ──► first distance ──► second distance ──► back
 *  first ──click line──► second ──click line──► chamfer ──► end, or first (Multiple)
 *    └──[P] Polyline──► polyline ──click polyline──► every corner ──► end, or first
 * ```
 *
 * The distances are measured from the corner along each line's *picked* side,
 * so where you click decides which of the four corners is cut. Two straight
 * segments of one polyline are objects too, bevelled within it, and a line
 * with a polyline's segment is joined into the polyline. They persist for
 * the tool's session, like AutoCAD's, and both being 0 simply joins the lines
 * at their intersection — as Shift on the second pick does (apply corner).
 * Multiple keeps asking until Enter, and Undo takes back the last chamfer made
 * in the command; each is one command, folded into the command's undo step.
 */

type ChamferState =
  /** Awaiting the first object (hover-highlighted). */
  | { readonly phase: "first"; readonly hover: CornerObject | null }
  /** First object chosen; awaiting the second (a live preview tracks the cursor). */
  | {
      readonly phase: "second"
      readonly first: CornerObject
      /** Where the first line was clicked — picks which corner to cut. */
      readonly pick1: LinePick
      readonly hover: CornerObject | null
      readonly cursor: LinePick
      /** Shift is held: the second pick applies a corner. */
      readonly corner: boolean
    }
  /** Polyline: awaiting the 2D polyline whose every corner is bevelled. */
  | { readonly phase: "polyline"; readonly hover: PolylineEntity | null }

export class ChamferTool implements Tool {
  readonly id = "chamfer"

  private state: ChamferState = { phase: "first", hover: null }
  /** CHAMFERA and CHAMFERB, kept for the session. */
  private distance1 = 0
  private distance2 = 0
  /** Which distance Distance is asking (object picks paused), or null. */
  private askingDistance: "first" | "second" | null = null
  private multiple = false
  /**
   * What Undo takes back, newest last: a chamfer, or distances given in the
   * command (the ones they replaced).
   */
  private steps: (Distances | "chamfer")[] = []
  /** The distances when Distance was chosen, until both are given. */
  private replaced: Distances = { distance1: 0, distance2: 0 }
  private lastScreen: Vec2 | null = null

  onActivate(ctx: ToolContext): void {
    ctx.setCursor("crosshair")
    ctx.selection.clear()
    this.reset()
    // TRIMMODE is always 1 and CHAMMODE 0 (Distance) here.
    const settings = ctx.document.getSettings()
    ctx.report(
      ctx.text.message("chamferSettings", {
        dist1: formatLength(this.distance1, settings),
        dist2: formatLength(this.distance2, settings),
      })
    )
    this.openKeywordPrompt(ctx)
  }

  /**
   * WHY no Angle, Trim or mEthod: CHAMMODE is always Distance and TRIMMODE 1
   * here, so they are not offered.
   */
  question(): PromptId | ToolQuestion {
    if (this.askingDistance === "first") {
      return { id: "specifyFirstChamferDistance", enter: this.distance1 }
    }
    if (this.askingDistance === "second") {
      return { id: "specifySecondChamferDistance", enter: this.distance1 }
    }
    switch (this.state.phase) {
      case "first":
        return "selectFirstLineOr"
      case "second":
        return "selectSecondLineOrApplyCornerOr"
      case "polyline":
        return "selectPolylineToChamferOr"
    }
  }

  takes(): QuestionInput | null {
    return this.askingDistance ? null : "object"
  }

  onDeactivate(ctx: ToolContext): void {
    this.reset()
    ctx.dynamicInput.close()
  }

  onPointerMove(input: PointerInput, ctx: ToolContext): void {
    this.lastScreen = input.screen
    ctx.dynamicInput.setPosition(input.screen)
    if (this.askingDistance) {
      ctx.requestRender()
      return
    }

    switch (this.state.phase) {
      case "first":
        this.state = {
          phase: "first",
          hover: pickCornerObject(ctx, input.world, null),
        }
        break
      case "second":
        this.state = {
          ...this.state,
          hover: pickCornerObject(ctx, input.world, this.state.first),
          cursor: { world: input.world, screen: input.screen },
          corner: input.shiftKey,
        }
        break
      case "polyline":
        this.state = { phase: "polyline", hover: this.pickPolyline(input, ctx) }
        break
    }
    ctx.requestRender()
  }

  onPointerDown(input: PointerInput, ctx: ToolContext): void {
    if (input.button !== 0 || this.askingDistance) return

    switch (this.state.phase) {
      case "first": {
        const hit = pickCornerObject(ctx, input.world, null)
        if (!hit) return
        const pick = { world: input.world, screen: input.screen }
        this.state = {
          phase: "second",
          first: hit,
          pick1: pick,
          hover: null,
          cursor: pick,
          corner: false,
        }
        ctx.requestRender()
        return
      }
      case "second": {
        const { first, pick1 } = this.state
        const second = pickCornerObject(ctx, input.world, first)
        if (!second) return
        if (isSegment(first) && isSegment(second)) {
          const cut = this.chamferSegments(first, second, input.shiftKey)
          if (typeof cut !== "string") {
            this.done(new UpdateEntityCommand(cut), ctx)
          } else {
            this.refuse(REFUSALS[cut], ctx)
          }
        } else if (!isSegment(first) && !isSegment(second)) {
          const pick2 = { world: input.world, screen: input.screen }
          this.commitChamfer(first, pick1, second, pick2, input.shiftKey, ctx)
        } else {
          const pair = lineAndSegment(first, pick1.world, second, input.world)
          if (pair) this.commitJoin(pair, input.shiftKey, ctx)
        }
        return
      }
      case "polyline": {
        const poly = this.pickPolyline(input, ctx)
        if (poly) this.commitPolyline(poly, ctx)
        return
      }
    }
  }

  onKeyDown(input: KeyInput, ctx: ToolContext): void {
    if (input.key === "Escape") ctx.dynamicInput.close()
  }

  commandOptions(): readonly CommandOption[] {
    if (this.askingDistance) return []
    switch (this.state.phase) {
      case "first":
        return this.multiple
          ? [{ id: "Undo" }, { id: "Polyline" }, { id: "Distance" }]
          : [
              { id: "Undo" },
              { id: "Polyline" },
              { id: "Distance" },
              { id: "Multiple" },
            ]
      case "second":
      case "polyline":
        return [{ id: "Distance" }]
    }
  }

  invokeOption(id: string, ctx: ToolContext): CommandOptionOutcome {
    if (this.askingDistance) return "unhandled"
    if (id === "Distance") {
      this.replaced = { distance1: this.distance1, distance2: this.distance2 }
      this.askDistance("first", ctx)
      return "continue"
    }
    if (this.state.phase !== "first") return "unhandled"
    switch (id) {
      case "Undo":
        this.undoStep(ctx)
        return "continue"
      case "Polyline":
        this.state = { phase: "polyline", hover: null }
        ctx.requestRender()
        return "continue"
      case "Multiple":
        this.multiple = true
        return "continue"
      default:
        return "unhandled"
    }
  }

  wantsSnap(): boolean {
    // Lines are picked by proximity, not precise points — as in FILLET/TRIM.
    return false
  }

  buildOverlay(ctx: ToolContext): ScenePrimitive[] {
    const { viewport } = ctx
    const draw = (entity: Entity, stroke: StrokeStyle) =>
      entityScenePrimitive(viewport, entity, stroke)

    if (this.state.phase === "first") {
      const h = this.state.hover
      return h ? draw(cornerEntity(h), hoverStroke) : []
    }
    if (this.state.phase === "polyline") {
      const h = this.state.hover
      return h ? draw(h, selectedStroke) : []
    }

    const { first, pick1, hover, cursor } = this.state
    const pair =
      hover && lineAndSegment(first, pick1.world, hover, cursor.world)
    if (pair) {
      const cut = joinable(pair) && this.chamferJoin(pair, this.state.corner)
      return cut
        ? draw(joinLineToSegment(pair.line, pair.segment, cut), hoverStroke)
        : [
            ...draw(cornerEntity(first), selectedStroke),
            ...draw(
              cornerEntity(pair.lineFirst ? pair.segment : pair.line),
              hoverStroke
            ),
          ]
    }
    if (isSegment(first)) {
      const cut =
        hover &&
        isSegment(hover) &&
        this.chamferSegments(first, hover, this.state.corner)
      return cut && typeof cut !== "string"
        ? draw(cut, hoverStroke)
        : draw(first.poly, selectedStroke)
    }
    const line1 = first
    const prims = draw(line1, selectedStroke)
    if (!hover || isSegment(hover)) return prims

    const corner = lineCorner(line1, pick1, hover, cursor, viewport)
    const chamfered =
      corner &&
      this.chamfer(corner, line1, hover, this.state.corner, ctx, PREVIEW_ID)
    if (!chamfered || chamfered === "tooLarge") {
      return [...prims, ...draw(hover, hoverStroke)]
    }
    for (const entity of chamfered) {
      prims.push(
        ...draw(
          entity,
          entity.id === PREVIEW_ID
            ? { color: THEME.rubberBand, width: 1 }
            : hoverStroke
        )
      )
    }
    return prims
  }

  private reset(): void {
    this.state = { phase: "first", hover: null }
    this.askingDistance = null
    this.multiple = false
    this.steps = []
  }

  /**
   * The two lines cut back to the bevel, and the bevel (none when both
   * distances are 0, or for a `sharp` corner), back in the frame; `null` when the lines are parallel
   * or a cut line would vanish. A preview gives the bevel a fixed `bevelId`.
   */
  private chamfer(
    corner: LineCorner,
    line1: LineEntity,
    line2: LineEntity,
    sharp: boolean,
    ctx: ToolContext,
    bevelId?: EntityId
  ): Entity[] | "tooLarge" | null {
    const result = chamferLines(
      corner.line1.start,
      corner.line1.end,
      corner.line2.start,
      corner.line2.end,
      corner.pick1,
      corner.pick2,
      sharp ? 0 : this.distance1,
      sharp ? 0 : this.distance2
    )
    if (!result) return null
    const trimmed1 = trimLine(
      corner.line1,
      result.corner,
      result.direction1,
      result.point1
    )
    const trimmed2 = trimLine(
      corner.line2,
      result.corner,
      result.direction2,
      result.point2
    )
    if (!trimmed1 || !trimmed2) return "tooLarge"
    const built: Entity[] = [trimmed1, trimmed2]
    if (!V.equals(result.point1, result.point2)) {
      // AutoCAD puts the bevel on the lines' shared layer, or the current layer
      // when they differ.
      const layer =
        line1.layerId === line2.layerId
          ? line1.layerId
          : ctx.document.getCurrentLayerId()
      built.push(
        carryPlane(
          corner.line1,
          createLine(result.point1, result.point2, layer, bevelId)
        )
      )
    }
    return built.map((entity) => corner.back(entity))
  }

  private commitChamfer(
    line1: LineEntity,
    pick1: LinePick,
    line2: LineEntity,
    pick2: LinePick,
    sharp: boolean,
    ctx: ToolContext
  ): void {
    const corner = lineCorner(line1, pick1, line2, pick2, ctx.viewport)
    if (!corner) {
      ctx.report(ctx.text.message("linesNonCoplanar"), "error")
      this.state = { phase: "first", hover: null }
      ctx.requestRender()
      return
    }
    const chamfered = this.chamfer(corner, line1, line2, sharp, ctx)
    if (!chamfered) return // parallel or collinear — keep prompting
    if (chamfered === "tooLarge") {
      this.refuse("chamferDistanceTooLarge", ctx)
      return
    }
    this.done(new ReplaceEntitiesCommand([line1.id, line2.id], chamfered), ctx)
  }

  /** A line and a polyline's segment joined into the polyline by the bevel. */
  private commitJoin(
    pair: LineAndSegment,
    sharp: boolean,
    ctx: ToolContext
  ): void {
    if (!joinable(pair)) {
      this.refuse("lineAndPolylineNonCoplanar", ctx, false)
      return
    }
    const cut = this.chamferJoin(pair, sharp)
    if (!cut) return // parallel or collinear — keep prompting
    this.done(
      new ReplaceEntitiesCommand(
        [pair.line.id, pair.segment.poly.id],
        [joinLineToSegment(pair.line, pair.segment, cut)]
      ),
      ctx
    )
  }

  /**
   * The bevel between a line and a polyline's segment, the first distance on
   * the one picked first (none when `sharp`); `null` when parallel.
   */
  private chamferJoin(
    { line, linePick, a, b, segmentPick, lineFirst }: LineAndSegment,
    sharp: boolean
  ): LineSegmentCut | null {
    const first = sharp ? 0 : this.distance1
    const second = sharp ? 0 : this.distance2
    const result = lineFirst
      ? chamferLines(
          line.start,
          line.end,
          a,
          b,
          linePick,
          segmentPick,
          first,
          second
        )
      : chamferLines(
          a,
          b,
          line.start,
          line.end,
          segmentPick,
          linePick,
          first,
          second
        )
    if (!result) return null
    const { corner, direction1, direction2, point1, point2 } = result
    return lineFirst
      ? {
          corner,
          lineSide: direction1,
          segmentSide: direction2,
          onLine: point1,
          onSegment: point2,
          bulge: 0,
        }
      : {
          corner,
          lineSide: direction2,
          segmentSide: direction1,
          onLine: point2,
          onSegment: point1,
          bulge: 0,
        }
  }

  /**
   * A corner that cannot be made: said, and Multiple asks for the first
   * object again; otherwise the input is `*Invalid*` (unless the console says
   * only why, as for a line and a polyline apart) and the command ends.
   */
  private refuse(message: MessageId, ctx: ToolContext, invalid = true): void {
    ctx.report(ctx.text.message(message), "error")
    if (this.multiple) {
      this.state = { phase: "first", hover: null }
      ctx.requestRender()
      return
    }
    if (invalid) ctx.report(ctx.text.message("invalid"), "error")
    ctx.dynamicInput.close()
    ctx.endCommand()
  }

  /**
   * Polyline: bevels every corner where two line segments meet, the first
   * distance along the segment coming into it.
   */
  private commitPolyline(poly: PolylineEntity, ctx: ToolContext): void {
    const result = cutPolylineCorners(poly, {
      lines: (corner) => this.bevel(corner, false),
    })
    ctx.report(ctx.text.message("linesChamfered", { count: result.cut }))
    reportSkipped(result, ctx)
    if (result.polyline) {
      this.done(new UpdateEntityCommand(result.polyline), ctx)
    } else if (this.multiple) {
      this.state = { phase: "first", hover: null }
      ctx.requestRender()
    } else {
      ctx.dynamicInput.close()
      ctx.endCommand()
    }
  }

  /** Executes a chamfer; the command ends, or Multiple asks for the next. */
  private done(
    command: ReplaceEntitiesCommand | UpdateEntityCommand,
    ctx: ToolContext
  ): void {
    this.steps.push("chamfer")
    if (this.multiple) {
      this.state = { phase: "first", hover: null }
      ctx.execute(command)
      ctx.requestRender()
      return
    }
    ctx.execute(command)
    ctx.dynamicInput.close()
    ctx.endCommand()
  }

  /**
   * Undo takes back the last chamfer or distances of this command, and only
   * those; back at its start AutoCAD says so.
   */
  private undoStep(ctx: ToolContext): void {
    const step = this.steps.pop()
    if (step === "chamfer") ctx.undo()
    else if (step)
      ({ distance1: this.distance1, distance2: this.distance2 } = step)
    if (this.steps.length === 0) {
      ctx.report(ctx.text.message("commandCompletelyUndone"))
    }
    ctx.requestRender()
  }

  /**
   * Two segments of one polyline bevelled within it, the first distance along
   * the one picked first; or why they cannot be.
   */
  private chamferSegments(
    first: SegmentPick,
    second: SegmentPick,
    sharp: boolean
  ): PolylineEntity | SegmentsRefusal {
    return cutBetweenSegments(first.poly, first.index, second.index, (corner) =>
      this.bevel(corner, sharp)
    )
  }

  /** A polyline corner bevelled at the two distances (none when `sharp`). */
  private bevel(
    { from, corner, to }: PolylineCorner,
    sharp: boolean
  ): CornerCut | null {
    const cut = chamferLines(
      from,
      corner,
      corner,
      to,
      from,
      to,
      sharp ? 0 : this.distance1,
      sharp ? 0 : this.distance2
    )
    return cut && { entry: cut.point1, exit: cut.point2, bulge: 0 }
  }

  private pickPolyline(
    input: PointerInput,
    ctx: ToolContext
  ): PolylineEntity | null {
    const hit = ctx.pick(input.world)
    return hit?.type === "polyline" ? hit : null
  }

  /** A prompt answered by a pick or a keyword, its keywords on the tooltip. */
  private openKeywordPrompt(ctx: ToolContext): void {
    const session: DynamicInputSession = { fields: [], commit: () => {} }
    ctx.dynamicInput.open(session)
    ctx.dynamicInput.setPosition(this.lastScreen ?? { x: 0, y: 0 })
  }

  /**
   * Distance asks the first distance, then the second, whose `<default>` is
   * the first one just given, as AutoCAD's is.
   */
  private askDistance(which: "first" | "second", ctx: ToolContext): void {
    this.askingDistance = which
    const session: DynamicInputSession = {
      fields: [
        {
          id: "distance",
          prompt: which === "first" ? "firstDistance" : "secondDistance",
          kind: "distance",
        },
      ],
      commit: (values, commitCtx) =>
        this.setDistance(which, values.distance, commitCtx),
    }
    ctx.dynamicInput.open(session)
    ctx.dynamicInput.setDefault("distance", this.distance1)
    ctx.dynamicInput.setPosition(this.lastScreen ?? { x: 0, y: 0 })
    ctx.requestRender()
  }

  /** Then the prompt Distance was chosen at, asked again. */
  private setDistance(
    which: "first" | "second",
    value: number,
    ctx: ToolContext
  ): void {
    const valid = Number.isFinite(value) && value >= 0
    if (which === "first") {
      if (valid) this.distance1 = value
      this.askDistance("second", ctx)
      return
    }
    if (valid) this.distance2 = value
    this.steps.push(this.replaced)
    this.askingDistance = null
    this.openKeywordPrompt(ctx)
    ctx.requestRender()
  }
}

interface Distances {
  readonly distance1: number
  readonly distance2: number
}

const REFUSALS: Readonly<Record<SegmentsRefusal, MessageId>> = {
  parallel: "linesParallel",
  diverge: "linesDiverge",
  tooLarge: "chamferDistanceTooLarge",
}

const hoverStroke: StrokeStyle = { color: THEME.entityHover, width: 2 }
const selectedStroke: StrokeStyle = { color: THEME.selected, width: 2 }
/** The preview bevel's id, reused every frame so a preview burns no entity ids. */
const PREVIEW_ID = "chamfer-preview"

/**
 * Rebuilds `line` trimmed/extended to end at `cut`: the endpoint on the picked
 * side (farther from the corner along `dir`) is kept, the other becomes the cut
 * point. Preserves the line's id and layer. `null` when the cut point is not
 * short of the kept end: the line would vanish.
 */
function trimLine(
  line: LineEntity,
  corner: Vec2,
  dir: Vec2,
  cut: Vec2
): LineEntity | null {
  const keepEnd =
    V.dot(V.sub(line.end, corner), dir) >= V.dot(V.sub(line.start, corner), dir)
      ? line.end
      : line.start
  if (V.dot(V.sub(keepEnd, cut), dir) <= 0) return null
  return carryOverrides(line, createLine(keepEnd, cut, line.layerId, line.id))
}
