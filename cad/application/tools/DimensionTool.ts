import { Vec2, V } from "../../geometry/Vec2"
import { Vec3, withZ } from "../../geometry/Vec3"
import { closestPointOnSegment } from "../../geometry/primitives"
import {
  arcEndPoint,
  arcStartPoint,
  createDimension,
  DimensionEntity,
  DimensionKind,
  dimensionMeasurement,
  dimensionMeasurementText,
  Entity,
  entityElevation,
  entityZAt,
  polylineSegmentGeometries,
  polyline3dSegments,
  readsInPlan,
  withElevation,
  regionEdgeAt,
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
import { rollover } from "./ghostLook"
import { pickNested } from "./nestedPick"
import { typedPick } from "./typedPick"

/** The direction DIMHORIZONTAL, DIMVERTICAL or DIMROTATED fixes from the start. */
export type DimensionDirection = "horizontal" | "vertical" | "rotated"

/**
 * AutoCAD's DIMLINEAR and DIMALIGNED, one class parameterised by which of them
 * it is — they share every prompt, and differ only in what sets the direction
 * measured along and in which keywords the location prompt offers. DIMLINEAR's
 * undocumented siblings DIMHORIZONTAL, DIMVERTICAL and DIMROTATED are it with
 * the direction fixed, DIMROTATED asking its angle first (probes
 * dimensions/p100, p112, p113).
 *
 * The prompt sequence is AutoCAD's, as its 2027 console asks it (probes
 * dimensions/p01, p104, p126, p129, p137): `Specify first extension line
 * origin or <select object>:` (Enter: `Select object to dimension:`, its
 * endpoints taken), `Specify second extension line origin:` and
 * `Non-associative dimension created.`, then `Specify dimension line location
 * or [Text/Angle/Horizontal/Vertical/Rotated]:` — DIMALIGNED, and DIMLINEAR
 * once Horizontal or Vertical has set the direction, offering only
 * `[Text/Angle]`; after Rotated the whole list again —, whose Text asks `Enter
 * dimension text <100>:`, Angle `Specify angle of dimension text:` and
 * Rotated `Specify angle of dimension line <0>:`. The command ends the moment
 * the location is picked, saying `Dimension text = 100`.
 *
 * Left free until Horizontal, Vertical or Rotated says otherwise, a linear
 * dimension takes its direction from where the location is dragged: above or
 * below the origins it measures horizontally, beside them vertically, and
 * anywhere else it keeps the direction it last had ({@link bandAt}).
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
   * The measurement direction in the UCS, or null while it still follows the
   * cursor. Aligned dimensions ignore it entirely.
   */
  private rotation: number | null = null
  /** The direction set by the command or by Horizontal or Vertical, which leave it fixed. */
  private straight = false
  /** The direction the location's band last chose, in the UCS: horizontal first (desktop d06-1). */
  private band = 0

  private lastScreen: Vec2 | null = null
  /** The measurement Text offers as its `<default>`. */
  private measured = ""

  constructor(
    private readonly kind: DimensionKind,
    readonly id: string,
    private readonly direction: DimensionDirection | null = null
  ) {}

  onActivate(ctx: ToolContext): void {
    ctx.setCursor("crosshair")
    ctx.selection.clear()
    this.text = undefined
    this.textAngle = undefined
    this.rotation =
      this.direction === "horizontal"
        ? 0
        : this.direction === "vertical"
          ? Math.PI / 2
          : null
    this.straight = this.direction !== null
    this.band = 0
    if (this.direction === "rotated") {
      this.state = { phase: "rotated", origins: null }
      this.openRotatedInput(ctx)
    } else {
      this.state = { phase: "first" }
      this.openFirstInput(ctx)
    }
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
            // DIMALIGNED's too: the table's entry for it says `Precise`, the
            // Spanish console asks `Designe` (probe dimensions/p143).
            return "specifyAngleOfDimensionText"
          case null:
            return "dimensionLineLocationOr"
        }
        break
      case "rotated":
        // Always `<0>`, a second Rotated too, where Enter keeps the rotation
        // set (probe dimensions/p165).
        return { id: "dimensionLineAngle", enter: { angle: 0 } }
    }
  }

  /** As AutoCAD 2027's console refuses a dimension's answers (p106, p125). */
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

  /**
   * The origins and the location are LASTPOINT once given, which their
   * refusal of its own would hide from the runtime (probe dimensions/p140).
   */
  setsLastPoint(): boolean | null {
    const state = this.state
    return state.phase === "first" ||
      state.phase === "second" ||
      (state.phase === "line" && state.prompt === null)
      ? true
      : null
  }

  /** `Select object to dimension:` takes a locked layer's objects (probe dimensions/p121). */
  picksLocked(): boolean {
    return this.state.phase === "select"
  }

  /** `<30` at Angle is that angle (probe dimensions/p130). */
  answersAngleOverride(): boolean {
    return this.state.phase === "line" && this.state.prompt === "textAngle"
  }

  /**
   * A point typed at `Select object to dimension:` picks there, as a click
   * does (probes dimensions/p104, p106).
   */
  answerTyped(text: string, ctx: ToolContext): boolean {
    if (this.state.phase !== "select") return false
    const point = typedPick(text, ctx)
    if (!point) return false
    this.pickAt(point, ctx)
    return true
  }

  onPointerMove(input: PointerInput, ctx: ToolContext): void {
    this.lastScreen = input.screen
    const state = this.state
    if (state.phase === "select") {
      const hover = this.pickAt(input.world, ctx, false)?.entity ?? null
      if (hover?.id !== state.hover?.id) {
        this.state = { ...state, hover }
      }
    } else if (state.phase === "second") {
      this.state = { ...state, cursor: input.point }
    } else if (state.phase === "line") {
      // The location prompt is a jig: every position it is dragged through
      // may turn the direction, so a corner keeps what the last band chose.
      if (state.prompt === null) {
        this.band = this.bandAt(state, input.point, ctx) ?? this.band
      }
      this.state = { ...state, cursor: input.point }
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
      case "select":
        this.pickAt(input.world, ctx)
        break
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
    // After Horizontal or Vertical the prompt offers the text keywords alone,
    // after Rotated every keyword again (probe dimensions/p137).
    if (this.kind === "linear" && !this.straight) {
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
        this.straight = true
        this.setRotation(0, ctx)
        return "continue"
      case "Vertical":
        if (this.kind !== "linear") return "unhandled"
        this.straight = true
        this.setRotation(Math.PI / 2, ctx)
        return "continue"
      case "Rotated": {
        if (this.kind !== "linear") return "unhandled"
        const { first, second, circle } = this.state
        this.state = { phase: "rotated", origins: { first, second, circle } }
        this.openRotatedInput(ctx)
        return "continue"
      }
      default:
        return "unhandled"
    }
  }

  /**
   * Only the second origin has a base point (the first). The location has
   * none (the console's trace: UseBasePoint false, probe dimensions/p01), so
   * Ortho and Polar leave it alone: held to a ray from an origin, it put the
   * dimension line on the origins.
   */
  getConstraintAnchor(): Vec2 | null {
    return this.state.phase === "second" ? this.state.first : null
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
        return this.state.hover ? rollover(ctx, this.state.hover) : []
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
          this.pending(this.state, this.state.cursor, ctx, DIM_PREVIEW_ID),
          rubber,
          { dimStyle: this.style(ctx) }
        )
      case "rotated": {
        const origins = this.state.origins
        if (origins === null || origins.circle !== null) return []
        return [
          {
            kind: "segment",
            a: viewport.worldToScreen(origins.first),
            b: viewport.worldToScreen(origins.second),
            stroke: rubber,
          },
        ]
      }
      default:
        return []
    }
  }

  /**
   * The dimension whose measurement Text offers: the one being dragged, or —
   * while the cursor still sits on the origins and that measures nothing —
   * the one along their longer extent, which is what the drag will measure.
   */
  private offered(state: LineState, ctx: ToolContext): DimensionEntity {
    const pending = this.pending(state, state.cursor, ctx, DIM_PREVIEW_ID)
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

  /**
   * The dimension with its line through `linePoint`: the preview and the
   * commit, so what is drawn is what is created. It lies at the current
   * ELEVATION, whatever the height of the location or of its origins (probes
   * dimensions/p158, p169).
   */
  private pending(
    state: LineState,
    linePoint: Vec2,
    ctx: ToolContext,
    id?: string
  ): DimensionEntity {
    const rotation = this.resolveRotation(state, linePoint, ctx)
    const [first, second] = originsAlong(state, rotation)
    return withElevation(
      createDimension(this.kind, first, second, linePoint, {
        rotation,
        text: this.text,
        textAngle: this.textAngle,
        styleId: ctx.document.getCurrentDimStyleId(),
        layerId: ctx.document.getCurrentLayerId(),
        ...(id !== undefined ? { id } : {}),
      }),
      ctx.elevation
    )
  }

  /**
   * The measurement direction, in the world. A keyword or the command
   * (Horizontal / Vertical / Rotated) wins; otherwise the location's band,
   * or the direction the last band chose. Horizontal and vertical are the
   * UCS's, and a Rotated angle is measured from its X axis.
   */
  private resolveRotation(
    state: LineState,
    linePoint: Vec2,
    ctx: ToolContext
  ): number {
    const local =
      this.rotation ?? this.bandAt(state, linePoint, ctx) ?? this.band
    return ucsAngleToWorld(ctx.ucs, local)
  }

  /**
   * AutoCAD's choice of direction for a linear dimension's location (probes
   * dimensions/p139, p141, p142; desktop d06): above or below the origins,
   * within their X extent, measures horizontally; beside them, within their Y
   * extent, vertically; inside the box they span or out at a corner, null,
   * the direction the last band chose holding. A circle's band is its extent.
   */
  private bandAt(
    state: LineState,
    point: Vec2,
    ctx: ToolContext
  ): number | null {
    const at = worldPointToUcs(ctx.ucs, point)
    let inX: boolean
    let inY: boolean
    if (state.circle) {
      const center = worldPointToUcs(ctx.ucs, state.circle.center)
      const reach = state.circle.radius + BAND_EPSILON
      inX = Math.abs(at.x - center.x) <= reach
      inY = Math.abs(at.y - center.y) <= reach
    } else {
      const a = worldPointToUcs(ctx.ucs, state.first)
      const b = worldPointToUcs(ctx.ucs, state.second)
      inX = within(at.x, a.x, b.x)
      inY = within(at.y, a.y, b.y)
    }
    if (inX && !inY) return 0
    if (inY && !inX) return Math.PI / 2
    return null
  }

  private style(ctx: ToolContext) {
    return ctx.document.getDimStyle(ctx.document.getCurrentDimStyleId())
  }

  private enterSecond(first: Vec3, ctx: ToolContext): void {
    this.state = { phase: "second", first, cursor: first }
    this.openSecondInput(ctx)
  }

  private enterLine(origins: Origins, ctx: ToolContext): void {
    this.state = {
      phase: "line",
      ...origins,
      cursor: origins.second,
      prompt: null,
    }
    this.openLineInput(ctx)
  }

  /** Origins given as points: nothing ties the dimension to an object. */
  private enterLineFromPoints(
    first: Vec3,
    second: Vec3,
    ctx: ToolContext
  ): void {
    ctx.report(ctx.text.message("nonAssociativeDimension"))
    this.band = 0
    this.enterLine({ first, second, circle: null }, ctx)
  }

  private setRotation(rotation: number, ctx: ToolContext): void {
    this.rotation = rotation
    if (this.state.phase === "rotated") {
      const origins = this.state.origins
      if (origins === null) {
        this.state = { phase: "first" }
        this.openFirstInput(ctx)
      } else {
        this.enterLine(origins, ctx)
      }
    } else if (this.state.phase === "line") {
      this.state = { ...this.state, prompt: null }
      this.openLineInput(ctx)
    }
  }

  /** Creates the dimension and ends the command, as AutoCAD does. */
  private place(linePoint: Vec3, ctx: ToolContext): void {
    if (this.state.phase !== "line") return
    this.band = this.bandAt(this.state, linePoint, ctx) ?? this.band
    const dim = this.pending(this.state, linePoint, ctx)
    ctx.execute(new AddEntityCommand(withCurrentProperties(dim, ctx)))
    ctx.report(
      ctx.text.message("dimensionTextIs", { text: measurementOf(dim, ctx) })
    )
    ctx.endCommand()
  }

  /**
   * `Select object to dimension:` at `world`, inside block references too
   * (probe dimensions/p148), in a plane parallel to the UCS's XY plane, where
   * the dimension lies. Given `take`, the origins found start the location
   * prompt, and a miss or a refusal is said as AutoCAD says it.
   */
  private pickAt(
    world: Vec2,
    ctx: ToolContext,
    take = true
  ): { readonly entity: Entity; readonly origins: Origins | null } | null {
    const hit = pickNested(world, ctx)
    const picked = hit && readsInPlan(hit) ? this.originsOf(hit, world) : null
    if (!take) return picked
    if (picked === null) {
      ctx.report(ctx.text.message("noObjectSelected"))
    } else if (picked.origins === null) {
      ctx.report(ctx.text.message("notLineArcOrCircleToDimension"))
    } else {
      this.band = 0
      this.enterLine(picked.origins, ctx)
    }
    return picked
  }

  /**
   * The origins a whole object supplies, following AutoCAD's object
   * selection: a line or arc gives its endpoints, a polyline the endpoints of
   * the segment picked ("only the individual line and arc segments are
   * dimensioned"), and a circle its diameter — along the direction DIMLINEAR
   * settles on (probes dimensions/p109, p114, p115), through the pick for
   * DIMALIGNED (p147, p167). An ellipse, a spline or a dimension is refused
   * in words (`origins` null, p116, p117, p120); a text gives nothing at all
   * (p118). Each origin is at the object's height there.
   */
  private originsOf(
    entity: Entity,
    at: Vec2
  ): { readonly entity: Entity; readonly origins: Origins | null } | null {
    const pair = (a: Vec2, b: Vec2): Origins => ({
      first: withZ(a, entityZAt(entity, a)),
      second: withZ(b, entityZAt(entity, b)),
      circle: null,
    })
    switch (entity.type) {
      case "line":
        return { entity, origins: pair(entity.start, entity.end) }
      case "arc":
        return {
          entity,
          origins: pair(arcStartPoint(entity), arcEndPoint(entity)),
        }
      case "circle": {
        const offset = V.sub(at, entity.center)
        const dir =
          V.length(offset) < 1e-9 ? { x: 1, y: 0 } : V.normalize(offset)
        const origins = pair(
          V.add(entity.center, V.scale(dir, entity.radius)),
          V.sub(entity.center, V.scale(dir, entity.radius))
        )
        if (this.kind === "aligned") return { entity, origins }
        const circle = {
          center: entity.center,
          radius: entity.radius,
          z: entityElevation(entity),
        }
        return { entity, origins: { ...origins, circle } }
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
        return best && { entity, origins: pair(best[0], best[1]) }
      }
      case "polyline3d": {
        // The segment picked, as a polyline's, its ends at their own Z
        // (3dpoly/p25).
        let best: [Vec3, Vec3] | null = null
        let bestDistance = Infinity
        for (const [a, b] of polyline3dSegments(entity)) {
          const distance = closestPointOnSegment(a, b, at).distance
          if (distance < bestDistance) {
            bestDistance = distance
            best = [a, b]
          }
        }
        return (
          best && {
            entity,
            origins: { first: best[0], second: best[1], circle: null },
          }
        )
      }
      case "region":
      case "solid3d": {
        // The edge picked, as that object would be (region/e03, solid/e07).
        const found = this.originsOf(regionEdgeAt(entity, at), at)
        return found && { entity, origins: found.origins }
      }
      case "ellipse":
      case "spline":
      case "dimension":
        return { entity, origins: null }
      // WHY no refusal for a hatch: unprobed, so it says nothing was found,
      // as a text does (p118).
      case "text":
      case "mtext":
      case "attdef":
      case "hatch":
      case "insert":
        return null
    }
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
    openDimensionTextInput(ctx, this.lastScreen, (text, commitCtx) => {
      this.text = text
      this.returnToLine(commitCtx)
    })
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
      fields: [{ id: "angle", prompt: "dimensionLineAngle", kind: "angle" }],
      commit: (values, commitCtx) =>
        this.setRotation((values.angle * Math.PI) / 180, commitCtx),
      // The `<0>` offered is not what Enter does once a rotation is set: it
      // keeps that one (probe dimensions/p165).
      commitRaw: (commitCtx) => {
        if (commitCtx.dynamicInput.hasTypedText()) return false
        this.setRotation(this.rotation ?? 0, commitCtx)
        return true
      },
    }
    ctx.dynamicInput.open(session)
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

/** How far outside an extent a location may stand and still be in its band. */
const BAND_EPSILON = 1e-9

/**
 * The measurement alone, as AutoCAD offers and reports it: no prefix, no
 * override, a point and no trailing zeros whatever DIMDSEP draws (p01, p15).
 */
export function measurementOf(dim: DimensionEntity, ctx: ToolContext): string {
  const style = ctx.document.getDimStyle(dim.styleId)
  return dimensionMeasurementText(dim, style, "reported")
}

/** Whether `value` lies within the interval spanned by `a` and `b`. */
function within(value: number, a: number, b: number): boolean {
  return (
    value >= Math.min(a, b) - BAND_EPSILON &&
    value <= Math.max(a, b) + BAND_EPSILON
  )
}

/**
 * The extension-line origins along `rotation` (the world's): a circle's
 * diameter in that direction, the first towards it (probes dimensions/p109,
 * p114, p115), else the origins given.
 */
function originsAlong(state: LineState, rotation: number): [Vec3, Vec3] {
  const circle = state.circle
  if (!circle) return [state.first, state.second]
  const radius = V.scale(
    { x: Math.cos(rotation), y: Math.sin(rotation) },
    circle.radius
  )
  return [
    withZ(V.add(circle.center, radius), circle.z),
    withZ(V.sub(circle.center, radius), circle.z),
  ]
}

/** A circle DIMLINEAR measures, whose origins wait for the direction. */
interface MeasuredCircle {
  readonly center: Vec2
  readonly radius: number
  readonly z: number
}

/** What the location prompt measures between. */
interface Origins {
  readonly first: Vec3
  readonly second: Vec3
  readonly circle: MeasuredCircle | null
}

type LineState = Extract<DimensionToolState, { phase: "line" }>

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
  | ({
      readonly phase: "line"
      readonly cursor: Vec2
      /** Which sub-prompt is open, so its answer returns here. */
      readonly prompt: "text" | "textAngle" | null
    } & Origins)
  /**
   * Specifying the angle of the dimension line: the Rotated option, or
   * DIMROTATED's first question (no origins yet).
   */
  | { readonly phase: "rotated"; readonly origins: Origins | null }
