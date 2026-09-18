import { Vec2, V } from "../../geometry/Vec2"
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
  Entity,
  polylineSegmentGeometries,
} from "../../domain/entities"
import { AddEntityCommand } from "../commands/entityCommands"
import { DynamicInputSession } from "../input/DynamicInput"
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
  Tool,
  ToolContext,
} from "./Tool"

/**
 * AutoCAD's DIMLINEAR and DIMALIGNED, one class parameterised by which of them
 * it is — they share every prompt, and differ only in what sets the direction
 * measured along and in which keywords the location prompt offers.
 *
 * The prompt sequence is AutoCAD's: first extension line origin (or Enter to
 * pick an object and take its endpoints), second extension line origin, then
 * the dimension line location, where `[Text/Angle]` — plus
 * `[Horizontal/Vertical/Rotated]` for DIMLINEAR — are available. The command
 * ends the moment the location is picked.
 *
 * Left free until Horizontal, Vertical or Rotated says otherwise, a linear
 * dimension picks its direction from where the location is dragged: pull the
 * dimension line up or down and it measures horizontally, pull it left or right
 * and it measures vertically. That is the default gesture users rely on.
 *
 * AutoCAD's **Mtext** keyword is deliberately absent: it opens the multiline
 * text editor, and this app has no MTEXT object. The single-line **Text**
 * option covers the same need.
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

  constructor(
    private readonly kind: DimensionKind,
    readonly id: string,
    readonly label: string
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
        break
      }
      case "second":
        this.enterLine(this.state.first, input.point, ctx)
        break
      case "line":
        this.place(input.point, ctx)
        break
      case "rotated":
        // Pointing the angle of the dimension line: the bearing from the first
        // origin to the cursor.
        this.setRotation(bearing(this.state.first, input.point), ctx)
        break
    }
    ctx.requestRender()
  }

  commandOptions(): readonly CommandOption[] {
    if (this.state.phase !== "line") return []
    const options: CommandOption[] = [
      { key: "T", label: "Text" },
      { key: "A", label: "Angle" },
    ]
    if (this.kind === "linear") {
      options.push(
        { key: "H", label: "Horizontal" },
        { key: "V", label: "Vertical" },
        { key: "R", label: "Rotated" }
      )
    }
    return options
  }

  invokeOption(key: string, ctx: ToolContext): CommandOptionOutcome {
    if (this.state.phase !== "line") return "unhandled"
    switch (key.toLowerCase()) {
      case "t":
        this.state = { ...this.state, prompt: "text" }
        this.openTextInput(ctx)
        return "continue"
      case "a":
        this.state = { ...this.state, prompt: "textAngle" }
        this.openTextAngleInput(ctx)
        return "continue"
      case "h":
        if (this.kind !== "linear") return "unhandled"
        this.setRotation(0, ctx)
        return "continue"
      case "v":
        if (this.kind !== "linear") return "unhandled"
        this.setRotation(Math.PI / 2, ctx)
        return "continue"
      case "r": {
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
    if (this.state.phase === "second") return this.state.first
    if (this.state.phase === "line") return this.state.first
    if (this.state.phase === "rotated") return this.state.first
    return null
  }

  wantsSnap(): boolean {
    // The origins and the dimension line are point prompts; picking an object
    // to dimension is not.
    return this.state.phase !== "select"
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

  /** The dimension as it stands while the location is dragged. */
  private pending(
    state: Extract<DimensionToolState, { phase: "line" }>,
    linePoint: Vec2,
    ctx: ToolContext
  ): DimensionEntity {
    return createDimension(this.kind, state.first, state.second, linePoint, {
      rotation: this.resolveRotation(state, linePoint),
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
   */
  private resolveRotation(
    state: Extract<DimensionToolState, { phase: "line" }>,
    linePoint: Vec2
  ): number {
    if (this.rotation !== null) return this.rotation
    const { first, second } = state
    const escapeX = distanceOutside(linePoint.x, first.x, second.x)
    const escapeY = distanceOutside(linePoint.y, first.y, second.y)
    if (escapeX === 0 && escapeY === 0) {
      // Still between the origins: neither axis is indicated yet, so fall back
      // to whichever the cursor leans towards.
      const mid = V.midpoint(first, second)
      return Math.abs(linePoint.y - mid.y) >= Math.abs(linePoint.x - mid.x)
        ? 0
        : Math.PI / 2
    }
    return escapeY >= escapeX ? 0 : Math.PI / 2
  }

  private style(ctx: ToolContext) {
    return ctx.document.getDimStyle(ctx.document.getCurrentDimStyleId())
  }

  private enterSecond(first: Vec2, ctx: ToolContext): void {
    this.state = { phase: "second", first, cursor: first }
    this.openSecondInput(ctx)
  }

  private enterLine(first: Vec2, second: Vec2, ctx: ToolContext): void {
    this.state = { phase: "line", first, second, cursor: second, prompt: null }
    this.openLineInput(ctx)
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

  /** Creates the dimension and ends the command, as AutoCAD does. */
  private place(linePoint: Vec2, ctx: ToolContext): void {
    if (this.state.phase !== "line") return
    const dim = createDimension(
      this.kind,
      this.state.first,
      this.state.second,
      linePoint,
      {
        rotation: this.resolveRotation(this.state, linePoint),
        text: this.text,
        textAngle: this.textAngle,
        styleId: ctx.document.getCurrentDimStyleId(),
        layerId: ctx.document.getCurrentLayerId(),
      }
    )
    ctx.execute(new AddEntityCommand(dim))
    ctx.endCommand()
  }

  /** The object under the cursor whose endpoints a dimension can be taken from. */
  private pickMeasurable(input: PointerInput, ctx: ToolContext): Entity | null {
    const hit = ctx.pick(input.world)
    return hit && measurableOrigins(hit, input.world) ? hit : null
  }

  private pickOrigins(
    input: PointerInput,
    ctx: ToolContext
  ): [Vec2, Vec2] | null {
    const hit = ctx.pick(input.world)
    return hit ? measurableOrigins(hit, input.world) : null
  }

  private openFirstInput(ctx: ToolContext): void {
    this.openCoordinate(
      ctx,
      "point",
      "Specify first extension line origin or <select object>",
      (commitCtx) => this.commitFirst(commitCtx)
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
    const point = this.parsePoint(typed, null)
    if (!point) return false
    this.enterSecond(point, ctx)
    return true
  }

  private openSecondInput(ctx: ToolContext): void {
    this.openCoordinate(
      ctx,
      "point",
      "Specify second extension line origin",
      (commitCtx) => {
        if (this.state.phase !== "second") return false
        const typed = commitCtx.dynamicInput.getText("point").trim()
        const point = this.parsePoint(typed, this.state.first)
        if (!point) return false
        this.enterLine(this.state.first, point, commitCtx)
        return true
      }
    )
  }

  private openLineInput(ctx: ToolContext): void {
    this.openCoordinate(
      ctx,
      "point",
      "Specify dimension line location",
      (commitCtx) => {
        if (this.state.phase !== "line") return false
        const typed = commitCtx.dynamicInput.getText("point").trim()
        const point = this.parsePoint(typed, this.state.second)
        if (!point) return false
        this.place(point, commitCtx)
        return true
      }
    )
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
          label: "Specify angle of dimension line",
          kind: "angle",
        },
      ],
      commit: (values, commitCtx) =>
        this.setRotation((values.angle * Math.PI) / 180, commitCtx),
    }
    ctx.dynamicInput.open(session)
    ctx.dynamicInput.setLive(
      "angle",
      normalizeDegrees(((this.rotation ?? 0) * 180) / Math.PI)
    )
    ctx.dynamicInput.setPosition(this.lastScreen ?? { x: 0, y: 0 })
  }

  private openCoordinate(
    ctx: ToolContext,
    id: string,
    label: string,
    commitRaw: (ctx: ToolContext) => boolean
  ): void {
    const session: DynamicInputSession = {
      fields: [{ id, label, kind: "coordinate" }],
      commit: () => {},
      commitRaw,
    }
    ctx.dynamicInput.open(session)
    ctx.dynamicInput.setPosition(this.lastScreen ?? { x: 0, y: 0 })
  }

  private parsePoint(text: string, lastPoint: Vec2 | null): Vec2 | null {
    if (!isCoordinateExpression(text)) return null
    return parseCoordinate(text, {
      lastPoint,
      relativeByDefault: lastPoint !== null,
    })
  }
}

/** Preview frames reuse one id so drawing them never burns entity ids. */
const DIM_PREVIEW_ID = "__dimension_preview__"

/**
 * The two extension-line origins a whole object supplies, following AutoCAD's
 * object selection: a line or arc gives its endpoints, a circle the endpoints
 * of the diameter through the pick point, and a polyline the endpoints of the
 * segment picked ("only the individual line and arc segments are dimensioned").
 * Objects with no such pair — text, another dimension — give nothing.
 */
function measurableOrigins(entity: Entity, at: Vec2): [Vec2, Vec2] | null {
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
    case "text":
    case "dimension":
    case "hatch":
    case "insert":
      return null
  }
}

function bearing(from: Vec2, to: Vec2): number {
  const offset = V.sub(to, from)
  return V.length(offset) < 1e-9 ? 0 : Math.atan2(offset.y, offset.x)
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
      readonly first: Vec2
      readonly cursor: Vec2
    }
  | {
      readonly phase: "line"
      readonly first: Vec2
      readonly second: Vec2
      readonly cursor: Vec2
      /** Which sub-prompt is open, so its answer returns here. */
      readonly prompt: "text" | "textAngle" | null
    }
  /** Specifying the angle of the dimension line (the Rotated option). */
  | {
      readonly phase: "rotated"
      readonly first: Vec2
      readonly second: Vec2
    }
