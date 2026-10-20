import { Vec2, V } from "../../geometry/Vec2"
import { Vec3 } from "../../geometry/Vec3"
import { bulgeOfAngle } from "../../geometry/bulgeArcs"
import { normalizeDegrees } from "../../geometry/primitives"
import {
  createPolyline,
  onPlaneOf,
  withElevation,
  withThickness,
} from "../../domain/entities"
import type { PolylineEntity } from "../../domain/entities"
import { formatAngle, formatLength } from "../../domain/units"
import { ucsPointToWorld, worldPointToUcs } from "../../domain/ucs"
import { AddEntityCommand } from "../commands/entityCommands"
import { DynamicInputSession } from "../input/DynamicInput"
import type { PromptId } from "../../locales/types"
import {
  isCoordinateExpression,
  parseCoordinate,
} from "../input/coordinateInput"
import { ScenePrimitive } from "../../scene/types"
import { THEME } from "../../scene/theme"
import { entityScenePrimitive } from "../SceneBuilder"
import {
  CommandOption,
  CommandOptionOutcome,
  KeyInput,
  PointerInput,
  QuestionInput,
  Tool,
  ToolContext,
  ToolQuestion,
} from "./Tool"
import { withCurrentProperties } from "./currentProperties"
import { headingInUcs } from "./ucsHeading"

/** A value the first prompt's options ask. */
type Mode =
  | "elevation"
  | "thickness"
  | "chamferFirst"
  | "chamferSecond"
  | "fillet"
  | "width"
type Side = "length" | "width"

/**
 * AutoCAD's RECTANG, as AutoCAD 2023's console answers it (acc/r1–r10 of the
 * RECTANG session): two opposite corners define a rectangle along the UCS
 * turned by Rotation, created as a single closed polyline; Area and
 * Dimensions give its size instead. Single-shot — the command ends once the
 * rectangle is made.
 */
type RectangleToolState =
  /** Awaiting the first corner. */
  | { readonly phase: "first" }
  /** Asking a value of the first prompt's options. */
  | { readonly phase: "mode"; readonly mode: Mode }
  /** First corner placed; rubber-banding the opposite corner. */
  | { readonly phase: "second"; readonly first: Vec3; readonly cursor: Vec2 }
  /** Area: the area, the side it is calculated from, and that side. */
  | { readonly phase: "area"; readonly first: Vec3 }
  | { readonly phase: "areaBasis"; readonly first: Vec3 }
  | { readonly phase: "areaSide"; readonly first: Vec3; readonly side: Side }
  /** Dimensions: its length, then its width. */
  | { readonly phase: "dimension"; readonly first: Vec3; readonly side: Side }
  /** Rotation's angle, or its Pick points' two points (`from` the first). */
  | { readonly phase: "rotation"; readonly first: Vec3 }
  | {
      readonly phase: "pick"
      readonly first: Vec3
      readonly from: Vec3 | null
      readonly cursor: Vec2
    }

/** The corners Chamfer or Fillet cut, as the options last set them. */
interface Corners {
  readonly kind: "chamfer" | "fillet" | null
  /** Chamfer's first distance, which is Fillet's radius too. */
  readonly first: number
  readonly second: number
}

const PREVIEW_ID = "rectangle-preview"

export class RectangleTool implements Tool {
  readonly id = "rectangle"

  private state: RectangleToolState = { phase: "first" }
  private lastScreen: Vec2 | null = null
  /**
   * The options' values, kept "until you enter a different value" for the
   * session: Elevation and Thickness (instead of ELEVATION and THICKNESS),
   * the corners, Rotation, and the area and sides Area and Dimensions offer.
   */
  private elevation = 0
  private thickness = 0
  private corners: Corners = { kind: null, first: 0, second: 0 }
  /** Width's line width, negative as typed (acc/w6), drawn as none. */
  private lineWidth = 0
  /** Degrees from the UCS X axis. */
  private rotation = 0
  private area = 100
  private length = 10
  private width = 10
  /** Dimensions was given in this run: the other corner only picks the quadrant. */
  private sized = false

  onActivate(ctx: ToolContext): void {
    ctx.setCursor("crosshair")
    ctx.selection.clear()
    this.state = { phase: "first" }
    this.sized = false
    this.reportModes(ctx)
    this.openPointInput(ctx, "firstCorner")
  }

  onDeactivate(ctx: ToolContext): void {
    this.state = { phase: "first" }
    ctx.dynamicInput.close()
  }

  onPointerMove(input: PointerInput, ctx: ToolContext): void {
    this.lastScreen = input.screen
    if (this.state.phase === "second" || this.state.phase === "pick") {
      this.state = { ...this.state, cursor: input.point }
    }
    ctx.dynamicInput.setPosition(input.screen)
    ctx.requestRender()
  }

  onPointerDown(input: PointerInput, ctx: ToolContext): void {
    if (input.button !== 0 || !this.wantsSnap()) return
    this.advanceWithPoint(input.point, ctx, input.screen)
  }

  onKeyDown(input: KeyInput, ctx: ToolContext): void {
    if (input.key === "Escape") {
      this.state = { phase: "first" }
      ctx.dynamicInput.close()
      ctx.requestRender()
    }
  }

  onEnter(ctx: ToolContext): boolean {
    if (this.state.phase !== "areaBasis") return false
    this.askAreaSide("length", ctx) // <Length>
    return true
  }

  question(): PromptId | ToolQuestion {
    const state = this.state
    switch (state.phase) {
      case "first":
        return "specifyFirstCornerPointOr"
      case "mode":
        return this.modeQuestion(state.mode)
      case "second":
        return "specifyOtherCornerPointOr"
      case "area":
        return { id: "rectangleArea", enter: this.area }
      case "areaBasis":
        return "rectangleAreaBasis"
      case "areaSide":
        return state.side === "length"
          ? { id: "rectangleLength", enter: this.length }
          : { id: "rectangleWidth", enter: this.width }
      case "dimension":
        return state.side === "length"
          ? { id: "rectangleDimensionLength", enter: this.length }
          : { id: "rectangleDimensionWidth", enter: this.width }
      case "rotation":
        return { id: "rectangleRotation", enter: { angle: this.rotation } }
      case "pick":
        return state.from === null ? "specifyFirstPoint" : "specifySecondPoint"
    }
  }

  /** Pick points' two points are bare points (`Invalid point.`). */
  takes(): QuestionInput | null {
    return this.state.phase === "pick" ? "point" : null
  }

  defaultOption(): string | null {
    return this.state.phase === "areaBasis" ? "Length" : null
  }

  commandOptions(): readonly CommandOption[] {
    switch (this.state.phase) {
      case "first":
        return [
          { id: "Chamfer" },
          { id: "Elevation" },
          { id: "Fillet" },
          { id: "Thickness" },
          { id: "Width" },
        ]
      case "second":
        return [{ id: "Area" }, { id: "Dimensions" }, { id: "Rotation" }]
      case "areaBasis":
        return [{ id: "Length" }, { id: "Width" }]
      case "rotation":
        return [{ id: "Pick" }]
      default:
        return []
    }
  }

  invokeOption(id: string, ctx: ToolContext): CommandOptionOutcome {
    const state = this.state
    if (state.phase === "first") {
      const mode = FIRST_PROMPT_MODES[id]
      if (mode === undefined) return "unhandled"
      this.askMode(mode, ctx)
      return "continue"
    }
    if (state.phase === "second") {
      switch (id) {
        case "Area":
          this.askArea(state.first, ctx)
          return "continue"
        case "Dimensions":
          this.askDimension(state.first, "length", ctx)
          return "continue"
        case "Rotation":
          this.askRotation(state.first, ctx)
          return "continue"
        default:
          return "unhandled"
      }
    }
    if (state.phase === "areaBasis" && (id === "Length" || id === "Width")) {
      this.askAreaSide(id === "Length" ? "length" : "width", ctx)
      return "continue"
    }
    if (state.phase === "rotation" && id === "Pick") {
      this.state = {
        phase: "pick",
        first: state.first,
        from: null,
        cursor: state.first,
      }
      this.openPointInput(ctx, "firstPoint")
      return "continue"
    }
    return "unhandled"
  }

  wantsSnap(): boolean {
    const { phase } = this.state
    return phase === "first" || phase === "second" || phase === "pick"
  }

  /**
   * The rotation angle is measured from the first corner; Area's and
   * Dimensions' sides by two points of their own, as the console asks them.
   */
  getConstraintAnchor(): Vec3 | null {
    const state = this.state
    switch (state.phase) {
      case "second":
      case "rotation":
        return state.first
      case "pick":
        return state.from
      default:
        return null
    }
  }

  buildOverlay(ctx: ToolContext): ScenePrimitive[] {
    const state = this.state
    if (state.phase === "pick" && state.from !== null) {
      return [
        {
          kind: "path",
          points: [state.from, state.cursor].map((point) =>
            ctx.viewport.worldToScreen(point)
          ),
          closed: false,
          stroke: { color: THEME.rubberBand, width: 1 },
        },
      ]
    }
    if (state.phase !== "second") return []
    const rectangle = this.toCorner(state.first, state.cursor, ctx, PREVIEW_ID)
    if (rectangle === null) return []
    return entityScenePrimitive(ctx.viewport, rectangle, {
      color: THEME.rubberBand,
      width: 1,
    })
  }

  /**
   * Advances the point phases with a resolved world point, shared by the click
   * path and the typed-coordinate path so both behave identically.
   */
  private advanceWithPoint(point: Vec3, ctx: ToolContext, screen?: Vec2): void {
    const state = this.state
    const at = screen ?? this.lastScreen ?? ctx.viewport.worldToScreen(point)
    switch (state.phase) {
      case "first":
        this.askCorner(point, ctx, at)
        return
      case "second": {
        const rectangle = this.toCorner(state.first, point, ctx)
        // A rectangle with no area is not made: the corner is asked again.
        if (rectangle !== null) this.commit(rectangle, ctx)
        return
      }
      case "pick":
        if (state.from === null) {
          this.state = { ...state, from: point, cursor: point }
          this.openPointInput(ctx, "secondPoint", at)
          ctx.requestRender()
          return
        }
        this.rotation = headingInUcs(ctx.ucs, V.sub(point, state.from))
        this.askCorner(state.first, ctx, at)
        return
    }
  }

  private askCorner(first: Vec3, ctx: ToolContext, screen?: Vec2): void {
    this.state = { phase: "second", first, cursor: first }
    this.openPointInput(ctx, "otherCorner", screen)
    ctx.requestRender()
  }

  private modeQuestion(mode: Mode): { id: PromptId; enter: number } {
    const { first, second } = this.corners
    switch (mode) {
      case "elevation":
        return { id: "rectangleElevation", enter: this.elevation }
      case "thickness":
        return { id: "rectangleThickness", enter: this.thickness }
      case "chamferFirst":
        return { id: "rectangleFirstChamfer", enter: first }
      case "chamferSecond":
        return {
          id: "rectangleSecondChamfer",
          enter: secondDefault(second, first),
        }
      case "fillet":
        return { id: "rectangleFillet", enter: first }
      case "width":
        return { id: "rectangleLineWidth", enter: this.lineWidth }
    }
  }

  /**
   * A value of the first prompt's options, offering the current one. Negative
   * values are taken, as AutoCAD takes them: a negative fillet turns the
   * corners' arcs inside out, and a negative width is listed as typed and
   * drawn as none (acc/w6).
   */
  private askMode(mode: Mode, ctx: ToolContext): void {
    this.state = { phase: "mode", mode }
    const { id, enter } = this.modeQuestion(mode)
    this.askValue(id, "distance", enter, ctx, (value, commitCtx) =>
      this.setMode(mode, value, commitCtx)
    )
  }

  private setMode(mode: Mode, value: number, ctx: ToolContext): void {
    const corners = this.corners
    switch (mode) {
      case "elevation":
        this.elevation = value
        break
      case "thickness":
        this.thickness = value
        break
      case "width":
        this.lineWidth = value
        break
      case "chamferFirst":
        this.corners = { ...corners, first: value }
        this.askMode("chamferSecond", ctx)
        return
      case "chamferSecond":
        this.corners = {
          kind: corners.first !== 0 || value !== 0 ? "chamfer" : null,
          first: corners.first,
          second: value,
        }
        break
      case "fillet":
        // WHY both: the next Chamfer offers the radius as each distance
        // (acc/r3), the first being the very same value.
        this.corners = {
          kind: value !== 0 ? "fillet" : null,
          first: value,
          second: value,
        }
        break
    }
    this.state = { phase: "first" }
    this.openPointInput(ctx, "firstCorner")
    ctx.requestRender()
  }

  private askArea(first: Vec3, ctx: ToolContext): void {
    this.state = { phase: "area", first }
    this.askValue(
      "rectangleArea",
      "number",
      this.area,
      ctx,
      (value, commitCtx) => {
        if (!(value > 0)) {
          commitCtx.report(commitCtx.text.message("positiveNonzero"), "error")
          return
        }
        this.area = value
        this.state = { phase: "areaBasis", first }
        commitCtx.dynamicInput.open({ fields: [], commit: () => {} })
        commitCtx.dynamicInput.setPosition(this.lastScreen ?? { x: 0, y: 0 })
        commitCtx.requestRender()
      }
    )
  }

  private askAreaSide(side: Side, ctx: ToolContext): void {
    if (this.state.phase !== "areaBasis") return
    const { first } = this.state
    this.state = { phase: "areaSide", first, side }
    const prompt = side === "length" ? "rectangleLength" : "rectangleWidth"
    this.askValue(prompt, "distance", this[side], ctx, (value, commitCtx) => {
      this[side] = value
      const other = side === "length" ? "width" : "length"
      this[other] = this.otherSide(Math.abs(value))
      const rectangle = this.toSize(first, this.length, this.width, commitCtx)
      // WHY nothing drawn: a length of 0 makes AutoCAD's console a polyline
      // of no size at the origin (acc/r6).
      if (rectangle !== null) this.commit(rectangle, commitCtx)
      else commitCtx.endCommand()
    })
  }

  /**
   * The side that gives the area with `given`, "If the Chamfer or Fillet
   * option is active, the area includes the effect of the chamfers or
   * fillets on the corners of the rectangle" — when they fit on it; when
   * they do not, the rectangle is plain, and so its area (acc/r9).
   */
  private otherSide(given: number): number {
    if (given === 0) return 0
    const { kind, first, second } = this.corners
    const loss =
      kind === "chamfer"
        ? 2 * first * second
        : kind === "fillet"
          ? (4 - Math.PI) * first * Math.abs(first)
          : 0
    const other = (this.area + loss) / given
    return cornersFit(this.corners, given, other) ? other : this.area / given
  }

  private askDimension(first: Vec3, side: Side, ctx: ToolContext): void {
    this.state = { phase: "dimension", first, side }
    const prompt =
      side === "length" ? "rectangleDimensionLength" : "rectangleDimensionWidth"
    this.askValue(prompt, "distance", this[side], ctx, (value, commitCtx) => {
      this[side] = value
      if (side === "length") {
        this.askDimension(first, "width", commitCtx)
        return
      }
      this.sized = true
      this.askCorner(first, commitCtx)
    })
  }

  private askRotation(first: Vec3, ctx: ToolContext): void {
    this.state = { phase: "rotation", first }
    this.askValue(
      "rectangleRotation",
      "angle",
      this.rotation,
      ctx,
      (value, commitCtx) => {
        this.rotation = normalizeDegrees(value)
        this.askCorner(first, commitCtx)
      }
    )
  }

  /** A box for one value, `<default>` the current one. */
  private askValue(
    prompt: PromptId,
    kind: "distance" | "number" | "angle",
    value: number,
    ctx: ToolContext,
    take: (value: number, ctx: ToolContext) => void
  ): void {
    ctx.dynamicInput.open({
      fields: [{ id: "value", prompt, kind }],
      commit: (values, commitCtx) => {
        if (Number.isFinite(values.value)) take(values.value, commitCtx)
      },
    })
    ctx.dynamicInput.setDefault("value", value)
    ctx.dynamicInput.setPosition(this.lastScreen ?? { x: 0, y: 0 })
    ctx.requestRender()
  }

  /**
   * The rectangle the other corner makes: the two corners' own, or, once
   * Dimensions is given, its length and width in the quadrant the corner
   * lies in. WHY that quadrant is read along the UCS, not the turned sides:
   * AutoCAD's console does so (acc/r8: turned 45°, a corner at -10,50 from
   * the first lays the length towards -X'), so it is kept.
   */
  private toCorner(
    first: Vec3,
    other: Vec2,
    ctx: ToolContext,
    id?: string
  ): PolylineEntity | null {
    const from = worldPointToUcs(ctx.ucs, first)
    const to = worldPointToUcs(ctx.ucs, other)
    const d = { x: to.x - from.x, y: to.y - from.y }
    if (this.sized) {
      return this.toSize(
        first,
        (d.x < 0 ? -1 : 1) * Math.abs(this.length),
        (d.y < 0 ? -1 : 1) * Math.abs(this.width),
        ctx,
        id
      )
    }
    const { u, v } = sides(this.rotation)
    return this.toSize(first, V.dot(d, u), V.dot(d, v), ctx, id)
  }

  /**
   * The rectangle from the first corner `length` along the turned X axis and
   * `width` along its Y, either negative backwards; null when it has no area.
   */
  private toSize(
    first: Vec3,
    length: number,
    width: number,
    ctx: ToolContext,
    id?: string
  ): PolylineEntity | null {
    if (Math.abs(length) < 1e-9 || Math.abs(width) < 1e-9) return null
    const origin = worldPointToUcs(ctx.ucs, first)
    const { u, v } = sides(this.rotation)
    const along = V.scale(u, length)
    const across = V.scale(v, width)
    const corners = [
      origin,
      V.add(origin, along),
      V.add(V.add(origin, along), across),
      V.add(origin, across),
    ]
    const { vertices, bulges } = cutCorners(
      corners,
      this.corners,
      Math.abs(length),
      Math.abs(width),
      length * width > 0
    )
    const lineWidth = Math.max(0, this.lineWidth)
    const rectangle = createPolyline(
      vertices.map((point) => ucsPointToWorld(ctx.ucs, point)),
      true,
      ctx.document.getCurrentLayerId(),
      bulges,
      id,
      vertices.map(() => [lineWidth, lineWidth])
    )
    // An Elevation set here puts the rectangle that far above the UCS's XY
    // plane whatever the corners' Z; at 0 the first corner fixes its plane,
    // as for any flat object.
    const placed =
      this.elevation !== 0
        ? withElevation(rectangle, ctx.ucs.origin.z + this.elevation)
        : onPlaneOf(rectangle, first)
    return withThickness(placed, this.thickness)
  }

  private commit(rectangle: PolylineEntity, ctx: ToolContext): void {
    ctx.execute(new AddEntityCommand(withCurrentProperties(rectangle, ctx)))
    ctx.endCommand()
  }

  /** `Current rectangle modes:` when any is set, in AutoCAD's order. */
  private reportModes(ctx: ToolContext): void {
    const { kind, first, second } = this.corners
    if (
      kind === null &&
      this.elevation === 0 &&
      this.thickness === 0 &&
      this.lineWidth === 0 &&
      this.rotation === 0
    ) {
      return
    }
    const settings = ctx.document.getSettings()
    ctx.report(
      ctx.text.message("rectangleModes", {
        corners: kind ?? "none",
        first: formatLength(first, settings),
        second: formatLength(second, settings),
        hasElevation: this.elevation !== 0 ? "yes" : "no",
        elevation: formatLength(this.elevation, settings),
        hasThickness: this.thickness !== 0 ? "yes" : "no",
        thickness: formatLength(this.thickness, settings),
        hasWidth: this.lineWidth !== 0 ? "yes" : "no",
        width: formatLength(this.lineWidth, settings),
        hasRotation: this.rotation !== 0 ? "yes" : "no",
        rotation: formatAngle(this.rotation, settings),
      })
    )
  }

  private openPointInput(
    ctx: ToolContext,
    prompt: PromptId,
    screen?: Vec2
  ): void {
    const session: DynamicInputSession = {
      fields: [{ id: "point", prompt, kind: "coordinate" }],
      commit: () => {},
      commitRaw: (commitCtx) => this.commitTypedPoint(commitCtx),
    }
    ctx.dynamicInput.open(session)
    ctx.dynamicInput.setPosition(screen ?? this.lastScreen ?? { x: 0, y: 0 })
  }

  /** Places a corner from a typed coordinate (e.g. `50,20` or `@100,50`). */
  private commitTypedPoint(ctx: ToolContext): boolean {
    const text = ctx.dynamicInput.getText("point").trim()
    if (text === "") {
      // The corners take no Enter: AutoCAD asks again (acc/r2, r3). WHY
      // Pick points' too: the console takes its own cursor there (acc/r10),
      // which has no counterpart here.
      const refusal =
        this.state.phase === "pick" ? "invalidPoint" : "pointOrKeywordRequired"
      ctx.report(ctx.text.message(refusal), "error")
      return true
    }
    if (!isCoordinateExpression(text)) return false
    const base = this.getConstraintAnchor()
    const point = parseCoordinate(text, {
      lastPoint: base ?? ctx.lastPoint,
      relativeByDefault: base !== null,
      ucs: ctx.ucs,
      elevation: ctx.elevation,
    })
    if (!point) return false
    this.advanceWithPoint(point, ctx)
    return true
  }
}

const FIRST_PROMPT_MODES: Readonly<Record<string, Mode>> = {
  Chamfer: "chamferFirst",
  Elevation: "elevation",
  Fillet: "fillet",
  Thickness: "thickness",
  Width: "width",
}

/**
 * The second chamfer distance's `<default>`: the last one, or with none the
 * first just given (acc/r1, r3, r5).
 */
function secondDefault(second: number, first: number): number {
  return second !== 0 ? second : first
}

/** The rectangle's sides turned by `rotation` degrees from the UCS X axis. */
function sides(rotation: number): { u: Vec2; v: Vec2 } {
  const radians = (rotation * Math.PI) / 180
  const u = { x: Math.cos(radians), y: Math.sin(radians) }
  return { u, v: { x: -u.y, y: u.x } }
}

/**
 * Whether the corners fit on sides `length` by `width`: each side carries a
 * corner's second distance at its start and the next's first at its end.
 */
function cornersFit(corners: Corners, length: number, width: number): boolean {
  const needs = corners.first + corners.second
  return needs <= length + 1e-9 && needs <= width + 1e-9
}

/**
 * The polyline round four corners, Chamfer's or Fillet's cut at each — the
 * first distance back along the side that reaches it, the second along the
 * side that leaves it —, starting where the first corner's cut begins.
 * AutoCAD keeps the eight vertices when the cuts do not fit, every corner
 * then plain and doubled (acc/r4).
 */
function cutCorners(
  corners: readonly Vec2[],
  cut: Corners,
  length: number,
  width: number,
  counterClockwise: boolean
): { vertices: Vec2[]; bulges: number[] | undefined } {
  if (cut.kind === null) return { vertices: [...corners], bulges: undefined }
  const fits = cornersFit(cut, length, width)
  const vertices: Vec2[] = []
  const bulges: number[] = []
  const arc =
    cut.kind === "fillet" && fits
      ? bulgeOfAngle(counterClockwise ? Math.PI / 2 : -Math.PI / 2)
      : 0
  corners.forEach((corner, i) => {
    const before = corners[(i + 3) % 4]
    const after = corners[(i + 1) % 4]
    const back = fits ? cut.first : 0
    const on = fits ? cut.second : 0
    vertices.push(
      V.add(corner, V.scale(V.normalize(V.sub(before, corner)), back)),
      V.add(corner, V.scale(V.normalize(V.sub(after, corner)), on))
    )
    bulges.push(arc, 0)
  })
  return { vertices, bulges }
}
