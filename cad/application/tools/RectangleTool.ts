import { Vec2, V } from "../../geometry/Vec2"
import { Vec3, withZOf } from "../../geometry/Vec3"
import { bulgeOfAngle } from "../../geometry/bulgeArcs"
import { normalizeDegrees } from "../../geometry/primitives"
import {
  createPolyline,
  onPlaneOf,
  withElevation,
  withThickness,
} from "../../domain/entities"
import type { PolylineEntity } from "../../domain/entities"
import { formatAngle, formatLength, parseNumber } from "../../domain/units"
import { ucsPointToWorld, worldPointToUcs } from "../../domain/ucs"
import { AddEntityCommand } from "../commands/entityCommands"
import { DynamicInputSession } from "../input/DynamicInput"
import type { PromptId } from "../../locales/types"
import {
  isCoordinateExpression,
  parseCoordinate,
} from "../input/coordinateInput"
import { ScenePrimitive } from "../../scene/types"
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
import {
  type CurrentProperties,
  currentColor,
  currentProperties,
  withProperties,
} from "./currentProperties"
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
 * AutoCAD's RECTANG, as AutoCAD 2027's console answers it (probes
 * rectang/p01–p192): two opposite corners define a rectangle along the UCS
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
  | { readonly phase: "second"; readonly first: Vec3; readonly cursor: Vec3 }
  /** Area: the area, the side it is calculated from, and that side. */
  | { readonly phase: "area"; readonly first: Vec3 }
  | { readonly phase: "areaBasis"; readonly first: Vec3 }
  | { readonly phase: "areaSide"; readonly first: Vec3; readonly side: Side }
  /** Dimensions: its length, then its width. */
  | { readonly phase: "dimension"; readonly first: Vec3; readonly side: Side }
  /** Rotation's angle, or its Pick points' two points (`from` the first). */
  | { readonly phase: "rotation"; readonly first: Vec3 }
  | { readonly phase: "pick"; readonly first: Vec3; readonly from: Vec3 | null }

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
  /** Where the pointer last stood, which Enter at Pick points takes. */
  private pointer: Vec3 | null = null
  /**
   * The layer and properties current at the first corner, which the
   * rectangle wears: one set later, at the other corner, does not reach it
   * (p169, p146; p171, p147 at the first).
   */
  private properties: CurrentProperties | null = null
  /**
   * The options' values, kept "until you enter a different value" for the
   * session: Elevation and Thickness (instead of ELEVATION and THICKNESS),
   * the corners, Rotation, and the area and sides Area and Dimensions offer.
   */
  private elevation = 0
  private thickness = 0
  private corners: Corners = { kind: null, first: 0, second: 0 }
  /** Width's line width, negative as typed (p109), drawn as none. */
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
    this.properties = null
    this.reportModes(ctx)
    this.openPointInput(ctx, "firstCorner")
  }

  onDeactivate(ctx: ToolContext): void {
    this.state = { phase: "first" }
    ctx.dynamicInput.close()
  }

  onPointerMove(input: PointerInput, ctx: ToolContext): void {
    this.lastScreen = input.screen
    this.pointer = input.point
    if (this.state.phase === "second") {
      this.state = { ...this.state, cursor: input.point }
      if (!this.sized) this.showSides(this.state.first, input.point, ctx)
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

  /**
   * Pick points' two points are bare points (`Invalid point.`); the other
   * corner a point whatever its box holds, the sides' two distances.
   */
  takes(): QuestionInput | null {
    const { phase } = this.state
    return phase === "pick" || phase === "second" ? "point" : null
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
          // The other corner is a corner again: Rotation drops the
          // Dimensions given before it (p177).
          this.sized = false
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
      this.state = { phase: "pick", first: state.first, from: null }
      this.openPointInput(ctx, "firstPoint")
      return "continue"
    }
    return "unhandled"
  }

  wantsSnap(): boolean {
    const { phase } = this.state
    return phase === "first" || phase === "second" || phase === "pick"
  }

  /** `_TAN` or `_PER` at the first corner measures from LASTPOINT (p05, p06). */
  snapsFromLastPoint(): boolean {
    return this.state.phase === "first"
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

  /**
   * The rectangle in the colour it will wear and no line from the first
   * corner; nothing at Pick points' second point (desktop d01, d04).
   */
  buildOverlay(ctx: ToolContext): ScenePrimitive[] {
    const state = this.state
    if (state.phase !== "second") return []
    const rectangle = this.toCorner(state.first, state.cursor, ctx, PREVIEW_ID)
    return entityScenePrimitive(ctx.viewport, rectangle, {
      color: currentColor(ctx, this.properties ?? undefined),
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
        this.properties = currentProperties(ctx)
        this.askCorner(point, ctx, at)
        return
      case "second":
        // One of no area too, as AutoCAD makes it (p11, p164; Ortho's, d01).
        this.commit(this.toCorner(state.first, point, ctx), ctx)
        return
      case "pick":
        if (state.from === null) {
          this.state = { ...state, from: point }
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
    if (this.sized) this.openPointInput(ctx, "otherCorner", screen)
    else this.openSidesInput(ctx, screen)
    ctx.requestRender()
  }

  /**
   * The other corner's box: the sides' length and width along the turned
   * sides, as the desktop shows them (d05), their signs the cursor's
   * quadrant; a coordinate typed in it is the corner, relative to the first.
   * The command line still answers the corner (`commandLinePoint`).
   */
  private openSidesInput(ctx: ToolContext, screen?: Vec2): void {
    ctx.dynamicInput.open({
      fields: [
        { id: "length", prompt: "length", kind: "distance" },
        { id: "width", prompt: "width", kind: "distance" },
      ],
      commit: (values, commitCtx) =>
        this.takeSides(values.length, values.width, commitCtx),
      commitRaw: (commitCtx) => this.commitTypedPoint(commitCtx),
      commandLinePoint: true,
    })
    ctx.dynamicInput.setLive("length", 0)
    ctx.dynamicInput.setLive("width", 0)
    ctx.dynamicInput.setPosition(screen ?? this.lastScreen ?? { x: 0, y: 0 })
  }

  /** The cursor's offset from `first` along the turned sides, in the UCS. */
  private sidesTo(first: Vec3, cursor: Vec2, ctx: ToolContext): Vec2 {
    const from = worldPointToUcs(ctx.ucs, first)
    const to = worldPointToUcs(ctx.ucs, cursor)
    const d = { x: to.x - from.x, y: to.y - from.y }
    const { u, v } = sides(this.rotation)
    return { x: V.dot(d, u), y: V.dot(d, v) }
  }

  private showSides(first: Vec3, cursor: Vec2, ctx: ToolContext): void {
    const { x, y } = this.sidesTo(first, cursor, ctx)
    ctx.dynamicInput.setLive("length", Math.abs(x))
    ctx.dynamicInput.setLive("width", Math.abs(y))
  }

  /**
   * The box's length and width, laid in the cursor's quadrant. LASTPOINT is
   * the corner they give, as a coordinate typed there leaves it (d05).
   */
  private takeSides(length: number, width: number, ctx: ToolContext): void {
    if (this.state.phase !== "second") return
    const { first, cursor } = this.state
    const reading = this.sidesTo(first, cursor, ctx)
    const along = sign(reading.x) * length
    const across = sign(reading.y) * width
    const { u, v } = sides(this.rotation)
    const corner = V.add(
      worldPointToUcs(ctx.ucs, first),
      V.add(V.scale(u, along), V.scale(v, across))
    )
    ctx.setLastPoint(withZOf(ucsPointToWorld(ctx.ucs, corner), first))
    this.commit(this.toSize(first, along, across, ctx), ctx)
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
   * A value of the first prompt's options, offering the current one. The
   * chamfers and the fillet refuse a negative one (p107, p108); the others
   * take it, a negative width listed as typed and drawn as none (p109).
   */
  private askMode(mode: Mode, ctx: ToolContext): void {
    this.state = { phase: "mode", mode }
    const { id, enter } = this.modeQuestion(mode)
    this.askValue(id, "distance", enter, ctx, (value, commitCtx) => {
      if (value < 0 && CUTS.has(mode)) {
        commitCtx.report(commitCtx.text.message("valueMustBePositive"), "error")
        return
      }
      this.setMode(mode, value, commitCtx)
    })
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
        // (p172), the first being the very same value.
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
          // WHY its own id: Spanish words it «distinto de cero» here, where
          // CIRCLE's and LINE's say «diferente» (p112 es-ES).
          commitCtx.report(
            commitCtx.text.message("areaPositiveNonzero"),
            "error"
          )
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
      // WHY nothing drawn: of a side of 0 AutoCAD 2027 makes a polyline whose
      // vertices but the first are NaN (p114), no object to keep.
      if (value === 0) {
        commitCtx.endCommand()
        return
      }
      const other = side === "length" ? "width" : "length"
      this[other] = this.otherSide(value)
      const rectangle = this.toSize(first, this.length, this.width, commitCtx)
      this.commit(rectangle, commitCtx)
    })
  }

  /**
   * The side that gives the area with `given`, "If the Chamfer or Fillet
   * option is active, the area includes the effect of the chamfers or
   * fillets on the corners of the rectangle" — when they fit on it; when
   * they do not, the rectangle is plain, and so its area (p153). Its sign is
   * the given side's: a negative one turns both (p159).
   */
  private otherSide(given: number): number {
    const { kind, first, second } = this.corners
    const loss =
      kind === "chamfer"
        ? 2 * first * second
        : kind === "fillet"
          ? (4 - Math.PI) * first * first
          : 0
    const other = (this.area + loss) / given
    return cornersFit(this.corners, Math.abs(given), Math.abs(other))
      ? other
      : this.area / given
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
   * The rectangle the other corner makes: the two corners' own, a side
   * typed in the box locked to its value, or, once Dimensions is given, its
   * length and width in the quadrant the corner lies in. WHY that quadrant
   * is read along the UCS, not the turned sides: AutoCAD's console does so
   * (p155: turned 45°, a corner at -10,50 from the first lays the length
   * towards -X'), so it is kept.
   */
  private toCorner(
    first: Vec3,
    other: Vec2,
    ctx: ToolContext,
    id?: string
  ): PolylineEntity {
    if (this.sized) {
      const from = worldPointToUcs(ctx.ucs, first)
      const to = worldPointToUcs(ctx.ucs, other)
      return this.toSize(
        first,
        sign(to.x - from.x) * Math.abs(this.length),
        sign(to.y - from.y) * Math.abs(this.width),
        ctx,
        id
      )
    }
    const { x, y } = this.sidesTo(first, other, ctx)
    const length = typedSide(ctx, "length")
    const width = typedSide(ctx, "width")
    return this.toSize(
      first,
      length === null ? x : sign(x) * length,
      width === null ? y : sign(y) * width,
      ctx,
      id
    )
  }

  /**
   * The rectangle from the first corner `length` along the turned X axis and
   * `width` along its Y, either negative backwards.
   */
  private toSize(
    first: Vec3,
    length: number,
    width: number,
    ctx: ToolContext,
    id?: string
  ): PolylineEntity {
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
      this.properties?.layerId ?? ctx.document.getCurrentLayerId(),
      bulges,
      id,
      vertices.map(() => [lineWidth, lineWidth])
    )
    // An Elevation set here is the polyline's own, as typed, whatever the
    // corners' Z and the UCS's origin (p145, p178); at 0 the first corner
    // fixes its plane, as for any flat object (p122, p142).
    const placed =
      this.elevation !== 0
        ? withElevation(rectangle, this.elevation)
        : onPlaneOf(rectangle, first)
    return withThickness(placed, this.thickness)
  }

  private commit(rectangle: PolylineEntity, ctx: ToolContext): void {
    const properties = this.properties ?? currentProperties(ctx)
    ctx.execute(
      new AddEntityCommand(
        withProperties(rectangle, { ...properties, thickness: this.thickness })
      )
    )
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
    const field = ctx.dynamicInput.getActiveFieldId()
    const text = field === null ? "" : ctx.dynamicInput.getText(field).trim()
    if (!ctx.dynamicInput.hasTypedText()) {
      // Enter at Pick points' points takes the cursor (p118, p119); the
      // corners take none, AutoCAD asks again (p04).
      if (this.state.phase === "pick") {
        this.advanceWithPoint(this.pointer ?? this.state.first, ctx)
      } else {
        ctx.report(ctx.text.message("pointOrKeywordRequired"), "error")
      }
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

/** The options whose value cuts the corners, which refuse a negative one. */
const CUTS: ReadonlySet<Mode> = new Set<Mode>([
  "chamferFirst",
  "chamferSecond",
  "fillet",
])

/**
 * The second chamfer distance's `<default>`: the last one, or with none the
 * first just given (p158, p02).
 */
function secondDefault(second: number, first: number): number {
  return second !== 0 ? second : first
}

/** -1 for a negative reading, else 1: a side of 0 lies forwards. */
function sign(value: number): number {
  return value < 0 ? -1 : 1
}

/** A side typed in the other corner's box, which locks it; null if none. */
function typedSide(ctx: ToolContext, field: "length" | "width"): number | null {
  const text = ctx.dynamicInput.getText(field).trim()
  if (text === "" || isCoordinateExpression(text)) return null
  const value = parseNumber(text)
  return value !== null && Number.isFinite(value) ? value : null
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
 * then plain and doubled (p157; of no area, p12).
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
