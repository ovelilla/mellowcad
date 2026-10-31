import { V, Vec2 } from "../../geometry/Vec2"
import { Vec3, length3, sub3 } from "../../geometry/Vec3"
import { BoxPrimitive, createBox, createPolyline } from "../../domain/entities"
import {
  ucsDirectionToWorld,
  ucsPointToWorld,
  worldPointToUcs,
} from "../../domain/ucs"
import { AddEntityCommand } from "../commands/entityCommands"
import {
  isCoordinateExpression,
  parseCoordinate,
} from "../input/coordinateInput"
import { ScenePrimitive } from "../../scene/types"
import { entityScenePrimitive } from "../SceneBuilder"
import type { PromptId } from "../../locales/types"
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
import { currentColor, withCurrentProperties } from "./currentProperties"

/**
 * Where the box's footprint lies, in the UCS: its centre, the way its length
 * runs, its sides, and the Z it rises from — a corner's, or the centre's when
 * the box is centred on it in height too.
 */
interface Footprint {
  readonly center: Vec2
  readonly along: Vec2
  readonly length: number
  readonly width: number
  readonly z: number
  readonly centered: boolean
}

type Mode = "corner" | "center"

type BoxToolState =
  | { readonly phase: "first" }
  | { readonly phase: "center" }
  /** The other corner, or the corner from the centre, and Cube's and Length's length. */
  | {
      readonly phase: "other" | "cube" | "length"
      readonly mode: Mode
      readonly base: Vec3
      readonly cursor: Vec3
    }
  | {
      readonly phase: "width"
      readonly mode: Mode
      readonly base: Vec3
      readonly along: Vec2
      readonly length: number
      readonly cursor: Vec3
    }
  | {
      readonly phase: "height" | "twoFirst"
      readonly footprint: Footprint
      readonly from: Vec3
      readonly cursor: Vec3
    }
  | {
      readonly phase: "twoSecond"
      readonly footprint: Footprint
      readonly from: Vec3
      readonly first: Vec3
      readonly cursor: Vec3
    }

const PREVIEW_ID = "box-preview"
const UCS_X: Vec2 = { x: 1, y: 0 }

/**
 * AutoCAD's BOX, as 2027's console asks it (solid/p01–p13): `Specify first
 * corner or [Center]:`, then `Specify other corner or [Cube/Length]:` and
 * `Specify height or [2Point]:`. Center asks `Specify center:` and `Specify
 * corner or [Cube/Length]:`, the box then centred on it in height too. Cube
 * asks one length, Length a length and a width, both turned towards the
 * cursor, or the point given (p03); a negative length turns it back (p10). A
 * corner at another Z sets the height without asking it (p06, p13). The
 * height rises along the UCS's Z, down when negative; a point gives its
 * distance (p06, p10). A length, a width and a height are offered again by
 * the next box of the drawing (p02–p04).
 */
export class BoxTool implements Tool {
  readonly id = "box"

  private state: BoxToolState = { phase: "first" }
  private lastScreen: Vec2 | null = null
  private lastLength: number | null = null
  private lastWidth: number | null = null
  private lastHeight: number | null = null

  onActivate(ctx: ToolContext): void {
    ctx.setCursor("crosshair")
    ctx.selection.clear()
    this.state = { phase: "first" }
    this.openPoint(ctx, "boxFirstCornerOr")
  }

  onDeactivate(ctx: ToolContext): void {
    this.state = { phase: "first" }
    ctx.dynamicInput.close()
  }

  /** Per drawing, unsaved, as CIRCLERAD is (**unverified**: no OPEN probe). */
  onNewDrawing(): void {
    this.lastLength = null
    this.lastWidth = null
    this.lastHeight = null
  }

  onPointerMove(input: PointerInput, ctx: ToolContext): void {
    this.lastScreen = input.screen
    if (this.state.phase !== "first" && this.state.phase !== "center") {
      this.state = { ...this.state, cursor: input.point }
    }
    ctx.dynamicInput.setPosition(input.screen)
    ctx.requestRender()
  }

  onPointerDown(input: PointerInput, ctx: ToolContext): void {
    if (input.button !== 0) return
    const state = this.state
    // The other corner is dragged in the first's plane; a snap keeps its own Z.
    this.takePoint(
      state.phase === "other" && !input.snap
        ? { ...input.point, z: state.base.z }
        : input.point,
      ctx
    )
  }

  onKeyDown(input: KeyInput, ctx: ToolContext): void {
    if (input.key === "Escape") {
      this.state = { phase: "first" }
      ctx.dynamicInput.close()
      ctx.requestRender()
    }
  }

  question(): PromptId | ToolQuestion {
    const state = this.state
    switch (state.phase) {
      case "first":
        return "boxFirstCornerOr"
      case "center":
        return "boxCenter"
      case "other":
        return state.mode === "center" ? "boxCornerOr" : "boxOtherCornerOr"
      case "cube":
      case "length":
        return this.lastLength === null
          ? "boxLength"
          : { id: "boxLength", enter: this.lastLength }
      case "width":
        return this.lastWidth === null
          ? "boxWidth"
          : { id: "boxWidth", enter: this.lastWidth }
      case "height":
        return this.lastHeight === null
          ? "boxHeightOr"
          : { id: "boxHeightOr", enter: this.lastHeight }
      case "twoFirst":
        return "specifyFirstPoint"
      case "twoSecond":
        return "specifySecondPoint"
    }
  }

  /**
   * Every point prompt says `Point or option keyword required.`, those with
   * no keyword too; every distance `…second point, or option keyword.`, the
   * width's too (p05).
   */
  takes(): QuestionInput | null {
    switch (this.state.phase) {
      case "center":
      case "twoFirst":
      case "twoSecond":
        return { refusal: "pointOrKeywordRequired" }
      case "cube":
      case "length":
      case "width":
      case "height":
        return {
          refusal: "requiresDistance",
          values: { points: "second", keyword: "yes" },
        }
      default:
        return null
    }
  }

  commandOptions(): readonly CommandOption[] {
    switch (this.state.phase) {
      case "first":
        return [{ id: "Center" }]
      case "other":
        return [{ id: "Cube" }, { id: "Length" }]
      case "height":
        return [{ id: "2Point" }]
      default:
        return []
    }
  }

  invokeOption(id: string, ctx: ToolContext): CommandOptionOutcome {
    const state = this.state
    if (state.phase === "first" && id === "Center") {
      this.state = { phase: "center" }
      this.openPoint(ctx, "boxCenter")
      return "continue"
    }
    if (state.phase === "other" && (id === "Cube" || id === "Length")) {
      this.state = { ...state, phase: id === "Cube" ? "cube" : "length" }
      this.openDistance(ctx, this.lastLength)
      return "continue"
    }
    if (state.phase === "height" && id === "2Point") {
      this.state = { ...state, phase: "twoFirst" }
      this.openPoint(ctx, "specifyFirstPoint")
      return "continue"
    }
    return "unhandled"
  }

  wantsSnap(): boolean {
    return true
  }

  getConstraintAnchor(): Vec3 | null {
    const state = this.state
    switch (state.phase) {
      case "other":
      case "cube":
      case "length":
        return state.base
      case "width":
        return this.widthBase(state)
      case "height":
        return state.from
      case "twoSecond":
        return state.first
      default:
        return null
    }
  }

  /** The footprint as the cursor stretches it, then the box as its height does. */
  buildOverlay(ctx: ToolContext): ScenePrimitive[] {
    const state = this.state
    const stroke = { color: currentColor(ctx), width: 1 }
    if (state.phase === "other") {
      const footprint = this.cornerFootprint(
        state.mode,
        state.base,
        state.cursor,
        ctx
      )
      if (!footprint) return []
      const outline = createPolyline(
        footprintCorners(footprint).map((p) =>
          ucsPointToWorld(ctx.ucs, { ...p, z: footprint.z })
        ),
        true,
        ctx.document.getCurrentLayerId(),
        undefined,
        PREVIEW_ID
      )
      return entityScenePrimitive(ctx.viewport, outline, stroke)
    }
    if (state.phase === "height") {
      const height = length3(sub3(state.cursor, state.from))
      if (!(height > 0)) return []
      const box = createBox(
        this.primitive(state.footprint, height, ctx),
        ctx.document.getCurrentLayerId(),
        PREVIEW_ID
      )
      return entityScenePrimitive(ctx.viewport, box, stroke)
    }
    return []
  }

  private takePoint(point: Vec3, ctx: ToolContext): void {
    const state = this.state
    switch (state.phase) {
      case "first":
      case "center":
        this.state = {
          phase: "other",
          mode: state.phase === "first" ? "corner" : "center",
          base: point,
          cursor: point,
        }
        this.openPoint(
          ctx,
          state.phase === "first" ? "boxOtherCornerOr" : "boxCornerOr"
        )
        return
      case "other":
        this.takeCorner(point, ctx)
        return
      case "cube":
      case "length":
        this.takeLength(this.distanceTo(state.base, point), point, ctx)
        return
      case "width":
        this.takeWidth(
          this.distanceTo(this.widthBase(state), point),
          point,
          ctx
        )
        return
      case "height":
        this.takeHeight(this.distanceTo(state.from, point), ctx)
        return
      case "twoFirst":
        this.state = { ...state, phase: "twoSecond", first: point }
        this.openPoint(ctx, "specifySecondPoint")
        return
      case "twoSecond": {
        const height = this.distanceTo(state.first, point)
        if (height === 0) {
          // Asked again at the second point (p12).
          ctx.report(ctx.text.message("boxValueNonzero"), "error")
          return
        }
        this.commit(state.footprint, height, ctx)
        return
      }
    }
  }

  private distanceTo(from: Vec3, to: Vec3): number {
    return length3(sub3(to, from))
  }

  /**
   * The other corner: a footprint on the UCS's axes, refused with no length
   * or width (p06); one at another Z than the first gives the height too.
   */
  private takeCorner(point: Vec3, ctx: ToolContext): void {
    if (this.state.phase !== "other") return
    const { mode, base } = this.state
    const from = worldPointToUcs(ctx.ucs, base)
    const to = worldPointToUcs(ctx.ucs, point)
    if (Math.abs(to.x - from.x) === 0) {
      ctx.report(ctx.text.message("boxZeroLength"), "error")
      return
    }
    if (Math.abs(to.y - from.y) === 0) {
      ctx.report(ctx.text.message("boxZeroWidth"), "error")
      return
    }
    const footprint = this.cornerFootprint(mode, base, point, ctx)
    if (!footprint) return
    const rise = to.z - from.z
    if (rise !== 0) {
      this.commit(footprint, mode === "center" ? 2 * rise : rise, ctx)
      return
    }
    this.askHeight(footprint, point, ctx)
  }

  private cornerFootprint(
    mode: Mode,
    base: Vec3,
    corner: Vec3,
    ctx: ToolContext
  ): Footprint | null {
    const from = worldPointToUcs(ctx.ucs, base)
    const to = worldPointToUcs(ctx.ucs, corner)
    const dx = Math.abs(to.x - from.x)
    const dy = Math.abs(to.y - from.y)
    if (dx === 0 || dy === 0) return null
    const centered = mode === "center"
    return {
      center: centered ? from : V.lerp(from, to, 0.5),
      along: UCS_X,
      length: centered ? 2 * dx : dx,
      width: centered ? 2 * dy : dy,
      z: from.z,
      centered,
    }
  }

  /**
   * Cube's or Length's length: typed, along the cursor, backwards when
   * negative (p10); a point, its distance, towards it (p03).
   */
  private takeLength(length: number, toward: Vec3, ctx: ToolContext): void {
    const state = this.state
    if (state.phase !== "cube" && state.phase !== "length") return
    if (length === 0) {
      ctx.report(ctx.text.message("boxZeroLength"), "error")
      return
    }
    const base = worldPointToUcs(ctx.ucs, state.base)
    const aim = worldPointToUcs(ctx.ucs, toward)
    const heading = V.sub(aim, base)
    const along0 = V.length(heading) > 0 ? V.normalize(heading) : UCS_X
    const along = length < 0 ? V.scale(along0, -1) : along0
    const size = Math.abs(length)
    this.lastLength = length
    if (state.phase === "length") {
      this.state = {
        phase: "width",
        mode: state.mode,
        base: state.base,
        along,
        length: size,
        cursor: state.cursor,
      }
      this.openDistance(ctx, this.lastWidth)
      return
    }
    // A cube's width lies to the left of its length, its height up (p03, p10).
    const centered = state.mode === "center"
    const footprint: Footprint = {
      center: centered
        ? base
        : V.add(base, V.scale(V.add(along, V.perpendicular(along)), size / 2)),
      along,
      length: size,
      width: size,
      z: base.z,
      centered,
    }
    this.commit(footprint, size, ctx)
  }

  /** Where the width is measured from: the length's far end (its prompt's base point, p02). */
  private widthBase(state: Extract<BoxToolState, { phase: "width" }>): Vec3 {
    const reach = state.mode === "center" ? state.length / 2 : state.length
    const end = V.add(state.base, V.scale(state.along, reach))
    return { ...end, z: state.base.z }
  }

  /**
   * Length's width, on the side of the length the cursor or the point is,
   * the right one with the cursor on its line: what a typed length always
   * leaves in the console, whose cursor gave the length its heading (p03,
   * p10). A typed width's sign is not read (p10's -5).
   */
  private takeWidth(width: number, toward: Vec3, ctx: ToolContext): void {
    const state = this.state
    if (state.phase !== "width") return
    if (width === 0) {
      ctx.report(ctx.text.message("boxZeroWidth"), "error")
      return
    }
    this.lastWidth = width
    const size = Math.abs(width)
    const base = worldPointToUcs(ctx.ucs, state.base)
    const aim = worldPointToUcs(ctx.ucs, toward)
    const left = V.cross(state.along, V.sub(aim, base)) > 0
    const side = V.scale(V.perpendicular(state.along), left ? 1 : -1)
    const centered = state.mode === "center"
    const footprint: Footprint = {
      center: centered
        ? base
        : V.add(
            V.add(base, V.scale(state.along, state.length / 2)),
            V.scale(side, size / 2)
          ),
      along: state.along,
      length: state.length,
      width: size,
      z: base.z,
      centered,
    }
    this.askHeight(footprint, this.widthBase(state), ctx)
  }

  private askHeight(footprint: Footprint, from: Vec3, ctx: ToolContext): void {
    this.state = { phase: "height", footprint, from, cursor: from }
    this.openDistance(ctx, this.lastHeight)
    ctx.requestRender()
  }

  /** `Value must be nonzero.` for none, and the prompt asked again (p06). */
  private takeHeight(height: number, ctx: ToolContext): void {
    if (this.state.phase !== "height") return
    if (height === 0) {
      ctx.report(ctx.text.message("boxValueNonzero"), "error")
      return
    }
    this.commit(this.state.footprint, height, ctx)
  }

  private primitive(
    footprint: Footprint,
    height: number,
    ctx: ToolContext
  ): BoxPrimitive {
    const up = Math.sign(height)
    // Centred, its base is half its height back from the centre (p13).
    const z = footprint.centered ? footprint.z - height / 2 : footprint.z
    const toWorld = (d: Vec2 | Vec3) => {
      const w = ucsDirectionToWorld(ctx.ucs, d)
      const n = length3(w)
      return { x: w.x / n, y: w.y / n, z: w.z / n }
    }
    return {
      kind: "box",
      position: ucsPointToWorld(ctx.ucs, { ...footprint.center, z }),
      xAxis: toWorld(footprint.along),
      normal: toWorld({ x: 0, y: 0, z: up }),
      length: footprint.length,
      width: footprint.width,
      height: Math.abs(height),
    }
  }

  private commit(footprint: Footprint, height: number, ctx: ToolContext): void {
    this.lastHeight = height
    const box = createBox(
      this.primitive(footprint, height, ctx),
      ctx.document.getCurrentLayerId()
    )
    this.state = { phase: "first" }
    ctx.execute(new AddEntityCommand(withCurrentProperties(box, ctx)))
    ctx.endCommand()
  }

  private openPoint(ctx: ToolContext, prompt: PromptId): void {
    ctx.dynamicInput.open({
      fields: [{ id: "point", prompt, kind: "coordinate" }],
      commit: () => {},
      commitRaw: (commitCtx) => this.commitTypedPoint(commitCtx),
    })
    ctx.dynamicInput.setPosition(this.lastScreen ?? { x: 0, y: 0 })
    ctx.requestRender()
  }

  /**
   * A distance's box, `<default>` the last one given if any: a number typed
   * is the value, a coordinate a point measured from the prompt's base, and
   * Enter takes the default or is refused as `FOO` is (p04, p11).
   */
  private openDistance(ctx: ToolContext, value: number | null): void {
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
        if (Number.isFinite(values.value))
          this.takeValue(values.value, commitCtx)
      },
      commitRaw: (commitCtx) => {
        if (commitCtx.dynamicInput.hasTypedText()) {
          return this.commitTypedPoint(commitCtx)
        }
        commitCtx.report(
          commitCtx.text.message("requiresDistance", {
            points: "second",
            keyword: "yes",
          }),
          "error"
        )
        return true
      },
    })
    if (value !== null) ctx.dynamicInput.setDefault("value", value)
    ctx.dynamicInput.setPosition(this.lastScreen ?? { x: 0, y: 0 })
    ctx.requestRender()
  }

  /** A typed length, width or height. */
  private takeValue(value: number, ctx: ToolContext): void {
    const state = this.state
    switch (state.phase) {
      case "cube":
      case "length":
        this.takeLength(value, state.cursor, ctx)
        return
      case "width":
        this.takeWidth(value, state.cursor, ctx)
        return
      case "height":
        this.takeHeight(value, ctx)
        return
    }
  }

  /** A coordinate typed at any prompt is the point it names; Enter at a point is refused (p11). */
  private commitTypedPoint(ctx: ToolContext): boolean {
    const field = ctx.dynamicInput.getActiveFieldId()
    const text = field === null ? "" : ctx.dynamicInput.getText(field).trim()
    if (!ctx.dynamicInput.hasTypedText()) {
      ctx.report(ctx.text.message("pointOrKeywordRequired"), "error")
      return true
    }
    if (!isCoordinateExpression(text)) return false
    const base = this.getConstraintAnchor()
    const state = this.state
    const point = parseCoordinate(text, {
      lastPoint: base ?? ctx.lastPoint,
      relativeByDefault: base !== null,
      ucs: ctx.ucs,
      // An other corner with no Z lies at the first's (p07: 50,0,3, then
      // 60,20 still asks the height).
      elevation:
        state.phase === "other"
          ? worldPointToUcs(ctx.ucs, state.base).z
          : ctx.elevation,
    })
    if (!point) return false
    this.takePoint(point, ctx)
    return true
  }
}

/** The footprint's corners in the UCS, round from its first. */
function footprintCorners(footprint: Footprint): Vec2[] {
  const u = V.scale(footprint.along, footprint.length / 2)
  const v = V.scale(V.perpendicular(footprint.along), footprint.width / 2)
  const c = footprint.center
  return [
    V.sub(V.sub(c, u), v),
    V.sub(V.add(c, u), v),
    V.add(V.add(c, u), v),
    V.add(V.sub(c, u), v),
  ]
}
