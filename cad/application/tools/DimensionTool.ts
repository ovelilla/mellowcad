import { Vec2, V } from "../../geometry/Vec2"
import { Vec3, withZ } from "../../geometry/Vec3"
import {
  closestPointOnSegment,
  normalizeDegrees,
} from "../../geometry/primitives"
import {
  arcEndPoint,
  arcStartPoint,
  createDimension,
  DimensionEntity,
  DimensionKind,
  dimensionMeasurement,
  dimensionText,
  Entity,
  entityZAt,
  onPlaneOf,
  polylineSegmentGeometries,
  readsInPlan,
} from "../../domain/entities"
import { ucsAngleToWorld, worldPointToUcs } from "../../domain/ucs"
import { AddEntityCommand } from "../commands/entityCommands"
import { DynamicInputSession } from "../input/DynamicInput"
import type { PromptId } from "../../locales/types"
import {
  isCoordinateExpression,
  parseCoordinate,
} from "../input/coordinateInput"
import { entityScenePrimitive } from "../SceneBuilder"
import {
  openDimensionTextAngleInput,
  openDimensionTextInput,
} from "./dimensionTextOptions"
import { ScenePrimitive } from "../../scene/types"
import { THEME } from "../../scene/theme"
import {
  CommandOption,
  CommandOptionOutcome,
  PointerInput,
  QuestionInput,
  Tool,
  ToolContext,
  ToolQuestion,
} from "./Tool"
import { withCurrentProperties } from "./currentProperties"

/**
 * AutoCAD's DIMLINEAR and DIMALIGNED, one class parameterised by which of them
 * it is — they share every prompt, and differ only in what sets the direction
 * measured along and in which keywords the location prompt offers.
 *
 * The prompt sequence is AutoCAD's, as its 2023 console asks it: `Specify
 * first extension line origin or <select object>:` (Enter: `Select object to
 * dimension:`, its endpoints taken), `Specify second extension line origin:`
 * and `Non-associative dimension created.`, then `Specify dimension line
 * location or [Text/Angle/Horizontal/Vertical/Rotated]:` — DIMALIGNED, and
 * DIMLINEAR once Horizontal, Vertical or Rotated has set the direction,
 * offering only `[Text/Angle]` —, whose Text asks `Enter dimension text
 * <100.00>:`, Angle `Specify angle of dimension text:` and Rotated `Specify
 * angle of dimension line <0>:`. The command ends the moment the location is
 * picked, saying `Dimension text = 100.00`.
 *
 * Left free until Horizontal, Vertical or Rotated says otherwise, a linear
 * dimension picks its direction from where the location is dragged: pull the
 * dimension line up or down and it measures horizontally, pull it left or right
 * and it measures vertically. That is the default gesture users rely on.
 *
 * AutoCAD's **Mtext** keyword is absent: it edits the dimension text in the
 * multiline editor, and a dimension's text here is a single line. The
 * single-line **Text** option covers the same need.
 */
export class DimensionTool implements Tool {
  private state: DimensionToolState = { phase: "first" }

  /** Text override and text angle carried into the dimension being placed. */
  private text: string | undefined
  private textAngle: number | undefined
  /**
   * The measurement direction, or null while it still follows the cursor.
   * Aligned dimensions ignore it entirely.
   */
  private rotation: number | null = null

  private lastScreen: Vec2 | null = null
  /** The measurement Text offers as its `<default>`. */
  private measured = ""

  constructor(
    private readonly kind: DimensionKind,
    readonly id: string
  ) {}

  onActivate(ctx: ToolContext): void {
    ctx.setCursor("crosshair")
    ctx.selection.clear()
    this.state = { phase: "first" }
    this.text = undefined
    this.textAngle = undefined
    this.rotation = null
    this.openFirstInput(ctx)
  }

  onDeactivate(ctx: ToolContext): void {
    this.state = { phase: "first" }
    ctx.dynamicInput.close()
  }

  question(): PromptId | ToolQuestion {
    const state = this.state
    switch (state.phase) {
      case "first":
        return "firstExtensionOrigin"
      case "select":
        return "selectObjectToDimension"
      case "second":
        return "secondExtensionOrigin"
      case "line":
        switch (state.prompt) {
          case "text":
            return {
              id: "enterDimensionText",
              enter: { name: this.measured },
            }
          case "textAngle":
            return this.kind === "aligned"
              ? "dimensionTextAngle"
              : "specifyAngleOfDimensionText"
          case null:
            return "dimensionLineLocationOr"
        }
        break
      case "rotated":
        return {
          id: "dimensionLineAngle",
          enter: {
            angle: normalizeDegrees(((this.rotation ?? 0) * 180) / Math.PI),
          },
        }
    }
  }

  /** As AutoCAD 2023's console refuses a dimension's answers. */
  takes(): QuestionInput | null {
    const state = this.state
    switch (state.phase) {
      case "select":
        return "singleObject"
      case "rotated":
        return { refusal: "invalidInputCapital" }
      case "line":
        if (state.prompt === "textAngle") {
          return { refusal: "invalidInputCapital" }
        }
        return state.prompt === "text" ? null : { refusal: "invalidPointInput" }
      default:
        return { refusal: "invalidPointInput" }
    }
  }

  onPointerMove(input: PointerInput, ctx: ToolContext): void {
    this.lastScreen = input.screen
    if (this.state.phase === "select") {
      const hover = this.pickMeasurable(input, ctx)
      if (hover?.id !== this.state.hover?.id) {
        this.state = { ...this.state, hover: hover ?? null }
      }
    } else if (this.state.phase === "second" || this.state.phase === "line") {
      this.state = { ...this.state, cursor: input.point }
    }
    ctx.dynamicInput.setPosition(input.screen)
    ctx.requestRender()
  }

  onPointerDown(input: PointerInput, ctx: ToolContext): void {
    if (input.button !== 0) return

    switch (this.state.phase) {
      case "first":
        this.enterSecond(input.point, ctx)
        break
      case "select": {
        const origins = this.pickOrigins(input, ctx)
        if (origins) this.enterLine(origins[0], origins[1], ctx)
        else ctx.report(ctx.text.message("noObjectSelected"))
        break
      }
      case "second":
        this.enterLineFromPoints(this.state.first, input.point, ctx)
        break
      case "line":
        this.place(input.point, ctx)
        break
    }
    ctx.requestRender()
  }

  commandOptions(): readonly CommandOption[] {
    if (this.state.phase !== "line" || this.state.prompt !== null) return []
    const options: CommandOption[] = [{ id: "Text" }, { id: "Angle" }]
    // Once the direction is set the prompt offers the text keywords alone.
    if (this.kind === "linear" && this.rotation === null) {
      options.push({ id: "Horizontal" }, { id: "Vertical" }, { id: "Rotated" })
    }
    return options
  }

  invokeOption(id: string, ctx: ToolContext): CommandOptionOutcome {
    if (this.state.phase !== "line") return "unhandled"
    switch (id) {
      case "Text":
        this.measured = measurementOf(this.offered(this.state, ctx), ctx)
        this.state = { ...this.state, prompt: "text" }
        this.openTextInput(ctx)
        return "continue"
      case "Angle":
        this.state = { ...this.state, prompt: "textAngle" }
        this.openTextAngleInput(ctx)
        return "continue"
      case "Horizontal":
        if (this.kind !== "linear") return "unhandled"
        this.setRotation(0, ctx)
        return "continue"
      case "Vertical":
        if (this.kind !== "linear") return "unhandled"
        this.setRotation(Math.PI / 2, ctx)
        return "continue"
      case "Rotated": {
        if (this.kind !== "linear") return "unhandled"
        const { first, second } = this.state
        this.state = { phase: "rotated", first, second }
        this.openRotatedInput(ctx)
        return "continue"
      }
      default:
        return "unhandled"
    }
  }

  getConstraintAnchor(): Vec2 | null {
    if (this.measuresAngle()) return null
    if (this.state.phase === "second") return this.state.first
    if (this.state.phase === "line") return this.state.first
    return null
  }

  wantsSnap(): boolean {
    // The origins and the dimension line are point prompts; picking an object
    // to dimension is not, and an angle's two points are the runtime's.
    return this.state.phase !== "select" && !this.measuresAngle()
  }

  /** The dimension line's angle or the text's: two points of their own. */
  private measuresAngle(): boolean {
    const state = this.state
    return (
      state.phase === "rotated" ||
      (state.phase === "line" && state.prompt === "textAngle")
    )
  }

  buildOverlay(ctx: ToolContext): ScenePrimitive[] {
    const { viewport } = ctx
    const rubber = { color: THEME.rubberBand, width: 1 }

    switch (this.state.phase) {
      case "select":
        return this.state.hover
          ? entityScenePrimitive(viewport, this.state.hover, {
              color: THEME.selected,
              width: 2,
            })
          : []
      case "second":
        return [
          {
            kind: "segment",
            a: viewport.worldToScreen(this.state.first),
            b: viewport.worldToScreen(this.state.cursor),
            stroke: rubber,
          },
        ]
      case "line":
        return entityScenePrimitive(
          viewport,
          this.pending(this.state, this.state.cursor, ctx),
          rubber,
          { dimStyle: this.style(ctx) }
        )
      case "rotated":
        return [
          {
            kind: "segment",
            a: viewport.worldToScreen(this.state.first),
            b: viewport.worldToScreen(this.state.second),
            stroke: rubber,
          },
        ]
      default:
        return []
    }
  }

  /**
   * The dimension whose measurement Text offers: the one being dragged, or —
   * while the cursor still sits on the origins and that measures nothing —
   * the one along their longer extent, which is what the drag will measure.
   */
  private offered(
    state: Extract<DimensionToolState, { phase: "line" }>,
    ctx: ToolContext
  ): DimensionEntity {
    const pending = this.pending(state, state.cursor, ctx)
    if (this.kind !== "linear" || this.rotation !== null) return pending
    if (dimensionMeasurement(pending) > 1e-9) return pending
    const first = worldPointToUcs(ctx.ucs, state.first)
    const second = worldPointToUcs(ctx.ucs, state.second)
    const local =
      Math.abs(second.x - first.x) >= Math.abs(second.y - first.y)
        ? 0
        : Math.PI / 2
    return { ...pending, rotation: ucsAngleToWorld(ctx.ucs, local) }
  }

  /** The dimension as it stands while the location is dragged. */
  private pending(
    state: Extract<DimensionToolState, { phase: "line" }>,
    linePoint: Vec2,
    ctx: ToolContext
  ): DimensionEntity {
    return createDimension(this.kind, state.first, state.second, linePoint, {
      rotation: this.resolveRotation(state, linePoint, ctx),
      text: this.text,
      textAngle: this.textAngle,
      styleId: ctx.document.getCurrentDimStyleId(),
      layerId: ctx.document.getCurrentLayerId(),
      id: DIM_PREVIEW_ID,
    })
  }

  /**
   * The measurement direction. A keyword (Horizontal / Vertical / Rotated) wins;
   * otherwise the drag decides, as AutoCAD's DIMLINEAR does: pulling the
   * location out to the side of the two origins measures vertically, pulling it
   * above or below them measures horizontally.
   *
   * What is compared is how far the location escapes the *box* the origins span,
   * not its offset from their midpoint. For a vertical pair that box has no
   * width, so any sideways drag immediately means "measure the height"; a
   * midpoint comparison instead kept reading the (zero) width until the drag
   * grew past half the line, leaving nothing to preview.
   *
   * Horizontal and vertical are the UCS's, and a Rotated angle is measured
   * from its X axis; what is returned is the world direction.
   */
  private resolveRotation(
    state: Extract<DimensionToolState, { phase: "line" }>,
    linePoint: Vec2,
    ctx: ToolContext
  ): number {
    if (this.rotation !== null) return ucsAngleToWorld(ctx.ucs, this.rotation)
    const first = worldPointToUcs(ctx.ucs, state.first)
    const second = worldPointToUcs(ctx.ucs, state.second)
    const at = worldPointToUcs(ctx.ucs, linePoint)
    const escapeX = distanceOutside(at.x, first.x, second.x)
    const escapeY = distanceOutside(at.y, first.y, second.y)
    let local: number
    if (escapeX === 0 && escapeY === 0) {
      // Still between the origins: neither axis is indicated yet, so fall back
      // to whichever the cursor leans towards.
      const mid = V.midpoint(first, second)
      local = Math.abs(at.y - mid.y) >= Math.abs(at.x - mid.x) ? 0 : Math.PI / 2
    } else {
      local = escapeY >= escapeX ? 0 : Math.PI / 2
    }
    return ucsAngleToWorld(ctx.ucs, local)
  }

  private style(ctx: ToolContext) {
    return ctx.document.getDimStyle(ctx.document.getCurrentDimStyleId())
  }

  private enterSecond(first: Vec3, ctx: ToolContext): void {
    this.state = { phase: "second", first, cursor: first }
    this.openSecondInput(ctx)
  }

  private enterLine(first: Vec3, second: Vec2, ctx: ToolContext): void {
    this.state = { phase: "line", first, second, cursor: second, prompt: null }
    this.openLineInput(ctx)
  }

  /** Origins given as points: nothing ties the dimension to an object. */
  private enterLineFromPoints(
    first: Vec3,
    second: Vec2,
    ctx: ToolContext
  ): void {
    ctx.report(ctx.text.message("nonAssociativeDimension"))
    this.enterLine(first, second, ctx)
  }

  private setRotation(rotation: number, ctx: ToolContext): void {
    this.rotation = rotation
    if (this.state.phase === "rotated") {
      this.enterLine(this.state.first, this.state.second, ctx)
    } else if (this.state.phase === "line") {
      this.state = { ...this.state, prompt: null }
      this.openLineInput(ctx)
    }
  }

  /**
   * Creates the dimension and ends the command, as AutoCAD does. It lies at
   * the height of the point that places its dimension line, not at its
   * origins': "the dimension is always created at the current elevation" when
   * the origins are snapped on objects above it.
   */
  private place(linePoint: Vec3, ctx: ToolContext): void {
    if (this.state.phase !== "line") return
    const dim = onPlaneOf(
      createDimension(
        this.kind,
        this.state.first,
        this.state.second,
        linePoint,
        {
          rotation: this.resolveRotation(this.state, linePoint, ctx),
          text: this.text,
          textAngle: this.textAngle,
          styleId: ctx.document.getCurrentDimStyleId(),
          layerId: ctx.document.getCurrentLayerId(),
        }
      ),
      linePoint
    )
    ctx.execute(new AddEntityCommand(withCurrentProperties(dim, ctx)))
    ctx.report(
      ctx.text.message("dimensionTextIs", { text: measurementOf(dim, ctx) })
    )
    ctx.endCommand()
  }

  /**
   * The object under the cursor whose endpoints a dimension can be taken from:
   * one in a plane parallel to the UCS's XY plane, where the dimension lies.
   */
  private pickMeasurable(input: PointerInput, ctx: ToolContext): Entity | null {
    const hit = ctx.pick(input.world)
    return hit && readsInPlan(hit) && measurableOrigins(hit, input.world)
      ? hit
      : null
  }

  private pickOrigins(
    input: PointerInput,
    ctx: ToolContext
  ): [Vec3, Vec3] | null {
    const hit = this.pickMeasurable(input, ctx)
    return hit ? measurableOrigins(hit, input.world) : null
  }

  private openFirstInput(ctx: ToolContext): void {
    this.openCoordinate(ctx, "point", "firstExtensionOrigin", (commitCtx) =>
      this.commitFirst(commitCtx)
    )
  }

  private commitFirst(ctx: ToolContext): boolean {
    const typed = ctx.dynamicInput.getText("point").trim()
    if (typed.length === 0) {
      // Enter at the first prompt switches to picking a whole object.
      this.state = { phase: "select", hover: null }
      ctx.dynamicInput.open({ fields: [], commit: () => {} })
      return true
    }
    const point = this.parsePoint(typed, null, ctx)
    if (!point) return false
    this.enterSecond(point, ctx)
    return true
  }

  private openSecondInput(ctx: ToolContext): void {
    this.openCoordinate(ctx, "point", "secondExtensionOrigin", (commitCtx) => {
      if (this.state.phase !== "second") return false
      const typed = commitCtx.dynamicInput.getText("point").trim()
      const point = this.parsePoint(typed, this.state.first, commitCtx)
      if (!point) return false
      this.enterLineFromPoints(this.state.first, point, commitCtx)
      return true
    })
  }

  private openLineInput(ctx: ToolContext): void {
    this.openCoordinate(ctx, "point", "dimensionLineLocation", (commitCtx) => {
      if (this.state.phase !== "line") return false
      const typed = commitCtx.dynamicInput.getText("point").trim()
      const point = this.parsePoint(typed, this.state.second, commitCtx)
      if (!point) return false
      this.place(point, commitCtx)
      return true
    })
  }

  private openTextInput(ctx: ToolContext): void {
    openDimensionTextInput(
      ctx,
      this.lastScreen,
      this.text,
      (text, commitCtx) => {
        this.text = text
        this.returnToLine(commitCtx)
      }
    )
  }

  private openTextAngleInput(ctx: ToolContext): void {
    openDimensionTextAngleInput(
      ctx,
      this.lastScreen,
      this.textAngle,
      (radians, commitCtx) => {
        this.textAngle = radians
        this.returnToLine(commitCtx)
      }
    )
  }

  /** Back to the location prompt once a sub-prompt has been answered. */
  private returnToLine(ctx: ToolContext): void {
    if (this.state.phase !== "line") return
    this.state = { ...this.state, prompt: null }
    this.openLineInput(ctx)
  }

  private openRotatedInput(ctx: ToolContext): void {
    const session: DynamicInputSession = {
      fields: [
        {
          id: "angle",
          prompt: "dimensionLineAngle",
          kind: "angle",
        },
      ],
      commit: (values, commitCtx) =>
        this.setRotation((values.angle * Math.PI) / 180, commitCtx),
    }
    ctx.dynamicInput.open(session)
    ctx.dynamicInput.setDefault(
      "angle",
      normalizeDegrees(((this.rotation ?? 0) * 180) / Math.PI)
    )
    ctx.dynamicInput.setPosition(this.lastScreen ?? { x: 0, y: 0 })
  }

  private openCoordinate(
    ctx: ToolContext,
    id: string,
    prompt: PromptId,
    commitRaw: (ctx: ToolContext) => boolean
  ): void {
    const session: DynamicInputSession = {
      fields: [{ id, prompt, kind: "coordinate" }],
      commit: () => {},
      commitRaw,
    }
    ctx.dynamicInput.open(session)
    ctx.dynamicInput.setPosition(this.lastScreen ?? { x: 0, y: 0 })
  }

  private parsePoint(
    text: string,
    lastPoint: Vec2 | Vec3 | null,
    ctx: ToolContext
  ): Vec3 | null {
    if (!isCoordinateExpression(text)) return null
    return parseCoordinate(text, {
      lastPoint: lastPoint ?? ctx.lastPoint,
      relativeByDefault: lastPoint !== null,
      ucs: ctx.ucs,
      elevation: ctx.elevation,
    })
  }
}

/** Preview frames reuse one id so drawing them never burns entity ids. */
const DIM_PREVIEW_ID = "__dimension_preview__"

/** The measurement alone, as AutoCAD offers and reports it: no prefix, no override. */
export function measurementOf(dim: DimensionEntity, ctx: ToolContext): string {
  const style = ctx.document.getDimStyle(dim.styleId)
  return dimensionText({ ...dim, text: "<>" }, style)
}

/**
 * The two extension-line origins a whole object supplies, following AutoCAD's
 * object selection: a line or arc gives its endpoints, a circle the endpoints
 * of the diameter through the pick point, and a polyline the endpoints of the
 * segment picked ("only the individual line and arc segments are dimensioned").
 * Objects with no such pair — text, another dimension — give nothing. Each
 * origin is at the object's height there.
 */
function measurableOrigins(entity: Entity, at: Vec2): [Vec3, Vec3] | null {
  const pair = planOrigins(entity, at)
  return pair
    ? [
        withZ(pair[0], entityZAt(entity, pair[0])),
        withZ(pair[1], entityZAt(entity, pair[1])),
      ]
    : null
}

function planOrigins(entity: Entity, at: Vec2): [Vec2, Vec2] | null {
  switch (entity.type) {
    case "line":
      return [entity.start, entity.end]
    case "arc":
      return [arcStartPoint(entity), arcEndPoint(entity)]
    case "circle": {
      const offset = V.sub(at, entity.center)
      const dir = V.length(offset) < 1e-9 ? { x: 1, y: 0 } : V.normalize(offset)
      return [
        V.add(entity.center, V.scale(dir, entity.radius)),
        V.sub(entity.center, V.scale(dir, entity.radius)),
      ]
    }
    case "polyline": {
      let best: [Vec2, Vec2] | null = null
      let bestDistance = Infinity
      for (const seg of polylineSegmentGeometries(entity)) {
        const distance = closestPointOnSegment(seg.a, seg.b, at).distance
        if (distance < bestDistance) {
          bestDistance = distance
          best = [seg.a, seg.b]
        }
      }
      return best
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

/** How far `value` falls outside the interval spanned by `a` and `b`; 0 inside. */
function distanceOutside(value: number, a: number, b: number): number {
  const min = Math.min(a, b)
  const max = Math.max(a, b)
  if (value < min) return min - value
  if (value > max) return value - max
  return 0
}

type DimensionToolState =
  /** Awaiting the first extension line origin, or Enter to pick an object. */
  | { readonly phase: "first" }
  /** Picking a whole object to take the origins from. */
  | { readonly phase: "select"; readonly hover: Entity | null }
  | {
      readonly phase: "second"
      readonly first: Vec3
      readonly cursor: Vec2
    }
  | {
      readonly phase: "line"
      readonly first: Vec3
      readonly second: Vec2
      readonly cursor: Vec2
      /** Which sub-prompt is open, so its answer returns here. */
      readonly prompt: "text" | "textAngle" | null
    }
  /** Specifying the angle of the dimension line (the Rotated option). */
  | {
      readonly phase: "rotated"
      readonly first: Vec3
      readonly second: Vec2
    }
